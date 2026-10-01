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
    <div className="rounded-2xl p-6 bg-app-card border border-app-border shadow-sm space-y-4 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-app-border">
        <div>
          <h2 className="font-headline text-lg font-bold text-app-text tracking-tight">
            Course Completion & Progress
          </h2>
          <p className="text-xs text-app-muted mt-0.5">
            Syllabus completion percentage & study hours
          </p>
        </div>
        <LayoutDashboard className="w-5 h-5 text-[#4f91b0]" />
      </div>

      {/* Course List */}
      <div className="space-y-4 pt-1">
        {progressList.map((course) => {
          return (
            <div key={course.course_id} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-headline font-bold text-app-text">
                  {course.course_code ? `${course.course_code}: ` : ''}
                  {course.course_name}
                </span>
                <span className="font-mono font-bold text-[#4f91b0]">
                  {course.completed_pct}%
                </span>
              </div>

              {/* Vector Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-[1px] border border-app-border">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-[#4f91b0]"
                  style={{ width: `${Math.min(100, Math.max(8, course.completed_pct))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-app-muted">
                <span>
                  {course.completed_tasks} / {course.total_tasks} tasks completed
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
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
