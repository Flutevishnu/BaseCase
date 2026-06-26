import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/require-auth"
import { createOrResumeSession } from "@/lib/sessions-api"

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

    // restart is the only client-controllable field; clerkUserId is injected
    // server-side from the verified session so it can't be spoofed.
    let restart = false
    try {
      const body = await request.json()
      restart = Boolean(body?.restart)
    } catch {
      // no body provided — default restart = false
    }

    const { threadId } = await createOrResumeSession({
      problemId,
      clerkUserId: userId,
      restart,
    })

    return NextResponse.json({ data: { threadId } })
  } catch (error) {
    console.error("[api/problems/:problemId/sessions] POST error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create session" } },
      { status: 502 }
    )
  }
}
