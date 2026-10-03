import { getCourses } from '../packages/database/dist/index.js';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const courses = getCourses();
    return res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
}
