"use client"

import { Problem } from "@/types/mentor"
import { useMentorStream } from "@/hooks/useMentorStream"
import { ProblemPanel } from "./ProblemPanel"
import { EditorPanel } from "./EditorPanel"
import { ChatPanel } from "./ChatPanel"

interface WorkspaceProps {
  problem: Problem
}

export function Workspace({ problem }: WorkspaceProps) {
  const stream = useMentorStream(problem.description)

  return (
    <div
      className="h-full w-full grid overflow-hidden"
      style={{ gridTemplateColumns: "320px 1fr 360px" }}
    >
      {/* Left: Problem description */}
      <ProblemPanel problem={problem} />

      {/* Middle: Code editor / review */}
      <EditorPanel problem={problem} stream={stream} />

      {/* Right: Chat */}
      <ChatPanel stream={stream} />
    </div>
  )
}
