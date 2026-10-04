import React from 'react';
import { BookOpen, Clock, CheckCircle2, TrendingUp, AlertCircle, Award } from 'lucide-react';
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
      <div className="rounded-2xl p-5 bg-app-card border border-app-border shadow-sm transition hover:shadow-md relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono font-semibold text-app-muted uppercase tracking-wider">
            Pending Tasks
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            {pendingCount > 0 ? 'Active' : 'All Clear'}
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="font-headline text-3xl font-extrabold text-app-text tracking-tight">
            {pendingCount}
          </span>
          <span className="text-xs text-app-muted font-sans">active items</span>
        </div>
        <p className="mt-2 text-xs font-mono text-rose-600 dark:text-rose-400 flex items-center space-x-1">
          <span className={`w-1.5 h-1.5 rounded-full ${highPriorityCount > 0 ? 'bg-rose-500' : 'bg-slate-400'} mr-1`} />
          <span>{highPriorityCount} High priority assignments</span>
        </p>
      </div>

      {/* 2. Active Courses */}
      <div className="rounded-2xl p-5 bg-app-card border border-app-border shadow-sm transition hover:shadow-md relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono font-semibold text-app-muted uppercase tracking-wider">
            Active Courses
          </span>
          <div className="p-1.5 rounded-lg bg-themePrimary-500/10 text-[#4f91b0] border border-themePrimary-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="font-headline text-3xl font-extrabold text-app-text tracking-tight">
            {courses.length}
          </span>
          <span className="text-xs text-app-muted font-sans">Enrolled</span>
        </div>
        <p className="mt-2 text-xs font-mono text-app-muted truncate">
          {courseCodes ? `${courseCodes}${courses.length > 3 ? ', ...' : ''}` : 'No courses enrolled yet'}
        </p>
      </div>

      {/* 3. Weekly Study Time */}
      <div className="rounded-2xl p-5 bg-app-card border border-app-border shadow-sm transition hover:shadow-md relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono font-semibold text-app-muted uppercase tracking-wider">
            Weekly Study Time
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            {totalHoursWeek > 0 ? `${totalHoursWeek.toFixed(1)}h logged` : 'Real-Time'}
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="font-headline text-3xl font-extrabold text-app-text tracking-tight">
            {Math.round(totalHoursWeek * 10) / 10}
          </span>
          <span className="text-xs text-app-muted font-sans">hrs logged</span>
        </div>
        <p className="mt-2 text-xs font-mono text-app-muted">
          {courses.length > 0 ? 'Target: 20 hrs / week' : 'Add courses to track study velocity'}
        </p>
      </div>

      {/* 4. Avg Completion Rate */}
      <div className="rounded-2xl p-5 bg-app-card border border-app-border shadow-sm transition hover:shadow-md relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-semibold text-app-muted uppercase tracking-wider">
            Avg Completion Rate
          </span>
          <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="font-headline text-3xl font-extrabold text-app-text tracking-tight">
            {avgCompletion}%
          </span>
        </div>
        <p className="mt-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
          <Award className="w-3.5 h-3.5 mr-1 inline" />
          <span>{courses.length > 0 ? 'Coursework progress' : 'Awaiting course assignments'}</span>
        </p>
      </div>
    </div>
  );
};
