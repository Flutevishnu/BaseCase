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

    // The state now directly holds the structured JSON review from the LLM
    const review = stateValues?.review || {
      correctness: "No feedback provided",
      complexity: "No feedback provided",
      style: "No feedback provided",
      improvement: "No feedback provided",
    }

    console.log("[submit] extracted structured review:", review)

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
