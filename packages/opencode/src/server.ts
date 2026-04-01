import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import { buildSkillifyPrompt } from "@/skill/prompt.js"
import { saveGeneratedSkill } from "@/skill/save.js"
import { slugifySkillName } from "@/skill/util.js"
import { buildSessionSummary } from "@/session/summary.js"

type CommandOutputTextPart = {
  type: "text"
  text: string
}

type CommandExecuteOutput = {
  parts: CommandOutputTextPart[]
}

const skillifyCommandDescription = "Turn the current session into a reusable OpenCode skill"

const skillifyCommandTemplate = `Run the skillify workflow for this session.

If the user supplied arguments, treat them as an initial hint only:
$ARGUMENTS
`

export const SkillifyPlugin: Plugin = async ({ client, directory, worktree }) => {
  await client.app.log({
    body: {
      service: "@skillifymd/opencode",
      level: "info",
      message: "Plugin initialized",
      extra: { directory, worktree },
    },
  })

  return {
    config: async (input) => {
      input.command ??= {}
      if (input.command.skillify) return

      input.command.skillify = {
        description: skillifyCommandDescription,
        template: skillifyCommandTemplate,
      }
    },
    tool: {
      skillify_save: tool({
        description: "Save a generated OpenCode skill and matching slash command",
        args: {
          name: tool.schema.string().describe("Lowercase hyphenated skill name"),
          description: tool.schema.string().describe("Short skill description"),
          body: tool.schema.string().describe("Skill markdown body without YAML frontmatter"),
        },
        async execute(args, context) {
          const saved = await saveGeneratedSkill({
            worktree: context.worktree,
            name: args.name,
            description: args.description,
            body: args.body,
          })

          context.metadata({
            title: `Saved ${saved.name}`,
            metadata: {
              skillPath: saved.skillPath,
              commandPath: saved.commandPath,
            },
          })

          return [
            `Saved skill ${saved.name}.`,
            `Skill: ${saved.skillPath}`,
            `Command: ${saved.commandPath}`,
            `Run it with /${saved.name}`,
          ].join("\n")
        },
      }),
    },
    "command.execute.before": async (input, output) => {
      if (input.command !== "skillify") return

      const sessionSummary = await buildSessionSummary(client, input.sessionID)
      const prompt = buildSkillifyPrompt({
        commandArguments: input.arguments,
        sessionSummary,
        directory,
        worktree,
      })

      const commandOutput = output as CommandExecuteOutput

      commandOutput.parts.unshift({
        type: "text",
        text: prompt,
      })

      await client.app.log({
        body: {
          service: "@skillifymd/opencode",
          level: "info",
          message: "Injected skillify prompt",
          extra: {
            sessionID: input.sessionID,
            command: input.command,
            hintedName: slugifySkillName(input.arguments),
          },
        },
      })
    },
  }
}

export default {
  id: "@skillifymd/opencode",
  server: SkillifyPlugin,
}
