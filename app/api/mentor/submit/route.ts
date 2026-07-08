import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/require-auth"
import { devError } from "@/lib/logger"
import { USER_MESSAGES } from "@/lib/messages/user-messages"
import { langgraphClient, LANGGRAPH_ASSISTANT_ID } from "@/lib/langgraph/client"

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
    } = await req.json()

    if (!threadId || !code) {
      return NextResponse.json(
        { error: "Missing threadId or code" },
        { status: 400 }
      )
    }

    // Ensure thread exists
    await langgraphClient.threads.create({
      threadId,
      ifExists: "do_nothing",
      metadata: { userId },
    })

    const webhookUrl = `${process.env.BACKEND_API_URL}/api/v1/webhooks/evaluations`

    // Submit code for review (streaming)
    const stream = await langgraphClient.runs.stream(threadId, LANGGRAPH_ASSISTANT_ID, {
      input: {
        messages: [{ type: "human", content: "Here is my Latest Code Submission" }],
        code_submission: code,
      },
      streamMode: "values",
      webhook: webhookUrl,
    });

    let review = {
      correctness: "No feedback provided",
      complexity: "No feedback provided",
      style: "No feedback provided",
      improvement: "No feedback provided",
    };
    let phase = undefined;
    let stateValues: any = {};

    for await (const chunk of stream) {
      const data = chunk.data as any; // Cast to any to bypass TS strict mode
      if (data && data.review) {
        review = data.review;
        stateValues = data;
        phase = data.current_phase;
        break; // Return instantly to the client, let extractor_node run in background
      }
    }

    return NextResponse.json({
      success: true,
      review,
      phase,
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
