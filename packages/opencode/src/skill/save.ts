import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { renderCommandMarkdown } from "@/skill/command.js"
import { renderSkillMarkdown } from "@/skill/skill.js"
export { normalizeSkillBody, slugifySkillName, validateSkillName } from "@/skill/util.js"
import { slugifySkillName, validateSkillName } from "@/skill/util.js"

type SaveGeneratedSkillInput = {
  worktree: string
  name: string
  description: string
  body: string
}

export async function saveGeneratedSkill(input: SaveGeneratedSkillInput) {
  const name = slugifySkillName(input.name)
  validateSkillName(name)

  const skillDir = path.join(input.worktree, ".opencode", "skills", name)
  const commandDir = path.join(input.worktree, ".opencode", "commands")
  const skillPath = path.join(skillDir, "SKILL.md")
  const commandPath = path.join(commandDir, `${name}.md`)

  await mkdir(skillDir, { recursive: true })
  await mkdir(commandDir, { recursive: true })

  const skillMarkdown = renderSkillMarkdown({
    name,
    description: input.description,
    body: input.body,
  })

  const commandMarkdown = renderCommandMarkdown({
    name,
    description: `Run the ${name} skill`,
  })

  await writeFile(skillPath, skillMarkdown, "utf8")
  await writeFile(commandPath, commandMarkdown, "utf8")

  return {
    name,
    skillPath,
    commandPath,
  }
}
