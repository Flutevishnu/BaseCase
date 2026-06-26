export const USER_MESSAGES = {
  serviceUnavailable:
    "We're having trouble connecting right now. Please try again in a moment.",
  loadProblemsFailed:
    "We couldn't load the problem library. Please try again.",
  loadProblemFailed:
    "We couldn't load this problem. Please try again or pick another one.",
  sessionFailed:
    "We couldn't start your session. Please refresh the page or try again.",
  mentorUnavailable:
    "The mentor is temporarily unavailable. Please try again.",
  reviewFailed:
    "We couldn't generate your code review. Please try again.",
  reviewEmpty:
    "Your review isn't ready yet. Please submit again.",
  genericTryAgain: "Something went wrong. Please try again.",
} as const

export async function readApiErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const json = (await response.json()) as {
      error?: { message?: string } | string
    }
    if (typeof json.error === "object" && json.error?.message) {
      return json.error.message
    }
    if (typeof json.error === "string") {
      return json.error
    }
  } catch {
    // response body wasn't JSON
  }
  return messageForHttpStatus(response.status) || fallback
}

export function messageForHttpStatus(status: number): string {
  if (status === 401) return USER_MESSAGES.genericTryAgain
  if (status === 404) return USER_MESSAGES.loadProblemFailed
  if (status >= 500) return USER_MESSAGES.serviceUnavailable
  return USER_MESSAGES.genericTryAgain
}
