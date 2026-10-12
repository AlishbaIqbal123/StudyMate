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
      {/* 1. Welcoming Hero Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent backdrop-blur-2xl border border-white/15 text-white shadow-2xl relative overflow-hidden">
        {/* Ambient subtle glow mesh */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <span className="font-mono text-[10px] font-semibold px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/15 uppercase tracking-wider">
              Student Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-3 flex items-center gap-2 text-white">
              <span>Welcome back, {studentFirstName}!</span>
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            </h1>
            <p className="text-sm text-white/70 mt-1.5 max-w-xl leading-relaxed">
              {pendingTasks.length > 0 ? (
                <>
                  You have <span className="font-semibold text-white underline decoration-cyan-400/50">{pendingTasks.length} active assignments</span>. Let's make today productive and stress-free.
                </>
              ) : (
                <>
                  Welcome to StudyMate! Your workspace is fresh and ready. Click <span className="font-semibold text-white underline decoration-cyan-400/50">+ Add Assignment</span> to begin.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-white transition shadow-xl border border-white/20 active:scale-95 hover:opacity-90 flex items-center space-x-1.5 cursor-pointer"
              style={{ background: 'linear-gradient(to bottom, #2B2B2B, #101010)' }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Assignment</span>
            </button>
            <button
              onClick={() => onNavigateToScreen('planner')}
              className="px-5 py-2.5 rounded-full text-xs font-medium text-white/90 bg-white/10 hover:bg-white/15 border border-white/15 transition flex items-center space-x-1.5 cursor-pointer backdrop-blur-md"
            >
              <Clock className="w-4 h-4 text-cyan-300" />
              <span>Pomodoro Timer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <KpiCards tasks={tasks} courses={courses} progressList={progressList} />

      {/* 3. Clean Alexa+ Assistant Command Box */}
      <div className="rounded-2xl p-6 bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Alexa+ Academic Assistant
            </h3>
          </div>
          <button
            onClick={() => onNavigateToScreen('voice')}
            className="text-xs font-medium text-cyan-300 hover:text-cyan-200 hover:underline flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <span>Full Voice Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Natural Language Prompt Input */}
        <form onSubmit={handleVoiceSubmit} className="relative flex items-center">
          <Mic className="w-4 h-4 text-cyan-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={voiceQuery}
            onChange={(e) => setVoiceQuery(e.target.value)}
            placeholder="Ask Alexa+ anything... (e.g. 'What is due this week?' or 'Add a task: Lab 3 for CS 420')"
            className="w-full pl-11 pr-28 py-3 text-xs rounded-full bg-white/[0.06] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/60 focus:bg-white/[0.09] transition"
          />
          <button
            type="submit"
            disabled={voiceLoading}
            className="absolute right-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white transition shadow-lg border border-white/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            style={{ background: 'linear-gradient(to bottom, #2B2B2B, #101010)' }}
          >
            {voiceLoading ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-mono text-white/40">Suggestions:</span>
          {[
            "What's due this week?",
            "I have 60 minutes tonight, help me study",
            "How am I doing in Operating Systems?",
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleQuickPrompt(prompt)}
              className="text-[11px] px-3 py-1 rounded-full bg-white/[0.04] text-white/70 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/[0.08] transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* AI Voice Response Notification */}
        {voiceResponse && (
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs flex items-start space-x-3 mt-2 animate-in fade-in duration-200">
            <Volume2 className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
            <div className="flex-1 text-white/90 leading-relaxed">
              <span className="font-semibold text-cyan-300">Alexa+: </span>
              {voiceResponse}
            </div>
          </div>
        )}
      </div>

      {/* 4. Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Priority Assignments (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl p-6 bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Upcoming Coursework
              </h2>
              <p className="text-xs text-white/50">
                Top assignments awaiting completion
              </p>
            </div>
            <button
              onClick={() => onNavigateToScreen('assignments')}
              className="text-xs font-semibold text-cyan-300 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>View All ({tasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTasks.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center border border-white/15">
                  <CheckCircle2 className="w-5 h-5 text-cyan-300" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-xs font-semibold text-white">No assignments recorded yet</p>
                  <p className="text-[11px] text-white/50">Create your first task or syllabus topic to get started</p>
                </div>
                <button
                  onClick={onOpenAddModal}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white transition shadow-xl border border-white/20 active:scale-95 hover:opacity-90 flex items-center space-x-1.5 cursor-pointer"
                  style={{ background: 'linear-gradient(to bottom, #2B2B2B, #101010)' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Task</span>
                </button>
              </div>
            ) : (
              recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06] transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => onToggleStatus(task.id, task.status)}
                      className="text-white/40 hover:text-cyan-300 transition shrink-0 cursor-pointer"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {task.title}
                      </div>
                      <div className="text-[10px] font-mono text-white/50 flex items-center space-x-2 mt-0.5">
                        <span className="font-semibold text-cyan-300">
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
                      className="px-3 py-1 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-500/20 rounded-full border border-cyan-500/30 transition cursor-pointer"
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
          <div className="rounded-2xl p-6 bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-300" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Quick Focus Session
                </h3>
              </div>
              <button
                onClick={() => onNavigateToScreen('planner')}
                className="text-xs font-semibold text-cyan-300 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-center py-4 space-y-3">
              <div className="font-mono text-5xl font-extralight text-white tracking-widest drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                {formatTime(secondsRemaining)}
              </div>
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-mono">
                Pomodoro Focus Sprint
              </p>

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-white transition shadow-xl border border-white/20 active:scale-95 hover:opacity-90 flex items-center space-x-1.5 cursor-pointer"
                  style={{ background: 'linear-gradient(to bottom, #2B2B2B, #101010)' }}
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
                  className="p-2.5 rounded-full bg-white/10 text-white/70 hover:text-white border border-white/15 transition cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Course Syllabus Progress */}
          <div className="rounded-2xl p-6 bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-cyan-300" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Course Pacing
                </h3>
              </div>
              <span className="text-[11px] font-mono text-white/50">Semester 1</span>
            </div>

            <div className="space-y-3 pt-1">
              {progressList.length === 0 ? (
                <div className="py-6 text-center text-xs text-white/50 font-mono">
                  No courses enrolled yet. Add an assignment above to track your course progress!
                </div>
              ) : (
                progressList.slice(0, 4).map((p) => (
                  <div key={p.course_id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">
                        {p.course_code || p.course_name}
                      </span>
                      <span className="font-mono font-bold text-cyan-300">
                        {p.completed_pct}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300"
                        style={{ width: `${p.completed_pct}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
