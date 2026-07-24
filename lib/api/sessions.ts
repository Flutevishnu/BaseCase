import { backendFetch } from "@/lib/api/client"

interface CreateOrResumeSessionParams {
  problemId: string
  clerkUserId?: string // Kept for compatibility but not needed by backendFetch
  restart?: boolean
}

/** Create or resume a problem session; returns the LangGraph thread id. */
export async function createOrResumeSession({
  problemId,
  restart = false,
}: CreateOrResumeSessionParams): Promise<{ threadId: string; isNew: boolean; problemTags?: string[]; userMemory?: any }> {
  const response = await backendFetch(
    `/sessions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restart, problemId }),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.status} ${response.statusText}`)
  }

  const json = (await response.json()) as {
    data?: {
      threadId?: string;
      isNew?: boolean;
      problemTags?: string[];
      userMemory?: any;
    }
  }
  
  const threadId = json.data?.threadId

  if (!threadId) {
    throw new Error("Backend did not return a threadId")
  }

  return {
    threadId,
    isNew: Boolean(json.data?.isNew),
    problemTags: json.data?.problemTags || [],
    userMemory: json.data?.userMemory,
  }
}
