import { fileURLToPath } from "node:url"
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://skillify.md",
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
})
