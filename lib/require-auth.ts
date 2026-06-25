import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

type AuthResult =
  | { userId: string; unauthorized: null }
  | { userId: null; unauthorized: NextResponse }

export async function requireAuth(): Promise<AuthResult> {
  const { userId } = await auth()

  if (!userId) {
    return {
      userId: null,
      unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  return { userId, unauthorized: null }
}
