# 🚀 Build, Ship, Shape Hackathon Submission: StudyMate

> **Track:** Alexa+  
> **Project Name:** StudyMate  
> **Tagline:** Your academic life, organized through conversation — an autonomous conversational co-pilot powered by Alexa+ and the Model Context Protocol (MCP).  
> **Live Demo URL:** [https://studymate-mcp.vercel.app](https://studymate-mcp.vercel.app) *(or your deployed Vercel URL)*  
> **Repository:** [https://github.com/AlishbaIqbal123/StudyMate](https://github.com/AlishbaIqbal123/StudyMate)  

---

## 🏷️ Track & Required Tool Callout

- **Competition Track:** **Alexa+**
- **Track Required Tool Used:** **Alexa+ Model Context Protocol (MCP) Add-on Architecture**
- **MCP Implementation:** `@modelcontextprotocol/sdk` (TypeScript v1.31) with Streamable HTTP and Server-Sent Events (SSE) transport.

---

## 🛠️ Built With

- **Alexa+ MCP Add-on Runtime** — Natural conversational dialogue, multi-turn context retention, and autonomous tool resolution.
- **Model Context Protocol (MCP) TypeScript SDK (`@modelcontextprotocol/sdk`)** — Standardized JSON-RPC 2.0 protocol engine, tool schema contracts, and request dispatching.
- **Node.js 22 + Express** — High-performance MCP server hosting dual Streamable HTTP (`/mcp`, `/mcp/sse`) and companion REST shims.
- **Embedded SQLite with WAL Mode (`node:sqlite`)** — Sub-millisecond local-first academic database with zero cloud infrastructure overhead.
- **React 18 + Vite + Tailwind CSS** — Dual-surface web companion dashboard with live Pomodoro focus timers, progress heatmaps, and interactive MCP telemetry inspectors.
- **Cloudflare Quick Tunnel (`cloudflared`)** — Free, Amazon-compliant TLS/HTTPS tunneling without requiring credit card or paid domain registration.
- **Supabase (Optional Cloud Sync)** — Secondary PostgreSQL cloud backup and student authentication.

---

## 💡 Inspiration: The Student Dilemma

College students don't struggle because they lack ambition—they struggle with **cognitive overload**.

Between 4 to 5 rigorous university courses, shifting homework rubrics, overlapping exam weeks, and disjointed syllabus portals (Canvas, Blackboard, Notion, Google Calendar), students spend more time *managing their tools* than actually learning. Traditional productivity apps are passive, screen-heavy, and tedious. When a student is exhausted late at night, navigating a multi-layered Kanban board introduces friction right when focus is most delicate.

We asked a simple question:  
**What if your academic assistant wasn't another screen to manage, but an intelligent, conversational companion living right in your physical study room?**

With the launch of **Alexa+** and the **Model Context Protocol (MCP)**, this became possible. StudyMate was born to turn academic organization into effortless spoken conversation.

---

## 🎯 What StudyMate Does

**StudyMate** is a conversational academic co-pilot that pairs the voice intelligence of **Alexa+** with the rich visualization of a modern **Web Companion Dashboard**.

Students simply speak naturally to Alexa to manage their entire academic schedule:
1. **Deadlines & Assignment Triage (`get_tasks`):** Ask *"Alexa, what's due this week?"* to hear urgent deadlines prioritized by due date and course weight.
2. **Zero-Friction Voice Capture (`add_task`):** While studying or walking into a dorm, say *"Alexa, add a task: finish OS lab for Distributed Systems, due Friday, high priority."* StudyMate extracts the title, matches the course, assigns priority, and persists it immediately.
3. **Adaptive Pomodoro Study Planner (`create_study_plan`):** Tell Alexa *"I have 90 minutes tonight, help me study."* StudyMate computes an optimal breakdown with 25-40 minute deep work sprints and 10-minute restorative breaks, dynamically starting a focus timer on screen.
4. **Real-time Progress Logging (`update_progress`):** When done, say *"Alexa, I finished my Linear Algebra homework."* StudyMate marks the assignment complete, logs study hours, and recalculates course completion percentages.
5. **Academic Mastery Analytics (`get_course_progress`):** Ask *"How am I doing in Algorithms?"* to get an instant spoken diagnostic of completion rate and weekly study investment.

Every voice command spoken to Alexa instantly updates the **Web Companion Dashboard** in real time, giving students the best of both worlds: zero-friction voice input in their study room, and a clean visual overview whenever they want it.

---

## 🏗️ Architecture & How We Built It

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             STUDENT SURFACES                                │
│       🎙️ Alexa+ Voice / Echo Device    │    💻 Sleek Web Companion          │
└───────────────────────┬────────────────┴──────────────────────┬─────────────┘
                        │                                       │
            ┌───────────▼───────────┐                           │
            │        Alexa+         │                           │
            │  Conversational Layer │                           │
            │  – LLM Tool Selection │                           │
            │  – Argument Parsing   │                           │
            │  – Dialog Context     │                           │
            └───────────┬───────────┘                           │
                        │ Streamable HTTP (POST /mcp)           │
                        │ via Cloudflare Tunnel                 │
            ┌───────────▼───────────────────────────────────────▼─────────────┐
            │                  StudyMate MCP Server                            │
            │              (Node.js + TypeScript + Express)                   │
            │                                                                 │
            │  Protocol Endpoints:                                            │
            │    • GET  /health          → Alexa+ Liveness diagnostic         │
            │    • POST /mcp             → JSON-RPC 2.0 tool execution        │
            │    • GET  /mcp/sse         → Server-Sent Events stream          │
            │    • /api/*                → REST shims for Web Companion       │
            └───────────────────────────┬─────────────────────────────────────┘
                                        │
                         Node.js 22 native SQLite
                         (Foreign Keys ON, WAL Mode)
                                        │
            ┌───────────────────────────▼─────────────────────────────────────┐
            │                     SQLite Database                             │
            │                      (studymate.db)                             │
            │  • courses    • tasks    • study_sessions    • progress         │
            └─────────────────────────────────────────────────────────────────┘
```

1. **Protocol Implementation:** We leveraged `@modelcontextprotocol/sdk` to implement a strict JSON-RPC 2.0 server supporting both standard HTTP POST requests and Server-Sent Events (SSE).
2. **Schema Definition:** We declared our 5 core tools using JSON Schema contracts with strict type constraints, clear descriptions, and required argument lists to ensure optimal tool resolution by the Alexa+ LLM.
3. **Local-First Speed:** Using Node 22's native `node:sqlite` in WAL mode, database operations execute in under 1ms. Alexa receives structured tool responses almost instantaneously.
4. **Cloud / Serverless Fallback:** For web deployment on Vercel, we designed an intelligent in-memory fallback layer (`InMemoryFallbackDb`) that delivers the full demo experience with pre-seeded realistic university coursework even in serverless environments.

---

## 🧪 Built-in Interactive Voice & MCP Simulator

Judges don't need a physical Echo device or Alexa Developer account to experience StudyMate! We engineered a complete **Interactive Alexa+ Voice Simulator** directly into the web dashboard:
- **Speech Synthesis:** Hear real speech audio responses directly in the browser.
- **Under-the-Hood Telemetry:** Inspect the live intent name, selected MCP tool, and input argument JSON for every conversation turn.
- **Preset Demo Utterances:** 1-click test buttons for the 5 core academic workflows.

---

## 🚧 Challenges We Ran Into

1. **Dual Transport for Alexa+:** Alexa+ can communicate over Streamable HTTP and SSE. Configuring `@modelcontextprotocol/sdk` to handle both persistent SSE connections and stateless JSON-RPC POST requests cleanly required writing custom Express middleware wrappers.
2. **Serverless Deployment Compatibility:** SQLite relies on persistent local disk storage, which does not exist in ephemeral serverless edge runtimes like Vercel. We solved this by developing an active memory-store fallback that detects `process.env.VERCEL` and serves realistic demo data smoothly.
3. **Real-time Dual-Surface Synchronization:** When Alexa updates a task over voice, the student's browser must reflect the change without requiring a manual page reload. We resolved this with an event-driven sync listener on the client store.

---

## 🏆 Accomplishments We're Proud Of

- **100% Free & Open-Source Stack:** Zero cloud server costs, zero paid API keys, and zero database subscriptions. Any student can clone and run StudyMate locally.
- **Sub-Second Voice Responses:** By combining local SQLite execution with lightweight MCP tools, spoken interactions feel snappy and conversational.
- **Human-Centric Design:** Designed for real university students with realistic course codes (CS 301, CS 420, MATH 240, SE 350), smart Pomodoro interval calculations, and meaningful academic progress metrics.

---

## 📚 What We Learned

- **The Power of Model Context Protocol:** MCP turns LLMs from isolated chatbots into actionable agents that can safely interact with local software.
- **Conversational UX requires strict tool contracts:** The clarity of parameter descriptions in tool schemas directly dictates the precision of the LLM's arguments.

---

## 🔮 What's Next for StudyMate

1. **Canvas & Blackboard LMS Integration:** Auto-syncing assignment rubrics and grade weightings directly via MCP resources.
2. **Smart Flashcard & Active Recall Voice Quizzing:** Alexa quizzing students on course concepts while they cook or commute.
3. **Echo Show Visual Cards:** Rich visual widgets on smart displays alongside spoken responses.

---

## 📝 Direct Product Feedback for the Alexa+ Team

*As requested by the Build, Ship, Shape organizers, we compiled exhaustive, tool-by-tool product feedback directly for the Amazon Alexa+ engineering teams.*

See the complete [**PRODUCT_FEEDBACK.md**](PRODUCT_FEEDBACK.md) document in our repository for detailed reviews of:
1. **Alexa+ Model Context Protocol (MCP) Add-on Architecture**
2. **Model Context Protocol (MCP) TypeScript SDK (`@modelcontextprotocol/sdk`)**
3. **Amazon Developer Console & Alexa+ Tool Definition Interface**
4. **Streamable HTTP & Server-Sent Events (SSE) Transport Protocol**
5. **Cloudflare Quick Tunnel (`cloudflared`)**
6. **Node.js 22 Native SQLite (`node:sqlite`)**
