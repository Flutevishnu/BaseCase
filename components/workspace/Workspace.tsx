"use client"

import { Problem } from "@/types"
import { useMentorStream } from "@/hooks/useMentorStream"
import { ProblemPanel } from "./ProblemPanel"
import { EditorPanel } from "./EditorPanel"
import { ChatPanel } from "./ChatPanel"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

interface WorkspaceProps {
  problem: Problem
}

export function Workspace({ problem }: WorkspaceProps) {
  const stream = useMentorStream(problem.description)

  return (
    <div className="h-full w-full overflow-hidden">
      <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
        {/* Left: Problem description */}
        <ResizablePanel defaultSize={22} minSize={15}>
          <ProblemPanel problem={problem} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Middle: Code editor / review */}
        <ResizablePanel defaultSize={53} minSize={30}>
          <EditorPanel problem={problem} stream={stream} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right: Chat */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <ChatPanel stream={stream} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
