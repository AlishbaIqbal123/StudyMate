import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  getTasks,
  addTask,
  createStudyPlan,
  updateProgress,
  getCourseProgress,
  getCourses,
} from '@studymate/database';
import type { TaskPriority, TaskStatus } from '@studymate/types';

/**
 * Register all 5 MVP tools onto the McpServer instance
 */
export function registerMcpTools(server: McpServer) {
  // Tool 1: get_tasks
  server.tool(
    'get_tasks',
    'List academic tasks and assignments with optional filters for course, status, or due date range.',
    {
      course: z
        .string()
        .optional()
        .describe("Filter tasks by course name or course code (e.g. 'Algorithms' or 'CS 301')"),
      status: z
        .enum(['pending', 'in_progress', 'done', 'all'])
        .optional()
        .describe("Filter by task status. Defaults to 'all'."),
      due_before: z
        .string()
        .optional()
        .describe('Only return tasks due on or before this date (YYYY-MM-DD)'),
      due_after: z
        .string()
        .optional()
        .describe('Only return tasks due on or after this date (YYYY-MM-DD)'),
    },
    async ({ course, status, due_before, due_after }) => {
      try {
        const tasks = getTasks({
          course,
          status: status || 'all',
          due_before,
          due_after,
        });

        const formatted = tasks.map((t) => ({
          id: t.id,
          title: t.title,
          course: t.course_name,
          course_code: t.course_code,
          due_date: t.due_date || 'No due date',
          priority: t.priority,
          status: t.status,
          est_minutes: t.est_minutes,
        }));

        let textSummary = `Found ${tasks.length} task${tasks.length === 1 ? '' : 's'}:\n`;
        if (tasks.length === 0) {
          textSummary = 'You have no tasks matching the specified criteria.';
        } else {
          formatted.forEach((t, i) => {
            textSummary += `${i + 1}. [${t.status.toUpperCase()}] ${t.title} (${t.course}) — Due: ${t.due_date} [${t.priority} priority, ${t.est_minutes}m]\n`;
          });
        }

        return {
          content: [
            {
              type: 'text',
              text: textSummary,
            },
            {
              type: 'text',
              text: JSON.stringify(formatted, null, 2),
            },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: 'text', text: `Failed to retrieve tasks: ${message}` }],
        };
      }
    }
  );

  // Tool 2: add_task
  server.tool(
    'add_task',
    'Add a new task or assignment with title, course, due date, estimated minutes, and priority.',
    {
      title: z.string().min(1).describe('The title of the task or assignment (e.g. Finish Lab 3)'),
      course: z.string().min(1).describe('Course name or code (e.g. CS 420 or Distributed Systems)'),
      due_date: z
        .string()
        .optional()
        .describe('Due date in ISO format YYYY-MM-DD (e.g. 2026-10-05)'),
      est_minutes: z
        .number()
        .int()
        .positive()
        .optional()
        .describe('Estimated duration in minutes (defaults to 60)'),
      priority: z
        .enum(['low', 'medium', 'high'])
        .optional()
        .describe("Priority level: 'low', 'medium', or 'high'. Defaults to 'medium'."),
    },
    async ({ title, course, due_date, est_minutes, priority }) => {
      try {
        const newTask = addTask({
          title,
          course,
          due_date,
          est_minutes,
          priority: priority as TaskPriority,
        });

        const textResponse = `Successfully added task #${newTask.id}: "${newTask.title}" for ${newTask.course_name}. Due: ${newTask.due_date || 'No due date'} (${newTask.priority} priority, ${newTask.est_minutes} mins).`;

        return {
          content: [
            { type: 'text', text: textResponse },
            { type: 'text', text: JSON.stringify(newTask, null, 2) },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: 'text', text: `Failed to add task: ${message}` }],
        };
      }
    }
  );

  // Tool 3: create_study_plan
  server.tool(
    'create_study_plan',
    'Generate an optimized, structured study plan with Pomodoro intervals and breaks given available minutes.',
    {
      available_minutes: z
        .number()
        .int()
        .positive()
        .describe('Total study time available in minutes (e.g. 60, 90, 120)'),
      course: z
        .string()
        .optional()
        .describe('Optional course name to focus study session on'),
      topics: z
        .array(z.string())
        .optional()
        .describe('Optional specific topics or chapters to cover'),
    },
    async ({ available_minutes, course, topics }) => {
      try {
        const plan = createStudyPlan(available_minutes, course, topics);

        let planText = `${plan.summary}\n\nSession Timeline:\n`;
        plan.blocks.forEach((b) => {
          const typeLabel = b.type === 'study' ? '[STUDY]' : '[BREAK]';
          planText += `• ${typeLabel} Step ${b.order} [${b.duration_minutes} mins] ${b.type.toUpperCase()}: ${b.description}\n`;
        });

        return {
          content: [
            { type: 'text', text: planText },
            { type: 'text', text: JSON.stringify(plan, null, 2) },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: 'text', text: `Failed to create study plan: ${message}` }],
        };
      }
    }
  );

  // Tool 4: update_progress
  server.tool(
    'update_progress',
    'Mark a task as done, in_progress, or pending, optionally logging minutes studied.',
    {
      task_id: z.number().int().positive().describe('The ID of the task to update'),
      status: z
        .enum(['pending', 'in_progress', 'done'])
        .describe("New status: 'pending', 'in_progress', or 'done'"),
      minutes_spent: z
        .number()
        .int()
        .positive()
        .optional()
        .describe('Minutes spent studying or working on this task to log into study sessions'),
    },
    async ({ task_id, status, minutes_spent }) => {
      try {
        const result = updateProgress(task_id, status as TaskStatus, minutes_spent);

        const statusLabel =
          status === 'done'
            ? 'COMPLETED'
            : status === 'in_progress'
            ? 'IN PROGRESS'
            : 'PENDING';

        const textResponse = `Task #${task_id} ("${result.task.title}") marked as ${statusLabel}. Course "${result.courseProgress.course_name}" progress is now ${result.courseProgress.completed_pct}% (${result.courseProgress.completed_tasks}/${result.courseProgress.total_tasks} completed, ${result.courseProgress.hours_this_week} hrs studied this week).`;

        return {
          content: [
            { type: 'text', text: textResponse },
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: 'text', text: `Failed to update progress: ${message}` }],
        };
      }
    }
  );

  // Tool 5: get_course_progress
  server.tool(
    'get_course_progress',
    'Get completion percentage, assignment stats, and study hours for one or all courses.',
    {
      course: z
        .string()
        .optional()
        .describe('Course name or code. Leave empty to get progress across all courses.'),
    },
    async ({ course }) => {
      try {
        const progressList = getCourseProgress({ course });

        if (progressList.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: course
                  ? `No course found matching "${course}".`
                  : 'No enrolled courses found.',
              },
            ],
          };
        }

        let summaryText = 'Course Progress Summary:\n';
        progressList.forEach((cp) => {
          summaryText += `• ${cp.course_name} (${cp.course_code || 'General'}): ${cp.completed_pct}% complete | ${cp.completed_tasks}/${cp.total_tasks} tasks done | ${cp.hours_this_week} hrs studied this week\n`;
        });

        return {
          content: [
            { type: 'text', text: summaryText },
            { type: 'text', text: JSON.stringify(progressList, null, 2) },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: 'text', text: `Failed to get course progress: ${message}` }],
        };
      }
    }
  );
}

