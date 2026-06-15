import { NextRequest, NextResponse } from "next/server"

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:8000"

export async function POST(req: NextRequest) {
  try {
    const { code, threadId, problemDescription } = await req.json()

    if (!code || !threadId || !problemDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const payload = {
      session_id: threadId,
      action_type: "submit_code",
      code: code,
      message: "Here is my Latest Code Submission",
    }

    const response = await fetch(`${BACKEND_API_URL}/api/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      review: data.response,
      phase: data.current_phase,
    })
  } catch (err) {
    console.error("Submit API error:", err)
    return NextResponse.json(
      { error: "Failed to submit code for review" },
      { status: 500 }
    )
  }
}
