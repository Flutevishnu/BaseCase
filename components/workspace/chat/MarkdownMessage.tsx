"use client"

import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"

interface MarkdownMessageProps {
  content: string
}

// Compact styling tuned for the small (text-xs) chat bubbles.
const components: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  h1: ({ children }) => (
    <h1 className="text-sm font-semibold mt-3 mb-1.5 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-[13px] font-semibold mt-3 mb-1.5 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xs font-semibold mt-2.5 mb-1 first:mt-0">{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-4 mb-2 space-y-1 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-4 mb-2 space-y-1 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-violet-600 dark:text-violet-400 underline underline-offset-2"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-zinc-300 dark:border-zinc-600 pl-3 italic text-zinc-600 dark:text-zinc-400 my-2">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-3 border-zinc-200 dark:border-zinc-700" />
  ),
  code: ({ className, children }) => {
    const isBlock = (className ?? "").includes("language-")
    if (isBlock) {
      return (
        <code className="block w-full overflow-x-auto rounded-lg bg-zinc-950 text-zinc-100 p-3 my-2 text-[13px] font-mono leading-relaxed">
          {children}
        </code>
      )
    }
    return (
      <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-[13px] font-mono">
        {children}
      </code>
    )
  },
  pre: ({ children }) => <pre className="my-0">{children}</pre>,
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-[13px] border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-zinc-300 dark:border-zinc-600 px-2 py-1 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-zinc-300 dark:border-zinc-600 px-2 py-1">
      {children}
    </td>
  ),
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="break-words font-serif text-[15px] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
