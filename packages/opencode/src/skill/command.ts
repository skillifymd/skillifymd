import { yamlString } from "@/skill/util.js"

type RenderCommandInput = {
  name: string
  description: string
}

export function renderCommandMarkdown(input: RenderCommandInput) {
  const commandDescription = input.description.trim() || `Run the ${input.name} skill`

  return [
    "---",
    `description: ${yamlString(commandDescription)}`,
    "---",
    "Load the skill named `" + input.name + "` with the skill tool and follow it for this request.",
    "",
    "If the user supplied command arguments, treat them as additional context:",
    "$ARGUMENTS",
    "",
  ].join("\n")
}
