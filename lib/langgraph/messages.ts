import { MentorMessage, VisualizationData } from "@/types"

type LangGraphMessage = {
  type?: string
  id?: string
  content?: string | Array<{ type?: string; text?: string }>
  tool_calls?: Array<{ name: string; args: Record<string, unknown> }>
}

const INTERNAL_SUBMIT_PATTERN =
  /^Here is my latest code submission/i

function extractTextContent(content: LangGraphMessage["content"]): string {
  if (typeof content === "string") return content
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("")
  }
  return ""
}

function extractVisualization(
  message: LangGraphMessage
): VisualizationData | undefined {
  const vizCall = message.tool_calls?.find((t) => t.name === "GenerateVisualization")
  if (!vizCall?.args) return undefined
  return vizCall.args as unknown as VisualizationData
}

function isHumanType(type: string | undefined): boolean {
  return type === "human" || type === "HumanMessage" || type === "humanmessage"
}

function isAiType(type: string | undefined): boolean {
  return (
    type === "ai" ||
    type === "AIMessage" ||
    type === "AIMessageChunk" ||
    type?.startsWith("AIMessage") === true
  )
}

function isSystemType(type: string | undefined): boolean {
  return type === "system" || type === "SystemMessage"
}

function shouldSkipMessage(type: string | undefined, content: string): boolean {
  if (isSystemType(type)) return true
  if (INTERNAL_SUBMIT_PATTERN.test(content.trim())) return true
  return false
}

function stripCodeAppendix(content: string): string {
  const marker = "\n\n[Latest code of user]:"
  const index = content.indexOf(marker)
  if (index === -1) return content
  return content.slice(0, index).trim()
}

export function mapLangGraphMessages(raw: unknown[]): MentorMessage[] {
  const result: MentorMessage[] = []

  for (const item of raw) {
    const message = item as LangGraphMessage
    const type = message.type
    let content = extractTextContent(message.content)

    if (shouldSkipMessage(type, content)) continue

    if (isHumanType(type)) {
      content = stripCodeAppendix(content)
      if (!content.trim()) continue
      result.push({ role: "user", content })
      continue
    }

    if (isAiType(type)) {
      const visualization = extractVisualization(message)
      if (!content.trim() && !visualization) continue
      result.push({
        role: "assistant",
        content,
        ...(visualization ? { visualization } : {}),
      })
    }
  }

  return result
}
