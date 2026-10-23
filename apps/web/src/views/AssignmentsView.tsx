import React, { useState } from 'react';
import {
  Plus,
  Search,
  Kanban,
  List,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  GripVertical,
  PlayCircle,
  RotateCcw,
} from 'lucide-react';
import type { Course, Task, TaskPriority, TaskStatus } from '@studymate/types';

interface AssignmentsViewProps {
  tasks: Task[];
  courses: Course[];
  onToggleStatus: (taskId: number, currentStatus: TaskStatus) => void;
  onUpdateStatus?: (taskId: number, newStatus: TaskStatus) => void;
  onOpenAddModal: () => void;
  onFocusTask: (task: Task) => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  tasks,
  courses,
  onToggleStatus,
  onUpdateStatus,
  onOpenAddModal,
  onFocusTask,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Drag and Drop States
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  // Filtering
  const filtered = tasks.filter((t) => {
    if (selectedCourse !== 'all' && t.course_name !== selectedCourse) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.course_name && t.course_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pendingTasks = filtered.filter((t) => t.status === 'pending');
  const inProgressTasks = filtered.filter((t) => t.status === 'in_progress');
  const doneTasks = filtered.filter((t) => t.status === 'done');

  const updateStatusDirect = (taskId: number, newStatus: TaskStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(taskId, newStatus);
    } else {
      onToggleStatus(taskId, newStatus === 'done' ? 'pending' : 'done');
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('text/plain', String(taskId));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const handleDragOverCol = (e: React.DragEvent, colStatus: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colStatus) {
      setDragOverCol(colStatus);
    }
  };

  const handleDragLeaveCol = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverCol(null);
    }
  };

