export type Phase = "IDEATION" | "CODING" | "REVIEW"

export type MessageRole = "user" | "assistant"

export interface MentorMessage {
  role: MessageRole
  content: string
  isStreaming?: boolean
}

export interface SessionState {
  phase: Phase
  messages: MentorMessage[]
  codeSubmission: string | null
  threadId: string
}

export interface ChatResponse {
  reply: string
  phase: Phase
}

export interface SubmitResponse {
  review: string
  phase: Phase
}

export interface Problem {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  tags: string[]
  description: string
  examples: { input: string; output: string; explanation?: string }[]
  constraints: string[]
}
