"use client"

import { useEffect, useRef } from "react"
import { MentorMessage } from "@/types"
import { MermaidDiagram } from "./MermaidDiagram"
import { MarkdownMessage } from "./MarkdownMessage"
import { Visualization } from "../visualizers"

interface ChatThreadProps {
  messages: MentorMessage[]
  isLoading: boolean
}

export function ChatThread({ messages, isLoading }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
        <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-800 flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Ready when you are</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            Start by telling BaseCase how you&apos;d approach this problem.
          </p>
        </div>
      </div>
    )
  }

  // Show the bouncing dots only when waiting for the very first token
  const hasStreamingMessage = messages.some((m) => m.isStreaming)
  const showDots = isLoading && !hasStreamingMessage

  const parseContentWithMermaid = (content: string, isStreaming: boolean) => {
    const parts = []
    const regex = /```mermaid\n([\s\S]*?)```/g
    let lastIndex = 0
    let match
    let id = 0

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <MarkdownMessage key={id++} content={content.slice(lastIndex, match.index)} />
        )
      }
      parts.push(
        <MermaidDiagram
          key={id++}
          code={match[1].trim()}
          deferRender={isStreaming}
        />
      )
      lastIndex = regex.lastIndex
    }

    const remainder = content.slice(lastIndex)

    // Hide incomplete mermaid fences while the message is still streaming.
    if (isStreaming) {
      const openFence = remainder.indexOf("```mermaid")
      if (openFence !== -1) {
        const afterOpen = remainder.slice(openFence + "```mermaid".length)
        if (!afterOpen.includes("```")) {
          if (openFence > 0) {
            parts.push(
              <MarkdownMessage key={id++} content={remainder.slice(0, openFence)} />
            )
          }
          parts.push(<MermaidDiagram key={id++} code="" deferRender />)
          return parts
        }
      }
    }

    if (remainder) {
      parts.push(<MarkdownMessage key={id++} content={remainder} />)
    }

    return parts
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages
        .filter((msg) => msg.role === "user" || msg.content.trim() || msg.visualization)
        .map((msg, i) => (
          <div key={i} className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <span className="text-[10px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-1">
              {msg.role === "user" ? "You" : "BaseCase"}
            </span>
            <div
              className={`max-w-[88%] text-[13px] leading-relaxed px-3 py-2.5 rounded-xl ${msg.role === "user"
                ? "bg-violet-600 dark:bg-violet-600 text-white rounded-br-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-bl-sm border border-zinc-200 dark:border-zinc-700"
                }`}
            >
              {msg.role === "user" ? (
                <span className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed">
                  {msg.content}
                </span>
              ) : msg.content.includes("```mermaid") ? (
                parseContentWithMermaid(msg.content, Boolean(msg.isStreaming))
              ) : (
                <MarkdownMessage content={msg.content} />
              )}

              {msg.isStreaming && (
                <span className="inline-block w-0.5 h-3 bg-zinc-500 dark:bg-zinc-400 ml-0.5 align-middle animate-pulse" />
              )}

              {msg.visualization && <Visualization data={msg.visualization} />}
            </div>
          </div>
        ))}

      {/* Bouncing dots — only before the first token arrives */}
      {showDots && (
        <div className="flex flex-col gap-1 items-start">
          <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase px-1">
            BaseCase
          </span>
          <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl rounded-bl-sm px-3 py-2.5">
            <div className="flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
