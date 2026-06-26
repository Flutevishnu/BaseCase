import { NextRequest, NextResponse } from "next/server"
import { fetchProblemById } from "@/lib/problems-api"
import { devError } from "@/lib/logger"
import { USER_MESSAGES } from "@/lib/user-messages"

interface RouteParams {
  params: Promise<{ problemId: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { problemId } = await params
    const problem = await fetchProblemById(problemId)

    if (!problem) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Problem not found" } },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: problem })
  } catch (error) {
    devError("[api/problems/:problemId] GET", error)
    return NextResponse.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: USER_MESSAGES.loadProblemFailed } },
      { status: 502 }
    )
  }
}
