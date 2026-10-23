import React, { useState, useEffect } from 'react';
import {
  Server,
  Play,
  Copy,
  Check,
  RefreshCw,
  Clock,
  CheckCircle2,
  ListTodo,
  PlusCircle,
  Timer,
  BarChart3,
  CheckSquare,
  ShieldCheck,
} from 'lucide-react';
import {
  fetchHealthDetails,
  executeMcpJsonRpc,
  type ServerHealthDetails,
} from '../api.js';
import { AuthGate } from '../components/AuthGate.js';
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
    label: 'get_tasks',
    shortDesc: 'Query pending assignments, due dates, and priority levels',
    icon: ListTodo,
    badge: 'Query',
  },
  {
    id: 'create_study_plan',
    label: 'create_study_plan',
    shortDesc: 'Calculate Pomodoro intervals based on available time',
    icon: Timer,
    badge: 'Planner',
  },
  {
    id: 'add_task',
    label: 'add_task',
    shortDesc: 'Create an assignment with due date and priority in SQLite',
    icon: PlusCircle,
    badge: 'Mutation',
  },
  {
    id: 'get_course_progress',
    label: 'get_course_progress',
    shortDesc: 'Compute syllabus completion percentages and logged study hours',
    icon: BarChart3,
    badge: 'Analytics',
  },
  {
    id: 'update_progress',
    label: 'update_progress',
    shortDesc: 'Mark a task complete and log focused study minutes',
    icon: CheckSquare,
    badge: 'Mutation',
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

  // Form states
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterCourse, setFilterCourse] = useState<string>('');

  const [newTaskTitle, setNewTaskTitle] = useState('Distributed Consensus Lab');
  const [newTaskCourse, setNewTaskCourse] = useState(courses[0]?.name || 'CS 420: Distributed Systems');
  const [newTaskDue, setNewTaskDue] = useState('2026-10-25');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [newTaskEstMinutes, setNewTaskEstMinutes] = useState(90);

  const [planMinutes, setPlanMinutes] = useState(60);
  const [planCourse, setPlanCourse] = useState(courses[0]?.name || 'CS 420: Distributed Systems');

  const [progressCourse, setProgressCourse] = useState('');

  const [updateTaskId, setUpdateTaskId] = useState<number>(tasks[0]?.id || 1);
  const [updateStatus, setUpdateStatus] = useState<'pending' | 'in_progress' | 'done'>('done');
  const [updateMinutes, setUpdateMinutes] = useState(45);

  // Output states
  const [resultData, setResultData] = useState<any>(null);
  const [rawOutput, setRawOutput] = useState<string | null>(null);

  const [activityFeed, setActivityFeed] = useState<
    Array<{ id: string; time: string; title: string; subtitle: string; success: boolean }>
  >([
    {
      id: 'init-1',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: 'MCP Server Connected',
      subtitle: 'Streamable HTTP endpoint active at /mcp. Protocol 2025-11-25.',
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
          title: `Called ${actionLabel}`,
          subtitle: `Executed in ${elapsed}ms. Synchronized with SQLite.`,
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
          title: `Error calling ${actionLabel}`,
          subtitle: err.message || 'Action failed.',
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
      {/* 1. Header Banner & Status Metrics */}
      <div className="rounded-xl p-6 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              MCP Diagnostics & System Health
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              {health?.status === 'ok' ? 'Online' : 'Checking'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Validate Model Context Protocol tools, test JSON-RPC payloads, and inspect local SQLite records.
          </p>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 text-xs">
          <div className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
            <div className="text-[10px] uppercase font-mono text-slate-400">Endpoint</div>
            <div className="font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">/mcp (HTTP)</div>
          </div>
          <div className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
            <div className="text-[10px] uppercase font-mono text-slate-400">Uptime</div>
            <div className="font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">
              {health ? formatUptime(health.uptime_seconds) : '---'}
            </div>
          </div>
          <div className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
            <div className="text-[10px] uppercase font-mono text-slate-400">Tools</div>
            <div className="font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">5 Registered</div>
          </div>
          <div className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
            <div className="text-[10px] uppercase font-mono text-slate-400">Database</div>
            <div className="font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">SQLite Local</div>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tool Execution Sandbox (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Interactive Tool Caller
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select an MCP tool schema, configure test parameters, and execute JSON-RPC directly:
              </p>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACTIONS.map((action) => {
                const isSelected = activeAction === action.id;
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      setActiveAction(action.id);
                      setResultData(null);
                      setRawOutput(null);
                    }}
                    className={`p-2.5 rounded-lg text-left transition border cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-white/[0.03] dark:border-white/[0.06] dark:text-slate-300 dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="font-mono text-xs truncate">{action.label}</div>
                    <div className="text-[10px] opacity-75 truncate">{action.badge}</div>
                  </button>
                );
              })}
            </div>

            {/* Parameter Controls */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] space-y-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {ACTIONS.find((a) => a.id === activeAction)?.shortDesc}
              </div>

              {/* 1. GET TASKS CONTROLS */}
              {activeAction === 'get_tasks' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="all">All Assignments</option>
                      <option value="pending">Pending Only</option>
                      <option value="done">Completed Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Course Filter
                    </label>
                    <select
                      value={filterCourse}
                      onChange={(e) => setFilterCourse(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white"
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
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Target Course
                    </label>
                    <select
                      value={planCourse}
                      onChange={(e) => setPlanCourse(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.code ? `${c.code}: ${c.name}` : c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Available Minutes: <span className="font-mono font-semibold">{planMinutes}m</span>
                    </label>
                    <div className="flex gap-1.5">
                      {[30, 45, 60, 90, 120].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setPlanMinutes(mins)}
                          className={`px-3 py-1 rounded text-xs font-mono ${
                            planMinutes === mins
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold'
                              : 'bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ADD TASK CONTROLS */}
              {activeAction === 'add_task' && (
                <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Assignment Title
                    </label>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Course
                      </label>
                      <select
                        value={newTaskCourse}
                        onChange={(e) => setNewTaskCourse(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.code || c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={newTaskDue}
                        onChange={(e) => setNewTaskDue(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. COURSE PROGRESS CONTROLS */}
              {activeAction === 'get_course_progress' && (
                <div className="pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Select Course
                  </label>
                  <select
                    value={progressCourse}
                    onChange={(e) => setProgressCourse(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white"
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
                <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Assignment to Update
                    </label>
                    <select
                      value={updateTaskId}
                      onChange={(e) => setUpdateTaskId(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                    >
                      {tasks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({t.course_name}) — Status: {t.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        New Status
                      </label>
                      <select
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Completed (Done)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Minutes Spent
                      </label>
                      <input
                        type="number"
                        value={updateMinutes}
                        onChange={(e) => setUpdateMinutes(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white font-mono"
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
                className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {executing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>{executing ? 'Executing...' : 'Run Tool Call'}</span>
              </button>

              {latency !== null && (
                <div className="text-xs text-slate-500 font-mono flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Latency: {latency}ms</span>
                </div>
              )}
            </div>

            {/* Output Card */}
            {resultData && (
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Response Payload</span>
                  </span>
                  <button
                    onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                    className="text-[11px] text-slate-600 dark:text-slate-400 hover:underline cursor-pointer"
                  >
                    {showTechnicalDetails ? 'Collapse Raw' : 'View Raw JSON'}
                  </button>
                </div>

                {showTechnicalDetails && rawOutput ? (
                  <div className="space-y-1">
                    <div className="flex justify-end">
                      <button
                        onClick={handleCopyRaw}
                        className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-mono"
                      >
                        {copiedRaw ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedRaw ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-48">
                      {rawOutput}
                    </pre>
                  </div>
                ) : (
                  <div className="p-2.5 rounded bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 font-mono text-[11px] max-h-48 overflow-y-auto">
                    {typeof resultData === 'string' ? resultData : JSON.stringify(resultData, null, 2)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Feed Card */}
          <div className="rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Recent Protocol Activity
            </h3>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {activityFeed.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 text-xs flex items-start justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>{item.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-3 mt-0.5">{item.subtitle}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 ml-2">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Database Records (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <AuthGate
            title="Database Records Locked"
            description="Sign in or create a free account to inspect your stored courses, tasks, and study session logs."
            compact
            feature="Database Sync"
          >
            <div className="rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.08]">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    SQLite Store Records
                  </h3>
                  <p className="text-xs text-slate-500">Local persistent tables</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400">
                  SQLite
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setActiveDbTab('tasks')}
                  className={`flex-1 py-1 rounded-md text-xs font-medium transition cursor-pointer text-center ${
                    activeDbTab === 'tasks'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold'
                      : 'bg-slate-100 text-slate-600 dark:bg-white/[0.04] dark:text-slate-400'
                  }`}
                >
                  Tasks ({tasks.length})
                </button>
                <button
                  onClick={() => setActiveDbTab('courses')}
                  className={`flex-1 py-1 rounded-md text-xs font-medium transition cursor-pointer text-center ${
                    activeDbTab === 'courses'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold'
                      : 'bg-slate-100 text-slate-600 dark:bg-white/[0.04] dark:text-slate-400'
                  }`}
                >
                  Courses ({courses.length})
                </button>
                <button
                  onClick={() => setActiveDbTab('progress')}
                  className={`flex-1 py-1 rounded-md text-xs font-medium transition cursor-pointer text-center ${
                    activeDbTab === 'progress'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold'
                      : 'bg-slate-100 text-slate-600 dark:bg-white/[0.04] dark:text-slate-400'
                  }`}
                >
                  Pacing ({progressList.length})
                </button>
              </div>

              {/* Records List */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 text-xs">
                {activeDbTab === 'tasks' &&
                  (tasks.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 font-mono">No tasks recorded.</div>
                  ) : (
                    tasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900 dark:text-white truncate">
                            {t.title}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                              t.status === 'done'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center justify-between">
                          <span>{t.course_name}</span>
                          <span>{t.due_date || 'No due date'}</span>
                        </div>
                      </div>
                    ))
                  ))}

                {activeDbTab === 'courses' &&
                  courses.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10"
                    >
                      <div className="font-medium text-slate-900 dark:text-white">
                        {c.code || c.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{c.name}</div>
                    </div>
                  ))}

                {activeDbTab === 'progress' &&
                  progressList.map((p) => (
                    <div
                      key={p.course_id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900 dark:text-white">{p.course_name}</span>
                        <span className="font-mono font-semibold">{p.completed_pct}%</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.completed_tasks}/{p.total_tasks} tasks • {p.hours_this_week}h logged
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </AuthGate>

          {/* Cloudflared Tunnel Guide */}
          <div className="rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-3 text-xs">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-200 dark:border-white/[0.08]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Pair Physical Amazon Echo
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-normal">
              To pair a physical Amazon Echo or mobile phone to your local StudyMate MCP server, create a tunnel:
            </p>
            <div className="p-2.5 rounded-md bg-slate-900 text-slate-200 font-mono text-[11px] flex items-center justify-between">
              <span className="truncate">./bin/cloudflared.exe tunnel --url http://localhost:3000</span>
              <button
                onClick={handleCopyTunnel}
                className="p-1 rounded text-slate-400 hover:text-white shrink-0 ml-2 cursor-pointer"
                title="Copy Command"
              >
                {copiedTunnel ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
