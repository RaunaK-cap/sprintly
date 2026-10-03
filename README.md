# ⚡ Sprintly

A modern, real-time Kanban project management tool (inspired by Trello) built with a full-stack Turborepo monorepo.

---

## Repository Structure

```
sprintly/
├── apps/
│   ├── web/               # Next.js 15 (App Router, Tailwind CSS, Base UI)
│   ├── api/               # Express.js REST API (Auth, Orgs, Boards, Cards)
│   ├── websocket/         # Real-time WebSocket server (Live comments & presence)
│   └── dockerfile/        # Production Dockerfiles (docker.api, docker.ws, docker.web)
│
├── packages/
│   ├── database/          # Prisma ORM schema & client (PostgreSQL)
│   ├── ui/                # Shared UI design components
│   ├── eslint-config/     # Shared linting configs
│   ├── tailwind-config/   # Shared Tailwind CSS presets
│   └── typescript-config/ # Shared tsconfig bases
│
├── docker-compose.yml     # Local multi-container setup (DB, API, WS, Web)
└── turbo.json             # Turborepo build pipeline
```

---

## How the Project Works

```mermaid
flowchart LR
    subgraph Frontend [Next.js Web (Port 3000)]
        UI[User UI]
    end

    subgraph Backend [Express API (Port 4000)]
        Auth[Auth & JWT]
        Org[Workspaces & Members]
        Board[Boards & Cards]
    end

    subgraph RealTime [WebSocket (Port 8080)]
        WS[Live Presence & Comments]
    end

    subgraph Data [PostgreSQL Database]
        DB[(Prisma PostgreSQL)]
    end

    UI -->|REST API / Axios| Backend
    UI <-->|WebSocket wss://| RealTime
    Backend --> DB
    RealTime --> DB
```

1. **Authentication & Workspaces (`apps/api`):**
   - Users sign up and sign in using secure JWT authentication.
   - Users create **Organizations (Workspaces)**. The creator automatically becomes the `ADMIN`.
   - Admins can invite team members and manage workspace settings.

2. **Kanban Boards & Cards:**
   - Inside an organization, teams create **Boards**.
   - Each board has 3 simple, focused Kanban columns: **TODO**, **IN_PROGRESS**, and **DONE**.
   - Cards can be moved back and forth with quick action buttons.

3. **Real-time Live Chat & Presence (`apps/websocket`):**
   - Opening an issue card connects to a real-time room `board:{id}:issue:{id}`.
   - Shows live member presence (e.g. `2 here now`).
   - Team members can chat and discuss tasks live with automatic message deduplication.

4. **Shared Database (`packages/database`):**
   - Both the API and WebSocket servers share a single Prisma schema to query PostgreSQL.

---

## Getting Started (Local Development)

### Prerequisites
- [Bun](https://bun.sh/) (v1.3+)
- [Docker](https://www.docker.com/) (for PostgreSQL database)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/RaunaK-cap/sprintly.git
cd sprintly
bun install
```

### 2. Setup Environment Variables
Create a `.env` file at the root:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secretfucks
POSTGRES_DB=sprintly

DATABASE_URL=postgresql://postgres:secretfucks@localhost:5432/sprintly
JWT_SECRET=sprintly_super_secret_jwt_key_123!
```

And in `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Start Database & Run Migrations
```bash
# Start local PostgreSQL in Docker
docker compose up -d db

# Push Prisma schema to the database
bun run db:generate
bun run db:migrate
```

### 4. Run the Whole Stack
```bash
bun run dev
```

This starts all three services in parallel:
- **Web App:** http://localhost:3000
- **REST API:** http://localhost:4000
- **WebSocket Server:** ws://localhost:8080

---

## Running Everything with Docker

You can also run the entire stack (Database + API + WebSocket + Web) with one command:

```bash
docker compose up --build
```
