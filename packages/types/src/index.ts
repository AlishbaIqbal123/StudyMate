export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'done';

export interface Student {
  id: number;
  name: string;
  email?: string;
  created_at?: string;
}

export interface Course {
  id: number;
  student_id: number;
  name: string;
  code?: string;
  color?: string;
  instructor?: string;
  created_at?: string;
}

export interface Task {
  id: number;
  course_id: number;
  course_name?: string;
  course_code?: string;
  title: string;
  due_date: string | null;
  priority: TaskPriority;
  est_minutes: number;
  status: TaskStatus;
  created_at?: string;
}

export interface StudySession {
  id: number;
  task_id: number | null;
  task_title?: string;
  course_id?: number;
  course_name?: string;
  date: string;
  duration_minutes: number;
  notes?: string;
  created_at?: string;
}

export interface CourseProgress {
  id: number;
  course_id: number;
  course_name: string;
  course_code?: string;
  course_color?: string;
  completed_pct: number;
  hours_this_week: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
}

export interface StudyPlanBlock {
  order: number;
  type: 'study' | 'break';
  duration_minutes: number;
  task_id?: number;
  task_title?: string;
  course_name?: string;
  description: string;
}

export interface StudyPlan {
  total_minutes: number;
  available_minutes: number;
  focus_course?: string;
  blocks: StudyPlanBlock[];
  summary: string;
}

// MCP Tool Parameter and Response Types

export interface GetTasksParams {
  course?: string;
  due_before?: string;
  due_after?: string;
  status?: TaskStatus | 'all';
}

export interface AddTaskParams {
  title: string;
  course: string;
  due_date?: string;
  est_minutes?: number;
  priority?: TaskPriority;
}

export interface CreateStudyPlanParams {
  available_minutes: number;
  course?: string;
  topics?: string[];
}

export interface UpdateProgressParams {
  task_id: number;
  status: TaskStatus;
  minutes_spent?: number;
}

export interface GetCourseProgressParams {
  course?: string;
}

export interface DailyBreakdown {
  day: string;
  date: string;
  minutes: number;
}

export interface CourseStudyDistribution {
  course_name: string;
  minutes: number;
  color: string;
}

export interface StudyStats {
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  totalMinutes: number;
  streakDays: number;
  dailyBreakdown: DailyBreakdown[];
  courseDistribution: CourseStudyDistribution[];
  recentSessions: StudySession[];
}

export interface McpToolResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}
