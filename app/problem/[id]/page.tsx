import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { Workspace } from "@/components/workspace/Workspace"
import { ProblemUnavailable } from "@/components/workspace/ProblemUnavailable"
import { fetchProblemById } from "@/lib/problems-api"
import { createOrResumeSession } from "@/lib/sessions-api"
import { devError } from "@/lib/logger"

interface ProblemPageProps {
  params: Promise<{ id: string }>
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { id } = await params
  const { userId } = await auth()

  try {
    const problem = await fetchProblemById(id)
    if (!problem) notFound()

    const { threadId } = await createOrResumeSession({
      problemId: id,
      clerkUserId: userId!,
      restart: false,
    })

    return <Workspace problem={problem} initialThreadId={threadId} />
  } catch (error) {
    devError("[problem page]", error)
    return <ProblemUnavailable />
  }
}
