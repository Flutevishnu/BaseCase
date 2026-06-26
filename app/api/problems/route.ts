import { NextRequest, NextResponse } from "next/server"
import { fetchProblemsList } from "@/lib/problems-api"

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
    console.error("[api/problems] GET error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch problems" } },
      { status: 502 }
    )
  }
}
