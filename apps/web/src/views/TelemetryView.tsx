import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Server,
  Play,
  Copy,
  Check,
  RefreshCw,
  Database,
  ShieldCheck,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Code2,
  Zap,
  ListTodo,
  PlusCircle,
  Timer,
  BarChart3,
  CheckSquare,
} from 'lucide-react';
import {
  fetchHealthDetails,
  executeMcpJsonRpc,
  type ServerHealthDetails,
} from '../api.js';
import type { Course, CourseProgress, Task } from '@studymate/types';

interface TelemetryViewProps {
  tasks: Task[];
  courses: Course[];
  progressList: CourseProgress[];
  onDataChanged: () => void;
}

type ActionKey = 'get_tasks' | 'add_task' | 'create_study_plan' | 'get_course_progress' | 'update_progress';

interface ActionMeta {
  id: ActionKey;
  label: string;
  shortDesc: string;
  icon: any;
  badge: string;
}

const ACTIONS: ActionMeta[] = [
  {
    id: 'get_tasks',
    label: 'Check My Tasks',
    shortDesc: 'Ask the assistant to list your pending assignments and deadlines',
    icon: ListTodo,
    badge: 'Query',
  },
  {
    id: 'create_study_plan',
    label: 'Generate Study Plan',
    shortDesc: 'Ask the assistant to build a step-by-step Pomodoro schedule',
    icon: Timer,
    badge: 'Planner',
  },
  {
    id: 'add_task',
    label: 'Add Sample Task',
    shortDesc: 'Send a new assignment with deadline and priority to your database',
    icon: PlusCircle,
    badge: 'Create',
  },
  {
    id: 'get_course_progress',
    label: 'Check Course Progress',
    shortDesc: 'Review overall completion percentages and weekly study hours',
    icon: BarChart3,
    badge: 'Analytics',
  },
  {
    id: 'update_progress',
    label: 'Update Task Status',
    shortDesc: 'Mark an assignment complete and log study minutes',
    icon: CheckSquare,
    badge: 'Update',
  },
];

