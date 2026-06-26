import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/require-auth"
import { fetchThreadSessionState } from "@/lib/langgraph/thread-state"
import { devError } from "@/lib/logger"
import { USER_MESSAGES } from "@/lib/messages/user-messages"

interface RouteParams {
  params: Promise<{ threadId: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth()
  if (authResult.unauthorized) {
    return authResult.unauthorized
  }

  try {
    const { threadId } = await params
    const state = await fetchThreadSessionState(threadId)
    return NextResponse.json({ data: state })
  } catch (error) {
    devError("[api/mentor/threads/:threadId/history] GET", error)
    return NextResponse.json(
      {
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: USER_MESSAGES.mentorUnavailable,
        },
      },
      { status: 502 }
    )
  }
}
