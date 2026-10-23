import React from 'react';
import { BookOpen, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Course, CourseProgress, Task } from '@studymate/types';

interface KpiCardsProps {
  tasks: Task[];
  courses: Course[];
  progressList: CourseProgress[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  tasks,
  courses,
  progressList,
}) => {
  const pendingCount = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const highPriorityCount = tasks.filter(
    (t) => (t.status === 'pending' || t.status === 'in_progress') && t.priority === 'high'
  ).length;

  const totalHoursWeek = progressList.reduce((acc, p) => acc + (p.hours_this_week || 0), 0);
  const avgCompletion =
    progressList.length > 0
      ? Math.round(
          progressList.reduce((acc, p) => acc + (p.completed_pct || 0), 0) / progressList.length
        )
      : 0;

  const courseCodes = courses
    .map((c) => c.code || c.name.slice(0, 8))
    .slice(0, 3)
    .join(', ');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Pending Tasks */}
      <div className="rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-medium text-[11px] uppercase tracking-wider">Pending Tasks</span>
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {pendingCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">assignments</span>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs">
          {highPriorityCount > 0 ? (
            <span className="text-rose-600 dark:text-rose-400 font-medium">
              {highPriorityCount} high priority
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">No urgent deadlines</span>
          )}
        </div>
      </div>

      {/* 2. Active Courses */}
      <div className="rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-medium text-[11px] uppercase tracking-wider">Active Courses</span>
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {courses.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">enrolled</span>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400 truncate">
          {courseCodes ? courseCodes : 'No courses registered'}
        </div>
      </div>

      {/* 3. Weekly Study Time */}
      <div className="rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-medium text-[11px] uppercase tracking-wider">Study Time</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {Math.round(totalHoursWeek * 10) / 10}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">hours this week</span>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400">
          Target: 20 hrs / week
        </div>
      </div>

      {/* 4. Avg Completion Rate */}
      <div className="rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-medium text-[11px] uppercase tracking-wider">Syllabus Progress</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {avgCompletion}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">overall completion</span>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400">
          Across all syllabus modules
        </div>
      </div>
    </div>
  );
};
