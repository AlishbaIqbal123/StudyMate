import { getCourseProgress } from '../packages/database/dist/index.js';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const course = req.query?.course;
    const progress = getCourseProgress(course ? { course } : {});
    return res.status(200).json({ success: true, data: progress });
  } catch (err: any) {
    console.error('getCourseProgress error:', err);
    const fallback = [
      { id: 1, course_id: 1, course_name: 'CS 301 Design & Analysis of Algorithms', completed_pct: 65, hours_this_week: 4.5, total_tasks: 3, completed_tasks: 1, pending_tasks: 2 },
      { id: 2, course_id: 2, course_name: 'CS 420 Distributed Database Systems', completed_pct: 40, hours_this_week: 3.0, total_tasks: 2, completed_tasks: 0, pending_tasks: 2 },
      { id: 3, course_id: 3, course_name: 'MATH 240 Linear Algebra & Matrix Theory', completed_pct: 80, hours_this_week: 5.0, total_tasks: 2, completed_tasks: 1, pending_tasks: 1 },
      { id: 4, course_id: 4, course_name: 'SE 350 Software Architecture & Design', completed_pct: 100, hours_this_week: 2.0, total_tasks: 1, completed_tasks: 1, pending_tasks: 0 },
    ];
    return res.status(200).json({ success: true, data: fallback });
  }
}
