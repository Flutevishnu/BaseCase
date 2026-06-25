export type Difficulty = "Easy" | "Medium" | "Hard"

export interface ProblemExample {
  input: string
  output: string
  explanation?: string
}

export interface Problem {
  id: string
  title: string
  difficulty: Difficulty
  tags: string[]
  description: string
  examples: ProblemExample[]
  constraints: string[]
}

/** Lightweight problem shape used in list views. */
export type ProblemSummary = Pick<
  Problem,
  "id" | "title" | "difficulty" | "tags"
>
