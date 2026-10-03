import * as path from 'node:path';
import * as fs from 'node:fs';

let DatabaseSyncClass: any = null;
try {
  // @ts-ignore
  const sqlite = await import('node:sqlite');
  DatabaseSyncClass = sqlite?.DatabaseSync || null;
} catch {
  DatabaseSyncClass = null;
}

class InMemoryFallbackDb {
  students: any[] = [{ id: 1, name: 'Alishba', email: 'alishba@example.com' }];
  courses: any[] = [
    { id: 1, student_id: 1, name: 'CS 301 Design & Analysis of Algorithms', code: 'CS 301', color: '#3b82f6' },
    { id: 2, student_id: 1, name: 'CS 420 Distributed Database Systems', code: 'CS 420', color: '#10b981' },
    { id: 3, student_id: 1, name: 'MATH 240 Linear Algebra & Matrix Theory', code: 'MATH 240', color: '#8b5cf6' },
    { id: 4, student_id: 1, name: 'SE 350 Software Architecture & Design', code: 'SE 350', color: '#f59e0b' },
  ];
  tasks: any[] = [
    { id: 1, course_id: 1, title: 'Problem Set 4: Dynamic Programming & Knapsack', due_date: '2026-10-04', priority: 'high', est_minutes: 120, status: 'in_progress', created_at: new Date().toISOString() },
    { id: 2, course_id: 2, title: 'Lab 3: Paxos & Raft Consensus Implementation', due_date: '2026-10-05', priority: 'high', est_minutes: 180, status: 'pending', created_at: new Date().toISOString() },
    { id: 3, course_id: 3, title: 'Eigenvalues and Diagonalization Quiz Prep', due_date: '2026-10-03', priority: 'high', est_minutes: 90, status: 'pending', created_at: new Date().toISOString() },
    { id: 4, course_id: 4, title: 'Microservices Case Study', due_date: '2026-10-07', priority: 'medium', est_minutes: 75, status: 'done', created_at: new Date().toISOString() },
  ];
  progress: any[] = [
    { id: 1, course_id: 1, completed_pct: 65, hours_this_week: 4.5 },
    { id: 2, course_id: 2, completed_pct: 40, hours_this_week: 3.0 },
    { id: 3, course_id: 3, completed_pct: 80, hours_this_week: 5.0 },
    { id: 4, course_id: 4, completed_pct: 100, hours_this_week: 2.0 },
  ];
  study_sessions: any[] = [];
  nextTaskId = 5;
  nextCourseId = 5;

  exec(_sql: string) {}

  prepare(sql: string) {
    const s = sql.toLowerCase();
    const self = this;
    return {
      get(...args: any[]) {
        if (s.includes('from students')) return self.students[0];
        if (s.includes('from courses')) {
          if (args[1]) {
            return self.courses.find(c => c.name.toLowerCase() === String(args[1]).toLowerCase());
          }
          return self.courses[0];
        }
        if (s.includes('from tasks')) {
          const id = Number(args[0]);
          return self.tasks.find(t => t.id === id);
        }
        if (s.includes('from progress')) {
          const courseId = Number(args[0]);
          return self.progress.find(p => p.course_id === courseId) || { completed_pct: 0, hours_this_week: 0 };
        }
        return undefined;
      },
      all(...args: any[]) {
        if (s.includes('from courses')) return self.courses;
        if (s.includes('from tasks')) {
          let list = [...self.tasks];
          if (args[0] && typeof args[0] === 'string' && args[0].startsWith('%')) {
            const term = args[0].replace(/%/g, '').toLowerCase();
            list = list.filter(t => {
              const c = self.courses.find(crs => crs.id === t.course_id);
              return c?.name.toLowerCase().includes(term);
            });
          }
          return list.map(t => {
            const c = self.courses.find(crs => crs.id === t.course_id);
            return { ...t, course_name: c?.name || 'General', course_code: c?.code };
          });
        }
        if (s.includes('from progress')) return self.progress;
        if (s.includes('from study_sessions')) return self.study_sessions;
        return [];
      },
      run(...args: any[]) {
        if (s.includes('insert into tasks')) {
          const newId = self.nextTaskId++;
          self.tasks.push({
            id: newId,
            course_id: Number(args[0]),
            title: String(args[1]),
            due_date: args[2] ? String(args[2]) : null,
            priority: (args[3] as any) || 'medium',
            est_minutes: Number(args[4]) || 60,
            status: 'pending' as const,
            created_at: new Date().toISOString(),
          });
          return { lastInsertRowid: newId, changes: 1 };
        }
        if (s.includes('insert into courses')) {
          const newId = self.nextCourseId++;
          self.courses.push({
            id: newId,
            student_id: Number(args[0]),
            name: String(args[1]),
            code: args[2] ? String(args[2]) : undefined,
            color: args[3] ? String(args[3]) : '#3b82f6',
          });
          return { lastInsertRowid: newId, changes: 1 };
        }
        if (s.includes('update tasks set status')) {
          const status = args[0];
          const id = Number(args[1]);
          const t = self.tasks.find(tk => tk.id === id);
          if (t) t.status = status;
          return { lastInsertRowid: id, changes: 1 };
        }
        return { lastInsertRowid: 1, changes: 1 };
      }
    };
  }

  close() {}
}

let dbInstance: any = null;

export function getDatabasePath(): string {
  if (process.env.DATABASE_PATH) {
    return path.resolve(process.cwd(), process.env.DATABASE_PATH);
  }

  if (process.env.VERCEL) {
    return '/tmp/studymate.db';
  }

  const rootCandidate = path.resolve(__dirname, '../../../studymate.db');
  return rootCandidate;
}

export function getDb(): any {
  if (dbInstance) {
    return dbInstance;
  }

  if (!DatabaseSyncClass) {
    dbInstance = new InMemoryFallbackDb();
    return dbInstance;
  }

  try {
    const dbPath = getDatabasePath();
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const isNew = !fs.existsSync(dbPath);
    dbInstance = new DatabaseSyncClass(dbPath);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA journal_mode = WAL;');

    if (isNew) {
      try {
        import('./init.js').then((m) => {
          m.initializeDatabase();
          import('./seed.js').then((s) => s.seedDatabase()).catch(() => {});
        }).catch(() => {});
      } catch {
        // ignore
      }
    }
    return dbInstance;
  } catch (err) {
    console.warn('SQLite init failed, using in-memory store:', err);
    dbInstance = new InMemoryFallbackDb();
    return dbInstance;
  }
}

export function closeDb(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // ignore
    }
    dbInstance = null;
  }
}
