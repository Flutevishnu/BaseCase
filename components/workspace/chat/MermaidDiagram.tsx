"use client"

import React, { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"
import { devError } from "@/lib/logger"

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
})

interface MermaidDiagramProps {
  code: string
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasError, setHasError] = useState(false)
  const [svgContent, setSvgContent] = useState<string>("")

  useEffect(() => {
    let isMounted = true

    const renderDiagram = async () => {
      try {
        setHasError(false)
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
  }, [code])

  if (hasError) {
    return (
      <div className="bg-zinc-950 p-4 rounded-xl overflow-x-auto text-sm text-zinc-300 font-mono border border-zinc-800">
        <div className="text-red-400 text-xs mb-2">Mermaid parse error. Raw code:</div>
        <pre>{code}</pre>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-diagram flex justify-center py-4 bg-white dark:bg-zinc-900 rounded-xl overflow-x-auto border border-zinc-200 dark:border-zinc-800"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}
