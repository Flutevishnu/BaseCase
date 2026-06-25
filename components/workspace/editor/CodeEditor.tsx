"use client"

import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { useSessionStore } from "@/stores/sessionStore"
import { useEffect, useState } from "react"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

interface CodeEditorProps {
  onSubmit: () => void
  isLoading: boolean
  isReviewing: boolean
}

const DEFAULT_CODE = `from typing import List

class Solution:
    def solve(self, nums: List[int], target: int) -> List[int]:
        # Your solution here
        pass
`

export function CodeEditor({ onSubmit, isLoading, isReviewing }: CodeEditorProps) {
  const { code, setCode } = useSessionStore()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const monacoTheme = theme === "dark" ? "vs-dark" : "vs"

  const handleMount = (editor: any, monaco: any) => {
    // Define custom light theme with visible cursor
    monaco.editor.defineTheme("vs-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editorCursor.foreground": "#000000",
        "editorCursor.background": "#ffffff",
      },
    })

    // Define custom dark theme with visible cursor
    monaco.editor.defineTheme("vs-dark-custom", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editorCursor.foreground": "#d1d5db",
      },
    })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {mounted && (
        <>
          <MonacoEditor
            height="100%"
            defaultLanguage="python"
            value={code || DEFAULT_CODE}
            onChange={(val) => setCode(val ?? "")}
            theme={theme === "dark" ? "vs-dark" : "vs"}
            onMount={handleMount}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              tabSize: 4,
              wordWrap: "on",
              padding: { top: 16, bottom: 16 },
              renderLineHighlight: "gutter",
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: false,
              cursorStyle: "line",
              cursorBlinking: "blink",
              cursorSmoothCaretAnimation: "on",
              scrollbar: {
                vertical: "hidden",
                horizontal: "hidden",
              },
            }}
          />

          <div className="px-4 py-3 border-t border-zinc-600 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Python 3
            </div>
            <button
              onClick={onSubmit}
              disabled={isLoading || !code?.trim()}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {isReviewing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Reviewing...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit for Review
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
