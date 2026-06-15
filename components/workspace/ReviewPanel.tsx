"use client"

import { useSessionStore } from "@/stores/sessionStore"

export function ReviewPanel() {
  const { reviewContent, setPhase, reset } = useSessionStore()

  const sections = parseReview(reviewContent)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-950 transition-colors">
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wide uppercase">
            Code Review
          </span>
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
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
            {reviewContent}
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-3 transition-colors">
        <button
          onClick={() => setPhase("CODING")}
          className="flex-1 text-xs font-semibold py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
        >
          Back to Editor
        </button>
        <button
          onClick={reset}
          className="flex-1 text-xs font-semibold py-2.5 rounded-lg bg-violet-600 dark:bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-700 transition-all"
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

function parseReview(content: string): ReviewSection[] {
  if (!content) return []

  const sectionMap: Record<string, string> = {
    "Correctness": "text-emerald-400",
    "Complexity": "text-violet-400",
    "Style": "text-amber-400",
    "One thing to improve": "text-red-400",
  }

  const titles = Object.keys(sectionMap).map(escapeRegex).join("|")
  const regex = new RegExp(
    `\\*\\*(${titles})\\*\\*\\s*(?:[—-]\\s*)?([\\s\\S]*?)(?=\\*\\*(?:${titles})\\*\\*|$)`,
    "gi"
  )

  const sections: ReviewSection[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    const title = match[1]
    let body = match[2].trim()

    // Clean markdown formatting for display.
    body = body.replace(/\*\*(.*?)\*\*/g, "$1")
    body = body.replace(/`([^`]+)`/g, "$1")
    body = body.replace(/\$([^$]+)\$/g, "$1")
    body = body.replace(/^\s*[*+-]\s*/gm, "• ")
    body = body.replace(/^•\s*•\s*/gm, "• ")
    body = body.replace(/\s+\n/g, "\n")

    sections.push({ title, content: body, color: sectionMap[title] })
  }

  return sections
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")
}
