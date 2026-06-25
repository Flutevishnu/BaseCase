import { NextRequest, NextResponse } from "next/server"
import { fetchProblemById } from "@/lib/problems-api"

export const dynamic = "force-dynamic"

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
    console.error("[api/problems/:problemId] GET error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch problem" } },
      { status: 502 }
    )
  }
}
