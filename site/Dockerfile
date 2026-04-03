FROM oven/bun:latest AS build
WORKDIR /app

ENV NODE_ENV=production
ENV ASTRO_TELEMETRY_DISABLED=1

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY astro.config.ts tsconfig.json ./
COPY public ./public
COPY src ./src
RUN bun run build

FROM oven/bun:latest AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --chown=bun:bun --from=build /app/dist ./dist
COPY --chown=bun:bun server.mjs ./server.mjs

USER bun
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD ["bun", "-e", "const port = process.env.PORT ?? '3000'; const response = await fetch(`http://127.0.0.1:${port}/`); if (!response.ok) process.exit(1)"]
CMD ["bun", "run", "server.mjs"]
