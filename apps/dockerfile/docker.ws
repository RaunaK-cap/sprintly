FROM oven/bun:1-slim AS base
WORKDIR /app

COPY ./packages ./packages
COPY ./bun.lock ./bun.lock

COPY ./package.json ./package.json
COPY ./turbo.json ./turbo.json

COPY ./apps/websocket  ./apps/websocket

RUN bun install 

WORKDIR  /app/apps/websocket

EXPOSE 8080
CMD ["bun", "run", "index.ts"]


