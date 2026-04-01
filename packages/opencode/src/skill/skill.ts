import { normalizeSkillBody, validateSkillName, yamlString } from "@/skill/util.js"

type RenderSkillInput = {
  name: string
  description: string
  body: string
}

export function renderSkillMarkdown(input: RenderSkillInput) {
  validateSkillName(input.name)

  const body = normalizeSkillBody(input.body)
  const description = input.description.trim()

  return [
    "---",
    `name: ${yamlString(input.name)}`,
    `description: ${yamlString(description)}`,
    'compatibility: "opencode"',
    "metadata:",
    '  generated-by: "@skillifymd/opencode"',
    `  wrapper-command: ${yamlString(input.name)}`,
    "---",
    "",
    body,
    "",
  ].join("\n")
}
