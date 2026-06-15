export function LockedOverlay() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-950 select-none transition-colors">
      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm transition-colors">
        <svg
          className="w-6 h-6 text-zinc-400 dark:text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Editor locked</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-[180px] leading-relaxed">
          Discuss your approach with BaseCase to unlock coding.
        </p>
      </div>
      <div className="flex items-center gap-2 mt-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
