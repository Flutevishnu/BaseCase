import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/require-auth"
import { devError } from "@/lib/logger"
import { USER_MESSAGES } from "@/lib/messages/user-messages"
import { auth } from "@clerk/nextjs/server"

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


    const baseUrl = process.env.BACKEND_API_URL || "http://localhost:8080";
    const gatewayUrl = `${baseUrl}/api/v1/evaluations/submit`;
    const { getToken } = await auth();
    const token = await getToken();

    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sessionId: threadId,
        code: code
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      devError("[submit] Gateway Error:", errText);
      throw new Error(`Gateway returned ${response.status}: ${errText}`);
    }

    let review = {
      correctness: "No feedback provided",
      complexity: "No feedback provided",
      style: "No feedback provided",
      improvement: "No feedback provided",
    };
    let phase = undefined;
    let stateValues: any = {};

    // Parse the SSE stream to find the final review
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    if (reader) {
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        
        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }
        
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const payload = JSON.parse(line.replace("data: ", ""));
              // LangGraph streamMode="values" emits the full state in the payload
              if (payload) {
                stateValues = payload;
                if (payload.current_phase) phase = payload.current_phase;
                if (payload.review) {
                  review = payload.review;
                } else {
                  review = null as any;
                }
              }
            } catch (e) {
              // Ignore partial JSON parsing errors
            }
          }
        }
        
        if (done) {
          if (buffer.trim().startsWith("data: ")) {
             try {
               const payload = JSON.parse(buffer.trim().replace("data: ", ""));
               if (payload) {
                 stateValues = payload;
                 if (payload.current_phase) phase = payload.current_phase;
                 if (payload.review) {
                   review = payload.review;
                 } else {
                   review = null as any;
                 }
               }
             } catch(e) {}
          }
          break;
        }
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
