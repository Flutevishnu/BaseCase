import type { VisualizationData } from "./visualization"
import type { CodeReview } from "./review"

/** The stage a mentoring session is currently in. */
export type MentorPhase = "IDEATION" | "CODING" | "REVIEW"

export type MessageRole = "user" | "assistant"

export interface MentorMessage {
  role: MessageRole
  content: string
  isStreaming?: boolean
  visualization?: VisualizationData
}

/** Hydration payload when resuming an existing LangGraph thread. */
export interface ThreadSessionState {
  messages: MentorMessage[]
  phase?: MentorPhase
  review?: CodeReview | null
}
