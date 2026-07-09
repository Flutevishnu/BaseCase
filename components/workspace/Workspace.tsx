"use client"

import { useEffect, useState } from "react"
import { Problem, ThreadSessionState } from "@/types"
import { useMentorStream } from "@/hooks/useMentorStream"
import { useSessionStore } from "@/stores/sessionStore"
import { devError } from "@/lib/logger"
import { readApiErrorMessage, USER_MESSAGES } from "@/lib/messages/user-messages"
import { ProblemPanel } from "./ProblemPanel"
import { EditorPanel } from "./EditorPanel"
import { ChatPanel } from "./ChatPanel"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

interface WorkspaceProps {
  problem: Problem
  initialThreadId: string
  initialThreadState?: ThreadSessionState
}

async function fetchThreadHistoryClient(
  threadId: string
): Promise<ThreadSessionState | null> {
  const response = await fetch(
    `/api/mentor/threads/${encodeURIComponent(threadId)}/history`
  )

  if (!response.ok) return null

  const json = (await response.json()) as { data?: ThreadSessionState }
  return json.data ?? null
}

export function Workspace({
  problem,
  initialThreadId,
  initialThreadState,
}: WorkspaceProps) {
  const stream = useMentorStream(problem.description, initialThreadState)
  const { hydrateFromThread } = stream
  const setThreadId = useSessionStore((s) => s.setThreadId)
  const setPhase = useSessionStore((s) => s.setPhase)
  const setCode = useSessionStore((s) => s.setCode)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [bootstrapKey, setBootstrapKey] = useState(0)

  const retrySession = () => setBootstrapKey((key) => key + 1)

  // Apply server-resolved session state on load (or when navigating to another problem).
  useEffect(() => {
    if (bootstrapKey > 0) return
    setSessionError(null)
    setThreadId(initialThreadId)
    setPhase(initialThreadState?.phase ?? "IDEATION")
    setCode("")
  }, [problem.id, initialThreadId, initialThreadState?.phase, setThreadId, setPhase, setCode, bootstrapKey])

  // Client-side retry — initial bootstrap runs on the server in page.tsx.
  useEffect(() => {
    if (bootstrapKey === 0) return

    let cancelled = false

    setSessionError(null)
    setThreadId("")
    hydrateFromThread({ messages: [] })

    async function retryBootstrap() {
      try {
        const response = await fetch(
          `/api/problems/${encodeURIComponent(problem.id)}/sessions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ restart: false }),
          }
        )

        if (response.status === 401) {
          window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`
          return
        }

        if (!response.ok) {
          const message = await readApiErrorMessage(
            response,
            USER_MESSAGES.sessionFailed
          )
          if (!cancelled) setSessionError(message)
          return
        }

        const { data } = (await response.json()) as {
          data?: { threadId?: string; isNew?: boolean }
        }

        if (!data?.threadId) {
          if (!cancelled) setSessionError(USER_MESSAGES.sessionFailed)
          return
        }

        if (!cancelled) setThreadId(data.threadId)

        if (!data.isNew) {
          if (!cancelled) setHistoryLoading(true)
          const threadState = await fetchThreadHistoryClient(data.threadId)
          if (!cancelled && threadState) {
            hydrateFromThread(threadState)
          }
        }
      } catch (err) {
        devError("[workspace] session bootstrap", err)
        if (!cancelled) setSessionError(USER_MESSAGES.sessionFailed)
      } finally {
        if (!cancelled) setHistoryLoading(false)
      }
    }

    retryBootstrap()

    return () => {
      cancelled = true
    }
  }, [problem.id, setThreadId, bootstrapKey, hydrateFromThread])

  return (
    <div className="h-full w-full overflow-hidden">
      <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={22} minSize={15}>
          <ProblemPanel problem={problem} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={53} minSize={30}>
          <EditorPanel problem={problem} stream={stream} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={25} minSize={20}>
          <ChatPanel
            stream={stream}
            sessionError={sessionError}
            historyLoading={historyLoading}
            onRetrySession={retrySession}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
