import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import { KpiCards } from '../components/KpiCards.js';
import { simulateVoice, getActiveStudent } from '../api.js';
import { usePomodoro } from '../context/PomodoroContext.js';
import { useAuth } from '../context/AuthContext.js';
import { AuthGate } from '../components/AuthGate.js';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition.js';
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

  const {
    isListening,
    audioLevel,
    speechError,
    toggleListening,
  } = useVoiceRecognition({
    onTranscriptChange: (text) => setVoiceQuery(text),
    onFinalTranscript: (finalText) => {
      handleQuickPrompt(finalText);
    },
    autoSubmitOnEnd: true,
  });

  const pendingTasks = tasks.filter((t) => t.status !== 'done');
  const recentTasks = pendingTasks.slice(0, 5);

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'high':
        return (
          <span className="font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-[#FDA769] text-white uppercase tracking-wider shadow-2xs">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEC868] text-[#473C33] uppercase tracking-wider shadow-2xs">
            MED
          </span>
        );
      case 'low':
        return (
          <span className="font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-[#ABC270] text-white uppercase tracking-wider shadow-2xs">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Guest Mode Notification Banner */}
      {isPreview && (
        <div className="rounded-2xl p-4 bg-[#F5F2E8] dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] uppercase font-semibold text-[#586738] dark:text-[#ABC270]">
              Demo Sandbox
            </span>
            <p className="text-[#473C33] dark:text-[#E0D6C8]">
              You are using StudyMate with local sample coursework. Sign in with a student account to sync across devices and pair physical Alexa hardware.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openClerkSignIn}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] transition cursor-pointer shadow-xs"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={openClerkSignUp}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#473C33] dark:text-[#FAF8F1] bg-white dark:bg-[#393028] hover:bg-[#FAF8F1] dark:hover:bg-[#473C33] border border-[#E6E0D0] dark:border-[#FEC868]/20 transition cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* 1. Welcoming Sage Green Hero Banner (Palette 18 Header Card) */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-[#839758] to-[#ABC270] text-white border border-[#839758]/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/80 font-semibold bg-black/15 px-2.5 py-0.5 rounded-full">
            {isPreview ? 'Academic Sandbox' : 'Student Overview'}
          </span>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mt-2">
            {isPreview ? 'StudyMate Academic Hub' : `Welcome back, ${studentFirstName}`}
          </h1>
          <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-xl">
            {pendingTasks.length > 0 ? (
              <>
                You have <strong className="font-semibold text-[#FEC868] underline decoration-[#FEC868]/60 underline-offset-2">{pendingTasks.length} pending assignments</strong>. Check deadlines below or start a 25-minute Pomodoro focus sprint.
              </>
            ) : (
              'All coursework is currently up to date. Add a new assignment or start a study sprint.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#473C33] bg-[#FEC868] hover:bg-[#FFD482] transition flex items-center gap-2 cursor-pointer active:scale-95 shadow-md"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Assignment</span>
          </button>
          <button
            onClick={() => onNavigateToScreen('planner')}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-white bg-black/20 hover:bg-black/30 border border-white/25 transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Open Planner</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <KpiCards tasks={tasks} courses={courses} progressList={progressList} />

      {/* 3. Alexa+ Assistant Command Box */}
      <div className="rounded-2xl p-5 bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
                isListening
                  ? 'bg-[#FDA769] text-white animate-pulse'
                  : 'bg-[#FDA769]/20 text-[#E0712A] dark:text-[#FDA769] hover:bg-[#FDA769]/35'
              }`}
              title={isListening ? 'Stop listening' : 'Click to speak via microphone'}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#473C33] dark:text-[#FAF8F1]">
              Alexa+ Voice Assistant
            </h3>
            {isListening && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FDA769]/25 text-[#944519] dark:text-[#FDA769] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FDA769] animate-ping" />
                Listening ({audioLevel}%)
              </span>
            )}
          </div>
          <button
            onClick={() => onNavigateToScreen('voice')}
            className="text-xs font-semibold text-[#586738] hover:text-[#473C33] dark:text-[#ABC270] dark:hover:text-[#FEC868] flex items-center space-x-1 cursor-pointer transition"
          >
            <span>Full Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {speechError && (
          <div className="p-2.5 rounded-xl bg-[#FDA769]/20 border border-[#FDA769]/40 text-[#944519] dark:text-[#FDA769] text-xs flex items-center space-x-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Natural Language Prompt Input with Live Mic Button */}
        <form onSubmit={handleVoiceSubmit} className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-[#FDA769] text-white border-[#FDA769] shadow-sm'
                : 'bg-[#FAF8F1] dark:bg-[#393028] border-[#E6E0D0] dark:border-[#FEC868]/15 text-[#473C33] dark:text-[#FAF8F1] hover:bg-[#EAE5D5]'
            }`}
            title={isListening ? 'Stop microphone' : 'Speak query via microphone'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#FDA769]" />}
          </button>

          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={voiceQuery}
              onChange={(e) => setVoiceQuery(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening to your microphone... speak now'
                  : "Ask Alexa anything (e.g. 'What is due this week?' or click Mic to speak)"
              }
              className="w-full pl-3.5 pr-20 py-2.5 text-xs rounded-xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 text-[#473C33] dark:text-[#FAF8F1] placeholder-[#87796B] dark:placeholder-[#A3907E] focus:outline-none focus:border-[#ABC270] transition"
            />
            <button
              type="submit"
              disabled={voiceLoading}
              className="absolute right-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {voiceLoading ? 'Checking...' : 'Ask'}
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
          <span className="text-[11px] text-[#87796B] dark:text-[#A3907E] mr-1">Try:</span>
          {[
            "What's due this week?",
            "I have 45 minutes, help me study",
            "How am I doing in Operating Systems?",
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleQuickPrompt(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#F5F2E8] hover:bg-[#FEC868]/30 text-[#473C33] dark:bg-[#393028] dark:text-[#E0D6C8] dark:hover:bg-[#FEC868]/20 border border-[#E6E0D0] dark:border-[#FEC868]/15 transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* AI Voice Response Notification */}
        {voiceResponse && (
          <div className="p-3.5 rounded-xl bg-[#ABC270]/15 dark:bg-[#ABC270]/10 border border-[#ABC270]/35 text-xs flex items-start space-x-2.5 mt-2 animate-fadeIn">
            <Volume2 className="w-4 h-4 text-[#586738] dark:text-[#ABC270] shrink-0 mt-0.5" />
            <div className="flex-1 text-[#473C33] dark:text-[#FAF8F1] leading-relaxed">
              <span className="font-semibold text-[#586738] dark:text-[#ABC270]">Alexa: </span>
              {voiceResponse}
            </div>
          </div>
        )}
      </div>

      {/* 4. Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Priority Assignments (7 cols) - Styled like "Today" timeline in reference image */}
        <div className="lg:col-span-7 rounded-2xl p-5 bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E0D0] dark:border-[#FEC868]/15">
            <div>
              <h2 className="text-sm font-semibold text-[#473C33] dark:text-[#FAF8F1] tracking-tight">
                Today & Upcoming Coursework
              </h2>
              <p className="text-xs text-[#7A6C5E] dark:text-[#C2B2A1]">
                Active assignments scheduled for completion
              </p>
            </div>
            <button
              onClick={() => onNavigateToScreen('assignments')}
              className="text-xs font-semibold text-[#586738] hover:text-[#473C33] dark:text-[#ABC270] dark:hover:text-[#FEC868] flex items-center space-x-1 cursor-pointer"
            >
              <span>View All ({tasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTasks.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl bg-[#FAF8F1] dark:bg-[#393028]/50 border border-dashed border-[#DFD8C4] dark:border-[#FEC868]/20 flex flex-col items-center justify-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-[#ABC270]" />
                <p className="text-xs font-medium text-[#473C33] dark:text-[#FAF8F1]">No pending tasks</p>
                <p className="text-[11px] text-[#7A6C5E] dark:text-[#C2B2A1]">All recorded assignments are completed.</p>
                <button
                  onClick={onOpenAddModal}
                  className="mt-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] transition cursor-pointer"
                >
                  Add Assignment
                </button>
              </div>
            ) : (
              recentTasks.map((task, idx) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 hover:border-[#ABC270] transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => onToggleStatus(task.id, task.status)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition shrink-0 cursor-pointer ${
                        idx % 2 === 0
                          ? 'border-[#FDA769] text-[#FDA769] hover:bg-[#FDA769] hover:text-white'
                          : 'border-[#ABC270] text-[#ABC270] hover:bg-[#ABC270] hover:text-white'
                      }`}
                      title="Mark complete"
                    >
                      <span className={`w-2 h-2 rounded-full ${idx % 2 === 0 ? 'bg-[#FDA769]' : 'bg-[#ABC270]'}`} />
                    </button>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#473C33] dark:text-[#FAF8F1] truncate">
                        {task.title}
                      </div>
                      <div className="text-[10px] font-mono text-[#7A6C5E] dark:text-[#C2B2A1] flex items-center space-x-2 mt-0.5">
                        <span className="font-medium text-[#586738] dark:text-[#ABC270]">
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
                      className="px-2.5 py-1 text-[10px] font-semibold text-[#473C33] bg-[#FEC868]/35 hover:bg-[#FEC868] dark:text-[#FEC868] dark:bg-[#FEC868]/15 dark:hover:bg-[#FEC868] dark:hover:text-[#473C33] border border-[#FEC868]/50 rounded-full transition cursor-pointer"
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
          <div className="rounded-2xl p-5 bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E0D0] dark:border-[#FEC868]/15">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#839758] dark:text-[#ABC270]" />
                <h3 className="text-sm font-semibold text-[#473C33] dark:text-[#FAF8F1] tracking-tight">
                  Focus Timer
                </h3>
              </div>
              <button
                onClick={() => onNavigateToScreen('planner')}
                className="text-xs font-semibold text-[#586738] hover:text-[#473C33] dark:text-[#ABC270] dark:hover:text-[#FEC868] flex items-center space-x-1 cursor-pointer"
              >
                <span>Full Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-center py-2 space-y-3">
              <div className="font-mono text-5xl font-light text-[#473C33] dark:text-[#FAF8F1] tracking-widest tabular-nums">
                {formatTime(secondsRemaining)}
              </div>
              <p className="text-[11px] font-mono text-[#7A6C5E] dark:text-[#C2B2A1] uppercase tracking-wider">
                {timerRunning ? 'Focus Session Active' : 'Ready for Focus Sprint'}
              </p>

              <div className="flex items-center justify-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] transition flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
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
                  className="p-2 rounded-xl text-[#63574B] hover:text-[#473C33] bg-[#F5F2E8] hover:bg-[#EAE5D5] dark:text-[#C2B2A1] dark:hover:text-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 transition cursor-pointer"
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
            <div className="rounded-2xl p-5 bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E0D0] dark:border-[#FEC868]/15">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-[#839758] dark:text-[#ABC270]" />
                  <h3 className="text-sm font-semibold text-[#473C33] dark:text-[#FAF8F1] tracking-tight">
                    Course Pacing
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#87796B]">Semester 1</span>
              </div>

              <div className="space-y-3 pt-1">
                {progressList.length === 0 ? (
                  <div className="py-4 text-center text-xs text-[#7A6C5E] font-mono">
                    No course progress recorded yet.
                  </div>
                ) : (
                  progressList.slice(0, 4).map((p, idx) => (
                    <div key={p.course_id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#473C33] dark:text-[#FAF8F1]">
                          {p.course_code || p.course_name}
                        </span>
                        <span className="font-mono font-semibold text-[#586738] dark:text-[#ABC270]">
                          {p.completed_pct}%
                        </span>
                      </div>
                      <div className="w-full bg-[#F5F2E8] dark:bg-[#393028] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            idx % 3 === 0
                              ? 'bg-[#ABC270]'
                              : idx % 3 === 1
                              ? 'bg-[#FEC868]'
                              : 'bg-[#FDA769]'
                          }`}
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