/**
 * Direct execution helper for executing tools programmatically or via REST
 */
export async function executeTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'get_tasks': {
      const tasks = getTasks({
        course: args.course as string | undefined,
        status: (args.status as TaskStatus | 'all') || 'all',
        due_before: args.due_before as string | undefined,
        due_after: args.due_after as string | undefined,
      });
      return {
        tool: 'get_tasks',
        count: tasks.length,
        tasks,
      };
    }

    case 'add_task': {
      if (!args.title || !args.course) {
        throw new Error("Missing required arguments 'title' and 'course'");
      }
      const task = addTask({
        title: String(args.title),
        course: String(args.course),
        due_date: args.due_date ? String(args.due_date) : undefined,
        est_minutes: args.est_minutes ? Number(args.est_minutes) : undefined,
        priority: (args.priority as TaskPriority) || 'medium',
      });
      return {
        tool: 'add_task',
        task,
      };
    }

    case 'create_study_plan': {
      const minutes = Number(args.available_minutes) || 60;
      const plan = createStudyPlan(
        minutes,
        args.course as string | undefined,
        args.topics as string[] | undefined
      );
      return {
        tool: 'create_study_plan',
        plan,
      };
    }

    case 'update_progress': {
      const taskId = Number(args.task_id);
      const status = (args.status as TaskStatus) || 'done';
      const minutesSpent = args.minutes_spent ? Number(args.minutes_spent) : undefined;
      const result = updateProgress(taskId, status, minutesSpent);
      return {
        tool: 'update_progress',
        ...result,
      };
    }

    case 'get_course_progress': {
      const progress = getCourseProgress({
        course: args.course as string | undefined,
      });
      return {
        tool: 'get_course_progress',
        progress,
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
