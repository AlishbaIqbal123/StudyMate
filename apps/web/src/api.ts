import type {
  Course,
  CourseProgress,
  StudyPlan,
  StudySession,
  StudyStats,
  Task,
  TaskPriority,
  TaskStatus,
} from '@studymate/types';

const API_HOST = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE = `${API_HOST}/api`;

export interface VoiceSimulationResponse {
  intent: string;
  tool: string;
  arguments: Record<string, unknown>;
  speechResponse: string;
  data: unknown;
}

export async function fetchTasks(filters?: {
  course?: string;
  status?: TaskStatus | 'all';
}): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.course) params.append('course', filters.course);
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);

  const res = await fetch(`${API_BASE}/tasks?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const json = await res.json();
  return json.data;
}

export async function createTask(task: {
  title: string;
  course: string;
  due_date?: string;
  est_minutes?: number;
  priority?: TaskPriority;
}): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Failed to create task');
  const json = await res.json();
  return json.data;
}

export async function updateTask(
  taskId: number,
  status: TaskStatus,
  minutesSpent?: number
): Promise<{ task: Task; courseProgress: CourseProgress }> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, minutes_spent: minutesSpent }),
  });
  if (!res.ok) throw new Error('Failed to update task');
  const json = await res.json();
  return json.data;
}

export async function fetchCourses(): Promise<Course[]> {
  const res = await fetch(`${API_BASE}/courses`);
  if (!res.ok) throw new Error('Failed to fetch courses');
  const json = await res.json();
  return json.data;
}

export async function fetchProgress(course?: string): Promise<CourseProgress[]> {
  const params = new URLSearchParams();
  if (course) params.append('course', course);

  const res = await fetch(`${API_BASE}/progress?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch progress');
  const json = await res.json();
  return json.data;
}

export async function generateStudyPlan(
  availableMinutes: number,
  course?: string,
  topics?: string[]
): Promise<StudyPlan> {
  const res = await fetch(`${API_BASE}/study-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ available_minutes: availableMinutes, course, topics }),
  });
  if (!res.ok) throw new Error('Failed to generate study plan');
  const json = await res.json();
  return json.data;
}

export async function simulateVoice(utterance: string): Promise<VoiceSimulationResponse> {
  const res = await fetch(`${API_BASE}/simulate-voice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ utterance }),
  });
  if (!res.ok) throw new Error('Failed to simulate voice utterance');
  const json = await res.json();
  return json.data;
}

export async function fetchStudyStats(): Promise<StudyStats> {
  const res = await fetch(`${API_BASE}/study-stats`);
  if (!res.ok) throw new Error('Failed to fetch study statistics');
  const json = await res.json();
  return json.data;
}

export async function logStudySession(params: {
  course_name?: string;
  course_id?: number;
  task_id?: number;
  duration_minutes: number;
  notes?: string;
}): Promise<StudySession> {
  const res = await fetch(`${API_BASE}/study-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to log study session');
  const json = await res.json();
  return json.data;
}

export async function resetDatabase(): Promise<void> {
  const res = await fetch(`${API_BASE}/reset-db`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset database');
}

export interface ServerHealthDetails {
  status: string;
  service: string;
  version: string;
  uptime_seconds: number;
  timestamp: string;
  features: string[];
}

export async function fetchHealthDetails(): Promise<ServerHealthDetails | null> {
  try {
    const res = await fetch(`${API_HOST}/health`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_HOST}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function executeMcpJsonRpc(
  method: string,
  params?: Record<string, unknown>
): Promise<any> {
  const payload = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    ...(params ? { params } : {}),
  };
  const res = await fetch(`${API_HOST}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
  }
  return await res.json();
}

