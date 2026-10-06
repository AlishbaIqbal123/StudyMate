# 🎬 StudyMate — 3-Minute Hackathon Demo Pitch Video Script

> **Competition:** Build, Ship, Shape  
> **Track:** Alexa+  
> **Project:** StudyMate — Conversational Academic Co-Pilot (Alexa+ MCP Add-on & Web Dashboard)  
> **Total Run Time:** Exactly 3:00 Minutes  
> **Format:** Pitch Video (Problem → Solution → Live App Demo → Technical Architecture → Vision)  

---

## ⏱️ Video Timeline Overview

| Section | Timestamp | Focus Area | Visual on Screen |
|---|---|---|---|
| **1. The Problem** | `0:00 - 0:35` | Cognitive overload & broken student productivity tools | Camera on presenter / split screen with overwhelmed student & dozens of open tabs |
| **2. The Solution** | `0:35 - 1:05` | Introducing StudyMate + The Alexa+ Advantage | StudyMate landing page & brand identity ("Your academic life, organized through conversation") |
| **3. Live Working Demo** | `1:05 - 2:05` | The 5 Core Alexa+ MCP Tools in real-time action | Live split screen: Alexa voice console + real-time updating web dashboard |
| **4. Under the Hood** | `2:05 - 2:35` | Technical Architecture & "Built With" callout | MCP streamable architecture diagram & live MCP telemetry inspector |
| **5. Pitch & Impact** | `2:35 - 3:00` | Real-world student impact & closing pitch | Summary KPI dashboard, mobile view, & final visionary call to action |

---

## 🎙️ Step-by-Step Script & Storyboard

---

### PART 1: The Problem & The Student Dilemma (`0:00 - 0:35`)

**Visual Cue:**
- Presenter speaking directly to camera, with an authentic student desk in the background.
- Cut to B-roll or screen capture of 40 open browser tabs: Canvas, Notion, Google Calendar, WhatsApp study groups, sticky notes everywhere.

**Spoken Script:**
> *"College students don't fail exams because they lack intelligence. They fail because of **cognitive overload**.*
>
> *Every single day, students juggle 4 to 5 rigorous courses, dozens of conflicting deadlines, and fragmented syllabus portals. To stay organized, we’re forced to use complex productivity apps that require tedious manual entry, endless clicking, and screen fatigue right when we're trying to focus.*
>
> *When you're exhausted at 10 PM, the last thing you want to do is organize a Kanban board.*
>
> *What if your academic assistant wasn't another screen to manage, but an intelligent conversational partner in your room?"*

---

### PART 2: Introducing StudyMate & The Alexa+ Advantage (`0:35 - 1:05`)

**Visual Cue:**
- Cut to the sleek StudyMate Web Companion Dashboard showing the student's profile (Alishba Iqbal, Computer Science & AI) and the glowing badge: **"Powered by Alexa+ Model Context Protocol (MCP)"**.
- Show an Echo device or Alexa+ voice interface alongside the web dashboard.

**Spoken Script:**
> *"Meet **StudyMate** — your conversational academic co-pilot built on Amazon's revolutionary **Alexa+ Model Context Protocol (MCP)** Add-on architecture.*
>
> *StudyMate doesn't just answer questions with generic AI responses. It connects Alexa+ directly to a high-performance local academic engine via MCP tools.*
>
> *With zero screen friction, students can check deadlines, capture assignments on the fly, generate custom Pomodoro focus plans, and track semester mastery simply by speaking naturally to Alexa."*

---

### PART 3: The Working App in Action (`1:05 - 2:05`)

**Visual Cue:**
- Side-by-side screen capture:
  - **Left Side:** Alexa+ Voice Console / Live Microphone input with waveform.
  - **Right Side:** StudyMate Web Companion Dashboard (showing live tasks, course progress grid, and Pomodoro timer).

**Spoken Script & Live Voice Prompts:**

#### Demo 1: Checking Deadlines (`get_tasks`)
> **Presenter (Speaks to Alexa):**  
> *"Alexa, what's due this week?"*  
>
> **Alexa+ Response (Audio Output):**  
> *"Hey Alishba! You have 3 active assignments. Your most urgent task is 'Problem Set 4: Dynamic Programming' for CS 301, due tomorrow."*  
>
> **Presenter (Voiceover):**  
> *"Alexa executed our `get_tasks` MCP tool, filtering pending assignments in real time."*

