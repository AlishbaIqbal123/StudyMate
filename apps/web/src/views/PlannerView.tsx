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
      {/* Top Banner (Sage Green Palette 18 Header) */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-[#839758] to-[#ABC270] text-white border border-[#839758]/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Study Planner & Focus Timer
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-black/20 text-white border border-white/20">
              Pomodoro
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/90 mt-1">
            Calibrate deep focus intervals with structured breaks to manage academic fatigue.
          </p>
        </div>

        {/* Course Selector & Popout Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-2 text-xs text-white/90">
            <span>Course:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setTargetCourse(e.target.value)}
              className="bg-white/95 dark:bg-[#2E2620] border border-white/30 text-xs text-[#473C33] dark:text-[#FAF8F1] rounded-xl px-2.5 py-1.5 focus:outline-none shadow-xs"
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
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#473C33] bg-[#FEC868] hover:bg-[#FFD482] transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Pop out mini floating timer"
          >
            <span>Mini Clock</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {focusTitle && (
        <div className="p-3.5 rounded-2xl bg-[#FEC868]/25 dark:bg-[#393028] border border-[#FEC868]/40 text-xs text-[#473C33] dark:text-[#FAF8F1] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#946218] dark:text-[#FEC868]" />
            Target Task: <strong className="font-semibold text-[#473C33] dark:text-[#FAF8F1]">{focusTitle}</strong> ({selectedCourse})
          </span>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FDA769] text-white">
            Active Sprint
          </span>
        </div>
      )}

      {/* Main Focus Area: Big Clock + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Big Pomodoro Clock (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl p-6 sm:p-8 bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 text-center space-y-6 shadow-xs">
          {/* Mode Tabs */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[#F5F2E8] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 text-xs">
            <button
              type="button"
              onClick={() => setMode('focus')}
              className={`px-4 py-1.5 rounded-lg transition font-semibold cursor-pointer ${
                mode === 'focus'
                  ? 'bg-[#ABC270] text-white shadow-xs'
                  : 'text-[#63574B] hover:text-[#473C33] dark:text-[#C2B2A1] dark:hover:text-white'
              }`}
            >
              Focus Session
            </button>
            <button
              type="button"
              onClick={() => setMode('break')}
              className={`px-4 py-1.5 rounded-lg transition font-semibold cursor-pointer ${
                mode === 'break'
                  ? 'bg-[#FDA769] text-white shadow-xs'
                  : 'text-[#63574B] hover:text-[#473C33] dark:text-[#C2B2A1] dark:hover:text-white'
              }`}
            >
              Break Interval
            </button>
          </div>

          {/* Giant Timer Display */}
          <div className="py-2">
            <div className="font-mono text-6xl sm:text-7xl font-light text-[#473C33] dark:text-[#FAF8F1] tracking-widest tabular-nums">
              {formatTime(secondsRemaining)}
            </div>
            <p className="text-xs font-mono text-[#7A6C5E] dark:text-[#C2B2A1] mt-2 uppercase tracking-wider">
              {mode === 'focus' ? 'Deep Focus Interval' : 'Rest & Recovery'}
            </p>
          </div>

          {/* Play/Pause/Reset Controls */}
          <div className="flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={toggleTimer}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] transition flex items-center gap-2 cursor-pointer active:scale-95 shadow-md"
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
              className="p-2.5 rounded-xl bg-[#F5F2E8] hover:bg-[#EAE5D5] text-[#63574B] hover:text-[#473C33] border border-[#E6E0D0] dark:bg-[#393028] dark:hover:bg-[#473C33] dark:text-[#C2B2A1] dark:hover:text-white dark:border-[#FEC868]/15 transition cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Duration Presets */}
          <div className="pt-4 border-t border-[#E6E0D0] dark:border-[#FEC868]/10">
            <span className="text-[11px] text-[#87796B] dark:text-[#A3907E] block mb-2 font-mono uppercase tracking-wider">
              Preset Durations
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {[25, 45, 60, 90].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDuration(dur)}
                  className={`px-3.5 py-1 rounded-full font-mono text-xs font-semibold transition cursor-pointer ${
                    totalDuration === dur
                      ? 'bg-[#ABC270] text-white shadow-2xs'
                      : 'bg-[#FAF8F1] text-[#63574B] hover:text-[#473C33] dark:bg-[#393028] dark:text-[#C2B2A1] dark:hover:text-white border border-[#E6E0D0] dark:border-[#FEC868]/15'
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
                className="text-xs text-[#63574B] hover:text-[#473C33] dark:text-[#C2B2A1] dark:hover:text-white hover:underline flex items-center justify-center space-x-1.5 mx-auto cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-[#FDA769]" />
                <span>Notify me when timer ends</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Generated Schedule Blocks (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl p-5 bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E0D0] dark:border-[#FEC868]/15">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#839758] dark:text-[#ABC270]" />
              <h3 className="text-sm font-semibold text-[#473C33] dark:text-[#FAF8F1]">
                Study Timetable
              </h3>
            </div>
            <span className="font-mono text-[11px] text-[#87796B]">
              {plan ? `${plan.blocks.length} Blocks` : 'Loading...'}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#87796B] font-mono">
              Calculating intervals...
            </div>
          ) : plan ? (
            <div className="space-y-3">
              <p className="text-xs text-[#63574B] dark:text-[#E0D6C8] bg-[#FAF8F1] dark:bg-[#393028] p-3 rounded-xl border border-[#E6E0D0] dark:border-[#FEC868]/15 leading-relaxed">
                {plan.summary}
              </p>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {plan.blocks.map((block, i) => {
                  const isStudy = block.type === 'study';
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                        isStudy
                          ? 'bg-[#FAF8F1] border-[#E6E0D0] text-[#473C33] dark:bg-[#393028] dark:border-[#FEC868]/15 dark:text-[#FAF8F1]'
                          : 'bg-[#ABC270]/15 border-[#ABC270]/35 text-[#45512C] dark:bg-[#ABC270]/15 dark:border-[#ABC270]/30 dark:text-[#ABC270]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] shrink-0 ${
                            isStudy
                              ? 'bg-[#FEC868] text-[#473C33]'
                              : 'bg-[#ABC270] text-white'
                          }`}
                        >
                          {block.duration_minutes}m
                        </span>
                        <span className="font-medium truncate">
                          {block.description}
                        </span>
                      </div>

                      <span className="shrink-0 text-[#87796B]">
                        {isStudy ? <BookOpen className="w-3.5 h-3.5 text-[#FDA769]" /> : <Coffee className="w-3.5 h-3.5 text-[#839758]" />}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#87796B] font-mono">
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
