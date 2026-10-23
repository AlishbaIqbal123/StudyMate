import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Sun,
  Moon,
  ArrowRight,
  Clock,
  BookOpen,
  ShieldCheck,
  Terminal,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Check,
  Radio,
  Layers,
  Cpu,
  Database,
  Monitor,
  Mic,
  Zap,
} from 'lucide-react';
import { useAuth } from './context/AuthContext.js';
import { useTheme } from './context/ThemeContext.js';
import { simulateVoice } from './api.js';

interface StudyMateHeroProps {
  onOpenDashboard?: () => void;
  onOpenVoice?: () => void;
  onOpenPlanner?: () => void;
  onOpenTelemetry?: () => void;
  onOpenAssignments?: () => void;
}

interface McpToolSpec {
  name: string;
  category: 'Query' | 'Planning' | 'Mutation' | 'Analytics';
  description: string;
  sampleQuery: string;
  responseSummary: string;
  jsonParams: string;
}

const MCP_TOOLS: McpToolSpec[] = [
  {
    name: 'get_tasks',
    category: 'Query',
    description: 'Retrieves pending syllabus coursework, deadlines, priority levels, and estimated completion times.',
    sampleQuery: "Alexa, what's due this week?",
    responseSummary: 'Found 2 assignments due: CS 420 Lab 3 (in 2 days) and Real Analysis Problem Set (Friday).',
    jsonParams: '{\n  "status": "pending",\n  "due_before": "2026-10-31"\n}',
  },
  {
    name: 'create_study_plan',
    category: 'Planning',
    description: 'Calculates dynamic Pomodoro intervals based on weighted assignment deadlines and available time blocks.',
    sampleQuery: 'Alexa, I have 45 minutes tonight. Build me a study plan.',
    responseSummary: 'Generated 45m sprint: 35m CS 420 Distributed Consensus + 10m recovery break.',
    jsonParams: '{\n  "available_minutes": 45,\n  "course": "CS 420: Distributed Systems"\n}',
  },
  {
    name: 'add_task',
    category: 'Mutation',
    description: 'Creates a verified assignment in the student database with natural language date parsing.',
    sampleQuery: 'Alexa, add a task: Finish Operating Systems Lab due Friday.',
    responseSummary: 'Recorded assignment "Finish Operating Systems Lab" for CS 420 (Due Friday, High Priority).',
    jsonParams: '{\n  "title": "Finish Operating Systems Lab",\n  "course": "CS 420",\n  "priority": "high"\n}',
  },
  {
    name: 'get_course_progress',
    category: 'Analytics',
    description: 'Computes semester completion percentages, benchmark velocity, and weekly study hour pacing.',
    sampleQuery: 'Alexa, how am I pacing in Algorithms?',
    responseSummary: 'CS 420 is 68% complete with 4.5 hours logged this week. You are ahead of schedule.',
    jsonParams: '{\n  "course": "CS 420: Distributed Systems"\n}',
  },
  {
    name: 'update_progress',
    category: 'Mutation',
    description: 'Marks assignments complete, logs focused study minutes, and recalibrates remaining workload.',
    sampleQuery: 'Alexa, mark CS 420 lab complete and log 45 minutes.',
    responseSummary: 'Marked "CS 420 Lab 3" done. Logged 45 minutes of active deep focus.',
    jsonParams: '{\n  "task_id": 1,\n  "status": "done",\n  "minutes_spent": 45\n}',
  },
];

