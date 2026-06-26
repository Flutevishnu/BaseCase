import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { Workspace } from "@/components/workspace/Workspace"
import { ProblemUnavailable } from "@/components/workspace/ProblemUnavailable"
import { fetchProblemById } from "@/lib/api/problems"
import { createOrResumeSession } from "@/lib/api/sessions"
import { fetchThreadSessionState } from "@/lib/langgraph/thread-state"
import { devError } from "@/lib/logger"
import { ThreadSessionState } from "@/types"

interface ProblemPageProps {
  params: Promise<{ id: string }>
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { id } = await params
  const { userId } = await auth()

  try {
    const problem = await fetchProblemById(id)
    if (!problem) notFound()

    const { threadId, isNew } = await createOrResumeSession({
      problemId: id,
      clerkUserId: userId!,
      restart: false,
    })

    let initialThreadState: ThreadSessionState | undefined
    if (!isNew) {
      initialThreadState = await fetchThreadSessionState(threadId)
    }

    return (
      <Workspace
        key={id}
        problem={problem}
        initialThreadId={threadId}
        initialThreadState={initialThreadState}
      />
    )
  } catch (error) {
    devError("[problem page]", error)
    return <ProblemUnavailable />
  }
}
