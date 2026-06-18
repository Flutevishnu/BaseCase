"use client"

import React, { useState, useEffect } from "react"
import { VisualizationData, VisualizationStep } from "@/types/mentor"
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react"

interface HashmapVisualizerProps {
  data: VisualizationData
}

export function HashmapVisualizer({ data }: HashmapVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const steps = data.steps || []
  const mapData = data.data?.map || {}
  
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

  if (!steps.length) {
    return <div className="text-sm text-zinc-500">Invalid visualization data</div>
  }

  const step: VisualizationStep = steps[currentStep] || steps[0]
  const highlights = step?.highlights || {}
  const variables = step?.variables || {}
  
  // Use the map from the current step's variables if available, otherwise initial
  let currentMapData = data.data?.map || {}
  if (variables.map) {
    if (typeof variables.map === "string") {
      try {
        // LLMs sometimes output python dict strings e.g. "{'2': 0}" or "{2: 0}"
        // Replace single quotes with double quotes to make it valid JSON
        const sanitizedStr = variables.map
          .replace(/'/g, '"')
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3') // Add quotes to unquoted keys
        currentMapData = JSON.parse(sanitizedStr)
      } catch (e) {
        console.warn("Failed to parse stringified map data:", variables.map)
      }
    } else if (typeof variables.map === "object") {
      currentMapData = variables.map
    }
  }

  const highlightLabels: Record<string, string[]> = {}
  Object.entries(highlights).forEach(([name, key]) => {
    const mapKey = String(key)
    if (!highlightLabels[mapKey]) highlightLabels[mapKey] = []
    highlightLabels[mapKey].push(name)
  })

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mt-4 shadow-sm">
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{data.title || "Hashmap"}</h3>
        <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
          Step {currentStep + 1} / {steps.length}
        </span>
      </div>

      <div className="p-6 overflow-x-auto flex justify-center">
        <div className="min-w-[200px] border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
          <table className="w-full text-left text-sm font-mono">
            <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 font-medium">Key</th>
                <th className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 font-medium border-l">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(currentMapData).map(([k, v], idx) => {
                const labels = highlightLabels[k] || []
                const isHighlighted = labels.length > 0
                const rowClass = isHighlighted
                  ? "bg-violet-50 dark:bg-violet-900/20"
                  : "bg-white dark:bg-zinc-950"
                  
                return (
                  <tr key={idx} className={`${rowClass} transition-colors duration-300 relative`}>
                    <td className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span>{String(k)}</span>
                        {labels.length > 0 && (
                          <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/50 px-1 rounded uppercase tracking-wider">
                            {labels.join(", ")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 border-l border-zinc-200 dark:border-zinc-800">
                      {String(v)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
