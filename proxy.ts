import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Pages: auth.protect() redirects unsigned users to sign-in.
// APIs: auth is enforced in route handlers (requireAuth → 401 JSON), not here.
const isProtectedPage = createRouteMatcher(["/problem/(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedPage(req)) {
    await auth.protect()
  }
})
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};