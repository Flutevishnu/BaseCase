import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/require-auth"
import { devError } from "@/lib/logger"
import { USER_MESSAGES } from "@/lib/messages/user-messages"
import { auth } from "@clerk/nextjs/server"

interface RouteParams {
  params: Promise<{ problemId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth()
  if (authResult.unauthorized) {
    return authResult.unauthorized
  }

  try {
    const { problemId } = await params
    let restart = false
    try {
      const body = await request.json()
      restart = Boolean(body?.restart)
    } catch {}

    const { getToken } = await auth();
    const token = await getToken();
    const gatewayUrl = `${process.env.BACKEND_API_URL || "http://localhost:8080/api/v1"}/sessions`;

    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        problemId: problemId,
        restart: restart
      })
    });

    if (!response.ok) {
      throw new Error(`Gateway returned ${response.status}`);
    }

    const json = await response.json();

    return NextResponse.json({ 
      data: { 
        threadId: json.data?.threadId, 
        isNew: json.data?.isNew 
      } 
    })
  } catch (error) {
    devError("[api/problems/:problemId/sessions] POST", error)
    return NextResponse.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: USER_MESSAGES.sessionFailed } },
      { status: 502 }
    )
  }
}
