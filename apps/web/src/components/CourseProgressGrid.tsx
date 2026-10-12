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
    <div className="rounded-3xl p-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl space-y-4 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Course Completion & Progress
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Syllabus completion percentage & study hours
          </p>
        </div>
        <LayoutDashboard className="w-5 h-5 text-cyan-300" />
      </div>

      {/* Course List */}
      <div className="space-y-4 pt-1">
        {progressList.map((course) => {
          return (
            <div key={course.course_id} className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">
                  {course.course_code ? `${course.course_code}: ` : ''}
                  {course.course_name}
                </span>
                <span className="font-mono font-bold text-cyan-300">
                  {course.completed_pct}%
                </span>
              </div>

              {/* Vector Bar */}
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-400 to-indigo-500"
                  style={{ width: `${Math.min(100, Math.max(8, course.completed_pct))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
                <span>
                  {course.completed_tasks} / {course.total_tasks} tasks completed
                </span>
                <span className="text-amber-300 font-semibold">
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
