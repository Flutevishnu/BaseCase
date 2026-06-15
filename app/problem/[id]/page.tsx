import { notFound } from "next/navigation"
import { getProblemById } from "@/lib/problems"
import { Workspace } from "@/components/workspace/Workspace"

interface ProblemPageProps {
  params: Promise<{ id: string }>
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { id } = await params
  const problem = getProblemById(id)

  if (!problem) notFound()

  return <Workspace problem={problem} />
}
