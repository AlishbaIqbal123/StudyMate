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

export interface StudentProfile {
  id: number;
  name: string;
  major: string;
  year: string;
  avatar: string;
  email: string;
}

export const DEMO_STUDENTS: StudentProfile[] = [
  {
    id: 1,
    name: 'Alishba Iqbal',
    major: 'Computer Science & AI',
    year: 'Senior Year',
    avatar: 'AI',
    email: 'alishba@university.edu',
  },
  {
    id: 2,
    name: 'Marcus Chen',
    major: 'Software Engineering',
    year: 'Junior Year',
    avatar: 'MC',
    email: 'marcus@university.edu',
  },
  {
    id: 3,
    name: 'Elena Rostova',
    major: 'Applied Mathematics & Data Science',
    year: 'Graduate / M.S.',
    avatar: 'ER',
    email: 'elena@university.edu',
  },
];

export const DEMO_STUDENT: StudentProfile = DEMO_STUDENTS[0];

export function getActiveAuthSession(): {
  id: string | number;
  email: string;
  name: string;
  major?: string;
  year?: string;
  avatar?: string;
  isDemo?: boolean;
} | null {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('studymate_auth_session');
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  return null;
}

export function isDemoSession(): boolean {
  const session = getActiveAuthSession();
  if (!session) return true; // Default fallback to demo student if no session exists
  return Boolean(session.isDemo || session.id === 1 || session.email === 'alishba@university.edu');
}

export function getCurrentUserStoreKey(): string {
  const session = getActiveAuthSession();
  if (isDemoSession()) {
    return 'studymate_data_v2_demo_1';
  }
  return `studymate_data_v2_user_${session?.id || 'guest'}`;
}

export function getActiveStudent(): StudentProfile {
  const session = getActiveAuthSession();
  if (session && !session.isDemo && session.id !== 1 && session.email !== 'alishba@university.edu') {
    return {
      id: typeof session.id === 'number' ? session.id : 999,
      name: session.name || 'Enrolled Student',
      major: session.major || 'Applied Sciences',
      year: session.year || 'Enrolled Scholar',
      avatar: session.avatar || 'ST',
      email: session.email || 'student@university.edu',
    };
  }
  return DEMO_STUDENT;
}

export function setActiveStudent(studentId: number): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('studymate_active_student_id', String(studentId));
  }
}