#### Demo 2: Frictionless Voice Capture (`add_task`)
> **Presenter (Speaks to Alexa):**  
> *"Alexa, add a task: finish OS lab for CS 420, due Friday, high priority."*  
>
> **Alexa+ Response (Audio Output):**  
> *"I've created a new assignment: 'Finish OS Lab' for CS 420 Distributed Systems, due Friday with high priority."*  
>
> **Presenter (Voiceover):**  
> *"Watch the dashboard on the right—the new assignment appears instantaneously, and the course progress bars recalibrate automatically without refreshing the page!"*

#### Demo 3: Intelligent Pomodoro Study Plan (`create_study_plan`)
> **Presenter (Speaks to Alexa):**  
> *"Alexa, I have 60 minutes tonight, help me study."*  
>
> **Alexa+ Response (Audio Output):**  
> *"I created a structured 60-minute study plan for Algorithms: 45 minutes of focused problem solving, followed by a 15-minute recovery break. Ready to begin?"*  
>
> **Presenter (Voiceover):**  
> *"Say 'yes', and the built-in Pomodoro focus widget activates immediately!"*

#### Demo 4: Real-time Progress Tracking (`update_progress`)
> **Presenter (Speaks to Alexa):**  
> *"Alexa, I finished my Linear Algebra quiz prep."*  
>
> **Alexa+ Response (Audio Output):**  
> *"Awesome job, Alishba! I marked that task as completed. Your Linear Algebra course progress is now at 80%."*

---

### PART 4: Under the Hood — Architecture & Built With (`2:05 - 2:35`)

**Visual Cue:**
- Transition to the **Telemetry & MCP Diagnostics** screen in StudyMate.
- Display the clean architecture diagram showing Alexa+ → Cloudflare HTTPS Tunnel → Express MCP Server (`@modelcontextprotocol/sdk`) → Local SQLite engine (`studymate.db`) / Vercel Serverless.

**Spoken Script:**
> *"How does this work under the hood?*
>
> *StudyMate is built around the **Model Context Protocol (MCP)** using the official `@modelcontextprotocol/sdk`. We exposed our server via **Streamable HTTP and Server-Sent Events (SSE)**, connected securely to the Alexa Developer Console.*
>
> *The entire stack is **100% free and open-source**:
> 1. **Alexa+ MCP Add-on:** Handles natural intent extraction and dynamic tool calling.
> 2. **Node.js Express Server:** Hosts 5 standardized JSON-RPC 2.0 tools.
> 3. **Native Node 22 SQLite with WAL Mode:** Provides sub-millisecond local query execution and total data privacy.
> 4. **Modern React & Tailwind Companion:** Delivers dual-surface synchronization for visual and voice alignment.*
>
> *No paid API keys, no expensive SaaS subscriptions—just pure, resilient architecture."*

---

### PART 5: Impact & The Pitch Close (`2:35 - 3:00`)

**Visual Cue:**
- Presenter returns to camera with the StudyMate Dashboard visible on a laptop and tablet.
- Graphic overlays: *"100% Free / Open Source Stack"*, *"Zero Screen Fatigue"*, *"Alexa+ MCP Powered"*.

**Spoken Script:**
> *"StudyMate represents what ambient computing was always meant to be: an AI companion that meets you in your physical space, removes friction, and genuinely helps you succeed.*
>
> *By combining the conversational intelligence of **Alexa+** with the structured interoperability of the **Model Context Protocol**, we've built a study co-pilot that college students will actually rely on every single day.*
>
> *Thank you, Amazon team, for empowering builders with Alexa+ and MCP. We're excited to shape the future of ambient academic productivity with StudyMate!"*

---

## 💡 Top Recording Tips for a Winning Submission

1. **Keep energy high and pacing crisp:** 3 minutes goes fast. Practice with a stopwatch so you hit the 2:05 demo cutoff cleanly.
2. **Use the built-in Simulator if hardware audio is tricky:** The StudyMate web app includes an interactive **Alexa+ Voice Simulator** with synthetic speech and live MCP parameter inspection—perfect for high-definition screen recordings.
3. **Show, Don't Just Tell:** Make sure the judges visibly see tasks appearing in the database without manual browser refreshes while Alexa speaks.
4. **Emphasize the Hackathon Track:** Say the words **"Alexa+ Model Context Protocol (MCP)"** with clarity at least 3 times.
