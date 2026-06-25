import { backendFetch } from "@/lib/backend"
import {
  Problem,
  ProblemDetailResponse,
  ProblemsListResponse,
  ProblemSummary,
} from "@/types"

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is string => typeof tag === "string")
  }
  if (typeof tags === "string" && tags.length > 0) {
    return tags.split(",").map((tag) => tag.trim())
  }
  return []
}

function normalizeProblemSummary(raw: Record<string, unknown>): ProblemSummary {
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    difficulty: raw.difficulty as ProblemSummary["difficulty"],
    tags: normalizeTags(raw.tags),
  }
}

function normalizeProblem(raw: Record<string, unknown>): Problem {
  const examples = Array.isArray(raw.examples) ? raw.examples : []
  const constraints = Array.isArray(raw.constraints) ? raw.constraints : []

  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    difficulty: raw.difficulty as Problem["difficulty"],
    tags: normalizeTags(raw.tags),
    description: String(raw.description ?? ""),
    examples: examples.map((example) => {
      const item = example as Record<string, unknown>
      return {
        input: String(item.input ?? ""),
        output: String(item.output ?? ""),
        ...(item.explanation ? { explanation: String(item.explanation) } : {}),
      }
    }),
    constraints: constraints.map((item) => String(item)),
  }
}

export async function fetchProblemsList(params?: {
  tag?: string
  difficulty?: string
  limit?: string
  offset?: string
}): Promise<ProblemsListResponse> {
  const response = await backendFetch("/problems", { searchParams: params })

  if (!response.ok) {
    throw new Error(`Failed to fetch problems: ${response.statusText}`)
  }

  const json = (await response.json()) as {
    data?: unknown
    meta?: Partial<ProblemsListResponse["meta"]>
  }

  const rawList = Array.isArray(json.data)
    ? json.data
    : json.data
      ? [json.data]
      : []

  return {
    data: rawList.map((item) =>
      normalizeProblemSummary(item as Record<string, unknown>)
    ),
    meta: {
      total: Number(json.meta?.total ?? rawList.length),
      limit: Number(json.meta?.limit ?? rawList.length),
      offset: Number(json.meta?.offset ?? 0),
    },
  }
}

export async function fetchProblemById(id: string): Promise<Problem | null> {
  const response = await backendFetch(`/problems/${encodeURIComponent(id)}`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch problem: ${response.statusText}`)
  }

  const json = (await response.json()) as ProblemDetailResponse
  return normalizeProblem(json.data as unknown as Record<string, unknown>)
}
