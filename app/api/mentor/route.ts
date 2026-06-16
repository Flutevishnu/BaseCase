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
      input,
    } = await req.json()

    if (!threadId) {
      return NextResponse.json(
        { error: "Missing threadId" },
        { status: 400 }
      )
    }

    // Ensure thread exists
    await client.threads.create({ threadId, ifExists: "do_nothing" })

    // Invoke the agent (non-streaming)
    const response = await client.runs.create(threadId, ASSISTANT_ID, {
      input,
    })

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (err) {
    console.error("Mentor API error:", err)
    return NextResponse.json(
      { error: "Failed to reach mentor" },
      { status: 500 }
    )
  }
}
