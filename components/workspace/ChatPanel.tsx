"use client"

import { useMentorStream } from "@/hooks/useMentorStream"
import { useSessionStore } from "@/stores/sessionStore"
import { ChatThread } from "./chat/ChatThread"
import { ChatInput } from "./chat/ChatInput"

interface ChatPanelProps {
  stream: ReturnType<typeof useMentorStream>
}

export function ChatPanel({ stream }: ChatPanelProps) {
  const { phase } = useSessionStore()
  const { mentorMessages, isLoading, sendMessage, threadReady } = stream

  return (
    <div className="flex flex-col h-full overflow-hidden border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 h-11 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-violet-500" />
        <span className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
          BaseCase Mentor
        </span>
        {!threadReady && (
          <span className="ml-auto text-[10px] text-zinc-400 animate-pulse">Connecting...</span>
        )}
      </div>

      {/* Scrollable chat thread — flex-1 lets it fill space */}
      <ChatThread messages={mentorMessages} isLoading={isLoading} />

      {/* Input pinned to bottom */}
      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading || !threadReady}
        disabled={phase === "REVIEW"}
      />
    </div>
  )
}
