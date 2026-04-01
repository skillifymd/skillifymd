export type SessionMessageRecord = {
  info: {
    id: string
    role: "user" | "assistant" | string
  }
  parts: SessionPart[]
}

type SessionToolState = {
  status?: "completed" | "error" | string
  title?: string
  output?: string
  error?: string
}

type SessionTextPart = {
  type: "text" | "reasoning"
  text?: string
}

type SessionToolPart = {
  type: "tool"
  tool?: string
  state?: SessionToolState
}

type SessionSubtaskPart = {
  type: "subtask"
  prompt?: string
  description?: string
}

type SessionAgentPart = {
  type: "agent"
  name?: string
}

type SessionPatchPart = {
  type: "patch"
  files?: string[]
}

type SessionUnknownPart = {
  type: string
  text?: string
  tool?: string
  name?: string
  prompt?: string
  description?: string
  files?: string[]
  state?: SessionToolState
}

export type SessionPart =
  | SessionTextPart
  | SessionToolPart
  | SessionSubtaskPart
  | SessionAgentPart
  | SessionPatchPart
  | SessionUnknownPart

export type SessionMessagesClient = {
  session: {
    messages(input: { path: { id: string } }): Promise<
      | SessionMessageRecord[]
      | {
          data?: SessionMessageRecord[]
          error?: unknown
        }
    >
  }
}

export type SessionSummary = {
  userGoals: string[]
  userCorrections: string[]
  assistantActions: string[]
  recentTranscript: string[]
}
