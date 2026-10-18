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
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121520] border border-white/[0.08] text-[#F5EFE6] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl">
        {/* Warm ambient tungsten glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#E5A952]/[0.08] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <h1 className="font-serif text-2xl font-medium tracking-tight text-[#F5EFE6]">
              Assignments Desk
            </h1>
            <span className="font-sans text-xs font-semibold px-3 py-0.5 rounded-full bg-white/10 text-[#E5A952] border border-white/15 uppercase tracking-wider">
              {tasks.length} Total
            </span>
          </div>
          <p className="text-xs text-[#C8BFB2] mt-1 max-w-xl">
            Drag and drop cards across columns or use quick actions to calibrate your coursework.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-full bg-white/[0.06] border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full transition cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#F5EFE6] text-[#0E1117] font-semibold shadow-sm'
                  : 'text-[#C8BFB2] hover:text-[#F5EFE6]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5 text-[#E5A952]" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#F5EFE6] text-[#0E1117] font-semibold shadow-sm'
                  : 'text-[#C8BFB2] hover:text-[#F5EFE6]'
              }`}
            >
              <List className="w-3.5 h-3.5 text-[#E5A952]" />
              <span>List View</span>
            </button>
          </div>

          {/* Add Assignment Button */}
          <button
            onClick={onOpenAddModal}
            className="pl-5 pr-1.5 py-2 rounded-full text-xs font-semibold text-[#0E1117] bg-[#F5EFE6] hover:bg-white active:scale-[0.98] transition flex items-center gap-2.5 cursor-pointer shadow-sm group"
          >
            <span>Add Assignment</span>
            <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#121520] border border-[#E6DFD3] dark:border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Course filter */}
          <div className="flex items-center space-x-2 font-sans text-stone-500 dark:text-[#C8BFB2]">
            <span>Course:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-white dark:bg-[#0B0D13] border border-stone-200 dark:border-white/10 text-stone-800 dark:text-[#F5EFE6] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#E5A952]"
            >
              <option value="all" className="bg-white text-stone-900 dark:bg-[#0B0D13] dark:text-[#F5EFE6]">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.name} className="bg-white text-stone-900 dark:bg-[#0B0D13] dark:text-[#F5EFE6]">
                  {c.code ? `${c.code}: ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex items-center space-x-1 font-sans text-stone-500 dark:text-[#C8BFB2]">
            <span>Priority:</span>
            {(['all', 'high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-3 py-1 rounded-full uppercase text-[10px] font-semibold transition cursor-pointer ${
                  selectedPriority === p
                    ? 'bg-[#E5A952]/15 text-[#B87D28] dark:text-[#E5A952] border border-[#E5A952]/30'
                    : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200 dark:bg-white/[0.04] dark:text-[#C8BFB2] dark:border-white/10 dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 dark:text-white/40 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 bg-white dark:bg-[#0B0D13] border border-stone-200 dark:border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-stone-900 dark:text-[#F5EFE6] placeholder-stone-400 dark:placeholder-white/40 focus:outline-none focus:border-[#E5A952]"
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
            className={`p-1.5 rounded-[1.8rem] transition-all duration-200 border ${
              dragOverCol === 'pending'
                ? 'border-[#E5A952] bg-[#E5A952]/10'
                : 'bg-stone-200/50 dark:bg-white/[0.04] border-stone-200 dark:border-white/[0.08]'
            }`}
          >
            <div className="rounded-[1.4rem] p-4 bg-white dark:bg-[#0B0D13] border border-stone-200/80 dark:border-white/[0.06] shadow-sm space-y-3 min-h-[440px] flex flex-col">
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-white/[0.03] border border-stone-200/70 dark:border-white/[0.06]">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-stone-400" />
                  <h3 className="text-xs font-serif font-medium uppercase tracking-wider text-stone-900 dark:text-[#F5EFE6]">
                    To Do ({pendingTasks.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-stone-500 dark:text-[#C8BFB2] font-medium">Ready</span>
              </div>

              {/* Drop Placeholder if dragging over */}
              {dragOverCol === 'pending' && (
                <div className="p-3 rounded-xl border border-dashed border-[#E5A952] bg-[#E5A952]/10 text-center text-xs font-semibold text-[#B87D28] dark:text-[#E5A952] animate-pulse">
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
                    className={`p-4 rounded-xl bg-stone-50/80 dark:bg-white/[0.02] hover:bg-stone-100/80 dark:hover:bg-white/[0.05] border border-stone-200/80 hover:border-[#E5A952]/40 dark:border-white/[0.06] dark:hover:border-white/20 shadow-sm space-y-3 transition-all group cursor-grab active:cursor-grabbing ${
                      draggedTaskId === task.id ? 'opacity-40 scale-95 border-dashed border-[#E5A952]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <GripVertical className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#E5A952] dark:text-white/30 dark:group-hover:text-[#E5A952] shrink-0" />
                        <span className="font-mono text-[10px] font-semibold text-[#E5A952] truncate max-w-[160px]">
                          {task.course_name}
                        </span>
                      </div>
                      {getPriorityChip(task.priority)}
                    </div>

                    <h4 className="text-sm font-semibold text-stone-900 dark:text-[#F5EFE6] tracking-tight leading-snug">
                      {task.title}
                    </h4>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-white/10 text-[11px] font-mono text-stone-500 dark:text-[#C8BFB2]">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-stone-400 dark:text-white/40" />
                        <span>{task.due_date || 'No deadline'}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-stone-400 dark:text-white/40" />
                        <span>{task.est_minutes}m</span>
                      </span>
                    </div>

                    {/* Actions: Start working, mark complete, focus */}
                    <div className="flex items-center justify-between pt-1 gap-2">
                      <button
                        onClick={() => updateStatusDirect(task.id, 'in_progress')}
                        className="text-xs font-medium text-[#B87D28] dark:text-[#E5A952] hover:underline flex items-center space-x-1 cursor-pointer"
                        title="Move to In Progress"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Start</span>
                      </button>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => onFocusTask(task)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-semibold text-[#1C1917] dark:text-[#E5A952] bg-[#E5A952]/10 hover:bg-[#E5A952]/20 border border-[#E5A952]/30 transition cursor-pointer"
                          title="Start Pomodoro focus timer"
                        >
                          Focus
                        </button>
                        <button
                          onClick={() => updateStatusDirect(task.id, 'done')}
                          className="p-1 rounded-lg text-stone-400 hover:text-[#4E7A68] hover:bg-[#4E7A68]/10 dark:text-white/40 dark:hover:text-[#4E7A68] transition cursor-pointer"
                          title="Mark Complete"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {pendingTasks.length === 0 && dragOverCol !== 'pending' && (
                  <div className="p-6 rounded-xl border border-dashed border-stone-200 dark:border-white/10 text-center text-xs text-stone-400 dark:text-[#C8BFB2]">
                    No tasks in queue. Drag a task here or add an assignment.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div
            onDragOver={(e) => handleDragOverCol(e, 'in_progress')}
            onDragLeave={handleDragLeaveCol}
            onDrop={(e) => handleDropOnCol(e, 'in_progress')}
            className={`p-1.5 rounded-[1.8rem] transition-all duration-200 border ${
              dragOverCol === 'in_progress'
                ? 'border-[#E5A952] bg-[#E5A952]/10'
                : 'bg-stone-200/50 dark:bg-white/[0.04] border-stone-200 dark:border-white/[0.08]'
            }`}
          >
            <div className="rounded-[1.4rem] p-4 bg-white dark:bg-[#0B0D13] border border-stone-200/80 dark:border-white/[0.06] shadow-sm space-y-3 min-h-[440px] flex flex-col">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#E5A952]/10 border border-[#E5A952]/20">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#E5A952] animate-pulse" />
                  <h3 className="text-xs font-serif font-medium uppercase tracking-wider text-[#B87D28] dark:text-[#E5A952]">
                    In Progress ({inProgressTasks.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#B87D28] dark:text-[#E5A952] font-medium">Active</span>
              </div>

              {/* Drop Placeholder if dragging over */}
              {dragOverCol === 'in_progress' && (
                <div className="p-3 rounded-xl border border-dashed border-[#E5A952] bg-[#E5A952]/10 text-center text-xs font-semibold text-[#B87D28] dark:text-[#E5A952] animate-pulse">
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
                    className={`p-4 rounded-xl bg-stone-50/80 dark:bg-white/[0.02] hover:bg-stone-100/80 dark:hover:bg-white/[0.05] border border-[#E5A952]/30 dark:border-[#E5A952]/30 hover:border-[#E5A952] shadow-sm space-y-3 transition-all group cursor-grab active:cursor-grabbing ${
                      draggedTaskId === task.id ? 'opacity-40 scale-95 border-dashed border-[#E5A952]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <GripVertical className="w-3.5 h-3.5 text-[#E5A952]/70 group-hover:text-[#E5A952] shrink-0" />
                        <span className="font-mono text-[10px] font-semibold text-[#B87D28] dark:text-[#E5A952] truncate max-w-[160px]">
                          {task.course_name}
                        </span>
                      </div>
                      {getPriorityChip(task.priority)}
                    </div>

                    <h4 className="text-sm font-semibold text-stone-900 dark:text-[#F5EFE6] tracking-tight leading-snug">
                      {task.title}
                    </h4>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-white/10 text-[11px] font-mono text-stone-500 dark:text-[#C8BFB2]">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-stone-400 dark:text-white/40" />
                        <span>{task.due_date || 'No deadline'}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-stone-400 dark:text-white/40" />
                        <span>{task.est_minutes}m</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 gap-2">
                      <button
                        onClick={() => updateStatusDirect(task.id, 'done')}
                        className="text-xs font-medium text-[#4E7A68] hover:underline flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Done</span>
                      </button>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => onFocusTask(task)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-semibold text-[#1C1917] dark:text-[#E5A952] bg-[#E5A952]/10 hover:bg-[#E5A952]/20 border border-[#E5A952]/30 transition cursor-pointer"
                        >
                          Continue
                        </button>
                        <button
                          onClick={() => updateStatusDirect(task.id, 'pending')}
                          className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10 transition cursor-pointer"
                          title="Move back to To Do"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {inProgressTasks.length === 0 && dragOverCol !== 'in_progress' && (
                  <div className="p-6 rounded-xl border border-dashed border-stone-200 dark:border-white/10 text-center text-xs text-stone-400 dark:text-[#C8BFB2]">
                    Drag any task here when you start working on it.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Done (Completed) */}
          <div
            onDragOver={(e) => handleDragOverCol(e, 'done')}
            onDragLeave={handleDragLeaveCol}
            onDrop={(e) => handleDropOnCol(e, 'done')}
            className={`p-1.5 rounded-[1.8rem] transition-all duration-200 border ${
              dragOverCol === 'done'
                ? 'border-[#4E7A68] bg-[#4E7A68]/10'
                : 'bg-stone-200/50 dark:bg-white/[0.04] border-stone-200 dark:border-white/[0.08]'
            }`}
          >
            <div className="rounded-[1.4rem] p-4 bg-white dark:bg-[#0B0D13] border border-stone-200/80 dark:border-white/[0.06] shadow-sm space-y-3 min-h-[440px] flex flex-col">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#4E7A68]/10 border border-[#4E7A68]/20">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#4E7A68]" />
                  <h3 className="text-xs font-serif font-medium uppercase tracking-wider text-[#4E7A68]">
                    Completed ({doneTasks.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#4E7A68] font-medium">Done</span>
              </div>

              {/* Drop Placeholder if dragging over */}
              {dragOverCol === 'done' && (
                <div className="p-3 rounded-xl border border-dashed border-[#4E7A68] bg-[#4E7A68]/10 text-center text-xs font-semibold text-[#4E7A68] animate-pulse">
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
                    className={`p-4 rounded-xl bg-stone-50/60 dark:bg-white/[0.02] hover:bg-stone-100/80 dark:hover:bg-white/[0.05] border border-[#4E7A68]/30 dark:border-white/10 hover:border-[#4E7A68] opacity-80 hover:opacity-100 space-y-2 transition-all group cursor-grab active:cursor-grabbing shadow-sm ${
                      draggedTaskId === task.id ? 'opacity-40 scale-95 border-dashed border-[#4E7A68]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <GripVertical className="w-3.5 h-3.5 text-[#4E7A68]/60 group-hover:text-[#4E7A68] shrink-0" />
                        <span className="font-mono text-[10px] font-semibold text-[#4E7A68] truncate max-w-[160px]">
                          {task.course_name}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#4E7A68]/15 text-[#4E7A68] border border-[#4E7A68]/30">
                        DONE
                      </span>
                    </div>

                    <h4 className="text-sm font-medium line-through text-stone-400 dark:text-stone-500">
                      {task.title}
                    </h4>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-white/10 text-[11px] font-mono text-stone-500 dark:text-[#C8BFB2]">
                      <span className="text-[#4E7A68] font-medium">Completed</span>
                      <button
                        onClick={() => updateStatusDirect(task.id, 'pending')}
                        className="text-xs text-stone-500 hover:text-stone-800 dark:text-[#C8BFB2] dark:hover:text-white hover:underline flex items-center space-x-1 cursor-pointer"
                        title="Reopen task and move to To Do"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reopen</span>
                      </button>
                    </div>
                  </div>
                ))}

                {doneTasks.length === 0 && dragOverCol !== 'done' && (
                  <div className="p-6 rounded-xl border border-dashed border-stone-200 dark:border-white/10 text-center text-xs text-stone-400 dark:text-[#C8BFB2]">
                    Completed tasks will show up here. Drag finished tasks into this column.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="p-1.5 rounded-[1.8rem] bg-stone-200/50 dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08]">
          <div className="rounded-[1.4rem] p-6 bg-white dark:bg-[#0B0D13] border border-stone-200/80 dark:border-white/[0.06] shadow-sm space-y-3">
            {filtered.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3">
                <p className="text-xs text-stone-500 dark:text-[#C8BFB2] font-mono">No assignments found in workspace</p>
                <button
                  onClick={onOpenAddModal}
                  className="pl-5 pr-1.5 py-2 rounded-full text-xs font-semibold text-[#0E1117] bg-[#F5EFE6] hover:bg-white active:scale-[0.98] transition inline-flex items-center gap-2.5 cursor-pointer group shadow-sm"
                >
                  <span>Create Assignment</span>
                  <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            ) : (
              filtered.map((task) => {
                const isDone = task.status === 'done';
                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-stone-50/70 hover:bg-stone-100/80 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] border border-stone-200/80 hover:border-[#E5A952]/40 dark:border-white/[0.06] dark:hover:border-white/20 flex items-center justify-between gap-4 transition shadow-sm"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <button
                        onClick={() => updateStatusDirect(task.id, isDone ? 'pending' : 'done')}
                        className="text-stone-400 hover:text-[#E5A952] transition cursor-pointer"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-[#4E7A68]" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <h4
                          className={`text-sm font-semibold truncate ${
                            isDone ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-[#F5EFE6]'
                          }`}
                        >
                          {task.title}
                        </h4>
                        <p className="text-[11px] font-mono text-stone-500 dark:text-[#C8BFB2]">
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
                            ? 'bg-[#4E7A68]/15 text-[#4E7A68] border-[#4E7A68]/30'
                            : task.status === 'in_progress'
                            ? 'bg-[#E5A952]/15 text-[#B87D28] dark:text-[#E5A952] border-[#E5A952]/30'
                            : 'bg-white text-stone-700 border-stone-200 dark:bg-white/[0.06] dark:text-[#C8BFB2] dark:border-white/10'
                        }`}
                      >
                        <option value="pending" className="bg-white text-stone-900 dark:bg-[#0B0D13] dark:text-[#F5EFE6]">To Do</option>
                        <option value="in_progress" className="bg-white text-stone-900 dark:bg-[#0B0D13] dark:text-[#F5EFE6]">In Progress</option>
                        <option value="done" className="bg-white text-stone-900 dark:bg-[#0B0D13] dark:text-[#F5EFE6]">Completed</option>
                      </select>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
