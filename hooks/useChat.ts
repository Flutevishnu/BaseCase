"use client"

import { useSessionStore } from "@/stores/sessionStore"
import { Phase } from "@/types/mentor"
import { useCallback } from "react"

export function useChat(problemDescription: string) {
  const {
    threadId,
    phase,
    addMessage,
    setPhase,
    setLoading,
    isLoading,
  } = useSessionStore()

  const send = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      // Add user message immediately
      addMessage({ role: "user", content })
      setLoading(true)

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            threadId,
            phase,
            problemDescription,
          }),
        })

        if (!res.ok) throw new Error("Chat request failed")

        const data = await res.json()

        // Add assistant reply
        addMessage({ role: "assistant", content: data.reply })

        // Phase transition — backend drives this
        if (data.phase && data.phase !== phase) {
          setPhase(data.phase as Phase)
        }
      } catch (err) {
        addMessage({
          role: "assistant",
          content: "Something went wrong. Please try again.",
        })
        console.error("Chat error:", err)
      } finally {
        setLoading(false)
      }
    },
    [threadId, phase, addMessage, setPhase, setLoading, isLoading, problemDescription]
  )

  return { send, isLoading }
}
