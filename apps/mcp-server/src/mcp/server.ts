import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import type { Request, Response } from 'express';
import { registerMcpTools, executeTool } from '../tools/index.js';

let mcpServerInstance: McpServer | null = null;
const activeTransports = new Map<string, SSEServerTransport>();

export function getMcpServer(): McpServer {
  if (mcpServerInstance) {
    return mcpServerInstance;
  }

  mcpServerInstance = new McpServer(
    {
      name: 'studymate-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  // Register all 5 core MVP tools
  registerMcpTools(mcpServerInstance);

  return mcpServerInstance;
}

/**
 * Handle incoming SSE connection for Streamable HTTP transport
 */
export async function handleSseConnect(req: Request, res: Response) {
  const mcp = getMcpServer();
  const transport = new SSEServerTransport('/mcp/messages', res);
  const sessionId = transport.sessionId;

  activeTransports.set(sessionId, transport);

  req.on('close', () => {
    activeTransports.delete(sessionId);
  });

  await mcp.connect(transport);
}

/**
 * Handle incoming client message for existing SSE session
 */
export async function handleSseMessage(req: Request, res: Response) {
  const sessionId = req.query.sessionId as string;
  const transport = activeTransports.get(sessionId);

  if (!transport) {
    res.status(404).json({ error: `Session not found: ${sessionId}` });
    return;
  }

  await transport.handlePostMessage(req, res);
}

/**
 * Direct JSON-RPC HTTP POST handler for /mcp
 * Handles:
 * - initialize
 * - tools/list
 * - tools/call
 */
export async function handleJsonRpc(req: Request, res: Response) {
  const body = req.body;

  if (!body || typeof body !== 'object') {
    res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request: Expected JSON object' },
      id: null,
    });
    return;
  }

  const { jsonrpc = '2.0', id = 1, method, params = {} } = body;

  try {
    switch (method) {
      case 'initialize': {
        res.json({
          jsonrpc,
          id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: {
              name: 'studymate-mcp-server',
              version: '1.0.0',
            },
            capabilities: {
              tools: {},
            },
          },
        });
        return;
      }

      case 'tools/list': {
        res.json({
          jsonrpc,
          id,
          result: {
            tools: [
              {
                name: 'get_tasks',
                description:
                  'List academic tasks and assignments with optional filters for course, status, or due date range.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    course: { type: 'string', description: 'Course name or code' },
                    status: {
                      type: 'string',
                      enum: ['pending', 'in_progress', 'done', 'all'],
                      description: 'Task status',
                    },
                    due_before: { type: 'string', description: 'YYYY-MM-DD cutoff date' },
                    due_after: { type: 'string', description: 'YYYY-MM-DD start date' },
                  },
                },
              },
              {
                name: 'add_task',
                description:
                  'Add a new task or assignment with title, course, due date, estimated minutes, and priority.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: 'Title of the task' },
                    course: { type: 'string', description: 'Course name or code' },
                    due_date: { type: 'string', description: 'Due date in YYYY-MM-DD' },
                    est_minutes: { type: 'integer', description: 'Estimated minutes' },
                    priority: {
                      type: 'string',
                      enum: ['low', 'medium', 'high'],
                      description: 'Task priority',
                    },
                  },
                  required: ['title', 'course'],
                },
              },
              {
                name: 'create_study_plan',
                description:
                  'Generate an optimized, structured study plan with Pomodoro intervals and breaks given available minutes.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    available_minutes: {
                      type: 'integer',
                      description: 'Total study minutes available (e.g. 60, 90)',
                    },
                    course: { type: 'string', description: 'Optional focus course' },
                    topics: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Optional focus topics',
                    },
                  },
                  required: ['available_minutes'],
                },
              },
              {
                name: 'update_progress',
                description:
                  'Mark a task as done, in_progress, or pending, optionally logging minutes studied.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    task_id: { type: 'integer', description: 'ID of the task' },
                    status: {
                      type: 'string',
                      enum: ['pending', 'in_progress', 'done'],
                      description: 'New status',
                    },
                    minutes_spent: {
                      type: 'integer',
                      description: 'Minutes studied to record in session log',
                    },
                  },
                  required: ['task_id', 'status'],
                },
              },
              {
                name: 'get_course_progress',
                description:
                  'Get completion percentage, assignment stats, and study hours for one or all courses.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    course: {
                      type: 'string',
                      description: 'Course name or code. Omit for all courses.',
                    },
                  },
                },
              },
            ],
          },
        });
        return;
      }

      case 'tools/call': {
        const { name, arguments: args = {} } = params;
        if (!name) {
          res.status(400).json({
            jsonrpc,
            id,
            error: { code: -32602, message: 'Missing tool name in params' },
          });
          return;
        }

        const data = await executeTool(name, args);
        res.json({
          jsonrpc,
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data, null, 2),
              },
            ],
          },
        });
        return;
      }

      default:
        res.status(404).json({
          jsonrpc,
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      jsonrpc,
      id,
      error: { code: -32000, message },
    });
  }
}
