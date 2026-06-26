import { create } from "zustand"
import { MentorPhase } from "@/types"

interface SessionStore {
  phase: MentorPhase
  threadId: string
  code: string
  isLoading: boolean

  setPhase: (phase: MentorPhase) => void
  setThreadId: (threadId: string) => void
  setCode: (code: string) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  phase: "IDEATION" as MentorPhase,
  threadId: "", // server-owned: fetched from the backend session endpoint
  code: "",
  isLoading: false,
}

export const useSessionStore = create<SessionStore>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setThreadId: (threadId) => set({ threadId }),

  setCode: (code) => set({ code }),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () => set({ ...initialState }),
}))
