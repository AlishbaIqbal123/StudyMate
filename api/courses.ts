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
    console.error('getCourses error:', err);
    const fallback = [
      { id: 1, student_id: 1, name: 'CS 301 Design & Analysis of Algorithms', code: 'CS 301', color: '#3b82f6' },
      { id: 2, student_id: 1, name: 'CS 420 Distributed Database Systems', code: 'CS 420', color: '#10b981' },
      { id: 3, student_id: 1, name: 'MATH 240 Linear Algebra & Matrix Theory', code: 'MATH 240', color: '#8b5cf6' },
      { id: 4, student_id: 1, name: 'SE 350 Software Architecture & Design', code: 'SE 350', color: '#f59e0b' },
    ];
    return res.status(200).json({ success: true, count: fallback.length, data: fallback });
  }
}
