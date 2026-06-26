"use client"

import { useEffect, useState } from "react"
import { Problem } from "@/types"
import { useMentorStream } from "@/hooks/useMentorStream"
import { useSessionStore } from "@/stores/sessionStore"
import { devError } from "@/lib/logger"
import { readApiErrorMessage, USER_MESSAGES } from "@/lib/user-messages"
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
}

export function Workspace({ problem, initialThreadId }: WorkspaceProps) {
  const stream = useMentorStream(problem.description)
  const setThreadId = useSessionStore((s) => s.setThreadId)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [bootstrapKey, setBootstrapKey] = useState(0)

  const retrySession = () => setBootstrapKey((key) => key + 1)

  // Apply the server-resolved thread id on load (or when navigating to another problem).
  useEffect(() => {
    if (bootstrapKey > 0) return
    setSessionError(null)
    setThreadId(initialThreadId)
  }, [problem.id, initialThreadId, setThreadId, bootstrapKey])

  // Client-side retry only — initial bootstrap runs on the server in page.tsx.
  useEffect(() => {
    if (bootstrapKey === 0) return

    let cancelled = false

    setSessionError(null)
    setThreadId("")

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

        const { data } = (await response.json()) as { data?: { threadId?: string } }
        if (!cancelled && data?.threadId) {
          setThreadId(data.threadId)
        } else if (!cancelled) {
          setSessionError(USER_MESSAGES.sessionFailed)
        }
      } catch (err) {
        devError("[workspace] session bootstrap", err)
        if (!cancelled) setSessionError(USER_MESSAGES.sessionFailed)
      }
    }

    retryBootstrap()

    return () => {
      cancelled = true
    }
  }, [problem.id, setThreadId, bootstrapKey])

  return (
    <div className="h-full w-full overflow-hidden">
      <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
        {/* Left: Problem description */}
        <ResizablePanel defaultSize={22} minSize={15}>
          <ProblemPanel problem={problem} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Middle: Code editor / review */}
        <ResizablePanel defaultSize={53} minSize={30}>
          <EditorPanel problem={problem} stream={stream} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right: Chat */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <ChatPanel
            stream={stream}
            sessionError={sessionError}
            onRetrySession={retrySession}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
