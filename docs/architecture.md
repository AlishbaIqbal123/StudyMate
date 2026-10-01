# StudyMate — Architecture

> **Author:** Alishba Iqbal | **Status:** Draft v1 | **Stack:** Node.js + TypeScript · SQLite · React · Cloudflare Tunnel · Alexa+ MCP

---

## 1. System Overview

StudyMate is an **Alexa+ MCP Add-on** that lets students manage tasks, exams, and study plans through natural voice and text conversation. The system has three main runtime components:

1. **Alexa+ (Conversational Layer)** — Amazon's AI assistant that handles intent recognition, context, and dialogue. It discovers and calls your MCP tools automatically based on conversation.
2. **StudyMate MCP Server** — A Node.js + TypeScript HTTP server that exposes five structured MCP tools over the Streamable HTTP transport.
3. **Web Dashboard** — A React + Vite + Tailwind visual companion that reads and writes the same SQLite database for demo visuals and manual data entry.

---

## 2. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STUDENT                                      │
│                  (voice / text / web browser)                       │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │       Alexa+            │
              │  (Conversational Layer) │
              │  – intent recognition   │
              │  – context management   │
              │  – tool discovery       │
              └────────────┬────────────┘
                           │  MCP Protocol
                           │  (Streamable HTTP / HTTPS)
              ┌────────────▼────────────────────────┐
              │     StudyMate MCP Server             │
              │  Node.js + TypeScript                │
              │  @modelcontextprotocol/sdk            │
              │                                      │
              │  Endpoints:                          │
              │    GET  /health                      │
              │    POST /mcp   (tool invocations)    │
              └────────────┬────────────────────────┘
                           │  better-sqlite3
              ┌────────────▼────────────┐
              │    SQLite Database      │
              │  studymate.db           │
              └─────────────────────────┘
                           │  direct file read
              ┌────────────▼────────────────────────┐
              │     Web Dashboard                    │
              │  React + Vite + TypeScript           │
              │  + Tailwind CSS                      │
              └──────────────────────────────────────┘

  Local dev exposed to Alexa+ via:
  ┌──────────────────────┐
  │  Cloudflare Tunnel   │  (cloudflared — free, no account required)
  │  localhost:3000 →    │
  │  https://<hash>.     │
  │  trycloudflare.com   │
  └──────────────────────┘
```

---

## 3. Component Details

### 3.1 Alexa+ (External — Amazon-managed)

| Responsibility | Notes |
|---|---|
| Natural Language Understanding | Handles intent disambiguation, entity extraction, multi-turn context |
| Tool Discovery | Reads MCP tool schemas from your server's `/mcp` endpoint |
| Tool Invocation | Calls your server with structured JSON payloads over Streamable HTTP |
| OAuth 2.1 + PKCE | Alexa+ handles the auth flow; you configure it via the Alexa AI CLI |
| Account Linking | Maps the Alexa user to a `student_id` in your database |

### 3.2 StudyMate MCP Server (`apps/mcp-server/`)

Built with the official `@modelcontextprotocol/sdk`. Exposes two HTTP endpoints:

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | `GET` | Liveness check — returns `{ status: "ok" }` |
| `/mcp` | `POST` | MCP tool invocation entrypoint (Streamable HTTP transport) |

**5 MVP Tools:**

| Tool | Input | Output |
|---|---|---|
| `get_tasks` | `{ course?: string, due_before?: date, due_after?: date }` | Array of task objects matching filters |
| `add_task` | `{ title, course, due_date, est_minutes, priority }` | Created task object with new `id` |
| `create_study_plan` | `{ available_minutes, course?: string, topics?: string[] }` | Array of session blocks: `{ topic, minutes, break_after }` |
| `update_progress` | `{ task_id, status: "done" \| "in_progress" }` | Updated task + course progress summary |
| `get_course_progress` | `{ course?: string }` | `{ course, completed_pct, assignments_done, hours_studied }` |

**Key design rules:**
- Tool handlers must be **fast** — no slow queries, no external network calls.
- Return structured JSON that Alexa+ can relay conversationally.
- Validate all inputs at the handler boundary (Zod recommended).

### 3.3 SQLite Database (`packages/database/`)

File: `studymate.db` — lives in the repo root (git-ignored in production, committed for demo seed data).

Managed via `better-sqlite3` (synchronous API, ideal for single-process local use).

### 3.4 Web Dashboard (`apps/web/`)

- **Vite** dev server on `localhost:5173`.
- Reads/writes the SQLite database through the **same MCP server** (calls local API routes) or a thin REST shim — **not** via direct file access from the browser.
- Used primarily for: visual demo during hackathon presentation, manual seeding of test data, showing "same data, two surfaces" story.

---

## 4. Data Model

```sql
-- Students (single-student MVP; student_id = 1 hardcoded for v1)
CREATE TABLE students (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

-- Courses a student is enrolled in
CREATE TABLE courses (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id),
  name       TEXT    NOT NULL
);

