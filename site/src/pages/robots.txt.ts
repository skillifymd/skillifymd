import type { APIRoute } from "astro"

import { meta } from "@/site/meta"

export const GET: APIRoute = () => {
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", meta.site).toString()}\n`

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