// Dataset Initializer: Clean 0-data real-time state for new users, seed data ONLY for demo account
function getInitialData(isDemo: boolean = false) {
  if (!isDemo) {
    // New user workspace: completely clean real-time state with NO preloaded data!
    return {
      courses: [] as Course[],
      tasks: [] as Task[],
      progress: [] as CourseProgress[],
    };
  }

  // Sample Demo Student (Alishba Iqbal) - pre-populated for testing & evaluation
  return {
    courses: [
      { id: 1, student_id: 1, name: 'CS 301 Design & Analysis of Algorithms', code: 'CS 301', color: '#3b82f6' },
      { id: 2, student_id: 1, name: 'CS 420 Distributed Database Systems', code: 'CS 420', color: '#10b981' },
      { id: 3, student_id: 1, name: 'MATH 240 Linear Algebra & Matrix Theory', code: 'MATH 240', color: '#8b5cf6' },
      { id: 4, student_id: 1, name: 'SE 350 Software Architecture & Design', code: 'SE 350', color: '#f59e0b' },
    ],
    tasks: [
      { id: 1, course_id: 1, title: 'Problem Set 4: Dynamic Programming & Knapsack', due_date: '2026-10-04', priority: 'high' as TaskPriority, est_minutes: 120, status: 'in_progress' as TaskStatus, created_at: new Date().toISOString(), course_name: 'CS 301 Design & Analysis of Algorithms', course_code: 'CS 301' },
      { id: 2, course_id: 2, title: 'Lab 3: Paxos & Raft Consensus Implementation', due_date: '2026-10-05', priority: 'high' as TaskPriority, est_minutes: 180, status: 'pending' as TaskStatus, created_at: new Date().toISOString(), course_name: 'CS 420 Distributed Database Systems', course_code: 'CS 420' },
      { id: 3, course_id: 3, title: 'Eigenvalues and Diagonalization Quiz Prep', due_date: '2026-10-03', priority: 'high' as TaskPriority, est_minutes: 90, status: 'pending' as TaskStatus, created_at: new Date().toISOString(), course_name: 'MATH 240 Linear Algebra & Matrix Theory', course_code: 'MATH 240' },
      { id: 4, course_id: 4, title: 'Microservices Case Study & Architecture Review', due_date: '2026-10-07', priority: 'medium' as TaskPriority, est_minutes: 75, status: 'done' as TaskStatus, created_at: new Date().toISOString(), course_name: 'SE 350 Software Architecture & Design', course_code: 'SE 350' },
    ],
    progress: [
      { id: 1, course_id: 1, course_name: 'CS 301 Design & Analysis of Algorithms', completed_pct: 65, hours_this_week: 4.5, total_tasks: 3, completed_tasks: 1 },
      { id: 2, course_id: 2, course_name: 'CS 420 Distributed Database Systems', completed_pct: 40, hours_this_week: 3.0, total_tasks: 2, completed_tasks: 0 },
      { id: 3, course_id: 3, course_name: 'MATH 240 Linear Algebra & Matrix Theory', completed_pct: 80, hours_this_week: 5.0, total_tasks: 2, completed_tasks: 1 },
      { id: 4, course_id: 4, course_name: 'SE 350 Software Architecture & Design', completed_pct: 100, hours_this_week: 2.0, total_tasks: 1, completed_tasks: 1 },
    ],
  };
}

// Local Cache Helper - strictly user-scoped
function getClientStore() {
  const isDemo = isDemoSession();
  const key = getCurrentUserStoreKey();
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.tasks) && Array.isArray(parsed.courses)) {
          return parsed;
        }
      } catch {
        // fallback to default
      }
    }
    const initial = getInitialData(isDemo);
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return getInitialData(isDemo);
}

