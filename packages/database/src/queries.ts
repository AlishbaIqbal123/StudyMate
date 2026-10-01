import { getDb } from './db.js';
import type {
  Course,
  CourseProgress,
  CourseStudyDistribution,
  DailyBreakdown,
  GetCourseProgressParams,
  GetTasksParams,
  Student,
  StudyPlan,
  StudyPlanBlock,
  StudySession,
  StudyStats,
  Task,
  TaskPriority,
  TaskStatus,
} from '@studymate/types';

// Default student ID for MVP
export const DEFAULT_STUDENT_ID = 1;

/**
 * Ensure default student exists
 */
export function ensureDefaultStudent(name: string = 'Alishba'): Student {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(DEFAULT_STUDENT_ID) as
    | Student
    | undefined;

  if (existing) {
    return existing;
  }

  db.prepare('INSERT INTO students (id, name) VALUES (?, ?)').run(DEFAULT_STUDENT_ID, name);
  return { id: DEFAULT_STUDENT_ID, name };
}

/**
 * Get all courses for student
 */
export function getCourses(studentId: number = DEFAULT_STUDENT_ID): Course[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM courses WHERE student_id = ? ORDER BY name ASC')
    .all(studentId) as unknown as Course[];
}

/**
 * Find or create a course by name
 */
export function findOrCreateCourse(
  courseName: string,
  studentId: number = DEFAULT_STUDENT_ID
): Course {
  const db = getDb();
  const trimmed = courseName.trim();

  // Try exact match or case-insensitive match
  const existing = db
    .prepare('SELECT * FROM courses WHERE student_id = ? AND LOWER(name) = LOWER(?)')
    .get(studentId, trimmed) as unknown as Course | undefined;

  if (existing) {
    return existing;
  }

  // Generate a friendly color based on name hash
  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#8b5cf6', // violet
    '#f59e0b', // amber
    '#ec4899', // pink
    '#06b6d4', // cyan
  ];
  const charCodeSum = trimmed
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = colors[charCodeSum % colors.length];

  const codeMatch = trimmed.match(/^([A-Z]{2,4}\s*\d{3})/i);
  const code = codeMatch ? codeMatch[1].toUpperCase() : undefined;

  const result = db
    .prepare(
      'INSERT INTO courses (student_id, name, code, color) VALUES (?, ?, ?, ?)'
    )
    .run(studentId, trimmed, code || null, color);

  const newId = Number(result.lastInsertRowid);

  // Initialize progress row for new course
  db.prepare(
    'INSERT OR IGNORE INTO progress (course_id, completed_pct, hours_this_week) VALUES (?, 0, 0)'
  ).run(newId);

  return {
    id: newId,
    student_id: studentId,
    name: trimmed,
    code,
    color,
  };
}

/**
 * Query tasks with dynamic filters (Tool 1: get_tasks)
 */
export function getTasks(params: GetTasksParams = {}): Task[] {
  const db = getDb();
  let sql = `
    SELECT 
      t.id,
      t.course_id,
      c.name AS course_name,
      c.code AS course_code,
      t.title,
      t.due_date,
      t.priority,
      t.est_minutes,
      t.status,
      t.created_at
    FROM tasks t
    JOIN courses c ON t.course_id = c.id
    WHERE 1=1
  `;
  const queryParams: (string | number | null)[] = [];

  if (params.course && params.course.trim()) {
    sql += ' AND (LOWER(c.name) LIKE LOWER(?) OR LOWER(c.code) LIKE LOWER(?))';
    const courseTerm = `%${params.course.trim()}%`;
    queryParams.push(courseTerm, courseTerm);
  }

  if (params.status && params.status !== 'all') {
    sql += ' AND t.status = ?';
    queryParams.push(params.status);
  }

  if (params.due_before) {
    sql += ' AND t.due_date <= ?';
    queryParams.push(params.due_before);
  }

  if (params.due_after) {
    sql += ' AND t.due_date >= ?';
    queryParams.push(params.due_after);
  }

  // Sort by priority (high first), then earliest due date
  sql += `
    ORDER BY 
      CASE t.status 
        WHEN 'pending' THEN 1 
        WHEN 'in_progress' THEN 2 
        WHEN 'done' THEN 3 
      END ASC,
      CASE t.priority 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 3 
      END ASC,
      t.due_date ASC NULLS LAST
  `;

  return db.prepare(sql).all(...queryParams) as unknown as Task[];
}

/**
 * Add a new task (Tool 2: add_task)
 */
