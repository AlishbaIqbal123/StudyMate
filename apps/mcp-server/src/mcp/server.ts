import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { LATEST_PROTOCOL_VERSION } from '@modelcontextprotocol/sdk/types.js';
import type { Request, Response } from 'express';
import { registerMcpTools } from '../tools/index.js';

export const MCP_PROTOCOL_VERSION = LATEST_PROTOCOL_VERSION; // '2025-11-25' with SDK 1.31

const SERVER_INFO = {
  name: 'studymate-mcp-server',
  title: 'StudyMate',
  version: '1.1.0',
};

/**
 * Build a fresh McpServer with all StudyMate tools registered.
 * In stateless Streamable HTTP mode a new server + transport is created per request
 * (recommended by the MCP TypeScript SDK) so concurrent requests never share state.
 */
export function createMcpServer(): McpServer {
  const server = new McpServer(SERVER_INFO, {
    capabilities: { tools: {} },
    instructions:
      'StudyMate manages a student\'s courses, assignments, study plans and progress. ' +
      'Use get_tasks before update_progress to find task IDs.',
  });
  registerMcpTools(server);
  return server;
}

/**
 * Streamable HTTP endpoint (MCP spec 2025-11-25).
 * Handles POST /mcp (JSON-RPC requests/notifications), plus GET/DELETE which
 * return 405 in stateless mode as allowed by the spec.
 */
export async function handleStreamableHttp(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res
      .status(405)
      .set('Allow', 'POST')
      .json({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Method not allowed. This server is stateless; use POST.' },
        id: null,
      });
    return;
  }

  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
    enableJsonResponse: true, // plain JSON responses (no SSE stream needed for these tools)
  });

  res.on('close', () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error('MCP request failed:', err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Legacy HTTP+SSE transport (protocol 2024-11-05) kept for older MCP clients.
// New clients (incl. Alexa+) should use POST /mcp above.
// ---------------------------------------------------------------------------
const legacySseTransports = new Map<string, SSEServerTransport>();

export async function handleSseConnect(req: Request, res: Response) {
  const server = createMcpServer();
  const transport = new SSEServerTransport('/mcp/messages', res);
  legacySseTransports.set(transport.sessionId, transport);

  req.on('close', () => {
    legacySseTransports.delete(transport.sessionId);
    server.close().catch(() => {});
  });

  await server.connect(transport);
}

export async function handleSseMessage(req: Request, res: Response) {
  const sessionId = req.query.sessionId as string;
  const transport = legacySseTransports.get(sessionId);
  if (!transport) {
    res.status(404).json({ error: `Session not found: ${sessionId}` });
    return;
  }
  await transport.handlePostMessage(req, res, req.body);
}
