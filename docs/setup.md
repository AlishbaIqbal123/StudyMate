# StudyMate — Setup Guide

> **Author:** Alishba Iqbal | **Last Updated:** Draft v1  
> Get the full stack running locally in under 15 minutes.

---

## Prerequisites

Before you start, make sure the following are installed on your machine:

| Tool | Minimum Version | Check Command | Install |
|---|---|---|---|
| Node.js | 20 LTS | `node -v` | [nodejs.org](https://nodejs.org) |
| npm | 10+ | `npm -v` | Ships with Node |
| Git | 2.x | `git --version` | [git-scm.com](https://git-scm.com) |
| cloudflared | latest | `cloudflared --version` | [Cloudflare Tunnel docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) |

> **No Docker. No cloud accounts. No paid services required.**

---

## 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/studymate-alexa.git
cd studymate-alexa
```

---

## 2. Install Dependencies

StudyMate uses **npm workspaces** (a lightweight monorepo). One command installs all packages across all apps and shared packages:

```bash
npm install
```

This installs:
- `apps/mcp-server/` dependencies (MCP SDK, better-sqlite3, Zod, etc.)
- `apps/web/` dependencies (React, Vite, Tailwind CSS, etc.)
- `packages/database/` and `packages/types/` dependencies

---

## 3. Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set:

```dotenv
# ── MCP Server ─────────────────────────────────────────────
PORT=3000                          # Port the MCP server listens on

# ── Database ───────────────────────────────────────────────
DATABASE_PATH=./studymate.db       # Path to the SQLite database file

# ── Single-student MVP ─────────────────────────────────────
DEFAULT_STUDENT_ID=1               # Hardcoded student ID for v1

# ── Alexa+ (fill in after CLI setup in Step 6) ─────────────
ALEXA_CLIENT_ID=                   # From: alexa-ai configure
ALEXA_CLIENT_SECRET=               # From: alexa-ai configure
```

> 🔒 `.env` is git-ignored. **Never commit real secrets.**  
> `.env.example` (committed) is the source of truth for required variables.

---

## 4. Initialize the Database

Run the schema migration to create all five tables and seed a default student and some sample courses/tasks:

```bash
npm run db:init
```

This executes `packages/database/schema.sql` via `better-sqlite3` and then `packages/database/seed.ts` to populate demo data.

**What gets created:**

```
studymate.db
├── students      (1 row — "Alishba")
├── courses       (3 rows — e.g., "Algorithms", "DB Systems", "Linear Algebra")
├── tasks         (8 rows — sample assignments with due dates)
├── study_sessions (empty — populated by usage)
└── progress      (3 rows — one per course, 0% initially)
```

To wipe and re-seed at any time:

```bash
npm run db:reset
```

---

## 5. Start the MCP Server

```bash
npm run dev --workspace=apps/mcp-server
```

Or from inside the `apps/mcp-server/` directory:

```bash
cd apps/mcp-server
npm run dev
```

You should see:

```
StudyMate MCP Server running on http://localhost:3000
  GET  /health  →  liveness check
  POST /mcp     →  MCP tool endpoint (Streamable HTTP)
```

**Verify it works:**

```bash
curl http://localhost:3000/health
# → { "status": "ok", "timestamp": "..." }
```

---

## 6. (Optional) Start the Web Dashboard

In a **separate terminal**:

```bash
npm run dev --workspace=apps/web
```

Open your browser at [http://localhost:5173](http://localhost:5173).

The dashboard reads data from the MCP server's API. Make sure the MCP server (Step 5) is running first.

---

## 7. Expose the MCP Server with Cloudflare Tunnel

Alexa+ must reach your MCP server over a public **HTTPS** URL. Use a Cloudflare quick tunnel (free, no account required):

```bash
cloudflared tunnel --url http://localhost:3000
```

You'll see output like:

```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
|  https://abc-def-ghi-jkl.trycloudflare.com                                                |
+--------------------------------------------------------------------------------------------+
```

**Copy that URL** — you'll need it in Step 8 (Alexa CLI setup).

> ⚠️ **Quick tunnels generate a new URL on every restart.**  
> Every time you restart `cloudflared`, you must update the MCP server URL in the Alexa CLI configuration.

---

## 8. Verify the Full Local Stack

Run these checks to confirm everything is working before touching Alexa+:

```bash
# 1. Health check
curl https://<your-tunnel-url>/health
# Expected: { "status": "ok" }

# 2. MCP tool call — get_tasks
curl -X POST https://<your-tunnel-url>/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get_tasks",
      "arguments": {}
    },
    "id": 1
  }'
