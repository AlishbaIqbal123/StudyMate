# StudyMate — Alexa+ MCP Integration Guide

> **Author:** Alishba Iqbal | **Status:** Draft v1  
> This document covers everything needed to register StudyMate as an Alexa+ MCP Add-on, configure OAuth account linking, test invocations, and troubleshoot the integration.

---

## 1. Overview

Alexa+ supports **MCP (Model Context Protocol) Add-ons** — external MCP servers that Alexa+ can discover and invoke as tools during a conversation. StudyMate registers five tools:

| Tool | Natural language trigger examples |
|---|---|
| `get_tasks` | "What's due this week?" / "Show my assignments for Algorithms" |
| `add_task` | "Add a task: finish lab report for DB Systems, due Friday" |
| `create_study_plan` | "I have 90 minutes tonight, help me study" |
| `update_progress` | "I finished my linear algebra homework" |
| `get_course_progress` | "How am I doing in DB Systems?" |

Alexa+ handles:
- Natural language understanding
- Multi-turn conversation context
- Tool selection and argument extraction
- OAuth 2.1 + PKCE account linking

Your MCP server handles:
- Structured tool execution
- Database reads/writes
- Returning JSON results that Alexa+ relays conversationally

---

## 2. Prerequisites

Before starting this guide, complete [setup.md](./setup.md) and verify:

- [ ] MCP server running at `http://localhost:3000`
- [ ] `curl http://localhost:3000/health` returns `{ "status": "ok" }`
- [ ] `cloudflared` is installed
- [ ] Cloudflare tunnel is active and you have a public HTTPS URL

Install the Alexa AI CLI:

```bash
npm install -g @alexa-ai/cli
```

Verify installation:

```bash
alexa-ai --version
```

---

## 3. Alexa+ MCP Requirements Checklist

Your server must satisfy all of these before Alexa+ will accept it:

| Requirement | Details | Status |
|---|---|---|
| **Streamable HTTP transport** | MCP traffic via `POST /mcp`; not WebSocket, not SSE | ✅ Built into server |
| **Public HTTPS URL** | Must be reachable from Amazon's servers; Cloudflare Tunnel provides this | ✅ Via `cloudflared` |
| **OAuth 2.1 + PKCE** | Alexa+ handles the flow; you configure client credentials via the CLI | ⚙️ Configured in Step 5 |
| **Tool schema compliance** | Tools must declare correct JSON Schema in their `inputSchema` | ✅ Via MCP SDK |
| **Response latency** | Keep handlers fast; Alexa+ times out slow tools | ✅ SQLite is synchronous and fast |
| **HTTPS on all endpoints** | Both `/health` and `/mcp` must be accessible over HTTPS | ✅ Via Cloudflare Tunnel |

---

## 4. Configure the Alexa AI CLI

### 4.1 Login / Initialize

```bash
alexa-ai configure
```

This walks you through:
1. Signing in to your Amazon Developer account
2. Selecting or creating an Alexa+ developer profile
3. Generating `ALEXA_CLIENT_ID` and `ALEXA_CLIENT_SECRET`

Copy the client credentials into your `.env` file:

```dotenv
ALEXA_CLIENT_ID=amzn1.application-oa2-client.xxxxxxxxxxxxxxxx
ALEXA_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4.2 Create a New MCP Add-on

```bash
alexa-ai addon create \
  --name "StudyMate" \
  --description "Manage your academic tasks, exams, and study plans by voice" \
  --mcp-server-url "https://<your-tunnel-hash>.trycloudflare.com"
```

This registers your add-on with Alexa+ and returns an **Add-on ID** — save it.

```
Add-on created successfully.
Add-on ID: amzn1.alexa.addon.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 4.3 Deploy / Publish to Your Account

```bash
alexa-ai addon deploy --addon-id amzn1.alexa.addon.<your-id>
```

After deploying, the add-on is available in your Alexa+ developer sandbox.

---

## 5. OAuth 2.1 + PKCE Account Linking

Alexa+ uses OAuth 2.1 with PKCE to link an Alexa user account to a student identity in StudyMate.

### 5.1 How it works (simplified for MVP)

```
1. User says "Alexa, open StudyMate"
2. Alexa+ redirects user to StudyMate's authorization endpoint
3. User logs in (for v1 MVP: this is a no-op / auto-approve for demo)
4. Alexa+ receives an auth token
5. Alexa+ passes the token in the Authorization header on every tool call
6. MCP server validates token → extracts student_id → queries DB
```

