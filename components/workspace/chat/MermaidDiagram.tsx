"use client"

import React, { useEffect, useState } from "react"
import mermaid from "mermaid"
import { devError } from "@/lib/logger"
import { USER_MESSAGES } from "@/lib/messages/user-messages"

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
})

interface MermaidDiagramProps {
  code: string
  /** Wait until the assistant message finishes streaming before parsing. */
  deferRender?: boolean
}

export function MermaidDiagram({ code, deferRender = false }: MermaidDiagramProps) {
  const [hasError, setHasError] = useState(false)
  const [svgContent, setSvgContent] = useState("")

  useEffect(() => {
    if (deferRender || !code.trim()) return

    let isMounted = true

    const renderDiagram = async () => {
      try {
        setHasError(false)
        setSvgContent("")
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`
        const { svg } = await mermaid.render(id, code)
        if (isMounted) {
          setSvgContent(svg)
        }
      } catch (error) {
        devError("[mermaid]", error)
        if (isMounted) {
          setHasError(true)
        }
      }
    }

    renderDiagram()

    return () => {
      isMounted = false
    }
  }, [code, deferRender])

  if (deferRender) {
    return (
      <div className="my-2 flex justify-center py-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30">
        <span className="text-[10px] text-zinc-400 animate-pulse">Drawing diagram…</span>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="my-2 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {USER_MESSAGES.diagramUnavailable}
        </p>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-2">
            <summary className="text-[10px] text-zinc-400 cursor-pointer select-none">
              View diagram source
            </summary>
            <pre className="mt-1 text-[10px] font-mono text-zinc-500 overflow-x-auto whitespace-pre-wrap">
              {code}
            </pre>
          </details>
        )}
      </div>
    )
  }

  if (!svgContent) {
    return (
      <div className="my-2 flex justify-center py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <span className="text-[10px] text-zinc-400 animate-pulse">Rendering diagram…</span>
      </div>
    )
  }

  return (
    <div
      className="mermaid-diagram my-2 flex justify-center py-4 bg-white dark:bg-zinc-900 rounded-xl overflow-x-auto border border-zinc-200 dark:border-zinc-800"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}
