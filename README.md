# 🎓 StudyMate — Alexa+ Model Context Protocol (MCP) Add-on & Companion Dashboard

> **"Your academic life, organized through conversation."**  
> An autonomous conversational academic co-pilot built on the **Model Context Protocol (MCP)** for **Alexa+**, backed by a local-first SQLite engine and a modern React + Tailwind web companion.

[![Build, Ship, Shape Hackathon](https://img.shields.io/badge/Amazon_Hackathon-Build%2C_Ship%2C_Shape-orange.svg)](https://buildshipshape.devpost.com)
[![Track: Alexa+](https://img.shields.io/badge/Track-Alexa%2B_MCP_Add--on-blue.svg)](#-built-with-track-required-tool)
[![MCP Protocol](https://img.shields.io/badge/MCP-Streamable_HTTP_2024--11--05-indigo.svg)](https://modelcontextprotocol.io)
[![100% Free Stack](https://img.shields.io/badge/Stack-100%25_Free_%26_Open_Source-emerald.svg)](#-100-free--open-source-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📑 Hackathon Submission Navigator

For judges and reviewers of the **Build, Ship, Shape** competition, all required assets and evaluation materials are organized below:

| Resource | Description | Quick Link |
|---|---|:---:|
| 📝 **Required Product Feedback** | Exhaustive, candid feedback directly for the Alexa+ & developer tools engineering teams | [**PRODUCT_FEEDBACK.md**](PRODUCT_FEEDBACK.md) |
| 🎬 **3-Minute Video Pitch Script** | Storyboard & timeline script tailored to the 3-minute pitch criteria | [**DEMO_PITCH_SCRIPT.md**](DEMO_PITCH_SCRIPT.md) |
| 🚀 **Devpost Submission Package** | Full formatted project submission (Inspiration, Architecture, Challenges, What's Next) | [**SUBMISSION.md**](SUBMISSION.md) |
| 🔒 **Security Verification** | Audit confirming zero hardcoded credentials & strict `.env` git-exclusion | [**# Security & API Key Hygiene**](#-security--api-key-hygiene) |

---

## 🛠️ Built With (Track Required Tool)

StudyMate is built specifically for the **Alexa+** track of the **Build, Ship, Shape** competition. The required tool—**Alexa+ Model Context Protocol (MCP)**—is the core engine powering the entire system:

| Layer | Tool / Technology | Role in StudyMate |
|---|---|---|
| **Voice Agent Runtime (Required Tool)** | **Alexa+ MCP Add-on Architecture** | Performs intent discovery, dynamic slot extraction, and executes our academic tools over voice. |
| **Protocol Specification** | **Model Context Protocol (MCP)** | Standardized JSON-RPC 2.0 communication engine between Alexa+ and local academic databases. |
| **Official TypeScript SDK** | **`@modelcontextprotocol/sdk` (v1.31)** | Exposes tools (`get_tasks`, `add_task`, `create_study_plan`, etc.) with strict JSON Schema contracts. |
| **Streaming Transport** | **Streamable HTTP & SSE Transport** | Low-latency Server-Sent Events (`/mcp/sse`) and JSON-RPC (`/mcp`) for persistent voice sessions. |
| **Local Academic Database** | **Node.js 22 Native SQLite (`node:sqlite`)** | Embedded database in WAL mode with foreign keys; sub-millisecond local execution; zero cloud bills. |
| **Web Companion Surface** | **React 18 + Vite + Tailwind CSS** | Real-time dual-surface companion with Kanban tracking, Pomodoro focus widget, and telemetry inspection. |
| **HTTPS Tunneling** | **Cloudflare Quick Tunnel (`cloudflared`)** | Zero-cost Amazon-compliant TLS/HTTPS endpoint without requiring paid VPS or domain registrations. |

---

## 🌟 Why StudyMate? (The Problem & Solution)

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
                         Node.js 22 native SQLite
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

## 📝 Product Feedback for the Alexa+ Engineering Team

As a mandatory part of the **Build, Ship, Shape** competition, we compiled structured feedback directly for the teams building **Alexa+** and the **Model Context Protocol** ecosystem. 

*(Read our full, candid evaluation in [PRODUCT_FEEDBACK.md](PRODUCT_FEEDBACK.md))*

### Summary Feedback Matrix:

| Tool / Technology | Purpose | Rating (1-10) | Build Again? | Key Feedback for Amazon / Maintainers |
|---|---|:---:|:---:|---|
| **Alexa+ MCP Add-on** | Conversational tool calling | 7.5 | **Yes** | Add a local CLI emulator & rich tool payload debugger in Developer Console. |
| **`@modelcontextprotocol/sdk`** | TypeScript MCP server | 8.0 | **Yes** | Provide native Express HTTP/SSE middleware helper out-of-the-box. |
| **Alexa Developer Console** | Endpoint & Auth config | 6.5 | **Yes** | Create dedicated "MCP-First" console layout; hide legacy ASK slot-filling tabs. |
| **Streamable HTTP / SSE** | Real-time tool transport | 8.5 | **Yes** | Standardize keep-alive heartbeat frequencies and reconnection rules in docs. |
| **Cloudflare Quick Tunnel** | Free HTTPS tunneling | 10.0 | **Yes** | Exceptional developer tool; consider bundling a built-in tunnel with ASK CLI. |
| **Node.js `node:sqlite`** | Local database & WAL | 9.0 | **Yes** | Stabilize API beyond experimental flag; publish AWS Lambda storage blueprints. |

---

## 🔒 Security & API Key Hygiene

Per competition guidelines, **API key safety is strictly enforced**:
- **Zero Hardcoded Secrets:** No API keys, client secrets, or OAuth tokens are committed to source code.
- **Git-Ignored Credentials:** `.env`, `.env.local`, and SQLite database files (`*.db`, `*.db-wal`, `*.db-shm`) are explicitly excluded via `.gitignore`.
- **Clean Configuration Template:** A safe template with empty placeholders is provided in [`.env.example`](.env.example).
- **Public Quick Tunnels:** Cloudflare Quick Tunnel operates without API keys or stored credentials.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v20+ or v22+
- **Git**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/AlishbaIqbal123/StudyMate.git
cd StudyMate

# Install all workspace dependencies
npm install
```

### 3. Initialize & Seed Database
```bash
# Creates schema and seeds realistic university courses and assignments
npm run db:seed
```

### 4. Start Development (Concurrent Server + Web)
```bash
# Starts MCP Server on :3000 AND Web Dashboard on :5173 concurrently
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎙️ Testing the Alexa+ Experience

Even before configuring the physical Alexa Developer Console, you can test the **complete voice workflow** using our built-in **Live Agent Simulator** on the web dashboard:

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

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
