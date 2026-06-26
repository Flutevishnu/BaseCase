interface InlineErrorProps {
  message: string
  onRetry?: () => void
  retryLabel?: string
}

export function InlineError({
  message,
  onRetry,
  retryLabel = "Try again",
}: InlineErrorProps) {
  return (
    <div className="text-center py-12 px-4">
      <p className="text-sm text-red-500 dark:text-red-400">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
        >
          {retryLabel}
        </button>
      )}
    </div>
  )
}
