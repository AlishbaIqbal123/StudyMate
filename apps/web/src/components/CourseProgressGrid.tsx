import React from 'react';
import { LayoutDashboard, BookOpen } from 'lucide-react';
import type { CourseProgress } from '@studymate/types';

interface CourseProgressGridProps {
  progressList: CourseProgress[];
}

export const CourseProgressGrid: React.FC<CourseProgressGridProps> = ({
  progressList,
}) => {
  return (
    <div className="rounded-3xl p-6 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl space-y-4 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Course Completion & Progress
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
            Syllabus completion percentage & study hours
          </p>
        </div>
        <LayoutDashboard className="w-5 h-5 text-blue-600 dark:text-cyan-300" />
      </div>

      {/* Course List */}
      <div className="space-y-4 pt-1">
        {progressList.map((course) => {
          return (
            <div key={course.course_id} className="space-y-2 p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">
                  {course.course_code ? `${course.course_code}: ` : ''}
                  {course.course_name}
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-cyan-300">
                  {course.completed_pct}%
                </span>
              </div>

              {/* Vector Bar */}
              <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-500"
                  style={{ width: `${Math.min(100, Math.max(8, course.completed_pct))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-white/50">
                <span>
                  {course.completed_tasks} / {course.total_tasks} tasks completed
                </span>
                <span className="text-amber-600 dark:text-amber-300 font-semibold">
                  {course.hours_this_week}h logged this week
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
