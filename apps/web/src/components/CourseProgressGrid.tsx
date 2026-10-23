import React from 'react';
import { BookOpen } from 'lucide-react';
import type { CourseProgress } from '@studymate/types';

interface CourseProgressGridProps {
  progressList: CourseProgress[];
}

export const CourseProgressGrid: React.FC<CourseProgressGridProps> = ({
  progressList,
}) => {
  return (
    <div className="rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
            Course Completion
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Syllabus completion and logged focus hours
          </p>
        </div>
        <BookOpen className="w-4 h-4 text-slate-400" />
      </div>

      {/* Course List */}
      <div className="space-y-3">
        {progressList.map((course) => {
          return (
            <div
              key={course.course_id}
              className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-900 dark:text-white">
                  {course.course_code ? `${course.course_code}: ` : ''}
                  {course.course_name}
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {course.completed_pct}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-slate-900 dark:bg-white"
                  style={{ width: `${Math.min(100, Math.max(4, course.completed_pct))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>
                  {course.completed_tasks} of {course.total_tasks} completed
                </span>
                <span>
                  {course.hours_this_week}h this week
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
