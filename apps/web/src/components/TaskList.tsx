import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Plus,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { Course, Task, TaskPriority, TaskStatus } from '@studymate/types';

interface TaskListProps {
  tasks: Task[];
  courses: Course[];
  onToggleStatus: (taskId: number, currentStatus: TaskStatus) => void;
  onOpenAddModal: () => void;
  onFocusTask: (task: Task) => void;
  onParseNlp: (text: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  courses,
  onToggleStatus,
  onOpenAddModal,
  onFocusTask,
  onParseNlp,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [nlpInput, setNlpInput] = useState('');

  // Counts for tabs
  const allCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedCourse !== 'all' && t.course_name !== selectedCourse) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.course_name && t.course_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="font-mono px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="font-mono px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            MED
          </span>
        );
      case 'low':
        return (
          <span className="font-mono px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-app-border">
            LOW
          </span>
        );
    }
  };

  const handleNlpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpInput.trim()) return;
    onParseNlp(nlpInput.trim());
    setNlpInput('');
  };

  const formatDue = (dateStr: string | null) => {
    if (!dateStr) return 'No due date';
    const due = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return `Due ${dateStr}`;
  };

  return (
    <div className="rounded-2xl p-6 bg-app-card border border-app-border shadow-sm space-y-4 transition-colors duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-app-border gap-3">
        <div>
          <h2 className="font-headline text-lg font-bold text-app-text tracking-tight">
            Academic Tasks & Assignments
          </h2>
          <p className="text-xs text-app-muted mt-0.5">
            Prioritize coursework, track deadlines, and launch focus sessions
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 rounded-xl font-headline font-bold text-xs text-white bg-[#4f91b0] hover:bg-[#3f748d] transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
            selectedStatus === 'all'
              ? 'bg-[#4f91b0] text-white font-bold shadow-sm'
              : 'bg-app-subtle text-app-muted hover:text-slate-900 dark:hover:text-white border border-app-border'
          }`}
        >
          All ({allCount})
        </button>
        <button
          onClick={() => setSelectedStatus('pending')}
          className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
            selectedStatus === 'pending'
              ? 'bg-[#4f91b0] text-white font-bold shadow-sm'
              : 'bg-app-subtle text-app-muted hover:text-slate-900 dark:hover:text-white border border-app-border'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setSelectedStatus('in_progress')}
          className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
            selectedStatus === 'in_progress'
              ? 'bg-[#4f91b0] text-white font-bold shadow-sm'
              : 'bg-app-subtle text-app-muted hover:text-slate-900 dark:hover:text-white border border-app-border'
          }`}
        >
          In Progress ({inProgressCount})
        </button>
        <button
          onClick={() => setSelectedStatus('done')}
          className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
            selectedStatus === 'done'
              ? 'bg-[#4f91b0] text-white font-bold shadow-sm'
              : 'bg-app-subtle text-app-muted hover:text-slate-900 dark:hover:text-white border border-app-border'
          }`}
        >
          Done ({doneCount})
        </button>
      </div>

      {/* Course Filter Dropdown & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Course Dropdown */}
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="bg-app-subtle border border-app-border text-app-text rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500 shrink-0"
        >
          <option value="all">Filter Course (All)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.name}>
              {c.code ? `${c.code}: ${c.name}` : c.name}
            </option>
          ))}
        </select>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assignments or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-app-subtle border border-app-border rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition font-mono"
          />
        </div>
      </div>

      {/* Task Rows List */}
      <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 rounded-xl bg-app-subtle/40 border border-dashed border-app-border">
            <p className="text-xs text-app-muted font-mono">
              No tasks found matching your filter criteria
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'done';
            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
                  isDone
                    ? 'bg-slate-50/50 dark:bg-[#1e293b]/30 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                    : 'bg-white dark:bg-[#1e293b]/70 border-app-border hover:border-indigo-300 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                {/* Left Task Checkbox & Info */}
                <div className="flex items-start space-x-3 min-w-0">
                  <button
                    onClick={() => onToggleStatus(task.id, task.status)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition shrink-0 cursor-pointer"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/15" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-headline text-sm font-semibold tracking-tight ${
                          isDone
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-mono text-app-muted">
                      <span className="font-semibold text-[#4f91b0]">
                        {task.course_code || task.course_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDue(task.due_date)}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{task.est_minutes}m est</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Priority & Quick Action */}
                <div className="flex items-center space-x-2 sm:self-center shrink-0">
                  {getPriorityBadge(task.priority)}

                  {!isDone && (
                    <button
                      onClick={() => onFocusTask(task)}
                      className="px-2.5 py-1 text-[11px] font-headline font-semibold text-[#4f91b0] hover:bg-indigo-50 dark:hover:bg-indigo-500/15 rounded-lg border border-indigo-200 dark:border-indigo-500/30 transition flex items-center space-x-1 cursor-pointer"
                      title="Launch focus Pomodoro session"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Focus</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* NLP Quick Add Form */}
      <form
        onSubmit={handleNlpSubmit}
        className="p-2.5 rounded-xl bg-app-subtle/70 border border-app-border flex items-center space-x-2"
      >
        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 ml-1" />
        <input
          type="text"
          placeholder='Natural language task: e.g. "Read Chapter 4 for CS 420 by Thursday"'
          value={nlpInput}
          onChange={(e) => setNlpInput(e.target.value)}
          className="flex-1 bg-transparent border-none text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none font-mono"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-white bg-[#4f91b0] hover:bg-[#3f748d] transition shrink-0 cursor-pointer"
        >
          Add via AI
        </button>
      </form>
    </div>
  );
};
