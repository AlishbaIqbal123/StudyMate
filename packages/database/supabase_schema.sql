-- ==============================================================================
-- StudyMate Supabase PostgreSQL Schema & Seed Migration
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Students table (Single-student MVP; expandable for multi-user in v2)
CREATE TABLE IF NOT EXISTS public.students (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  color TEXT DEFAULT '#3895c7',
  instructor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tasks table (Assignments, projects, exam prep)
CREATE TABLE IF NOT EXISTS public.tasks (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE, -- YYYY-MM-DD
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  est_minutes INTEGER DEFAULT 60,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'done')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Study Sessions log (Tracks focus time and study blocks)
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT REFERENCES public.tasks(id) ON DELETE SET NULL,
  course_id BIGINT REFERENCES public.courses(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Course Progress table (Cached summary statistics)
CREATE TABLE IF NOT EXISTS public.progress (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL UNIQUE REFERENCES public.courses(id) ON DELETE CASCADE,
  completed_pct REAL DEFAULT 0.0,
  hours_this_week REAL DEFAULT 0.0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_course ON public.tasks(course_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON public.study_sessions(date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_task ON public.study_sessions(task_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon access for demo (matching local MVP)
DROP POLICY IF EXISTS "Allow public all access on students" ON public.students;
CREATE POLICY "Allow public all access on students" ON public.students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on courses" ON public.courses;
CREATE POLICY "Allow public all access on courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on tasks" ON public.tasks;
CREATE POLICY "Allow public all access on tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on study_sessions" ON public.study_sessions;
CREATE POLICY "Allow public all access on study_sessions" ON public.study_sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on progress" ON public.progress;
CREATE POLICY "Allow public all access on progress" ON public.progress FOR ALL USING (true) WITH CHECK (true);

-- Insert Default Seed Data
INSERT INTO public.students (id, name, email)
VALUES (1, 'Alishba', 'alishba@university.edu')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO public.courses (id, student_id, name, code, color, instructor)
VALUES
  (1, 1, 'Design & Analysis of Algorithms', 'CS 301', '#3895c7', 'Dr. Sarah Mitchell'),
  (2, 1, 'Database Systems', 'CS 340', '#7650af', 'Prof. David Chen'),
  (3, 1, 'Linear Algebra', 'MATH 220', '#4f91b0', 'Dr. Robert Torres')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tasks (course_id, title, due_date, priority, est_minutes, status)
VALUES
  (1, 'Problem Set 4: Dynamic Programming & Greedy Algorithms', CURRENT_DATE + INTERVAL '2 days', 'high', 120, 'pending'),
  (1, 'Midterm Cheat Sheet Prep', CURRENT_DATE + INTERVAL '4 days', 'medium', 60, 'in_progress'),
  (1, 'Algorithm Visualization Project', CURRENT_DATE + INTERVAL '10 days', 'medium', 90, 'pending'),
  (2, 'Lab 3: PostgreSQL Complex Queries & Subqueries', CURRENT_DATE + INTERVAL '1 day', 'high', 90, 'pending'),
  (2, 'ER Diagram Redesign Assignment', CURRENT_DATE + INTERVAL '5 days', 'medium', 60, 'in_progress'),
  (2, 'Database Indexing Benchmarks', CURRENT_DATE + INTERVAL '8 days', 'low', 45, 'pending'),
  (3, 'Homework 6: Eigenvalues & Diagonalization', CURRENT_DATE + INTERVAL '3 days', 'high', 90, 'pending'),
  (3, 'Linear Transformations Quiz Review', CURRENT_DATE + INTERVAL '6 days', 'medium', 45, 'pending')
ON CONFLICT DO NOTHING;

INSERT INTO public.progress (course_id, completed_pct, hours_this_week)
VALUES
  (1, 40.0, 3.5),
  (2, 50.0, 4.0),
  (3, 25.0, 2.0)
ON CONFLICT (course_id) DO NOTHING;
