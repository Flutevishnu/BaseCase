"use client"

import { useSessionStore } from "@/stores/sessionStore"
import { Phase, MentorMessage } from "@/types/mentor"
import { useCallback, useState, useRef } from "react"

export function useMentorStream(problemDescription: string) {
  const { threadId, phase, setPhase, code } = useSessionStore()

  const [messages, setMessages] = useState<MentorMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [reviewContent, setReviewContent] = useState<string>("")
  const [isReviewLoading, setIsReviewLoading] = useState(false)
  const [threadReady, setThreadReady] = useState(true) // API handles thread creation
  const abortRef = useRef<AbortController | null>(null)

  // Core streaming runner — calls /api/mentor/stream endpoint
  const runStream = useCallback(
    async (input: Record<string, unknown>) => {
      abortRef.current?.abort()
      const abort = new AbortController()
      abortRef.current = abort

      setIsLoading(true)

      // Add blank streaming placeholder for the assistant reply
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", isStreaming: true },
      ])

      try {
        const response = await fetch("/api/mentor/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ threadId, input }),
          signal: abort.signal,
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        if (!response.body) {
          throw new Error("No response body")
        }

        // Parse newline-delimited JSON stream
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || "" // Keep incomplete line in buffer

          for (const line of lines) {
            // Check for proper SSE data: prefix
            if (!line.trim() || !line.startsWith("data: ")) continue

            const dataStr = line.slice(6) // Remove "data: "
            if (dataStr === "[DONE]") continue

            try {
              const chunk = JSON.parse(dataStr)

              // messages/partial: server sends the FULL accumulated content so far
              if (chunk.event === "messages/partial") {
                const parts = chunk.data as Array<{
                  type?: string
                  content?: string | Array<{ type?: string; text?: string }>
                }>

                // Find the AI message chunk
                const aiPart = parts?.find((d) =>
                  d.type === "ai" ||
                  d.type === "AIMessageChunk" ||
                  d.type === "AIMessage"
                )
                if (!aiPart?.content) continue

                const text =
                  typeof aiPart.content === "string"
                    ? aiPart.content
                    : Array.isArray(aiPart.content)
                      ? (aiPart.content as Array<{ text?: string }>)
                        .map((c) => c?.text ?? "")
                        .join("")
                      : ""

                if (!text) continue

                setMessages((prev) => {
                  const next = [...prev]
                  const last = next.length - 1
                  if (next[last]?.isStreaming) {
                    next[last] = { role: "assistant", content: text, isStreaming: true }
                  }
                  return next
                })
              }

              // values: full graph state — sync phase transitions
              if (chunk.event === "values") {
                const vals = chunk.data as { current_phase?: string }
                const newPhase = vals?.current_phase as Phase | undefined
                if (newPhase && newPhase !== phase) {
                  setPhase(newPhase)
                }
              }
            } catch (err) {
              console.error("Failed to parse stream chunk:", err)
            }
          }
        }
      } catch (err: unknown) {
        if (abort.signal.aborted) return
        console.error("Stream error:", err)
        setMessages((prev) => {
          const next = [...prev]
          const last = next.length - 1
          if (next[last]?.isStreaming) {
            next[last] = {
              role: "assistant",
              content: "Something went wrong. Please try again.",
              isStreaming: false,
            }
          }
          return next
        })
      } finally {
        if (!abort.signal.aborted) {
          // Seal the streaming message
          setMessages((prev) => {
            const next = [...prev]
            const last = next.length - 1
            if (next[last]?.isStreaming) {
              next[last] = { ...next[last], isStreaming: false }
            }
            return next
          })
          setIsLoading(false)
        }
      }
    },
    [threadId, phase, setPhase]
  )

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || isLoading) return
      setMessages((prev) => [...prev, { role: "user", content }])
      runStream({
        messages: [{ type: "human", content }],
        problem_description: problemDescription,
        current_phase: phase,
      })
    },
    [runStream, isLoading, phase, problemDescription]
  )

  const submitCode = useCallback(async () => {
    if (!code.trim() || isReviewLoading) return

    setIsReviewLoading(true)
    setReviewContent("")

    try {
      const response = await fetch("/api/mentor/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          code,
          problemDescription,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[hook] submit response:", data)

      // The proxy already extracts the review text — trust it directly
      const reviewText = typeof data.review === "string" ? data.review : ""

      if (reviewText) {
        setReviewContent(reviewText)
        setPhase("REVIEW")
      } else {
        // Review came back empty — log the full payload to diagnose
        console.warn("[hook] Empty review. Full data:", JSON.stringify(data, null, 2))
        setReviewContent("Review is processing… check the server logs for the graph state shape.")
        setPhase("REVIEW")
      }
    } catch (err) {
      console.error("Submit error:", err)
      setReviewContent("Failed to get code review. Please try again.")
      setPhase("REVIEW")
    } finally {
      setIsReviewLoading(false)
    }
  }, [threadId, code, problemDescription, setPhase])

  return {
    mentorMessages: messages,
    isLoading,
    threadReady,
    sendMessage,
    submitCode,
    reviewContent,
    isReviewLoading,
  }
}
