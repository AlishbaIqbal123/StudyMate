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
      <div className="rounded-2xl p-5 bg-[#FAF7F2] dark:bg-[#121520] border border-[#E6DFD3] dark:border-white/[0.06] transition-all hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/50 dark:hover:bg-white/[0.07] relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-white/50 uppercase tracking-wider">
            Pending Tasks
          </span>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-white/70 dark:border-white/10 uppercase tracking-wider">
            {pendingCount > 0 ? 'Active' : 'All Clear'}
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
            {pendingCount}
          </span>
          <span className="text-xs text-slate-500 dark:text-white/50 font-sans">active items</span>
        </div>
        <p className="mt-2 text-xs font-mono text-rose-600 dark:text-rose-400 flex items-center space-x-1">
          <span className={`w-1.5 h-1.5 rounded-full ${highPriorityCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'} mr-1`} />
          <span>{highPriorityCount} High priority assignments</span>
        </p>
      </div>

      {/* 2. Active Courses */}
      <div className="rounded-2xl p-5 bg-[#FAF7F2] dark:bg-[#121520] border border-[#E6DFD3] dark:border-white/[0.06] transition-all hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/50 dark:hover:bg-white/[0.07] relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-white/50 uppercase tracking-wider">
            Active Courses
          </span>
          <div className="p-1.5 rounded-lg bg-[#E5A952]/10 text-[#E5A952] border border-[#E5A952]/20 dark:bg-white/10 dark:text-white dark:border-white/15">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
            {courses.length}
          </span>
          <span className="text-xs text-slate-500 dark:text-white/50 font-sans">Enrolled</span>
        </div>
        <p className="mt-2 text-xs font-mono text-slate-500 dark:text-white/50 truncate">
          {courseCodes ? `${courseCodes}${courses.length > 3 ? ', ...' : ''}` : 'No courses enrolled yet'}
        </p>
      </div>

      {/* 3. Weekly Study Time */}
      <div className="rounded-2xl p-5 bg-[#FAF7F2] dark:bg-[#121520] border border-[#E6DFD3] dark:border-white/[0.06] transition-all hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/50 dark:hover:bg-white/[0.07] relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-white/50 uppercase tracking-wider">
            Weekly Study Time
          </span>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#E5A952]/10 text-[#E5A952] border border-[#E5A952]/25 uppercase tracking-wider">
            {totalHoursWeek > 0 ? `${totalHoursWeek.toFixed(1)}h logged` : 'Real-Time'}
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
            {Math.round(totalHoursWeek * 10) / 10}
          </span>
          <span className="text-xs text-slate-500 dark:text-white/50 font-sans">hrs logged</span>
        </div>
        <p className="mt-2 text-xs font-mono text-slate-500 dark:text-white/50">
          {courses.length > 0 ? 'Target: 20 hrs / week' : 'Add courses to track study velocity'}
        </p>
      </div>

      {/* 4. Avg Completion Rate */}
      <div className="rounded-2xl p-5 bg-[#FAF7F2] dark:bg-[#121520] border border-[#E6DFD3] dark:border-white/[0.06] transition-all hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/50 dark:hover:bg-white/[0.07] relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-white/50 uppercase tracking-wider">
            Avg Completion Rate
          </span>
          <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
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
