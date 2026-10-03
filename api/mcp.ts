import {
  getTasks,
  addTask,
  createStudyPlan,
  updateProgress,
  getCourseProgress,
} from '../packages/database/src/index.js';

async function executeTool(name: string, args: any = {}) {
  switch (name) {
    case 'get_tasks':
      return { tasks: getTasks(args) };
    case 'add_task':
      return { task: addTask(args) };
    case 'create_study_plan':
      return { plan: createStudyPlan(args) };
    case 'update_progress':
      return updateProgress(args.task_id, args.status, args.minutes_spent);
    case 'get_course_progress':
      return { progress: getCourseProgress(args) };
    default:
      throw new Error(`Tool '${name}' not found`);
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', transport: 'Streamable HTTP', service: 'StudyMate MCP' });
  }

  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request: Expected JSON object' },
      id: null,
    });
  }

  const { jsonrpc = '2.0', id = 1, method, params = {} } = body;

  try {
    switch (method) {
      case 'initialize': {
        return res.status(200).json({
          jsonrpc,
          id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: {
              name: 'studymate-mcp-server',
              version: '1.0.0',
            },
            capabilities: { tools: {} },
          },
        });
      }

      case 'tools/list': {
        return res.status(200).json({
          jsonrpc,
          id,
          result: {
            tools: [
              {
                name: 'get_tasks',
                description: 'List academic tasks and assignments with optional filters for course, status, or due date range.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    course: { type: 'string', description: 'Course name or code' },
                    status: { type: 'string', enum: ['pending', 'in_progress', 'done', 'all'], description: 'Task status' },
                    due_before: { type: 'string', description: 'YYYY-MM-DD cutoff date' },
                    due_after: { type: 'string', description: 'YYYY-MM-DD start date' },
                  },
                },
              },
              {
                name: 'add_task',
                description: 'Add a new task or assignment with title, course, due date, estimated minutes, and priority.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: 'Title of the task' },
                    course: { type: 'string', description: 'Course name or code' },
                    due_date: { type: 'string', description: 'Due date in YYYY-MM-DD' },
                    est_minutes: { type: 'integer', description: 'Estimated minutes' },
                    priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Task priority' },
                  },
                  required: ['title', 'course'],
                },
              },
              {
                name: 'create_study_plan',
                description: 'Generate an optimized, structured study plan with Pomodoro intervals and breaks given available minutes.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    available_minutes: { type: 'integer', description: 'Total study minutes available' },
                    course: { type: 'string', description: 'Optional focus course' },
                    topics: { type: 'array', items: { type: 'string' }, description: 'Optional focus topics' },
                  },
                  required: ['available_minutes'],
                },
              },
              {
                name: 'update_progress',
                description: 'Mark a task as done, in_progress, or pending, optionally logging minutes studied.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    task_id: { type: 'integer', description: 'ID of the task' },
                    status: { type: 'string', enum: ['pending', 'in_progress', 'done'], description: 'New status' },
                    minutes_spent: { type: 'integer', description: 'Minutes studied to record' },
                  },
                  required: ['task_id', 'status'],
                },
              },
              {
                name: 'get_course_progress',
                description: 'Get completion percentage, assignment stats, and study hours for one or all courses.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    course: { type: 'string', description: 'Course name or code. Omit for all courses.' },
                  },
                },
              },
            ],
          },
        });
      }

      case 'tools/call': {
        const { name, arguments: args = {} } = params;
        if (!name) {
          return res.status(400).json({
            jsonrpc,
            id,
            error: { code: -32602, message: 'Missing tool name in params' },
          });
        }
        const data = await executeTool(name, args);
        return res.status(200).json({
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
      }

      default:
        return res.status(404).json({
          jsonrpc,
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        });
    }
  } catch (err: any) {
    return res.status(500).json({
      jsonrpc,
      id,
      error: { code: -32000, message: err.message || String(err) },
    });
  }
}
