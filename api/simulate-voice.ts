import {
  getTasks,
  addTask,
  createStudyPlan,
  updateProgress,
  getCourseProgress,
  getCourses,
} from '../packages/database/dist/index.js';

export interface VoiceSimulationResult {
  intent: string;
  tool: string;
  arguments: Record<string, unknown>;
  speechResponse: string;
  data: unknown;
}

export async function simulateConversationalVoice(
  utterance: string
): Promise<VoiceSimulationResult> {
  const query = utterance.trim().toLowerCase();

  // 1. "What's due" / "tasks" / "assignments" / "what do I have"
  if (
    query.includes('due') ||
    query.includes('what do i have') ||
    query.includes('show tasks') ||
    query.includes('my assignments') ||
    query.includes('homework') ||
    query.startsWith('list')
  ) {
    const today = new Date();
    let dueBefore: string | undefined;

    if (query.includes('this week') || query.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      dueBefore = nextWeek.toISOString().split('T')[0];
    } else if (query.includes('today')) {
      dueBefore = today.toISOString().split('T')[0];
    } else if (query.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      dueBefore = tomorrow.toISOString().split('T')[0];
    }

    const courses = getCourses();
    const matchedCourse = courses.find(
      (c: any) =>
        query.includes(c.name.toLowerCase()) ||
        (c.code && query.includes(c.code.toLowerCase()))
    );

    const tasks = getTasks({
      course: matchedCourse?.name,
      status: 'pending',
      due_before: dueBefore,
    });

    let speech: string;
    if (tasks.length === 0) {
      speech = matchedCourse
        ? `Great news! You have no pending assignments due for ${matchedCourse.name}.`
        : `You have no pending assignments due ${dueBefore ? 'in that timeframe' : 'right now'}. You're all caught up!`;
    } else if (tasks.length === 1) {
      const t = tasks[0];
      speech = `You have 1 assignment due: "${t.title}" for ${t.course_name}, due ${t.due_date || 'soon'}. Estimated time is ${t.est_minutes} minutes.`;
    } else {
      const taskListStr = tasks
        .slice(0, 3)
        .map((t: any) => `"${t.title}" for ${t.course_name}`)
        .join(', and ');
      speech = `You have ${tasks.length} tasks due. The most urgent are: ${taskListStr}. Would you like me to create a study plan for one of them?`;
    }

    return {
      intent: 'CheckTasksIntent',
      tool: 'get_tasks',
      arguments: {
        course: matchedCourse?.name,
        due_before: dueBefore,
        status: 'pending',
      },
      speechResponse: speech,
      data: tasks,
    };
  }

  // 2. "Add task" / "remind me to" / "create assignment" / "new task"
  if (
    query.startsWith('add') ||
    query.includes('new task') ||
    query.includes('remind me to') ||
    query.includes('create task')
  ) {
    const courses = getCourses();
    let courseName = 'General Studies';
    for (const c of courses) {
      if (
        query.includes(c.name.toLowerCase()) ||
        (c.code && query.includes(c.code.toLowerCase()))
      ) {
        courseName = c.name;
        break;
      }
    }

    let title = utterance
      .replace(/^(add|create|new)\s+(a\s+)?(task|assignment|homework)?(:|\s)?/i, '')
      .replace(/(for|in)\s+([A-Za-z0-9\s&]+?)(due|\bhigh\b|\bmedium\b|\blow\b|$)/i, '')
      .replace(/due\s+(tomorrow|today|friday|monday|next week|[0-9\-]+)/i, '')
      .replace(/(high|medium|low)\s+priority/i, '')
      .trim();

    if (!title || title.length < 3) {
      title = 'Study session prep';
    }

    let priority = 'medium';
    if (query.includes('high priority') || query.includes('urgent')) {
      priority = 'high';
    } else if (query.includes('low priority')) {
      priority = 'low';
    }

    const today = new Date();
    let dueDate: string | undefined;
    if (query.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      dueDate = tomorrow.toISOString().split('T')[0];
    } else if (query.includes('friday')) {
      const d = new Date(today);
      d.setDate(today.getDate() + ((5 + 7 - today.getDay()) % 7 || 7));
      dueDate = d.toISOString().split('T')[0];
    } else if (query.includes('monday')) {
      const d = new Date(today);
      d.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
      dueDate = d.toISOString().split('T')[0];
    } else {
      const d = new Date(today);
      d.setDate(today.getDate() + 3);
      dueDate = d.toISOString().split('T')[0];
    }

    const newTask = addTask({
      title,
      course: courseName,
      due_date: dueDate,
      priority,
      est_minutes: 60,
    });

    const speech = `I've added "${newTask.title}" for ${newTask.course_name}, due ${newTask.due_date} with ${newTask.priority} priority.`;

    return {
      intent: 'AddTaskIntent',
      tool: 'add_task',
      arguments: {
        title,
        course: courseName,
        due_date: dueDate,
        priority,
      },
      speechResponse: speech,
      data: newTask,
    };
  }

  // 3. "Study plan" / "help me study" / "i have x minutes" / "study session"
  if (
    query.includes('study plan') ||
    query.includes('help me study') ||
    query.includes('minutes') ||
    query.includes('hours') ||
    query.includes('time to study')
  ) {
    let minutes = 60;
    const matchMinutes = query.match(/(\d+)\s*(mins?|minutes?)/i);
    const matchHours = query.match(/(\d+)\s*(hrs?|hours?)/i);

    if (matchMinutes) {
      minutes = parseInt(matchMinutes[1], 10);
    } else if (matchHours) {
      minutes = parseInt(matchHours[1], 10) * 60;
    }

    const courses = getCourses();
    const matchedCourse = courses.find(
      (c: any) =>
        query.includes(c.name.toLowerCase()) ||
        (c.code && query.includes(c.code.toLowerCase()))
    );

    const plan = createStudyPlan(minutes, matchedCourse?.name);

    const studyBlocks = plan.blocks.filter((b: any) => b.type === 'study');
    const breakBlocks = plan.blocks.filter((b: any) => b.type === 'break');

    const speech = `I generated a ${minutes}-minute study plan for you. It includes ${studyBlocks.length} focused study intervals of 25 to 40 minutes, plus ${breakBlocks.length} refreshing breaks. Your first session focuses on ${studyBlocks[0]?.description || 'your top priority task'}. Ready to begin?`;

    return {
      intent: 'CreateStudyPlanIntent',
      tool: 'create_study_plan',
      arguments: {
        available_minutes: minutes,
        course: matchedCourse?.name,
      },
      speechResponse: speech,
      data: plan,
    };
  }

  // 4. "I finished" / "mark done" / "completed" / "update progress"
  if (
    query.includes('finished') ||
    query.includes('done') ||
    query.includes('completed') ||
    query.includes('mark')
  ) {
    const tasks = getTasks({ status: 'pending' });

    const idMatch = query.match(/task\s*#?(\d+)/i) || query.match(/#(\d+)/);
    let targetTask = idMatch
      ? tasks.find((t: any) => t.id === parseInt(idMatch[1], 10))
      : undefined;

    if (!targetTask) {
      targetTask = tasks.find((t: any) => {
        const words = t.title.toLowerCase().split(/\s+/);
        return words.some((w: string) => w.length > 4 && query.includes(w));
      });
    }

    if (!targetTask && tasks.length > 0) {
      targetTask = tasks[0];
    }

    if (!targetTask) {
      return {
        intent: 'UpdateProgressIntent',
        tool: 'update_progress',
        arguments: {},
        speechResponse: "You don't have any pending tasks to mark as completed right now.",
        data: null,
      };
    }

    const updated = updateProgress(targetTask.id, 'done', 45);
    const speech = `Awesome job! I marked "${updated.task.title}" as completed. Your progress in ${updated.courseProgress.course_name} is now ${updated.courseProgress.completed_pct}%. Keep up the momentum!`;

    return {
      intent: 'UpdateProgressIntent',
      tool: 'update_progress',
      arguments: {
        task_id: targetTask.id,
        status: 'done',
        minutes_spent: 45,
      },
      speechResponse: speech,
      data: updated,
    };
  }

  // 5. "Progress" / "how am I doing" / "stats" / "course completion"
  if (
    query.includes('progress') ||
    query.includes('how am i doing') ||
    query.includes('grade') ||
    query.includes('stats') ||
    query.includes('overview')
  ) {
    const courses = getCourses();
    const matchedCourse = courses.find(
      (c: any) =>
        query.includes(c.name.toLowerCase()) ||
        (c.code && query.includes(c.code.toLowerCase()))
    );

    const progress = getCourseProgress({ course: matchedCourse?.name });

    let speech: string;
    if (matchedCourse && progress.length > 0) {
      const cp = progress[0];
      speech = `In ${cp.course_name}, you're at ${cp.completed_pct}% completion with ${cp.completed_tasks} of ${cp.total_tasks} assignments done and ${cp.hours_this_week} hours studied this week.`;
    } else {
      const topCourse = progress[0];
      speech = `Here is your academic progress: you're tracking across ${progress.length} active courses. In ${topCourse.course_name}, you are at ${topCourse.completed_pct}% completion with ${topCourse.hours_this_week} hours logged this week.`;
    }

    return {
      intent: 'GetCourseProgressIntent',
      tool: 'get_course_progress',
      arguments: { course: matchedCourse?.name },
      speechResponse: speech,
      data: progress,
    };
  }

  // Fallback
  const tasks = getTasks({ status: 'pending' });
  return {
    intent: 'HelpIntent',
    tool: 'get_tasks',
    arguments: {},
    speechResponse: `Hello! I'm StudyMate. You have ${tasks.length} pending assignments. You can ask me: "What's due this week?", "I have 90 minutes to study", "Add a task for Algorithms", or "How am I doing in Distributed Systems?"`,
    data: tasks,
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { utterance } = req.body || {};
    if (!utterance) {
      return res.status(400).json({ success: false, error: 'utterance is required' });
    }
    const result = await simulateConversationalVoice(utterance);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
}
