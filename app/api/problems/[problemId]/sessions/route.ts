import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/require-auth"
import { createOrResumeSession } from "@/lib/api/sessions"
import { langgraphClient } from "@/lib/langgraph/client"
import { devError } from "@/lib/logger"
import { USER_MESSAGES } from "@/lib/messages/user-messages"
interface RouteParams {
  params: Promise<{ problemId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth()
  if (authResult.unauthorized) {
    return authResult.unauthorized
  }
  const { userId } = authResult

  try {
    const { problemId } = await params

    let restart = false
    try {
      const body = await request.json()
      restart = Boolean(body?.restart)
    } catch {

    }

    const { threadId, isNew } = await createOrResumeSession({
      problemId,
      clerkUserId: userId,
      restart,
    })

    return NextResponse.json({ data: { threadId, isNew } })
  } catch (error) {
    devError("[api/problems/:problemId/sessions] POST", error)
    return NextResponse.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: USER_MESSAGES.sessionFailed } },
      { status: 502 }
    )
  }
}
