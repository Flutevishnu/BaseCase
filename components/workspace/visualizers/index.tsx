import { VisualizationData } from "@/types"
import { ArrayVisualizer } from "./ArrayVisualizer"
import { LinkedListVisualizer } from "./LinkedListVisualizer"
import { TreeVisualizer } from "./TreeVisualizer"
import { MatrixVisualizer } from "./MatrixVisualizer"
import { HashmapVisualizer } from "./HashmapVisualizer"

interface VisualizationProps {
  data: VisualizationData
}

/** Renders the correct visualizer for a given `viz_type`. */
export function Visualization({ data }: VisualizationProps) {
  switch (data.viz_type) {
    case "array":
      return <ArrayVisualizer data={data} />
    case "linked_list":
      return <LinkedListVisualizer data={data} />
    case "binary_tree":
      return <TreeVisualizer data={data} />
    case "matrix":
      return <MatrixVisualizer data={data} />
    case "hashmap":
      return <HashmapVisualizer data={data} />
    default:
      return null
  }
}
