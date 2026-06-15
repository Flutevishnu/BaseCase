"use client"

import { Problem } from "@/types/mentor"
import { useSessionStore } from "@/stores/sessionStore"
import { PhaseBadge } from "@/components/ui/PhaseBadge"
import { LeftPanel } from "./LeftPanel"
import { RightPanel } from "./RightPanel"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

interface WorkspaceProps {
  problem: Problem
}

export function Workspace({ problem }: WorkspaceProps) {
  const { phase } = useSessionStore()

  return (
    <div className="h-full min-h-0 w-full flex flex-col overflow-hidden bg-white dark:bg-zinc-950 transition-colors">
      <div className="h-full min-h-0 w-full grid overflow-hidden" style={{ gridTemplateColumns: "360px 1fr" }}>
        <div className="min-w-0">
          <LeftPanel problem={problem} />
        </div>
        <div className="min-w-0">
          <RightPanel problem={problem} />
        </div>
      </div>
    </div>
  )
}