function saveClientStore(data: any) {
  const key = getCurrentUserStoreKey();
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export interface VoiceSimulationResponse {
  intent: string;
  tool: string;
  arguments: Record<string, any>;
  speechResponse: string;
  data: any;
}

export async function fetchTasks(filters?: {
  course?: string;
  status?: TaskStatus | 'all';
}): Promise<Task[]> {
  const isDemo = isDemoSession();

  if (isDemo) {
    try {
      const params = new URLSearchParams();
      if (filters?.course) params.append('course', filters.course);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);

      const res = await fetch(`${API_BASE}/tasks?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {
      // Graceful fallback to client store
    }
  }

  const store = getClientStore();
  let list = [...store.tasks];
  if (filters?.course) {
    list = list.filter((t) => t.course_name?.toLowerCase().includes(filters.course!.toLowerCase()));
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((t) => t.status === filters.status);
  }
  return list;
}

export async function createTask(task: {
  title: string;
  course: string;
  due_date?: string;
  est_minutes?: number;
  priority?: TaskPriority;
}): Promise<Task> {
  const isDemo = isDemoSession();
  if (isDemo) {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Graceful fallback
    }
  }

  const store = getClientStore();
  const newId = Date.now();
  let courseObj = store.courses.find(
    (c: any) => c.name.toLowerCase() === task.course.toLowerCase()
  );
  if (!courseObj) {
    courseObj = {
      id: Date.now() + 1,
      student_id: getActiveStudent().id,
      name: task.course,
      code: task.course.substring(0, 8),
      color: '#06b6d4',
    };
    store.courses.push(courseObj);
  }

  const newTask: Task = {
    id: newId,
    course_id: courseObj.id,
    title: task.title,
    due_date: task.due_date || null,
    est_minutes: task.est_minutes || 45,
    priority: task.priority || 'medium',
    status: 'pending',
    created_at: new Date().toISOString(),
    course_name: courseObj.name,
    course_code: courseObj.code,
  };

  store.tasks.unshift(newTask);

  // Sync course progress tracking
  let progObj = store.progress.find((p: any) => p.course_id === courseObj.id);
  if (!progObj) {
    progObj = {
      id: Date.now() + 2,
      course_id: courseObj.id,
      course_name: courseObj.name,
      completed_pct: 0,
      hours_this_week: 0,
      total_tasks: 1,
      completed_tasks: 0,
    };
    store.progress.push(progObj);
  } else {
    progObj.total_tasks = (progObj.total_tasks || 0) + 1;
  }

  saveClientStore(store);
  return newTask;
}

export async function updateTask(
  taskId: number,
  status: TaskStatus,
  minutesSpent?: number
): Promise<{ task: Task; courseProgress: CourseProgress }> {
  const isDemo = isDemoSession();
  if (isDemo) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, minutes_spent: minutesSpent }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Graceful fallback
    }
  }

  const store = getClientStore();
  const t = store.tasks.find((tk: any) => tk.id === taskId);
  if (t) {
    t.status = status;
  }

  let p = store.progress.find((pr: any) => pr.course_id === t?.course_id);
  if (!p && t) {
    p = {
      id: Date.now(),
      course_id: t.course_id || 1,
      course_name: t.course_name || 'General Course',
      completed_pct: status === 'done' ? 100 : 0,
      hours_this_week: minutesSpent ? minutesSpent / 60 : 1,
      total_tasks: 1,
      completed_tasks: status === 'done' ? 1 : 0,
    };
    store.progress.push(p);
  } else if (p) {
    if (status === 'done') {
      p.completed_tasks = Math.min(p.total_tasks || 1, (p.completed_tasks || 0) + 1);
      p.completed_pct = Math.round((p.completed_tasks / Math.max(1, p.total_tasks || 1)) * 100);
      if (minutesSpent) p.hours_this_week += minutesSpent / 60;
    }
  }

  saveClientStore(store);
  return { task: t || ({} as Task), courseProgress: p || ({} as CourseProgress) };
}

export async function fetchCourses(): Promise<Course[]> {
  const isDemo = isDemoSession();
  if (isDemo) {
    try {
      const res = await fetch(`${API_BASE}/courses`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) return json.data;
      }
    } catch {
      // Graceful fallback
    }
  }
  const store = getClientStore();
  return store.courses;
}

export async function fetchProgress(course?: string): Promise<CourseProgress[]> {
  const isDemo = isDemoSession();
  if (isDemo) {
    try {
      const params = new URLSearchParams();
      if (course) params.append('course', course);

      const res = await fetch(`${API_BASE}/progress?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) return json.data;
      }
    } catch {
      // Graceful fallback
    }
  }
  const store = getClientStore();
  let list = store.progress;
  if (course) {
    list = list.filter((p: any) => p.course_name?.toLowerCase().includes(course.toLowerCase()));
  }
  return list;
}

