"use client"

import { Problem } from "@/types/mentor"
import { useSessionStore } from "@/stores/sessionStore"
import { useMentorStream } from "@/hooks/useMentorStream"
import { LockedOverlay } from "@/components/ui/LockedOverlay"
import { CodeEditor } from "./CodeEditor"
import { ReviewPanel } from "./ReviewPanel"

interface EditorPanelProps {
  problem: Problem
  stream: ReturnType<typeof useMentorStream>
}

export function EditorPanel({ problem, stream }: EditorPanelProps) {
  const { phase, isLoading: sessionLoading } = useSessionStore()
  const { submitCode, isLoading: streamLoading, reviewContent, isReviewLoading } = stream

  const isLoading = sessionLoading || streamLoading || isReviewLoading

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-950 transition-colors">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-0 h-11 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <div className="flex items-center h-full">
          <div
            className={`flex items-center gap-2 text-xs px-4 h-full border-r border-zinc-200 dark:border-zinc-800 ${
              phase !== "IDEATION"
                ? "text-zinc-300 border-b-2 border-b-violet-500 bg-zinc-950"
                : "text-zinc-500 dark:text-zinc-600"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            solution.py
          </div>
        </div>

        <div className="flex items-center gap-2 pr-3">
          {phase === "IDEATION" && (
            <span className="text-[10px] text-zinc-500 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Locked until ideation complete
            </span>
          )}
          {phase === "CODING" && (
            <span className="text-[10px] text-emerald-500 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Ready to code
            </span>
          )}
        </div>
      </div>

      {/* Phase-driven content */}
      {phase === "IDEATION" && <LockedOverlay />}
      {phase === "CODING" && <CodeEditor onSubmit={submitCode} isLoading={isLoading} />}
      {phase === "REVIEW" && (
        <ReviewPanel reviewContent={reviewContent} isStreaming={isReviewLoading} />
      )}
    </div>
  )
}
