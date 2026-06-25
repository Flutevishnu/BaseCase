import { create } from "zustand"
import { MentorPhase } from "@/types"

interface SessionStore {
  phase: MentorPhase
  threadId: string
  code: string
  isLoading: boolean

  setPhase: (phase: MentorPhase) => void
  setCode: (code: string) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  phase: "IDEATION" as MentorPhase,
  threadId: typeof crypto !== "undefined" ? crypto.randomUUID() : "default-thread",
  code: "",
  isLoading: false,
}

export const useSessionStore = create<SessionStore>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setCode: (code) => set({ code }),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () => set({ ...initialState, threadId: crypto.randomUUID() }),
}))
