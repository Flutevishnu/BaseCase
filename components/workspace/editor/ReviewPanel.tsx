"use client"

import { useSessionStore } from "@/stores/sessionStore"
import { useRouter } from "next/navigation"
import { CodeReview } from "@/types"

interface ReviewPanelProps {
  reviewContent: CodeReview | string | null
  isStreaming?: boolean
}

export function ReviewPanel({ reviewContent, isStreaming }: ReviewPanelProps) {
  const { setPhase, reset } = useSessionStore()
  const router = useRouter()

  const sections = parseReview(reviewContent)
  
  const fallbackText = typeof reviewContent === "string" 
    ? reviewContent 
    : reviewContent 
      ? JSON.stringify(reviewContent, null, 2) 
      : ""

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-950 transition-colors">
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
        <div className="flex items-center gap-2 mb-0.5">
          <div className={`w-2 h-2 rounded-full ${isStreaming ? "bg-violet-400 animate-pulse" : "bg-emerald-400"}`} />
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wide uppercase">
            Code Review
          </span>
          {isStreaming && (
            <span className="text-[10px] text-violet-400 animate-pulse ml-1">Generating...</span>
          )}
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Feedback from BaseCase on your submission
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {sections.length > 0 ? (
          sections.map((section, i) => (
            <div key={i} className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-colors">
              <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
                <span className={`text-xs font-semibold ${section.color}`}>
                  {section.title}
                </span>
              </div>
              <div className="px-4 py-3 bg-white dark:bg-zinc-950 transition-colors">
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {section.content}
                  {isStreaming && i === sections.length - 1 && (
                    <span className="inline-block w-0.5 h-3 bg-zinc-500 dark:bg-zinc-400 ml-0.5 align-middle animate-pulse" />
                  )}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
            {fallbackText}
            {isStreaming && (
              <span className="inline-block w-0.5 h-3 bg-zinc-500 dark:bg-zinc-400 ml-0.5 align-middle animate-pulse" />
            )}
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-3 transition-colors">
        <button
          onClick={() => router.push("/")}
          disabled={isStreaming}
          className="flex-1 text-xs font-semibold py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Home Page
        </button>
        <button
          onClick={reset}
          disabled={isStreaming}
          className="flex-1 text-xs font-semibold py-2.5 rounded-lg bg-violet-600 dark:bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          New Problem
        </button>
      </div>
    </div>
  )
}

interface ReviewSection {
  title: string
  content: string
  color: string
}

function parseReview(content: CodeReview | string | null): ReviewSection[] {
  if (!content) return []

  // Fallback for legacy string data
  if (typeof content === "string") {
    return [{ title: "Feedback", content, color: "text-zinc-400" }]
  }

  const sections: ReviewSection[] = []

  if (content.correctness) {
    sections.push({ title: "Correctness", content: content.correctness, color: "text-emerald-400" })
  }
  if (content.complexity) {
    sections.push({ title: "Complexity", content: content.complexity, color: "text-violet-400" })
  }
  if (content.style) {
    sections.push({ title: "Style", content: content.style, color: "text-amber-400" })
  }
  if (content.improvement) {
    sections.push({ title: "One thing to improve", content: content.improvement, color: "text-red-400" })
  }

  return sections
}
