import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Terminal,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Radio,
  Calendar,
  Clock,
  Layers,
  Code2,
  Play,
  Check,
  Flame,
  BookOpen,
  ChevronRight,
  Target,
  BarChart3,
} from 'lucide-react';
import { simulateVoice, type VoiceSimulationResponse } from '../../api.js';

interface VoiceSimulatorSectionProps {
  currentPrompt: string;
  onPromptChange: (text: string) => void;
  onOpenDashboard: () => void;
}

export const VoiceSimulatorSection: React.FC<VoiceSimulatorSectionProps> = ({
  currentPrompt,
  onPromptChange,
  onOpenDashboard,
}) => {
  const [response, setResponse] = useState<VoiceSimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const handleToggleMic = () => {
    setMicError(null);
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Microphone speech recognition is not supported in this browser.');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      rec.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        onPromptChange(text);
      };

      rec.onerror = (e: any) => {
        if (e.error === 'not-allowed') {
          setMicError('Microphone permission denied.');
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setMicError('Failed to access microphone.');
      setIsListening(false);
    }
  };

  const handleSimulate = async () => {
    if (!currentPrompt.trim()) return;
    setIsLoading(true);
    setIsPlayingAudio(true);
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
    try {
      const res = await simulateVoice(currentPrompt);
      setResponse(res);
      setTimeout(() => setIsPlayingAudio(false), 2500);
    } catch {
      setIsPlayingAudio(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isRecommendation = Boolean(
    response?.data &&
      typeof response.data === 'object' &&
      'actionType' in (response.data as Record<string, any>) &&
      (response.data as any).actionType === 'recommendation'
  );

  const isAcademicAdvice = Boolean(
    response?.data &&
      typeof response.data === 'object' &&
      (response.data as any).actionType === 'academic_advice'
  );

  const isTimerStarted = Boolean(
    response?.data &&
      typeof response.data === 'object' &&
      (response.data as any).action === 'start_timer'
  );

  const isTaskList = Boolean(
    Array.isArray(response?.data) &&
      response.data.length > 0 &&
      'title' in (response.data[0] as Record<string, any>)
  );

  const isStudyPlan = Boolean(
    response?.data &&
      typeof response.data === 'object' &&
      'blocks' in (response.data as Record<string, any>)
  );

  const isProgressList = Boolean(
    Array.isArray(response?.data) &&
      response.data.length > 0 &&
      'completed_pct' in (response.data[0] as Record<string, any>)
  );

  return (
    <section id="voice-demo" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Interactive Voice Dialogue</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Structured, User-Friendly Voice Responses
        </h2>
        <p className="text-slate-300 text-base sm:text-lg">
          Ask questions naturally. StudyMate translates speech into structured visual cards,
          actionable next steps, and Pomodoro study plans.
        </p>
      </div>

      {/* Main Glassmorphic Interactive Console */}
      <div className="max-w-4xl mx-auto glass-panel-glow rounded-3xl p-6 sm:p-10 relative overflow-hidden border border-slate-700/60 shadow-2xl">
        {/* Top Header & Equalizer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white">Alexa+ Voice Interface</span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Live MCP Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">Contextual academic assistant with structured visual feedback</p>
            </div>
          </div>

          {/* Equalizer Visualizer */}
          <div className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 self-start sm:self-auto">
            <Volume2 className={`w-4 h-4 mr-1.5 ${isPlayingAudio ? 'text-cyan-400 animate-bounce' : 'text-slate-500'}`} />
            <span className={`w-1 h-3 bg-cyan-500 rounded-full ${isPlayingAudio ? 'eq-anim-bar' : 'h-1.5'}`} style={{ animationDelay: '0.1s' }} />
            <span className={`w-1 h-5 bg-sky-400 rounded-full ${isPlayingAudio ? 'eq-anim-bar' : 'h-2'}`} style={{ animationDelay: '0.3s' }} />
            <span className={`w-1 h-7 bg-cyan-300 rounded-full ${isPlayingAudio ? 'eq-anim-bar' : 'h-1.5'}`} style={{ animationDelay: '0.2s' }} />
            <span className={`w-1 h-4 bg-indigo-400 rounded-full ${isPlayingAudio ? 'eq-anim-bar' : 'h-2.5'}`} style={{ animationDelay: '0.4s' }} />
            <span className={`w-1 h-6 bg-cyan-400 rounded-full ${isPlayingAudio ? 'eq-anim-bar' : 'h-1.5'}`} style={{ animationDelay: '0.15s' }} />
            <span className="text-[10px] font-mono font-bold text-cyan-300 ml-2">
              {isPlayingAudio ? 'Speaking...' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Listening banner */}
        {isListening && (
          <div className="mt-4 p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between animate-pulse">
            <span className="flex items-center space-x-2 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>Listening to your voice... Speak your question now!</span>
            </span>
            <button
              onClick={handleToggleMic}
              className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white font-mono text-[10px] font-bold transition cursor-pointer"
            >
              Stop
            </button>
          </div>
        )}

        {micError && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
            {micError}
          </div>
        )}

        {/* Input Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={currentPrompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="e.g. what should i do next ? or I have 60 minutes tonight..."
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-2xl pl-5 pr-14 py-4 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium"
              onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
            />
            <button
              type="button"
              onClick={handleToggleMic}
              className={`absolute right-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                  : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-900'
              }`}
              title={isListening ? 'Stop listening' : 'Speak into microphone'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>

          <button
            onClick={handleSimulate}
            disabled={isLoading || !currentPrompt.trim()}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-cyan-200" />
                <span>Ask StudyMate</span>
              </>
            )}
          </button>
        </div>

        {/* Formatted Response Area */}
        {response ? (
          <div className="mt-8 space-y-5 animate-in fade-in slide-in-from-top-3 duration-300">
            {/* 1. Conversational Speech Bubble */}
            <div className="bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-6 shadow-xl relative">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Alexa+ Voice Synthesis</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
                    tool: {response.tool}
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
                    intent: {response.intent}
                  </span>
                </div>
              </div>

              {/* Styled Dialogue Quote */}
              <div className="pl-4 border-l-2 border-cyan-400/80 my-2">
                <p className="text-slate-100 text-base sm:text-lg font-medium leading-relaxed">
                  "{response.speechResponse}"
                </p>
              </div>
            </div>

            {/* 2. Structured Visual Cards Based on Intent */}

            {/* CASE A: Smart Next Step Recommendation ("what should i do next?") */}
            {isRecommendation && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold font-mono uppercase tracking-wider text-amber-400">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>AI Academic Recommendation</span>
                </div>

                <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 hover:border-amber-500/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[11px] font-mono uppercase font-bold text-amber-400 block mb-1">
                        Top Urgent Priority
                      </span>
                      <h4 className="text-lg font-bold text-white">
                        {(response.data as any).topTask?.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Course: <span className="text-slate-200 font-medium">{(response.data as any).topTask?.course_name}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold uppercase">
                        High Priority
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
                        Due {(response.data as any).topTask?.due_date}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-300 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Suggested Focus Time: <strong>45 minutes</strong></span>
                    </span>

                    <button
                      onClick={onOpenDashboard}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 cursor-pointer transition-all"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start 45m Focus Block</span>
                    </button>
                  </div>
                </div>

                {/* Secondary Tasks */}
                {Boolean((response.data as any).otherPending?.length > 0) && (
                  <div className="pt-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                      Upcoming Next in Pipeline:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(response.data as any).otherPending.map((t: any) => (
                        <div
                          key={t.id}
                          className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
                        >
                          <div className="truncate mr-2">
                            <span className="font-semibold text-slate-200 block truncate">{t.title}</span>
                            <span className="text-[10px] text-cyan-400 truncate">{t.course_name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">Due {t.due_date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CASE B: Tasks List (CheckTasksIntent or Array of Tasks) */}
            {isTaskList && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold font-mono uppercase tracking-wider text-cyan-400">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>Synchronized Assignments ({(response.data as any[]).length})</span>
                  </div>
                  <button
                    onClick={onOpenDashboard}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Manage on Board</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(response.data as any[]).slice(0, 4).map((task: any) => (
                    <div
                      key={task.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {task.course_name || 'Course'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                              task.priority === 'high'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {task.priority || 'medium'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white truncate">{task.title}</h4>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <div className="text-right text-xs">
                          <span className="text-slate-400 block text-[10px]">Due Date</span>
                          <span className="font-semibold text-slate-200 font-mono">{task.due_date || 'Upcoming'}</span>
                        </div>

                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            task.status === 'done' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CASE C: Study Plan Timeline */}
            {isStudyPlan && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold font-mono uppercase tracking-wider text-purple-400">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>Focus Plan Timeline ({(response.data as any).available_minutes} Mins)</span>
                  </div>

                  <button
                    onClick={onOpenDashboard}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center space-x-1 cursor-pointer hover:bg-purple-500/30 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Launch in Planner</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(response.data as any).blocks?.map((block: any) => (
                    <div
                      key={block.order}
                      className={`p-4 rounded-xl border flex flex-col justify-between ${
                        block.type === 'study'
                          ? 'bg-slate-900/90 border-cyan-500/30'
                          : 'bg-slate-950 border-purple-500/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono font-bold mb-2">
                          <span className={block.type === 'study' ? 'text-cyan-400' : 'text-purple-400'}>
                            {block.type === 'study' ? 'Deep Focus Interval' : 'Recovery Break'}
                          </span>
                          <span className="text-slate-400">{block.duration_minutes}m</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          {block.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                        Step 0{block.order} of {(response.data as any).blocks.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CASE D: Course Progress Analytics */}
            {isProgressList && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span>Enrolled Course Velocity</span>
                  </div>
                  <button
                    onClick={onOpenDashboard}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Full Analytics</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(response.data as any[]).map((c: any) => (
                    <div
                      key={c.id || c.course_id}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate max-w-[200px]">{c.course_name}</span>
                        <span className="font-mono font-bold text-cyan-400">{c.completed_pct}%</span>
                      </div>

                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${c.completed_pct}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                        <span>{c.completed_tasks || 2} of {c.total_tasks || 3} tasks done</span>
                        <span>{c.hours_this_week || 4} hrs studied this week</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CASE E: Pomodoro Session Active / Started */}
            {isTimerStarted && (
              <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Pomodoro Timer Initialized</span>
                </div>

                <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">
                      {(response.data as any).course || 'Deep Work Session'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Interval 1: <span className="text-emerald-400 font-bold">{(response.data as any).duration_minutes || 25} minutes</span> on the clock.
                    </p>
                  </div>

                  <button
                    onClick={onOpenDashboard}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md flex items-center space-x-2 cursor-pointer transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Open Timer in Dashboard</span>
                  </button>
                </div>
              </div>
            )}

            {/* CASE F: Academic Guidance & Concept Tutoring */}
            {isAcademicAdvice && (
              <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold font-mono uppercase tracking-wider text-cyan-400">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>{(response.data as any).topic || 'Academic Guidance & Study Strategy'}</span>
                </div>

                {(response.data as any).keyPoints && (
                  <div className="space-y-2">
                    {(response.data as any).keyPoints.map((point: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 flex items-start space-x-2.5"
                      >
                        <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions & JSON Drawer */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => setShowJson(!showJson)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showJson ? 'Hide Execution Payload' : 'Inspect JSON-RPC Execution Payload'}</span>
              </button>

              <button
                onClick={onOpenDashboard}
                className="text-xs font-bold text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>Open in Student Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Raw JSON Code Drawer */}
            {showJson && (
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-64 leading-relaxed">
                {JSON.stringify(
                  {
                    tool: response.tool,
                    intent: response.intent,
                    arguments: response.arguments,
                    data: response.data,
                  },
                  null,
                  2
                )}
              </pre>
            )}
          </div>
        ) : (
          <div className="mt-8 bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 text-center text-slate-400 text-sm flex items-center justify-center space-x-3">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Click any quick phrase above or enter your question to see the structured response.</span>
          </div>
        )}
      </div>
    </section>
  );
};
