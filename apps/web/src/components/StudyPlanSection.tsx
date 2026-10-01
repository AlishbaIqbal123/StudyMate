import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Sparkles, BookOpen, Coffee, Hourglass } from 'lucide-react';
import type { Course, StudyPlan } from '@studymate/types';
import { generateStudyPlan } from '../api.js';

interface StudyPlanSectionProps {
  courses: Course[];
  prefilledCourse?: string;
  prefilledTitle?: string;
}

export const StudyPlanSection: React.FC<StudyPlanSectionProps> = ({
  courses,
  prefilledCourse,
  prefilledTitle,
}) => {
  const [minutes, setMinutes] = useState(60);
  const [selectedCourse, setSelectedCourse] = useState(prefilledCourse || '');
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);

  // Timer states
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60 * 60);

  useEffect(() => {
    if (prefilledCourse) {
      setSelectedCourse(prefilledCourse);
    }
  }, [prefilledCourse]);

  const handleGenerate = async (mins = minutes) => {
    setLoading(true);
    try {
      const res = await generateStudyPlan(
        mins,
        selectedCourse || undefined,
        prefilledTitle ? [prefilledTitle] : undefined
      );
      setPlan(res);
      setSecondsRemaining(mins * 60);
      setTimerRunning(false);
    } catch (err) {
      console.error('Failed to generate study plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerate(60);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, secondsRemaining]);

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setSecondsRemaining(minutes * 60);
  };

  const formatTimer = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-2xl p-6 bg-app-card border border-app-border shadow-sm space-y-4 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-app-border">
        <div>
          <h2 className="font-headline text-lg font-bold text-app-text tracking-tight flex items-center space-x-2">
            <span>Smart Study Planner</span>
          </h2>
          <p className="text-xs text-app-muted mt-0.5">
            Dynamic AI Pomodoro & focus schedule
          </p>
        </div>
        <Hourglass className="w-5 h-5 text-[#4f91b0]" />
      </div>

      {/* Duration selector chips */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono text-app-muted uppercase tracking-wider block">
          Select Duration:
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {[30, 45, 60, 90, 120].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMinutes(m);
                handleGenerate(m);
              }}
              className={`py-1.5 rounded-xl font-mono text-xs font-bold transition text-center cursor-pointer ${
                minutes === m
                  ? 'bg-[#4f91b0] text-white shadow-sm'
                  : 'bg-app-subtle text-app-muted hover:text-slate-900 dark:hover:text-white border border-app-border'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      {/* Focus Course Target Dropdown */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono text-app-muted uppercase tracking-wider block">
          Focus Course Target:
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            handleGenerate();
          }}
          className="w-full bg-app-subtle border border-app-border text-xs font-mono font-bold text-[#4f91b0] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 transition"
        >
          <option value="">All Active Courses (Auto-Distribute)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.name}>
              {c.code ? `${c.code}: ${c.name}` : c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Pomodoro Timer Block */}
      <div className="rounded-2xl p-5 bg-app-subtle/50 border border-app-border text-center space-y-3">
        <div className="flex items-center justify-center space-x-2 text-xs font-mono text-[#4f91b0] font-semibold uppercase">
          <Clock className="w-3.5 h-3.5" />
          <span>Active Focus Timer</span>
        </div>

        <div className="font-mono text-4xl sm:text-5xl font-black text-app-text tracking-wider py-1">
          {formatTimer(secondsRemaining)}
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center justify-center space-x-3 pt-1">
          <button
            onClick={toggleTimer}
            className={`px-5 py-2 rounded-xl text-xs font-headline font-bold text-white transition flex items-center space-x-1.5 shadow-md cursor-pointer ${
              timerRunning
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/25'
                : 'bg-[#4f91b0] hover:bg-[#3f748d] shadow-indigo-600/25'
            }`}
          >
            {timerRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Session</span>
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="p-2 rounded-xl bg-app-card border border-app-border text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 transition cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Plan Schedule Breakdown */}
      {plan && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-mono text-app-muted">
            <span>Schedule Breakdown</span>
            <span>{plan.blocks.length} Intervals</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {plan.blocks.map((b, idx) => {
              const isStudy = b.type === 'study';
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2.5 ${
                    isStudy
                      ? 'bg-white dark:bg-[#1e293b]/70 border-app-border'
                      : 'bg-emerald-50/60 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded-lg font-mono font-bold text-[10px] shrink-0 ${
                        isStudy
                          ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                          : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {b.duration_minutes}m
                    </span>

                    <div className="min-w-0">
                      <div className="font-headline font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {b.description}
                      </div>
                      {b.course_name && (
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          {b.course_name}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 text-slate-400">
                    {isStudy ? (
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    ) : (
                      <Coffee className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
