"use client"

import { Problem } from "@/types/mentor"
import { useSessionStore } from "@/stores/sessionStore"
import { useChat } from "@/hooks/useChat"
import { ProblemHeader } from "./ProblemHeader"
import { ChatThread } from "./ChatThread"
import { ChatInput } from "./ChatInput"

interface LeftPanelProps {
  problem: Problem
}

export function LeftPanel({ problem }: LeftPanelProps) {
  const { messages, phase, isLoading } = useSessionStore()
  const { send } = useChat(problem.description)

  return (
    <div className="flex flex-col h-full overflow-hidden border-r border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
      <ProblemHeader problem={problem} />
      <ChatThread messages={messages} isLoading={isLoading} />
      <ChatInput
        onSend={send}
        isLoading={isLoading}
        disabled={phase === "REVIEW"}
      />
    </div>
  )
}
