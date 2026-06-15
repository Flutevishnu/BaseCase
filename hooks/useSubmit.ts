"use client"

import { useSessionStore } from "@/stores/sessionStore"
import { useCallback } from "react"

export function useSubmit(problemDescription: string) {
  const {
    threadId,
    code,
    addMessage,
    setPhase,
    setLoading,
    setReviewContent,
    isLoading,
  } = useSessionStore()

  const submit = useCallback(async () => {
    if (!code.trim() || isLoading) return

    setLoading(true)
    addMessage({ role: "user", content: "Submitted my solution for review." })

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, threadId, problemDescription }),
      })

      if (!res.ok) throw new Error("Submit request failed")

      const data = await res.json()

      // addMessage({ role: "assistant", content: data.review })
      setReviewContent(data.review)
      setPhase("REVIEW")
    } catch (err) {
      addMessage({
        role: "assistant",
        content: "Failed to submit. Please try again.",
      })
      console.error("Submit error:", err)
    } finally {
      setLoading(false)
    }
  }, [code, threadId, addMessage, setPhase, setLoading, setReviewContent, isLoading, problemDescription])

  return { submit, isLoading }
}
