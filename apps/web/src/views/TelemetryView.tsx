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
      {/* 1. Header Banner & Status Metrics (Sage Green Palette 18 Header) */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-[#839758] to-[#ABC270] text-white border border-[#839758]/40 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              MCP Diagnostics & System Health
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FEC868] text-[#473C33]">
              {health?.status === 'ok' ? 'Online' : 'Checking'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/90 mt-1">
            Validate Model Context Protocol tools, test JSON-RPC payloads, and inspect local SQLite records.
          </p>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-black/20 border border-white/20">
            <div className="text-[10px] uppercase font-mono text-white/75">Endpoint</div>
            <div className="font-semibold text-white mt-0.5 font-mono">/mcp (HTTP)</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-black/20 border border-white/20">
            <div className="text-[10px] uppercase font-mono text-white/75">Uptime</div>
            <div className="font-semibold text-white mt-0.5 font-mono">
              {health ? formatUptime(health.uptime_seconds) : '---'}
            </div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-black/20 border border-white/20">
            <div className="text-[10px] uppercase font-mono text-white/75">Tools</div>
            <div className="font-semibold text-white mt-0.5 font-mono">5 Registered</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-black/20 border border-white/20">
            <div className="text-[10px] uppercase font-mono text-white/75">Database</div>
            <div className="font-semibold text-white mt-0.5 font-mono">SQLite Local</div>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tool Execution Sandbox (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl p-5 bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-4 shadow-xs">
            <div>
              <h2 className="text-sm font-semibold text-[#473C33] dark:text-[#FAF8F1]">
                Interactive Tool Caller
              </h2>
              <p className="text-xs text-[#7A6C5E] dark:text-[#C2B2A1]">
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
                    className={`p-2.5 rounded-xl text-left transition border cursor-pointer ${
                      isSelected
                        ? 'bg-[#ABC270] text-white border-[#839758] font-semibold shadow-sm'
                        : 'bg-[#FAF8F1] border-[#E6E0D0] text-[#473C33] hover:bg-[#F5F2E8] dark:bg-[#393028] dark:border-[#FEC868]/15 dark:text-[#FAF8F1] dark:hover:bg-[#473C33]'
                    }`}
                  >
                    <div className="font-mono text-xs truncate">{action.label}</div>
                    <div className="text-[10px] opacity-80 truncate">{action.badge}</div>
                  </button>
                );
              })}
            </div>

            {/* Parameter Controls */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-3">
              <div className="text-xs text-[#7A6C5E] dark:text-[#C2B2A1]">
                {ACTIONS.find((a) => a.id === activeAction)?.shortDesc}
              </div>

              {/* 1. GET TASKS CONTROLS */}
              {activeAction === 'get_tasks' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E6E0D0] dark:border-[#FEC868]/15 text-xs">
                  <div>
                    <label className="block font-medium text-[#473C33] dark:text-[#FAF8F1] mb-1">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/20 text-xs text-[#473C33] dark:text-[#FAF8F1]"
                    >
                      <option value="all">All Assignments</option>
                      <option value="pending">Pending Only</option>
                      <option value="done">Completed Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#473C33] dark:text-[#FAF8F1] mb-1">
                      Course Filter
                    </label>
                    <select
                      value={filterCourse}
                      onChange={(e) => setFilterCourse(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/20 text-xs text-[#473C33] dark:text-[#FAF8F1]"
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
                <div className="space-y-3 pt-2 border-t border-[#E6E0D0] dark:border-[#FEC868]/15 text-xs">
                  <div>
                    <label className="block font-medium text-[#473C33] dark:text-[#FAF8F1] mb-1">
                      Target Course
                    </label>
                    <select
                      value={planCourse}
                      onChange={(e) => setPlanCourse(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/20 text-xs text-[#473C33] dark:text-[#FAF8F1]"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.code ? `${c.code}: ${c.name}` : c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#473C33] dark:text-[#FAF8F1] mb-1">
                      Available Minutes: <span className="font-mono font-semibold">{planMinutes}m</span>
                    </label>
                    <div className="flex gap-1.5">
                      {[30, 45, 60, 90, 120].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setPlanMinutes(mins)}
                          className={`px-3 py-1 rounded-full text-xs font-mono cursor-pointer ${
                            planMinutes === mins
                              ? 'bg-[#ABC270] text-white font-semibold'
                              : 'bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/20 text-[#473C33] dark:text-[#FAF8F1]'
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
                <div className="space-y-2.5 pt-2 border-t border-[#E6E0D0] dark:border-[#FEC868]/15 text-xs">
                  <div>
                    <label className="block font-medium text-[#473C33] dark:text-[#FAF8F1] mb-1">
                      Assignment Title
                    </label>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/20 text-xs text-[#473C33] dark:text-[#FAF8F1]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-medium text-[#473C33] dark:text-[#FAF8F1] mb-1">
                        Course
                      </label>
                      <select
                        value={newTaskCourse}
                        onChange={(e) => setNewTaskCourse(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/20 text-xs text-[#473C33] dark:text-[#FAF8F1]"
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.code || c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-[#473C33] dark:text-[#FAF8F1] mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={newTaskDue}
                        onChange={(e) => setNewTaskDue(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/20 text-xs text-[#473C33] dark:text-[#FAF8F1]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. COURSE PROGRESS CONTROLS */}
              {activeAction === 'get_course_progress' && (
                <div className="pt-2 border-t border-[#E6E0D0] dark:border-[#FEC868]/15 text-xs">
                  <label className="block font-medium text-[#473C33] dark:text-[#FAF8F1] mb-1">
                    Select Course
                  </label>
                  <select
                    value={progressCourse}
                    onChange={(e) => setProgressCourse(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/20 text-xs text-[#473C33] dark:text-[#FAF8F1]"
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
                <div className="space-y-2.5 pt-2 border-t border-[#E6E0D0] dark:border-[#FEC868]/15 text-xs">
                  <div>
                    <label className="block font-medium text-[#473C33] dark:text-[#FAF8F1] mb-1">
                      Assignment to Update
                    </label>
                    <select
                      value={updateTaskId}
                      onChange={(e) => setUpdateTaskId(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/20 text-xs text-[#473C33] dark:text-[#FAF8F1]"
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
                      <label className="block font-medium text-[#473C33] dark:text-[#FAF8F1] mb-1">
                        New Status
                      </label>
                      <select
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/20 text-xs text-[#473C33] dark:text-[#FAF8F1]"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Completed (Done)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-[#473C33] dark:text-[#FAF8F1] mb-1">
                        Minutes Spent
                      </label>
                      <input
                        type="number"
                        value={updateMinutes}
                        onChange={(e) => setUpdateMinutes(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/20 text-xs text-[#473C33] dark:text-[#FAF8F1] font-mono"
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
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {executing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>{executing ? 'Executing...' : 'Run Tool Call'}</span>
              </button>

              {latency !== null && (
                <div className="text-xs text-[#7A6C5E] font-mono flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-[#ABC270]" />
                  <span>Latency: {latency}ms</span>
                </div>
              )}
            </div>

            {/* Output Card */}
            {resultData && (
              <div className="p-3.5 rounded-xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#473C33] dark:text-[#FAF8F1] flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#ABC270]" />
                    <span>Response Payload</span>
                  </span>
                  <button
                    onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                    className="text-[11px] text-[#586738] dark:text-[#ABC270] hover:underline cursor-pointer"
                  >
                    {showTechnicalDetails ? 'Collapse Raw' : 'View Raw JSON'}
                  </button>
                </div>

                {showTechnicalDetails && rawOutput ? (
                  <div className="space-y-1">
                    <div className="flex justify-end">
                      <button
                        onClick={handleCopyRaw}
                        className="text-[10px] text-[#7A6C5E] hover:text-[#473C33] flex items-center gap-1 cursor-pointer font-mono"
                      >
                        {copiedRaw ? <Check className="w-3 h-3 text-[#ABC270]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedRaw ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-[#473C33] text-[#FAF8F1] text-[11px] font-mono overflow-x-auto max-h-48">
                      {rawOutput}
                    </pre>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 font-mono text-[11px] max-h-48 overflow-y-auto">
                    {typeof resultData === 'string' ? resultData : JSON.stringify(resultData, null, 2)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Feed Card */}
          <div className="rounded-2xl p-5 bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-3 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#473C33] dark:text-[#FAF8F1]">
              Recent Protocol Activity
            </h3>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {activityFeed.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 text-xs flex items-start justify-between"
                >
                  <div>
                    <div className="font-medium text-[#473C33] dark:text-[#FAF8F1] flex items-center space-x-1.5">
                      <span className={`w-2 h-2 rounded-full ${item.success ? 'bg-[#ABC270]' : 'bg-[#FDA769]'}`} />
                      <span>{item.title}</span>
                    </div>
                    <div className="text-[11px] text-[#7A6C5E] dark:text-[#C2B2A1] pl-3.5 mt-0.5">{item.subtitle}</div>
                  </div>
                  <span className="text-[10px] font-mono text-[#87796B] ml-2">{item.time}</span>
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
            <div className="rounded-2xl p-5 bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E0D0] dark:border-[#FEC868]/15">
                <div>
                  <h3 className="text-sm font-semibold text-[#473C33] dark:text-[#FAF8F1]">
                    SQLite Store Records
                  </h3>
                  <p className="text-xs text-[#7A6C5E]">Local persistent tables</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ABC270]/20 text-[#586738] dark:text-[#ABC270] font-semibold">
                  SQLite
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setActiveDbTab('tasks')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                    activeDbTab === 'tasks'
                      ? 'bg-[#ABC270] text-white'
                      : 'bg-[#FAF8F1] text-[#63574B] dark:bg-[#393028] dark:text-[#C2B2A1]'
                  }`}
                >
                  Tasks ({tasks.length})
                </button>
                <button
                  onClick={() => setActiveDbTab('courses')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                    activeDbTab === 'courses'
                      ? 'bg-[#ABC270] text-white'
                      : 'bg-[#FAF8F1] text-[#63574B] dark:bg-[#393028] dark:text-[#C2B2A1]'
                  }`}
                >
                  Courses ({courses.length})
                </button>
                <button
                  onClick={() => setActiveDbTab('progress')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                    activeDbTab === 'progress'
                      ? 'bg-[#ABC270] text-white'
                      : 'bg-[#FAF8F1] text-[#63574B] dark:bg-[#393028] dark:text-[#C2B2A1]'
                  }`}
                >
                  Pacing ({progressList.length})
                </button>
              </div>

              {/* Records List */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 text-xs">
                {activeDbTab === 'tasks' &&
                  (tasks.length === 0 ? (
                    <div className="py-6 text-center text-[#87796B] font-mono">No tasks recorded.</div>
                  ) : (
                    tasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#473C33] dark:text-[#FAF8F1] truncate">
                            {t.title}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                              t.status === 'done'
                                ? 'bg-[#FDA769] text-white'
                                : 'bg-[#ABC270] text-white'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#7A6C5E] flex items-center justify-between">
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
                      className="p-2.5 rounded-xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15"
                    >
                      <div className="font-medium text-[#473C33] dark:text-[#FAF8F1]">
                        {c.code || c.name}
                      </div>
                      <div className="text-[11px] text-[#7A6C5E]">{c.name}</div>
                    </div>
                  ))}

                {activeDbTab === 'progress' &&
                  progressList.map((p) => (
                    <div
                      key={p.course_id}
                      className="p-2.5 rounded-xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#473C33] dark:text-[#FAF8F1]">{p.course_name}</span>
                        <span className="font-mono font-semibold text-[#586738] dark:text-[#ABC270]">{p.completed_pct}%</span>
                      </div>
                      <div className="text-[11px] text-[#7A6C5E]">
                        {p.completed_tasks}/{p.total_tasks} tasks • {p.hours_this_week}h logged
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </AuthGate>

          {/* Cloudflared Tunnel Guide */}
          <div className="rounded-2xl p-5 bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-3 text-xs shadow-xs">
            <div className="flex items-center space-x-2 pb-2 border-b border-[#E6E0D0] dark:border-[#FEC868]/15">
              <ShieldCheck className="w-4 h-4 text-[#839758] dark:text-[#ABC270]" />
              <h3 className="text-sm font-semibold text-[#473C33] dark:text-[#FAF8F1]">
                Pair Physical Amazon Echo
              </h3>
            </div>
            <p className="text-[#7A6C5E] dark:text-[#C2B2A1] leading-normal">
              To pair a physical Amazon Echo or mobile phone to your local StudyMate MCP server, create a tunnel:
            </p>
            <div className="p-2.5 rounded-xl bg-[#473C33] text-[#FEC868] font-mono text-[11px] flex items-center justify-between">
              <span className="truncate">./bin/cloudflared.exe tunnel --url http://localhost:3000</span>
              <button
                onClick={handleCopyTunnel}
                className="p-1 rounded text-white/70 hover:text-white shrink-0 ml-2 cursor-pointer"
                title="Copy Command"
              >
                {copiedTunnel ? <Check className="w-3.5 h-3.5 text-[#ABC270]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
