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
  ArrowRight,
  GripVertical,
  PlayCircle,
  RotateCcw,
  Sparkles,
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
          <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            MED
          </span>
        );
      case 'low':
        return (
          <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/[0.06] text-white/60 border border-white/10">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner with Stats & Controls */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121520] border border-white/[0.08] dark:from-white/[0.08] dark:via-white/[0.04] dark:to-transparent backdrop-blur-2xl border border-blue-600/30 dark:border-white/15 text-white shadow-xl dark:shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <h1 className="font-serif text-2xl font-medium tracking-tight text-[#F5EFE6]">
              Assignments
            </h1>
            <span className="font-mono text-xs font-semibold px-3 py-0.5 rounded-full bg-white/15 text-white border border-white/20 uppercase tracking-wider">
              {tasks.length} Total
            </span>
          </div>
          <p className="text-xs text-blue-100/90 dark:text-white/60 mt-1 max-w-xl">
            Drag and drop cards between columns or use quick buttons to update assignment progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-full bg-white/15 dark:bg-white/[0.04] border border-white/20 dark:border-white/10 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full transition cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-md font-semibold dark:bg-white/20 dark:text-white dark:border dark:border-white/20'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5 text-[#E5A952] dark:text-[#E5A952]" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-md font-semibold dark:bg-white/20 dark:text-white dark:border dark:border-white/20'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5 text-[#E5A952] dark:text-[#E5A952]" />
              <span>List View</span>
            </button>
          </div>

          {/* Add Assignment Button */}
          <button
            onClick={onOpenAddModal}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-white transition shadow-xl border border-transparent dark:border-white/20 active:scale-95 hover:opacity-90 flex items-center space-x-1.5 cursor-pointer bg-slate-900 hover:bg-slate-800 dark:bg-gradient-to-b dark:from-[#2B2B2B] dark:to-[#101010]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Assignment</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Course filter */}
          <div className="flex items-center space-x-2 font-mono text-slate-500 dark:text-white/50">
            <span>Course:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400"
            >
              <option value="all" className="bg-white text-slate-900 dark:bg-[#0c0c12] dark:text-white">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.name} className="bg-white text-slate-900 dark:bg-[#0c0c12] dark:text-white">
                  {c.code ? `${c.code}: ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex items-center space-x-1 font-mono text-slate-500 dark:text-white/50">
            <span>Priority:</span>
            {(['all', 'high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-3 py-1 rounded-full uppercase text-[10px] font-semibold transition cursor-pointer ${
                  selectedPriority === p
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-cyan-500/20 dark:text-[#E5A952] dark:border-cyan-500/30'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200 dark:bg-white/[0.04] dark:text-white/60 dark:border-white/10 dark:hover:text-white dark:hover:bg-white/[0.08]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-white/40 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/15 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Main View: Kanban vs List */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Column 1: To Do (Pending) */}
          <div
            onDragOver={(e) => handleDragOverCol(e, 'pending')}
            onDragLeave={handleDragLeaveCol}
            onDrop={(e) => handleDropOnCol(e, 'pending')}
            className={`rounded-3xl p-4 transition-all duration-200 min-h-[440px] flex flex-col space-y-3 bg-slate-100/70 dark:bg-white/[0.03] backdrop-blur-xl border ${
              dragOverCol === 'pending'
                ? 'border-blue-500/80 ring-4 ring-blue-500/10 bg-blue-50/50 dark:border-cyan-400/80 dark:ring-cyan-500/10 dark:bg-cyan-500/5'
                : 'border-slate-200/90 dark:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-white/[0.05] border border-slate-200/90 dark:border-white/10 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                  To Do ({pendingTasks.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-white/50 font-medium">Ready</span>
            </div>

            {/* Drop Placeholder if dragging over */}
            {dragOverCol === 'pending' && (
              <div className="p-3 rounded-2xl border-2 border-dashed border-blue-500/80 dark:border-cyan-400/80 bg-blue-50 dark:bg-cyan-500/10 text-center text-xs font-semibold text-blue-700 dark:text-[#E5A952] animate-pulse">
                Drop to move to To Do
              </div>
            )}

            <div className="space-y-3 flex-1">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 rounded-2xl bg-white dark:bg-white/[0.04] hover:bg-slate-50/80 dark:hover:bg-white/[0.07] border border-slate-200/90 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20 shadow-sm dark:shadow-lg space-y-3 transition-all group cursor-grab active:cursor-grabbing ${
                    draggedTaskId === task.id ? 'opacity-40 scale-95 border-dashed border-blue-500 dark:border-cyan-400' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E5A952] dark:text-white/30 dark:group-hover:text-[#E5A952] shrink-0" />
                      <span className="font-mono text-[10px] font-semibold text-[#E5A952] dark:text-[#E5A952] truncate max-w-[160px]">
                        {task.course_name}
                      </span>
                    </div>
                    {getPriorityChip(task.priority)}
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight leading-snug">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10 text-[11px] font-mono text-slate-500 dark:text-white/50">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400 dark:text-white/40" />
                      <span>{task.due_date || 'No deadline'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400 dark:text-white/40" />
                      <span>{task.est_minutes}m</span>
                    </span>
                  </div>

                  {/* Actions: Start working, mark complete, focus */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <button
                      onClick={() => updateStatusDirect(task.id, 'in_progress')}
                      className="text-xs font-medium text-amber-600 dark:text-amber-300 hover:text-amber-700 dark:hover:text-amber-200 hover:underline flex items-center space-x-1 cursor-pointer"
                      title="Move to In Progress"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Start</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onFocusTask(task)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium text-white transition cursor-pointer hover:opacity-90 bg-slate-900 hover:bg-slate-800 dark:bg-gradient-to-b dark:from-[#2B2B2B] dark:to-[#101010] border border-transparent dark:border-white/20"
                        title="Start Pomodoro focus timer"
                      >
                        Focus
                      </button>
                      <button
                        onClick={() => updateStatusDirect(task.id, 'done')}
                        className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:text-white/40 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 transition cursor-pointer"
                        title="Mark Complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingTasks.length === 0 && dragOverCol !== 'pending' && (
                <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-white/15 text-center text-xs text-slate-400 dark:text-white/40">
                  No tasks in queue. Drag a task here or add a new assignment.
                </div>
              )}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div
            onDragOver={(e) => handleDragOverCol(e, 'in_progress')}
            onDragLeave={handleDragLeaveCol}
            onDrop={(e) => handleDropOnCol(e, 'in_progress')}
            className={`rounded-3xl p-4 transition-all duration-200 min-h-[440px] flex flex-col space-y-3 bg-slate-100/70 dark:bg-white/[0.03] backdrop-blur-xl border ${
              dragOverCol === 'in_progress'
                ? 'border-amber-400/80 ring-4 ring-amber-500/10 bg-amber-50/50 dark:bg-amber-500/5'
                : 'border-slate-200/90 dark:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-white/[0.05] border border-amber-300 dark:border-amber-500/30 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  In Progress ({inProgressTasks.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-300/80 font-medium">Active</span>
            </div>

            {/* Drop Placeholder if dragging over */}
            {dragOverCol === 'in_progress' && (
              <div className="p-3 rounded-2xl border-2 border-dashed border-amber-400/80 bg-amber-50 dark:bg-amber-500/15 text-center text-xs font-semibold text-amber-700 dark:text-amber-300 animate-pulse">
                Drop to move to In Progress
              </div>
            )}

            <div className="space-y-3 flex-1">
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 rounded-2xl bg-white dark:bg-white/[0.04] hover:bg-slate-50/80 dark:hover:bg-white/[0.07] border border-amber-200 dark:border-amber-500/30 hover:border-amber-300 dark:hover:border-amber-400/60 shadow-sm dark:shadow-lg space-y-3 transition-all group cursor-grab active:cursor-grabbing ${
                    draggedTaskId === task.id ? 'opacity-40 scale-95 border-dashed border-amber-400' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-amber-500/60 group-hover:text-amber-600 dark:text-amber-400/60 dark:group-hover:text-amber-400 shrink-0" />
                      <span className="font-mono text-[10px] font-semibold text-amber-700 dark:text-amber-300 truncate max-w-[160px]">
                        {task.course_name}
                      </span>
                    </div>
                    {getPriorityChip(task.priority)}
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight leading-snug">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10 text-[11px] font-mono text-slate-500 dark:text-white/50">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400 dark:text-white/40" />
                      <span>{task.due_date || 'No deadline'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400 dark:text-white/40" />
                      <span>{task.est_minutes}m</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2">
                    <button
                      onClick={() => updateStatusDirect(task.id, 'done')}
                      className="text-xs font-medium text-emerald-600 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Done</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onFocusTask(task)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium text-amber-800 bg-amber-100 border border-amber-200 hover:bg-amber-200/80 dark:text-amber-300 dark:bg-amber-500/15 dark:border-amber-500/30 dark:hover:bg-amber-500/25 transition cursor-pointer"
                      >
                        Continue
                      </button>
                      <button
                        onClick={() => updateStatusDirect(task.id, 'pending')}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10 transition cursor-pointer"
                        title="Move back to To Do"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {inProgressTasks.length === 0 && dragOverCol !== 'in_progress' && (
                <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-white/15 text-center text-xs text-slate-400 dark:text-white/40">
                  Drag any task here when you start working on it.
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Done (Completed) */}
          <div
            onDragOver={(e) => handleDragOverCol(e, 'done')}
            onDragLeave={handleDragLeaveCol}
            onDrop={(e) => handleDropOnCol(e, 'done')}
            className={`rounded-3xl p-4 transition-all duration-200 min-h-[440px] flex flex-col space-y-3 bg-slate-100/70 dark:bg-white/[0.03] backdrop-blur-xl border ${
              dragOverCol === 'done'
                ? 'border-emerald-500/80 ring-4 ring-emerald-500/10 bg-emerald-50/50 dark:border-emerald-400/80 dark:ring-emerald-500/10 dark:bg-emerald-500/5'
                : 'border-slate-200/90 dark:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-white/[0.05] border border-emerald-300 dark:border-emerald-500/30 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Completed ({doneTasks.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-300/80 font-medium">Done</span>
            </div>

            {/* Drop Placeholder if dragging over */}
            {dragOverCol === 'done' && (
              <div className="p-3 rounded-2xl border-2 border-dashed border-emerald-500/80 dark:border-emerald-400/80 bg-emerald-50 dark:bg-emerald-500/15 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-pulse">
                Drop to mark as Completed
              </div>
            )}

            <div className="space-y-3 flex-1">
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] border border-emerald-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/40 opacity-80 hover:opacity-100 space-y-2 transition-all group cursor-grab active:cursor-grabbing shadow-sm ${
                    draggedTaskId === task.id ? 'opacity-40 scale-95 border-dashed border-emerald-500 dark:border-emerald-400' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-emerald-500/60 group-hover:text-emerald-600 dark:text-emerald-400/60 dark:group-hover:text-emerald-400 shrink-0" />
                      <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 truncate max-w-[160px]">
                        {task.course_name}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
                      DONE
                    </span>
                  </div>

                  <h4 className="text-sm font-medium line-through text-slate-400 dark:text-white/50">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10 text-[11px] font-mono text-slate-500 dark:text-white/50">
                    <span className="text-emerald-600 dark:text-emerald-300 font-medium">Completed</span>
                    <button
                      onClick={() => updateStatusDirect(task.id, 'pending')}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:text-white/50 dark:hover:text-white hover:underline flex items-center space-x-1 cursor-pointer"
                      title="Reopen task and move to To Do"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reopen</span>
                    </button>
                  </div>
                </div>
              ))}

              {doneTasks.length === 0 && dragOverCol !== 'done' && (
                <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-white/15 text-center text-xs text-slate-400 dark:text-white/40">
                  Completed tasks will show up here. Drag finished tasks into this column.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="p-6 rounded-3xl bg-[#FAF7F2] dark:bg-[#121520] border border-[#E6DFD3] dark:border-white/[0.06] shadow-sm dark:shadow-2xl space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <p className="text-xs text-slate-500 dark:text-white/50 font-mono">No assignments found in workspace</p>
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 rounded-full text-xs font-semibold text-white transition shadow-md border border-transparent dark:border-white/20 inline-flex items-center space-x-1 cursor-pointer hover:opacity-90 bg-slate-900 hover:bg-slate-800 dark:bg-gradient-to-b dark:from-[#2B2B2B] dark:to-[#101010]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Assignment</span>
              </button>
            </div>
          ) : (
            filtered.map((task) => {
            const isDone = task.status === 'done';
            return (
              <div
                key={task.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.07] border border-slate-200/80 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20 flex items-center justify-between gap-4 transition shadow-sm"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <button
                    onClick={() => updateStatusDirect(task.id, isDone ? 'pending' : 'done')}
                    className="text-slate-400 hover:text-[#E5A952] dark:text-white/40 dark:hover:text-[#E5A952] transition cursor-pointer"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        isDone ? 'line-through text-slate-400 dark:text-white/40' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-white/50">
                      {task.course_name} • Due: {task.due_date || 'None'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {getPriorityChip(task.priority)}

                  {/* Status Dropdown Picker for List View */}
                  <select
                    value={task.status}
                    onChange={(e) => updateStatusDirect(task.id, e.target.value as TaskStatus)}
                    className={`font-mono text-[10px] px-3 py-1 rounded-full uppercase font-semibold border transition cursor-pointer ${
                      task.status === 'done'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                        : task.status === 'in_progress'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/[0.06] dark:text-white/70 dark:border-white/10'
                    }`}
                  >
                    <option value="pending" className="bg-white text-slate-900 dark:bg-[#0c0c12] dark:text-white">To Do</option>
                    <option value="in_progress" className="bg-white text-slate-900 dark:bg-[#0c0c12] dark:text-white">In Progress</option>
                    <option value="done" className="bg-white text-slate-900 dark:bg-[#0c0c12] dark:text-white">Completed</option>
                  </select>
                </div>
              </div>
            );
          }))}
        </div>
      )}
    </div>
  );
};
