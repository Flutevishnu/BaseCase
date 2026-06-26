import { NextRequest, NextResponse } from "next/server"
import { fetchProblemsList } from "@/lib/problems-api"
import { devError } from "@/lib/logger"
import { USER_MESSAGES } from "@/lib/user-messages"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const result = await fetchProblemsList({
      tag: searchParams.get("tag") ?? undefined,
      difficulty: searchParams.get("difficulty") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    devError("[api/problems] GET", error)
    return NextResponse.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: USER_MESSAGES.loadProblemsFailed } },
      { status: 502 }
    )
  }
}
