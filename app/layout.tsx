import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Inter, Newsreader, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/Header"
import { ThemeProvider } from "@/components/providers/ThemeProvider"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
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
      <body className={`${inter.variable} ${newsreader.variable} ${geistMono.variable} font-sans antialiased min-h-screen`}>
        <ClerkProvider>
          <ThemeProvider>
            <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors">
              <Header />
              <main className="flex-1 flex min-h-0 w-full">{children}</main>
            </div>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
