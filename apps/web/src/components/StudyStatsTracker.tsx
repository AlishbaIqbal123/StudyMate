import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Flame,
  BarChart3,
  TrendingUp,
  BookOpen,
  Plus,
  RefreshCw,
  CheckCircle2,
  Award,
} from 'lucide-react';
import type { StudyStats, Course } from '@studymate/types';
import { fetchStudyStats, logStudySession } from '../api.js';

interface StudyStatsTrackerProps {
  courses: Course[];
  onSessionLogged?: () => void;
}

export const StudyStatsTracker: React.FC<StudyStatsTrackerProps> = ({
  courses,
  onSessionLogged,
}) => {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeHorizon, setTimeHorizon] = useState<'day' | 'week' | 'month'>('week');
  const [showLogModal, setShowLogModal] = useState(false);

  // Quick Log form states
  const [logCourse, setLogCourse] = useState(courses[0]?.name || 'CS 420: Distributed Systems');
  const [logMinutes, setLogMinutes] = useState(45);
  const [logNotes, setLogNotes] = useState('Pomodoro deep focus session');
  const [submitting, setSubmitting] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await fetchStudyStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching study stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (logMinutes <= 0 || submitting) return;
    setSubmitting(true);
    try {
      await logStudySession({
        course_name: logCourse,
        duration_minutes: logMinutes,
        notes: logNotes,
      });
      setShowLogModal(false);
      await loadStats();
      if (onSessionLogged) onSessionLogged();
    } catch (err) {
      console.error('Failed to log study session:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatHoursMins = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`.trim();
    return `${mins}m`;
  };

  const maxDailyMinutes = stats?.dailyBreakdown
    ? Math.max(...stats.dailyBreakdown.map((d) => d.minutes), 60)
    : 60;

  return (
    <div className="rounded-3xl p-6 bg-app-card border border-app-border shadow-sm space-y-6">
      {/* Header with Horizon Switcher & Log Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-app-border">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4f91b0]/15 text-[#4f91b0] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-headline text-base font-bold text-app-text">
                Focus Time & Habit Tracker
              </h2>
              <p className="text-[11px] text-app-muted">
                Track your Pomodoro focus duration across days, weeks, and months
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Horizon Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-app-subtle border border-app-border text-xs font-headline">
            <button
              type="button"
              onClick={() => setTimeHorizon('day')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeHorizon === 'day'
                  ? 'bg-app-card text-app-text font-bold shadow-sm'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => setTimeHorizon('week')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeHorizon === 'week'
                  ? 'bg-app-card text-app-text font-bold shadow-sm'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setTimeHorizon('month')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeHorizon === 'month'
                  ? 'bg-app-card text-app-text font-bold shadow-sm'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              Month
            </button>
          </div>

          {/* Quick Log Session Button */}
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-headline font-bold text-white bg-[#4f91b0] hover:bg-[#3f748d] transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Time</span>
          </button>
        </div>
      </div>

      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Today */}
        <div className="p-4 rounded-2xl bg-app-subtle border border-app-border space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-app-muted">Today</span>
            <Clock className="w-3.5 h-3.5 text-[#4f91b0]" />
          </div>
          <div className="font-mono text-2xl font-black text-app-text">
            {stats ? formatHoursMins(stats.todayMinutes) : '0m'}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            🎯 Target: 2h daily
          </div>
        </div>

        {/* This Week */}
        <div className="p-4 rounded-2xl bg-app-subtle border border-app-border space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-app-muted">This Week</span>
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="font-mono text-2xl font-black text-app-text">
            {stats ? `${(stats.weekMinutes / 60).toFixed(1)} hrs` : '0.0 hrs'}
          </div>
          <div className="text-[10px] text-app-muted">
            Past 7 days active
          </div>
        </div>

        {/* This Month */}
        <div className="p-4 rounded-2xl bg-app-subtle border border-app-border space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-app-muted">This Month</span>
            <BarChart3 className="w-3.5 h-3.5 text-[#7650af]" />
          </div>
          <div className="font-mono text-2xl font-black text-app-text">
            {stats ? `${(stats.monthMinutes / 60).toFixed(1)} hrs` : '0.0 hrs'}
          </div>
          <div className="text-[10px] text-[#4f91b0] font-medium">
            30-day focus time
          </div>
        </div>

        {/* Study Streak */}
        <div className="p-4 rounded-2xl bg-app-subtle border border-app-border space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-app-muted">Streak</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="font-mono text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center space-x-1">
            <span>{stats?.streakDays || 1}</span>
            <span className="text-xs font-headline font-semibold text-app-muted">Days 🔥</span>
          </div>
          <div className="text-[10px] text-app-muted">
            Consistency streak
          </div>
        </div>
      </div>

      {/* 2-Column Analytics: Visual Weekly Chart & Course Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Weekly Daily Focus Chart (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-app-subtle border border-app-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-[#4f91b0]" />
              <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-app-text">
                Daily Focus Breakdown (7 Days)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-app-muted">Minutes / Day</span>
          </div>

          {/* Visual Bar Chart */}
          <div className="flex items-end justify-between gap-2 pt-6 pb-2 h-44 px-2">
            {stats?.dailyBreakdown.map((item, idx) => {
              const heightPct = Math.max(8, Math.round((item.minutes / maxDailyMinutes) * 100));
              const isToday = item.day === 'Today';
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="opacity-0 group-hover:opacity-100 transition text-[10px] font-mono font-bold text-[#4f91b0] bg-app-card px-1.5 py-0.5 rounded shadow-sm">
                    {item.minutes}m
                  </div>

                  <div className="w-full max-w-[36px] bg-app-card rounded-xl h-full flex items-end p-1 overflow-hidden border border-app-border">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-[#3895c7] to-[#4f91b0] shadow-sm shadow-[#4f91b0]/30'
                          : item.minutes > 0
                          ? 'bg-[#4f91b0]/60 group-hover:bg-[#4f91b0]'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold ${
                      isToday ? 'text-[#4f91b0]' : 'text-app-muted'
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Course Allocation & History (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-app-subtle border border-app-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-app-border">
            <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-app-text">
              Subject Study Distribution
            </h3>
            <span className="text-[10px] font-mono text-app-muted">Hours Logged</span>
          </div>

          <div className="space-y-3">
            {stats?.courseDistribution && stats.courseDistribution.length > 0 ? (
              stats.courseDistribution.slice(0, 4).map((c, idx) => {
                const totalMins = stats.totalMinutes || 1;
                const pct = Math.round((c.minutes / totalMins) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-headline font-semibold text-app-text truncate max-w-[180px]">
                        {c.course_name}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[#4f91b0]">
                        {(c.minutes / 60).toFixed(1)}h ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-app-card h-2 rounded-full overflow-hidden border border-app-border">
                      <div
                        className="h-full rounded-full bg-[#4f91b0]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-app-muted font-mono">
                No course study history yet. Start your first session above!
              </div>
            )}
          </div>

          {/* Recent Logged Sessions */}
          <div className="pt-3 border-t border-app-border space-y-2">
            <span className="text-[10px] font-mono uppercase text-app-muted font-semibold">
              Recent Focus Sessions
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs font-mono">
              {stats?.recentSessions.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="p-2 rounded-xl bg-app-card border border-app-border flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-app-text truncate">
                      {s.course_name || 'Academic Session'}
                    </div>
                    <div className="text-[10px] text-app-muted">{s.date}</div>
                  </div>
                  <span className="font-bold text-[#4f91b0] shrink-0">
                    +{s.duration_minutes}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Time Logging Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0f1f24] border border-slate-200 dark:border-slate-800 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)] ring-1 ring-black/10 dark:ring-white/10 space-y-4 animate-fadeIn relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-headline text-base font-bold text-slate-900 dark:text-slate-100">
                Log Completed Study Time
              </h3>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-text mb-1">
                  Course / Subject
                </label>
                <select
                  value={logCourse}
                  onChange={(e) => setLogCourse(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-app-subtle border border-app-border text-app-text focus:outline-none focus:ring-2 focus:ring-[#4f91b0]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-text mb-1">
                  Focus Minutes Studied
                </label>
                <div className="flex items-center space-x-2">
                  {[25, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setLogMinutes(mins)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                        logMinutes === mins
                          ? 'bg-[#4f91b0] text-white'
                          : 'bg-app-subtle border border-app-border text-app-muted hover:text-app-text'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                  <input
                    type="number"
                    value={logMinutes}
                    onChange={(e) => setLogMinutes(Number(e.target.value))}
                    min={5}
                    step={5}
                    className="w-20 px-2.5 py-1.5 text-xs font-mono rounded-xl bg-app-subtle border border-app-border text-app-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-text mb-1">
                  Session Notes (Optional)
                </label>
                <input
                  type="text"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="e.g. Chapter 4 Practice Exercises"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-app-subtle border border-app-border text-app-text focus:outline-none focus:ring-2 focus:ring-[#4f91b0]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-headline font-semibold text-app-muted hover:text-app-text bg-app-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-headline font-bold text-white bg-[#4f91b0] hover:bg-[#3f748d] transition shadow-md"
                >
                  {submitting ? 'Saving...' : 'Save Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
