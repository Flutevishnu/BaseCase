"use client"

import Link from "next/link"
import { InlineError } from "@/components/ui/InlineError"
import { USER_MESSAGES } from "@/lib/user-messages"

export function ProblemUnavailable() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4">
      <InlineError
        message={USER_MESSAGES.loadProblemFailed}
        onRetry={() => window.location.reload()}
      />
      <Link
        href="/problems"
        className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
      >
        Back to problem library
      </Link>
    </div>
  )
}
