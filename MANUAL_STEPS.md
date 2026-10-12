# 📋 StudyMate — Manual Submission & Setup Checklist

This document contains everything you need to configure in external services and fill out on the hackathon submission form.

---

## 1. Clerk Authentication (Already Configured in Code)

Your Clerk credentials must only be stored in your local `.env` file (which is git-ignored):
- **Publishable Key**: `pk_test_your_clerk_publishable_key` (copied from your Clerk dashboard)
- **Secret Key**: `sk_test_your_clerk_secret_key` (copied from your Clerk dashboard — NEVER commit this)
- **Frontend API**: `https://your-app-id.clerk.accounts.dev`

### In your Clerk Dashboard (`dashboard.clerk.com`):
1. Go to **User & Authentication → Social Connections**:
   - Ensure **Google** is enabled (toggle ON) so judges can log in with 1 click.
2. Go to **User & Authentication → Email, Phone, Username**:
   - Ensure **Email address** is enabled (Email verification code or password).
3. Under **Configure → Paths / Domains**:
   - Ensure your Vercel domain (once deployed) is added to allowed origins / production instance when ready.

---

## 2. Vercel Deployment & Environment Variables

When deploying your repository to Vercel:

1. Connect your GitHub repository `StudyMate` to Vercel.
2. In **Project Settings → Environment Variables**, add the following securely:
   - `VITE_CLERK_PUBLISHABLE_KEY` = `pk_test_...` *(from your Clerk Dashboard)*
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_test_...` *(from your Clerk Dashboard)*
   - `CLERK_SECRET_KEY` = `sk_test_...` *(from your Clerk Dashboard)*
   - `VITE_API_URL` = `https://your-app.vercel.app` *(or leave blank to use same-origin `/api`)*
3. Trigger a redeploy.
4. Verify `https://your-app.vercel.app/health` returns `200 OK` with MCP protocol version `2025-11-25`.

---

## 3. GitHub Repository

1. Go to your GitHub repository: `https://github.com/AlishbaIqbal123/StudyMate`
2. Go to **Settings** → verify the repository is set to **Public**.
3. Push your latest commits to the repository:
   ```powershell
   git add .
   git commit -m "feat: upgrade to MCP spec 2025-11-25 and Clerk authentication with Scholar Preview tier"
   git push origin main
   ```
4. Confirm the `LICENSE` (MIT) file appears in the root of the repository.

---

## 4. Hackathon Submission Form (Devpost / Amazon Portal)

Fill in the form fields using the following answers:

- **Project Title**: `StudyMate — Conversational Academic Co-Pilot`
- **Short Tagline**: `Your academic life, organized through conversation — powered by Alexa+ and the Model Context Protocol (MCP).`
- **Primary Track**: **Alexa+**
- **Mini-Challenge 1**: **Open Source** *(Provide repo URL and PR / branch URL)*
- **Live Demo URL**: Your deployed Vercel URL (e.g. `https://studymate-mcp.vercel.app`)
- **GitHub Repository URL**: `https://github.com/AlishbaIqbal123/StudyMate`
- **Demo Video URL**: Your 2–3 minute video link (YouTube / Vimeo / Loom). Follow [`DEMO_PITCH_SCRIPT.md`](DEMO_PITCH_SCRIPT.md).
- **Testing Instructions for Judges**:
  > *Open the live demo URL. You will immediately enter **Scholar Preview (Local Sandbox)** with pre-seeded university courses (Algorithms, Distributed Systems, Linear Algebra, OS) and interactive voice simulation—no login required to test.*
  >
  > *To test account persistence and device pairing, sign in using Clerk with Google or student email.*
- **Amazon Product Feedback**: Copy and paste or link to [`PRODUCT_FEEDBACK.md`](PRODUCT_FEEDBACK.md).

---

## 5. 3-Minute Demo Video Recording

Record a screen-recording video following the script in [`DEMO_PITCH_SCRIPT.md`](DEMO_PITCH_SCRIPT.md):
1. **0:00 - 0:35**: Problem (Student cognitive overload, multiple portals, screen fatigue).
2. **0:35 - 1:05**: Solution (StudyMate voice-first academic co-pilot on Alexa+ with MCP).
3. **1:05 - 2:05**: Live Demo (Voice console utterances: "What's due this week?", "45 min study plan", Pomodoro timer, Kanban tasks).
4. **2:05 - 2:35**: Under the Hood (Streamable HTTP `/mcp` spec 2025-11-25, Clerk Auth, Telemetry inspector).
5. **2:35 - 3:00**: Closing Pitch & Vision.