export const StudyMateHero: React.FC<StudyMateHeroProps> = ({
  onOpenDashboard,
  onOpenVoice,
  onOpenPlanner,
  onOpenTelemetry,
  onOpenAssignments,
}) => {
  const { openClerkSignIn, isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. Interactive Pomodoro Desk State (Hero Mockup)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(25);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : selectedDuration * 60));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, selectedDuration]);

  const handleSelectSprint = (minutes: number) => {
    setSelectedDuration(minutes);
    setTimerSeconds(minutes * 60);
    setTimerRunning(false);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const mm = m < 10 ? `0${m}` : `${m}`;
    const ss = s < 10 ? `0${s}` : `${s}`;
    return `${mm}:${ss}`;
  };

  // 2. Ambient Web Audio Rain / Brown Noise Synthesizer (Zero-cost, browser native)
  const [ambientActive, setAmbientActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const toggleAmbientSound = () => {
    if (ambientActive) {
      try {
        if (gainNodeRef.current && audioCtxRef.current) {
          gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.2);
          setTimeout(() => {
            noiseSourceRef.current?.disconnect();
            noiseSourceRef.current = null;
          }, 300);
        }
      } catch { }
      setAmbientActive(false);
    } else {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = audioCtxRef.current || new AudioCtxClass();
        audioCtxRef.current = ctx;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.0;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();

        noiseSourceRef.current = noise;
        gainNodeRef.current = gain;
        setAmbientActive(true);
      } catch (err) {
        console.warn('Web Audio Ambient Error:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      try {
        if (noiseSourceRef.current) {
          noiseSourceRef.current.disconnect();
        }
      } catch { }
    };
  }, []);

  // 3. Interactive Alexa+ Voice Simulator
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceResult, setVoiceResult] = useState<{
    query: string;
    response: string;
    tool?: string;
  }>({
    query: "Alexa, what's due this week?",
    response:
      "You have 2 assignments due: CS 420 Lab 3 due in 2 days, and Real Analysis Problem Set due on Friday. I recommend a 45-minute focus session tonight.",
    tool: 'get_tasks',
  });

  const handleRunVoice = async (queryText: string) => {
    setVoiceLoading(true);
    try {
      const res = await simulateVoice(queryText);
      setVoiceResult({
        query: queryText,
        response: res.speechResponse,
        tool: res.intent,
      });

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(res.speechResponse);
        utt.rate = 1.05;
        window.speechSynthesis.speak(utt);
      }
    } catch {
      setVoiceResult({
        query: queryText,
        response:
          'I checked your coursework schedule. CS 420 Lab 3 requires 90 minutes of focused effort.',
        tool: 'get_tasks',
      });
    } finally {
      setVoiceLoading(false);
    }
  };

  // 4. MCP Tools Explorer Tab
  const [selectedMcpTool, setSelectedMcpTool] = useState<McpToolSpec>(MCP_TOOLS[0]);

  return (
    <div
      className={`min-h-screen font-sans antialiased selection:bg-slate-200 dark:selection:bg-slate-800 transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#090B10] text-slate-100' : 'bg-[#F8F9FA] text-slate-900'
      }`}
    >
      {/* 1. Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0E121B]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-2.5 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">
                StudyMate
              </span>
              <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                MCP
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => scrollToSection('workstation')}
              className="hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              Study Desk
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('mcp-protocol')}
              className="hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              MCP Protocol
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('voice-lab')}
              className="hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              Voice Simulator
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('architecture')}
              className="hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              Architecture
            </button>
          </div>

          {/* Right Action Island */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={onOpenDashboard}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Dashboard ({user?.name?.split(' ')[0]})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openClerkSignIn}
                  className="hidden sm:inline-block px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* 2. Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-16 sm:pt-24 pb-12">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-md bg-slate-100 dark:bg-white/[0.05] px-3 py-1 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono text-[11px] font-medium">
              Amazon Alexa+ Track • Model Context Protocol 2025-11-25
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Organize your academic schedule through conversation.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            StudyMate coordinates university courses, schedules timed Pomodoro study sprints, and pairs with physical Amazon Echo hardware via Streamable HTTP. Powered by local SQLite storage with zero third-party tracking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenDashboard}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Open Student Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('voice-lab')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Try Voice Simulator</span>
            </button>
          </div>

          {/* Genuine Trust Pillars */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Local SQLite Storage
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Open MCP Specification
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Streamable HTTP
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> PKCE OAuth Security
            </span>
          </div>
        </div>

        {/* 3. Interactive Academic Workstation (Product In Action) */}
        <div id="workstation" className="mt-14 rounded-xl bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-sm">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                Live Study Desk Preview
              </span>
              <span className="text-[10px] font-mono text-slate-400">• Interactive demo</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                SQLite Ready
              </span>
              <span className="hidden sm:inline text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded border border-slate-200 dark:border-white/10">
                MCP 2025-11-25
              </span>
            </div>
          </div>

          {/* 3-Column Workstation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Column 1: Pomodoro Desk (4 cols) */}
            <div className="lg:col-span-4 p-4 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Pomodoro Desk</span>
                </div>
                <button
                  type="button"
                  onClick={toggleAmbientSound}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition flex items-center gap-1 cursor-pointer ${
                    ambientActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                      : 'bg-white dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10'
                  }`}
                  title="Toggle cozy ambient rain audio"
                >
                  {ambientActive ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                  <span>{ambientActive ? 'Rain Playing' : 'Rain Audio'}</span>
                </button>
              </div>

              {/* Timer Display */}
              <div className="text-center py-2">
                <div className="font-mono text-5xl font-light text-slate-900 dark:text-white tracking-widest tabular-nums">
                  {formatTimer(timerSeconds)}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono uppercase">
                  {timerRunning ? 'Focus Session Active' : '25m Focus Sprint'}
                </p>
              </div>

              {/* Presets */}
              <div className="flex items-center justify-center gap-1.5">
                {[25, 45, 60].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => handleSelectSprint(dur)}
                    className={`px-3 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
                      selectedDuration === dur
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold'
                        : 'bg-white dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                >
                  {timerRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  <span>{timerRunning ? 'Pause' : 'Start Sprint'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSprint(selectedDuration)}
                  className="p-1.5 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Column 2: Upcoming Deadlines Radar (4 cols) */}
            <div className="lg:col-span-4 p-4 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>Coursework Radar</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  3 Upcoming
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-md bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">CS 420: Lab 3</div>
                    <div className="text-[10px] text-slate-500">Distributed consensus • Due in 2d</div>
                  </div>
                  <span className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    HIGH
                  </span>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">MATH 312: Problem Set 4</div>
                    <div className="text-[10px] text-slate-500">Real Analysis • Due Friday</div>
                  </div>
                  <span className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    MED
                  </span>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">BIO 201: Weekly Reading</div>
                    <div className="text-[10px] text-slate-500">Genetics • Due Monday</div>
                  </div>
                  <span className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                    LOW
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenAssignments}
                className="text-xs text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center gap-1 font-medium pt-1 cursor-pointer"
              >
                <span>Open assignments board</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Column 3: Live Voice Simulator Console (4 cols) */}
            <div className="lg:col-span-4 p-4 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                  <Mic className="w-4 h-4 text-slate-500" />
                  <span>Alexa+ Voice Simulation</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Interactive
                </span>
              </div>

              <div className="p-3 rounded-md bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] space-y-2 text-xs leading-relaxed flex-1 flex flex-col justify-center">
                <div className="text-slate-400 text-[10px] font-mono">Student Query:</div>
                <div className="text-slate-900 dark:text-white font-medium">"{voiceResult.query}"</div>
                <div className="text-slate-400 text-[10px] font-mono pt-1">Alexa Response:</div>
                <div className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{voiceResult.response}</div>
              </div>

              {/* Quick Interactive Cue Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "What's due this week?",
                  '45m study session',
                  'CS 420 status',
                ].map((cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => handleRunVoice(cmd)}
                    disabled={voiceLoading}
                    className="px-2.5 py-1 rounded text-[10px] font-mono font-medium bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition cursor-pointer"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The 5 Model Context Protocol Tools Showcase */}
      <section id="mcp-protocol" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-24 border-t border-slate-200 dark:border-white/[0.08]">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Model Context Protocol
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Five deterministic tools. Zero hallucinations.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Alexa+ doesn't guess your grades or deadlines. It executes strongly-typed JSON-RPC tools against your local SQLite database over Streamable HTTP.
          </p>
        </div>

        {/* Interactive Tool Selector Panel */}
        <div className="rounded-xl bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] p-6 space-y-5 shadow-xs">
          {/* Tool Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
            {MCP_TOOLS.map((tool) => (
              <button
                key={tool.name}
                type="button"
                onClick={() => setSelectedMcpTool(tool)}
                className={`px-3 py-1.5 rounded-md font-mono text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  selectedMcpTool.name === tool.name
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold'
                    : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{tool.name}</span>
                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-black/10 dark:bg-white/10">
                  {tool.category}
                </span>
              </button>
            ))}
          </div>

          {/* Selected Tool Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 space-y-3 text-xs">
              <div>
                <span className="font-mono text-[10px] uppercase text-slate-400">
                  MCP Tool Specification • Spec 2025-11-25
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white font-mono mt-0.5">
                  {selectedMcpTool.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                  {selectedMcpTool.description}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] space-y-1.5 font-mono text-[11px]">
                <div className="text-slate-500">Alexa Voice Cue:</div>
                <div className="font-medium text-slate-900 dark:text-white">"{selectedMcpTool.sampleQuery}"</div>
                <div className="text-slate-500 pt-1">Deterministic Output:</div>
                <div className="text-slate-700 dark:text-slate-300">{selectedMcpTool.responseSummary}</div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleRunVoice(selectedMcpTool.sampleQuery)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Test in Simulator</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenTelemetry}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:underline cursor-pointer"
                >
                  View JSON-RPC schema
                </button>
              </div>
            </div>

            {/* Code Payload Inspector */}
            <div className="md:col-span-5 p-3.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800 text-[10px]">
                <span>POST /mcp HTTP/1.1</span>
                <span>200 OK</span>
              </div>
              <pre className="text-emerald-400 leading-relaxed overflow-x-auto">
{`{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "${selectedMcpTool.name}",
    "arguments": ${selectedMcpTool.jsonParams}
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Live Voice Studio Sandbox Section */}
      <section id="voice-lab" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-24 border-t border-slate-200 dark:border-white/[0.08]">
        <div className="rounded-xl bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] p-6 sm:p-10 space-y-6 shadow-xs">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded bg-slate-100 dark:bg-white/[0.05] px-2.5 py-0.5 text-xs text-slate-600 dark:text-slate-300 font-mono">
              <Radio className="w-3 h-3 text-emerald-500" />
              <span>Speech Synthesis & Natural Language Engine</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Speak naturally. StudyMate organizes the rest.
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Test real student prompts. StudyMate resolves speech intents, queries coursework in SQLite, and synthesizes clear spoken feedback.
            </p>
          </div>

          {/* Cue Selector Chips */}
          <div className="space-y-2">
            <span className="text-xs text-slate-500 block font-mono">Select a sample voice query to test live:</span>
            <div className="flex flex-wrap gap-2">
              {[
                "What's due this week?",
                "I have 60 minutes tonight, help me study",
                "Mark CS 420 lab complete",
                "How am I pacing in Algorithms?",
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleRunVoice(prompt)}
                  disabled={voiceLoading}
                  className="px-3 py-1.5 rounded-md text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 transition cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {/* Response Box */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio Synthesis Feedback</span>
              </div>
              <span>Intent: {voiceResult.tool}</span>
            </div>
            <p className="text-slate-900 dark:text-white font-sans text-xs leading-relaxed">
              {voiceLoading ? 'Synthesizing response...' : voiceResult.response}
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={onOpenVoice}
              className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Launch Full Voice Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. System Architecture */}
      <section id="architecture" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-24 border-t border-slate-200 dark:border-white/[0.08]">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            System Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            End-to-end student data sovereignty.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Coursework schedules and study streaks belong exclusively on your hardware. Zero tracking pixels, zero data selling, and open standard interfaces.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-xl bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-2 text-center">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white flex items-center justify-center mx-auto mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Local-First SQLite</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Queries execute locally with sub-millisecond latency and offline autonomy when Wi-Fi is unavailable.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-2 text-center">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Clerk PKCE Security</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Standard PKCE OAuth 2.1 protocol protection for student session tokens and hardware Echo speaker account linking.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-2 text-center">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white flex items-center justify-center mx-auto mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Open MCP 2025-11-25</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Standardized Model Context Protocol exposes structured tools to Alexa+, Claude, or local LLMs safely.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-20 border-t border-slate-200 dark:border-white/[0.08]">
        <div className="rounded-xl bg-slate-900 text-white dark:bg-[#0E121B] dark:border dark:border-white/[0.08] p-8 sm:p-12 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white max-w-xl mx-auto">
            Ready to explore StudyMate?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Get started immediately with the preloaded student sandbox, or sign in to sync with Alexa hardware.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenDashboard}
              className="px-5 py-2.5 rounded-lg text-xs font-medium text-slate-950 bg-white hover:bg-slate-100 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Launch Student Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={openClerkSignIn}
              className="px-5 py-2.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 transition cursor-pointer"
            >
              Sign In Free
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-white/[0.08] text-xs text-slate-500 dark:text-slate-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold">
              <GraduationCap className="w-4 h-4" />
              <span>StudyMate</span>
            </div>
            <p className="text-xs leading-relaxed">
              Voice-first academic intelligence powered by Amazon Alexa+ and Model Context Protocol.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="font-mono uppercase text-[10px] text-slate-400 font-semibold">Workspace</div>
            <div className="space-y-1">
              <button type="button" onClick={onOpenDashboard} className="block hover:text-slate-900 dark:hover:text-white cursor-pointer">Dashboard</button>
              <button type="button" onClick={onOpenAssignments} className="block hover:text-slate-900 dark:hover:text-white cursor-pointer">Assignments</button>
              <button type="button" onClick={onOpenPlanner} className="block hover:text-slate-900 dark:hover:text-white cursor-pointer">Study Planner</button>
              <button type="button" onClick={onOpenVoice} className="block hover:text-slate-900 dark:hover:text-white cursor-pointer">Voice Console</button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="font-mono uppercase text-[10px] text-slate-400 font-semibold">Technology</div>
            <div className="space-y-1 font-mono text-[11px]">
              <div>Model Context Protocol (MCP)</div>
              <div>Streamable HTTP /mcp</div>
              <div>Amazon Alexa+ Skill Add-on</div>
              <div>Offline SQLite Database</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="font-mono uppercase text-[10px] text-slate-400 font-semibold">Hackathon Demo</div>
            <div className="space-y-1">
              <button type="button" onClick={onOpenTelemetry} className="block hover:text-slate-900 dark:hover:text-white cursor-pointer">System Diagnostics</button>
              <button type="button" onClick={openClerkSignIn} className="block hover:text-slate-900 dark:hover:text-white cursor-pointer">Clerk Auth</button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono">
          <span>© 2026 StudyMate • Open Source Academic Add-on</span>
          <div className="flex items-center gap-3">
            <span>Local SQLite</span>
            <span>•</span>
            <span>MCP 2025-11-25</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudyMateHero;
