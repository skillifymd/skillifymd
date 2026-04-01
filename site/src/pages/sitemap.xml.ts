import type { APIRoute } from "astro"

import { meta } from "@/site/meta"

const pages = ["/"]

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString()
  const urls = pages
    .map((path) => {
      const loc = new URL(path, meta.site).toString()
      return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`
    })
    .join("")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  })
}
