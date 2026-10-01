-- StudyMate SQLite Schema
-- Designed for high-reliability local academic management

PRAGMA foreign_keys = ON;

-- 1. Students table (Single-student MVP; expandable for multi-user in v2)
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 2. Courses table
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  color TEXT DEFAULT '#3b82f6',
  instructor TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 3. Tasks table (Assignments, projects, exam prep)
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date TEXT, -- Format: YYYY-MM-DD
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  est_minutes INTEGER DEFAULT 60,
  status TEXT CHECK(status IN ('pending', 'in_progress', 'done')) DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);

-- 4. Study Sessions log (Tracks focus time and study blocks)
CREATE TABLE IF NOT EXISTS study_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
  course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
  date TEXT NOT NULL DEFAULT (date('now')), -- Format: YYYY-MM-DD
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 5. Course Progress table (Cached summary statistics)
CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL UNIQUE REFERENCES courses(id) ON DELETE CASCADE,
  completed_pct REAL DEFAULT 0.0,
  hours_this_week REAL DEFAULT 0.0,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_tasks_course ON tasks(course_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_task ON study_sessions(task_id);
