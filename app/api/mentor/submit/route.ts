import { NextRequest, NextResponse } from "next/server"
import { Client } from "@langchain/langgraph-sdk"

const LANGGRAPH_API_URL =
  process.env.LANGGRAPH_API_URL || "http://localhost:2024"
const ASSISTANT_ID =
  process.env.LANGGRAPH_ASSISTANT_ID || "agent"

const client = new Client({ apiUrl: LANGGRAPH_API_URL })

export async function POST(req: NextRequest) {
  try {
    const {
      threadId,
      code,
      problemDescription,
    } = await req.json()

    if (!threadId || !code) {
      return NextResponse.json(
        { error: "Missing threadId or code" },
        { status: 400 }
      )
    }

    // Ensure thread exists
    await client.threads.create({ threadId, ifExists: "do_nothing" })

    // Submit code for review (non-streaming, returns structured output)
    const stateValues = await client.runs.wait(threadId, ASSISTANT_ID, {
      input: {
        messages: [{ type: "human", content: "Here is my Latest Code Submission" }],
        problem_description: problemDescription,
        current_phase: "CODING",
        code_submission: code,
      },
    }) as Record<string, unknown>

    // Debug: log the full state so we can see the actual shape
    console.log("[submit] stateValues keys:", Object.keys(stateValues ?? {}))
    console.log("[submit] stateValues:", JSON.stringify(stateValues, null, 2))

    const extractString = (value: unknown): string => {
      if (typeof value === "string") return value
      if (Array.isArray(value)) {
        // It might be a list of content blocks
        return value.map((c: unknown) => {
          if (typeof c === "string") return c
          if (typeof c === "object" && c !== null) {
            return (c as Record<string, unknown>).text ?? ""
          }
          return ""
        }).join("")
      }
      if (typeof value === "object" && value !== null) {
        const v = value as Record<string, unknown>
        if (typeof v.content === "string") return v.content
        if (Array.isArray(v.content)) return extractString(v.content)
        if (typeof v.text === "string") return v.text
      }
      return ""
    }

    // Try common top-level state keys first
    let review =
      extractString(stateValues?.review) ||
      extractString(stateValues?.review_text) ||
      extractString(stateValues?.latest_message) ||
      extractString(stateValues?.assistant_reply) ||
      extractString(stateValues?.response) ||
      ""

    // Fallback: grab the last AI message from the messages array
    if (!review) {
      const msgs = stateValues?.messages
      if (Array.isArray(msgs)) {
        const lastAi = [...msgs].reverse().find(
          (m: unknown) => {
            if (typeof m !== "object" || m === null) return false
            const msg = m as Record<string, unknown>
            return msg.type === "ai" || msg.type === "AIMessage" || msg.role === "assistant"
          }
        )
        if (lastAi) review = extractString((lastAi as Record<string, unknown>).content)
      }
    }

    console.log("[submit] extracted review length:", review.length)

    return NextResponse.json({
      success: true,
      review,
      phase: "REVIEW",
      data: stateValues,
    })
  } catch (err) {
    console.error("Mentor submit API error:", err)
    return NextResponse.json(
      { error: "Failed to submit code for review" },
      { status: 500 }
    )
  }
}
