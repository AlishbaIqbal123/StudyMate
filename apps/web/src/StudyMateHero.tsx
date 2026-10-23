import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Clock,
  BookOpen,
  ShieldCheck,
  Layers,
  GraduationCap,
  Sun,
  Moon,
  Radio,
  Cpu,
  ChevronRight,
  Terminal,
  Zap,
  ListTodo,
  BarChart3,
  CheckSquare,
  Lock,
  Headphones,
  Check,
} from 'lucide-react';
import { useAuth } from './context/AuthContext.js';
import { useTheme } from './context/ThemeContext.js';
import { simulateVoice } from './api.js';
import { AuroraBackground, BlurText, SplitText, CountUp, AnimatedContent, ScrollVelocity } from './components/animated/index.js';
import { ProductShowcaseSection } from './views/landing/ProductShowcaseSection.js';
import { TestimonialsSection } from './views/landing/TestimonialsSection.js';
import { NewsCardsSection } from './views/landing/NewsCardsSection.js';

interface StudyMateHeroProps {
  onOpenDashboard?: () => void;
  onOpenVoice?: () => void;
  onOpenPlanner?: () => void;
  onOpenTelemetry?: () => void;
  onOpenAssignments?: () => void;
}

interface McpToolSpec {
  name: string;
  description: string;
  sampleQuery: string;
  category: 'Query' | 'Planning' | 'Mutation' | 'Analytics';
  responseSummary: string;
}

const MCP_TOOLS: McpToolSpec[] = [
  {
    name: 'get_tasks',
    category: 'Query',
    description: 'Retrieves pending syllabus coursework, deadlines, priority levels, and estimated completion times.',
    sampleQuery: "Alexa, what's due this week?",
    responseSummary: 'Found 2 assignments due: CS 420 Lab 3 (48h) and Real Analysis Problem Set (Friday).',
  },
  {
    name: 'create_study_plan',
    category: 'Planning',
    description: 'Calculates dynamic Pomodoro intervals based on weighted assignment deadlines and available time blocks.',
    sampleQuery: 'Alexa, I have 45 minutes tonight. Build me a study plan.',
    responseSummary: 'Generated 45m sprint: 35m CS 420 Distributed Consensus + 10m recovery break.',
  },
  {
    name: 'add_task',
    category: 'Mutation',
    description: 'Creates a verified assignment in the student database with natural language date parsing.',
    sampleQuery: 'Alexa, add a task: Finish Operating Systems Lab due Friday.',
    responseSummary: 'Recorded assignment "Finish Operating Systems Lab" for CS 420 (Due Friday, High Priority).',
  },
  {
    name: 'get_course_progress',
    category: 'Analytics',
    description: 'Computes semester completion percentages, benchmark velocity, and weekly study hour pacing.',
    sampleQuery: 'Alexa, how am I pacing in Algorithms?',
    responseSummary: 'CS 420 is 68% complete with 4.5 hours logged this week. You are ahead of schedule.',
  },
  {
    name: 'update_progress',
    category: 'Mutation',
    description: 'Marks assignments complete, logs focused study minutes, and recalibrates remaining workload.',
    sampleQuery: 'Alexa, mark CS 420 lab complete and log 45 minutes.',
    responseSummary: 'Marked "CS 420 Lab 3" done. Logged 45 minutes of active deep focus.',
  },
];