# Expected: JSON array of tasks from the seed data

# 3. MCP tool call — add_task
curl -X POST https://<your-tunnel-url>/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "add_task",
      "arguments": {
        "title": "Finish lab report",
        "course": "DB Systems",
        "due_date": "2026-10-05",
        "est_minutes": 90,
        "priority": "high"
      }
    },
    "id": 2
  }'
# Expected: { "id": <new_id>, "title": "Finish lab report", ... }
```

If all three checks pass, the server is ready for Alexa+ integration.

---

## 9. Useful npm Scripts

| Script | Command | What it does |
|---|---|---|
| Start MCP server (dev) | `npm run dev -w apps/mcp-server` | TypeScript watch mode with hot reload |
| Start web dashboard (dev) | `npm run dev -w apps/web` | Vite dev server with HMR |
| Build MCP server | `npm run build -w apps/mcp-server` | Compile TS → JS |
| Build dashboard | `npm run build -w apps/web` | Vite production build |
| Init database | `npm run db:init` | Create tables + seed data |
| Reset database | `npm run db:reset` | Drop + recreate + re-seed |
| Type check all | `npm run typecheck` | `tsc --noEmit` across all packages |
| Lint | `npm run lint` | ESLint across all packages |

---

## 10. Common Issues

### `better-sqlite3` fails to install

`better-sqlite3` is a native Node module. If install fails:

```bash
npm install --build-from-source better-sqlite3
```

Make sure you have `node-gyp` dependencies:
- **Windows:** Visual Studio Build Tools + Python 3
- **macOS:** Xcode Command Line Tools (`xcode-select --install`)
- **Linux:** `build-essential` + `python3`

### Port 3000 already in use

```bash
# Find what's using port 3000
netstat -ano | findstr :3000      # Windows
lsof -i :3000                     # macOS / Linux

# Change the port
PORT=3001 npm run dev -w apps/mcp-server
```

### Cloudflare tunnel URL changed and Alexa+ stopped working

This is expected. Quick tunnels generate a new URL on every start. See [alexa-integration.md](./alexa-integration.md) for how to update the endpoint URL in the Alexa CLI.

### SQLite database locked

Only one process should write to the database at a time. If both the MCP server and a migration script are running simultaneously, close one.

### TypeScript errors after pulling new changes

```bash
npm install   # re-sync dependencies
npm run typecheck
```

---

## 11. Project Structure Reference

```
studymate-alexa/
├── apps/
│   ├── web/                  # React + Vite + Tailwind dashboard (port 5173)
│   └── mcp-server/           # Node.js + TypeScript MCP server (port 3000)
│       └── src/
│           ├── tools/        # get_tasks.ts, add_task.ts, etc.
│           ├── db/           # SQLite connection + query helpers
│           └── index.ts      # HTTP server entry point
├── packages/
│   ├── database/
│   │   ├── schema.sql        # CREATE TABLE statements
│   │   └── seed.ts           # Sample data population script
│   └── types/
│       └── index.ts          # Shared TypeScript interfaces (Task, Course, etc.)
├── docs/
│   ├── architecture.md       # System design and data model
│   ├── setup.md              # ← this file
│   └── alexa-integration.md  # Alexa+ CLI configuration and testing
├── .env                      # Your local secrets (git-ignored)
├── .env.example              # Committed template
├── .gitignore
├── README.md
├── LICENSE
└── package.json              # npm workspaces root
```
