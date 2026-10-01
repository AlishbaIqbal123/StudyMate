# 🎓 StudyMate — Alexa+ MCP Add-on & Companion Dashboard

> **"Your academic life, organized through conversation."**  
> An autonomous conversational agent built on the **Model Context Protocol (MCP)** for **Alexa+**, backed by a local SQLite engine and a modern React + Tailwind web companion.

[![MCP Protocol](https://img.shields.io/badge/MCP-Streamable_HTTP_2024--11--05-indigo.svg)](https://modelcontextprotocol.io)
[![100% Free Stack](https://img.shields.io/badge/Stack-100%25_Free_%26_Open_Source-emerald.svg)](#-100-free--open-source-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Why StudyMate? (Competition Highlights)

Most student apps are passive CRUD dashboards that force students to switch between multiple tabs just to see what's due. **StudyMate transforms academic task management into an active, conversational partner.**

Powered by Amazon's new **Alexa+ MCP Add-on** architecture, StudyMate connects directly to an MCP server executing structured tools:
1. **Zero-Latency Local Execution:** Powered by Node.js and an embedded SQLite database with WAL mode.
2. **True Conversational Actions:** Alexa+ doesn't just answer questions—it creates tasks, recalibrates deadlines, generates Pomodoro study plans with smart break intervals, and updates course completion metrics.
3. **Dual Surface Real-Time Sync:** Voice actions taken through Alexa+ instantly reflect in the sleek Web Companion Dashboard via real-time polling and REST shims.
4. **Built-in Alexa+ Voice Simulator:** Test the exact Alexa conversational experience right from the browser with interactive speech synthesis and an under-the-hood MCP tool inspector!

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             STUDENT INTERFACES                              │
│       🎙️ Alexa+ Voice / Echo Device    │    💻 Sleek Web Companion          │
└───────────────────────┬────────────────┴──────────────────────┬─────────────┘
                        │                                       │
            ┌───────────▼───────────┐                           │
            │        Alexa+         │                           │
            │  Conversational Layer │                           │
            │  – Intent recognition │                           │
            │  – Argument extraction│                           │
            │  – Tool discovery     │                           │
            └───────────┬───────────┘                           │
                        │ Streamable HTTP (POST /mcp)           │
                        │ via Cloudflare Tunnel                 │
            ┌───────────▼───────────────────────────────────────▼─────────────┐
            │                  StudyMate MCP Server                            │
            │              (Node.js + TypeScript + Express)                   │
            │                                                                 │
            │  Endpoints:                                                     │
            │    • GET  /health          → Liveness & health check            │
            │    • POST /mcp             → MCP Streamable HTTP / JSON-RPC     │
            │    • GET  /mcp/sse         → Server-Sent Events stream          │
            │    • /api/*                → REST endpoints for Web Companion   │
            └───────────────────────────┬─────────────────────────────────────┘
                                        │
                         better-sqlite3 / node:sqlite
                         (Foreign Keys ON, WAL Mode)
                                        │
            ┌───────────────────────────▼─────────────────────────────────────┐
            │                     SQLite Database                             │
            │                      (studymate.db)                             │
            │                                                                 │
            │  • students        (id, name, created_at)                       │
            │  • courses         (id, student_id, name, code, color)         │
            │  • tasks           (id, course_id, title, due_date, priority)   │
            │  • study_sessions  (id, task_id, course_id, duration_minutes)   │
            │  • progress        (id, course_id, completed_pct, hours_week)   │
            └─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ The 5 Core MCP Tools

| # | MCP Tool | Purpose | Example Natural Voice Utterance |
|---|---|---|---|
| **1** | `get_tasks` | Filter and query tasks by course, status, or due date range | *"What's due this week?"* |
| **2** | `add_task` | Create a new task with title, course, due date, estimated minutes, and priority | *"Add a task: Finish OS lab for CS 420 due Friday, high priority"* |
| **3** | `create_study_plan` | Generate an optimized study timeline with Pomodoros and restful breaks | *"I have 90 minutes tonight, help me study"* |
| **4** | `update_progress` | Mark tasks as done or in-progress, recalculating completion % and logging hours | *"I finished my Linear Algebra homework"* |
| **5** | `get_course_progress` | Query completion percentages, assignment tallies, and weekly study time | *"How am I doing in Algorithms?"* |

---

## 💎 100% Free & Open-Source Stack

StudyMate uses **zero paid subscriptions, zero paid API keys, and zero cloud hosting fees**:

| Component | Technology | Why It's 100% Free |
|---|---|---|
| **MCP Server** | Node.js + TypeScript + `@modelcontextprotocol/sdk` | Open-source, free, maintained by Anthropic / Linux Foundation |
| **Database** | Embedded SQLite with WAL mode | Zero cloud database bills; zero storage overhead; instantaneous queries |
| **Web Dashboard** | React 18 + Vite + Tailwind CSS + Lucide Icons | Open-source frontend; lightning-fast compilation |
| **Public HTTPS Tunnel** | Cloudflare Quick Tunnel (`cloudflared`) | Free, no account or credit card required; Amazon-compliant HTTPS TLS |
| **Conversational AI** | Alexa+ native conversational runtime | Alexa handles dialogue; server simply hosts structured tools |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v20+ or v24+
- **Git**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/StudyMate.git
cd StudyMate

# Install all workspace dependencies
npm install
```

### 3. Initialize & Seed Database
```bash
# Creates schema and seeds realistic university courses and assignments
npm run db:seed
```

### 4. Start Development Servers

In terminal 1 — Start the MCP Server:
```bash
npm run dev:server
# Running on http://localhost:3000
# Health check: http://localhost:3000/health
```

In terminal 2 — Start the Web Dashboard:
```bash
npm run dev:web
# Running on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎙️ Testing the Alexa+ Experience

Even before configuring the Alexa Developer Console, you can test the **complete voice workflow** using our built-in **Live Agent Simulator** on the web dashboard:

1. Click any of the **1-Click Demo Phrases**:
   - `"What's due this week?"`
   - `"I have 90 minutes tonight, help me study"`
   - `"Add a task: Prepare CS 301 Midterm Cheat Sheet, due Friday, high priority"`
   - `"I finished my Linear Algebra homework"`
   - `"How am I doing in Algorithms?"`
2. Listen to the assistant reply with **real speech audio** in your browser.
3. Observe the live **Intent**, dispatched **MCP Tool**, and **Arguments JSON** in the real-time inspector.
4. Watch the assignments list and course progress bars update live on the same screen!

---

## 🌐 Exposing to Alexa+ with Cloudflare Tunnel

To connect your local MCP server to the real Alexa+ Developer Console:

```bash
# Run free quick tunnel (binary included in bin/)
./bin/cloudflared.exe tunnel --url http://localhost:3000
```

Copy the generated public HTTPS URL (e.g. `https://random-words.trycloudflare.com`) and register it as your MCP server endpoint in the Alexa+ Developer Console!

---

## 📂 Project Structure

```
StudyMate/
├── apps/
│   ├── mcp-server/             # Node.js + TypeScript MCP Server
│   │   ├── src/
│   │   │   ├── tools/          # 5 core MVP tools (get_tasks, add_task, etc.)
│   │   │   ├── mcp/            # MCP protocol engine & SSE transport
│   │   │   ├── voice/          # Conversational simulator & NLP
│   │   │   ├── api/            # REST routes for Web Companion
│   │   │   └── index.ts        # Express entry point
│   │   └── package.json
│   └── web/                    # React + Vite + Tailwind Companion Dashboard
│       ├── src/
│       │   ├── components/     # VoiceAssistantWidget, TaskList, StudyPlanSection, etc.
│       │   ├── App.tsx         # Dashboard coordinator
│       │   └── main.tsx
│       └── package.json
├── packages/
│   ├── database/               # SQLite schema migrations, queries & seed scripts
│   │   ├── schema.sql
│   │   ├── src/db.ts
│   │   ├── src/queries.ts
│   │   └── src/seed.ts
│   └── types/                  # Shared TypeScript interfaces
│       └── src/index.ts
├── docs/                       # Technical architecture, setup & Alexa integration
│   ├── architecture.md
│   ├── setup.md
│   └── alexa-integration.md
├── bin/                        # Pre-configured cloudflared binary
├── .env.example
├── LICENSE
└── package.json                # Monorepo workspaces
```

---

## 🏆 Hackathon Demo Script

Follow this sequence for the 5-point live demo:
1. **"What's due this week?"** → Shows real pending assignments dynamically queried from SQLite.
2. **"Add task: Final Project Presentation for SE 350, due Monday, high priority"** → Persists live row to DB and auto-calculates course metrics.
3. **"I have 90 minutes tonight, help me study"** → Emits a structured Pomodoro timeline with 25-40 min focus blocks and 10 min rest breaks.
4. **"I finished my Linear Algebra homework"** → Marks task complete, increments hours studied, and updates course completion percentage.
5. **"How am I doing in Algorithms?"** → Returns instant summary of total tasks, completed ratio, and weekly study hours.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