export const StudyMateHero: React.FC<StudyMateHeroProps> = ({
  onOpenDashboard,
  onOpenVoice,
  onOpenPlanner,
  onOpenTelemetry,
  onOpenAssignments,
}) => {
  const { openClerkSignIn, openClerkSignUp, isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --------------------------------------------------------------------------
  // 1. Interactive Pomodoro Desk State (Hero Mockup)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 2. Ambient Web Audio Rain / Brown Noise Synthesizer (Zero-cost, browser native)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 3. Interactive Alexa+ Voice Simulator
  // --------------------------------------------------------------------------
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceResult, setVoiceResult] = useState<{
    query: string;
    response: string;
    tool?: string;
  }>({
    query: "Alexa, what's due this week?",
    response:
      "You have 2 assignments due this week: CS 420 Lab 3 due in 2 days, and Real Analysis Problem Set due on Friday. I recommend a 45-minute focus session tonight.",
    tool: 'get_pending_assignments',
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
          'I reviewed your coursework schedule. CS 420 Lab 3 requires 90 minutes of focused effort.',
        tool: 'get_pending_assignments',
      });
    } finally {
      setVoiceLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // 4. MCP Tools Explorer Tab
  // --------------------------------------------------------------------------
  const [selectedMcpTool, setSelectedMcpTool] = useState<McpToolSpec>(MCP_TOOLS[0]);

  return (
    <div className="min-h-[100dvh] bg-[#07090E] text-[#F5EFE6] selection:bg-[#E5A952]/30 selection:text-[#E5A952] font-sans antialiased relative overflow-x-hidden">
      {/* Ambient Film Grain & Atmospheric Spatial Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(229,169,82,0.08),transparent)]" />
        <div className="absolute top-1/3 -right-48 w-96 h-96 rounded-full bg-[#3B82F6]/[0.03] blur-3xl" />
        <div className="absolute bottom-1/4 -left-48 w-96 h-96 rounded-full bg-[#10B981]/[0.03] blur-3xl" />
      </div>

      {/* ================================================================== */}
      {/* 1. FLOATING PRECISION ISLAND NAVIGATION                           */}
      {/* ================================================================== */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between p-2 sm:p-2.5 rounded-full bg-[#0D111C]/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          {/* Logo Brand */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-2.5 pl-2 sm:pl-3 cursor-pointer text-left focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E5A952] to-[#B87D28] flex items-center justify-center text-[#07090E] font-bold shadow-md shadow-[#E5A952]/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-serif text-base font-semibold tracking-tight text-white">
                Study<span className="text-[#E5A952]">Mate</span>
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white/[0.06] text-[#C8BFB2] border border-white/[0.08]">
                MCP
              </span>
            </div>
          </button>

          {/* Clean Editorial Nav Links */}
          <div className="hidden md:flex items-center space-x-6 text-xs font-medium text-[#C8BFB2]">
            <button
              type="button"
              onClick={() => scrollToSection('workstation')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Study Desk
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('voice-lab')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Voice Console
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('mcp-protocol')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              MCP Protocol
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('architecture')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Architecture
            </button>
          </div>

          {/* Right Action Island */}
          <div className="flex items-center space-x-2 sm:space-x-3 pr-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#E5A952]" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={onOpenDashboard}
                className="pl-4 pr-1.5 py-1.5 rounded-full text-xs font-semibold text-[#07090E] bg-[#F5EFE6] hover:bg-white active:scale-[0.98] transition flex items-center gap-2 cursor-pointer shadow-sm group"
              >
                <span>Dashboard ({user?.name?.split(' ')[0]})</span>
                <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3 h-3 text-[#07090E]" />
                </div>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openClerkSignIn}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#C8BFB2] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="pl-4 pr-1.5 py-1.5 rounded-full text-xs font-semibold text-[#07090E] bg-[#F5EFE6] hover:bg-white active:scale-[0.98] transition flex items-center gap-2 cursor-pointer shadow-sm group"
                >
                  <span>Launch Desk</span>
                  <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-3 h-3 text-[#07090E]" />
                  </div>
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ================================================================== */}
      {/* 2. HERO EDITORIAL MANIFESTO                                       */}
      {/* ================================================================== */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-20 sm:pt-28 pb-16">
        <AuroraBackground />
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Eyebrow Micro-Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E5A952]/10 px-3.5 py-1 border border-[#E5A952]/25 text-[#E5A952]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5A952] animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] font-semibold">
              Amazon Alexa+ Track • Model Context Protocol 2025-11-25
            </span>
          </div>

          {/* Asymmetrical High-Contrast Editorial Heading */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-[4.4rem] font-normal tracking-tight text-white leading-[1.06]">
            <BlurText text="The academic flow state." className="block" duration={1200} />
            <SplitText
              text="Structured through conversation."
              className="font-sans font-light italic text-[#E5A952] block mt-2"
              staggerInterval={40}
              direction="up"
              charDuration={400}
            />
          </h1>

          {/* Subtitle / Truth Claim */}
          <p className="text-base sm:text-lg text-[#C8BFB2] leading-relaxed max-w-2xl mx-auto font-normal">
            StudyMate coordinates university syllabi, calibrates deep Pomodoro intervals, and pairs with physical Amazon Echo hardware via Streamable HTTP. Sovereign, offline-first SQLite with zero cloud surveillance.
          </p>

          {/* Button-in-Button Action Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <button
              type="button"
              onClick={onOpenDashboard}
              className="w-full sm:w-auto pl-6 pr-2 py-3 rounded-full text-sm font-semibold text-[#07090E] bg-[#F5EFE6] hover:bg-white active:scale-[0.98] transition flex items-center justify-center gap-3.5 cursor-pointer group shadow-[0_8px_30px_rgba(245,239,230,0.15)]"
            >
              <span>Launch Student Workspace</span>
              <div className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 text-[#07090E]" />
              </div>
            </button>

            <button
              type="button"
              onClick={openClerkSignIn}
              className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-semibold text-[#F5EFE6] hover:text-white bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#E5A952]" />
              <span>Sign In with Clerk</span>
            </button>
          </div>

          {/* Grounded Trust Pillars */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-[#C8BFB2]/80 font-mono">
            <span className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#10B981]" /> 100% Student Sovereign
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#10B981]" /> Offline-First SQLite
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#10B981]" /> Zero Surveillance
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#10B981]" /> Streamable HTTP Spec
            </span>
          </div>

          {/* CountUp Stats Bar */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <div className="text-center">
              <div className="font-serif text-3xl sm:text-4xl font-light text-white">
                <CountUp to={5} from={0} duration={2} animateOnView={true} />
              </div>
              <div className="text-[11px] font-mono text-[#C8BFB2] mt-1 uppercase tracking-wider">MCP Tools</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-3xl sm:text-4xl font-light text-white">
                <CountUp to={100} from={0} duration={2.5} suffix="%" animateOnView={true} />
              </div>
              <div className="text-[11px] font-mono text-[#C8BFB2] mt-1 uppercase tracking-wider">Sovereign</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-3xl sm:text-4xl font-light text-white">
                <CountUp to={0} from={0} duration={1} animateOnView={true} />
              </div>
              <div className="text-[11px] font-mono text-[#C8BFB2] mt-1 uppercase tracking-wider">Surveillance Pixels</div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. DOUBLE-BEZEL INTERACTIVE ACADEMIC WORKSTATION                */}
        {/* ============================================================== */}
        <div id="workstation" className="mt-16 sm:mt-20 p-2 sm:p-2.5 rounded-[2.5rem] bg-white/[0.03] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
          <div className="rounded-[calc(2.5rem-0.625rem)] bg-[#0C101C] border border-white/[0.08] p-6 sm:p-8 space-y-6 relative overflow-hidden">
            {/* Top Chrome Header with Live Status Pulse */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="pl-2 font-mono text-[11px] text-[#C8BFB2]">
                  studymate-workspace · local runtime
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded-full border border-[#10B981]/25 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                  SQLite Active
                </span>
                <span className="hidden sm:inline font-mono text-[10px] text-[#E5A952] bg-[#E5A952]/10 px-2.5 py-0.5 rounded-full border border-[#E5A952]/25">
                  MCP 2025-11-25
                </span>
              </div>
            </div>

            {/* Workstation 3-Column Asymmetrical Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Column 1: Live Interactive Pomodoro Desk (4 cols) */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-[#111728] border border-white/[0.08] flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                    <Clock className="w-4 h-4 text-[#E5A952]" />
                    <span>Pomodoro Desk</span>
                  </div>
                  {/* Web Audio Ambient Noise Toggle Button */}
                  <button
                    type="button"
                    onClick={toggleAmbientSound}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition flex items-center gap-1 cursor-pointer ${ambientActive
                      ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30 shadow-sm'
                      : 'bg-white/[0.05] text-[#C8BFB2] border-white/10 hover:text-white'
                      }`}
                    title="Toggle cozy ambient rain/brown noise"
                  >
                    {ambientActive ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                    <span>{ambientActive ? 'Rain Active' : 'Rain Vibe'}</span>
                  </button>
                </div>

                {/* Clock Display */}
                <div className="text-center py-3">
                  <div className="font-mono text-5xl font-light text-white tracking-widest">
                    {formatTimer(timerSeconds)}
                  </div>
                  <p className="text-[11px] text-[#C8BFB2] mt-2 font-mono">
                    {timerRunning ? 'Deep Focus Interval Active' : 'Calibrated Focus Sprint'}
                  </p>
                </div>

                {/* Duration Presets */}
                <div className="flex items-center justify-center gap-1.5">
                  {[25, 45, 60].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => handleSelectSprint(dur)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-mono font-semibold transition cursor-pointer ${selectedDuration === dur
                        ? 'bg-[#E5A952] text-[#07090E]'
                        : 'bg-white/[0.05] text-[#C8BFB2] hover:text-white'
                        }`}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-[#07090E] bg-[#F5EFE6] hover:bg-white active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {timerRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    <span>{timerRunning ? 'Pause' : 'Start Sprint'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSprint(selectedDuration)}
                    className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[#C8BFB2] hover:text-white transition cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Column 2: Urgent Syllabus Deadlines Radar (4 cols) */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-[#111728] border border-white/[0.08] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                    <BookOpen className="w-4 h-4 text-[#E5A952]" />
                    <span>Coursework Radar</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#E5A952] bg-[#E5A952]/10 px-2 py-0.5 rounded-full border border-[#E5A952]/25">
                    3 Due Soon
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">CS 420: Lab 3</div>
                      <div className="text-[10px] text-[#C8BFB2]">Distributed consensus · Due in 2d</div>
                    </div>
                    <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      HIGH
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">MATH 312: Problem Set 4</div>
                      <div className="text-[10px] text-[#C8BFB2]">Real Analysis · Due Friday</div>
                    </div>
                    <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      MED
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">BIO 201: Weekly Reading</div>
                      <div className="text-[10px] text-[#C8BFB2]">Molecular Genetics · Due Monday</div>
                    </div>
                    <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      LOW
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenAssignments}
                  className="text-xs text-[#E5A952] hover:underline flex items-center gap-1 font-medium pt-1 cursor-pointer"
                >
                  <span>Open assignments desk</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Column 3: Live Alexa+ Voice Simulator Console (4 cols) */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-[#111728] border border-white/[0.08] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                    <Mic className="w-4 h-4 text-cyan-400" />
                    <span>Alexa+ Voice Command</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/25">
                    Live Simulator
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2 text-xs leading-relaxed flex-1 flex flex-col justify-center">
                  <div className="text-[#C8BFB2] text-[10px] font-mono">Student Query:</div>
                  <div className="text-cyan-300 font-medium">"{voiceResult.query}"</div>
                  <div className="text-[#C8BFB2] text-[10px] font-mono pt-1">Alexa+ Response:</div>
                  <div className="text-[#F5EFE6] text-xs font-mono">{voiceResult.response}</div>
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
                      className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-white/[0.05] hover:bg-white/[0.10] text-[#C8BFB2] hover:text-white border border-white/[0.08] transition cursor-pointer"
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

      {/* ScrollVelocity Marquee */}
      <div className="relative z-10 py-6 border-y border-white/[0.06] overflow-hidden">
        <ScrollVelocity
          text="DEEP FOCUS · POMODORO · MCP PROTOCOL · ALEXA+ · SOVEREIGN DATA · OFFLINE FIRST · VOICE NATIVE · "
          baseSpeed={60}
          velocityMultiplier={0.15}
          fontSize="0.75rem"
          className="text-[#C8BFB2]/50 font-mono uppercase tracking-[0.15em]"
        />
      </div>

      {/* ================================================================== */}
      {/* 4. THE 5-PILLAR MODEL CONTEXT PROTOCOL (MCP) SHOWCASE             */}
      {/* ================================================================== */}
      <AnimatedContent direction="up" fadeIn duration={0.6} once={true}>
        <section id="mcp-protocol" className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 sm:py-32 border-t border-white/[0.06]">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#E5A952]/10 text-[#E5A952] border border-[#E5A952]/25">
              Model Context Protocol
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">
              Five deterministic tools. Zero hallucinations.
            </h2>
            <p className="text-sm text-[#C8BFB2] leading-relaxed">
              Alexa+ doesn't guess your grades or deadlines. It executes strongly-typed JSON-RPC tools against your sovereign SQLite store via Streamable HTTP.
            </p>
          </div>

          {/* Interactive Tool Selector Bento */}
          <div className="p-2.5 rounded-[2.2rem] bg-white/[0.03] border border-white/10">
            <div className="rounded-[calc(2.2rem-0.5rem)] bg-[#0C101C] border border-white/[0.08] p-6 sm:p-8 space-y-6">
              {/* Tool Pills Selector */}
              <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-white/[0.08]">
                {MCP_TOOLS.map((tool) => (
                  <button
                    key={tool.name}
                    type="button"
                    onClick={() => setSelectedMcpTool(tool)}
                    className={`px-4 py-2 rounded-xl font-mono text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${selectedMcpTool.name === tool.name
                      ? 'bg-[#E5A952] text-[#07090E] shadow-sm'
                      : 'bg-white/[0.04] text-[#C8BFB2] hover:text-white hover:bg-white/[0.08]'
                      }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{tool.name}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-black/20">
                      {tool.category}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Tool Details Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#E5A952]">
                      <span>MCP TOOL SCHEMA</span>
                      <span>•</span>
                      <span>PROTOCOL SPEC 2025-11-25</span>
                    </div>
                    <h3 className="text-xl font-serif text-white font-medium">
                      {selectedMcpTool.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#C8BFB2] leading-relaxed">
                      {selectedMcpTool.description}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] space-y-2 font-mono text-xs">
                    <div className="text-[11px] text-[#C8BFB2]">Spoken Alexa Cue:</div>
                    <div className="text-[#E5A952] font-semibold">"{selectedMcpTool.sampleQuery}"</div>
                    <div className="text-[11px] text-[#C8BFB2] pt-1">Deterministic Response:</div>
                    <div className="text-white/90 text-[11px]">{selectedMcpTool.responseSummary}</div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleRunVoice(selectedMcpTool.sampleQuery)}
                      className="px-4 py-2 rounded-full text-xs font-semibold text-[#07090E] bg-[#F5EFE6] hover:bg-white transition cursor-pointer flex items-center gap-2 active:scale-95 shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Test Tool in Voice Lab</span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenTelemetry}
                      className="text-xs font-mono text-[#C8BFB2] hover:text-white underline cursor-pointer"
                    >
                      View raw JSON-RPC logs
                    </button>
                  </div>
                </div>

                {/* Code Payload Inspector */}
                <div className="md:col-span-5 p-4 rounded-xl bg-[#07090E] border border-white/[0.08] font-mono text-[11px] space-y-2">
                  <div className="flex items-center justify-between text-white/40 pb-1 border-b border-white/[0.06]">
                    <span>HTTP STREAMABLE /mcp</span>
                    <span>200 OK</span>
                  </div>
                  <pre className="text-cyan-300 leading-relaxed overflow-x-auto">
                    {`{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "${selectedMcpTool.name}",
    "arguments": {
      "student_id": 1
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedContent>

      {/* ================================================================== */}
      {/* 5. LIVE VOICE STUDIO SANDBOX SECTION                              */}
      {/* ================================================================== */}
      <AnimatedContent direction="up" fadeIn duration={0.6} once={true}>
        <section id="voice-lab" className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 sm:py-32 border-t border-white/[0.06]">
          <div className="p-2.5 rounded-[2.5rem] bg-white/[0.03] border border-white/10">
            <div className="rounded-[calc(2.5rem-0.625rem)] bg-[#0C101C] border border-white/[0.08] p-8 sm:p-12 relative overflow-hidden">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3.5 py-1 border border-cyan-500/25 text-xs text-cyan-300 font-mono">
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <span>Speech Synthesis & Natural Language Engine</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-white">
                  Speak naturally. StudyMate organizes the rest.
                </h2>

                <p className="text-sm text-[#C8BFB2] leading-relaxed">
                  Test real academic prompts. StudyMate extracts student intents, queries coursework in SQLite, and synthesizes clear spoken feedback.
                </p>

                {/* Cue Selector Chips */}
                <div className="pt-4 space-y-2">
                  <span className="text-xs font-mono text-[#C8BFB2] block">Click an utterance to test live:</span>
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
                        className="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium text-[#C8BFB2] hover:text-white bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 transition cursor-pointer active:scale-95"
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                </div>

                {/* Response Card */}
                <div className="pt-4">
                  <div className="p-4 rounded-2xl bg-[#07090E] border border-white/[0.08] space-y-2 font-mono">
                    <div className="flex items-center justify-between text-[11px] text-cyan-400">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>AUDIO SYNTHESIS FEEDBACK</span>
                      </div>
                      <span className="text-[#C8BFB2]">Intent: {voiceResult.tool}</span>
                    </div>
                    <p className="text-xs text-white/90 leading-relaxed font-sans">
                      {voiceLoading ? 'Synthesizing voice response...' : voiceResult.response}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenVoice}
                    className="pl-5 pr-2 py-2 rounded-full text-xs font-semibold text-[#07090E] bg-[#F5EFE6] hover:bg-white transition flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm group"
                  >
                    <span>Launch Full Voice Console</span>
                    <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight className="w-3 h-3 text-[#07090E]" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedContent>

      <ProductShowcaseSection />

      <AnimatedContent direction="up" fadeIn duration={0.6} once={true}>
        {/* ================================================================== */}
        {/* 6. DATA SOVEREIGNTY & THREE-TIER ARCHITECTURE                     */}
        {/* ================================================================== */}
        <section id="architecture" className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 sm:py-32 border-t border-white/[0.06]">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25">
              Architecture
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">
              End-to-end student data sovereignty.
            </h2>
            <p className="text-sm text-[#C8BFB2] leading-relaxed">
              Your deadlines, notes, and study streaks belong exclusively to you. Zero tracking pixels, zero analytics selling, and zero vendor lock-in.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-[#0C101C] border border-white/[0.08] space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25 flex items-center justify-center mx-auto">
                <Cpu className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h4 className="font-serif text-lg text-white font-medium">Local-First SQLite</h4>
              <p className="text-xs text-[#C8BFB2] leading-relaxed">
                Database operations execute locally with sub-millisecond query latency and complete offline autonomy.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#0C101C] border border-white/[0.08] space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/25 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h4 className="font-serif text-lg text-white font-medium">Clerk PKCE Security</h4>
              <p className="text-xs text-[#C8BFB2] leading-relaxed">
                Enterprise-grade identity management with PKCE OAuth 2.1 protocol protection for all student sessions.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#0C101C] border border-white/[0.08] space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#E5A952]/15 text-[#E5A952] border border-[#E5A952]/25 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h4 className="font-serif text-lg text-white font-medium">Open MCP 2025-11-25</h4>
              <p className="text-xs text-[#C8BFB2] leading-relaxed">
                Standardized Model Context Protocol exposes clean tools to Alexa+, Claude, or local open-weights LLMs safely.
              </p>
            </div>
          </div>
        </section>
      </AnimatedContent>

      <TestimonialsSection />

      <AnimatedContent direction="up" fadeIn duration={0.6} once={true}>
        {/* ================================================================== */}
        {/* 7. SCHOLAR PREVIEW PASS VS VERIFIED MEMBER                        */}
        {/* ================================================================== */}
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-24 border-t border-white/[0.06]">
          <div className="p-2.5 rounded-[2.5rem] bg-white/[0.03] border border-white/10">
            <div className="rounded-[calc(2.5rem-0.625rem)] bg-[#0C101C] border border-white/[0.08] p-8 sm:p-12 space-y-8">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#E5A952] font-semibold">
                  Access Tiers
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium">
                  Transparent student access. Zero credit card.
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Scholar Preview Pass Card */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="inline-block px-3 py-1 rounded-full bg-white/[0.06] text-[#C8BFB2] font-mono text-[10px] uppercase font-semibold">
                      Academic Preview Pass
                    </div>
                    <h4 className="font-serif text-xl text-white">Instant Sandbox Mode</h4>
                    <p className="text-xs text-[#C8BFB2] leading-relaxed">
                      Explore StudyMate immediately without entering credentials. Preloaded with computer science and math semester coursework.
                    </p>
                    <ul className="space-y-2 text-xs text-[#C8BFB2] pt-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#10B981]" /> Up to 5 custom assignment tasks
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#10B981]" /> Interactive Pomodoro focus timer & audio
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#10B981]" /> Web Speech API Alexa+ voice simulation
                      </li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenDashboard}
                    className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold border border-white/10 transition cursor-pointer"
                  >
                    Enter Scholar Preview
                  </button>
                </div>

                {/* Verified Scholar Tier Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-b from-[#E5A952]/10 to-transparent border border-[#E5A952]/30 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="inline-block px-3 py-1 rounded-full bg-[#E5A952]/20 text-[#E5A952] font-mono text-[10px] uppercase font-semibold">
                      Verified Scholar Pass
                    </div>
                    <h4 className="font-serif text-xl text-white">Full Cloud & Hardware Sync</h4>
                    <p className="text-xs text-[#C8BFB2] leading-relaxed">
                      Sign in with Clerk using 1-click Google or student email. Unlocks continuous multi-device sync and Amazon Echo account linking.
                    </p>
                    <ul className="space-y-2 text-xs text-[#F5EFE6] pt-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#E5A952]" /> Unlimited coursework & syllabus tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#E5A952]" /> Physical Amazon Echo speaker OAuth pairing
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#E5A952]" /> Real-time Supabase cloud backup
                      </li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={openClerkSignIn}
                    className="w-full py-2.5 rounded-xl bg-[#E5A952] hover:bg-[#d49942] text-[#07090E] text-xs font-semibold transition cursor-pointer shadow-md"
                  >
                    Sign In with Clerk
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedContent>

      <NewsCardsSection />

      <AnimatedContent direction="up" fadeIn duration={0.6} once={true}>
        {/* ================================================================== */}
        {/* 8. CALL TO ACTION MASTER BANNER                                   */}
        {/* ================================================================== */}
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20 sm:py-28">
          <div className="p-2.5 rounded-[2.5rem] bg-white/[0.04] border border-white/10">
            <div className="rounded-[calc(2.5rem-0.625rem)] bg-[#0C101C] border border-white/[0.08] p-8 sm:p-16 text-center space-y-6 relative overflow-hidden">
              <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white max-w-xl mx-auto leading-tight">
                Ready to reclaim your academic focus?
              </h2>
              <p className="text-sm sm:text-base text-[#C8BFB2] max-w-md mx-auto leading-relaxed">
                Get started in seconds with our instant Scholar Preview Pass, or create a free student account with Clerk.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="w-full sm:w-auto pl-6 pr-2 py-3 rounded-full text-sm font-semibold text-[#07090E] bg-[#F5EFE6] hover:bg-white active:scale-[0.98] transition flex items-center justify-center gap-3.5 cursor-pointer shadow-sm group"
                >
                  <span>Launch Student Workspace</span>
                  <div className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5 text-[#07090E]" />
                  </div>
                </button>
                <button
                  type="button"
                  onClick={openClerkSignUp}
                  className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-semibold text-[#C8BFB2] hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition cursor-pointer"
                >
                  Create Free Account
                </button>
              </div>
            </div>
          </div>
        </section>
      </AnimatedContent>

      <AnimatedContent direction="up" fadeIn duration={0.6} once={true}>
        {/* ================================================================== */}
        {/* 9. ENHANCED EDITORIAL FOOTER                                        */}
        {/* ================================================================== */}
        <footer className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center space-x-2.5 cursor-pointer text-left group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E5A952] to-[#B87D28] flex items-center justify-center text-[#07090E]">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-serif font-semibold text-white text-lg">Study<span className="text-[#E5A952]">Mate</span></span>
              </button>
              <p className="text-xs text-[#C8BFB2]/70 leading-relaxed max-w-xs">
                Voice-first academic intelligence powered by Amazon Alexa+ and Model Context Protocol.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C8BFB2]/50 font-mono">Product</h4>
              <div className="space-y-2">
                <button type="button" onClick={onOpenDashboard} className="block text-sm text-[#C8BFB2]/80 hover:text-white transition-colors cursor-pointer">Dashboard</button>
                <button type="button" onClick={onOpenAssignments} className="block text-sm text-[#C8BFB2]/80 hover:text-white transition-colors cursor-pointer">Assignments</button>
                <button type="button" onClick={onOpenPlanner} className="block text-sm text-[#C8BFB2]/80 hover:text-white transition-colors cursor-pointer">Planner</button>
                <button type="button" onClick={onOpenVoice} className="block text-sm text-[#C8BFB2]/80 hover:text-white transition-colors cursor-pointer">Voice Studio</button>
                <button type="button" onClick={onOpenTelemetry} className="block text-sm text-[#C8BFB2]/80 hover:text-white transition-colors cursor-pointer">AI Diagnostics</button>
              </div>
            </div>

            {/* Technology */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C8BFB2]/50 font-mono">Technology</h4>
              <div className="space-y-2 text-sm text-[#C8BFB2]/80">
                <div>MCP 2025-11-25</div>
                <div>Amazon Alexa+</div>
                <div>Offline-First SQLite</div>
                <div>Clerk Auth (PKCE)</div>
                <div>Streamable HTTP</div>
              </div>
            </div>

            {/* Access */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C8BFB2]/50 font-mono">Access</h4>
              <div className="space-y-3">
                <button type="button" onClick={onOpenDashboard} className="w-full py-2 rounded-xl bg-[#F5EFE6]/10 hover:bg-[#F5EFE6]/15 text-[#F5EFE6] text-xs font-semibold border border-white/10 transition cursor-pointer">
                  Scholar Preview
                </button>
                <button type="button" onClick={openClerkSignIn} className="w-full py-2 rounded-xl bg-[#E5A952] hover:bg-[#d49942] text-[#07090E] text-xs font-semibold transition cursor-pointer">
                  Sign In Free
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#C8BFB2]/50 font-mono">
            <span>© 2026 StudyMate · Open Source Academic Intelligence</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />Zero Surveillance</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#E5A952]" />MCP 2025-11-25</span>
            </div>
          </div>
        </footer>
      </AnimatedContent>
    </div>
  );
};

export default StudyMateHero;
