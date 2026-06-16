"use client"

import { Problem } from "@/types/mentor"
import { useSessionStore } from "@/stores/sessionStore"

interface ProblemPanelProps {
  problem: Problem
}

const difficultyStyles = {
  Easy: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  Hard: "bg-red-500/10 text-red-500 border border-red-500/20",
}

export function ProblemPanel({ problem }: ProblemPanelProps) {
  const { phase } = useSessionStore()

  return (
    <div className="flex flex-col h-full overflow-hidden border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <span className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
          Problem
        </span>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyStyles[problem.difficulty]}`}
        >
          {problem.difficulty}
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Title */}
        <div>
          <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug mb-2">
            {problem.title}
          </h1>
          <div className="flex flex-wrap gap-1.5">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {problem.description}
          </p>
        </div>

        {/* Examples */}
        {problem.examples.length > 0 && (
          <div className="space-y-2.5">
            {problem.examples.map((ex, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden"
              >
                <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Example {i + 1}
                  </span>
                </div>
                <div className="px-3 py-2.5 space-y-1.5 bg-white dark:bg-zinc-900">
                  <div className="text-xs font-mono text-zinc-700 dark:text-zinc-300">
                    <span className="text-zinc-400 dark:text-zinc-500 font-sans not-italic">Input: </span>
                    {ex.input}
                  </div>
                  <div className="text-xs font-mono text-zinc-700 dark:text-zinc-300">
                    <span className="text-zinc-400 dark:text-zinc-500 font-sans not-italic">Output: </span>
                    {ex.output}
                  </div>
                  {ex.explanation && (
                    <div className="text-xs text-zinc-400 dark:text-zinc-500 pt-0.5 leading-relaxed">
                      {ex.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Constraints */}
        {problem.constraints.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Constraints
            </p>
            <ul className="space-y-1">
              {problem.constraints.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5 text-xs leading-none">·</span>
                  <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Phase status pill at the bottom */}
        <div className="pt-2 pb-1">
          <div className={`flex items-center gap-2 text-[10px] font-semibold px-3 py-2 rounded-lg w-fit ${
            phase === "IDEATION"
              ? "bg-violet-500/10 text-violet-500"
              : phase === "CODING"
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-blue-500/10 text-blue-500"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              phase === "IDEATION" ? "bg-violet-500" : phase === "CODING" ? "bg-emerald-500" : "bg-blue-500"
            }`} />
            {phase === "IDEATION" ? "Ideation Phase" : phase === "CODING" ? "Coding Phase" : "Review Phase"}
          </div>
        </div>
      </div>
    </div>
  )
}
