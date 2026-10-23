import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  BookOpen,
  ExternalLink,
  Bell,
  Target,
} from 'lucide-react';
import type { Course, CourseProgress, StudyPlan } from '@studymate/types';
import { generateStudyPlan } from '../api.js';
import { usePomodoro } from '../context/PomodoroContext.js';
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
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl p-6 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Study Planner & Focus Timer
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
              Pomodoro
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Calibrate deep focus intervals with structured breaks to manage academic fatigue.
          </p>
        </div>

        {/* Course Selector & Popout Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
            <span>Course:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setTargetCourse(e.target.value)}
              className="bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-400"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.code ? `${c.code}: ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setFloatingWidgetOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 transition flex items-center gap-1.5 cursor-pointer"
            title="Pop out mini floating timer"
          >
            <span>Mini Clock</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {focusTitle && (
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#141926] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-500" />
            Target Task: <strong className="font-semibold text-slate-900 dark:text-white">{focusTitle}</strong> ({selectedCourse})
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
            Active Sprint
          </span>
        </div>
      )}

      {/* Main Focus Area: Big Clock + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Big Pomodoro Clock (7 cols) */}
        <div className="lg:col-span-7 rounded-xl p-6 sm:p-8 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] text-center space-y-6">
          {/* Mode Tabs */}
          <div className="inline-flex items-center p-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setMode('focus')}
              className={`px-4 py-1.5 rounded-md transition font-medium cursor-pointer ${
                mode === 'focus'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Focus Session
            </button>
            <button
              type="button"
              onClick={() => setMode('break')}
              className={`px-4 py-1.5 rounded-md transition font-medium cursor-pointer ${
                mode === 'break'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Break Interval
            </button>
          </div>

          {/* Giant Timer Display */}
          <div className="py-2">
            <div className="font-mono text-6xl sm:text-7xl font-light text-slate-900 dark:text-white tracking-widest tabular-nums">
              {formatTime(secondsRemaining)}
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-wider">
              {mode === 'focus' ? 'Deep Focus Interval' : 'Rest & Recovery'}
            </p>
          </div>

          {/* Play/Pause/Reset Controls */}
          <div className="flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={toggleTimer}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
            >
              {timerRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Start Sprint</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetTimer}
              className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-slate-300 dark:hover:text-white dark:border-white/10 transition cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Duration Presets */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06]">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-2 font-mono uppercase tracking-wider">
              Preset Durations
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {[25, 45, 60, 90].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDuration(dur)}
                  className={`px-3 py-1 rounded-md font-mono text-xs font-medium transition cursor-pointer ${
                    totalDuration === dur
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-white/10'
                  }`}
                >
                  {dur}m
                </button>
              ))}
            </div>
          </div>

          {/* Notification permission prompt if not enabled */}
          {!notificationsEnabled && 'Notification' in window && Notification.permission !== 'granted' && (
            <div className="pt-1">
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:underline flex items-center justify-center space-x-1.5 mx-auto cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notify me when timer ends</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Generated Schedule Blocks (5 cols) */}
        <div className="lg:col-span-5 rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Study Timetable
              </h3>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              {plan ? `${plan.blocks.length} Blocks` : 'Loading...'}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-mono">
              Calculating intervals...
            </div>
          ) : plan ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] p-3 rounded-lg border border-slate-200/80 dark:border-white/[0.06] leading-relaxed">
                {plan.summary}
              </p>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {plan.blocks.map((block, i) => {
                  const isStudy = block.type === 'study';
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                        isStudy
                          ? 'bg-slate-50 border-slate-200/80 text-slate-900 dark:bg-white/[0.03] dark:border-white/[0.06] dark:text-white'
                          : 'bg-emerald-50/50 border-emerald-200/60 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-medium text-[10px] shrink-0 ${
                            isStudy
                              ? 'bg-slate-200 text-slate-800 dark:bg-white/10 dark:text-slate-200'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                          }`}
                        >
                          {block.duration_minutes}m
                        </span>
                        <span className="font-medium truncate">
                          {block.description}
                        </span>
                      </div>

                      <span className="shrink-0 text-slate-400">
                        {isStudy ? <BookOpen className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 font-mono">
              Ready to generate timetable.
            </div>
          )}
        </div>
      </div>

      {/* 2. Comprehensive Study Time Tracker */}
      <AuthGate
        title="Study History & Analytics"
        description="Sign in or create a student account to track focus streaks, view logged sessions, and sync study velocity across devices."
        feature="Focus Analytics"
      >
        <StudyStatsTracker courses={courses} />
      </AuthGate>
    </div>
  );
};
