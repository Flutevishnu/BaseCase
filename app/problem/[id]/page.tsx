import { notFound } from "next/navigation"
import { Workspace } from "@/components/workspace/Workspace"
import { fetchProblemById } from "@/lib/problems-api"

interface ProblemPageProps {
  params: Promise<{ id: string }>
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { id } = await params
  const problem = await fetchProblemById(id)

  if (!problem) notFound()

  return <Workspace problem={problem} />
}
