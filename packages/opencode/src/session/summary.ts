import type { SessionMessagesClient, SessionSummary, SessionMessageRecord, SessionPart } from "@/session/types.js"

function unwrapMessages(value: SessionMessageRecord[] | { data?: SessionMessageRecord[]; error?: unknown }) {
  if (Array.isArray(value)) return value
  return value.data ?? []
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function clip(value: string, max = 280) {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1)}...`
}

function summarizePart(part: SessionPart) {
  if (part.type === "text" || part.type === "reasoning") {
    return part.text ? clip(normalizeWhitespace(part.text)) : ""
  }

  if (part.type === "tool") {
    const title = part.state?.title?.trim() || part.tool || "tool"
    if (part.state?.status === "completed" && part.state.output) {
      return `${title}: ${clip(normalizeWhitespace(part.state.output))}`
    }
    if (part.state?.status === "error" && part.state.error) {
      return `${title}: ${clip(normalizeWhitespace(part.state.error))}`
    }
    return title
  }

  if (part.type === "subtask") {
    return ""
  }

  if (part.type === "patch" && Array.isArray(part.files) && part.files.length) {
    return `updated files: ${part.files.join(", ")}`
  }

  return ""
}

function extractUserCorrections(userTexts: string[]) {
  return userTexts.filter((text) => /\b(instead|actually|use|don't|do not|only|please|prefer)\b/i.test(text)).slice(-6)
}

export async function buildSessionSummary(client: SessionMessagesClient, sessionID: string): Promise<SessionSummary> {
  const result = await client.session.messages({ path: { id: sessionID } })
  const rows = unwrapMessages(result)

  const userTexts: string[] = []
  const assistantActions: string[] = []
  const recentTranscript: string[] = []

  for (const row of rows.slice(-16)) {
    const snippets = row.parts.map(summarizePart).filter(Boolean)
    const combined = clip(normalizeWhitespace(snippets.join(" ")), 500)
    if (!combined) continue

    if (row.info.role === "user") {
      userTexts.push(combined)
      recentTranscript.push(`user: ${combined}`)
      continue
    }

    assistantActions.push(combined)
    recentTranscript.push(`assistant: ${combined}`)
  }

  return {
    userGoals: userTexts.slice(-6),
    userCorrections: extractUserCorrections(userTexts),
    assistantActions: assistantActions.slice(-8),
    recentTranscript: recentTranscript.slice(-12),
  }
}
