"use client"

import React, { useState, useEffect } from "react"
import { VisualizationData, VisualizationStep } from "@/types/mentor"
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react"

interface MatrixVisualizerProps {
  data: VisualizationData
}

export function MatrixVisualizer({ data }: MatrixVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const steps = data.steps || []
  const gridData = data.data?.grid || []
  
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

  if (!steps.length || !gridData.length) {
    return <div className="text-sm text-zinc-500">Invalid visualization data</div>
  }

  const step: VisualizationStep = steps[currentStep] || steps[0]
  
  // Defensive parsing for LLMs that stringify dicts (like Gemini)
  let highlights: any = step?.highlights || {}
  if (typeof highlights === "string") {
    try { highlights = JSON.parse(highlights.replace(/'/g, '"').replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')) } catch (e) { highlights = {} }
  }
  
  let variables: any = step?.variables || {}
  if (typeof variables === "string") {
    try { variables = JSON.parse(variables.replace(/'/g, '"').replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')) } catch (e) { variables = {} }
  }

  // Allow the step to mutate the grid state!
  const currentGridData = variables.grid || data.data?.grid || []

  const highlightLabels: Record<string, string[]> = {}
  Object.entries(highlights).forEach(([name, coords]) => {
    const key = Array.isArray(coords) ? coords.join(",") : String(coords)
    if (!highlightLabels[key]) highlightLabels[key] = []
    highlightLabels[key].push(name)
  })

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mt-4 shadow-sm">
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{data.title || "Matrix"}</h3>
        <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
          Step {currentStep + 1} / {steps.length}
        </span>
      </div>

      <div className="p-6 overflow-x-auto flex justify-center">
        <div className="flex flex-col gap-1 min-w-max">
          {currentGridData.map((row: any, rIdx: number) => {
            // Defensively ensure row is an array. If it's a string like "110", split it into chars.
            const rowArray = Array.isArray(row) ? row : typeof row === 'string' ? row.split('') : []
            return (
              <div key={rIdx} className="flex gap-1">
                {rowArray.map((val: any, cIdx: number) => {
                const key = `${rIdx},${cIdx}`
                const labels = highlightLabels[key] || []
                const isHighlighted = labels.length > 0
                const bgColor = isHighlighted 
                  ? "bg-violet-100 dark:bg-violet-900/50 border-violet-500 text-violet-700 dark:text-violet-300 z-10 scale-105"
                  : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"

                return (
                  <div key={cIdx} className="relative group">
                    {labels.length > 0 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/90 px-1 rounded shadow-sm z-20 whitespace-nowrap pointer-events-none">
                        {labels.join(", ")}
                      </div>
                    )}
                    <div className={`w-12 h-12 flex items-center justify-center border rounded font-mono text-lg transition-all duration-300 ${bgColor}`}>
                      {val}
                    </div>
                  </div>
                )
              })}
            </div>
          )})}
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

          {Object.keys(variables).length > 0 && (
            <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-mono">
              {Object.entries(variables).map(([k, v]) => (
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
