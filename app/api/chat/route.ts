import { NextRequest, NextResponse } from "next/server"

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:8000"

export async function POST(req: NextRequest) {
  try {
    const { message, threadId, actionType = "chat", code, problemDescription } = await req.json()

    if (!message || !threadId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Build request payload based on action type
    const payload: Record<string, any> = {
      session_id: threadId,
      action_type: actionType,
      message: message,
    }

    // Add optional fields
    if (code) payload.code = code
    if (problemDescription) payload.problem_description = problemDescription

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
      reply: data.response,
      phase: data.current_phase,
    })
  } catch (err) {
    console.error("Chat API error:", err)
    return NextResponse.json(
      { error: "Failed to reach mentor" },
      { status: 500 }
    )
  }
}