export const TelemetryView: React.FC<TelemetryViewProps> = ({
  tasks,
  courses,
  progressList,
  onDataChanged,
}) => {
  const [health, setHealth] = useState<ServerHealthDetails | null>(null);
  const [activeAction, setActiveAction] = useState<ActionKey>('get_tasks');
  const [executing, setExecuting] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [activeDbTab, setActiveDbTab] = useState<'tasks' | 'courses' | 'progress'>('tasks');
  const [copiedTunnel, setCopiedTunnel] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Form states for simple action controls
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterCourse, setFilterCourse] = useState<string>('');

  const [newTaskTitle, setNewTaskTitle] = useState('Prepare Midterm Practice Exam');
  const [newTaskCourse, setNewTaskCourse] = useState(courses[0]?.name || 'CS 420: Distributed Systems');
  const [newTaskDue, setNewTaskDue] = useState('2026-10-15');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [newTaskEstMinutes, setNewTaskEstMinutes] = useState(90);

  const [planMinutes, setPlanMinutes] = useState(90);
  const [planCourse, setPlanCourse] = useState(courses[0]?.name || 'CS 420: Distributed Systems');

  const [progressCourse, setProgressCourse] = useState('');

  const [updateTaskId, setUpdateTaskId] = useState<number>(tasks[0]?.id || 1);
  const [updateStatus, setUpdateStatus] = useState<'pending' | 'in_progress' | 'done'>('done');
  const [updateMinutes, setUpdateMinutes] = useState(45);

  // Output states
  const [resultData, setResultData] = useState<any>(null);
  const [rawOutput, setRawOutput] = useState<string | null>(null);

  // Friendly Activity Stream
  const [activityFeed, setActivityFeed] = useState<
    Array<{ id: string; time: string; title: string; subtitle: string; success: boolean }>
  >([
    {
      id: 'init-1',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: 'Assistant Ready & Connected',
      subtitle: 'StudyMate is synced with your local storage and ready for voice commands.',
      success: true,
    },
  ]);

  const loadHealth = async () => {
    const data = await fetchHealthDetails();
    setHealth(data);
  };

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 6000);
    return () => clearInterval(interval);
  }, []);

  // Update default course pickers when courses load
  useEffect(() => {
    if (courses.length > 0 && !filterCourse) {
      setNewTaskCourse(courses[0].name);
      setPlanCourse(courses[0].name);
    }
  }, [courses]);

  useEffect(() => {
    if (tasks.length > 0) {
      setUpdateTaskId(tasks[0].id);
    }
  }, [tasks]);

  const buildPayload = (): Record<string, unknown> => {
    switch (activeAction) {
      case 'get_tasks': {
        const payload: Record<string, unknown> = {};
        if (filterStatus && filterStatus !== 'all') payload.status = filterStatus;
        if (filterCourse) payload.course = filterCourse;
        return payload;
      }
      case 'add_task':
        return {
          title: newTaskTitle,
          course: newTaskCourse,
          due_date: newTaskDue,
          est_minutes: newTaskEstMinutes,
          priority: newTaskPriority,
        };
      case 'create_study_plan':
        return {
          available_minutes: planMinutes,
          course: planCourse,
        };
      case 'get_course_progress': {
        const payload: Record<string, unknown> = {};
        if (progressCourse) payload.course = progressCourse;
        return payload;
      }
      case 'update_progress':
        return {
          task_id: Number(updateTaskId),
          status: updateStatus,
          minutes_spent: updateMinutes,
        };
      default:
        return {};
    }
  };

  const handleRunAction = async () => {
    setExecuting(true);
    setResultData(null);
    setRawOutput(null);
    const startTime = performance.now();

    const currentMeta = ACTIONS.find((a) => a.id === activeAction);
    const actionLabel = currentMeta?.label || activeAction;

    try {
      const payload = buildPayload();
      const res = await executeMcpJsonRpc('tools/call', {
        name: activeAction,
        arguments: payload,
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLatency(elapsed);
      setRawOutput(JSON.stringify(res, null, 2));

      // Parse friendly output
      let parsedContent: any = null;
      if (res?.result?.content?.[0]?.text) {
        try {
          parsedContent = JSON.parse(res.result.content[0].text);
        } catch {
          parsedContent = res.result.content[0].text;
        }
      } else {
        parsedContent = res;
      }
      setResultData(parsedContent);

      setActivityFeed((prev) => [
        {
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: `Ran "${actionLabel}"`,
          subtitle: `Completed in ${elapsed}ms. Synchronized with your study schedule.`,
          success: true,
        },
        ...prev.slice(0, 9),
      ]);

      if (['add_task', 'update_progress'].includes(activeAction)) {
        onDataChanged();
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setLatency(elapsed);
      setRawOutput(JSON.stringify({ error: err.message }, null, 2));
      setResultData({ error: err.message || 'Action failed' });

      setActivityFeed((prev) => [
        {
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: `Error running "${actionLabel}"`,
          subtitle: err.message || 'Could not complete action.',
          success: false,
        },
        ...prev.slice(0, 9),
      ]);
    } finally {
      setExecuting(false);
    }
  };

  const handleCopyTunnel = () => {
    navigator.clipboard.writeText('./bin/cloudflared.exe tunnel --url http://localhost:3000');
    setCopiedTunnel(true);
    setTimeout(() => setCopiedTunnel(false), 2000);
  };

  const handleCopyRaw = () => {
    if (!rawOutput) return;
    navigator.clipboard.writeText(rawOutput);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Welcoming & Simple Status Banner */}
      <div className="rounded-2xl p-5 bg-app-card border border-app-border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Assistant Info */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3895c7] to-[#4f91b0] flex items-center justify-center text-white shadow-md shadow-[#4f91b0]/20 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-headline text-lg font-bold text-app-text">
                  AI Assistant & Sync Center
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ready & Synced</span>
                </span>
              </div>
              <p className="text-xs text-app-muted mt-0.5">
                Test your assistant actions, check connection health, and explore your saved academic data.
              </p>
            </div>
          </div>

          {/* Clean Human-Friendly Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="px-3.5 py-2.5 rounded-xl bg-app-subtle border border-app-border">
              <div className="text-[10px] font-semibold uppercase text-app-muted">Connection</div>
              <div className="text-xs font-headline font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{health?.status === 'ok' ? 'Online' : 'Connecting'}</span>
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-app-subtle border border-app-border">
              <div className="text-[10px] font-semibold uppercase text-app-muted">System Active</div>
              <div className="text-xs font-headline font-bold text-app-text mt-0.5">
                {health ? formatUptime(health.uptime_seconds) : '---'}
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-app-subtle border border-app-border">
              <div className="text-[10px] font-semibold uppercase text-app-muted">Smart Skills</div>
              <div className="text-xs font-headline font-bold text-[#4f91b0] mt-0.5">
                5 Available
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-app-subtle border border-app-border">
              <div className="text-[10px] font-semibold uppercase text-app-muted">Storage</div>
              <div className="text-xs font-headline font-bold text-app-text mt-0.5">
                100% Free & Local
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Try Assistant Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Action Tester Card */}
          <div className="rounded-2xl p-5 bg-app-card border border-app-border shadow-sm space-y-5">
            <div>
              <h3 className="font-headline text-base font-bold text-app-text">
                Try Assistant Actions
              </h3>
              <p className="text-xs text-app-muted mt-0.5">
                Select an action below and click &ldquo;Run Action&rdquo; to test what StudyMate can do.
              </p>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-3 gap-2">
              {ACTIONS.map((action) => {
                const Icon = action.icon;
                const isSelected = activeAction === action.id;
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      setActiveAction(action.id);
                      setResultData(null);
                      setRawOutput(null);
                    }}
                    className={`p-3 rounded-xl text-left transition border cursor-pointer ${
                      isSelected
                        ? 'bg-[#4f91b0] text-white border-[#4f91b0] shadow-md shadow-[#4f91b0]/20'
                        : 'bg-app-subtle border-app-border text-app-text hover:border-[#4f91b0]/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#4f91b0]'}`} />
                      <span className="font-headline text-xs font-bold truncate">
                        {action.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Simple Human-Friendly Form Controls */}
            <div className="p-4 rounded-xl bg-app-subtle border border-app-border space-y-3">
              {/* Short explanation of what this action does */}
              <div className="flex items-center space-x-2 text-xs font-medium text-app-muted">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{ACTIONS.find((a) => a.id === activeAction)?.shortDesc}</span>
              </div>

              {/* 1. GET TASKS CONTROLS */}
              {activeAction === 'get_tasks' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-app-border">
                  <div>
                    <label className="block text-xs font-semibold text-app-text mb-1">
                      Task Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-app-card border border-app-border text-app-text focus:outline-none focus:ring-2 focus:ring-[#4f91b0]"
                    >
                      <option value="all">All Assignments</option>
                      <option value="pending">To Do / Pending Only</option>
                      <option value="done">Completed Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-app-text mb-1">
                      Filter by Course
                    </label>
                    <select
                      value={filterCourse}
                      onChange={(e) => setFilterCourse(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-app-card border border-app-border text-app-text focus:outline-none focus:ring-2 focus:ring-[#4f91b0]"
                    >
                      <option value="">All Courses</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.code ? `${c.code}: ${c.name}` : c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 2. CREATE STUDY PLAN CONTROLS */}
              {activeAction === 'create_study_plan' && (
                <div className="space-y-3 pt-2 border-t border-app-border">
                  <div>
                    <label className="block text-xs font-semibold text-app-text mb-1">
                      Subject to Study
                    </label>
                    <select
                      value={planCourse}
                      onChange={(e) => setPlanCourse(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-app-card border border-app-border text-app-text focus:outline-none focus:ring-2 focus:ring-[#4f91b0]"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.code ? `${c.code}: ${c.name}` : c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-app-text mb-1.5">
                      Available Time (Minutes)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[30, 45, 60, 90, 120].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setPlanMinutes(mins)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            planMinutes === mins
                              ? 'bg-[#4f91b0] text-white'
                              : 'bg-app-card border border-app-border text-app-muted hover:text-app-text'
                          }`}
                        >
                          {mins} mins
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ADD TASK CONTROLS */}
              {activeAction === 'add_task' && (
                <div className="space-y-3 pt-2 border-t border-app-border">
                  <div>
                    <label className="block text-xs font-semibold text-app-text mb-1">
                      Assignment Title
                    </label>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-app-card border border-app-border text-app-text focus:outline-none focus:ring-2 focus:ring-[#4f91b0]"
                      placeholder="e.g., Chapter 5 Reading & Notes"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-app-text mb-1">
                        Course
                      </label>
                      <select
                        value={newTaskCourse}
                        onChange={(e) => setNewTaskCourse(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-app-card border border-app-border text-app-text focus:outline-none focus:ring-2 focus:ring-[#4f91b0]"
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.code ? `${c.code}: ${c.name}` : c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-app-text mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={newTaskDue}
                        onChange={(e) => setNewTaskDue(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-app-card border border-app-border text-app-text focus:outline-none focus:ring-2 focus:ring-[#4f91b0]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-app-text mb-1">
                        Priority
                      </label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-app-card border border-app-border text-app-text focus:outline-none focus:ring-2 focus:ring-[#4f91b0]"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-app-text mb-1">
                        Estimated Minutes
                      </label>
                      <input
                        type="number"
                        value={newTaskEstMinutes}
                        onChange={(e) => setNewTaskEstMinutes(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-app-card border border-app-border text-app-text focus:outline-none focus:ring-2 focus:ring-[#4f91b0]"
                        min={15}
                        step={15}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. COURSE PROGRESS CONTROLS */}
              {activeAction === 'get_course_progress' && (
                <div className="pt-2 border-t border-app-border">
                  <label className="block text-xs font-semibold text-app-text mb-1">
                    Select Course
                  </label>
                  <select
                    value={progressCourse}
                    onChange={(e) => setProgressCourse(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-app-card border border-app-border text-app-text focus:outline-none focus:ring-2 focus:ring-[#4f91b0]"
                  >
                    <option value="">All Enrolled Courses</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.code ? `${c.code}: ${c.name}` : c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 5. UPDATE PROGRESS CONTROLS */}
              {activeAction === 'update_progress' && (
                <div className="space-y-3 pt-2 border-t border-app-border">
                  <div>
                    <label className="block text-xs font-semibold text-app-text mb-1">
                      Choose Assignment to Update
                    </label>
                    <select
                      value={updateTaskId}
                      onChange={(e) => setUpdateTaskId(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-app-card border border-app-border text-app-text focus:outline-none focus:ring-2 focus:ring-[#4f91b0]"
                    >
                      {tasks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({t.course_name}) — Status: {t.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-app-text mb-1">
                        New Status
                      </label>
                      <select
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-app-card border border-app-border text-app-text focus:outline-none focus:ring-2 focus:ring-[#4f91b0]"
                      >
                        <option value="pending">To Do (Pending)</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Completed (Done)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-app-text mb-1">
                        Study Minutes Logged
                      </label>
                      <input
                        type="number"
                        value={updateMinutes}
                        onChange={(e) => setUpdateMinutes(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-app-card border border-app-border text-app-text focus:outline-none focus:ring-2 focus:ring-[#4f91b0]"
                        min={0}
                        step={15}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Run Action Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleRunAction}
                disabled={executing}
                className="px-6 py-2.5 rounded-xl font-headline text-xs font-bold text-white bg-[#4f91b0] hover:bg-[#3f748d] disabled:opacity-50 transition shadow-md shadow-[#4f91b0]/20 flex items-center space-x-2 cursor-pointer"
              >
                {executing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>{executing ? 'Running Action...' : 'Run Action'}</span>
              </button>

              {latency !== null && (
                <div className="text-xs text-app-muted flex items-center space-x-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#4f91b0]" />
                  <span>Response: {latency}ms</span>
                </div>
              )}
            </div>

            {/* Clean Result Presentation */}
            {resultData && (
              <div className="p-4 rounded-xl bg-app-subtle border border-app-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-headline font-bold text-app-text flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Assistant Response</span>
                  </span>
                  <button
                    onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                    className="text-[11px] font-semibold text-[#4f91b0] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{showTechnicalDetails ? 'Hide Raw Details' : 'Show Raw Data'}</span>
                  </button>
                </div>

                {/* Human-Friendly Response Cards */}
                {Array.isArray(resultData) ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    <div className="text-xs font-semibold text-app-muted">
                      Found {resultData.length} items:
                    </div>
                    {resultData.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-app-card border border-app-border text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-app-text">{item.title || item.name || `Item #${idx + 1}`}</div>
                          <div className="text-[11px] text-app-muted">
                            {item.course_name || item.code || ''} {item.due_date ? `• Due: ${item.due_date}` : ''}
                          </div>
                        </div>
                        {item.status && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              item.status === 'done'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {item.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : resultData?.intervals ? (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#4f91b0]">
                      {resultData.course} — {resultData.total_time_minutes} Minute Study Plan
                    </div>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {resultData.intervals.map((step: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-app-card border border-app-border text-xs flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-[#4f91b0]/15 text-[#4f91b0] text-[10px] font-bold flex items-center justify-center">
                              {step.step || idx + 1}
                            </span>
                            <span className="font-semibold text-app-text">{step.activity || step.topic}</span>
                          </div>
                          <span className="font-mono text-[11px] text-app-muted font-bold">
                            {step.duration_minutes || step.duration}m
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : resultData?.message ? (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {resultData.message}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-app-card border border-app-border text-xs text-app-text font-medium">
                    {typeof resultData === 'string' ? resultData : JSON.stringify(resultData, null, 2)}
                  </div>
                )}

                {/* Optional Raw Details */}
                {showTechnicalDetails && rawOutput && (
                  <div className="pt-3 border-t border-app-border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-app-muted">
                        Raw Response Data
                      </span>
                      <button
                        onClick={handleCopyRaw}
                        className="text-[11px] text-[#4f91b0] hover:underline flex items-center space-x-1 cursor-pointer"
                      >
                        {copiedRaw ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedRaw ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                      {rawOutput}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Feed Card */}
          <div className="rounded-2xl p-5 bg-app-card border border-app-border shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-app-border">
              <h3 className="font-headline text-sm font-bold text-app-text">
                Recent Assistant Activity
              </h3>
              <span className="text-[11px] text-app-muted">Live Sync</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {activityFeed.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-app-subtle border border-app-border flex items-start justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-headline font-bold text-app-text flex items-center space-x-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.success ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <span>{item.title}</span>
                    </div>
                    <div className="text-[11px] text-app-muted pl-3.5">{item.subtitle}</div>
                  </div>
                  <span className="text-[10px] text-app-muted shrink-0 ml-2 font-mono">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Saved Records Explorer & Alexa Remote Access (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Saved Academic Records Card */}
          <div className="rounded-2xl p-5 bg-app-card border border-app-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-app-border">
              <div>
                <h3 className="font-headline text-sm font-bold text-app-text">
                  Saved Academic Records
                </h3>
                <p className="text-[11px] text-app-muted">Browse your stored courses & tasks</p>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Safe & Local
              </span>
            </div>

            {/* Clean Tabs */}
            <div className="flex items-center space-x-2 border-b border-app-border pb-2">
              <button
                onClick={() => setActiveDbTab('tasks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-headline font-semibold transition cursor-pointer ${
                  activeDbTab === 'tasks'
                    ? 'bg-[#4f91b0]/15 text-[#4f91b0] font-bold'
                    : 'text-app-muted hover:text-app-text'
                }`}
              >
                Tasks ({tasks.length})
              </button>
              <button
                onClick={() => setActiveDbTab('courses')}
                className={`px-3 py-1.5 rounded-lg text-xs font-headline font-semibold transition cursor-pointer ${
                  activeDbTab === 'courses'
                    ? 'bg-[#4f91b0]/15 text-[#4f91b0] font-bold'
                    : 'text-app-muted hover:text-app-text'
                }`}
              >
                Courses ({courses.length})
              </button>
              <button
                onClick={() => setActiveDbTab('progress')}
                className={`px-3 py-1.5 rounded-lg text-xs font-headline font-semibold transition cursor-pointer ${
                  activeDbTab === 'progress'
                    ? 'bg-[#4f91b0]/15 text-[#4f91b0] font-bold'
                    : 'text-app-muted hover:text-app-text'
                }`}
              >
                Pacing ({progressList.length})
              </button>
            </div>

            {/* Stored Records List */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {activeDbTab === 'tasks' &&
                tasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl bg-app-subtle border border-app-border text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-headline font-bold text-app-text truncate">
                        {t.title}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          t.status === 'done'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {t.status === 'done' ? 'Done' : 'To Do'}
                      </span>
                    </div>
                    <div className="text-[11px] text-app-muted flex items-center justify-between">
                      <span>{t.course_name}</span>
                      <span>{t.due_date ? `Due ${t.due_date}` : 'No deadline'}</span>
                    </div>
                  </div>
                ))}

              {activeDbTab === 'courses' &&
                courses.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-app-subtle border border-app-border text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-headline font-bold text-app-text">
                        {c.code || c.name}
                      </span>
                      <span className="text-[10px] text-app-muted">{c.instructor || 'Faculty'}</span>
                    </div>
                    <div className="text-[11px] text-app-muted">
                      {c.name}
                    </div>
                  </div>
                ))}

              {activeDbTab === 'progress' &&
                progressList.map((p) => (
                  <div
                    key={p.course_id}
                    className="p-2.5 rounded-xl bg-app-subtle border border-app-border text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-headline font-bold text-app-text">
                        {p.course_code || p.course_name}
                      </span>
                      <span className="text-[#4f91b0] font-bold">
                        {p.completed_pct}% Completed
                      </span>
                    </div>
                    <div className="w-full bg-app-card rounded-full h-1.5 overflow-hidden my-1">
                      <div
                        className="bg-[#4f91b0] h-1.5 rounded-full"
                        style={{ width: `${p.completed_pct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-app-muted flex items-center justify-between">
                      <span>{p.completed_tasks} of {p.total_tasks} tasks done</span>
                      <span>{p.hours_this_week.toFixed(1)} hrs studied</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Connect with Alexa / Phone Guide */}
          <div className="rounded-2xl p-5 bg-app-card border border-app-border shadow-sm space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-app-border">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className="font-headline text-sm font-bold text-app-text">
                Connect with Alexa or Phone
              </h3>
            </div>

            <p className="text-xs text-app-muted leading-relaxed">
              Want to speak to StudyMate from a physical Amazon Echo or mobile phone? Run this command to create a free secure link:
            </p>

            <div className="p-2.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] flex items-center justify-between">
              <span className="truncate">./bin/cloudflared.exe tunnel --url http://localhost:3000</span>
              <button
                onClick={handleCopyTunnel}
                className="p-1 rounded text-slate-400 hover:text-white shrink-0 ml-2 cursor-pointer"
                title="Copy Command"
              >
                {copiedTunnel ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="pt-2 text-[11px] text-app-muted space-y-1">
              <div className="font-semibold text-app-text">What this does:</div>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Gives you a temporary free link with no credit card required</li>
                <li>Allows Alexa+ skills to query your tasks and create study plans</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
