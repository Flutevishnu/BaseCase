import type { VisualizationData } from "./visualization"

/** The stage a mentoring session is currently in. */
export type MentorPhase = "IDEATION" | "CODING" | "REVIEW"

export type MessageRole = "user" | "assistant"

export interface MentorMessage {
  role: MessageRole
  content: string
  isStreaming?: boolean
  visualization?: VisualizationData
}
