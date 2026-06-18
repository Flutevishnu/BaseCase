"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { problems } from "@/lib/problems"

const difficultyStyles = {
  Easy: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950",
  Medium: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950",
  Hard: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950",
}

export default function ProblemsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const tags = new Set<string>()
    problems.forEach(p => p.tags.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  }, [])

  const filteredProblems = useMemo(() => {
    if (!selectedCategory) return problems
    return problems.filter(p => p.tags.includes(selectedCategory))
  }, [selectedCategory])

  return (
    <main className="max-w-4xl w-full mx-auto px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
          Problem Library
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Select a problem to start practicing. Filter by category to focus on specific topics.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? "bg-violet-600 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filteredProblems.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No problems found for this category.
          </div>
        ) : (
          filteredProblems.map((problem) => (
            <Link
              key={problem.id}
              href={`/problem/${problem.id}`}
              className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-violet-300 dark:hover:border-violet-500 hover:shadow-sm dark:hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-violet-50 dark:group-hover:bg-violet-900 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500 group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    {problem.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {problem.tags.map((tag, idx) => (
                      <span key={tag} className="text-xs text-zinc-400 dark:text-zinc-500">
                        {tag}{idx < problem.tags.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${difficultyStyles[problem.difficulty]}`}>
                  {problem.difficulty}
                </span>
                <svg className="w-5 h-5 text-zinc-300 dark:text-zinc-700 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  )
}
