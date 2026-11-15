# Deploying Sprintly on Render

Everything runs on Render except the database, which is Neon.

```text
Browser
  ├── https://app.example.com   → Render Web Service (Next.js)
  ├── https://api.example.com   → Render Web Service (Express API)
  └── wss://ws.example.com      → Render Web Service (WebSocket)
                                      │
                                      └── Neon Postgres (pooled URL)
```

## Before you deploy

1. Apply migrations to Neon once, using the **direct** URL (no `-pooler`):

   ```bash
   cd packages/database
   DATABASE_URL="postgresql://USER:PASS@ep-xxx.region.aws.neon.tech/neondb?sslmode=require" \
   bunx prisma migrate deploy
   ```

2. Keep `packages/database/.env` pointing at your local Docker database.
   Production credentials belong in Render, not in `.env` files.

## Render services

Create all three as **Web Services** from the same GitHub repo.
Use **Language: Docker** and **Branch: main**.

Leave **Root Directory** empty. The build context must be the repository root
because the monorepo needs `packages/` — so the Dockerfile Path below is relative
to the repo root.

| Setting | Web | API | WebSocket |
|---|---|---|---|
| Dockerfile Path | `apps/dockerfile/docker.web` | `apps/dockerfile/docker.api` | `apps/dockerfile/docker.ws` |
| Health Check Path | `/` | `/health` | `/health` |
| Instance Type | Starter | Starter | Starter |

Do **not** deploy the `db` service from `docker-compose.yml`. That one is only for local development.

## Environment variables

### API service

```bash
DATABASE_URL=postgresql://USER:PASS@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
JWT_SECRET=<same secret as WebSocket>
WEB_ORIGIN=https://app.example.com
```

### WebSocket service

```bash
DATABASE_URL=postgresql://USER:PASS@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
JWT_SECRET=<same secret as API>
```

### Web service

```bash
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_WS_URL=wss://ws.example.com
```

`NEXT_PUBLIC_*` values are baked into the browser bundle at build time.
Render passes service env vars to Docker builds automatically, so set them
**before** the first deploy. Changing them later requires a redeploy.

## Custom domains

Add these in each Render service → Settings → Custom Domains:

- Web: `app.yourdomain.com`
- API: `api.yourdomain.com`
- WebSocket: `ws.yourdomain.com`

Render provisions TLS automatically. The browser must use `wss://` for the
WebSocket URL once TLS is active.

## Deploy order

1. API
2. WebSocket
3. Web

The web image needs the API and WebSocket URLs at build time. If you deploy it
before the other domains exist, use their temporary `onrender.com` URLs, then
update the env vars and redeploy once the custom domains are live.

## Notes

- **WebSocket must be Starter or higher.** Free instances spin down and drop sockets.
- **API and Web can be Free** to save credit, but they cold-start after 15 minutes idle.
  All-Starter is about $21/month; your $50 credit covers roughly 2.4 months.
- Migrations run manually, once, against the Neon direct URL. Never run them from
  the WebSocket service.
- The API accepts browser requests only from `WEB_ORIGIN`. Set it to the exact
  web origin, including `https://` and no trailing slash.
- `prisma generate` runs inside each Docker image at build time. It is offline
  codegen and does not touch the database.
