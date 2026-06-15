import { create } from "zustand"
import { Phase, MentorMessage } from "@/types/mentor"

interface SessionStore {
  phase: Phase
  messages: MentorMessage[]
  threadId: string
  code: string
  isLoading: boolean
  reviewContent: string

  setPhase: (phase: Phase) => void
  addMessage: (msg: MentorMessage) => void
  setCode: (code: string) => void
  setLoading: (loading: boolean) => void
  setReviewContent: (content: string) => void
  reset: () => void
}

const initialState = {
  phase: "IDEATION" as Phase,
  messages: [] as MentorMessage[],
  threadId: typeof crypto !== "undefined" ? crypto.randomUUID() : "default-thread",
  code: "",
  isLoading: false,
  reviewContent: "",
}

export const useSessionStore = create<SessionStore>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  setCode: (code) => set({ code }),

  setLoading: (isLoading) => set({ isLoading }),

  setReviewContent: (reviewContent) => set({ reviewContent }),

  reset: () => set({ ...initialState, threadId: crypto.randomUUID() }),
})) 
