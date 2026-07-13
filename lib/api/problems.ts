import { backendFetch } from "@/lib/api/client"
import {
  Problem,
  ProblemDetailResponse,
  ProblemsListResponse
} from "@/types"


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

  const responseSata = (await response.json()) as ProblemsListResponse
  return responseSata
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
  return json.data as Problem
}
