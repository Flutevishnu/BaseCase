import { backendFetch } from "@/lib/api/client"
import { langgraphClient } from "@/lib/langgraph/client"

interface CreateOrResumeSessionParams {
  problemId: string
  clerkUserId: string
  restart?: boolean
}

/** Create or resume a problem session; returns the LangGraph thread id. */
export async function createOrResumeSession({
  problemId,
  clerkUserId,
  restart = false,
}: CreateOrResumeSessionParams): Promise<{ threadId: string; isNew: boolean; problemTags?: string[]; userMemory?: any }> {
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

  const json = (await response.json()) as {
    data?: { threadId?: string; isNew?: boolean; problemTags?: string[]; userMemory?: any }
  }
  const threadId = json.data?.threadId

  if (!threadId) {
    throw new Error("Backend did not return a threadId")
  }

  const problemTags = json.data?.problemTags || []
  const userMemory = json.data?.userMemory

  // Centralized LangGraph initialization and state seeding
  await langgraphClient.threads.create({
    threadId,
    ifExists: "do_nothing",
    graphId: process.env.LANGGRAPH_ASSISTANT_ID,
    metadata: {
      userId: clerkUserId,
    },
  })

  if (problemTags && userMemory) {
    const state = await langgraphClient.threads.getState(threadId)
    if (!(state.values as any).problem_tags || (state.values as any).problem_tags.length === 0) {
      await langgraphClient.threads.updateState(threadId, {
        values: {
          problem_tags: problemTags,
          technical_blindspots: userMemory.technicalBlindspots,
          behavioral_traits: userMemory.behavioralTraits,
          past_related_problems: userMemory.pastRelatedProblems,
        }
      })
    }
  }

  return {
    threadId,
    isNew: Boolean(json.data?.isNew),
    problemTags,
    userMemory,
  }
}
