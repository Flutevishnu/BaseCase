export type Phase = "IDEATION" | "CODING" | "REVIEW"

export type MessageRole = "user" | "assistant"

export interface VisualizationStep {
  description: string;
  highlights: Record<string, number>; // e.g., { "i": 0, "j": 1 }
  variables: Record<string, any>;     // e.g., { "sum": 8 }
  found: boolean;
}

export interface VisualizationData {
  title: string;
  viz_type: "array" | "linked_list" | "binary_tree" | "hashmap" | "matrix";
  data: any; // The initial state, e.g., { "array": [1, 2, 3], "target": 5 }
  steps: VisualizationStep[];
}

export interface MentorMessage {
  role: MessageRole
  content: string
  isStreaming?: boolean
  visualization?: VisualizationData
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
