import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  Volume2,
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

export const StudyMateHero: React.FC<StudyMateHeroProps> = ({
  onOpenDashboard,
  onOpenVoice,
  onOpenPlanner,
  onOpenTelemetry,
  onOpenAssignments,
}) => {
  const { openClerkSignIn, openClerkSignUp, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Interactive Live Pomodoro Desk in Hero Mockup
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 25 * 60));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const mm = m < 10 ? `0${m}` : `${m}`;
    const ss = s < 10 ? `0${s}` : `${s}`;
    return `${mm}:${ss}`;
  };

  // Interactive Voice Simulator in Sandbox
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
          "I reviewed your coursework schedule. CS 420 Lab 3 requires 90 minutes of focused effort.",
        tool: 'get_pending_assignments',
      });
    } finally {
      setVoiceLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#08090E] text-slate-100 selection:bg-blue-600/30 selection:text-blue-300 font-sans antialiased relative overflow-x-hidden">
      {/* Subtle solid ambient accents */}
      <div className="fixed top-1/4 -right-48 w-96 h-96 rounded-full bg-blue-600/[0.03] blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 -left-48 w-96 h-96 rounded-full bg-cyan-600/[0.03] blur-3xl pointer-events-none" />

      {/* ============================================================== */}
      {/* 1. FLOATING NAVIGATION BAR                                     */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
        {/* taste-skill-ignore */}
        <nav className="max-w-6xl mx-auto flex items-center justify-between p-2.5 sm:p-3 rounded-full bg-[#0D101A]/90 backdrop-blur-md border border-white/[0.08]">
          {/* Logo Brand */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 pl-2 sm:pl-3 cursor-pointer text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-sans font-bold text-base text-white tracking-tight">
              Study<span className="text-blue-400">Mate</span>
            </span>
            <span className="hidden md:inline-block font-sans text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10">
              v2.0
            </span>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-300">
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('voice-studio')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Voice Studio
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('study-desk')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Study Desk
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('architecture')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Architecture
            </button>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-2.5 pr-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Toggle color theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={onOpenDashboard}
                className="pl-4 pr-1.5 py-1.5 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-colors flex items-center gap-2 cursor-pointer group"
              >
                <span>Dashboard</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openClerkSignIn}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="pl-4 pr-1.5 py-1.5 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-colors flex items-center gap-2 cursor-pointer group"
                >
                  <span>Open App</span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ============================================================== */}
      {/* 2. HERO SECTION                                                */}
      {/* ============================================================== */}
      <section className="relative z-10 px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto pt-16 sm:pt-24 pb-16">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3.5 py-1 border border-blue-500/25 text-xs text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="font-sans font-medium text-[11px]">
              Autonomous Academic Copilot • Alexa+ & Local SQLite
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-sans text-4xl sm:text-6xl lg:text-[4.2rem] font-bold tracking-tight text-white leading-[1.08]">
            Master your coursework.
            <br />
            <span className="text-blue-400">
              Without breaking your flow.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal">
            An autonomous study companion for ambitious students. Track syllabus deadlines, triage coursework, and launch calibrated Pomodoro sprints using natural voice commands.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenDashboard}
              className="w-full sm:w-auto pl-6 pr-2 py-3 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-colors flex items-center justify-center gap-3 cursor-pointer group"
            >
              <span>Launch Student Workspace</span>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </div>
            </button>

            <button
              type="button"
              onClick={openClerkSignIn}
              className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 transition-colors cursor-pointer"
            >
              Sign In with Clerk
            </button>
          </div>

          {/* Trust Row */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-sans">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Student Sovereign
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Surveillance
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Offline SQLite Ready
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* INTERACTIVE LIVE WORKSTATION PREVIEW MOCKUP                    */}
        {/* ============================================================== */}
        <div id="study-desk" data-ui="workstation" className="mt-14 p-2 sm:p-3 rounded-[2.5rem] bg-[#0E121E] border border-white/[0.10]">
          <div className="rounded-[2.2rem] bg-[#0B0E17] border border-white/[0.08] p-6 sm:p-8 space-y-6">
            {/* Window chrome header */}
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="pl-2 font-sans text-[11px] text-slate-400">
                  studymate-workspace · desktop session
                </span>
              </div>
              <span className="font-sans text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                ● SQLite Active
              </span>
            </div>

            {/* Workstation 3-Column Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Column 1: Live Pomodoro Focus Desk (4 cols) */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-[#111624] border border-white/[0.08] flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Pomodoro Desk</span>
                  </div>
                  <span className="text-[10px] font-sans text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    25m Sprint
                  </span>
                </div>

                <div className="text-center py-4">
                  <div className="font-sans text-5xl font-light text-white tracking-tight">
                    {formatTimer(timerSeconds)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    {timerRunning ? 'Deep Focus Interval Active' : 'Calibrated Academic Sprint'}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {timerRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    <span>{timerRunning ? 'Pause' : 'Start Focus'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimerRunning(false);
                      setTimerSeconds(25 * 60);
                    }}
                    className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 transition-colors cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Column 2: Urgent Syllabus Deadlines (4 cols) */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-[#111624] border border-white/[0.08] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Coursework Radar</span>
                  </div>
                  <span className="text-[10px] font-sans text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    3 Due Soon
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">CS 420: Lab 3</div>
                      <div className="text-[10px] text-slate-400">Distributed consensus · Due Friday</div>
                    </div>
                    <span className="font-sans text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      HIGH
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">MATH 312: Problem Set 4</div>
                      <div className="text-[10px] text-slate-400">Real Analysis · Due Sunday</div>
                    </div>
                    <span className="font-sans text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      MED
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">BIO 201: Weekly Reading</div>
                      <div className="text-[10px] text-slate-400">Molecular Genetics · Due Monday</div>
                    </div>
                    <span className="font-sans text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      LOW
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenAssignments}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium pt-1 cursor-pointer"
                >
                  <span>View assignments desk</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Column 3: Alexa+ Voice Simulator Console (4 cols) */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-[#111624] border border-white/[0.08] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                    <Mic className="w-4 h-4 text-cyan-400" />
                    <span>Alexa+ Voice Command</span>
                  </div>
                  <span className="text-[10px] font-sans text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    Live Simulator
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2 text-xs leading-relaxed flex-1 flex flex-col justify-center">
                  <div className="text-slate-400 text-[11px] font-sans">Student prompt:</div>
                  <div className="text-blue-300 font-medium">"{voiceResult.query}"</div>
                  <div className="text-slate-400 text-[11px] font-sans pt-1">Alexa+ Response:</div>
                  <div className="text-slate-200 text-xs">{voiceResult.response}</div>
                </div>

                {/* Quick command buttons */}
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
                      className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/[0.05] hover:bg-white/[0.10] text-slate-300 border border-white/[0.08] transition-colors cursor-pointer"
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

      {/* ============================================================== */}
      {/* 3. CORE CAPABILITIES BENTO GRID                                */}
      {/* ============================================================== */}
      <section id="features" className="relative z-10 px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto py-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="font-sans text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Capabilities
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Built for how serious students actually work.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Eliminate cognitive friction between course syllabi, deadline triage, and active study sprints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Voice Copilot */}
          <div className="p-7 rounded-3xl bg-[#0E121E] border border-white/[0.08] space-y-4 hover:border-blue-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/25 flex items-center justify-center">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="font-sans text-lg font-bold text-white">
              Hands-Free Alexa+ Copilot
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask your Echo speaker or browser mic to query deadlines, start Pomodoro intervals, or log assignments without switching windows.
            </p>
            <button
              type="button"
              onClick={onOpenVoice}
              className="pt-2 flex items-center text-xs font-semibold text-blue-400 group-hover:text-blue-300 gap-1 cursor-pointer hover:underline focus:outline-none"
            >
              <span>Explore voice integration</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Calibrated Pomodoro */}
          <div className="p-7 rounded-3xl bg-[#0E121E] border border-white/[0.08] space-y-4 hover:border-amber-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-sans text-lg font-bold text-white">
              Cognitive Flow & Pomodoro Desk
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calibrated 25m or 50m deep focus blocks with automated recovery breaks to build mental endurance and defeat academic burnout.
            </p>
            <button
              type="button"
              onClick={onOpenPlanner}
              className="pt-2 flex items-center text-xs font-semibold text-amber-400 group-hover:text-amber-300 gap-1 cursor-pointer hover:underline focus:outline-none"
            >
              <span>View study planner</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Syllabus Radar */}
          <div className="p-7 rounded-3xl bg-[#0E121E] border border-white/[0.08] space-y-4 hover:border-cyan-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-sans text-lg font-bold text-white">
              Real-Time Syllabus Urgency Radar
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated course pacing benchmarks that prioritize your heaviest assignments before Canvas or university portals close.
            </p>
            <button
              type="button"
              onClick={onOpenTelemetry}
              className="pt-2 flex items-center text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 gap-1 cursor-pointer hover:underline focus:outline-none"
            >
              <span>Inspect course telemetry</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. INTERACTIVE VOICE STUDIO SANDBOX                            */}
      {/* ============================================================== */}
      <section id="voice-studio" className="relative z-10 px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto py-20">
        <div className="p-8 sm:p-12 rounded-[2.5rem] bg-[#0E121E] border border-white/[0.10] relative overflow-hidden">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3.5 py-1 border border-cyan-500/25 text-xs text-cyan-300">
              <Radio className="w-3 h-3 text-cyan-400" />
              <span>Interactive Speech Playground</span>
            </div>

            <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Speak naturally. StudyMate takes care of the rest.
            </h2>

            <p className="text-sm text-slate-400 leading-relaxed">
              Test real academic prompts right now. StudyMate extracts intents, queries your courses in SQLite, and synthesizes clean spoken feedback.
            </p>

            {/* Prompt Selector Chips */}
            <div className="pt-4 space-y-2">
              <span className="text-xs text-slate-400 font-sans block">Click a cue to test live:</span>
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
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition-colors cursor-pointer active:scale-95"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            {/* Response Card */}
            <div className="pt-4">
              <div className="p-4 rounded-2xl bg-[#090C15] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-sans text-cyan-400">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>AUDIO SYNTHESIS OUTPUT</span>
                  </div>
                  <span className="text-slate-400">Intent: {voiceResult.tool}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {voiceLoading ? 'Synthesizing voice response...' : voiceResult.response}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. DATA SOVEREIGNTY & ARCHITECTURE                             */}
      {/* ============================================================== */}
      <section id="architecture" className="relative z-10 px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto py-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="font-sans text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Architecture
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-white">
            End-to-end student data sovereignty.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your notes, deadlines, and study streaks belong exclusively to you. No tracking pixels, no telemetry selling, no cloud lock-in.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#0E121E] border border-white/[0.08] space-y-3 text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center mx-auto">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-sans font-bold text-white text-sm">Local-First SQLite</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Database operations run locally with sub-millisecond query execution and complete offline capability.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0E121E] border border-white/[0.08] space-y-3 text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-sans font-bold text-white text-sm">Clerk Encrypted Auth</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Industry-grade identity management with PKCE OAuth 2.1 protocol protection for all student sessions.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0E121E] border border-white/[0.08] space-y-3 text-center">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 flex items-center justify-center mx-auto">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-sans font-bold text-white text-sm">Open Model Context Protocol</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standardized MCP server exposes deterministic student tools to Alexa+, Claude, and local LLM agents safely.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. CALL TO ACTION BANNER                                       */}
      {/* ============================================================== */}
      <section className="relative z-10 px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto py-16">
        <div className="p-8 sm:p-14 rounded-[2.5rem] bg-[#0E1322] border border-white/[0.12] text-center space-y-6 relative overflow-hidden">
          <h2 className="font-sans text-3xl sm:text-5xl font-bold tracking-tight text-white max-w-xl mx-auto leading-tight">
            Ready to reclaim your academic focus?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto leading-relaxed">
            Get started in seconds with our instant Scholar Preview Pass, or create a free student account with Clerk.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenDashboard}
              className="w-full sm:w-auto pl-6 pr-2 py-3 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-colors flex items-center justify-center gap-3 cursor-pointer group"
            >
              <span>Launch Student Workspace</span>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </div>
            </button>
            <button
              type="button"
              onClick={openClerkSignUp}
              className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition-colors cursor-pointer"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. REFINED MINIMALIST FOOTER                                   */}
      {/* ============================================================== */}
      <footer className="relative z-10 py-10 px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center space-x-2 cursor-pointer hover:text-slate-300 transition-colors text-left"
        >
          <GraduationCap className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-slate-300">StudyMate</span>
          <span>· Open Source Academic Intelligence</span>
        </button>
        <div className="flex items-center space-x-6">
          <button type="button" onClick={onOpenDashboard} className="hover:text-white transition-colors cursor-pointer">
            Dashboard
          </button>
          <button type="button" onClick={onOpenAssignments} className="hover:text-white transition-colors cursor-pointer">
            Assignments
          </button>
          <button type="button" onClick={onOpenPlanner} className="hover:text-white transition-colors cursor-pointer">
            Planner
          </button>
          <button type="button" onClick={onOpenVoice} className="hover:text-white transition-colors cursor-pointer">
            Voice Studio
          </button>
          <button type="button" onClick={onOpenTelemetry} className="hover:text-white transition-colors cursor-pointer">
            Telemetry
          </button>
        </div>
      </footer>
    </div>
  );
};

export default StudyMateHero;
