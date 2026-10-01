import { ensureDefaultStudent, findOrCreateCourse, addTask, updateProgress } from './queries.js';
import { getDb } from './db.js';
import { initializeDatabase } from './init.js';

export function seedDatabase(): void {
  initializeDatabase();
  const db = getDb();

  console.log('🌱 Seeding StudyMate database with realistic demo data...');

  // 1. Ensure student
  const student = ensureDefaultStudent('Alishba');
  console.log(`👤 Student created: ${student.name} (ID: ${student.id})`);

  // 2. Courses
  const coursesData = [
    { name: 'CS 301 Design & Analysis of Algorithms', code: 'CS 301', color: '#3b82f6' },
    { name: 'CS 420 Distributed Database Systems', code: 'CS 420', color: '#10b981' },
    { name: 'MATH 240 Linear Algebra & Matrix Theory', code: 'MATH 240', color: '#8b5cf6' },
    { name: 'SE 350 Software Architecture & Design', code: 'SE 350', color: '#f59e0b' },
  ];

  for (const c of coursesData) {
    const course = findOrCreateCourse(c.name);
    db.prepare('UPDATE courses SET code = ?, color = ? WHERE id = ?').run(c.code, c.color, course.id);
  }

  // Calculate dynamic dates relative to today
  const today = new Date();
  const formatDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  // 3. Clear existing tasks & sessions if any
  db.exec('DELETE FROM study_sessions;');
  db.exec('DELETE FROM tasks;');

  // 4. Sample Tasks
  const sampleTasks = [
    {
      title: 'Problem Set 4: Dynamic Programming & Knapsack',
      course: 'CS 301 Design & Analysis of Algorithms',
      due_date: formatDate(2), // 2 days from now
      priority: 'high' as const,
      est_minutes: 120,
    },
    {
      title: 'Lab 3: Paxos & Raft Consensus Implementation',
      course: 'CS 420 Distributed Database Systems',
      due_date: formatDate(3), // 3 days from now
      priority: 'high' as const,
      est_minutes: 180,
    },
    {
      title: 'Eigenvalues and Diagonalization Quiz Prep',
      course: 'MATH 240 Linear Algebra & Matrix Theory',
      due_date: formatDate(1), // Tomorrow
      priority: 'high' as const,
      est_minutes: 90,
    },
    {
      title: 'Microservices & Event-Driven Architecture Case Study',
      course: 'SE 350 Software Architecture & Design',
      due_date: formatDate(5),
      priority: 'medium' as const,
      est_minutes: 75,
    },
    {
      title: 'Read Chapter 7: Graph Algorithms & Minimum Spanning Trees',
      course: 'CS 301 Design & Analysis of Algorithms',
      due_date: formatDate(6),
      priority: 'medium' as const,
      est_minutes: 60,
    },
    {
      title: 'Benchmark SQLite WAL vs Memory Transactions',
      course: 'CS 420 Distributed Database Systems',
      due_date: formatDate(8),
      priority: 'low' as const,
      est_minutes: 45,
    },
    {
      title: 'Vector Spaces & Orthogonality Homework 2',
      course: 'MATH 240 Linear Algebra & Matrix Theory',
      due_date: formatDate(-2), // Completed 2 days ago
      priority: 'medium' as const,
      est_minutes: 60,
    },
    {
      title: 'Component Diagram & Architecture Review for Project',
      course: 'SE 350 Software Architecture & Design',
      due_date: formatDate(-4), // Completed 4 days ago
      priority: 'high' as const,
      est_minutes: 90,
    },
  ];

  const createdTasks = sampleTasks.map((t) => addTask(t));
  console.log(`📋 Created ${createdTasks.length} tasks across 4 courses.`);

  // Mark 2 tasks as done to show realistic completion rates
  if (createdTasks[6]) {
    updateProgress(createdTasks[6].id, 'done', 60);
  }
  if (createdTasks[7]) {
    updateProgress(createdTasks[7].id, 'done', 90);
  }

  // Mark 1 task as in_progress
  if (createdTasks[0]) {
    updateProgress(createdTasks[0].id, 'in_progress', 45);
  }

  // Add a few historical study sessions for hours this week
  const courses = db.prepare('SELECT id FROM courses').all() as { id: number }[];
  if (courses.length > 0) {
    db.prepare(
      `INSERT INTO study_sessions (task_id, course_id, date, duration_minutes, notes)
       VALUES (?, ?, ?, ?, ?)`
    ).run(createdTasks[0]?.id || null, courses[0].id, formatDate(-1), 50, 'Deep dive into Bellman-Ford algorithm');

    if (courses[1]) {
      db.prepare(
        `INSERT INTO study_sessions (task_id, course_id, date, duration_minutes, notes)
         VALUES (?, ?, ?, ?, ?)`
      ).run(createdTasks[1]?.id || null, courses[1].id, formatDate(-2), 70, 'Distributed lock testing');
    }
  }

  console.log('✨ Seed completed successfully! All courses, tasks, and progress records ready.');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