### 5.2 MVP Simplification (Single-student, demo only)

For v1 (single-student demo), skip a real OAuth server:

- Set `DEFAULT_STUDENT_ID=1` in `.env`
- In your tool handlers, ignore the auth token and always use `student_id = 1`
- Alexa+ still goes through account linking; just configure a mock auth endpoint

> ⚠️ This is only acceptable for a local hackathon demo.  
> Multi-student production deployments require a real OAuth 2.1 server.

### 5.3 Configure Account Linking in the CLI

```bash
alexa-ai addon update \
  --addon-id amzn1.alexa.addon.<your-id> \
  --auth-endpoint "https://<your-tunnel-hash>.trycloudflare.com/auth" \
  --token-endpoint "https://<your-tunnel-hash>.trycloudflare.com/auth/token" \
  --client-id "$ALEXA_CLIENT_ID" \
  --scopes "studymate:read studymate:write"
```

Add a minimal `/auth` and `/auth/token` route to the MCP server for demo purposes that auto-issues a token tied to `student_id = 1`.

---

## 6. MCP Tool Schemas

Alexa+ discovers your tools by calling `tools/list` on your MCP endpoint. Make sure each tool's schema is correctly declared. Reference implementations for each tool:

### `get_tasks`

```typescript
{
  name: "get_tasks",
  description: "List the student's tasks. Optionally filter by course name or due date range.",
  inputSchema: {
    type: "object",
    properties: {
      course: {
        type: "string",
        description: "Filter by course name (e.g. 'Algorithms'). Optional."
      },
      due_before: {
        type: "string",
        format: "date",
        description: "Only return tasks due on or before this date (YYYY-MM-DD). Optional."
      },
      due_after: {
        type: "string",
        format: "date",
        description: "Only return tasks due on or after this date (YYYY-MM-DD). Optional."
      }
    },
    required: []
  }
}
```

### `add_task`

```typescript
{
  name: "add_task",
  description: "Create a new task/assignment for the student.",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Task title (e.g. 'Finish lab report')" },
      course: { type: "string", description: "Course name (e.g. 'DB Systems')" },
      due_date: { type: "string", format: "date", description: "Due date (YYYY-MM-DD)" },
      est_minutes: { type: "integer", description: "Estimated effort in minutes" },
      priority: {
        type: "string",
        enum: ["low", "medium", "high"],
        description: "Task priority. Defaults to 'medium'."
      }
    },
    required: ["title", "course"]
  }
}
```

### `create_study_plan`

```typescript
{
  name: "create_study_plan",
  description: "Generate a structured study session plan given available time.",
  inputSchema: {
    type: "object",
    properties: {
      available_minutes: {
        type: "integer",
        description: "Total study time available in minutes (e.g. 90)"
      },
      course: {
        type: "string",
        description: "Focus on a specific course. Optional — omit to plan across all courses."
      },
      topics: {
        type: "array",
        items: { type: "string" },
        description: "Specific topics to cover. Optional."
      }
    },
    required: ["available_minutes"]
  }
}
```

### `update_progress`

```typescript
{
  name: "update_progress",
  description: "Mark a task as done or in-progress and update course completion percentage.",
  inputSchema: {
    type: "object",
    properties: {
      task_id: { type: "integer", description: "ID of the task to update" },
      status: {
        type: "string",
        enum: ["done", "in_progress"],
        description: "New status for the task"
      }
    },
    required: ["task_id", "status"]
  }
}
```

### `get_course_progress`

```typescript
{
  name: "get_course_progress",
  description: "Get completion percentage and study stats for one or all courses.",
  inputSchema: {
    type: "object",
    properties: {
      course: {
        type: "string",
        description: "Course name to query. Optional — omit to get progress for all courses."
      }
    },
    required: []
  }
}
```

---

## 7. Testing the Integration

### 7.1 Test Tools Directly (Before Alexa+)

Always test the MCP server directly before involving Alexa+. Use `curl` or the MCP Inspector:

```bash
# List all tools Alexa+ would discover
curl -X POST https://<your-tunnel-url>/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}'
```

