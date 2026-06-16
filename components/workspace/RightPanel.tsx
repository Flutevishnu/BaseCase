"use client"

import { Problem } from "@/types/mentor"
import { useSessionStore } from "@/stores/sessionStore"
import { useMentorStream } from "@/hooks/useMentorStream"
import { LockedOverlay } from "@/components/ui/LockedOverlay"
import { CodeEditor } from "./CodeEditor"
import { ReviewPanel } from "./ReviewPanel"

interface RightPanelProps {
  problem: Problem
  stream: ReturnType<typeof useMentorStream>
}

export function RightPanel({ problem, stream }: RightPanelProps) {
  const { phase, isLoading: sessionLoading } = useSessionStore()
  const { submitCode, isLoading: streamLoading, mentorMessages } = stream

  const isLoading = sessionLoading || streamLoading

  // The latest AI message is the review content when in REVIEW phase
  const lastAiMessage = [...mentorMessages].reverse().find((m) => m.role === "assistant")
  const reviewContent = lastAiMessage?.content ?? ""

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-950 transition-colors">
      {/* Editor header */}
      <div className="flex items-center justify-between px-4 py-0 h-11 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0 transition-colors">
        <div className="flex items-center">
          <div className={`flex items-center gap-2 text-xs px-4 h-11 border-r border-zinc-800 ${
            phase !== "IDEATION" ? "text-zinc-300 border-b-2 border-b-violet-500 bg-zinc-950" : "text-zinc-600"
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            solution.py
          </div>
        </div>

        <div className="flex items-center gap-2 pr-1">
          {phase === "IDEATION" && (
            <span className="text-[10px] text-zinc-600 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Locked
            </span>
          )}
          {phase === "CODING" && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Unlocked
            </span>
          )}
        </div>
      </div>

      {/* Phase-driven content */}
      {phase === "IDEATION" && <LockedOverlay />}
      {phase === "CODING" && <CodeEditor onSubmit={submitCode} isLoading={isLoading} />}
      {phase === "REVIEW" && <ReviewPanel reviewContent={reviewContent} isStreaming={streamLoading} />}
    </div>
  )
}
