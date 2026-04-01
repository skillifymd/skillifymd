import type { SessionSummary } from "@/session/types.js"

type BuildPromptInput = {
  commandArguments: string
  sessionSummary: SessionSummary
  directory: string
  worktree: string
}

function bullets(items: string[]) {
  if (items.length === 0) return "- none"
  return items.map((item) => `- ${item}`).join("\n")
}

export function buildSkillifyPrompt(input: BuildPromptInput) {
  return `# Skillify Workflow

You are running the custom \/skillify command inside OpenCode.

Your job is to turn the current session into a reusable OpenCode skill and matching slash command.

## Requirements

- Target OpenCode only.
- Save skills in \.opencode/skills/<name>/SKILL.md.
- Save a matching wrapper command in \.opencode/commands/<name>.md.
- Do not write files directly with built-in edit or write tools.
- After the user confirms the draft, call the custom tool \`skillify_save\`.
- The skill name must be lowercase hyphenated and match ^[a-z0-9]+(-[a-z0-9]+)*$.

## Current Command Arguments

${input.commandArguments.trim() || "(none provided)"}

## Session Context

Working directory: \`${input.directory}\`
Worktree root: \`${input.worktree}\`

Recent user goals:
${bullets(input.sessionSummary.userGoals)}

Recent user corrections/preferences:
${bullets(input.sessionSummary.userCorrections)}

Recent assistant actions:
${bullets(input.sessionSummary.assistantActions)}

Recent transcript excerpt:
${bullets(input.sessionSummary.recentTranscript)}

## What To Do

1. Infer the repeatable workflow from the session and from the command arguments.
2. Ask concise follow-up questions until the workflow is stable.
3. Produce a proposed skill with:
   - a name
   - a short description
   - a markdown body with these sections when relevant:
     - ## What I do
     - ## When to use me
     - ## Inputs
     - ## Goal
     - ## Steps
     - ## Rules
     - ## Trigger phrases
4. Show the full proposed SKILL.md body preview before saving.
5. Ask for explicit confirmation.
6. Only after confirmation, call \`skillify_save\` with:
   - \`name\`
   - \`description\`
   - \`body\`

## Save Tool Contract

The \`skillify_save\` tool will generate both files for you:

- \.opencode/skills/<name>/SKILL.md
- \.opencode/commands/<name>.md

Do not include YAML frontmatter in the \`body\` argument. Pass only the markdown body.

## Output Style

- Keep the interview direct and short.
- Prefer the smallest skill that still captures the reusable workflow.
- If the session does not yet describe a stable workflow, say so and ask the user for the missing details.
- After saving, tell the user which command to run, for example \`/${"<name>"}\`.
`
}
