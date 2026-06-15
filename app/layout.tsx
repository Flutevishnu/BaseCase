import type { Metadata } from "next"
import Link from "next/link"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "BaseCase — Learn DSA the way interviewers think",
  description: "A Socratic DSA mentor that guides you from approach to implementation.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <ThemeProvider>
          <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors">
            <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-8 py-4 transition-colors">
              <div className="flex items-center justify-between w-full">
                <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  Base<span className="text-violet-600">Case</span>
                </Link>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    Learn DSA the way interviewers think.
                  </span>
                  <ThemeToggle />
                </div>
              </div>
            </header>

            <main className="flex-1 flex min-h-0 w-full">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
