import { NextRequest } from "next/server"
import { Client } from "@langchain/langgraph-sdk"
import { requireAuth } from "@/lib/require-auth"

const LANGGRAPH_API_URL = process.env.LANGGRAPH_API_URL || "http://localhost:2024"
const ASSISTANT_ID = process.env.LANGGRAPH_ASSISTANT_ID || "agent"

const client = new Client({ apiUrl: LANGGRAPH_API_URL })

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

  const encoder = new TextEncoder()

  // Return the Response immediately — browser gets headers right away.
  // All async work (thread creation + streaming) happens inside start().
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Ensure thread exists before streaming
        await client.threads.create({
          threadId,
          ifExists: "do_nothing",
          metadata: { userId },
        })

        const runStream = client.runs.stream(threadId, ASSISTANT_ID, {
          input,
          streamMode: ["messages", "values"],
        })

        for await (const chunk of runStream) {
          // Proper SSE format: data: {...}\n\n
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
          )
        }
      } catch (err) {
        console.error("[stream] error:", err)
        // Send the error as a final chunk so the client knows something went wrong
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ event: "error", data: { message: String(err) } })}\n\n`
          )
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      // Prevent any proxy or Next.js middleware from buffering the stream
      "Cache-Control": "no-cache, no-store, no-transform",
      "X-Accel-Buffering": "no",
      "Connection": "keep-alive",
    },
  })
}
