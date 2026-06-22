import Link from "next/link"
import { HeaderAuth } from "@/components/layout/HeaderAuth"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

export function Header() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-8 py-4 transition-colors">
      <div className="flex items-center justify-between w-full">
        <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Base<span className="text-violet-600">Case</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-xs text-zinc-400 dark:text-zinc-500">
            Learn DSA the way interviewers think.
          </span>
          <HeaderAuth />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
