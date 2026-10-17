import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  Sparkles,
  Mic,
  Send,
  Volume2,
  Calendar,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
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
  onParseNlp,
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
          <span className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            MED
          </span>
        );
      case 'low':
        return (
          <span className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10 uppercase tracking-wider">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Guest Mode Notification Banner */}
      {isPreview && (
        <div className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/80 dark:from-white/[0.05] dark:via-white/[0.03] dark:to-transparent border border-blue-200/70 dark:border-white/10 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wider shrink-0">
              Preview Mode
            </span>
            <p className="text-xs text-slate-700 dark:text-white/70 leading-relaxed">
              You are exploring StudyMate with <strong className="text-slate-900 dark:text-white">0 preloaded dummy data</strong>. You can test Pomodoro and create temporary tasks, but history is not saved. <strong className="text-slate-900 dark:text-white">Sign in</strong> to persist your academic workspace.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={openClerkSignIn}
              className="px-4 py-2 rounded-full text-xs font-semibold text-white transition shadow-sm active:scale-95 bg-[#F5EFE6] text-[#0E1117] hover:bg-white font-medium border border-transparent dark:border-white/20 cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={openClerkSignUp}
              className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 dark:text-white/80 bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.12] border border-slate-300 dark:border-white/20 transition cursor-pointer"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      )}

      {/* 1. Welcoming Hero Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#121520] border border-white/[0.08] text-[#F5EFE6] relative overflow-hidden">
        {/* Ambient subtle glow mesh */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <span className="font-mono text-[10px] font-semibold px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 uppercase tracking-wider">
              {isPreview ? 'Guest Workspace' : 'Student Workspace'}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight mt-3 flex items-center gap-2 text-[#F5EFE6]">
              <span>{isPreview ? 'Welcome to StudyMate!' : `Welcome back, ${studentFirstName}!`}</span>
              <Sparkles className="w-5 h-5 text-[#E5A952]" />
            </h1>
            <p className="text-sm text-blue-100/90 dark:text-white/70 mt-1.5 max-w-xl leading-relaxed">
              {pendingTasks.length > 0 ? (
                <>
                  You have <span className="font-semibold text-white underline decoration-cyan-400/50">{pendingTasks.length} active assignments</span>. Let's make today productive and stress-free.
                </>
              ) : (
                <>
                  {isPreview
                    ? "Your guest workspace is clean and ready. Add an assignment or start a Pomodoro focus sprint."
                    : "Welcome to StudyMate! Your workspace is fresh and ready. Click + Add Assignment to begin."}
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-white transition shadow-xl border border-white/20 active:scale-95 hover:opacity-90 flex items-center space-x-1.5 cursor-pointer bg-[#F5EFE6] text-[#0E1117] hover:bg-white font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add Assignment</span>
            </button>
            <button
              onClick={() => onNavigateToScreen('planner')}
              className="px-5 py-2.5 rounded-full text-xs font-medium text-white bg-white/15 hover:bg-white/20 border border-white/20 transition flex items-center space-x-1.5 cursor-pointer backdrop-blur-md"
            >
              <Clock className="w-4 h-4 text-[#E5A952]" />
              <span>Pomodoro Timer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <KpiCards tasks={tasks} courses={courses} progressList={progressList} />

      {/* 3. Clean Alexa+ Assistant Command Box */}
      <div className="rounded-2xl p-6 bg-[#FAF7F2] dark:bg-[#121520] border border-[#E6DFD3] dark:border-white/[0.06] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-[#E5A952] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Alexa+ Academic Assistant
            </h3>
          </div>
          <button
            onClick={() => onNavigateToScreen('voice')}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-[#E5A952] dark:hover:text-cyan-200 hover:underline flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <span>Full Voice Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Natural Language Prompt Input */}
        <form onSubmit={handleVoiceSubmit} className="relative flex items-center">
          <Mic className="w-4 h-4 text-blue-600 dark:text-cyan-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={voiceQuery}
            onChange={(e) => setVoiceQuery(e.target.value)}
            placeholder="Ask Alexa+ anything... (e.g. 'What is due this week?' or 'Add a task: Lab 3 for CS 420')"
            className="w-full pl-11 pr-28 py-3 text-xs rounded-full bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400/60 focus:bg-white dark:focus:bg-white/[0.09] transition"
          />
          <button
            type="submit"
            disabled={voiceLoading}
            className="absolute right-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer bg-[#F5EFE6] text-[#0E1117] hover:bg-white font-medium border border-transparent dark:border-white/20"
          >
            {voiceLoading ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-mono text-slate-400 dark:text-white/40">Suggestions:</span>
          {[
            "What's due this week?",
            "I have 60 minutes tonight, help me study",
            "How am I doing in Operating Systems?",
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleQuickPrompt(prompt)}
              className="text-[11px] px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-white/[0.04] dark:text-white/70 dark:hover:text-white dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/[0.08] transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* AI Voice Response Notification */}
        {voiceResponse && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/20 text-xs flex items-start space-x-3 mt-2 animate-in fade-in duration-200">
            <Volume2 className="w-4 h-4 text-blue-600 dark:text-[#E5A952] shrink-0 mt-0.5" />
            <div className="flex-1 text-slate-800 dark:text-white/90 leading-relaxed">
              <span className="font-semibold text-blue-700 dark:text-[#E5A952]">Alexa+: </span>
              {voiceResponse}
            </div>
          </div>
        )}
      </div>

      {/* 4. Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Priority Assignments (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl p-6 bg-white dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Upcoming Coursework
              </h2>
              <p className="text-xs text-slate-500 dark:text-white/50">
                Top assignments awaiting completion
              </p>
            </div>
            <button
              onClick={() => onNavigateToScreen('assignments')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-[#E5A952] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>View All ({tasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTasks.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl bg-slate-50/60 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white flex items-center justify-center border border-slate-200 dark:border-white/15">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-[#E5A952]" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white">No assignments recorded yet</p>
                  <p className="text-[11px] text-slate-500 dark:text-white/50">Create your first task or syllabus topic to get started</p>
                </div>
                <button
                  onClick={onOpenAddModal}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white transition shadow-md border border-transparent dark:border-white/20 active:scale-95 hover:opacity-90 flex items-center space-x-1.5 cursor-pointer bg-[#F5EFE6] text-[#0E1117] hover:bg-white font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Task</span>
                </button>
              </div>
            ) : (
              recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => onToggleStatus(task.id, task.status)}
                      className="text-slate-400 hover:text-blue-600 dark:text-white/40 dark:hover:text-[#E5A952] transition shrink-0 cursor-pointer"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {task.title}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-white/50 flex items-center space-x-2 mt-0.5">
                        <span className="font-semibold text-blue-600 dark:text-[#E5A952]">
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
                      className="px-3 py-1 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 dark:text-[#E5A952] dark:bg-transparent dark:hover:bg-cyan-500/20 dark:border-cyan-500/30 rounded-full transition cursor-pointer"
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
          <div className="rounded-2xl p-6 bg-white dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-[#E5A952]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Quick Focus Session
                </h3>
              </div>
              <button
                onClick={() => onNavigateToScreen('planner')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-[#E5A952] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-center py-4 space-y-3">
              <div className="font-mono text-5xl font-extralight text-slate-900 dark:text-white tracking-widest drop-shadow-[0_0_15px_rgba(37,99,235,0.1)] dark:drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                {formatTime(secondsRemaining)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-white/50 uppercase tracking-wider font-mono">
                Pomodoro Focus Sprint
              </p>

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-white transition shadow-md border border-transparent dark:border-white/20 active:scale-95 hover:opacity-90 flex items-center space-x-1.5 cursor-pointer bg-[#F5EFE6] text-[#0E1117] hover:bg-white font-medium"
                >
                  {timerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Focus</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetTimer}
                  className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-white/10 dark:text-white/70 dark:hover:text-white dark:border-white/15 transition cursor-pointer"
                  title="Reset"
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
            <div className="rounded-2xl p-6 bg-white dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/10">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-[#E5A952]" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    Course Pacing
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400 dark:text-white/50">Semester 1</span>
              </div>

              <div className="space-y-3 pt-1">
                {progressList.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 dark:text-white/50 font-mono">
                    No courses enrolled yet. Add an assignment above to track your course progress!
                  </div>
                ) : (
                  progressList.slice(0, 4).map((p) => (
                    <div key={p.course_id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {p.course_code || p.course_name}
                        </span>
                        <span className="font-mono font-bold text-blue-600 dark:text-[#E5A952]">
                          {p.completed_pct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-white/10 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-500 transition-all duration-300"
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
