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
          <span className="font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-[#FDA769] text-white shadow-2xs">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEC868] text-[#473C33] shadow-2xs">
            MED
          </span>
        );
      case 'low':
        return (
          <span className="font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-[#ABC270] text-white shadow-2xs">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats & Controls (Sage Green Palette 18 Header) */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-[#839758] to-[#ABC270] text-white border border-[#839758]/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Coursework & Assignments
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-black/20 text-white border border-white/20">
              {tasks.length} total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/90 mt-1">
            Drag cards between columns or switch to list view to track deadlines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-black/20 border border-white/20 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer font-semibold ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#473C33] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer font-semibold ${
                viewMode === 'list'
                  ? 'bg-white text-[#473C33] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>

          {/* Add Assignment Button */}
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#473C33] bg-[#FEC868] hover:bg-[#FFD482] transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Course filter */}
          <div className="flex items-center space-x-2 text-[#63574B] dark:text-[#C2B2A1]">
            <span>Course:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 text-[#473C33] dark:text-[#FAF8F1] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#ABC270]"
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
          <div className="flex items-center space-x-1 text-[#63574B] dark:text-[#C2B2A1]">
            <span className="mr-1">Priority:</span>
            {(['all', 'high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-2.5 py-1 rounded-full uppercase text-[10px] font-semibold transition cursor-pointer ${
                  selectedPriority === p
                    ? 'bg-[#ABC270] text-white shadow-2xs'
                    : 'bg-[#FAF8F1] text-[#63574B] hover:text-[#473C33] dark:bg-[#393028] dark:text-[#C2B2A1] dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#87796B] absolute left-3 top-2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-56 bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 rounded-lg pl-8 pr-3 py-1 text-xs text-[#473C33] dark:text-[#FAF8F1] placeholder-[#87796B] focus:outline-none focus:border-[#ABC270]"
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
            className={`rounded-2xl p-4 transition-colors border shadow-xs ${
              dragOverCol === 'pending'
                ? 'border-[#473C33] bg-[#F5F2E8] dark:border-[#FEC868] dark:bg-[#393028]'
                : 'bg-white dark:bg-[#2E2620] border-[#E6E0D0] dark:border-[#FEC868]/15'
            } min-h-[440px] flex flex-col space-y-3`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E6E0D0] dark:border-[#FEC868]/10">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#473C33] dark:bg-[#E0D6C8]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#473C33] dark:text-[#FAF8F1]">
                  To Do
                </h3>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#F5F2E8] dark:bg-[#393028] text-[#473C33] dark:text-[#FAF8F1]">
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
                  className={`p-3.5 rounded-xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 hover:border-[#ABC270] space-y-2.5 transition group cursor-grab active:cursor-grabbing ${
                    draggedTaskId === task.id ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-[#87796B] shrink-0" />
                      <span className="font-semibold text-[11px] text-[#586738] dark:text-[#ABC270] truncate max-w-[150px]">
                        {task.course_name}
                      </span>
                    </div>
                    {getPriorityChip(task.priority)}
                  </div>

                  <h4 className="text-xs font-medium text-[#473C33] dark:text-[#FAF8F1] leading-snug">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E6E0D0] dark:border-[#FEC868]/10 text-[10px] font-mono text-[#7A6C5E] dark:text-[#C2B2A1]">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-[#87796B]" />
                      <span>{task.due_date || 'No deadline'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#87796B]" />
                      <span>{task.est_minutes}m</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2">
                    <button
                      onClick={() => updateStatusDirect(task.id, 'in_progress')}
                      className="text-xs text-[#63574B] hover:text-[#473C33] dark:text-[#C2B2A1] dark:hover:text-white flex items-center space-x-1 cursor-pointer font-medium"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-[#ABC270]" />
                      <span>Start</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onFocusTask(task)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] transition cursor-pointer"
                      >
                        Focus
                      </button>
                      <button
                        onClick={() => updateStatusDirect(task.id, 'done')}
                        className="p-1 rounded text-[#87796B] hover:text-[#FDA769] transition cursor-pointer"
                        title="Mark Complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingTasks.length === 0 && (
                <div className="p-6 rounded-xl border border-dashed border-[#DFD8C4] dark:border-[#FEC868]/20 text-center text-xs text-[#87796B]">
                  No tasks in queue.
                </div>
              )}
            </div>
          </div>

          {/* Column 2: In Progress (Sage Green #ABC270 Badge like reference UI) */}
          <div
            onDragOver={(e) => handleDragOverCol(e, 'in_progress')}
            onDragLeave={handleDragLeaveCol}
            onDrop={(e) => handleDropOnCol(e, 'in_progress')}
            className={`rounded-2xl p-4 transition-colors border shadow-xs ${
              dragOverCol === 'in_progress'
                ? 'border-[#ABC270] bg-[#ABC270]/15'
                : 'bg-white dark:bg-[#2E2620] border-[#E6E0D0] dark:border-[#FEC868]/15'
            } min-h-[440px] flex flex-col space-y-3`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E6E0D0] dark:border-[#FEC868]/10">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ABC270]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#473C33] dark:text-[#FAF8F1]">
                  In Progress
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#ABC270] text-white">
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
                  className={`p-3.5 rounded-xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#ABC270]/40 hover:border-[#ABC270] space-y-2.5 transition group cursor-grab active:cursor-grabbing ${
                    draggedTaskId === task.id ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-[#87796B] shrink-0" />
                      <span className="font-semibold text-[11px] text-[#586738] dark:text-[#ABC270] truncate max-w-[150px]">
                        {task.course_name}
                      </span>
                    </div>
                    <span className="font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-[#ABC270] text-white">
                      In Progress
                    </span>
                  </div>

                  <h4 className="text-xs font-medium text-[#473C33] dark:text-[#FAF8F1] leading-snug">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E6E0D0] dark:border-[#FEC868]/10 text-[10px] font-mono text-[#7A6C5E] dark:text-[#C2B2A1]">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-[#87796B]" />
                      <span>{task.due_date || 'No deadline'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#87796B]" />
                      <span>{task.est_minutes}m</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2">
                    <button
                      onClick={() => updateStatusDirect(task.id, 'done')}
                      className="text-xs text-[#E0712A] dark:text-[#FDA769] hover:underline flex items-center space-x-1 cursor-pointer font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onFocusTask(task)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] transition cursor-pointer"
                      >
                        Sprint
                      </button>
                      <button
                        onClick={() => updateStatusDirect(task.id, 'pending')}
                        className="p-1 rounded text-[#87796B] hover:text-[#473C33] dark:hover:text-white transition cursor-pointer"
                        title="Move back to To Do"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {inProgressTasks.length === 0 && (
                <div className="p-6 rounded-xl border border-dashed border-[#DFD8C4] dark:border-[#FEC868]/20 text-center text-xs text-[#87796B]">
                  Drag tasks here when in progress.
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Done (Completed - Warm Peach #FDA769 Badge like "Done" in reference UI) */}
          <div
            onDragOver={(e) => handleDragOverCol(e, 'done')}
            onDragLeave={handleDragLeaveCol}
            onDrop={(e) => handleDropOnCol(e, 'done')}
            className={`rounded-2xl p-4 transition-colors border shadow-xs ${
              dragOverCol === 'done'
                ? 'border-[#FDA769] bg-[#FDA769]/15'
                : 'bg-white dark:bg-[#2E2620] border-[#E6E0D0] dark:border-[#FEC868]/15'
            } min-h-[440px] flex flex-col space-y-3`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E6E0D0] dark:border-[#FEC868]/10">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FDA769]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#473C33] dark:text-[#FAF8F1]">
                  Completed
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FDA769] text-white">
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
                  className={`p-3.5 rounded-xl bg-[#FAF8F1] dark:bg-[#393028]/70 border border-[#E6E0D0] dark:border-[#FEC868]/10 space-y-2 transition group cursor-grab active:cursor-grabbing opacity-85 hover:opacity-100 ${
                    draggedTaskId === task.id ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-medium text-[11px] text-[#7A6C5E] dark:text-[#C2B2A1] truncate max-w-[150px]">
                      {task.course_name}
                    </span>
                    <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FDA769] text-white">
                      Done
                    </span>
                  </div>

                  <h4 className="text-xs font-medium line-through text-[#87796B] dark:text-[#A3907E] leading-snug">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E6E0D0] dark:border-[#FEC868]/10 text-[10px] font-mono text-[#87796B]">
                    <span>Complete</span>
                    <button
                      onClick={() => updateStatusDirect(task.id, 'pending')}
                      className="text-xs text-[#63574B] hover:text-[#473C33] dark:text-[#C2B2A1] dark:hover:text-white flex items-center space-x-1 cursor-pointer"
                      title="Reopen task"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reopen</span>
                    </button>
                  </div>
                </div>
              ))}

              {doneTasks.length === 0 && (
                <div className="p-6 rounded-xl border border-dashed border-[#DFD8C4] dark:border-[#FEC868]/20 text-center text-xs text-[#87796B]">
                  Completed tasks will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="rounded-2xl p-5 bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-2 shadow-xs">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#87796B] font-mono">
              No assignments found
            </div>
          ) : (
            filtered.map((task) => {
              const isDone = task.status === 'done';
              return (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 hover:border-[#ABC270] flex items-center justify-between gap-4 transition"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => updateStatusDirect(task.id, isDone ? 'pending' : 'done')}
                      className="text-[#87796B] hover:text-[#FDA769] transition cursor-pointer"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-[#FDA769]" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#ABC270]" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <h4
                        className={`text-xs font-semibold truncate ${
                          isDone
                            ? 'line-through text-[#87796B]'
                            : 'text-[#473C33] dark:text-[#FAF8F1]'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <p className="text-[10px] font-mono text-[#7A6C5E] dark:text-[#C2B2A1] mt-0.5">
                        {task.course_name} • Due: {task.due_date || 'None'} • {task.est_minutes}m est
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 shrink-0">
                    {getPriorityChip(task.priority)}

                    <select
                      value={task.status}
                      onChange={(e) => updateStatusDirect(task.id, e.target.value as TaskStatus)}
                      className="font-mono text-[10px] px-2.5 py-1 rounded-lg bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/20 text-[#473C33] dark:text-[#FAF8F1] transition cursor-pointer"
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
