import { Problem } from "@/types/mentor"

interface ProblemHeaderProps {
  problem: Problem
}

const difficultyStyles = {
  Easy: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  Medium: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  Hard: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
}

export function ProblemHeader({ problem }: ProblemHeaderProps) {
  return (
    <div className="border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 bg-white dark:bg-zinc-900 transition-colors">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] font-semibold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
          Problem
        </span>
      </div>

      <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1">{problem.title}</h2>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-2.5">
        {problem.description}
      </p>

      {problem.examples.slice(0, 1).map((ex, i) => (
        <div key={i} className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-2.5 mb-2.5 border border-zinc-100 dark:border-zinc-700 transition-colors">
          <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            Example
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono text-zinc-600 dark:text-zinc-300">
              <span className="text-zinc-400 dark:text-zinc-500">Input: </span>
              {ex.input}
            </div>
            <div className="text-xs font-mono text-zinc-600 dark:text-zinc-300">
              <span className="text-zinc-400 dark:text-zinc-500">Output: </span>
              {ex.output}
            </div>
            {ex.explanation && (
              <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{ex.explanation}</div>
            )}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-1.5">
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            difficultyStyles[problem.difficulty]
          }`}
        >
          {problem.difficulty}
        </span>
        {problem.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
