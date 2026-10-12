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
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent backdrop-blur-2xl border border-white/15 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Study Planner
            </h1>
            <span className="font-mono text-xs font-semibold px-3 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase tracking-wider">
              Pomodoro Focus
            </span>
          </div>
          <p className="text-xs text-white/60 mt-1 max-w-xl">
            Focus sessions with automated rest intervals to maximize learning retention and flow state.
          </p>
        </div>

        {/* Course Selector & Popout Button */}
        <div className="flex items-center space-x-3 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-white/50">Target:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setTargetCourse(e.target.value)}
              className="bg-white/[0.06] border border-white/15 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
            >
              <option value="" className="bg-[#0c0c12] text-white">All Pending Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.name} className="bg-[#0c0c12] text-white">
                  {c.code ? `${c.code}: ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setFloatingWidgetOpen(true)}
            className="px-3.5 py-2 rounded-full text-xs font-semibold text-white/80 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:text-white transition flex items-center space-x-1.5 cursor-pointer"
            title="Show floating widget"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Floating Pop-up</span>
          </button>
        </div>
      </div>

      {focusTitle && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-xs text-white flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            Focused Assignment: <strong className="text-white">{focusTitle}</strong> ({selectedCourse})
          </span>
          <span className="text-xs font-mono text-cyan-300 font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30">
            Auto-targeted
          </span>
        </div>
      )}

      {/* Main Focus Area: Big Clock + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Big Pomodoro Clock (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-8 sm:p-10 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl text-center space-y-8 relative overflow-hidden">
            {/* Ambient subtle glow orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Mode Tabs */}
            <div className="inline-flex items-center p-1 rounded-full bg-white/[0.04] border border-white/10 text-xs relative z-10">
              <button
                type="button"
                onClick={() => setMode('focus')}
                className={`px-5 py-2 rounded-full transition font-semibold cursor-pointer ${
                  mode === 'focus'
                    ? 'bg-white/15 text-white shadow-md border border-white/20'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Deep Focus Session
              </button>
              <button
                type="button"
                onClick={() => setMode('break')}
                className={`px-5 py-2 rounded-full transition font-semibold cursor-pointer ${
                  mode === 'break'
                    ? 'bg-white/15 text-white shadow-md border border-white/20'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Break Interval
              </button>
            </div>

            {/* Giant Timer Display */}
            <div className="py-4 relative z-10">
              <div className="font-mono text-6xl sm:text-7xl font-bold text-white tracking-widest drop-shadow-[0_0_35px_rgba(6,182,212,0.35)]">
                {formatTime(secondsRemaining)}
              </div>
              <p className="text-xs font-mono text-white/50 mt-3 tracking-wide">
                {mode === 'focus' ? 'STAY IN DEEP FOCUS • DISTRACTIONS MUTED' : 'RELAX & RECHARGE • REST INTERVAL'}
              </p>
            </div>

            {/* Play/Pause/Reset Controls */}
            <div className="flex items-center justify-center space-x-4 relative z-10">
              <button
                type="button"
                onClick={toggleTimer}
                className={`px-8 py-3.5 rounded-full text-sm font-semibold text-white transition flex items-center space-x-2 shadow-2xl active:scale-95 cursor-pointer ${
                  timerRunning
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                    : 'hover:opacity-90 border border-white/20'
                }`}
                style={!timerRunning ? { background: 'linear-gradient(to bottom, #2B2B2B, #101010)' } : undefined}
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
                className="p-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/60 hover:text-white border border-white/10 transition cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Duration Presets */}
            <div className="pt-6 border-t border-white/10 relative z-10">
              <span className="text-[11px] font-mono text-white/50 block mb-3">
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
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] border border-white/10'
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
                  className="text-xs font-semibold text-cyan-300 hover:underline flex items-center justify-center space-x-1.5 mx-auto cursor-pointer"
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
          <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <h3 className="text-sm font-bold text-white">
                  AI Study Schedule
                </h3>
              </div>
              <span className="font-mono text-[10px] text-white/50">
                {plan ? `${plan.blocks.length} Intervals` : 'Generating...'}
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-white/40 font-mono">
                Calculating study timetable...
              </div>
            ) : plan ? (
              <div className="space-y-3">
                <p className="text-xs text-white/80 bg-white/[0.04] p-3.5 rounded-2xl border border-white/10 leading-relaxed">
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
                            ? 'bg-white/[0.04] hover:bg-white/[0.07] border-white/10 text-white'
                            : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] shrink-0 ${
                              isStudy
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {block.duration_minutes}m
                          </span>
                          <span className="font-semibold truncate">
                            {block.description}
                          </span>
                        </div>

                        <span className="shrink-0 text-white/40">
                          {isStudy ? <BookOpen className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5 text-emerald-400" />}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-white/40 font-mono">
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
