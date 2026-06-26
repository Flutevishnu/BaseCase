"use client"

import { useEffect } from "react"
import { Problem } from "@/types"
import { useMentorStream } from "@/hooks/useMentorStream"
import { useSessionStore } from "@/stores/sessionStore"
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
}

export function Workspace({ problem }: WorkspaceProps) {
  const stream = useMentorStream(problem.description)
  const setThreadId = useSessionStore((s) => s.setThreadId)

  // Bootstrap the session: ask the backend to create or resume the thread for
  // this problem. The thread id is server-owned — the client never generates it.
  useEffect(() => {
    let cancelled = false

    // Clear any stale thread id from a previously opened problem so the chat
    // shows "Connecting..." until this problem's session resolves.
    setThreadId("")

    async function bootstrapSession() {
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
          throw new Error(`Session bootstrap failed: ${response.statusText}`)
        }

        const { data } = (await response.json()) as { data?: { threadId?: string } }
        if (!cancelled && data?.threadId) {
          setThreadId(data.threadId)
        }
      } catch (err) {
        console.error("[workspace] session bootstrap error:", err)
      }
    }

    bootstrapSession()

    return () => {
      cancelled = true
    }
  }, [problem.id, setThreadId])

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
          <ChatPanel stream={stream} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