export function addTask(params: {
  title: string;
  course: string;
  due_date?: string;
  est_minutes?: number;
  priority?: TaskPriority;
}): Task {
  const db = getDb();
  const course = findOrCreateCourse(params.course);

  const priority: TaskPriority = params.priority || 'medium';
  const est_minutes = params.est_minutes && params.est_minutes > 0 ? params.est_minutes : 60;
  const due_date = params.due_date || null;

  const result = db
    .prepare(
      `INSERT INTO tasks (course_id, title, due_date, priority, est_minutes, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`
    )
    .run(course.id, params.title.trim(), due_date, priority, est_minutes);

  const taskId = Number(result.lastInsertRowid);

  // Recalculate progress for this course
  recalculateCourseProgress(course.id);

  return {
    id: taskId,
    course_id: course.id,
    course_name: course.name,
    course_code: course.code,
    title: params.title.trim(),
    due_date,
    priority,
    est_minutes,
    status: 'pending',
  };
}

/**
 * Mark task status or record progress (Tool 4: update_progress)
 */
export function updateProgress(
  taskId: number,
  status: TaskStatus,
  minutesSpent?: number
): { task: Task; courseProgress: CourseProgress } {
  const db = getDb();

  // Verify task exists
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as
    | { id: number; course_id: number }
    | undefined;

  if (!existing) {
    throw new Error(`Task with ID ${taskId} not found.`);
  }

  // Update status
  db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, taskId);

  // If study minutes were logged, record a study session
  if (minutesSpent && minutesSpent > 0) {
    db.prepare(
      `INSERT INTO study_sessions (task_id, course_id, date, duration_minutes, notes)
       VALUES (?, ?, date('now'), ?, ?)`
    ).run(taskId, existing.course_id, minutesSpent, `Session for task #${taskId}`);
  }

  // Recalculate course progress
  const courseProgress = recalculateCourseProgress(existing.course_id);

  const updatedTasks = getTasks();
  const updatedTask = updatedTasks.find((t) => t.id === taskId)!;

  return {
    task: updatedTask,
    courseProgress,
  };
}

/**
 * Recalculate and update the materialized progress row for a course
 */
