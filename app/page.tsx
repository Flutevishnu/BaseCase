import Link from "next/link"
import { problems } from "@/lib/problems"

const difficultyStyles = {
  Easy: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950",
  Medium: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950",
  Hard: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950",
}

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto px-8 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
          Pick a problem
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          BaseCase will guide you through the approach before you write a single line of code.
        </p>
      </div>

      <div className="grid gap-3">
        {problems.map((problem) => (
          <Link
            key={problem.id}
            href={`/problem/${problem.id}`}
            className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-violet-300 dark:hover:border-violet-500 hover:shadow-sm dark:hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-violet-50 dark:group-hover:bg-violet-900 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                  {problem.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {problem.tags.map((tag) => (
                    <span key={tag} className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${difficultyStyles[problem.difficulty]}`}>
                {problem.difficulty}
              </span>
              <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
