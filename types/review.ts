/** Structured code-review feedback produced by the agent on submission. */
export interface CodeReview {
  correctness?: string
  complexity?: string
  style?: string
  improvement?: string
  [key: string]: string | undefined
}
