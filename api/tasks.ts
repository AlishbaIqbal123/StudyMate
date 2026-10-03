import { getTasks, addTask, updateProgress } from '../packages/database/dist/index.js';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const tasks = getTasks({
        course: req.query?.course,
        status: req.query?.status || 'all',
        due_before: req.query?.due_before,
        due_after: req.query?.due_after,
      });
      return res.status(200).json({ success: true, count: tasks.length, data: tasks });
    }

    if (req.method === 'POST') {
      const { title, course, due_date, est_minutes, priority } = req.body || {};
      if (!title || !course) {
        return res.status(400).json({ success: false, error: 'Title and course are required' });
      }
      const task = addTask({
        title,
        course,
        due_date,
        est_minutes: est_minutes ? Number(est_minutes) : 60,
        priority: priority || 'medium',
      });
      return res.status(201).json({ success: true, data: task });
    }

    if (req.method === 'PATCH') {
      const urlParts = (req.url || '').split('/');
      const taskId = parseInt(urlParts[urlParts.length - 1] || req.query?.id || '1', 10);
      const { status, minutes_spent } = req.body || {};
      const result = updateProgress(taskId, status, minutes_spent ? Number(minutes_spent) : undefined);
      return res.status(200).json({ success: true, data: result });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
}
