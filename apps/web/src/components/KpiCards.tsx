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
      <div className="rounded-2xl p-5 bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between text-xs text-[#7A6C5E] dark:text-[#C2B2A1] mb-2">
            <span className="font-semibold text-[11px] uppercase tracking-wider">Pending Tasks</span>
            <div className="w-6 h-6 rounded-lg bg-[#FDA769]/20 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5 text-[#E0712A] dark:text-[#FDA769]" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-semibold tracking-tight text-[#473C33] dark:text-[#FAF8F1] font-mono tabular-nums">
              {pendingCount}
            </span>
            <span className="text-xs text-[#7A6C5E] dark:text-[#C2B2A1]">assignments</span>
          </div>
        </div>
        <div className="pt-3 border-t border-[#E6E0D0] dark:border-[#FEC868]/10 text-xs">
          {highPriorityCount > 0 ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDA769] text-white">
              {highPriorityCount} high priority
            </span>
          ) : (
            <span className="text-[#7A6C5E] dark:text-[#C2B2A1]">No urgent deadlines</span>
          )}
        </div>
      </div>

      {/* 2. Active Courses */}
      <div className="rounded-2xl p-5 bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between text-xs text-[#7A6C5E] dark:text-[#C2B2A1] mb-2">
            <span className="font-semibold text-[11px] uppercase tracking-wider">Active Courses</span>
            <div className="w-6 h-6 rounded-lg bg-[#ABC270]/25 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-[#586738] dark:text-[#ABC270]" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-semibold tracking-tight text-[#473C33] dark:text-[#FAF8F1] font-mono tabular-nums">
              {courses.length}
            </span>
            <span className="text-xs text-[#7A6C5E] dark:text-[#C2B2A1]">enrolled</span>
          </div>
        </div>
        <div className="pt-3 border-t border-[#E6E0D0] dark:border-[#FEC868]/10 text-xs text-[#7A6C5E] dark:text-[#C2B2A1] truncate">
          {courseCodes ? courseCodes : 'No courses registered'}
        </div>
      </div>

      {/* 3. Weekly Study Time */}
      <div className="rounded-2xl p-5 bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between text-xs text-[#7A6C5E] dark:text-[#C2B2A1] mb-2">
            <span className="font-semibold text-[11px] uppercase tracking-wider">Study Time</span>
            <div className="w-6 h-6 rounded-lg bg-[#FEC868]/30 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-[#946218] dark:text-[#FEC868]" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-semibold tracking-tight text-[#473C33] dark:text-[#FAF8F1] font-mono tabular-nums">
              {Math.round(totalHoursWeek * 10) / 10}
            </span>
            <span className="text-xs text-[#7A6C5E] dark:text-[#C2B2A1]">hours this week</span>
          </div>
        </div>
        <div className="pt-3 border-t border-[#E6E0D0] dark:border-[#FEC868]/10 text-xs text-[#7A6C5E] dark:text-[#C2B2A1]">
          Target: 20 hrs / week
        </div>
      </div>

      {/* 4. Avg Completion Rate */}
      <div className="rounded-2xl p-5 bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between text-xs text-[#7A6C5E] dark:text-[#C2B2A1] mb-2">
            <span className="font-semibold text-[11px] uppercase tracking-wider">Syllabus Progress</span>
            <div className="w-6 h-6 rounded-lg bg-[#ABC270]/25 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#586738] dark:text-[#ABC270]" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-semibold tracking-tight text-[#473C33] dark:text-[#FAF8F1] font-mono tabular-nums">
              {avgCompletion}%
            </span>
            <span className="text-xs text-[#7A6C5E] dark:text-[#C2B2A1]">overall completion</span>
          </div>
        </div>
        <div className="pt-3 border-t border-[#E6E0D0] dark:border-[#FEC868]/10 text-xs text-[#7A6C5E] dark:text-[#C2B2A1]">
          Across all syllabus modules
        </div>
      </div>
    </div>
  );
};
