import { backendFetch } from "@/lib/backend"

interface CreateOrResumeSessionParams {
  problemId: string
  clerkUserId: string
  restart?: boolean
}

/**
 * Create or resume a session for a problem.
 * The backend returns the LangGraph thread id (creating one if needed,
 * or returning the existing active session's thread id).
 */
export async function createOrResumeSession({
  problemId,
  clerkUserId,
  restart = false,
}: CreateOrResumeSessionParams): Promise<{ threadId: string }> {
  const response = await backendFetch(
    `/problems/${encodeURIComponent(problemId)}/sessions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restart, clerkUserId }),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.status} ${response.statusText}`)
  }

  const json = (await response.json()) as { data?: { threadId?: string } }
  const threadId = json.data?.threadId

  if (!threadId) {
    throw new Error("Backend did not return a threadId")
  }

  return { threadId }
}
