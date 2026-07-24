import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth/require-auth"
import { devError } from "@/lib/logger"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: NextRequest) {
  const authResult = await requireAuth()
  if (authResult.unauthorized) {
    return authResult.unauthorized
  }
  const { userId } = authResult

  const body = await req.json()
  const { threadId, input } = body

  if (!threadId) {
    return new Response(JSON.stringify({ error: "Missing threadId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const baseUrl = process.env.BACKEND_API_URL || "http://localhost:8080";
    const gatewayUrl = `${baseUrl}/api/v1/evaluations/stream`;
    const { getToken } = await auth();
    const token = await getToken();

    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        threadId: threadId,
        input: input
      })
    });

    if (!response.body) throw new Error("No response body from Gateway");

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store, no-transform",
        "X-Accel-Buffering": "no",
        "Connection": "keep-alive",
      },
    })
  } catch (err) {
    devError("[stream]", err)
    return new Response(
      `data: ${JSON.stringify({ event: "error", data: { message: String(err) } })}\n\n`,
      { headers: { "Content-Type": "text/event-stream" } }
    )
  }
}
