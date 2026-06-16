"use client"

import { Problem } from "@/types/mentor"
import { useSessionStore } from "@/stores/sessionStore"
import { useMentorStream } from "@/hooks/useMentorStream"
import { ProblemHeader } from "./ProblemHeader"
import { ChatThread } from "./ChatThread"
import { ChatInput } from "./ChatInput"

interface LeftPanelProps {
  problem: Problem
  stream: ReturnType<typeof useMentorStream>
}

export function LeftPanel({ problem, stream }: LeftPanelProps) {
  const { phase } = useSessionStore()
  const { mentorMessages, isLoading, sendMessage, threadReady } = stream

  return (
    <div className="flex flex-col h-full overflow-hidden border-r border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
      <ProblemHeader problem={problem} />
      <ChatThread messages={mentorMessages} isLoading={isLoading} />
      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading || !threadReady}
        disabled={phase === "REVIEW"}
      />
    </div>
  )
}
