"use client"

import { useSessionStore } from "@/stores/sessionStore"
import { MentorPhase, MentorMessage, CodeReview, ThreadSessionState } from "@/types"
import { devError, devWarn } from "@/lib/logger"
import { readApiErrorMessage, USER_MESSAGES } from "@/lib/messages/user-messages"
import { useCallback, useState, useRef, useEffect } from "react"

function handleUnauthorizedResponse(response: Response): boolean {
  if (response.status !== 401) return false
  window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`
  return true
}

export function useMentorStream(
  problemDescription: string,
  initialThreadState?: ThreadSessionState
) {
  const { threadId, phase, setPhase, code } = useSessionStore()

  const [messages, setMessages] = useState<MentorMessage[]>(
    initialThreadState?.messages ?? []
  )
  const [isLoading, setIsLoading] = useState(false)
  const [reviewContent, setReviewContent] = useState<CodeReview | null>(
    initialThreadState?.review ?? null
  )
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [isReviewLoading, setIsReviewLoading] = useState(false)
  const threadReady = Boolean(threadId)
  const abortRef = useRef<AbortController | null>(null)

  // Hydrate phase from resumed thread state (server-loaded, agent-owned).
  useEffect(() => {
    if (initialThreadState?.phase) {
      setPhase(initialThreadState.phase)
    }
  }, [initialThreadState?.phase, setPhase])

  const hydrateFromThread = useCallback(
    (state: ThreadSessionState) => {
      setMessages(state.messages)
      if (state.phase) setPhase(state.phase)
      setReviewContent(state.review ?? null)
      setReviewError(null)
    },
    [setPhase]
  )

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

        if (handleUnauthorizedResponse(response)) return

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        if (!response.body) {
          throw new Error("No response body")
        }

        // Parse standard Server-Sent Events stream
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let currentEvent = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || "" // Keep incomplete line in buffer

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue

            if (trimmed.startsWith("event: ")) {
              currentEvent = trimmed.slice(7).trim()
              continue
            }

            if (!trimmed.startsWith("data: ")) continue

            const dataStr = trimmed.slice(6).trim()
            if (dataStr === "[DONE]") continue

            try {
              const chunkData = JSON.parse(dataStr)
              console.log("[stream] Event:", currentEvent)

              // messages/partial or messages: server sends the FULL accumulated content so far
              if (currentEvent === "messages/partial" || currentEvent === "messages") {
                const parts = chunkData as Array<{
                  type?: string
                  content?: string | Array<{ type?: string; text?: string }>
                  tool_calls?: Array<{ name: string; args: any }>
                }>

                // Find the AI message chunk
                const aiPart = parts?.find((d) => d.type === "ai")
                if (!aiPart) continue

                const text =
                  typeof aiPart.content === "string"
                    ? aiPart.content
                    : Array.isArray(aiPart.content)
                      ? (aiPart.content as Array<{ text?: string }>)
                        .map((c) => c?.text ?? "")
                        .join("")
                      : ""

                let visualization: any = undefined
                if (aiPart.tool_calls && Array.isArray(aiPart.tool_calls)) {
                  const vizCall = aiPart.tool_calls.find((t: any) => t.name === "GenerateVisualization")
                  if (vizCall && vizCall.args) {
                    visualization = vizCall.args
                  }
                }

                if (!text && !visualization) continue

                setMessages((prev) => {
                  const next = [...prev]
                  const last = next.length - 1
                  if (next[last]?.isStreaming) {
                    const currentMsg = next[last]
                    next[last] = {
                      role: "assistant",
                      content: text || currentMsg.content,
                      isStreaming: true,
                      ...(visualization ? { visualization } : currentMsg.visualization ? { visualization: currentMsg.visualization } : {})
                    }
                  }
                  return next
                })
              }

              // values: full graph state — sync phase transitions and catch manual messages
              if (currentEvent === "values") {
                const vals = chunkData as { current_phase?: string, messages?: any[] }
                const newPhase = vals?.current_phase as MentorPhase | undefined
                if (newPhase && newPhase !== phase) {
                  setPhase(newPhase)
                }

                // Catch manually appended messages that don't stream (e.g. from transition_node)
                if (vals.messages && Array.isArray(vals.messages) && vals.messages.length > 0) {
                  const lastMsg = vals.messages[vals.messages.length - 1]
                  if (lastMsg && (lastMsg.type === "ai" || lastMsg.type === "AIMessage" || lastMsg.id?.startsWith("AIMessage"))) {
                    const text = typeof lastMsg.content === "string" ? lastMsg.content : ""
                    if (text) {
                      setMessages((prev) => {
                        const next = [...prev]
                        const last = next.length - 1
                        if (next[last]?.isStreaming) {
                          next[last] = { ...next[last], content: text }
                        }
                        return next
                      })
                    }
                  }
                }
              }
            } catch (err) {
              devError("[stream] parse chunk", err)
            }
          }
        }
      } catch (err: unknown) {
        if (abort.signal.aborted) return
        devError("[stream]", err)
        setMessages((prev) => {
          const next = [...prev]
          const last = next.length - 1
          if (next[last]?.isStreaming) {
            next[last] = {
              role: "assistant",
              content: USER_MESSAGES.mentorUnavailable,
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

  const lastSentCode = useRef<string | null>(null)

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || isLoading) return

      let streamContent = content
      if (code && code.trim() !== "" && code !== lastSentCode.current) {
        streamContent += `\n\n[Latest code of user]:\n\`\`\`\n${code}\n\`\`\``
        lastSentCode.current = code
      }

      setMessages((prev) => [...prev, { role: "user", content }])
      runStream({
        messages: [{ type: "human", content: streamContent }],
        problem_description: problemDescription,
        current_phase: phase,
      })
    },
    [runStream, isLoading, phase, problemDescription, code]
  )

  const submitCode = useCallback(async () => {
    if (!code.trim() || isReviewLoading) return

    setIsReviewLoading(true)
    setReviewContent(null)
    setReviewError(null)

    try {
      const response = await fetch("/api/mentor/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          code,
        }),
      })

      if (handleUnauthorizedResponse(response)) return

      if (!response.ok) {
        const message = await readApiErrorMessage(response, USER_MESSAGES.reviewFailed)
        setReviewError(message)
        return
      }

      const data = await response.json()
      const review = data.review as CodeReview | undefined

      const agentPhase = data.phase as MentorPhase | undefined
      if (
        agentPhase === "IDEATION" ||
        agentPhase === "CODING" ||
        agentPhase === "REVIEW"
      ) {
        setPhase(agentPhase)
      }

      if (agentPhase === "CODING") {
        // The code was rejected. Extract the feedback message and show it in the chat!
        const msgs = data.data?.messages
        if (Array.isArray(msgs) && msgs.length > 0) {
          const lastMsg = msgs[msgs.length - 1]
          if (lastMsg && (lastMsg.type === "ai" || lastMsg.type === "AIMessage" || lastMsg.id?.startsWith("AIMessage"))) {
            const text = typeof lastMsg.content === "string" ? lastMsg.content : ""
            if (text) {
              setMessages((prev) => [...prev, { role: "assistant", content: text, isStreaming: false }])
            }
          }
        }
        return
      }

      const hasContent =
        !!review &&
        Object.values(review).some((v) => typeof v === "string" && v.trim().length > 0)

      if (hasContent && review) {
        setReviewContent(review)
      } else {
        devWarn("[submit] empty review", data)
        setReviewError(USER_MESSAGES.reviewEmpty)
      }
    } catch (err) {
      devError("[submit]", err)
      setReviewError(USER_MESSAGES.reviewFailed)
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
    reviewError,
    isReviewLoading,
    hydrateFromThread,
  }
}



