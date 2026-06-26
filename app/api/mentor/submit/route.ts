import { NextRequest, NextResponse } from "next/server"
import { Client } from "@langchain/langgraph-sdk"
import { requireAuth } from "@/lib/require-auth"
import { devError } from "@/lib/logger"
import { USER_MESSAGES } from "@/lib/user-messages"

const LANGGRAPH_API_URL =
  process.env.LANGGRAPH_API_URL || "http://localhost:2024"
const ASSISTANT_ID =
  process.env.LANGGRAPH_ASSISTANT_ID || "agent"

const client = new Client({ apiUrl: LANGGRAPH_API_URL })

export async function POST(req: NextRequest) {
  const authResult = await requireAuth()
  if (authResult.unauthorized) {
    return authResult.unauthorized
  }
  const { userId } = authResult

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
    await client.threads.create({
      threadId,
      ifExists: "do_nothing",
      metadata: { userId },
    })

    // Submit code for review (non-streaming, returns structured output)
    const stateValues = await client.runs.wait(threadId, ASSISTANT_ID, {
      input: {
        messages: [{ type: "human", content: "Here is my Latest Code Submission" }],
        problem_description: problemDescription,
        current_phase: "CODING",
        code_submission: code,
      },
    }) as Record<string, unknown>

    const review = stateValues?.review || {
      correctness: "No feedback provided",
      complexity: "No feedback provided",
      style: "No feedback provided",
      improvement: "No feedback provided",
    }

    return NextResponse.json({
      success: true,
      review,
      phase: "REVIEW",
      data: stateValues,
    })
  } catch (err) {
    devError("[submit]", err)
    return NextResponse.json(
      { error: { message: USER_MESSAGES.reviewFailed } },
      { status: 500 }
    )
  }
}
