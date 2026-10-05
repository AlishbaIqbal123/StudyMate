import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const FALLBACK_SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  color TEXT DEFAULT '#3b82f6',
  instructor TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date TEXT,
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  est_minutes INTEGER DEFAULT 60,
  status TEXT CHECK(status IN ('pending', 'in_progress', 'done')) DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS study_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
  course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
  date TEXT NOT NULL DEFAULT (date('now')),
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL UNIQUE REFERENCES courses(id) ON DELETE CASCADE,
  completed_pct REAL DEFAULT 0.0,
  hours_this_week REAL DEFAULT 0.0,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_course ON tasks(course_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_task ON study_sessions(task_id);
`;

export function initializeDatabase(): void {
  const db = getDb();
  let schemaSql: string;

  try {
    const schemaPath = path.resolve(__dirname, '../schema.sql');
    if (fs.existsSync(schemaPath)) {
      schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    } else {
      schemaSql = FALLBACK_SCHEMA_SQL;
    }
  } catch {
    schemaSql = FALLBACK_SCHEMA_SQL;
  }

  db.exec(schemaSql);
  console.log('✅ StudyMate SQLite database initialized successfully.');
}

if (process.argv[1]?.endsWith('init.ts') || process.argv[1]?.endsWith('init.js')) {
  initializeDatabase();
}

