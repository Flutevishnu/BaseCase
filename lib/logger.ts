const isDev = process.env.NODE_ENV === "development"

/** Log to the server/terminal in development only. */
export function devError(tag: string, ...args: unknown[]) {
  if (isDev) console.error(tag, ...args)
}

/** Log warnings in development only. */
export function devWarn(tag: string, ...args: unknown[]) {
  if (isDev) console.warn(tag, ...args)
}
