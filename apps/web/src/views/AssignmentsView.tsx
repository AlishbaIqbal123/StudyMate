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
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25">
            MED
          </span>
        );
      case 'low':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-app-subtle text-app-muted border border-app-border">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner with Stats & Controls */}
      <div className="p-6 rounded-2xl bg-app-card border border-app-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="font-headline text-2xl font-bold tracking-tight text-app-text">
              Assignments
            </h1>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#4f91b0]/15 text-[#4f91b0] border border-[#4f91b0]/25">
              {tasks.length} Total
            </span>
          </div>
          <p className="text-xs text-app-muted mt-1">
            Drag and drop cards between columns or use quick buttons to update assignment progress.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-app-subtle border border-app-border text-xs font-headline">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-app-card text-app-text shadow-sm font-bold border border-app-border'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-app-card text-app-text shadow-sm font-bold border border-app-border'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>

          {/* Add Assignment Button */}
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl text-xs font-headline font-bold text-white bg-[#4f91b0] hover:bg-[#3f748d] transition shadow-md shadow-[#4f91b0]/20 flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Assignment</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-app-card border border-app-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Course filter */}
          <div className="flex items-center space-x-1.5 font-mono text-app-muted">
            <span>Course:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-app-subtle border border-app-border text-app-text rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#4f91b0]"
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
          <div className="flex items-center space-x-1 font-mono text-app-muted">
            <span>Priority:</span>
            {(['all', 'high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-bold transition cursor-pointer ${
                  selectedPriority === p
                    ? 'bg-[#4f91b0] text-white shadow-sm'
                    : 'bg-app-subtle text-app-muted border border-app-border hover:text-app-text'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-app-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-60 bg-app-subtle border border-app-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-app-text placeholder-app-muted focus:outline-none focus:border-[#4f91b0]"
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
            className={`rounded-2xl p-4 transition-all duration-200 min-h-[400px] flex flex-col space-y-3 ${
              dragOverCol === 'pending'
                ? 'bg-[#4f91b0]/10 border-2 border-dashed border-[#4f91b0] ring-4 ring-[#4f91b0]/10'
                : 'bg-app-subtle/50 border border-app-border'
            }`}
          >
            <div className="flex items-center justify-between p-3 rounded-xl bg-app-card border border-app-border shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-app-text">
                  To Do ({pendingTasks.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-app-muted font-semibold">Ready</span>
            </div>

            {/* Drop Placeholder if dragging over */}
            {dragOverCol === 'pending' && (
              <div className="p-3 rounded-xl border-2 border-dashed border-[#4f91b0] bg-[#4f91b0]/15 text-center text-xs font-bold text-[#4f91b0] animate-pulse">
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
                  className={`p-4 rounded-xl bg-app-card border border-app-border shadow-sm space-y-3 transition group cursor-grab active:cursor-grabbing hover:border-[#4f91b0]/60 ${
                    draggedTaskId === task.id ? 'opacity-40 scale-95 border-dashed border-[#4f91b0]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-app-muted group-hover:text-[#4f91b0] shrink-0" />
                      <span className="font-mono text-[10px] font-bold text-[#4f91b0] truncate max-w-[160px]">
                        {task.course_name}
                      </span>
                    </div>
                    {getPriorityChip(task.priority)}
                  </div>

                  <h4 className="font-headline text-sm font-bold text-app-text">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-app-border text-[11px] font-mono text-app-muted">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{task.due_date || 'No deadline'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{task.est_minutes}m</span>
                    </span>
                  </div>

                  {/* Actions: Start working, mark complete, focus */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <button
                      onClick={() => updateStatusDirect(task.id, 'in_progress')}
                      className="text-xs font-headline font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
                      title="Move to In Progress"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Start</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onFocusTask(task)}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-app-subtle hover:bg-[#4f91b0]/15 text-app-text transition cursor-pointer"
                        title="Start Pomodoro focus timer"
                      >
                        Focus
                      </button>
                      <button
                        onClick={() => updateStatusDirect(task.id, 'done')}
                        className="p-1 rounded-lg text-app-muted hover:text-emerald-500 hover:bg-emerald-500/10 transition cursor-pointer"
                        title="Mark Complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingTasks.length === 0 && dragOverCol !== 'pending' && (
                <div className="p-6 rounded-xl border border-dashed border-app-border text-center text-xs text-app-muted">
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
            className={`rounded-2xl p-4 transition-all duration-200 min-h-[400px] flex flex-col space-y-3 ${
              dragOverCol === 'in_progress'
                ? 'bg-amber-500/10 border-2 border-dashed border-amber-500 ring-4 ring-amber-500/10'
                : 'bg-app-subtle/50 border border-app-border'
            }`}
          >
            <div className="flex items-center justify-between p-3 rounded-xl bg-app-card border border-amber-500/30 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  In Progress ({inProgressTasks.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">Active</span>
            </div>

            {/* Drop Placeholder if dragging over */}
            {dragOverCol === 'in_progress' && (
              <div className="p-3 rounded-xl border-2 border-dashed border-amber-500 bg-amber-500/15 text-center text-xs font-bold text-amber-700 dark:text-amber-300 animate-pulse">
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
                  className={`p-4 rounded-xl bg-app-card border border-amber-500/40 shadow-sm space-y-3 transition group cursor-grab active:cursor-grabbing hover:border-amber-500 ${
                    draggedTaskId === task.id ? 'opacity-40 scale-95 border-dashed border-amber-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-amber-500 group-hover:text-amber-600 shrink-0" />
                      <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 truncate max-w-[160px]">
                        {task.course_name}
                      </span>
                    </div>
                    {getPriorityChip(task.priority)}
                  </div>

                  <h4 className="font-headline text-sm font-bold text-app-text">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-app-border text-[11px] font-mono text-app-muted">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{task.due_date || 'No deadline'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{task.est_minutes}m</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2">
                    <button
                      onClick={() => updateStatusDirect(task.id, 'done')}
                      className="text-xs font-headline font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Done</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onFocusTask(task)}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 transition cursor-pointer"
                      >
                        Continue
                      </button>
                      <button
                        onClick={() => updateStatusDirect(task.id, 'pending')}
                        className="p-1 rounded-lg text-app-muted hover:text-app-text hover:bg-app-subtle transition cursor-pointer"
                        title="Move back to To Do"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {inProgressTasks.length === 0 && dragOverCol !== 'in_progress' && (
                <div className="p-6 rounded-xl border border-dashed border-app-border text-center text-xs text-app-muted">
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
            className={`rounded-2xl p-4 transition-all duration-200 min-h-[400px] flex flex-col space-y-3 ${
              dragOverCol === 'done'
                ? 'bg-emerald-500/10 border-2 border-dashed border-emerald-500 ring-4 ring-emerald-500/10'
                : 'bg-app-subtle/50 border border-app-border'
            }`}
          >
            <div className="flex items-center justify-between p-3 rounded-xl bg-app-card border border-emerald-500/30 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Completed ({doneTasks.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Done</span>
            </div>

            {/* Drop Placeholder if dragging over */}
            {dragOverCol === 'done' && (
              <div className="p-3 rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-500/15 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-pulse">
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
                  className={`p-4 rounded-xl bg-app-card border border-app-border opacity-75 hover:opacity-100 space-y-2 transition group cursor-grab active:cursor-grabbing hover:border-emerald-500/50 ${
                    draggedTaskId === task.id ? 'opacity-40 scale-95 border-dashed border-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-emerald-500/60 group-hover:text-emerald-500 shrink-0" />
                      <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[160px]">
                        {task.course_name}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      DONE
                    </span>
                  </div>

                  <h4 className="font-headline text-sm font-medium line-through text-app-muted">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-app-border text-[11px] font-mono text-app-muted">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Completed</span>
                    <button
                      onClick={() => updateStatusDirect(task.id, 'pending')}
                      className="text-xs text-app-muted hover:text-app-text hover:underline flex items-center space-x-1 cursor-pointer"
                      title="Reopen task and move to To Do"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reopen</span>
                    </button>
                  </div>
                </div>
              ))}

              {doneTasks.length === 0 && dragOverCol !== 'done' && (
                <div className="p-6 rounded-xl border border-dashed border-app-border text-center text-xs text-app-muted">
                  Completed tasks will show up here. Drag finished tasks into this column.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="p-6 rounded-2xl bg-app-card border border-app-border shadow-sm space-y-3">
          {filtered.map((task) => {
            const isDone = task.status === 'done';
            return (
              <div
                key={task.id}
                className="p-3.5 rounded-xl bg-app-subtle border border-app-border flex items-center justify-between gap-4 hover:border-[#4f91b0]/40 transition"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <button
                    onClick={() => updateStatusDirect(task.id, isDone ? 'pending' : 'done')}
                    className="text-app-muted hover:text-[#4f91b0] transition cursor-pointer"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <h4
                      className={`font-headline text-sm font-semibold truncate ${
                        isDone ? 'line-through text-app-muted' : 'text-app-text'
                      }`}
                    >
                      {task.title}
                    </h4>
                    <p className="text-[11px] font-mono text-app-muted">
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
                    className={`font-mono text-[10px] px-2 py-1 rounded uppercase font-bold border transition cursor-pointer ${
                      task.status === 'done'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : task.status === 'in_progress'
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        : 'bg-app-card text-app-muted border-app-border'
                    }`}
                  >
                    <option value="pending">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Completed</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
