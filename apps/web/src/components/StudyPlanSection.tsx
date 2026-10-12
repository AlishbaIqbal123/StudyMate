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
    <div className="rounded-3xl p-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl space-y-5 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Smart Study Planner</span>
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Dynamic AI Pomodoro & focus schedule
          </p>
        </div>
        <Hourglass className="w-5 h-5 text-cyan-300" />
      </div>

      {/* Duration selector chips */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono text-white/50 uppercase tracking-wider block">
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
                  ? 'bg-gradient-to-b from-[#2B2B2B] to-[#101010] border border-white/30 text-white shadow-md'
                  : 'bg-white/[0.03] text-white/60 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      {/* Focus Course Target Dropdown */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono text-white/50 uppercase tracking-wider block">
          Focus Course Target:
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            handleGenerate();
          }}
          className="w-full bg-[#0c0c14] border border-white/15 text-xs font-mono font-bold text-cyan-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-cyan-400 transition cursor-pointer"
        >
          <option value="" className="bg-[#0c0c14] text-white/60">All Active Courses (Auto-Distribute)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.name} className="bg-[#0c0c14] text-white">
              {c.code ? `${c.code}: ${c.name}` : c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Pomodoro Timer Block */}
      <div className="rounded-2xl p-5 bg-white/[0.02] border border-white/10 text-center space-y-3">
        <div className="flex items-center justify-center space-x-2 text-xs font-mono text-cyan-300 font-semibold uppercase">
          <Clock className="w-3.5 h-3.5" />
          <span>Active Focus Timer</span>
        </div>

        <div className="font-mono text-4xl sm:text-5xl font-black text-white tracking-wider py-1 drop-shadow-[0_0_35px_rgba(6,182,212,0.35)]">
          {formatTimer(secondsRemaining)}
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center justify-center space-x-3 pt-1">
          <button
            onClick={toggleTimer}
            style={{
              background: timerRunning ? 'linear-gradient(to bottom, #d97706, #92400e)' : 'linear-gradient(to bottom, #2B2B2B, #101010)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-white transition-all transform hover:opacity-90 active:scale-95 shadow-lg flex items-center space-x-2 cursor-pointer"
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
            className="p-2.5 rounded-full bg-white/[0.05] border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Plan Schedule Breakdown */}
      {plan && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-mono text-white/50">
            <span>Schedule Breakdown</span>
            <span className="text-cyan-300">{plan.blocks.length} Intervals</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {plan.blocks.map((b, idx) => {
              const isStudy = b.type === 'study';
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2.5 transition ${
                    isStudy
                      ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                      : 'bg-emerald-500/10 border-emerald-500/25'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded-lg font-mono font-bold text-[10px] shrink-0 ${
                        isStudy
                          ? 'bg-cyan-500/15 border border-cyan-400/30 text-cyan-300'
                          : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      {b.duration_minutes}m
                    </span>

                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">
                        {b.description}
                      </div>
                      {b.course_name && (
                        <div className="text-[10px] font-mono text-white/50 truncate">
                          {b.course_name}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 text-white/40">
                    {isStudy ? (
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <Coffee className="w-3.5 h-3.5 text-emerald-400" />
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
