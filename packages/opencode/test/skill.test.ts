import { describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { SkillifyPlugin } from "@/server.js"
import { renderCommandMarkdown } from "@/skill/command.js"
import { renderSkillMarkdown } from "@/skill/skill.js"
import { normalizeSkillBody, saveGeneratedSkill, slugifySkillName } from "@/skill/save.js"
import { buildSessionSummary } from "@/session/summary.js"

describe("slugifySkillName", () => {
  test("normalizes arbitrary input", () => {
    expect(slugifySkillName(" Review And Fix Tests ")).toBe("review-and-fix-tests")
  })
})

describe("normalizeSkillBody", () => {
  test("removes frontmatter when present", () => {
    expect(normalizeSkillBody("---\nname: x\n---\n\n## Steps\n- one")).toBe("## Steps\n- one")
  })

  test("removes frontmatter with CRLF newlines", () => {
    expect(normalizeSkillBody("---\r\nname: x\r\n---\r\n\r\n## Steps\r\n- one")).toBe(
      "## Steps\n- one",
    )
  })
})

describe("renderSkillMarkdown", () => {
  test("renders opencode skill frontmatter", () => {
    const markdown = renderSkillMarkdown({
      name: "review-tests",
      description: "Review and fix tests",
      body: "## What I do\n- review tests",
    })

    expect(markdown).toContain('name: "review-tests"')
    expect(markdown).toContain('compatibility: "opencode"')
    expect(markdown).toContain("## What I do")
  })
})

describe("renderCommandMarkdown", () => {
  test("renders wrapper command", () => {
    const markdown = renderCommandMarkdown({
      name: "review-tests",
      description: "Run the review-tests skill",
    })

    expect(markdown).toContain('description: "Run the review-tests skill"')
    expect(markdown).toContain("Load the skill named `review-tests`")
    expect(markdown).toContain("$ARGUMENTS")
  })
})

describe("SkillifyPlugin config", () => {
  test("registers the /skillify command without overriding user config", async () => {
    const hooks = await SkillifyPlugin({
      client: {
        app: {
          log: async () => {},
        },
      } as any,
      project: {} as any,
      directory: "/tmp/project",
      worktree: "/tmp/project",
      serverUrl: new URL("http://localhost:4096"),
      $: {} as any,
    })

    const injectedConfig = { command: {} as Record<string, { description: string; template: string }> }
    await hooks.config?.(injectedConfig as any)

    expect(injectedConfig.command.skillify?.description).toBe(
      "Turn the current session into a reusable OpenCode skill",
    )
    expect(injectedConfig.command.skillify?.template).toContain("$ARGUMENTS")

    const existingConfig = {
      command: {
        skillify: {
          description: "Custom skillify",
          template: "Keep my existing command",
        },
      },
    }

    await hooks.config?.(existingConfig as any)

    expect(existingConfig.command.skillify.description).toBe("Custom skillify")
    expect(existingConfig.command.skillify.template).toBe("Keep my existing command")
  })
})

describe("buildSessionSummary", () => {
  test("omits internal orchestration details from assistant context", async () => {
    const summary = await buildSessionSummary(
      {
        session: {
          messages: async () => ({
            data: [
              {
                info: { id: "1", role: "user" },
                parts: [{ type: "text", text: "Please clean this up, but do not expose internals." }],
              },
              {
                info: { id: "2", role: "assistant" },
                parts: [
                  { type: "agent", name: "review" },
                  { type: "subtask", description: "inspect repository" },
                  { type: "patch", files: ["src/server.ts", "src/transcript.ts"] },
                  {
                    type: "tool",
                    tool: "skillify_save",
                    state: { status: "completed", title: "Saved skill", output: "Saved skill cleanup." },
                  },
                ],
              },
            ],
          }),
        },
      },
      "session-1",
    )

    expect(summary.assistantActions).toHaveLength(1)
    expect(summary.assistantActions[0]).toContain("updated files: src/server.ts, src/transcript.ts")
    expect(summary.assistantActions[0]).toContain("Saved skill: Saved skill cleanup.")
    expect(summary.assistantActions[0]).not.toContain("agent:")
    expect(summary.assistantActions[0]).not.toContain("inspect repository")
  })
})

describe("saveGeneratedSkill", () => {
  test("writes normalized skill and wrapper command", async () => {
    const worktree = await mkdtemp(path.join(tmpdir(), "opencode-skillify-"))

    try {
      const saved = await saveGeneratedSkill({
        worktree,
        name: " Review Tests ",
        description: " Review and fix tests ",
        body: "---\r\nname: ignored\r\n---\r\n\r\n## Steps\r\n- review",
      })

      const skillMarkdown = await readFile(saved.skillPath, "utf8")
      const commandMarkdown = await readFile(saved.commandPath, "utf8")

      expect(saved.name).toBe("review-tests")
      expect(skillMarkdown).toContain('name: "review-tests"')
      expect(skillMarkdown).toContain("## Steps\n- review")
      expect(skillMarkdown).not.toContain("name: ignored")
      expect(commandMarkdown).toContain("Load the skill named `review-tests`")
    } finally {
      await rm(worktree, { recursive: true, force: true })
    }
  })
})
