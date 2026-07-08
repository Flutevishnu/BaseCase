import { auth } from "@clerk/nextjs/server"

export const BACKEND_API_URL = process.env.BACKEND_API_URL

export async function getBackendAuthHeaders(): Promise<HeadersInit> {
  const { getToken } = await auth()
  const token = await getToken()

  const headers: Record<string, string> = {
    Accept: "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export async function backendFetch(
  path: string,
  init?: RequestInit & { searchParams?: Record<string, string | undefined> }
): Promise<Response> {
  const { searchParams, ...fetchInit } = init ?? {}
  const url = new URL(`/api/v1${path}`, BACKEND_API_URL)

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value)
      }
    }
  }

  const authHeaders = await getBackendAuthHeaders()

  return fetch(url.toString(), {
    ...fetchInit,
    headers: {
      ...authHeaders,
      ...(fetchInit.headers ?? {}),
    },
    cache: "no-store",
  })
}
