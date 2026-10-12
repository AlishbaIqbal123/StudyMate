/**
 * StudyMate MCP endpoint for Vercel (serverless).
 * Streamable HTTP transport, MCP spec 2025-11-25, stateless mode.
 * Mirrors the tools in apps/mcp-server/src/tools/index.ts.
 */
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  getTasks,
  addTask,
  createStudyPlan,
  updateProgress,
  getCourseProgress,
} from '../packages/database/dist/index.js';

type ToolResult = { content: { type: 'text'; text: string }[]; isError?: boolean };

function ok(summary: string, data: unknown): ToolResult {
  return {
    content: [
      { type: 'text', text: summary },
      { type: 'text', text: JSON.stringify(data, null, 2) },
    ],
  };
}

function fail(prefix: string, err: unknown): ToolResult {
  const message = err instanceof Error ? err.message : String(err);
  return { isError: true, content: [{ type: 'text', text: `${prefix}: ${message}` }] };
}

function createServer(): McpServer {
  const server = new McpServer(
    { name: 'studymate-mcp-server', title: 'StudyMate', version: '1.1.0' },
    {
      capabilities: { tools: {} },
      instructions:
        "StudyMate manages a student's courses, assignments, study plans and progress. " +
        'Use get_tasks before update_progress to find task IDs.',
    }
  );

  server.tool(
    'get_tasks',
    'List academic tasks and assignments with optional filters for course, status, or due date range.',
    {
      course: z.string().optional().describe("Course name or code (e.g. 'Algorithms' or 'CS 301')"),
      status: z.enum(['pending', 'in_progress', 'done', 'all']).optional().describe("Defaults to 'all'"),
      due_before: z.string().optional().describe('Only tasks due on or before this date (YYYY-MM-DD)'),
      due_after: z.string().optional().describe('Only tasks due on or after this date (YYYY-MM-DD)'),
    },
    async ({ course, status, due_before, due_after }) => {
      try {
        const tasks = getTasks({ course, status: status || 'all', due_before, due_after });
        const summary =
          tasks.length === 0
            ? 'You have no tasks matching the specified criteria.'
            : `Found ${tasks.length} task(s):\n` +
              tasks
                .map(
                  (t: any, i: number) =>
                    `${i + 1}. [${String(t.status).toUpperCase()}] ${t.title} (${t.course_name}) — Due: ${t.due_date || 'No due date'}`
                )
                .join('\n');
        return ok(summary, tasks);
      } catch (err) {
        return fail('Failed to retrieve tasks', err);
      }
    }
  );

  server.tool(
    'add_task',
    'Add a new task or assignment with title, course, due date, estimated minutes, and priority.',
    {
      title: z.string().min(1).describe('Title of the task (e.g. Finish Lab 3)'),
      course: z.string().min(1).describe('Course name or code (e.g. CS 420)'),
      due_date: z.string().optional().describe('Due date YYYY-MM-DD'),
      est_minutes: z.number().int().positive().optional().describe('Estimated minutes (default 60)'),
      priority: z.enum(['low', 'medium', 'high']).optional().describe("Default 'medium'"),
    },
    async (args) => {
      try {
        const task: any = addTask(args as any);
        return ok(`Added task #${task.id}: "${task.title}" for ${task.course_name}.`, task);
      } catch (err) {
        return fail('Failed to add task', err);
      }
    }
  );

  server.tool(
    'create_study_plan',
    'Generate a structured study plan with Pomodoro intervals and breaks given available minutes.',
    {
      available_minutes: z.number().int().positive().describe('Total study minutes available (e.g. 60, 90)'),
      course: z.string().optional().describe('Optional course to focus on'),
      topics: z.array(z.string()).optional().describe('Optional topics or chapters'),
    },
    async ({ available_minutes, course, topics }) => {
      try {
        const plan: any = createStudyPlan(available_minutes, course, topics);
        return ok(plan.summary || `Study plan for ${available_minutes} minutes.`, plan);
      } catch (err) {
        return fail('Failed to create study plan', err);
      }
    }
  );

  server.tool(
    'update_progress',
    'Mark a task as done, in_progress, or pending, optionally logging minutes studied.',
    {
      task_id: z.number().int().positive().describe('ID of the task (from get_tasks)'),
      status: z.enum(['pending', 'in_progress', 'done']).describe('New status'),
      minutes_spent: z.number().int().positive().optional().describe('Minutes studied to log'),
    },
    async ({ task_id, status, minutes_spent }) => {
      try {
        const result: any = updateProgress(task_id, status, minutes_spent);
        return ok(
          `Task #${task_id} marked ${status}. ${result.courseProgress?.course_name ?? 'Course'} is now ${result.courseProgress?.completed_pct ?? 0}% complete.`,
          result
        );
      } catch (err) {
        return fail('Failed to update progress', err);
      }
    }
  );

  server.tool(
    'get_course_progress',
    'Get completion percentage, assignment stats, and study hours for one or all courses.',
    { course: z.string().optional().describe('Course name or code. Omit for all courses.') },
    async ({ course }) => {
      try {
        const list: any[] = getCourseProgress({ course });
        if (list.length === 0) {
          return ok(course ? `No course found matching "${course}".` : 'No enrolled courses found.', []);
        }
        const summary = list
          .map((cp) => `• ${cp.course_name}: ${cp.completed_pct}% complete, ${cp.hours_this_week} hrs this week`)
          .join('\n');
        return ok(summary, list);
      } catch (err) {
        return fail('Failed to get course progress', err);
      }
    }
  );

  return server;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Accept, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-ID'
  );
  res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed. This server is stateless; use POST.' },
      id: null,
    });
  }

  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
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
