const distDir = new URL("./dist/", import.meta.url)

const port = Number(process.env.PORT ?? 3000)
const hostname = process.env.HOST ?? "0.0.0.0"

function safePathname(pathname) {
  const decoded = decodeURIComponent(pathname)
  const normalized = decoded.replace(/^\/+/, "")

  if (normalized.includes("\0") || normalized.split("/").includes("..")) {
    return null
  }

  return normalized
}

async function getFile(pathname) {
  const safePath = safePathname(pathname)
  if (safePath === null) {
    return null
  }

  const candidates = pathname.endsWith("/")
    ? [safePath ? `${safePath}/index.html` : "index.html"]
    : [safePath, safePath ? `${safePath}/index.html` : "index.html", safePath ? `${safePath}.html` : "index.html"]

  for (const candidate of candidates) {
    const file = Bun.file(new URL(candidate, distDir))

    if (await file.exists()) {
      return file
    }
  }

  return null
}

const notFoundFile = Bun.file(new URL("404.html", distDir))

const server = Bun.serve({
  hostname,
  port,
  async fetch(request) {
    const { pathname } = new URL(request.url)
    const file = await getFile(pathname)

    if (file) {
      return new Response(file)
    }

    if (await notFoundFile.exists()) {
      return new Response(notFoundFile, { status: 404 })
    }

    return new Response("Not Found", { status: 404 })
  },
})

console.log(`Serving dist from ${server.url}`)