export function recalculateCourseProgress(courseId: number): CourseProgress {
  const db = getDb();

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as
    | Course
    | undefined;

  if (!course) {
    throw new Error(`Course ID ${courseId} not found`);
  }

  const counts = db
    .prepare(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending
      FROM tasks WHERE course_id = ?`
    )
    .get(courseId) as { total: number; completed: number | null; pending: number | null };

  const total = counts.total || 0;
  const completed = counts.completed || 0;
  const pending = counts.pending || 0;
  const completedPct = total > 0 ? Math.round((completed / total) * 100 * 10) / 10 : 0.0;

  // Calculate hours studied in the last 7 days
  const hoursRow = db
    .prepare(
      `SELECT SUM(duration_minutes) AS total_minutes 
       FROM study_sessions 
       WHERE course_id = ? 
       AND date >= date('now', '-7 days')`
    )
    .get(courseId) as { total_minutes: number | null };

  const totalMinutes = hoursRow?.total_minutes || 0;
  const hoursThisWeek = Math.round((totalMinutes / 60) * 10) / 10;

  db.prepare(
    `INSERT INTO progress (course_id, completed_pct, hours_this_week, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(course_id) DO UPDATE SET
       completed_pct = excluded.completed_pct,
       hours_this_week = excluded.hours_this_week,
       updated_at = excluded.updated_at`
  ).run(courseId, completedPct, hoursThisWeek);

  const progressRow = db
    .prepare('SELECT id FROM progress WHERE course_id = ?')
    .get(courseId) as { id: number };

  return {
    id: progressRow.id,
    course_id: course.id,
    course_name: course.name,
    course_code: course.code,
    course_color: course.color,
    completed_pct: completedPct,
    hours_this_week: hoursThisWeek,
    total_tasks: total,
    completed_tasks: completed,
    pending_tasks: pending,
  };
}

/**
 * Get progress for one or all courses (Tool 5: get_course_progress)
 */
export function getCourseProgress(params: GetCourseProgressParams = {}): CourseProgress[] {
  const db = getDb();
  const courses = getCourses();

  let filteredCourses = courses;
  if (params.course && params.course.trim()) {
    const term = params.course.trim().toLowerCase();
    filteredCourses = courses.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.code && c.code.toLowerCase().includes(term))
    );
  }

  return filteredCourses.map((c) => recalculateCourseProgress(c.id));
}

/**
 * Intelligent study plan generation (Tool 3: create_study_plan)
 * Allocates available minutes across highest priority tasks with Pomodoro breaks.
 */
export function createStudyPlan(
  availableMinutes: number,
  courseName?: string,
  topics?: string[]
): StudyPlan {
  if (availableMinutes <= 0) {
    throw new Error('available_minutes must be greater than 0.');
  }

  // Find candidate tasks (pending or in_progress)
  let candidateTasks = getTasks({
    status: 'pending',
    course: courseName,
  });

  if (candidateTasks.length === 0) {
    // Also include in_progress tasks
    candidateTasks = getTasks({
      status: 'in_progress',
      course: courseName,
    });
  }

  const blocks: StudyPlanBlock[] = [];
  let remainingTime = availableMinutes;
  let blockOrder = 1;

  // Standard study block chunk: 25-45 minutes
  const targetStudyChunk = availableMinutes >= 90 ? 40 : availableMinutes >= 50 ? 25 : 20;
  const breakDuration = availableMinutes >= 90 ? 10 : 5;

  let taskIndex = 0;
  while (remainingTime >= 15) {
    // Determine study duration for this block
    const studyDuration = Math.min(targetStudyChunk, remainingTime);
    const currentTask = candidateTasks[taskIndex % (candidateTasks.length || 1)];

    let taskDescription = '';
    if (topics && topics.length > 0) {
      const topic = topics[(blockOrder - 1) % topics.length];
      taskDescription = `Review and practice: ${topic}`;
    } else if (currentTask) {
      taskDescription = `Focus on: "${currentTask.title}" (${currentTask.course_name})`;
    } else {
      taskDescription = courseName
        ? `Review key lecture notes for ${courseName}`
        : 'Active recall and practice problem solving';
    }

    blocks.push({
      order: blockOrder++,
      type: 'study',
      duration_minutes: studyDuration,
      task_id: currentTask?.id,
      task_title: currentTask?.title,
      course_name: currentTask?.course_name || courseName,
      description: taskDescription,
    });

    remainingTime -= studyDuration;

    // Add a break if there's enough time left for another study block
    if (remainingTime >= 20) {
      const actualBreak = Math.min(breakDuration, remainingTime);
      blocks.push({
        order: blockOrder++,
        type: 'break',
        duration_minutes: actualBreak,
        description: 'Rest, hydrate, and stretch. Step away from the screen.',
      });
      remainingTime -= actualBreak;
    }

    taskIndex++;
  }

  // If there are still 5-14 loose minutes, allocate to a wrap-up / summary
  if (remainingTime > 0) {
    blocks.push({
      order: blockOrder++,
      type: 'study',
      duration_minutes: remainingTime,
      description: 'Session wrap-up: summarize notes, review what was learned, log progress.',
    });
  }

  const totalStudyMinutes = blocks
    .filter((b) => b.type === 'study')
    .reduce((acc, b) => acc + b.duration_minutes, 0);

  const totalBreakMinutes = blocks
    .filter((b) => b.type === 'break')
    .reduce((acc, b) => acc + b.duration_minutes, 0);

  const summary = `Structured ${availableMinutes}-minute study plan created: ${totalStudyMinutes} mins focused study across ${blocks.filter((b) => b.type === 'study').length} sessions with ${totalBreakMinutes} mins restful breaks.`;

  return {
    total_minutes: availableMinutes,
    available_minutes: availableMinutes,
    focus_course: courseName,
    blocks,
    summary,
  };
}

/**
 * Log a Pomodoro or focus study session
 */
export function logStudySession(params: {
  course_name?: string;
  course_id?: number;
  task_id?: number;
  duration_minutes: number;
  notes?: string;
}): StudySession {
  const db = getDb();
  let courseId = params.course_id;

  if (!courseId && params.course_name) {
    const course = findOrCreateCourse(params.course_name);
    courseId = course.id;
  }

  const result = db
    .prepare(
      `INSERT INTO study_sessions (task_id, course_id, date, duration_minutes, notes)
       VALUES (?, ?, date('now'), ?, ?)`
    )
    .run(
      params.task_id || null,
      courseId || null,
      params.duration_minutes,
      params.notes || 'Pomodoro focus session'
    );

  const sessionId = Number(result.lastInsertRowid);

  if (courseId) {
    recalculateCourseProgress(courseId);
  }

  const session = db
    .prepare(
      `SELECT 
        s.id,
        s.task_id,
        t.title AS task_title,
        s.course_id,
        c.name AS course_name,
        s.date,
        s.duration_minutes,
        s.notes,
        s.created_at
       FROM study_sessions s
       LEFT JOIN tasks t ON s.task_id = t.id
       LEFT JOIN courses c ON s.course_id = c.id
       WHERE s.id = ?`
    )
    .get(sessionId) as unknown as StudySession;

  return session;
}

/**
 * Get comprehensive study statistics for Day / Week / Month and Streak
 */
export function getStudyStats(): StudyStats {
  const db = getDb();

  // 1. Today's minutes
  const todayRow = db
    .prepare(
      `SELECT COALESCE(SUM(duration_minutes), 0) AS total_minutes
       FROM study_sessions
       WHERE date = date('now')`
    )
    .get() as { total_minutes: number };

  // 2. This week's minutes (last 7 days)
  const weekRow = db
    .prepare(
      `SELECT COALESCE(SUM(duration_minutes), 0) AS total_minutes
       FROM study_sessions
       WHERE date >= date('now', '-7 days')`
    )
    .get() as { total_minutes: number };

  // 3. This month's minutes (last 30 days)
  const monthRow = db
    .prepare(
      `SELECT COALESCE(SUM(duration_minutes), 0) AS total_minutes
       FROM study_sessions
       WHERE date >= date('now', '-30 days')`
    )
    .get() as { total_minutes: number };

  // 4. All-time total minutes
  const totalRow = db
    .prepare(
      `SELECT COALESCE(SUM(duration_minutes), 0) AS total_minutes
       FROM study_sessions`
    )
    .get() as { total_minutes: number };

  // 5. Daily breakdown for the past 7 days (including today)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyBreakdown: DailyBreakdown[] = [];

  for (let i = 6; i >= 0; i--) {
    const dRow = db
      .prepare(
        `SELECT 
          date('now', ?) AS target_date,
          COALESCE(SUM(duration_minutes), 0) AS minutes
         FROM study_sessions
         WHERE date = date('now', ?)`
      )
      .get(`-${i} days`, `-${i} days`) as { target_date: string; minutes: number };

    const targetDateObj = new Date(dRow.target_date + 'T00:00:00');
    const dayName = days[targetDateObj.getDay()];

    dailyBreakdown.push({
      day: i === 0 ? 'Today' : dayName,
      date: dRow.target_date,
      minutes: dRow.minutes,
    });
  }

  // 6. Course distribution
  const courseRows = db
    .prepare(
      `SELECT 
        c.name AS course_name,
        COALESCE(c.color, '#4f91b0') AS color,
        SUM(s.duration_minutes) AS minutes
       FROM study_sessions s
       JOIN courses c ON s.course_id = c.id
       GROUP BY c.id
       ORDER BY minutes DESC`
    )
    .all() as Array<{ course_name: string; color: string; minutes: number }>;

  // 7. Recent sessions
  const recentSessions = db
    .prepare(
      `SELECT 
        s.id,
        s.task_id,
        t.title AS task_title,
        s.course_id,
        COALESCE(c.name, 'Independent Study') AS course_name,
        s.date,
        s.duration_minutes,
        s.notes,
        s.created_at
       FROM study_sessions s
       LEFT JOIN tasks t ON s.task_id = t.id
       LEFT JOIN courses c ON s.course_id = c.id
       ORDER BY s.id DESC
       LIMIT 10`
    )
    .all() as unknown as StudySession[];

  // 8. Calculate study streak (consecutive active days up to today or yesterday)
  const distinctDays = db
    .prepare(
      `SELECT DISTINCT date FROM study_sessions WHERE duration_minutes > 0 ORDER BY date DESC LIMIT 30`
    )
    .all() as Array<{ date: string }>;

  let streakDays = 0;
  if (distinctDays.length > 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const firstDate = distinctDays[0].date;
    if (firstDate === todayStr || firstDate === yesterdayStr) {
      streakDays = 1;
      let checkDate = new Date(firstDate + 'T00:00:00');

      for (let j = 1; j < distinctDays.length; j++) {
        const prevDay = new Date(checkDate.getTime() - 86400000).toISOString().split('T')[0];
        if (distinctDays[j].date === prevDay) {
          streakDays++;
          checkDate = new Date(prevDay + 'T00:00:00');
        } else {
          break;
        }
      }
    }
  }

  return {
    todayMinutes: todayRow.total_minutes || 0,
    weekMinutes: weekRow.total_minutes || 0,
    monthMinutes: monthRow.total_minutes || 0,
    totalMinutes: totalRow.total_minutes || 0,
    streakDays: Math.max(streakDays, 1),
    dailyBreakdown,
    courseDistribution: courseRows,
    recentSessions,
  };
}