  const handleDropOnCol = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData('text/plain');
    const taskId = Number(idStr);
    if (taskId) {
      updateStatusDirect(taskId, targetStatus);
    }
    setDragOverCol(null);
    setDraggedTaskId(null);
  };

  const getPriorityChip = (p: TaskPriority) => {
    switch (p) {
      case 'high':
        return (
          <span className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            MED
          </span>
        );
      case 'low':
        return (
          <span className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats & Controls */}
      <div className="rounded-xl p-6 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Coursework & Assignments
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
              {tasks.length} total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Drag cards between columns or switch to list view to track deadlines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition cursor-pointer font-medium ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition cursor-pointer font-medium ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>

          {/* Add Assignment Button */}
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Course filter */}
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
            <span>Course:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-slate-400"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.code ? `${c.code}: ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
            <span className="mr-1">Priority:</span>
            {(['all', 'high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-2.5 py-1 rounded-md uppercase text-[10px] font-medium transition cursor-pointer ${
                  selectedPriority === p
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-56 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Main View: Kanban vs List */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {/* Column 1: To Do (Pending) */}
          <div
            onDragOver={(e) => handleDragOverCol(e, 'pending')}
            onDragLeave={handleDragLeaveCol}
            onDrop={(e) => handleDropOnCol(e, 'pending')}
            className={`rounded-xl p-4 transition-colors border ${
              dragOverCol === 'pending'
                ? 'border-slate-900 bg-slate-100 dark:border-white dark:bg-white/[0.08]'
                : 'bg-white dark:bg-[#0E121B] border-slate-200 dark:border-white/[0.08]'
            } min-h-[440px] flex flex-col space-y-3`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  To Do
                </h3>
              </div>
              <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                {pendingTasks.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.05] space-y-2.5 transition group cursor-grab active:cursor-grabbing ${
                    draggedTaskId === task.id ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                        {task.course_name}
                      </span>
                    </div>
                    {getPriorityChip(task.priority)}
                  </div>

                  <h4 className="text-xs font-medium text-slate-900 dark:text-white leading-snug">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/[0.06] text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{task.due_date || 'No deadline'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{task.est_minutes}m</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2">
                    <button
                      onClick={() => updateStatusDirect(task.id, 'in_progress')}
                      className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center space-x-1 cursor-pointer"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Start</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onFocusTask(task)}
                        className="px-2 py-0.5 rounded text-[10px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 transition cursor-pointer"
                      >
                        Focus
                      </button>
                      <button
                        onClick={() => updateStatusDirect(task.id, 'done')}
                        className="p-1 rounded text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
                        title="Mark Complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingTasks.length === 0 && (
                <div className="p-6 rounded-lg border border-dashed border-slate-200 dark:border-white/10 text-center text-xs text-slate-400">
                  No tasks in queue.
                </div>
              )}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div
            onDragOver={(e) => handleDragOverCol(e, 'in_progress')}
            onDragLeave={handleDragLeaveCol}
            onDrop={(e) => handleDropOnCol(e, 'in_progress')}
            className={`rounded-xl p-4 transition-colors border ${
              dragOverCol === 'in_progress'
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-500/10'
                : 'bg-white dark:bg-[#0E121B] border-slate-200 dark:border-white/[0.08]'
            } min-h-[440px] flex flex-col space-y-3`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  In Progress
                </h3>
              </div>
              <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.05] space-y-2.5 transition group cursor-grab active:cursor-grabbing ${
                    draggedTaskId === task.id ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                        {task.course_name}
                      </span>
                    </div>
                    {getPriorityChip(task.priority)}
                  </div>

                  <h4 className="text-xs font-medium text-slate-900 dark:text-white leading-snug">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/[0.06] text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{task.due_date || 'No deadline'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{task.est_minutes}m</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2">
                    <button
                      onClick={() => updateStatusDirect(task.id, 'done')}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onFocusTask(task)}
                        className="px-2 py-0.5 rounded text-[10px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 transition cursor-pointer"
                      >
                        Sprint
                      </button>
                      <button
                        onClick={() => updateStatusDirect(task.id, 'pending')}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                        title="Move back to To Do"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {inProgressTasks.length === 0 && (
                <div className="p-6 rounded-lg border border-dashed border-slate-200 dark:border-white/10 text-center text-xs text-slate-400">
                  Drag tasks here when in progress.
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Done (Completed) */}
          <div
            onDragOver={(e) => handleDragOverCol(e, 'done')}
            onDragLeave={handleDragLeaveCol}
            onDrop={(e) => handleDropOnCol(e, 'done')}
            className={`rounded-xl p-4 transition-colors border ${
              dragOverCol === 'done'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10'
                : 'bg-white dark:bg-[#0E121B] border-slate-200 dark:border-white/[0.08]'
            } min-h-[440px] flex flex-col space-y-3`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Completed
                </h3>
              </div>
              <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                {doneTasks.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] space-y-2 transition group cursor-grab active:cursor-grabbing opacity-75 hover:opacity-100 ${
                    draggedTaskId === task.id ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-medium text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                      {task.course_name}
                    </span>
                    <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      DONE
                    </span>
                  </div>

                  <h4 className="text-xs font-medium line-through text-slate-400 dark:text-slate-500 leading-snug">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-white/[0.04] text-[10px] font-mono text-slate-400">
                    <span>Complete</span>
                    <button
                      onClick={() => updateStatusDirect(task.id, 'pending')}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center space-x-1 cursor-pointer"
                      title="Reopen task"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reopen</span>
                    </button>
                  </div>
                </div>
              ))}

              {doneTasks.length === 0 && (
                <div className="p-6 rounded-lg border border-dashed border-slate-200 dark:border-white/10 text-center text-xs text-slate-400">
                  Completed tasks will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-mono">
              No assignments found
            </div>
          ) : (
            filtered.map((task) => {
              const isDone = task.status === 'done';
              return (
                <div
                  key={task.id}
                  className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] hover:bg-slate-100/70 dark:hover:bg-white/[0.05] flex items-center justify-between gap-4 transition"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => updateStatusDirect(task.id, isDone ? 'pending' : 'done')}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <h4
                        className={`text-xs font-medium truncate ${
                          isDone
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        {task.course_name} • Due: {task.due_date || 'None'} • {task.est_minutes}m est
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 shrink-0">
                    {getPriorityChip(task.priority)}

                    <select
                      value={task.status}
                      onChange={(e) => updateStatusDirect(task.id, e.target.value as TaskStatus)}
                      className="font-mono text-[10px] px-2.5 py-1 rounded bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      <option value="pending">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Completed</option>
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
