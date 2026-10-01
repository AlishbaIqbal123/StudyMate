# StudyMate — Product Requirements Document

**Tagline:** Your academic life, organized through conversation.
**Type:** Alexa+ MCP Add-on (conversational agent, not a chatbot wrapper)
**Author:** Alishba Iqbal
**Status:** Draft v1

---

## 1. Problem Statement

Students juggle assignments, exams, and study time across multiple courses with no single conversational way to check status or take action. Most "student assistant" apps are just CRUD dashboards. Alexa+ now supports MCP servers as tools, which means a voice/text agent can actually *do* things (create tasks, build study plans, update progress) instead of only answering questions.

## 2. Goal

Build a working Alexa+ MCP integration where a student can manage tasks, exams, and study plans conversationally, backed by a real MCP server and database, with a lightweight web dashboard as a visual companion.

## 3. Non-Goals (for v1)

- No goal-tracking / grade-prediction features (`set_goal`, `get_goals`) — v2
- No multi-user auth system beyond what Alexa account linking requires
- No mobile app
- No production cloud hosting — local + tunnel is fine for MVP/demo
- No custom LLM layer — Alexa+ handles conversation, your server just serves structured tools

## 4. Target User

A university student (like you) managing 4-6 courses per semester, juggling assignments and exam prep, who wants a faster way to check "what's due" and get a study plan without opening five different apps.

## 5. Core User Stories

| # | Story | Priority |
|---|-------|----------|
| 1 | As a student, I can ask what's due this week and get a real answer from my data | P0 |
| 2 | As a student, I can add a task by voice/text and have it saved | P0 |
| 3 | As a student, I can ask for a study plan given available time and get a structured session plan | P0 |
| 4 | As a student, I can mark a task/topic as done and have progress update | P0 |
| 5 | As a student, I can check my course progress as a visual summary | P1 |
| 6 | As a student, I can set an academic goal and ask what it takes to hit it | P2 (v2) |

## 6. MVP Scope (what you actually build for the hackathon)

**MCP Tools (5, not 9):**
1. `get_tasks` — list tasks, optional filters (course, due date range)
2. `add_task` — create task (title, course, due date, estimated duration, priority)
3. `create_study_plan` — input: available minutes, optional course/topics → output: session blocks with breaks
4. `update_progress` — mark task/topic complete
5. `get_course_progress` — returns completion %, assignments done, hours studied

**Everything else (get_schedule, set_goal, get_goals, visual MCP App UI)** — stretch goals only if time allows after the above are solid and demoable.

## 7. Architecture

```
Student (voice/text)
      ↓
   Alexa+ (conversational layer, tool discovery, context)
      ↓ MCP protocol (Streamable HTTP)
StudyMate MCP Server (Node.js + TypeScript, official MCP SDK)
      ↓
SQLite database (students, courses, tasks, study_sessions, progress)
```

Local dev exposed to Alexa+ via Cloudflare Tunnel (free, no signup required for quick tunnels).

Web dashboard (React + TypeScript + Tailwind) reads/writes the same database, mainly for demo visuals and manual data entry outside voice.

## 8. Data Model (minimum viable)

```
students        (id, name)
courses         (id, student_id, name)
tasks           (id, course_id, title, due_date, priority, est_minutes, status)
study_sessions  (id, task_id, date, duration_minutes)
progress        (id, course_id, completed_pct, hours_this_week)
```

Keep it this small for v1. Don't build `exams` and `goals` tables until you actually implement those tools.

## 9. Tech Stack (free / open source, matches your existing skills)

| Layer | Choice | Why |
|---|---|---|
| MCP server | Node.js + TypeScript + `@modelcontextprotocol/sdk` | You already know TS/JS, official SDK is free and open source |
| Database | SQLite (`better-sqlite3`) | Zero setup, zero storage overhead, fine for a demo |
| Web dashboard | React + TypeScript + Vite + Tailwind CSS | Matches your existing stack, no need to learn anything new |
| Tunnel | Cloudflare Tunnel (`cloudflared`) | Free, no account required for quick tunnels, officially recommended by Amazon's docs |
| Alexa+ integration | `@alexa-ai/cli` (Amazon's official Alexa AI CLI) | Required to configure and deploy the MCP add-on |
| Version control | Git + GitHub | Already your workflow |
| Coding agent | Antigravity | Build in staged phases, not all at once, to avoid storage bloat |

No paid tools needed anywhere in this stack.

## 10. Alexa+ MCP Requirements (must satisfy before demo)

- Streamable HTTP transport
- Reachable via a remote HTTPS URL (Cloudflare Tunnel is fine for dev/demo)
- OAuth 2.1 + PKCE for account linking (Alexa+ handles most of this; you configure it via the CLI)
- Reasonable response latency — keep your tool handlers fast, avoid slow queries
- Correct MCP tool/resource schema so Alexa+ can discover and invoke tools

## 11. Success Criteria for the Hackathon Demo

- Live voice/text interaction: "What's due this week?" returns real data from the DB
- "Add [task] for [day]" actually persists a new row
- "I have X minutes tonight, help me study" returns a structured plan
- "I finished [task]" updates status and reflects in `get_course_progress`
- Dashboard shows the same data visually, in sync with what Alexa+ just changed

If all five of those work reliably in front of judges, you have a real demo. Everything past that (visual MCP App cards, goals, PostgreSQL migration) is polish, not requirement.

## 12. Build Order (condensed from the 9-phase plan)

1. **Environment check** — Node, Git, npm, Antigravity project folder
2. **MCP server skeleton** — `/health` and `/mcp` endpoints, Streamable HTTP, test locally with an MCP inspector tool before touching Alexa+ at all
3. **Database + schema** — the 5-table model above
4. **Implement the 5 MVP tools** — test each one directly against the server first
5. **Cloudflare Tunnel** — expose locally, confirm it's reachable
6. **Alexa+ CLI setup** — `alexa-ai configure`, create/deploy add-on
7. **End-to-end voice test** — run through the 5 success-criteria scripts above
8. **Dashboard** — build this in parallel or after core tools work, not before
9. **Submission polish** — README, architecture diagram, demo video, privacy note

## 13. Open Questions to Resolve Early

- Does the hackathon require a public deployment, or is a tunnel + recorded demo acceptable? (Check rules before you invest time in cloud hosting.)
- Single-student assumption for MVP, or do you need basic multi-student support? Recommend single-student for v1 to cut auth complexity.
- Is a visual MCP App card (the progress bar UI) worth the extra time, or is voice + dashboard enough for the demo? Recommend treating it as a stretch goal, not a requirement.

## 14. Repository Structure

```
studymate-alexa/
├── apps/
│   ├── web/              # React dashboard
│   └── mcp-server/        # Node + TS MCP server
├── packages/
│   ├── database/          # SQLite schema + queries
│   └── types/              # shared TS types
├── docs/
│   ├── architecture.md
│   ├── setup.md
│   └── alexa-integration.md
├── .env.example
├── README.md
├── LICENSE
└── package.json
```
