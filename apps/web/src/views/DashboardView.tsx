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

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'high':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25">
            MED
          </span>
        );
      case 'low':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-app-subtle text-app-muted border border-app-border">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Welcoming Hero Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-[#225977] via-[#2d779f] to-[#3895c7] text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white border border-white/20 uppercase tracking-wider">
              Student Workspace
            </span>
            <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight mt-2 flex items-center gap-2">
              <span>Welcome back, {studentFirstName}!</span>
              <Sparkles className="w-5 h-5 text-cyan-200 animate-pulse" />
            </h1>
            <p className="text-sm text-white/90 mt-1 max-w-xl">
              You have <span className="font-bold underline">{pendingTasks.length} active assignments</span>. Let's make today productive and stress-free.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2.5 rounded-xl font-headline text-xs font-bold text-[#163c50] bg-white hover:bg-slate-100 transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Assignment</span>
            </button>
            <button
              onClick={() => onNavigateToScreen('planner')}
              className="px-4 py-2.5 rounded-xl font-headline text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/25 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Pomodoro Timer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <KpiCards tasks={tasks} courses={courses} progressList={progressList} />

      {/* 3. Clean Alexa+ Assistant Command Box */}
      <div className="rounded-2xl p-5 bg-app-card border border-app-border shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-themePrimary-500/15 text-[#4f91b0] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-headline text-sm font-bold text-app-text">
              Alexa+ Academic Assistant
            </h3>
          </div>
          <button
            onClick={() => onNavigateToScreen('voice')}
            className="text-xs font-headline font-semibold text-[#3895c7] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>Full Voice Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Natural Language Prompt Input */}
        <form onSubmit={handleVoiceSubmit} className="relative flex items-center">
          <Mic className="w-4 h-4 text-[#4f91b0] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={voiceQuery}
            onChange={(e) => setVoiceQuery(e.target.value)}
            placeholder="Ask Alexa+ anything... (e.g. 'What is due this week?' or 'Add a task: Lab 3 for CS 420')"
            className="w-full pl-10 pr-24 py-2.5 text-xs font-sans rounded-xl bg-app-subtle border border-app-border text-app-text placeholder-app-muted focus:outline-none focus:border-[#4f91b0] transition"
          />
          <button
            type="submit"
            disabled={voiceLoading}
            className="absolute right-1.5 px-3 py-1.5 rounded-lg text-xs font-headline font-bold text-white bg-[#4f91b0] hover:bg-[#3f748d] disabled:opacity-50 transition cursor-pointer"
          >
            {voiceLoading ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-mono text-app-muted">Suggestions:</span>
          {[
            "What's due this week?",
            "I have 60 minutes tonight, help me study",
            "How am I doing in Operating Systems?",
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleQuickPrompt(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-app-subtle text-app-text hover:text-[#3895c7] border border-app-border hover:border-[#4f91b0] transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* AI Voice Response Notification */}
        {voiceResponse && (
          <div className="p-3.5 rounded-xl bg-themePrimary-500/10 border border-themePrimary-500/20 text-xs flex items-start space-x-3 mt-2">
            <Volume2 className="w-4 h-4 text-[#4f91b0] shrink-0 mt-0.5" />
            <div className="flex-1 text-app-text font-sans leading-relaxed">
              {voiceResponse}
            </div>
          </div>
        )}
      </div>

      {/* 4. Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Priority Assignments (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl p-6 bg-app-card border border-app-border shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-app-border">
            <div>
              <h2 className="font-headline text-base font-bold text-app-text">
                Upcoming Coursework
              </h2>
              <p className="text-xs text-app-muted">
                Top assignments awaiting completion
              </p>
            </div>
            <button
              onClick={() => onNavigateToScreen('assignments')}
              className="text-xs font-headline font-semibold text-[#3895c7] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>View All ({tasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTasks.length === 0 ? (
              <div className="text-center py-8 text-xs text-app-muted font-mono flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>All caught up! No pending assignments.</span>
              </div>
            ) : (
              recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-app-subtle border border-app-border hover:border-[#4f91b0]/50 transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => onToggleStatus(task.id, task.status)}
                      className="text-app-muted hover:text-[#4f91b0] transition shrink-0 cursor-pointer"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <div className="font-headline text-xs font-bold text-app-text truncate">
                        {task.title}
                      </div>
                      <div className="text-[10px] font-mono text-app-muted flex items-center space-x-2 mt-0.5">
                        <span className="font-semibold text-[#3895c7]">
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
                      className="px-2.5 py-1 text-[10px] font-headline font-semibold text-[#3895c7] hover:bg-themePrimary-500/10 rounded-lg border border-themePrimary-500/30 transition cursor-pointer"
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
          <div className="rounded-2xl p-6 bg-app-card border border-app-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app-border">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#4f91b0]" />
                <h3 className="font-headline text-sm font-bold text-app-text">
                  Quick Focus Session
                </h3>
              </div>
              <button
                onClick={() => onNavigateToScreen('planner')}
                className="text-xs font-headline font-semibold text-[#3895c7] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-center py-2 space-y-2">
              <div className="font-mono text-4xl font-extrabold text-app-text tracking-wider">
                {formatTime(secondsRemaining)}
              </div>
              <p className="text-[11px] text-app-muted">
                Pomodoro focus session
              </p>

              <div className="flex items-center justify-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="px-4 py-2 rounded-xl text-xs font-headline font-bold text-white bg-[#4f91b0] hover:bg-[#3f748d] transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
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
                  className="p-2 rounded-xl bg-app-subtle text-app-muted hover:text-app-text border border-app-border transition cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Course Syllabus Progress */}
          <div className="rounded-2xl p-6 bg-app-card border border-app-border shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-app-border">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#3895c7]" />
                <h3 className="font-headline text-sm font-bold text-app-text">
                  Course Pacing
                </h3>
              </div>
              <span className="text-[11px] font-mono text-app-muted">Semester 1</span>
            </div>

            <div className="space-y-3 pt-1">
              {progressList.slice(0, 4).map((p) => (
                <div key={p.course_id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-headline font-semibold text-app-text">
                      {p.course_code || p.course_name}
                    </span>
                    <span className="font-mono font-bold text-[#3895c7]">
                      {p.completed_pct}%
                    </span>
                  </div>
                  <div className="w-full bg-app-subtle h-2 rounded-full overflow-hidden border border-app-border">
                    <div
                      className="h-full rounded-full bg-[#4f91b0] transition-all duration-300"
                      style={{ width: `${p.completed_pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
