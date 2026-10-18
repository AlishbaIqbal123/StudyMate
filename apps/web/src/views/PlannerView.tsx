import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Coffee,
  BookOpen,
  ExternalLink,
  Bell,
  CheckCircle2,
  Target,
} from 'lucide-react';
import type { Course, CourseProgress, StudyPlan } from '@studymate/types';
import { generateStudyPlan } from '../api.js';
import { usePomodoro, type PomodoroMode } from '../context/PomodoroContext.js';
import { StudyStatsTracker } from '../components/StudyStatsTracker.js';
import { AuthGate } from '../components/AuthGate.js';

interface PlannerViewProps {
  courses: Course[];
  progressList: CourseProgress[];
  focusCourse?: string;
  focusTitle?: string;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  courses,
  progressList,
  focusCourse,
  focusTitle,
}) => {
  const {
    timerRunning,
    secondsRemaining,
    totalDuration,
    selectedCourse,
    mode,
    toggleTimer,
    resetTimer,
    setDuration,
    setMode,
    setTargetCourse,
    setTargetTitle,
    setFloatingWidgetOpen,
    formatTime,
    requestNotificationPermission,
    notificationsEnabled,
  } = usePomodoro();

  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (focusCourse) {
      setTargetCourse(focusCourse);
    }
    if (focusTitle) {
      setTargetTitle(focusTitle);
    }
  }, [focusCourse, focusTitle, setTargetCourse, setTargetTitle]);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      setTargetCourse(courses[0].name);
    }
  }, [courses, selectedCourse, setTargetCourse]);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const result = await generateStudyPlan(totalDuration, selectedCourse || undefined);
      setPlan(result);
    } catch (err) {
      console.error('Error generating plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGeneratePlan();
  }, [selectedCourse, totalDuration]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121520] border border-white/[0.08] text-[#F5EFE6] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl">
        {/* Warm ambient tungsten glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#E5A952]/[0.08] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <h1 className="font-serif text-2xl font-medium tracking-tight text-[#F5EFE6]">
              Deep Work Desk
            </h1>
            <span className="font-sans text-xs font-semibold px-3 py-0.5 rounded-full bg-white/10 text-[#E5A952] border border-white/15 uppercase tracking-wider">
              Pomodoro Focus
            </span>
          </div>
          <p className="text-xs text-[#C8BFB2] mt-1 max-w-xl">
            Timed study sprints with calibrated recovery intervals to cultivate cognitive stamina and deep flow.
          </p>
        </div>

        {/* Course Selector & Popout Button */}
        <div className="flex items-center space-x-3 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-sans text-[#C8BFB2]">Target:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setTargetCourse(e.target.value)}
              className="bg-white/10 border border-white/15 text-xs text-[#F5EFE6] rounded-xl px-3 py-2 focus:outline-none focus:border-[#E5A952]"
            >
              <option value="" className="bg-[#0B0D13] text-[#F5EFE6]">All Pending Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.name} className="bg-[#0B0D13] text-[#F5EFE6]">
                  {c.code ? `${c.code}: ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setFloatingWidgetOpen(true)}
            className="pl-4 pr-1.5 py-1.5 rounded-full text-xs font-semibold text-[#0E1117] bg-[#F5EFE6] hover:bg-white active:scale-[0.98] transition flex items-center gap-2 cursor-pointer shadow-sm group"
            title="Show floating widget"
          >
            <span>Mini Clock</span>
            <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ExternalLink className="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>

      {focusTitle && (
        <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#121520] border border-[#E6DFD3] dark:border-white/[0.08] text-xs text-stone-900 dark:text-[#F5EFE6] flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#E5A952]" />
            Focused Assignment: <strong className="text-stone-900 dark:text-[#F5EFE6]">{focusTitle}</strong> ({selectedCourse})
          </span>
          <span className="text-xs font-sans text-[#B87D28] bg-[#E5A952]/15 border border-[#E5A952]/30 dark:text-[#E5A952] font-semibold px-2.5 py-0.5 rounded-full">
            Auto-targeted
          </span>
        </div>
      )}

      {/* Main Focus Area: Big Clock + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Big Pomodoro Clock (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-1.5 rounded-[2.2rem] bg-stone-200/50 dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08]">
            <div className="rounded-[1.8rem] p-8 sm:p-10 bg-white dark:bg-[#0B0D13] border border-stone-200/80 dark:border-white/[0.06] shadow-sm text-center space-y-8 relative overflow-hidden">
              {/* Ambient subtle warm glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#E5A952]/[0.05] rounded-full blur-3xl pointer-events-none" />

              {/* Mode Tabs */}
              <div className="inline-flex items-center p-1 rounded-full bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 text-xs relative z-10">
                <button
                  type="button"
                  onClick={() => setMode('focus')}
                  className={`px-5 py-2 rounded-full transition font-semibold cursor-pointer ${
                    mode === 'focus'
                      ? 'bg-[#F5EFE6] text-[#0E1117] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 dark:text-[#C8BFB2] dark:hover:text-white'
                  }`}
                >
                  Deep Focus Session
                </button>
                <button
                  type="button"
                  onClick={() => setMode('break')}
                  className={`px-5 py-2 rounded-full transition font-semibold cursor-pointer ${
                    mode === 'break'
                      ? 'bg-[#F5EFE6] text-[#0E1117] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 dark:text-[#C8BFB2] dark:hover:text-white'
                  }`}
                >
                  Break Interval
                </button>
              </div>

              {/* Giant Timer Display */}
              <div className="py-4 relative z-10">
                <div className="font-mono text-6xl sm:text-7xl font-light text-stone-900 dark:text-[#F5EFE6] tracking-widest">
                  {formatTime(secondsRemaining)}
                </div>
                <p className="text-xs font-sans text-stone-500 dark:text-[#C8BFB2] mt-3 tracking-wide uppercase">
                  {mode === 'focus' ? 'Deep Work Focus • Distractions Silenced' : 'Calm Recovery • Rest Interval'}
                </p>
              </div>

              {/* Play/Pause/Reset Controls with Button-in-Button Haptics */}
              <div className="flex items-center justify-center space-x-4 relative z-10">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="pl-7 pr-2 py-2.5 rounded-full text-sm font-semibold text-[#0E1117] bg-[#F5EFE6] hover:bg-white active:scale-[0.98] transition flex items-center gap-3 cursor-pointer shadow-sm group"
                >
                  <span>{timerRunning ? 'Pause Session' : 'Start Session'}</span>
                  <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {timerRunning ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  className="p-3.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 border border-stone-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] dark:text-[#C8BFB2] dark:hover:text-white dark:border-white/10 transition cursor-pointer"
                  title="Reset timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Duration Presets */}
              <div className="pt-6 border-t border-stone-200/80 dark:border-white/10 relative z-10">
                <span className="text-[11px] font-sans text-stone-500 dark:text-[#C8BFB2] block mb-3">
                  Quick Preset Durations:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[30, 45, 60, 90, 120].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDuration(dur)}
                      className={`px-4 py-1.5 rounded-full font-mono text-xs font-semibold transition cursor-pointer ${
                        totalDuration === dur
                          ? 'bg-[#E5A952]/15 text-[#B87D28] dark:text-[#E5A952] border border-[#E5A952]/30 shadow-sm'
                          : 'bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200 dark:bg-white/[0.04] dark:text-[#C8BFB2] dark:hover:text-white dark:border-white/10'
                      }`}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification permission prompt if not enabled */}
              {!notificationsEnabled && 'Notification' in window && Notification.permission !== 'granted' && (
                <div className="pt-2 relative z-10">
                  <button
                    type="button"
                    onClick={requestNotificationPermission}
                    className="text-xs font-semibold text-[#B87D28] dark:text-[#E5A952] hover:underline flex items-center justify-center space-x-1.5 mx-auto cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Notify me when session ends</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Generated Schedule Blocks (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-1.5 rounded-[2.2rem] bg-stone-200/50 dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08]">
            <div className="rounded-[1.8rem] p-6 sm:p-7 bg-white dark:bg-[#0B0D13] border border-stone-200/80 dark:border-white/[0.06] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-white/10">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#E5A952]" />
                  <h3 className="text-sm font-serif font-medium text-stone-900 dark:text-[#F5EFE6]">
                    AI Study Schedule
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-stone-500 dark:text-[#C8BFB2]">
                  {plan ? `${plan.blocks.length} Intervals` : 'Generating...'}
                </span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-stone-400 dark:text-[#C8BFB2] font-mono">
                  Calculating study timetable...
                </div>
              ) : plan ? (
                <div className="space-y-3">
                  <p className="text-xs text-stone-700 dark:text-[#C8BFB2] bg-stone-50 dark:bg-white/[0.03] p-3.5 rounded-2xl border border-stone-200/80 dark:border-white/10 leading-relaxed">
                    {plan.summary}
                  </p>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {plan.blocks.map((block, i) => {
                      const isStudy = block.type === 'study';
                      return (
                        <div
                          key={i}
                          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 transition ${
                            isStudy
                              ? 'bg-stone-50 hover:bg-stone-100/80 border-stone-200/80 text-stone-900 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:border-white/10 dark:text-[#F5EFE6]'
                              : 'bg-[#4E7A68]/10 border-[#4E7A68]/20 text-[#4E7A68] dark:bg-[#4E7A68]/10 dark:border-[#4E7A68]/25 dark:text-[#4E7A68]'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] shrink-0 ${
                                isStudy
                                  ? 'bg-[#E5A952]/15 text-[#B87D28] border border-[#E5A952]/30 dark:text-[#E5A952]'
                                  : 'bg-[#4E7A68]/15 text-[#4E7A68] border border-[#4E7A68]/30'
                              }`}
                            >
                              {block.duration_minutes}m
                            </span>
                            <span className="font-semibold truncate">
                              {block.description}
                            </span>
                          </div>

                          <span className="shrink-0 text-stone-400 dark:text-[#C8BFB2]">
                            {isStudy ? <BookOpen className="w-3.5 h-3.5 text-[#E5A952]" /> : <Coffee className="w-3.5 h-3.5 text-[#4E7A68]" />}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-stone-400 dark:text-[#C8BFB2] font-mono">
                  Calculating study timetable...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Comprehensive Daily/Weekly/Monthly Study Time Tracker */}
      <AuthGate
        title="Study Analytics & History Locked"
        description="Sign in or create a free account to track your study sessions, view interactive velocity graphs, and calculate study streaks across devices."
        feature="Focus Analytics"
      >
        <StudyStatsTracker courses={courses} />
      </AuthGate>
    </div>
  );
};