Expected response:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [
      { "name": "get_tasks", "description": "...", "inputSchema": {...} },
      { "name": "add_task", ... },
      { "name": "create_study_plan", ... },
      { "name": "update_progress", ... },
      { "name": "get_course_progress", ... }
    ]
  },
  "id": 1
}
```

### 7.2 Test via MCP Inspector

The official MCP Inspector (`@modelcontextprotocol/inspector`) provides a UI for testing tool calls:

```bash
npx @modelcontextprotocol/inspector
```

Enter your tunnel URL as the server address and test each tool interactively.

### 7.3 Test via Alexa+ Developer Console

After deploying the add-on:

1. Open the [Alexa Developer Console](https://developer.amazon.com/alexa/console)
2. Navigate to your add-on → **Test** tab
3. Use the text simulator to run through the demo scripts below

### 7.4 Demo Test Scripts

Run these exact phrases to validate all five success criteria:

| Script | Expected result |
|---|---|
| "What's due this week?" | Alexa lists tasks with due dates in the next 7 days from your DB |
| "Add a task: finish OS assignment, due Monday, high priority" | Alexa confirms task created; verify with `get_tasks` |
| "I have 90 minutes tonight, help me study" | Alexa returns a structured plan with session blocks and breaks |
| "I finished my linear algebra homework" | Alexa confirms; task status → `done`; progress % updates |
| "How am I doing in Algorithms?" | Alexa returns completion %, assignments done, hours studied |

---

## 8. Updating the Server URL (After Tunnel Restart)

Quick tunnels generate a new URL on every `cloudflared` restart. When this happens:

1. Start new tunnel: `cloudflared tunnel --url http://localhost:3000`
2. Copy new URL
3. Update the add-on:

```bash
alexa-ai addon update \
  --addon-id amzn1.alexa.addon.<your-id> \
  --mcp-server-url "https://<new-hash>.trycloudflare.com"
```

4. Re-deploy:

```bash
alexa-ai addon deploy --addon-id amzn1.alexa.addon.<your-id>
```

> 💡 **Tip:** For persistent dev sessions, consider using a [named Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/) (requires a free Cloudflare account) which gives you a stable subdomain.

---

## 9. Troubleshooting

### Alexa+ says "I couldn't connect to StudyMate"

- Confirm tunnel is running: `curl https://<your-url>/health`
- Confirm the URL in the Alexa CLI matches the active tunnel URL
- Re-deploy the add-on after any URL change

### Tool discovery returns 0 tools

- Check `/mcp` responds to `tools/list` directly (Step 7.1)
- Confirm `Content-Type: application/json` header is set on responses
- Check for TypeScript compilation errors: `npm run build -w apps/mcp-server`

### Alexa+ invokes the wrong tool or misunderstands arguments

- Improve tool `description` fields — Alexa+ uses these for tool selection
- Add more specific `description` to individual schema properties
- Test with the exact phrasing from the demo scripts before adding variations

### Auth token validation failures

- For v1 MVP with single-student mode: make sure your server ignores the token and always returns `student_id = 1`
- Check that the Authorization header is being forwarded by the tunnel

### `create_study_plan` returns an empty plan

- Verify there are tasks in the database with status `pending` or `in_progress`
- Re-run `npm run db:reset` to restore seed data

### Database errors after schema changes

```bash
npm run db:reset   # drops and recreates all tables + re-seeds
```

---

## 10. Submission Checklist

Before submitting to the hackathon, verify:

- [ ] All 5 tools callable via Alexa+ voice/text
- [ ] All 5 demo scripts (Section 7.4) work reliably end-to-end
- [ ] Dashboard reflects the same data that Alexa+ just changed
- [ ] `curl https://<url>/health` returns 200 OK
- [ ] README.md contains: project description, architecture diagram, setup instructions, demo video link
- [ ] `.env.example` is up to date with all required variables
- [ ] No secrets committed to Git (check with `git log -- .env`)
- [ ] Privacy note in README: local demo only, no user data leaves the machine

---

## 11. v2 Roadmap (Not in scope for MVP)

| Feature | Notes |
|---|---|
| Real OAuth 2.1 server | Multi-student support; session management |
| Visual MCP App cards | Progress bar UI inline in Alexa+ responses |
| `get_schedule` tool | Lecture/exam timetable lookup |
| `set_goal` / `get_goals` tools | Grade targets and progress-to-goal tracking |
| PostgreSQL migration | Scale beyond local SQLite for production |
| Cloud hosting | AWS / Railway / Render instead of Cloudflare Tunnel |
