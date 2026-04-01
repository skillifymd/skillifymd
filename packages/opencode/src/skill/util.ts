const skillNamePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function slugifySkillName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
}

export function validateSkillName(name: string) {
  if (!skillNamePattern.test(name)) {
    throw new Error(
      "Skill name must match ^[a-z0-9]+(-[a-z0-9]+)*$ and the containing directory name.",
    )
  }

  if (name.length < 1 || name.length > 64) {
    throw new Error("Skill name must be between 1 and 64 characters.")
  }
}

export function normalizeSkillBody(body: string) {
  const normalized = body.replace(/\r\n/g, "\n").trim()
  const withoutFrontmatter = normalized.startsWith("---")
    ? normalized.replace(/^---\n[\s\S]*?\n---(?:\n)*/u, "")
    : normalized

  return withoutFrontmatter.trim()
}

export function yamlString(value: string) {
  return JSON.stringify(value)
}
