import { Phase } from "@/types/mentor"

interface PhaseBadgeProps {
  label: string
  phase: Phase
  currentPhase: Phase
}

const phaseOrder: Phase[] = ["IDEATION", "CODING", "REVIEW"]

export function PhaseBadge({ label, phase, currentPhase }: PhaseBadgeProps) {
  const currentIndex = phaseOrder.indexOf(currentPhase)
  const thisIndex = phaseOrder.indexOf(phase)

  const isDone = thisIndex < currentIndex
  const isActive = phase === currentPhase

  return (
    <div
      className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all ${
        isActive
          ? "bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800 font-medium"
          : isDone
          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
          : "bg-transparent text-zinc-400 dark:text-zinc-600 border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {isDone && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
      )}
      {label}
    </div>
  )
}
