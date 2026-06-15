// components/providers/ThemeProvider.tsx
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="basecase-theme"
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  )
}