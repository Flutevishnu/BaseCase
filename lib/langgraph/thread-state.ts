import { backendFetch } from "@/lib/api/client"
import { mapLangGraphMessages } from "@/lib/langgraph/messages"
import { CodeReview, MentorPhase, ThreadSessionState } from "@/types"

function normalizePhase(value: unknown): MentorPhase | undefined {
  if (value === "IDEATION" || value === "CODING" || value === "REVIEW") {
    return value
  }
  return undefined
}

function normalizeReview(value: unknown): CodeReview | null {
  if (!value || typeof value !== "object") return null

  const review = value as Record<string, unknown>
  const normalized: CodeReview = {}

  for (const key of ["correctness", "complexity", "style", "improvement"]) {
    if (typeof review[key] === "string" && review[key]) {
      normalized[key] = review[key] as string
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : null
}

function mapValuesToSessionState(values: Record<string, unknown>): ThreadSessionState {
  const rawMessages = Array.isArray(values.messages) ? values.messages : []
  const review = normalizeReview(values.review)

  return {
    messages: mapLangGraphMessages(rawMessages),
    phase: normalizePhase(values.current_phase),
    review,
  }
}

export async function fetchThreadSessionState(
  threadId: string
): Promise<ThreadSessionState> {
  const response = await backendFetch(`/sessions/${encodeURIComponent(threadId)}/state`)
  
  if (!response.ok) {
    if (response.status === 404) {
      return mapValuesToSessionState({})
    }
    throw new Error(`Failed to fetch session state: ${response.status}`)
  }

  const state = await response.json()
  const values = (state.values ?? {}) as Record<string, unknown>
  return mapValuesToSessionState(values)
}
