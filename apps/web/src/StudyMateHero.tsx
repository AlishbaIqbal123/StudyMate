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
  MicOff,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useAuth } from './context/AuthContext.js';
import { useTheme } from './context/ThemeContext.js';
import { simulateVoice } from './api.js';
import { WorkflowAccordion } from './components/WorkflowAccordion.js';
import { FeatureCarousel } from './components/FeatureCarousel.js';
import { CobaltBentoHighlights } from './components/CobaltBentoHighlights.js';
import { HeroWavesBackground } from './components/HeroWavesBackground.js';
import { useVoiceRecognition } from './hooks/useVoiceRecognition.js';

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
  const [customVoiceInput, setCustomVoiceInput] = useState('');
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
    if (!queryText.trim()) return;
    setVoiceLoading(true);
    try {
      const res = await simulateVoice(queryText.trim());
      setVoiceResult({
        query: queryText.trim(),
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
        query: queryText.trim(),
        response:
          'I checked your coursework schedule. CS 420 Lab 3 requires 90 minutes of focused effort.',
        tool: 'get_tasks',
      });
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
    onTranscriptChange: (text) => {
      setCustomVoiceInput(text);
      if (text) {
        setVoiceResult((prev) => ({ ...prev, query: text }));
      }
    },
    onFinalTranscript: (finalText) => {
      setCustomVoiceInput('');
      handleRunVoice(finalText);
    },
    autoSubmitOnEnd: true,
  });

  // 4. MCP Tools Explorer Tab
  const [selectedMcpTool, setSelectedMcpTool] = useState<McpToolSpec>(MCP_TOOLS[0]);

  return (
    <div
      className={`min-h-screen font-sans antialiased selection:bg-[#FEC868]/40 dark:selection:bg-[#ABC270]/30 transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#231D19] text-[#FAF8F1]' : 'bg-[#FAF8F1] text-[#473C33]'
      }`}
    >
      {/* 1. Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#2E2620]/95 backdrop-blur-md border-b border-[#E6E0D0] dark:border-[#FEC868]/15">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-2.5 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#ABC270] text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-sm tracking-tight text-[#473C33] dark:text-[#FAF8F1]">
                StudyMate
              </span>
              <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#ABC270]/20 text-[#586738] dark:text-[#ABC270] border border-[#ABC270]/35 font-semibold">
                MCP
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-xs font-medium text-[#63574B] dark:text-[#C2B2A1]">
            <button
              type="button"
              onClick={() => scrollToSection('workstation')}
              className="hover:text-[#473C33] dark:hover:text-[#FAF8F1] transition cursor-pointer"
            >
              Study Desk
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('workflows')}
              className="hover:text-[#473C33] dark:hover:text-[#FAF8F1] transition cursor-pointer"
            >
              Workflows
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('suite')}
              className="hover:text-[#473C33] dark:hover:text-[#FAF8F1] transition cursor-pointer"
            >
              App Suite
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('highlights')}
              className="hover:text-[#473C33] dark:hover:text-[#FAF8F1] transition cursor-pointer"
            >
              Highlights
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('mcp-protocol')}
              className="hover:text-[#473C33] dark:hover:text-[#FAF8F1] transition cursor-pointer"
            >
              MCP Protocol
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('architecture')}
              className="hover:text-[#473C33] dark:hover:text-[#FAF8F1] transition cursor-pointer"
            >
              Architecture
            </button>
          </div>

          {/* Right Action Island */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-[#63574B] hover:text-[#473C33] dark:text-[#C2B2A1] dark:hover:text-white hover:bg-[#F5F2E8] dark:hover:bg-[#393028] transition cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FEC868]" /> : <Moon className="w-4 h-4 text-[#473C33]" />}
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={onOpenDashboard}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Dashboard ({user?.name?.split(' ')[0]})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openClerkSignIn}
                  className="hidden sm:inline-block px-3 py-1.5 rounded-lg text-xs font-medium text-[#63574B] hover:text-[#473C33] dark:text-[#C2B2A1] dark:hover:text-white hover:bg-[#F5F2E8] dark:hover:bg-[#393028] transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* 2. Hero Section with Multi-Layered Palette 18 Waves */}
      <section className="relative overflow-hidden border-b border-[#E6E0D0]/80 dark:border-[#FEC868]/15">
        {/* Interactive Canvas + Layered SVG Waves */}
        <HeroWavesBackground voiceActive={voiceLoading || timerRunning} />

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-14 sm:pt-20 pb-16 sm:pb-20">
          {/* Floating Desktop Ambient Accent Chips */}
          <div className="hidden xl:flex items-center gap-2.5 absolute top-20 left-8 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-[#2E2620]/90 backdrop-blur-md border border-[#ABC270]/50 shadow-md">
            <div className="w-8 h-8 rounded-xl bg-[#ABC270] text-white flex items-center justify-center shadow-2xs">
              <Mic className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#586738] dark:text-[#ABC270] font-bold">
                Voice Sync Active
              </div>
              <div className="text-xs font-semibold text-[#473C33] dark:text-[#FAF8F1]">
                "Alexa, start 45m sprint"
              </div>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2.5 absolute top-24 right-8 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-[#2E2620]/90 backdrop-blur-md border border-[#FEC868]/60 shadow-md">
            <div className="w-8 h-8 rounded-xl bg-[#FDA769] text-white flex items-center justify-center shadow-2xs">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#944519] dark:text-[#FDA769] font-bold">
                Zero Cloud Lock-In
              </div>
              <div className="text-xs font-semibold text-[#473C33] dark:text-[#FAF8F1]">
                Local SQLite • 0.4ms
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 dark:bg-[#2E2620]/90 backdrop-blur-sm px-4 py-1.5 border border-[#ABC270]/60 text-[#45512C] dark:text-[#ABC270] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#839758] dark:bg-[#ABC270] animate-pulse" />
              <span className="font-mono text-[11px] font-semibold">
                Amazon Alexa+ Track • Model Context Protocol 2025-11-25
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#473C33] dark:text-[#FAF8F1] leading-[1.1]">
              Organize your academic schedule{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[#586738] via-[#839758] to-[#D97236] dark:from-[#ABC270] dark:via-[#FEC868] dark:to-[#FDA769] bg-clip-text text-transparent">
                  through conversation.
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#FEC868] dark:text-[#ABC270]/70"
                  viewBox="0 0 300 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 9C75 2 145 11 297 4"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#5C5044] dark:text-[#D6CEBF] leading-relaxed max-w-2xl mx-auto font-medium">
              StudyMate coordinates university courses, schedules timed Pomodoro study sprints, and pairs with physical Amazon Echo hardware via Streamable HTTP. Powered by local SQLite storage with zero third-party tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={onOpenDashboard}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl text-xs font-bold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] border border-[#E5AE4E] transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FEC868]/25 active:scale-95"
              >
                <span>Open Student Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('voice-lab')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold text-[#473C33] dark:text-[#FAF8F1] bg-white/95 dark:bg-[#2E2620]/95 hover:bg-[#FAF8F1] dark:hover:bg-[#393028] border border-[#D8D0BE] dark:border-[#FEC868]/25 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm backdrop-blur-sm"
              >
                <Mic className="w-4 h-4 text-[#FDA769]" />
                <span>Try Voice Simulator</span>
              </button>
            </div>

            {/* Genuine Trust Pillars */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-[#473C33] dark:text-[#E0D6C8] font-mono">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/75 dark:bg-[#2E2620]/80 border border-[#E6E0D0] dark:border-white/10 backdrop-blur-xs">
                <Check className="w-3.5 h-3.5 text-[#839758] dark:text-[#ABC270]" /> Local SQLite Storage
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/75 dark:bg-[#2E2620]/80 border border-[#E6E0D0] dark:border-white/10 backdrop-blur-xs">
                <Check className="w-3.5 h-3.5 text-[#839758] dark:text-[#ABC270]" /> Open MCP Specification
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/75 dark:bg-[#2E2620]/80 border border-[#E6E0D0] dark:border-white/10 backdrop-blur-xs">
                <Check className="w-3.5 h-3.5 text-[#839758] dark:text-[#ABC270]" /> Streamable HTTP
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/75 dark:bg-[#2E2620]/80 border border-[#E6E0D0] dark:border-white/10 backdrop-blur-xs">
                <Check className="w-3.5 h-3.5 text-[#839758] dark:text-[#ABC270]" /> PKCE OAuth Security
              </span>
            </div>
          </div>

          {/* 3. Interactive Academic Workstation (Product In Action) */}
          <div
            id="workstation"
            className="mt-12 sm:mt-14 rounded-3xl bg-white/95 dark:bg-[#2E2620]/95 backdrop-blur-md border-2 border-[#E6E0D0] dark:border-[#FEC868]/20 overflow-hidden shadow-2xl shadow-[#473C33]/10"
          >
          {/* Top Bar (Sage Green Header like Reference Image) */}
          <div className="px-6 py-4 bg-gradient-to-r from-[#839758] to-[#ABC270] text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-semibold text-white">
                Live Study Desk Preview
              </span>
              <span className="text-[10px] font-mono text-white/80">• Interactive demo</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-[#473C33] bg-[#FEC868] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#473C33]" />
                SQLite Ready
              </span>
              <span className="hidden sm:inline text-white bg-black/20 px-2.5 py-0.5 rounded-full border border-white/20">
                MCP 2025-11-25
              </span>
            </div>
          </div>

          {/* 3-Column Workstation Grid */}
          <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Column 1: Pomodoro Desk (4 cols) */}
            <div className="lg:col-span-4 p-4 rounded-2xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#473C33] dark:text-[#FAF8F1]">
                  <Clock className="w-4 h-4 text-[#839758] dark:text-[#ABC270]" />
                  <span>Pomodoro Desk</span>
                </div>
                <button
                  type="button"
                  onClick={toggleAmbientSound}
                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border transition flex items-center gap-1 cursor-pointer ${
                    ambientActive
                      ? 'bg-[#ABC270] text-white border-[#839758] font-semibold'
                      : 'bg-white dark:bg-[#2E2620] text-[#63574B] dark:text-[#C2B2A1] border-[#E6E0D0] dark:border-[#FEC868]/15'
                  }`}
                  title="Toggle cozy ambient rain audio"
                >
                  {ambientActive ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                  <span>{ambientActive ? 'Rain Playing' : 'Rain Audio'}</span>
                </button>
              </div>

              {/* Timer Display */}
              <div className="text-center py-2">
                <div className="font-mono text-5xl font-light text-[#473C33] dark:text-[#FAF8F1] tracking-widest tabular-nums">
                  {formatTimer(timerSeconds)}
                </div>
                <p className="text-[11px] text-[#7A6C5E] dark:text-[#C2B2A1] mt-2 font-mono uppercase">
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
                    className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition cursor-pointer ${
                      selectedDuration === dur
                        ? 'bg-[#ABC270] text-white font-semibold shadow-2xs'
                        : 'bg-white dark:bg-[#2E2620] text-[#63574B] dark:text-[#C2B2A1] border border-[#E6E0D0] dark:border-[#FEC868]/15'
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
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                >
                  {timerRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  <span>{timerRunning ? 'Pause' : 'Start Sprint'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSprint(selectedDuration)}
                  className="p-2 rounded-xl bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 text-[#63574B] dark:text-[#C2B2A1] hover:text-[#473C33] dark:hover:text-white transition cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Column 2: Upcoming Deadlines Radar (4 cols) */}
            <div className="lg:col-span-4 p-4 rounded-2xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#473C33] dark:text-[#FAF8F1]">
                  <BookOpen className="w-4 h-4 text-[#FDA769]" />
                  <span>Coursework Radar</span>
                </div>
                <span className="text-[10px] font-mono text-[#7A6C5E]">
                  3 Upcoming
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#473C33] dark:text-[#FAF8F1]">CS 420: Lab 3</div>
                    <div className="text-[10px] text-[#7A6C5E] dark:text-[#C2B2A1]">Distributed consensus • Due in 2d</div>
                  </div>
                  <span className="font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-[#FDA769] text-white">
                    HIGH
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#473C33] dark:text-[#FAF8F1]">MATH 312: Problem Set 4</div>
                    <div className="text-[10px] text-[#7A6C5E] dark:text-[#C2B2A1]">Real Analysis • Due Friday</div>
                  </div>
                  <span className="font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEC868] text-[#473C33]">
                    MED
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#473C33] dark:text-[#FAF8F1]">BIO 201: Weekly Reading</div>
                    <div className="text-[10px] text-[#7A6C5E] dark:text-[#C2B2A1]">Genetics • Due Monday</div>
                  </div>
                  <span className="font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-[#ABC270] text-white">
                    LOW
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenAssignments}
                className="text-xs text-[#586738] hover:text-[#473C33] dark:text-[#ABC270] dark:hover:text-[#FEC868] flex items-center gap-1 font-semibold pt-1 cursor-pointer"
              >
                <span>Open assignments board</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Column 3: Live Voice Simulator Console (4 cols) */}
            <div className="lg:col-span-4 p-4 rounded-2xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#473C33] dark:text-[#FAF8F1]">
                  <Mic className="w-4 h-4 text-[#839758] dark:text-[#ABC270]" />
                  <span>Alexa+ Voice Simulation</span>
                </div>
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border transition flex items-center gap-1 cursor-pointer ${
                    isListening
                      ? 'bg-[#FDA769] text-white border-[#FDA769] font-bold animate-pulse'
                      : 'bg-white dark:bg-[#2E2620] text-[#473C33] dark:text-[#FAF8F1] border-[#E6E0D0] dark:border-[#FEC868]/20 hover:bg-[#FEC868]/30'
                  }`}
                  title={isListening ? 'Stop microphone' : 'Click to speak via microphone'}
                >
                  {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3 text-[#FDA769]" />}
                  <span>{isListening ? `Listening (${audioLevel}%)` : 'Speak Mic'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-2 text-xs leading-relaxed flex-1 flex flex-col justify-center">
                <div className="text-[#87796B] text-[10px] font-mono">
                  {isListening ? 'Listening to Microphone:' : 'Student Query:'}
                </div>
                <div className="text-[#473C33] dark:text-[#FAF8F1] font-semibold">"{voiceResult.query}"</div>
                <div className="text-[#87796B] text-[10px] font-mono pt-1">Alexa Response:</div>
                <div className="text-[#63574B] dark:text-[#E0D6C8] font-mono text-[11px]">{voiceResult.response}</div>
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
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-white dark:bg-[#2E2620] hover:bg-[#FEC868]/30 text-[#473C33] dark:text-[#FAF8F1] border border-[#E6E0D0] dark:border-[#FEC868]/20 transition cursor-pointer"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* 4. Interactive Expanding Study Workflows */}
      <section id="workflows" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-24 border-t border-[#E6E0D0] dark:border-[#FEC868]/15">
        <div className="max-w-2xl mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ABC270]/20 px-3 py-1 text-xs font-mono font-semibold text-[#586738] dark:text-[#ABC270] border border-[#ABC270]/40">
            <span>Adaptive Study Modalities</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#473C33] dark:text-[#FAF8F1]">
            Designed for how students actually study.
          </h2>
          <p className="text-xs sm:text-sm text-[#63574B] dark:text-[#C2B2A1] leading-relaxed">
            Hover over any modality to expand the interface. Smoothly transition between focused Pomodoro blocks, hands-free voice notes, and syllabus tracking.
          </p>
        </div>

        <WorkflowAccordion
          onOpenDashboard={onOpenDashboard}
          onOpenVoice={onOpenVoice}
          onOpenPlanner={onOpenPlanner}
          onOpenAssignments={onOpenAssignments}
        />
      </section>

      {/* 5. Horizontal App Suite Carousel */}
      <section id="suite" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-24 border-t border-[#E6E0D0] dark:border-[#FEC868]/15">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FEC868]/30 px-3 py-1 text-xs font-mono font-semibold text-[#473C33] dark:text-[#FEC868] border border-[#FEC868]/50">
              <span>Interactive App Ecosystem</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#473C33] dark:text-[#FAF8F1]">
              Every tool a serious student needs. In one fluid desk.
            </h2>
            <p className="text-xs sm:text-sm text-[#63574B] dark:text-[#C2B2A1] leading-relaxed">
              Scroll or swipe horizontally to inspect live feature cards. Each tool executes deterministic logic against your local database.
            </p>
          </div>
        </div>

        <FeatureCarousel
          onOpenDashboard={onOpenDashboard}
          onOpenVoice={onOpenVoice}
          onOpenPlanner={onOpenPlanner}
          onOpenAssignments={onOpenAssignments}
          onOpenTelemetry={onOpenTelemetry}
        />
      </section>

      {/* 6. The 5 Model Context Protocol Tools Showcase */}
      <section id="mcp-protocol" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-24 border-t border-[#E6E0D0] dark:border-[#FEC868]/15">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#586738] dark:text-[#ABC270]">
            Model Context Protocol
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#473C33] dark:text-[#FAF8F1]">
            Five deterministic tools. Zero hallucinations.
          </h2>
          <p className="text-xs sm:text-sm text-[#63574B] dark:text-[#C2B2A1] leading-relaxed">
            Alexa+ doesn't guess your grades or deadlines. It executes strongly-typed JSON-RPC tools against your local SQLite database over Streamable HTTP.
          </p>
        </div>

        {/* Interactive Tool Selector Panel */}
        <div className="rounded-2xl bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 p-6 space-y-5 shadow-xs">
          {/* Tool Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-[#E6E0D0] dark:border-[#FEC868]/15">
            {MCP_TOOLS.map((tool) => (
              <button
                key={tool.name}
                type="button"
                onClick={() => setSelectedMcpTool(tool)}
                className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  selectedMcpTool.name === tool.name
                    ? 'bg-[#ABC270] text-white font-semibold shadow-xs'
                    : 'bg-[#FAF8F1] dark:bg-[#393028] text-[#63574B] dark:text-[#C2B2A1] hover:text-[#473C33] dark:hover:text-white border border-[#E6E0D0] dark:border-[#FEC868]/15'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{tool.name}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-black/15">
                  {tool.category}
                </span>
              </button>
            ))}
          </div>

          {/* Selected Tool Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 space-y-3 text-xs">
              <div>
                <span className="font-mono text-[10px] uppercase text-[#87796B]">
                  MCP Tool Specification • Spec 2025-11-25
                </span>
                <h3 className="text-base font-semibold text-[#473C33] dark:text-[#FAF8F1] font-mono mt-0.5">
                  {selectedMcpTool.name}
                </h3>
                <p className="text-[#63574B] dark:text-[#C2B2A1] leading-relaxed mt-1">
                  {selectedMcpTool.description}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-1.5 font-mono text-[11px]">
                <div className="text-[#87796B]">Alexa Voice Cue:</div>
                <div className="font-semibold text-[#473C33] dark:text-[#FAF8F1]">"{selectedMcpTool.sampleQuery}"</div>
                <div className="text-[#87796B] pt-1">Deterministic Output:</div>
                <div className="text-[#586738] dark:text-[#ABC270]">{selectedMcpTool.responseSummary}</div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleRunVoice(selectedMcpTool.sampleQuery)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Test in Simulator</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenTelemetry}
                  className="text-xs font-medium text-[#586738] dark:text-[#ABC270] hover:underline cursor-pointer"
                >
                  View JSON-RPC schema
                </button>
              </div>
            </div>

            {/* Code Payload Inspector */}
            <div className="md:col-span-5 p-4 rounded-xl bg-[#473C33] text-[#FAF8F1] font-mono text-[11px] space-y-2 border border-[#2E2620]">
              <div className="flex items-center justify-between text-[#C2B2A1] pb-1 border-b border-white/10 text-[10px]">
                <span>POST /mcp HTTP/1.1</span>
                <span className="text-[#FEC868]">200 OK</span>
              </div>
              <pre className="text-[#ABC270] leading-relaxed overflow-x-auto">
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

      {/* 7. Asymmetric Palette 18 Bento Highlights Grid */}
      <section id="highlights" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-24 border-t border-[#E6E0D0] dark:border-[#FEC868]/15">
        <div className="max-w-2xl mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FDA769]/25 px-3 py-1 text-xs font-mono font-semibold text-[#944519] dark:text-[#FDA769] border border-[#FDA769]/40">
            <span>Academic Performance System</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#473C33] dark:text-[#FAF8F1]">
            Built for speed, focus, and zero distractions.
          </h2>
          <p className="text-xs sm:text-sm text-[#63574B] dark:text-[#C2B2A1] leading-relaxed">
            Engineered with high typographic craft, authentic local storage, and instant voice interaction.
          </p>
        </div>

        <CobaltBentoHighlights
          onOpenDashboard={onOpenDashboard}
          onOpenVoice={onOpenVoice}
          onOpenPlanner={onOpenPlanner}
          onOpenAssignments={onOpenAssignments}
          onOpenTelemetry={onOpenTelemetry}
        />
      </section>

      {/* 8. Live Voice Studio Sandbox Section */}
      <section id="voice-lab" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-24 border-t border-[#E6E0D0] dark:border-[#FEC868]/15">
        <div className="rounded-3xl bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 p-6 sm:p-10 space-y-6 shadow-xs">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ABC270]/20 px-3 py-0.5 text-xs text-[#586738] dark:text-[#ABC270] font-mono font-semibold">
              <Radio className="w-3 h-3 text-[#839758] dark:text-[#ABC270]" />
              <span>Speech Synthesis & Natural Language Engine</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#473C33] dark:text-[#FAF8F1]">
              Speak naturally. StudyMate organizes the rest.
            </h2>

            <p className="text-xs sm:text-sm text-[#63574B] dark:text-[#C2B2A1] leading-relaxed">
              Test real student prompts. StudyMate resolves speech intents, queries coursework in SQLite, and synthesizes clear spoken feedback.
            </p>
          </div>

          {/* Live Microphone & Custom Voice Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customVoiceInput.trim()) {
                handleRunVoice(customVoiceInput);
                setCustomVoiceInput('');
              }
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0 border ${
                isListening
                  ? 'bg-[#FDA769] text-white border-[#FDA769] shadow-md'
                  : 'bg-[#FAF8F1] dark:bg-[#393028] text-[#473C33] dark:text-[#FAF8F1] border-[#E6E0D0] dark:border-[#FEC868]/20 hover:bg-[#FEC868]/30'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#FDA769]" />}
              <span>{isListening ? `Stop Mic (${audioLevel}%)` : 'Speak with Mic'}</span>
            </button>

            <input
              type="text"
              value={customVoiceInput}
              onChange={(e) => setCustomVoiceInput(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening to your microphone... speak now'
                  : "Or type/speak any request (e.g. 'What is due this week?')"
              }
              className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/20 text-[#473C33] dark:text-[#FAF8F1] placeholder-[#87796B] focus:outline-none focus:border-[#ABC270]"
            />

            <button
              type="submit"
              disabled={voiceLoading || !customVoiceInput.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] disabled:opacity-40 transition cursor-pointer shrink-0"
            >
              Ask Alexa
            </button>
          </form>

          {speechError && (
            <div className="p-3 rounded-xl bg-[#FDA769]/20 border border-[#FDA769]/40 text-[#944519] dark:text-[#FDA769] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{speechError}</span>
            </div>
          )}

          {/* Cue Selector Chips */}
          <div className="space-y-2">
            <span className="text-xs text-[#7A6C5E] block font-mono">Or select a sample voice query to test live:</span>
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
                  className="px-3.5 py-1.5 rounded-full text-xs font-mono text-[#473C33] dark:text-[#FAF8F1] bg-[#FAF8F1] dark:bg-[#393028] hover:bg-[#FEC868]/35 border border-[#E6E0D0] dark:border-[#FEC868]/20 transition cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {/* Response Box */}
          <div className="p-4 rounded-2xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#7A6C5E]">
              <div className="flex items-center gap-1.5 text-[#586738] dark:text-[#ABC270]">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio Synthesis Feedback</span>
              </div>
              <span>Intent: {voiceResult.tool}</span>
            </div>
            <p className="text-[#473C33] dark:text-[#FAF8F1] font-sans text-xs leading-relaxed">
              {voiceLoading ? 'Synthesizing response...' : voiceResult.response}
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={onOpenVoice}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Launch Full Voice Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. System Architecture */}
      <section id="architecture" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-24 border-t border-[#E6E0D0] dark:border-[#FEC868]/15">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#586738] dark:text-[#ABC270]">
            System Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#473C33] dark:text-[#FAF8F1]">
            End-to-end student data sovereignty.
          </h2>
          <p className="text-xs sm:text-sm text-[#63574B] dark:text-[#C2B2A1] leading-relaxed">
            Coursework schedules and study streaks belong exclusively on your hardware. Zero tracking pixels, zero data selling, and open standard interfaces.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-2 text-center shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#ABC270]/25 text-[#586738] dark:text-[#ABC270] flex items-center justify-center mx-auto mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-[#473C33] dark:text-[#FAF8F1]">Local-First SQLite</h4>
            <p className="text-xs text-[#63574B] dark:text-[#C2B2A1] leading-relaxed">
              Queries execute locally with sub-millisecond latency and offline autonomy when Wi-Fi is unavailable.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-2 text-center shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#FEC868]/35 text-[#946218] dark:text-[#FEC868] flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-[#473C33] dark:text-[#FAF8F1]">Clerk PKCE Security</h4>
            <p className="text-xs text-[#63574B] dark:text-[#C2B2A1] leading-relaxed">
              Standard PKCE OAuth 2.1 protocol protection for student session tokens and hardware Echo speaker account linking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-2 text-center shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#FDA769]/25 text-[#E0712A] dark:text-[#FDA769] flex items-center justify-center mx-auto mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-[#473C33] dark:text-[#FAF8F1]">Open MCP 2025-11-25</h4>
            <p className="text-xs text-[#63574B] dark:text-[#C2B2A1] leading-relaxed">
              Standardized Model Context Protocol exposes structured tools to Alexa+, Claude, or local LLMs safely.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-20 border-t border-[#E6E0D0] dark:border-[#FEC868]/15">
        <div className="rounded-3xl bg-gradient-to-br from-[#839758] to-[#ABC270] text-white p-8 sm:p-12 text-center space-y-4 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white max-w-xl mx-auto">
            Ready to explore StudyMate?
          </h2>
          <p className="text-xs sm:text-sm text-white/90 max-w-md mx-auto leading-relaxed">
            Get started immediately with the preloaded student sandbox, or sign in to sync with Alexa hardware.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenDashboard}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-[#473C33] bg-[#FEC868] hover:bg-[#FFD482] transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <span>Launch Student Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={openClerkSignIn}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-black/20 hover:bg-black/30 border border-white/25 transition cursor-pointer"
            >
              Sign In Free
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E6E0D0] dark:border-[#FEC868]/15 text-xs text-[#63574B] dark:text-[#C2B2A1]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#473C33] dark:text-[#FAF8F1] font-semibold">
              <div className="w-6 h-6 rounded-md bg-[#ABC270] text-white flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <span>StudyMate</span>
            </div>
            <p className="text-xs leading-relaxed">
              Voice-first academic intelligence powered by Amazon Alexa+ and Model Context Protocol.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="font-mono uppercase text-[10px] text-[#87796B] font-semibold">Workspace</div>
            <div className="space-y-1">
              <button type="button" onClick={onOpenDashboard} className="block hover:text-[#473C33] dark:hover:text-white cursor-pointer">Dashboard</button>
              <button type="button" onClick={onOpenAssignments} className="block hover:text-[#473C33] dark:hover:text-white cursor-pointer">Assignments</button>
              <button type="button" onClick={onOpenPlanner} className="block hover:text-[#473C33] dark:hover:text-white cursor-pointer">Study Planner</button>
              <button type="button" onClick={onOpenVoice} className="block hover:text-[#473C33] dark:hover:text-white cursor-pointer">Voice Console</button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="font-mono uppercase text-[10px] text-[#87796B] font-semibold">Technology</div>
            <div className="space-y-1 font-mono text-[11px]">
              <div>Model Context Protocol (MCP)</div>
              <div>Streamable HTTP /mcp</div>
              <div>Amazon Alexa+ Skill Add-on</div>
              <div>Offline SQLite Database</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="font-mono uppercase text-[10px] text-[#87796B] font-semibold">Hackathon Demo</div>
            <div className="space-y-1">
              <button type="button" onClick={onOpenTelemetry} className="block hover:text-[#473C33] dark:hover:text-white cursor-pointer">System Diagnostics</button>
              <button type="button" onClick={openClerkSignIn} className="block hover:text-[#473C33] dark:hover:text-white cursor-pointer">Clerk Auth</button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E6E0D0] dark:border-[#FEC868]/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono">
          <span>© 2026 StudyMate • Open Source Academic Add-on</span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ABC270]" />
              <span className="w-2 h-2 rounded-full bg-[#FEC868]" />
              <span className="w-2 h-2 rounded-full bg-[#FDA769]" />
              <span className="w-2 h-2 rounded-full bg-[#473C33]" />
              <span className="ml-1">Palette 18</span>
            </span>
            <span>•</span>
            <span>MCP 2025-11-25</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudyMateHero;