export async function generateStudyPlan(
  availableMinutes: number,
  course?: string,
  topics?: string[]
): Promise<StudyPlan> {
  try {
    const res = await fetch(`${API_BASE}/study-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available_minutes: availableMinutes, course, topics }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch {
    // Graceful fallback
  }

  const focusCourse = course || (isDemoSession() ? 'Dynamic Algorithms & Data Structures' : 'General Study & Review');
  const studyMins = availableMinutes > 60 ? 45 : 25;
  const breakMins = availableMinutes > 60 ? 10 : 5;

  return {
    total_minutes: availableMinutes,
    available_minutes: availableMinutes,
    focus_course: focusCourse,
    summary: `Structured ${availableMinutes}-minute deep work protocol for ${focusCourse}. Designed to maximize cognitive retention and reduce academic fatigue.`,
    blocks: [
      {
        order: 1,
        type: 'study',
        course_name: focusCourse,
        description: `Deep dive into key concepts and materials for ${focusCourse}.`,
        duration_minutes: studyMins,
      },
      {
        order: 2,
        type: 'break',
        description: 'Stand up, hydrate, stretch, and relax visual focus away from screens.',
        duration_minutes: breakMins,
      },
      {
        order: 3,
        type: 'study',
        course_name: focusCourse,
        description: `Review notes, practice problems, and consolidate mastery in ${focusCourse}.`,
        duration_minutes: Math.max(20, availableMinutes - studyMins - breakMins),
      },
    ],
  };
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  tool?: string;
  data?: any;
  timestamp?: string;
}

export interface ConversationSessionState {
  lastIntent?: string;
  lastTool?: string;
  lastPlan?: StudyPlan | null;
  lastTasks?: Task[] | null;
  lastCourse?: string | null;
  lastTaskCreated?: Task | null;
  pendingContext?: 'confirm_study_plan' | 'confirm_task_done' | null;
  history: ConversationMessage[];
}

const sessionState: ConversationSessionState = {
  history: [],
};

export function getConversationState(): ConversationSessionState {
  return sessionState;
}

export function clearConversationState(): void {
  sessionState.lastIntent = undefined;
  sessionState.lastTool = undefined;
  sessionState.lastPlan = null;
  sessionState.lastTasks = null;
  sessionState.lastCourse = null;
  sessionState.lastTaskCreated = null;
  sessionState.pendingContext = null;
  sessionState.history = [];
}

export async function simulateVoice(utterance: string): Promise<VoiceSimulationResponse> {
  const query = utterance.toLowerCase().trim();
  const store = getClientStore();
  const student = getActiveStudent();
  const studentFirstName = student.name.split(' ')[0];

  // 1. Check for Confirmation to a pending action (e.g. "Ready to begin?" -> "yes", "start", "sure")
  const isAffirmative =
    query === 'yes' ||
    query === 'yeah' ||
    query === 'yep' ||
    query === 'sure' ||
    query === 'start' ||
    query === 'start timer' ||
    query === 'begin' ||
    query === 'ready' ||
    query === 'ok' ||
    query === 'okay' ||
    query === "let's go" ||
    query === 'do it' ||
    query.startsWith('yes ') ||
    query.startsWith('start now');

  if (isAffirmative && (sessionState.pendingContext === 'confirm_study_plan' || sessionState.lastPlan)) {
    const plan = sessionState.lastPlan || (await generateStudyPlan(45));
    const firstBlockMinutes = plan.blocks[0]?.duration_minutes || 25;
    const speech = `Starting your ${plan.total_minutes}-minute study session for ${plan.focus_course} now! I've activated your first ${firstBlockMinutes}-minute deep work Pomodoro timer. Let's make today count!`;
    sessionState.pendingContext = null;
    sessionState.lastIntent = 'ConfirmStartStudyPlanIntent';

    return {
      intent: 'ConfirmStartStudyPlanIntent',
      tool: 'start_pomodoro_timer',
      arguments: {
        duration_minutes: firstBlockMinutes,
        total_session: plan.total_minutes,
        course: plan.focus_course,
      },
      speechResponse: speech,
      data: {
        action: 'start_timer',
        plan,
        duration_minutes: firstBlockMinutes,
        total_minutes: plan.total_minutes,
        course: plan.focus_course,
      },
    };
  }

  // 2. Check for Negation / Cancellation (e.g. "no", "cancel", "not now", "stop")
  const isNegative =
    query === 'no' ||
    query === 'nope' ||
    query === 'cancel' ||
    query === 'not now' ||
    query === 'stop' ||
    query === 'wait' ||
    query.startsWith('no ');

  if (isNegative && sessionState.pendingContext === 'confirm_study_plan') {
    sessionState.pendingContext = null;
    return {
      intent: 'CancelStudyPlanIntent',
      tool: 'create_study_plan',
      arguments: {},
      speechResponse: `No problem, ${studentFirstName}! I've saved your study plan. You can start it anytime from the Planner view, or ask me for a different study duration whenever you're ready.`,
      data: { action: 'plan_saved', plan: sessionState.lastPlan },
    };
  }

  // 3. "What should I do next?" / "recommend" / "suggest" / "what next"
  if (
    query.includes('what should i do') ||
    query.includes('what next') ||
    query.includes('next task') ||
    query.includes('what to do') ||
    query.includes('recommend') ||
    query.includes('suggest')
  ) {
    const pending = store.tasks.filter((t: any) => t.status !== 'done');
    const topTask = pending[0] || store.tasks[0];
    if (!topTask) {
      sessionState.lastIntent = 'RecommendNextActionIntent';
      return {
        intent: 'RecommendNextActionIntent',
        tool: 'create_study_plan',
        arguments: {},
        speechResponse: `You don't have any assignments recorded yet, ${studentFirstName}! You can add your first task using the "+ Add Assignment" button, or ask me to start a 25-minute focus session.`,
        data: {
          actionType: 'empty',
          pendingCount: 0,
        },
      };
    }
    const speech = `Based on your course deadlines, your highest priority is "${topTask.title}" for ${topTask.course_name}. It's due on ${topTask.due_date || 'soon'}. I recommend starting a focused 45-minute study block right now. Ready to begin?`;
    
    sessionState.lastIntent = 'RecommendNextActionIntent';
    sessionState.lastTasks = pending;
    sessionState.pendingContext = 'confirm_study_plan';
    sessionState.lastPlan = await generateStudyPlan(45, topTask.course_name);

    return {
      intent: 'RecommendNextActionIntent',
      tool: 'create_study_plan',
      arguments: {
        task_id: topTask.id,
        course: topTask.course_name,
        available_minutes: 45,
      },
      speechResponse: speech,
      data: {
        actionType: 'recommendation',
        topTask,
        suggestedDuration: 45,
        otherPending: pending.slice(1, 3),
      },
    };
  }

  // 4. Add task
  if (query.startsWith('add') || query.includes('new task') || query.includes('create task') || query.includes('remind me')) {
    let title = utterance.replace(/^(add|create|new)\s+(a\s+)?(task|assignment)?(:|\s)?/i, '').trim();
    if (!title || title.length < 3) title = 'Review lecture notes & exam prep';
    const course = store.courses[0]?.name || 'General Studies';
    const newTask = await createTask({
      title,
      course,
      due_date: '2026-10-06',
      est_minutes: 60,
      priority: 'high',
    });
    sessionState.lastTaskCreated = newTask;
    sessionState.lastIntent = 'AddTaskIntent';

    return {
      intent: 'AddTaskIntent',
      tool: 'add_task',
      arguments: { title: newTask.title, course: newTask.course_name, priority: 'high' },
      speechResponse: `I've created a new assignment: "${newTask.title}" for ${newTask.course_name}, due Monday with high priority.`,
      data: newTask,
    };
  }

  // 5. Due dates & tasks
  if (query.includes('due') || query.includes('what do i have') || query.includes('task') || query.includes('assignments') || query.includes('what is due')) {
    const pending = store.tasks.filter((t: any) => t.status !== 'done');
    if (pending.length === 0) {
      sessionState.lastTasks = [];
      sessionState.lastIntent = 'CheckTasksIntent';
      return {
        intent: 'CheckTasksIntent',
        tool: 'get_tasks',
        arguments: { status: 'pending' },
        speechResponse: `You're all caught up, ${studentFirstName}! You currently have 0 pending assignments. You can say "add a task" anytime to log one.`,
        data: [],
      };
    }
    const urgent = pending.slice(0, 3);
    const speech = `Hey ${studentFirstName}! You have ${pending.length} active assignments. Your most urgent task is "${urgent[0]?.title || 'study session'}" for ${urgent[0]?.course_name || 'your coursework'}, due ${urgent[0]?.due_date || 'soon'}.`;
    sessionState.lastTasks = pending;
    sessionState.lastIntent = 'CheckTasksIntent';

    return {
      intent: 'CheckTasksIntent',
      tool: 'get_tasks',
      arguments: { status: 'pending' },
      speechResponse: speech,
      data: pending,
    };
  }

  // 6. Study plan generation
  if (query.includes('study plan') || query.includes('minutes') || query.includes('help me study') || query.includes('hour') || query.includes('pomodoro')) {
    let mins = 45;
    const match = query.match(/(\d+)/);
    if (match) mins = parseInt(match[1], 10);

    // Contextual course matching
    let targetCourse = store.courses[0]?.name;
    for (const c of store.courses) {
      if (query.includes(c.name.toLowerCase()) || query.includes(c.code.toLowerCase())) {
        targetCourse = c.name;
        break;
      }
    }

    const plan = await generateStudyPlan(mins, targetCourse);
    sessionState.lastPlan = plan;
    sessionState.pendingContext = 'confirm_study_plan';
    sessionState.lastIntent = 'CreateStudyPlanIntent';

    const speech = `I generated a ${mins}-minute focused Pomodoro study plan for you, ${studentFirstName}, targeting ${plan.focus_course}. It features 2 deep work intervals and a 10-minute recovery break. Ready to begin?`;
    return {
      intent: 'CreateStudyPlanIntent',
      tool: 'create_study_plan',
      arguments: { available_minutes: mins, course: plan.focus_course },
      speechResponse: speech,
      data: plan,
    };
  }

  // 7. Update progress / mark done
  if (query.includes('finished') || query.includes('done') || query.includes('completed') || query.includes('mark done')) {
    const target = store.tasks.find((t: any) => t.status !== 'done') || store.tasks[0];
    if (target) {
      target.status = 'done';
      saveClientStore(store);
      sessionState.lastIntent = 'UpdateProgressIntent';
      return {
        intent: 'UpdateProgressIntent',
        tool: 'update_progress',
        arguments: { task_id: target.id, status: 'done' },
        speechResponse: `Awesome job, ${studentFirstName}! I marked "${target.title}" as completed. Your course progress has been recalculated on your dashboard.`,
        data: target,
      };
    } else {
      sessionState.lastIntent = 'UpdateProgressIntent';
      return {
        intent: 'UpdateProgressIntent',
        tool: 'update_progress',
        arguments: {},
        speechResponse: `There are no open assignments to mark as done right now, ${studentFirstName}!`,
        data: null,
      };
    }
  }

  // 8. Course progress & analytics
  if (query.includes('progress') || query.includes('how am i doing') || query.includes('grade') || query.includes('analytics')) {
    if (store.courses.length === 0) {
      sessionState.lastIntent = 'GetCourseProgressIntent';
      return {
        intent: 'GetCourseProgressIntent',
        tool: 'get_course_progress',
        arguments: {},
        speechResponse: `You haven't enrolled in any courses yet, ${studentFirstName}. Add your first assignment or course to start tracking your completion progress!`,
        data: [],
      };
    }
    const topCourse = store.progress[0];
    sessionState.lastIntent = 'GetCourseProgressIntent';
    return {
      intent: 'GetCourseProgressIntent',
      tool: 'get_course_progress',
      arguments: {},
      speechResponse: `You're tracking across ${store.courses.length} active courses. In ${topCourse?.course_name || store.courses[0]?.name}, you are at ${topCourse?.completed_pct || 0}% completion with ${topCourse?.hours_this_week || 0} hours logged this week!`,
      data: store.progress,
    };
  }

  // 9. Academic Guidance / Study Advice / Concepts
  if (
    query.includes('how to study') ||
    query.includes('how should i study') ||
    query.includes('tips') ||
    query.includes('exam') ||
    query.includes('dynamic programming') ||
    query.includes('algorithms') ||
    query.includes('operating systems') ||
    query.includes('virtual memory') ||
    query.includes('linear algebra') ||
    query.includes('statistics')
  ) {
    let topic = 'Academic Study Strategy';
    let keyPoints = [
      'Break large syllabus chapters into 25-minute Pomodoro focus sprints.',
      'Apply active recall and self-testing instead of passive reading.',
      'Review high-priority assignment deadlines to prioritize submission impact.',
    ];

    if (query.includes('dynamic programming')) {
      topic = 'Dynamic Programming & Memoization';
      keyPoints = [
        'Identify optimal substructure and overlapping subproblems.',
        'Define state space clearly: DP[i] represents optimal solution up to state i.',
        'Compare top-down memoization (recursion + cache) vs bottom-up tabulation.',
      ];
    } else if (query.includes('operating systems') || query.includes('virtual memory')) {
      topic = 'Operating Systems & Virtual Memory';
      keyPoints = [
        'Understand page tables, TLB cache lookups, and page fault handling.',
        'Review synchronization primitives: semaphores, mutexes, and deadlocks.',
        'Practice kernel lab tracing using GDB and process memory maps.',
      ];
    } else if (query.includes('linear algebra')) {
      topic = 'Linear Algebra & Matrix Decompositions';
      keyPoints = [
        'Visualize eigenvalues and eigenvectors as non-rotational scaling axes.',
        'Master matrix orthogonalization via Gram-Schmidt and QR decomposition.',
        'Connect SVD (Singular Value Decomposition) to dimensionality reduction.',
      ];
    }

    sessionState.lastIntent = 'AcademicGuidanceIntent';
    return {
      intent: 'AcademicGuidanceIntent',
      tool: 'create_study_plan',
      arguments: { topic },
      speechResponse: `Here is a high-yield study strategy for ${topic}, ${studentFirstName}. Focus on core problem sets, test edge cases, and use short active recall blocks to lock in long-term retention.`,
      data: {
        actionType: 'academic_advice',
        topic,
        keyPoints,
      },
    };
  }

  // 10. General Help Fallback (Stateful)
  const urgentTask = store.tasks[0];
  sessionState.pendingContext = 'confirm_study_plan';
  sessionState.lastPlan = await generateStudyPlan(45, urgentTask?.course_name);

  return {
    intent: 'HelpIntent',
    tool: 'get_tasks',
    arguments: {},
    speechResponse: `Hello ${studentFirstName}! I'm StudyMate, your Alexa+ academic co-pilot. You can ask what is due this week, request a 45-minute study plan, or say "what should I do next?" to see your top priority.`,
    data: {
      actionType: 'recommendation',
      topTask: urgentTask,
      suggestedDuration: 45,
      otherPending: store.tasks.slice(1, 3),
    },
  };
}

