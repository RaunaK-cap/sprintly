FROM oven/bun:1-slim

WORKDIR /app

COPY ./package.json ./bun.lock ./turbo.json ./
COPY ./packages ./packages
COPY ./apps/websocket ./apps/websocket

RUN bun install
RUN bun run db:generate

ENV NODE_ENV=production

WORKDIR /app/apps/websocket

EXPOSE 8080

CMD ["bun", "run", "start"]