-- Individual assignments / tasks
CREATE TABLE tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id   INTEGER NOT NULL REFERENCES courses(id),
  title       TEXT    NOT NULL,
  due_date    TEXT,              -- ISO 8601: YYYY-MM-DD
  priority    TEXT    DEFAULT 'medium', -- 'low' | 'medium' | 'high'
  est_minutes INTEGER,           -- estimated effort in minutes
  status      TEXT    DEFAULT 'pending' -- 'pending' | 'in_progress' | 'done'
);

-- Study session logs (for hours_studied calculation)
CREATE TABLE study_sessions (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id          INTEGER REFERENCES tasks(id),
  date             TEXT    NOT NULL,  -- ISO 8601: YYYY-MM-DD
  duration_minutes INTEGER NOT NULL
);

-- Materialized progress per course (updated on update_progress calls)
CREATE TABLE progress (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id     INTEGER NOT NULL REFERENCES courses(id),
  completed_pct REAL    DEFAULT 0,
  hours_this_week REAL  DEFAULT 0
);
```

> **V2 additions (not built now):** `exams`, `goals` tables.

---

## 5. Deployment (Local + Tunnel for MVP/Demo)

```
┌─────────────────────────────────────────────┐
│  Local Machine                              │
│                                             │
│  [MCP Server]  localhost:3000               │
│  [Web Dashboard] localhost:5173             │
│                                             │
│  cloudflared tunnel --url localhost:3000    │
│       → https://<random-hash>.              │
│           trycloudflare.com                 │
└─────────────────────────────────────────────┘
         ↑ HTTPS (TLS terminated by Cloudflare)
         │
  [Alexa+ calls your public HTTPS URL]
```

**Steps:**
1. Start MCP server: `npm run dev` in `apps/mcp-server/`
2. Run tunnel: `cloudflared tunnel --url http://localhost:3000`
3. Copy the `https://<hash>.trycloudflare.com` URL
4. Register it in Alexa AI CLI as your MCP server endpoint

> ⚠️ Quick tunnels generate a **new URL on every restart** — update the Alexa CLI config each time during dev.

---

## 6. Security Notes (MVP scope)

| Concern | Approach |
|---|---|
| Auth | OAuth 2.1 + PKCE managed by Alexa+ account linking; student_id resolved from Alexa user token |
| Transport | HTTPS enforced by Cloudflare Tunnel (TLS termination at edge) |
| Input Validation | Zod schemas at every tool handler boundary |
| DB Safety | `better-sqlite3` parameterized queries — no raw string interpolation |
| Secrets | `.env` file (git-ignored); `.env.example` committed |

---

## 7. Monorepo Layout

```
studymate-alexa/
├── apps/
│   ├── web/                  # React + Vite + Tailwind dashboard
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   └── vite.config.ts
│   └── mcp-server/           # Node.js + TypeScript MCP server
│       ├── src/
│       │   ├── tools/        # One file per MCP tool
│       │   ├── db/           # Database connection + queries
│       │   └── index.ts      # Server entry point
│       └── tsconfig.json
├── packages/
│   ├── database/             # SQLite schema migrations + seed
│   │   ├── schema.sql
│   │   └── seed.ts
│   └── types/                # Shared TypeScript interfaces
│       └── index.ts
├── docs/
│   ├── architecture.md       # ← this file
│   ├── setup.md
│   └── alexa-integration.md
├── .env.example
├── .gitignore
├── README.md
├── LICENSE
└── package.json              # Turborepo / npm workspaces root
```

---

## 8. Technology Decisions

| Decision | Choice | Rationale |
|---|---|---|
| MCP SDK | `@modelcontextprotocol/sdk` (official) | Required by Alexa+; maintained by Anthropic/AWS |
| Transport | Streamable HTTP | Only transport currently supported by Alexa+ MCP Add-ons |
| Database | SQLite + `better-sqlite3` | Zero setup, zero infra cost, synchronous API matches single-process Node server |
| Monorepo | npm workspaces | Lightest possible setup; no Turborepo required for MVP |
| Validation | Zod | TypeScript-native; integrates cleanly with MCP SDK tool schemas |
| Dashboard build | Vite | Fast dev server; zero config for React + TypeScript |
| CSS | Tailwind CSS | Utility-first; no separate CSS files needed for a demo-scale UI |
