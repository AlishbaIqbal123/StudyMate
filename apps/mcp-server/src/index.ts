import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  handleJsonRpc,
  handleSseConnect,
  handleSseMessage,
} from './mcp/server.js';
import { apiRouter } from './api/routes.js';
import { ensureDefaultStudent } from '@studymate/database';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root or apps/mcp-server
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Initialize DB and ensure default student
try {
  ensureDefaultStudent('Alishba');
} catch (err) {
  console.warn('Student init warning:', err);
}

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// 1. Health check endpoint (Alexa+ and monitoring check this)
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'StudyMate MCP Server',
    version: '1.0.0',
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    features: [
      'get_tasks',
      'add_task',
      'create_study_plan',
      'update_progress',
      'get_course_progress',
    ],
  });
});

// 2. Mock OAuth endpoint for local Alexa+ MVP testing
app.get('/auth', (req, res) => {
  const redirectUri = req.query.redirect_uri as string;
  const state = req.query.state as string;
  if (redirectUri) {
    const target = `${redirectUri}?code=studymate_demo_code&state=${encodeURIComponent(
      state || ''
    )}`;
    res.redirect(target);
  } else {
    res.json({ status: 'ok', message: 'StudyMate OAuth Mock Ready' });
  }
});

app.post('/auth/token', (_req, res) => {
  res.json({
    access_token: 'studymate_demo_access_token',
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'studymate_demo_refresh_token',
  });
});

// 3. MCP Protocol Endpoints
// Standard JSON-RPC POST endpoint (inspectors, direct test, curl)
app.post('/mcp', handleJsonRpc);

// Streamable HTTP / SSE transport (Alexa+ Streamable HTTP connection)
app.get('/mcp', handleSseConnect);
app.get('/mcp/sse', handleSseConnect);
app.post('/mcp/messages', handleSseMessage);

// 4. REST API for Web Companion Dashboard
app.use('/api', apiRouter);

// Start Server when run directly (local / container), skip during serverless invocations
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                   📚 StudyMate MCP Server                         ║
║         "Your academic life, organized through conversation"      ║
╠═══════════════════════════════════════════════════════════════════╣
║  • Server listening on:  http://localhost:${PORT}                    ║
║  • Health check:         http://localhost:${PORT}/health             ║
║  • MCP Endpoint:         http://localhost:${PORT}/mcp                ║
║  • Streamable SSE:       http://localhost:${PORT}/mcp/sse            ║
║  • REST API:             http://localhost:${PORT}/api/tasks          ║
║  • Tools: get_tasks, add_task, create_study_plan,                 ║
║           update_progress, get_course_progress                    ║
╚═══════════════════════════════════════════════════════════════════╝
`);
  });
}

export { app };
export default app;

