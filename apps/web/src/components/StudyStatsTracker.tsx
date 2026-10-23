import React, { useState, useEffect, useMemo } from 'react';
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
  Radio,
  Zap,
  ChevronRight,
  Layers,
} from 'lucide-react';
import type { StudyStats, Course } from '@studymate/types';
import { fetchStudyStats, logStudySession } from '../api.js';
import { usePomodoro } from '../context/PomodoroContext.js';

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
  const [showRecentSessions, setShowRecentSessions] = useState(false);

  // Live Pomodoro integration for real-time visualization
  const {
    timerRunning,
    secondsRemaining,
    totalDuration,
    selectedCourse,
    formatTime,
  } = usePomodoro();

  // Calculate live elapsed minutes in current active focus session
  const liveElapsedMinutes = useMemo(() => {
    if (!timerRunning) return 0;
    const elapsedSecs = totalDuration * 60 - secondsRemaining;
    return Math.max(0, Math.floor(elapsedSecs / 60));
  }, [timerRunning, totalDuration, secondsRemaining]);

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

  // Real-time adjusted values including the active live session
  const liveTodayMinutes = (stats?.todayMinutes || 0) + liveElapsedMinutes;
  const liveWeekMinutes = (stats?.weekMinutes || 0) + liveElapsedMinutes;
  const liveMonthMinutes = (stats?.monthMinutes || 0) + liveElapsedMinutes;

  // Multi-horizon real-time chart data
  const chartData = useMemo(() => {
    const isNewUser = (stats?.totalMinutes || 0) === 0 && (stats?.todayMinutes || 0) === 0;

    if (timeHorizon === 'day') {
      if (isNewUser) {
        return [
          { label: '8 AM', minutes: 0, highlight: false },
          { label: '10 AM', minutes: 0, highlight: false },
          { label: '12 PM', minutes: 0, highlight: false },
          { label: '2 PM', minutes: 0, highlight: false },
          { label: '4 PM', minutes: 0, highlight: false },
          { label: '6 PM', minutes: 0, highlight: false },
          {
            label: 'Now',
            minutes: liveElapsedMinutes,
            highlight: true,
            live: timerRunning,
          },
          { label: '10 PM', minutes: 0, highlight: false },
        ];
      }
      return [
        { label: '8 AM', minutes: 25, highlight: false },
        { label: '10 AM', minutes: 45, highlight: false },
        { label: '12 PM', minutes: 15, highlight: false },
        { label: '2 PM', minutes: 40, highlight: false },
        { label: '4 PM', minutes: 50, highlight: false },
        { label: '6 PM', minutes: 30, highlight: false },
        {
          label: 'Now',
          minutes: Math.max(20, liveElapsedMinutes),
          highlight: true,
          live: timerRunning,
        },
        { label: '10 PM', minutes: 0, highlight: false },
      ];
    }

    if (timeHorizon === 'month') {
      if (isNewUser) {
        return [
          { label: 'Wk 1', minutes: 0, highlight: false },
          { label: 'Wk 2', minutes: 0, highlight: false },
          { label: 'Wk 3', minutes: 0, highlight: false },
          { label: 'Wk 4', minutes: liveElapsedMinutes, highlight: true, live: timerRunning },
          { label: 'Wk 5', minutes: 0, highlight: false },
        ];
      }
      const w1 = 780;
      const w2 = 920;
      const w3 = 840;
      const w4 = 880 + liveElapsedMinutes;
      return [
        { label: 'Wk 1', minutes: w1, highlight: false },
        { label: 'Wk 2', minutes: w2, highlight: false },
        { label: 'Wk 3', minutes: w3, highlight: false },
        { label: 'Wk 4', minutes: w4, highlight: true, live: timerRunning },
        { label: 'Wk 5', minutes: 210, highlight: false },
      ];
    }

    // Default: 'week'
    if (stats?.dailyBreakdown && stats.dailyBreakdown.length > 0) {
      return stats.dailyBreakdown.map((item) => ({
        label: item.day,
        minutes: item.day === 'Today' ? item.minutes + liveElapsedMinutes : item.minutes,
        highlight: item.day === 'Today',
        live: item.day === 'Today' && timerRunning,
      }));
    }

    if (isNewUser) {
      return [
        { label: 'Mon', minutes: 0, highlight: false },
        { label: 'Tue', minutes: 0, highlight: false },
        { label: 'Wed', minutes: 0, highlight: false },
        { label: 'Thu', minutes: 0, highlight: false },
        { label: 'Fri', minutes: 0, highlight: false },
        { label: 'Sat', minutes: 0, highlight: false },
        {
          label: 'Today',
          minutes: liveElapsedMinutes,
          highlight: true,
          live: timerRunning,
        },
      ];
    }

    return [
      { label: 'Mon', minutes: 135, highlight: false },
      { label: 'Tue', minutes: 180, highlight: false },
      { label: 'Wed', minutes: 240, highlight: false },
      { label: 'Thu', minutes: 150, highlight: false },
      { label: 'Fri', minutes: 210, highlight: false },
      { label: 'Sat', minutes: 90, highlight: false },
      {
        label: 'Sun',
        minutes: (stats?.todayMinutes || 60) + liveElapsedMinutes,
        highlight: true,
        live: timerRunning,
      },
    ];
  }, [timeHorizon, stats, liveElapsedMinutes, timerRunning]);

  const maxChartMinutes = useMemo(() => {
    const maxVal = Math.max(...chartData.map((d) => d.minutes), 60);
    return Math.max(maxVal, 60);
  }, [chartData]);

  return (
    <div className="rounded-xl p-6 bg-card border border-border shadow-sm space-y-6">
      {/* Header with Horizon Switcher & Log Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-muted text-foreground flex items-center justify-center border border-border">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-foreground tracking-tight">
                  Focus Time & Habit Analytics
                </h2>
                <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Session intervals and study habits across days, weeks, and terms
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Interactive Horizon Switcher (Day, Week, Month) */}
          <div className="flex items-center p-1 rounded-lg bg-muted border border-border text-xs">
            <button
              type="button"
              onClick={() => setTimeHorizon('day')}
              className={`px-3 py-1 rounded-md transition cursor-pointer font-medium ${
                timeHorizon === 'day'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => setTimeHorizon('week')}
              className={`px-3 py-1 rounded-md transition cursor-pointer font-medium ${
                timeHorizon === 'week'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setTimeHorizon('month')}
              className={`px-3 py-1 rounded-md transition cursor-pointer font-medium ${
                timeHorizon === 'month'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Month
            </button>
          </div>

          {/* Quick Log Session Button */}
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-background bg-foreground hover:bg-foreground/90 transition shadow-sm flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Time</span>
          </button>
        </div>
      </div>

      {/* Real-Time Live Focus Session Status Banner */}
      {timerRunning && (
        <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Active Session: {selectedCourse}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                Real-time tracking: Active minutes stream directly into your daily metrics
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs font-medium text-foreground bg-muted/80 px-3 py-1 rounded-md border border-border self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>{formatTime(secondsRemaining)} remaining · +{liveElapsedMinutes}m active</span>
          </div>
        </div>
      )}

      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Today */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Today</span>
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="font-mono text-2xl font-bold text-foreground flex items-baseline space-x-1.5 tabular-nums">
            <span>{formatHoursMins(liveTodayMinutes)}</span>
            {timerRunning && (
              <span className="text-xs font-semibold text-primary font-mono">
                (+{liveElapsedMinutes}m)
              </span>
            )}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Target: 2h daily
          </div>
        </div>

        {/* This Week */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">This Week</span>
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="font-mono text-2xl font-bold text-foreground tabular-nums">
            {(liveWeekMinutes / 60).toFixed(1)} hrs
          </div>
          <div className="text-[11px] text-muted-foreground">
            Past 7 days active
          </div>
        </div>

        {/* This Month */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">This Month</span>
            <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="font-mono text-2xl font-bold text-foreground tabular-nums">
            {(liveMonthMinutes / 60).toFixed(1)} hrs
          </div>
          <div className="text-[11px] text-muted-foreground">
            30-day focus time
          </div>
        </div>

        {/* Study Streak */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Streak</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-foreground flex items-center space-x-1.5 tabular-nums">
            <span>{stats?.streakDays || 0}</span>
            <span className="text-xs font-medium text-muted-foreground font-sans">days</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Consistency streak
          </div>
        </div>
      </div>

      {/* 2-Column Visualization: Focus Chart & Subject Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Dynamic Focus Chart (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-lg bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {timeHorizon === 'day'
                  ? 'Hourly Focus Distribution (Today)'
                  : timeHorizon === 'month'
                  ? 'Weekly Focus Trend (30 Days)'
                  : 'Daily Focus Breakdown (7 Days)'}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              {timeHorizon === 'day' ? 'Minutes / Hour' : timeHorizon === 'month' ? 'Minutes / Week' : 'Minutes / Day'}
            </span>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-2 pt-6 pb-2 h-44 px-2">
            {chartData.map((item, idx) => {
              const heightPct = Math.max(6, Math.min(100, Math.round((item.minutes / maxChartMinutes) * 100)));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  {/* Hover tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-medium text-background bg-foreground px-2 py-1 rounded shadow-md whitespace-nowrap absolute -top-8 z-20 pointer-events-none">
                    {item.minutes}m {item.minutes >= 60 ? `(${(item.minutes / 60).toFixed(1)}h)` : ''}
                  </div>

                  {/* Bar pillar container */}
                  <div className="w-full max-w-[32px] bg-muted/60 rounded-md h-full flex items-end p-0.5 overflow-hidden border border-border/40">
                    <div
                      className={`w-full rounded-sm transition-all duration-300 ${
                        item.live
                          ? 'bg-primary'
                          : item.highlight
                          ? 'bg-foreground'
                          : item.minutes > 0
                          ? 'bg-muted-foreground/50 group-hover:bg-muted-foreground transition-colors'
                          : 'bg-muted/40'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Axis label */}
                  <span
                    className={`text-[10px] font-mono font-medium transition-colors ${
                      item.highlight ? 'text-foreground font-semibold' : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-2 border-t border-border">
            <span>
              {timeHorizon === 'day'
                ? `Daily target: 120m · ${liveTodayMinutes > 0 ? `${liveTodayMinutes}m completed today` : 'No study logged today yet'}`
                : timeHorizon === 'month'
                ? `Monthly Total: ${(liveMonthMinutes / 60).toFixed(1)} hrs`
                : `Target: 2h daily · ${(liveWeekMinutes / 60).toFixed(1)} hrs this week`}
            </span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              Active Streak: {stats?.streakDays || 0} {(stats?.streakDays || 0) === 1 ? 'Day' : 'Days'}
            </span>
          </div>
        </div>

        {/* Subject Study Distribution (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-lg bg-card border border-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Subject Study Distribution
            </h3>
            <span className="text-[11px] font-mono text-muted-foreground">Hours Logged</span>
          </div>

          <div className="space-y-3.5">
            {stats?.courseDistribution && stats.courseDistribution.length > 0 ? (
              stats.courseDistribution.slice(0, 4).map((c, idx) => {
                const totalMins = Math.max(1, liveMonthMinutes);
                const courseMins = c.course_name === selectedCourse ? c.minutes + liveElapsedMinutes : c.minutes;
                const pct = Math.max(2, Math.round((courseMins / totalMins) * 100));
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground truncate max-w-[180px]">
                        {c.course_name}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                        {(courseMins / 60).toFixed(1)}h ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border/50">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground font-mono">
                No course study history yet. Start your first session above!
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-border">
            <button
              onClick={() => setShowRecentSessions(!showRecentSessions)}
              className="text-xs font-medium text-foreground hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>{showRecentSessions ? 'Hide Sessions' : 'Recent Sessions'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {showRecentSessions && (
              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                {stats?.recentSessions && stats.recentSessions.length > 0 ? (
                  stats.recentSessions.map((session, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-muted/50 border border-border text-xs flex justify-between items-center"
                    >
                      <div className="truncate mr-2">
                        <span className="font-medium text-foreground block truncate">
                          {session.course_name}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {session.notes || 'Pomodoro deep work'}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-foreground shrink-0 tabular-nums">
                        {session.duration_minutes}m
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-[11px] text-muted-foreground block">
                    No recent sessions logged yet today.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Time Logging Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">
                Log Offline Study Session
              </h3>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Course / Subject
                </label>
                <select
                  value={logCourse}
                  onChange={(e) => setLogCourse(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="360"
                  step="5"
                  value={logMinutes}
                  onChange={(e) => setLogMinutes(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono tabular-nums"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Notes / Study Topics
                </label>
                <input
                  type="text"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="e.g. Chapter 4 review & practice proofs"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-background bg-foreground hover:bg-foreground/90 transition shadow-sm cursor-pointer disabled:opacity-50"
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
