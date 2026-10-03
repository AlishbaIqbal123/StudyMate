import { createStudyPlan } from '../packages/database/dist/index.js';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { available_minutes, course, topics } = req.body || {};
    if (!available_minutes || Number(available_minutes) <= 0) {
      return res.status(400).json({ success: false, error: 'available_minutes must be a positive integer' });
    }
    const plan = createStudyPlan({
      available_minutes: Number(available_minutes),
      course,
      topics,
    });
    return res.status(200).json({ success: true, data: plan });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
}
