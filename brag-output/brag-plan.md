# Brag Plan: StudyMate

## What is this app?
StudyMate is an autonomous conversational academic co-pilot built on the Model Context Protocol (MCP) for Alexa+, connecting voice dialogue directly to a local-first SQLite engine and a modern web dashboard.

## The angle
College students are exhausted from juggling Canvas, Notion, and endless to-do lists. StudyMate turns academic planning into effortless room-scale conversation: just speak to Alexa to triage due dates, capture tasks, launch Pomodoro focus sessions, and monitor course mastery. Zero screen fatigue, zero SaaS fees.

## Hook (first 2-3 seconds)
High-contrast bold type slamming onto a dark slate canvas:
**"STILL ORGANIZING YOUR SYLLABUS BY HAND?"**
Followed by a dynamic sound wave pulsing into the glowing Alexa+ cyan ring.

## Key moments (the middle)
- **Voice in Action:** Simulated student voice prompt: *"Alexa, what's due this week?"* instantly querying the SQLite database via `get_tasks`.
- **Instant Dual-Surface Sync:** Adding a task via speech: *"Finish OS Lab, due Friday"* causes the assignment card to slide into the web Kanban board in real time without refreshing.
- **Adaptive Pomodoro:** *"I have 60 minutes tonight, help me study"* generates a structured deep-work interval and starts the countdown timer immediately.
- **Under-the-Hood MCP Telemetry:** A sleek live terminal showing the JSON-RPC 2.0 tool execution (`get_tasks`, `create_study_plan`).

## Outro / punchline
**"Your academic life, organized through conversation."**
Subhead: **Built on Alexa+ MCP. 100% Free & Open Source.**

## User flow worth showing
Student asks Alexa what's due → Alexa executes `get_tasks` and highlights urgent deadlines → Student requests a 60-min study block → Alexa executes `create_study_plan` and activates the live focus timer on the companion dashboard.

## Tone
- Preset: `polished`
- Creative direction: *Slick Silicon Valley ambient computing product film for tired college students.*
- Interpretation: Confident, crisp typography, smooth motion, high visual density, zero fluff, authentic product UI.

## Format: landscape — 1920x1080
## Duration: 18.0s

## Visual identity (from the project)
- Background: `#0B132B` (deep dark academic slate)
- Primary Accent: `#38BDF8` (electric cyan)
- Secondary Accent: `#818CF8` (indigo / purple)
- Card Surface: `#1E293B` (rich navy)
- Text Primary: `#F8FAFC` (pure crisp white)
- Text Muted: `#94A3B8` (cool slate)
- Display font: `Inter, -apple-system, system-ui, sans-serif`
- Course Accents: `#3B82F6` (Algorithms), `#10B981` (Distributed Systems), `#8B5CF6` (Linear Algebra)

## Share copy (draft)
College students don't need another tab. We built StudyMate — an autonomous academic co-pilot powered by Alexa+ and MCP that organizes your coursework entirely through conversation.

## Audio direction
- Role: Warm, energetic electronic bed with clean UI percussive clicks
- Music: `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3`
- Music treatment: Starts at 0.0s, builds energy smoothly, ducked slightly under voice cues, crisp punch on final logo reveal
- Music cue guidance: 120 BPM grid; aligns cuts on 3.5s, 7.5s, 11.5s, 15.0s, and final hit at 17.5s
- SFX posture: Moderate, refined motion-matched UI accents

## Storyboard

### Scene 1 — The Hook — 3.5s (0.00s – 3.50s)
- **Visual:** Dark cosmic background with pulsing radial mesh. Giant bold headline: *"TIRED OF SWITCHING BETWEEN 40 TABS TO STUDY?"*
- **Motion:** Staggered scale-up with cyan glowing perimeter. Subtitle fades in: *"Meet StudyMate. The first Alexa+ MCP Academic Co-Pilot."*
- **Audio intent:** Grabs attention immediately; clean synth hit.

### Scene 2 — Ambient Voice Capture — 4.0s (3.50s – 7.50s)
- **Visual:** Alexa+ Voice Waveform actively listening. Glowing voice card displays:
  *"🎙️ 'Alexa, what's due this week?'"*
  Instant response pops up with live badge: *"3 active assignments · CS 301 Priority High"*.
- **Motion:** Waveform pulses rhythmically; speech bubble expands with smooth spring physics.
- **Audio intent:** Upbeat beat drops in at 3.52s.

### Scene 3 — Dual-Surface Live Sync — 4.0s (7.50s – 11.50s)
- **Visual:** The Web Companion Dashboard Kanban & Course Progress Grid.
  Voice command: *"🎙️ 'Add task: Finish OS Lab, due Friday, high priority'"*
  A sleek course card for **CS 420 Distributed Systems** slides in and locks into place. Course progress bar advances from 40% to 55%.
- **Motion:** Card slide-down with subtle shadow bloom. Progress meter smoothly interpolates.

### Scene 4 — Adaptive Pomodoro Engine — 3.5s (11.50s – 15.00s)
- **Visual:** Focus study planner widget.
  *"🎙️ 'I have 60 minutes tonight, help me study'"*
  Splits time automatically: **45m Deep Work (Algorithms)** + **15m Restorative Break**. Live countdown timer ticks down: `45:00`.
- **Motion:** Dual-block timeline expands outward; timer glows emerald.

### Scene 5 — Outro & The Pitch — 3.0s (15.00s – 18.00s)
- **Visual:** Clean branding lockup with StudyMate logo icon and glowing Alexa+ badge.
  Headline: **StudyMate**
  Tagline: *"Your academic life, organized through conversation."*
  Badges: `Amazon Alexa+ Hackathon` · `Model Context Protocol (MCP)` · `100% Free & Open Source`
- **Motion:** Scale settling on beat at 17.02s. Crisp fade to black.
- **Audio intent:** Melodic cadence ends on strong beat.

**Music mood for this video:** Upbeat, modern electronic groove with polished tech energy.  
**Audio summary:** Starts with an energetic synth pulse, builds momentum through live product actions, and lands cleanly on a satisfying final chord.
