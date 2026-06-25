import type { Problem, ProblemSummary } from "./problem"

/** Pagination metadata returned by list endpoints. */
export interface ApiListMeta {
  total: number
  limit: number
  offset: number
}

export interface ProblemsListResponse {
  data: ProblemSummary[]
  meta: ApiListMeta
}

export interface ProblemDetailResponse {
  data: Problem
}

export interface ApiError {
  code: string
  message: string
}

export interface ApiErrorResponse {
  error: ApiError
}