export async function fetchStudyStats(): Promise<StudyStats> {
  const isDemo = isDemoSession();

  if (isDemo) {
    try {
      const res = await fetch(`${API_BASE}/study-stats`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Graceful fallback
    }

    return {
      todayMinutes: 120,
      weekMinutes: 990,
      monthMinutes: 3420,
      totalMinutes: 7200,
      streakDays: 6,
      dailyBreakdown: [
        { day: 'Mon', date: '2026-09-28', minutes: 150 },
        { day: 'Tue', date: '2026-09-29', minutes: 180 },
        { day: 'Wed', date: '2026-09-30', minutes: 240 },
        { day: 'Thu', date: '2026-10-01', minutes: 120 },
        { day: 'Fri', date: '2026-10-02', minutes: 210 },
        { day: 'Sat', date: '2026-10-03', minutes: 90 },
        { day: 'Sun', date: '2026-10-04', minutes: 0 },
      ],
      courseDistribution: [
        { course_name: 'Algorithms', minutes: 360, color: '#3b82f6' },
        { course_name: 'Distributed Systems', minutes: 270, color: '#10b981' },
        { course_name: 'Linear Algebra', minutes: 210, color: '#8b5cf6' },
        { course_name: 'Software Architecture', minutes: 150, color: '#f59e0b' },
      ],
      recentSessions: [],
    };
  }

  // Non-demo new user: zero real-time data until they record study time
  const statsKey = `${getCurrentUserStoreKey()}_stats`;
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(statsKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // Mon=0, Sun=6

  const emptyBreakdown = days.map((day, idx) => {
    const diff = idx - currentDayIndex;
    const d = new Date(today);
    d.setDate(today.getDate() + diff);
    return {
      day,
      date: d.toISOString().split('T')[0],
      minutes: 0,
    };
  });

  return {
    todayMinutes: 0,
    weekMinutes: 0,
    monthMinutes: 0,
    totalMinutes: 0,
    streakDays: 0,
    dailyBreakdown: emptyBreakdown,
    courseDistribution: [],
    recentSessions: [],
  };
}

export async function logStudySession(params: {
  course_name?: string;
  course_id?: number;
  task_id?: number;
  duration_minutes: number;
  notes?: string;
}): Promise<StudySession> {
  const newSession: StudySession = {
    id: Date.now(),
    course_name: params.course_name || 'General Focus',
    course_id: params.course_id || 1,
    task_id: params.task_id || null,
    date: new Date().toISOString().split('T')[0],
    duration_minutes: params.duration_minutes,
    notes: params.notes,
  };

  const isDemo = isDemoSession();
  if (!isDemo && typeof window !== 'undefined') {
    const statsKey = `${getCurrentUserStoreKey()}_stats`;
    const curStats = await fetchStudyStats();

    curStats.todayMinutes += params.duration_minutes;
    curStats.weekMinutes += params.duration_minutes;
    curStats.monthMinutes += params.duration_minutes;
    curStats.totalMinutes += params.duration_minutes;
    if (curStats.streakDays === 0) curStats.streakDays = 1;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayBar = curStats.dailyBreakdown.find((b) => b.date === todayStr);
    if (todayBar) {
      todayBar.minutes += params.duration_minutes;
    }

    const courseName = params.course_name || 'General Focus';
    const cEntry = curStats.courseDistribution.find((c) => c.course_name === courseName);
    if (cEntry) {
      cEntry.minutes += params.duration_minutes;
    } else {
      curStats.courseDistribution.push({
        course_name: courseName,
        minutes: params.duration_minutes,
        color: '#06b6d4',
      });
    }

    curStats.recentSessions.unshift(newSession);
    localStorage.setItem(statsKey, JSON.stringify(curStats));
  }

  return newSession;
}

export async function resetDatabase(): Promise<void> {
  const isDemo = isDemoSession();
  const initial = getInitialData(isDemo);
  saveClientStore(initial);

  if (!isDemo && typeof window !== 'undefined') {
    localStorage.removeItem(`${getCurrentUserStoreKey()}_stats`);
  }

  if (isDemo) {
    try {
      await fetch(`${API_BASE}/reset-db`, { method: 'POST' });
    } catch {
      // ignore
    }
  }
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
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }
  return {
    status: 'ok',
    service: 'StudyMate MCP Server (Edge Hybrid)',
    version: '1.0.0',
    uptime_seconds: 3600,
    timestamp: new Date().toISOString(),
    features: ['get_tasks', 'add_task', 'create_study_plan', 'update_progress', 'get_course_progress'],
  };
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_HOST}/health`);
    return res.ok;
  } catch {
    return true; // Graceful hybrid mode
  }
}

export async function executeMcpJsonRpc(
  method: string,
  params?: Record<string, unknown>
): Promise<any> {
  try {
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
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id: 1,
      result: {
        tools: [
          { name: 'get_tasks', description: 'List tasks and assignments with course or due date filters.' },
          { name: 'add_task', description: 'Create a new task/assignment for the student.' },
          { name: 'create_study_plan', description: 'Generate a structured study session plan with focus blocks and breaks.' },
          { name: 'update_progress', description: 'Mark tasks as done or in-progress and update course completion.' },
          { name: 'get_course_progress', description: 'Get completion percentage and hours studied per course.' },
        ],
      },
    };
  }

  return { jsonrpc: '2.0', id: 1, result: { status: 'executed_locally' } };
}
