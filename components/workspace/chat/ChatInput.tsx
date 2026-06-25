"use client"

import { useState, useRef, KeyboardEvent } from "react"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  disabled?: boolean
}

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || isLoading || disabled) return
    onSend(trimmed)
    setValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  return (
    <div className="border-t border-zinc-100 dark:border-zinc-800 px-3 py-2.5 bg-white dark:bg-zinc-900 transition-colors">
      <div className="flex items-end gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 focus-within:border-violet-300 dark:focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 dark:focus-within:ring-violet-900 transition-all">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={disabled ? "Complete ideation phase first..." : "Reply to BaseCase... (Enter to send)"}
          disabled={disabled || isLoading}
          rows={1}
          className="flex-1 text-xs bg-transparent outline-none resize-none text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 leading-relaxed disabled:opacity-50"
          style={{ minHeight: "20px", maxHeight: "120px" }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || isLoading || disabled}
          className="w-7 h-7 rounded-lg bg-violet-600 dark:bg-violet-600 flex items-center justify-center flex-shrink-0 hover:bg-violet-700 dark:hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 mb-0.5"
          aria-label="Send message"
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <p className="text-[10px] text-zinc-400 mt-1.5 px-1">
        Shift + Enter for new line
      </p>
    </div>
  )
}
