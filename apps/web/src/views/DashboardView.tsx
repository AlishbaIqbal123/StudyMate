import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  Mic,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { KpiCards } from '../components/KpiCards.js';
import { simulateVoice, getActiveStudent } from '../api.js';
import { usePomodoro } from '../context/PomodoroContext.js';
import { useAuth } from '../context/AuthContext.js';
import { AuthGate } from '../components/AuthGate.js';
import type { Course, CourseProgress, Task, TaskPriority, TaskStatus } from '@studymate/types';

interface DashboardViewProps {
  tasks: Task[];
  courses: Course[];
  progressList: CourseProgress[];
  onToggleStatus: (taskId: number, currentStatus: TaskStatus) => void;
  onOpenAddModal: () => void;
  onFocusTask: (task: Task) => void;
  onParseNlp: (text: string) => void;
  onDataChanged: () => void;
  onNavigateToScreen: (screen: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  courses,
  progressList,
  onToggleStatus,
  onOpenAddModal,
  onFocusTask,
  onDataChanged,
  onNavigateToScreen,
}) => {
  const { isPreview, openClerkSignIn, openClerkSignUp } = useAuth();
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState<string | null>(null);
  const activeStudent = getActiveStudent();
  const studentFirstName = activeStudent?.name ? activeStudent.name.split(' ')[0] : 'Scholar';

  // Global Pomodoro Timer
  const {
    timerRunning,
    secondsRemaining,
    toggleTimer,
    resetTimer,
    formatTime,
  } = usePomodoro();

  const handleVoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceQuery.trim() || voiceLoading) return;
    setVoiceLoading(true);
    try {
      const res = await simulateVoice(voiceQuery.trim());
      setVoiceResponse(res.speechResponse);
      onDataChanged();
      setVoiceQuery('');

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(res.speechResponse);
        utt.rate = 1.05;
        window.speechSynthesis.speak(utt);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleQuickPrompt = async (promptText: string) => {
    setVoiceQuery(promptText);
    setVoiceLoading(true);
    try {
      const res = await simulateVoice(promptText);
      setVoiceResponse(res.speechResponse);
      onDataChanged();

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(res.speechResponse);
        utt.rate = 1.05;
        window.speechSynthesis.speak(utt);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVoiceLoading(false);
    }
  };

  const pendingTasks = tasks.filter((t) => t.status !== 'done');
  const recentTasks = pendingTasks.slice(0, 5);

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'high':
        return (
          <span className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            MED
          </span>
        );
      case 'low':
        return (
          <span className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 uppercase tracking-wider">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Guest Mode Notification Banner */}
      {isPreview && (
        <div className="rounded-xl p-4 bg-slate-100 dark:bg-[#141926] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">
              Demo Sandbox
            </span>
            <p className="text-slate-700 dark:text-slate-300">
              You are using StudyMate with local sample coursework. Sign in with a student account to sync across devices and pair physical Alexa hardware.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openClerkSignIn}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={openClerkSignUp}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 transition cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* 1. Welcoming Hero Banner */}
      <div className="rounded-xl p-6 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
            {isPreview ? 'Academic Sandbox' : 'Student Overview'}
          </span>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mt-1">
            {isPreview ? 'StudyMate Academic Hub' : `Welcome back, ${studentFirstName}`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {pendingTasks.length > 0 ? (
              <>
                You have <strong className="font-medium text-slate-900 dark:text-white">{pendingTasks.length} pending assignments</strong>. Check deadlines below or start a 25-minute Pomodoro focus sprint.
              </>
            ) : (
              'All coursework is currently up to date. Add a new assignment or start a study sprint.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Assignment</span>
          </button>
          <button
            onClick={() => onNavigateToScreen('planner')}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Open Planner</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <KpiCards tasks={tasks} courses={courses} progressList={progressList} />

      {/* 3. Alexa+ Assistant Command Box */}
      <div className="rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mic className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Alexa+ Voice Assistant
            </h3>
          </div>
          <button
            onClick={() => onNavigateToScreen('voice')}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-1 cursor-pointer transition"
          >
            <span>Full Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Natural Language Prompt Input */}
        <form onSubmit={handleVoiceSubmit} className="relative flex items-center">
          <input
            type="text"
            value={voiceQuery}
            onChange={(e) => setVoiceQuery(e.target.value)}
            placeholder="Ask Alexa anything (e.g. 'What is due this week?' or 'Add task: Lab 3 for CS 420 due Friday')"
            className="w-full pl-3.5 pr-24 py-2.5 text-xs rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 transition"
          />
          <button
            type="submit"
            disabled={voiceLoading}
            className="absolute right-1 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {voiceLoading ? 'Checking...' : 'Ask'}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-1">Try:</span>
          {[
            "What's due this week?",
            "I have 45 minutes, help me study",
            "How am I doing in Operating Systems?",
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleQuickPrompt(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.06] transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* AI Voice Response Notification */}
        {voiceResponse && (
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-xs flex items-start space-x-2.5 mt-2 animate-fadeIn">
            <Volume2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="flex-1 text-slate-800 dark:text-slate-200 leading-relaxed">
              <span className="font-semibold text-slate-900 dark:text-white">Alexa: </span>
              {voiceResponse}
            </div>
          </div>
        )}
      </div>

      {/* 4. Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Priority Assignments (7 cols) */}
        <div className="lg:col-span-7 rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                Upcoming Coursework
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active assignments scheduled for completion
              </p>
            </div>
            <button
              onClick={() => onNavigateToScreen('assignments')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-1 cursor-pointer"
            >
              <span>View All ({tasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {recentTasks.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <p className="text-xs font-medium text-slate-800 dark:text-white">No pending tasks</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">All recorded assignments are completed.</p>
                <button
                  onClick={onOpenAddModal}
                  className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 transition cursor-pointer"
                >
                  Add Assignment
                </button>
              </div>
            ) : (
              recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] hover:bg-slate-100/70 dark:hover:bg-white/[0.05] transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => onToggleStatus(task.id, task.status)}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition shrink-0 cursor-pointer"
                      title="Mark complete"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-900 dark:text-white truncate">
                        {task.title}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {task.course_code || task.course_name}
                        </span>
                        <span>•</span>
                        <span>{task.due_date || 'No due date'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {getPriorityBadge(task.priority)}
                    <button
                      onClick={() => onFocusTask(task)}
                      className="px-2.5 py-1 text-[10px] font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 rounded transition cursor-pointer"
                    >
                      Focus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Focus Timer & Course Progress (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Focus Pomodoro Card */}
          <div className="rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                  Focus Timer
                </h3>
              </div>
              <button
                onClick={() => onNavigateToScreen('planner')}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-1 cursor-pointer"
              >
                <span>Full Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-center py-2 space-y-3">
              <div className="font-mono text-5xl font-light text-slate-900 dark:text-white tracking-widest tabular-nums">
                {formatTime(secondsRemaining)}
              </div>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {timerRunning ? 'Focus Session Active' : 'Ready for Focus Sprint'}
              </p>

              <div className="flex items-center justify-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
                >
                  {timerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Sprint</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetTimer}
                  className="p-2 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 transition cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Course Syllabus Progress (Protected by AuthGate for Guests) */}
          <AuthGate
            title="Course Pacing Locked"
            description="Sign in or create a free account to track your syllabus completion, weekly hours, and pacing benchmarks."
            compact
            feature="Course Progress"
          >
            <div className="rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                    Course Pacing
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Semester 1</span>
              </div>

              <div className="space-y-3 pt-1">
                {progressList.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-500 font-mono">
                    No course progress recorded yet.
                  </div>
                ) : (
                  progressList.slice(0, 4).map((p) => (
                    <div key={p.course_id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {p.course_code || p.course_name}
                        </span>
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {p.completed_pct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-900 dark:bg-white transition-all duration-300"
                          style={{ width: `${p.completed_pct}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </AuthGate>
        </div>
      </div>
    </div>
  );
};
