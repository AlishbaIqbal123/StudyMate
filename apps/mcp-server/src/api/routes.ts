import { Router } from 'express';
import {
  getTasks,
  addTask,
  updateProgress,
  getCourses,
  findOrCreateCourse,
  getCourseProgress,
  createStudyPlan,
  resetDatabase,
  getStudyStats,
  logStudySession,
} from '@studymate/database';
import { simulateConversationalVoice } from '../voice/simulator.js';
import type { TaskPriority, TaskStatus } from '@studymate/types';

export const apiRouter = Router();

// GET /api/tasks
apiRouter.get('/tasks', (req, res) => {
  try {
    const tasks = getTasks({
      course: req.query.course as string | undefined,
      status: (req.query.status as TaskStatus | 'all') || 'all',
      due_before: req.query.due_before as string | undefined,
      due_after: req.query.due_after as string | undefined,
    });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/tasks
apiRouter.post('/tasks', (req, res) => {
  try {
    const { title, course, due_date, est_minutes, priority } = req.body;
    if (!title || !course) {
      res.status(400).json({ success: false, error: 'Title and course are required' });
      return;
    }
    const task = addTask({
      title,
      course,
      due_date,
      est_minutes: est_minutes ? Number(est_minutes) : 60,
      priority: (priority as TaskPriority) || 'medium',
    });
    res.status(201).json({ success: true, data: task });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// PATCH /api/tasks/:id
apiRouter.patch('/tasks/:id', (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { status, minutes_spent } = req.body;
    if (!status) {
      res.status(400).json({ success: false, error: 'Status is required' });
      return;
    }
    const result = updateProgress(
      taskId,
      status as TaskStatus,
      minutes_spent ? Number(minutes_spent) : undefined
    );
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/courses
apiRouter.get('/courses', (req, res) => {
  try {
    const courses = getCourses();
    res.json({ success: true, data: courses });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/courses
apiRouter.post('/courses', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ success: false, error: 'Course name is required' });
      return;
    }
    const course = findOrCreateCourse(name);
    res.status(201).json({ success: true, data: course });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/progress
apiRouter.get('/progress', (req, res) => {
  try {
    const course = req.query.course as string | undefined;
    const progress = getCourseProgress({ course });
    res.json({ success: true, data: progress });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/study-stats
apiRouter.get('/study-stats', (_req, res) => {
  try {
    const stats = getStudyStats();
    res.json({ success: true, data: stats });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/study-sessions
apiRouter.post('/study-sessions', (req, res) => {
  try {
    const { course_name, course_id, task_id, duration_minutes, notes } = req.body;
    if (!duration_minutes || Number(duration_minutes) <= 0) {
      res.status(400).json({ success: false, error: 'Valid duration_minutes is required' });
      return;
    }
    const session = logStudySession({
      course_name,
      course_id: course_id ? Number(course_id) : undefined,
      task_id: task_id ? Number(task_id) : undefined,
      duration_minutes: Number(duration_minutes),
      notes,
    });
    res.status(201).json({ success: true, data: session });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/study-plan
apiRouter.post('/study-plan', (req, res) => {
  try {
    const { available_minutes, course, topics } = req.body;
    const minutes = Number(available_minutes) || 60;
    const plan = createStudyPlan(minutes, course, topics);
    res.json({ success: true, data: plan });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/simulate-voice
apiRouter.post('/simulate-voice', async (req, res) => {
  try {
    const { utterance } = req.body;
    if (!utterance || typeof utterance !== 'string') {
      res.status(400).json({ success: false, error: 'utterance string is required' });
      return;
    }
    const result = await simulateConversationalVoice(utterance);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/reset-db
apiRouter.post('/reset-db', (req, res) => {
  try {
    resetDatabase();
    res.json({ success: true, message: 'Database reset to demo seed state successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});
