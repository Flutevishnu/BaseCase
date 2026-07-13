"use client"

import React, { useState, useEffect, useRef, useLayoutEffect } from "react"
import { VisualizationData, VisualizationStep } from "@/types"
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react"

interface TreeVisualizerProps {
  data: VisualizationData
}

export function TreeVisualizer({ data }: TreeVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const steps = data.steps || []
  const initialTreeData = data.data?.root || []
  const containerRef = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<{x1:number, y1:number, x2:number, y2:number}[]>([])

  // Compute step data early so effects can use current tree structure
  const step = steps[currentStep] || steps[0]
  const highlights = step?.highlights || {}
  const variables = step?.variables || {}
  const currentTreeData: any[] = (variables.root as any[]) ?? initialTreeData
  
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, steps.length])

  // Draw lines
  useLayoutEffect(() => {
    const updateLines = () => {
      if (!containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      const newLines: {x1:number, y1:number, x2:number, y2:number}[] = []
      
      for (let i = 0; i < currentTreeData.length; i++) {
        if (currentTreeData[i] === null || currentTreeData[i] === undefined) continue
        const parentEl = containerRef.current.querySelector(`[data-idx="${i}"]`)
        
        const leftIdx = 2 * i + 1
        const rightIdx = 2 * i + 2
        
        const checkChild = (childIdx: number) => {
          if (childIdx < currentTreeData.length && currentTreeData[childIdx] !== null && currentTreeData[childIdx] !== undefined) {
             const childEl = containerRef.current!.querySelector(`[data-idx="${childIdx}"]`)
             if (parentEl && childEl) {
               const pRect = parentEl.getBoundingClientRect()
               const cRect = childEl.getBoundingClientRect()
               newLines.push({
                 x1: pRect.left + pRect.width / 2 - containerRect.left,
                 y1: pRect.bottom - containerRect.top,
                 x2: cRect.left + cRect.width / 2 - containerRect.left,
                 y2: cRect.top - containerRect.top
               })
             }
          }
        }
        checkChild(leftIdx)
        checkChild(rightIdx)
      }
      setLines(newLines)
    }

    // Small delay to ensure DOM is laid out
    const id = setTimeout(updateLines, 50)
    window.addEventListener("resize", updateLines)
    return () => {
      clearTimeout(id)
      window.removeEventListener("resize", updateLines)
    }
  }, [currentTreeData, currentStep]) // Re-run when step changes in case node sizes change due to highlights

  if (!steps.length || !initialTreeData.length) {
    return <div className="text-sm text-zinc-500">Invalid visualization data</div>
  }

  const highlightLabels: Record<number, string[]> = {}
  Object.entries(highlights).forEach(([name, index]) => {
    if (!highlightLabels[index]) highlightLabels[index] = []
    highlightLabels[index].push(name)
  })

  const renderNode = (idx: number) => {
    if (idx >= currentTreeData.length || currentTreeData[idx] === null || currentTreeData[idx] === undefined) {
      return <div className="w-10 h-10 opacity-0 m-2"></div>
    }

    const val = currentTreeData[idx]
    const labels = highlightLabels[idx] || []
    const isHighlighted = labels.length > 0
    const bgColor = isHighlighted 
      ? "bg-violet-100 dark:bg-violet-900/50 border-violet-500 text-violet-700 dark:text-violet-300"
      : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"

    const leftIdx = 2 * idx + 1
    const rightIdx = 2 * idx + 2
    const hasChildren = (leftIdx < currentTreeData.length && currentTreeData[leftIdx] !== null) || 
                        (rightIdx < currentTreeData.length && currentTreeData[rightIdx] !== null)

    return (
      <div key={idx} className="flex flex-col items-center mx-1 sm:mx-2">
        <div className="flex flex-col items-center gap-1 z-10">
          <div className="h-5 flex items-end justify-center">
            {labels.length > 0 && (
              <div className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-1.5 py-0.5 rounded whitespace-nowrap">
                {labels.join(", ")}
              </div>
            )}
          </div>
          <div data-idx={idx} className={`w-10 h-10 flex items-center justify-center border-2 rounded-full font-mono text-base transition-colors duration-300 ${bgColor}`}>
            {val}
          </div>
        </div>
        {hasChildren && (
          <div className="flex mt-8 justify-center min-w-full gap-2">
            {renderNode(leftIdx)}
            {renderNode(rightIdx)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mt-4 shadow-sm">
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{data.title || "Binary Tree"}</h3>
        <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
          Step {currentStep + 1} / {steps.length}
        </span>
      </div>

      <div className="p-6 overflow-x-auto relative min-h-[200px]" ref={containerRef}>
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          {lines.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="currentColor" className="text-zinc-300 dark:text-zinc-700" strokeWidth="2" />
          ))}
        </svg>
        <div className="flex justify-center min-w-max pb-4">
          {renderNode(0)}
        </div>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
        <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-4 h-10 flex items-center">
          {step?.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setIsPlaying(false); setCurrentStep(0) }}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-xs font-medium"
              disabled={currentStep === 0}
            >
              Reset
            </button>
            <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
            <button 
              onClick={() => { setIsPlaying(false); setCurrentStep(Math.max(0, currentStep - 1)) }}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50"
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => { setIsPlaying(false); setCurrentStep(Math.min(steps.length - 1, currentStep + 1)) }}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50"
              disabled={currentStep === steps.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {Object.keys(variables).filter(k => k !== "root").length > 0 && (
            <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-mono">
              {Object.entries(variables).filter(([k]) => k !== "root").map(([k, v]) => (
                <div key={k} className="flex gap-1.5">
                  <span className="text-zinc-500">{k}:</span>
                  <span className="text-violet-600 dark:text-violet-400 font-semibold">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
