export type VisualizationType =
  | "array"
  | "linked_list"
  | "binary_tree"
  | "hashmap"
  | "matrix"

/**
 * Free-form payload emitted by the agent's `GenerateVisualization` tool.
 * The concrete shape depends on `viz_type` (e.g. `{ array }`, `{ grid }`,
 * `{ map }`, `{ head }`, `{ root }`), so it is intentionally dynamic.
 */
export type VisualizationValues = Record<string, any>

export interface VisualizationStep {
  description: string
  /** Maps a pointer/label name to the index (or key) it points at. */
  highlights: Record<string, number>
  /** Snapshot of named variables at this step. */
  variables: VisualizationValues
  found?: boolean
}

export interface VisualizationData {
  title: string
  viz_type: VisualizationType
  /** Initial state for the visualization (shape varies by `viz_type`). */
  data: VisualizationValues
  steps: VisualizationStep[]
}
