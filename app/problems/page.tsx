"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { PROBLEM_TAGS } from "@/lib/problem-tags"
import { Difficulty, ProblemSummary } from "@/types"

const PAGE_SIZE = 10

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"]

const difficultyStyles = {
  Easy: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950",
  Medium: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950",
  Hard: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950",
}

type DifficultyFilter = Difficulty | null
interface ProblemFilters {
  tag: string | null
  difficulty: DifficultyFilter
}

function buildProblemsUrl(
  offset: number,
  filters: ProblemFilters,
  limit = PAGE_SIZE
) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })
  if (filters.tag) {
    params.set("tag", filters.tag)
  }
  if (filters.difficulty) {
    params.set("difficulty", filters.difficulty)
  }
  return `/api/problems?${params.toString()}`
}

function formatActiveFilters(filters: ProblemFilters, total: number) {
  const parts: string[] = []
  if (filters.tag) parts.push(`tag "${filters.tag}"`)
  if (filters.difficulty) parts.push(`difficulty ${filters.difficulty}`)
  if (parts.length === 0) return null
  const label = parts.join(" · ")
  const count = total > 0 ? ` · ${total} problem${total === 1 ? "" : "s"}` : ""
  return `${label}${count}`
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemSummary[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>(null)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const offsetRef = useRef(0)
  const filtersRef = useRef<ProblemFilters>({ tag: null, difficulty: null })
  const requestIdRef = useRef(0)

  const fetchPage = useCallback(async (append: boolean) => {
    if (loadingRef.current) return
    loadingRef.current = true

    const requestId = ++requestIdRef.current
    const pageOffset = append ? offsetRef.current : 0
    const filters = filtersRef.current

    if (append) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
      setError(null)
    }

    try {
      const response = await fetch(buildProblemsUrl(pageOffset, filters))

      if (requestId !== requestIdRef.current) return

      if (!response.ok) {
        throw new Error(`Failed to load problems (${response.status})`)
      }

      const json = await response.json()
      const page = Array.isArray(json.data) ? (json.data as ProblemSummary[]) : []
      const pageTotal = Number(json.meta?.total ?? page.length)
      const nextOffset = pageOffset + page.length

      offsetRef.current = nextOffset
      setProblems((prev) => (append ? [...prev, ...page] : page))
      setTotal(pageTotal)
      setHasMore(nextOffset < pageTotal && page.length === PAGE_SIZE)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      console.error("[problems page] fetch error:", err)
      setError("Failed to load problems.")
      if (!append) {
        setProblems([])
        setHasMore(false)
        offsetRef.current = 0
      }
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    }
  }, [])

  // Server-side filter: reset and fetch when tag or difficulty changes
  useEffect(() => {
    filtersRef.current = {
      tag: selectedCategory,
      difficulty: selectedDifficulty,
    }
    offsetRef.current = 0
    requestIdRef.current += 1
    loadingRef.current = false
    setProblems([])
    setHasMore(true)
    setTotal(0)
    fetchPage(false)
  }, [selectedCategory, selectedDifficulty, fetchPage])

  // Lazy load next page
  useEffect(() => {
    const node = loadMoreRef.current
    if (!node || !hasMore || isLoading || isLoadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchPage(true)
        }
      },
      { rootMargin: "200px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [fetchPage, hasMore, isLoading, isLoadingMore, selectedCategory, selectedDifficulty])

  const activeFilterLabel = formatActiveFilters(
    { tag: selectedCategory, difficulty: selectedDifficulty },
    total
  )

  const hasActiveFilters = selectedCategory !== null || selectedDifficulty !== null

  return (
    <main className="max-w-4xl w-full mx-auto px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
          Problem Library
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Select a problem to start practicing. Filter by topic or difficulty.
        </p>
        {activeFilterLabel && !isLoading && (
          <p className="text-sm text-violet-600 dark:text-violet-400 mt-2">
            Filtered by {activeFilterLabel}
          </p>
        )}
      </div>

      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-2">
          Difficulty
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDifficulty(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedDifficulty === null
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            All levels
          </button>
          {DIFFICULTIES.map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedDifficulty === difficulty
                  ? "bg-violet-600 text-white"
                  : `${difficultyStyles[difficulty]} hover:opacity-80`
              }`}
            >
              {difficulty}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-2">
          Topic
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            All topics
          </button>
          {PROBLEM_TAGS.map((category) => (
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
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="text-center py-12 text-zinc-500">Loading problems...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : problems.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No problems match these filters.
          </div>
        ) : (
          problems.map((problem) => (
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

      <div ref={loadMoreRef} className="h-8" aria-hidden />

      {isLoadingMore && (
        <div className="text-center py-6 text-zinc-500 text-sm">Loading more...</div>
      )}

      {!isLoading && !hasMore && problems.length > 0 && (
        <div className="text-center py-6 text-zinc-400 text-sm">
          Showing {problems.length} of {total} problems
          {hasActiveFilters ? " matching filters" : ""}
        </div>
      )}
    </main>
  )
}
