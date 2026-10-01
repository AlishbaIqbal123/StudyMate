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
} from 'lucide-react';
import type { Course, CourseProgress, StudyPlan } from '@studymate/types';
import { generateStudyPlan } from '../api.js';
import { usePomodoro, type PomodoroMode } from '../context/PomodoroContext.js';
import { StudyStatsTracker } from '../components/StudyStatsTracker.js';

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
      <div className="p-6 rounded-2xl bg-app-card border border-app-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="font-headline text-2xl font-bold tracking-tight text-app-text">
              Study Planner
            </h1>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#4f91b0]/15 text-[#4f91b0] border border-[#4f91b0]/25">
              Pomodoro Focus
            </span>
          </div>
          <p className="text-xs text-app-muted mt-1">
            Focus sessions with automated rest intervals to maximize learning retention
          </p>
        </div>

        {/* Course Selector & Popout Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-app-muted">Target:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setTargetCourse(e.target.value)}
              className="bg-app-subtle border border-app-border text-xs font-headline font-semibold text-app-text rounded-xl px-3 py-2 focus:outline-none focus:border-[#4f91b0]"
            >
              <option value="">All Pending Courses</option>
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
            className="px-3 py-2 rounded-xl text-xs font-headline font-bold text-app-text bg-app-subtle border border-app-border hover:bg-app-card transition flex items-center space-x-1.5 cursor-pointer"
            title="Show floating widget"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#4f91b0]" />
            <span className="hidden sm:inline">Floating Pop-up</span>
          </button>
        </div>
      </div>

      {focusTitle && (
        <div className="p-3.5 rounded-xl bg-[#4f91b0]/10 border border-[#4f91b0]/20 text-xs text-app-text flex items-center justify-between">
          <span>🎯 Focused Assignment: <strong>{focusTitle}</strong> ({selectedCourse})</span>
          <span className="text-xs font-mono text-[#4f91b0] font-semibold">Auto-targeted</span>
        </div>
      )}

      {/* Main Focus Area: Big Clock + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Big Pomodoro Clock (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-8 rounded-3xl bg-app-card border border-app-border shadow-sm text-center space-y-6">
            {/* Mode Tabs */}
            <div className="inline-flex items-center p-1 rounded-xl bg-app-subtle border border-app-border text-xs font-headline">
              <button
                type="button"
                onClick={() => setMode('focus')}
                className={`px-4 py-1.5 rounded-lg transition font-bold cursor-pointer ${
                  mode === 'focus'
                    ? 'bg-[#4f91b0] text-white shadow-sm'
                    : 'text-app-muted hover:text-app-text'
                }`}
              >
                Deep Focus Session
              </button>
              <button
                type="button"
                onClick={() => setMode('break')}
                className={`px-4 py-1.5 rounded-lg transition font-bold cursor-pointer ${
                  mode === 'break'
                    ? 'bg-[#4f91b0] text-white shadow-sm'
                    : 'text-app-muted hover:text-app-text'
                }`}
              >
                Break Interval
              </button>
            </div>

            {/* Giant Timer Display */}
            <div className="py-4">
              <div className="font-mono text-6xl sm:text-7xl font-black text-app-text tracking-wider">
                {formatTime(secondsRemaining)}
              </div>
              <p className="text-xs font-mono text-app-muted mt-2">
                {mode === 'focus' ? '🎯 Stay in deep focus' : '☕ Relax and recharge'}
              </p>
            </div>

            {/* Play/Pause/Reset Controls */}
            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={toggleTimer}
                className={`px-6 py-3 rounded-2xl font-headline text-sm font-bold text-white transition flex items-center space-x-2 shadow-md cursor-pointer ${
                  timerRunning
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                    : 'bg-[#4f91b0] hover:bg-[#3f748d] shadow-[#4f91b0]/25'
                }`}
              >
                {timerRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause Timer</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Session</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetTimer}
                className="p-3 rounded-2xl bg-app-subtle hover:bg-app-border text-app-muted hover:text-app-text border border-app-border transition cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Duration Presets */}
            <div className="pt-4 border-t border-app-border">
              <span className="text-[11px] font-mono text-app-muted block mb-2">
                Change Session Duration:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[30, 45, 60, 90, 120].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDuration(dur)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                      totalDuration === dur
                        ? 'bg-[#4f91b0] text-white shadow-sm'
                        : 'bg-app-subtle text-app-muted hover:text-app-text border border-app-border'
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>

            {/* Notification permission prompt if not enabled */}
            {!notificationsEnabled && 'Notification' in window && Notification.permission !== 'granted' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={requestNotificationPermission}
                  className="text-xs font-semibold text-[#4f91b0] hover:underline flex items-center justify-center space-x-1.5 mx-auto cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notify me when timer ends in background</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Generated Schedule Blocks (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-app-card border border-app-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app-border">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#4f91b0]" />
                <h3 className="font-headline text-sm font-bold text-app-text">
                  AI Study Schedule
                </h3>
              </div>
              <span className="font-mono text-[10px] text-app-muted">
                {plan ? `${plan.blocks.length} Intervals` : 'Generating...'}
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-app-muted font-mono">
                Calculating study timetable...
              </div>
            ) : plan ? (
              <div className="space-y-3">
                <p className="text-xs text-app-text bg-app-subtle p-3 rounded-xl border border-app-border">
                  {plan.summary}
                </p>

                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {plan.blocks.map((block, i) => {
                    const isStudy = block.type === 'study';
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                          isStudy
                            ? 'bg-app-card border-app-border text-app-text'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span
                            className={`px-2 py-0.5 rounded-lg font-mono font-bold text-[10px] shrink-0 ${
                              isStudy
                                ? 'bg-[#4f91b0]/15 text-[#4f91b0]'
                                : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {block.duration_minutes}m
                          </span>
                          <span className="font-headline font-semibold truncate">
                            {block.description}
                          </span>
                        </div>

                        <span className="shrink-0 text-app-muted">
                          {isStudy ? <BookOpen className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-app-muted font-mono">
                Calculating study timetable...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Comprehensive Daily/Weekly/Monthly Study Time Tracker */}
      <StudyStatsTracker courses={courses} />
    </div>
  );
};
