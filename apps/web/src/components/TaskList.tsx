import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Plus,
  Search,
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
          <span className="font-mono px-2 py-0.5 text-[9px] font-semibold uppercase rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="font-mono px-2 py-0.5 text-[9px] font-semibold uppercase rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            MED
          </span>
        );
      case 'low':
        return (
          <span className="font-mono px-2 py-0.5 text-[9px] font-semibold uppercase rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
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
    if (diffDays <= 7) return `Due in ${diffDays}d`;
    return `Due ${dateStr}`;
  };

  return (
    <div className="rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08] gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
            Assignments & Coursework
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track deadlines, prioritize effort, and launch focus sessions
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition flex items-center space-x-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {[
          { id: 'all', label: `All (${allCount})` },
          { id: 'pending', label: `Pending (${pendingCount})` },
          { id: 'in_progress', label: `In Progress (${inProgressCount})` },
          { id: 'done', label: `Completed (${doneCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id as any)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
              selectedStatus === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Course Filter Dropdown & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-slate-400 shrink-0 cursor-pointer"
        >
          <option value="all">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.name}>
              {c.code ? `${c.code}: ${c.name}` : c.name}
            </option>
          ))}
        </select>

        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assignments or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-400 transition"
          />
        </div>
      </div>

      {/* Task Rows List */}
      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No tasks found matching your filter
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'done';
            return (
              <div
                key={task.id}
                className={`p-3 rounded-lg transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
                  isDone
                    ? 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-200/50 dark:border-white/5 opacity-60'
                    : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] hover:bg-slate-100/70 dark:hover:bg-white/[0.05]'
                }`}
              >
                {/* Left Task Checkbox & Info */}
                <div className="flex items-start space-x-3 min-w-0">
                  <button
                    onClick={() => onToggleStatus(task.id, task.status)}
                    className="mt-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition shrink-0 cursor-pointer"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <span
                      className={`text-xs font-medium ${
                        isDone
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </span>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
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
                      className="px-2.5 py-1 text-[10px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.1] rounded border border-slate-200 dark:border-white/10 transition cursor-pointer"
                    >
                      Focus
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Add Form */}
      <form
        onSubmit={handleNlpSubmit}
        className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] flex items-center space-x-2"
      >
        <input
          type="text"
          placeholder='Quick add: "Read Chapter 4 for CS 420 by Thursday"'
          value={nlpInput}
          onChange={(e) => setNlpInput(e.target.value)}
          className="flex-1 bg-transparent border-none text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition shrink-0 cursor-pointer"
        >
          Add Task
        </button>
      </form>
    </div>
  );
};
