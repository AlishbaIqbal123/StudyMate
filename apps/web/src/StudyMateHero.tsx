import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Menu,
  X,
  Mic,
  Sparkles,
  Terminal,
  Activity,
  Layers,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  ArrowRight,
  ExternalLink,
  Cpu,
  GraduationCap,
  Flame,
  ShieldCheck,
  Zap,
  BookOpen,
  TrendingUp,
  RotateCcw,
  Volume2,
  VolumeX,
  Radio,
  Compass,
  ArrowDown,
  Brain,
  Award,
} from 'lucide-react';

export interface StudyMateHeroProps {
  onOpenDashboard?: () => void;
  onOpenVoice?: () => void;
  onOpenPlanner?: () => void;
  onOpenTelemetry?: () => void;
  onOpenAssignments?: () => void;
}

// Reusable Continuous Scroll-Reveal Hook that re-triggers on every scroll pass
function useOnScreen(
  ref: React.RefObject<HTMLDivElement | null>,
  threshold = 0.1,
  initialVisible = false
) {
  const [isIntersecting, setIntersecting] = useState(initialVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Continuous triggering: sets true when in view, false when out of view
        setIntersecting(entry.isIntersecting);
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    const current = ref.current;
    if (current) {
      observer.observe(current);
    }
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [ref, threshold]);

  return isIntersecting;
}

export const StudyMateHero: React.FC<StudyMateHeroProps> = ({
  onOpenDashboard,
  onOpenVoice,
  onOpenPlanner,
  onOpenTelemetry,
  onOpenAssignments,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [activeVoiceDemo, setActiveVoiceDemo] = useState<{
    prompt: string;
    tool: string;
    response: string;
  } | null>(null);

  // Real-Time Continuous Scroll Tracker & Active Chapter
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState('hero');

  // Interactive Live Timer in Focus Flow Section
  const [heroTimerRunning, setHeroTimerRunning] = useState(false);
  const [heroTimerSeconds, setHeroTimerSeconds] = useState(25 * 60);

  // Interactive Story Turn Simulator
  const [activeStoryTurn, setActiveStoryTurn] = useState<number>(1);
  const [activeMcpTab, setActiveMcpTab] = useState<string>('get_tasks');

  // Section Refs for Scroll Animations
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const voiceRef = useRef<HTMLDivElement>(null);
  const mcpRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);
  const privacyRef = useRef<HTMLDivElement>(null);
  const launchRef = useRef<HTMLDivElement>(null);

  // Hero is visible by default so it never starts blank on mount
  const heroVisible = useOnScreen(heroRef, 0.05, true);
  const storyVisible = useOnScreen(storyRef, 0.05);
  const voiceVisible = useOnScreen(voiceRef, 0.05);
  const mcpVisible = useOnScreen(mcpRef, 0.05);
  const focusVisible = useOnScreen(focusRef, 0.05);
  const privacyVisible = useOnScreen(privacyRef, 0.05);
  const launchVisible = useOnScreen(launchRef, 0.05);

  // Set document title
  useEffect(() => {
    document.title = 'StudyMate — Alexa+ Conversational Academic Co-Pilot';
  }, []);

  // Continuous Scroll Listener with requestAnimationFrame for 60fps parallax animations
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          setScrollY(y);
          const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
          const currentProgress = totalScroll > 0 ? (y / totalScroll) * 100 : 0;
          setScrollProgress(currentProgress);

          const sections = [
            { id: 'hero', offset: heroRef.current?.offsetTop || 0 },
            { id: 'story', offset: (storyRef.current?.offsetTop || 0) - 250 },
            { id: 'voice-studio', offset: (voiceRef.current?.offsetTop || 0) - 250 },
            { id: 'mcp-architecture', offset: (mcpRef.current?.offsetTop || 0) - 250 },
            { id: 'focus-flow', offset: (focusRef.current?.offsetTop || 0) - 250 },
            { id: 'privacy', offset: (privacyRef.current?.offsetTop || 0) - 250 },
            { id: 'launch', offset: (launchRef.current?.offsetTop || 0) - 250 },
          ];

          for (let i = sections.length - 1; i >= 0; i--) {
            if (y >= sections[i].offset) {
              setActiveChapter(sections[i].id);
              break;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Live Focus Sprint Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (heroTimerRunning && heroTimerSeconds > 0) {
      interval = setInterval(() => {
        setHeroTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (heroTimerSeconds === 0) {
      setHeroTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [heroTimerRunning, heroTimerSeconds]);

  // Lock body scroll only when mobile menu or architecture modal is open
  useEffect(() => {
    if (isMenuOpen || isArchModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, isArchModalOpen]);

  const mcpTools = [
    {
      name: 'get_tasks',
      tag: 'Deadlines',
      desc: 'Triages upcoming coursework & exams prioritized by due date.',
      payload: '{"status": "pending", "limit": 5}',
      action: onOpenAssignments || onOpenDashboard,
    },
    {
      name: 'add_task',
      tag: 'Capture',
      desc: 'Zero-friction voice ingestion directly into local SQLite.',
      payload: '{"title": "CS 420 Lab 3", "priority": "high", "est_minutes": 90}',
      action: onOpenDashboard,
    },
    {
      name: 'create_study_plan',
      tag: 'Pomodoro',
      desc: 'Generates structured 25-45 min focus sprints with breaks.',
      payload: '{"available_minutes": 45, "course": "Distributed Systems"}',
      action: onOpenPlanner || onOpenDashboard,
    },
    {
      name: 'update_progress',
      tag: 'Progress',
      desc: 'Marks assignments complete and recalibrates course mastery.',
      payload: '{"task_id": 1, "status": "done", "minutes_spent": 45}',
      action: onOpenDashboard,
    },
    {
      name: 'get_course_progress',
      tag: 'Analytics',
      desc: 'Returns completion percentages & weekly study investment.',
      payload: '{"course": "Algorithms & Matrix Theory"}',
      action: onOpenTelemetry || onOpenDashboard,
    },
  ];

  const handleRunVoiceCommand = (promptText: string) => {
    const text = promptText.trim().toLowerCase();
    setVoiceQuery(promptText);

    if (text.includes('due') || text.includes('task')) {
      setActiveVoiceDemo({
        prompt: promptText,
        tool: 'get_tasks',
        response:
          "You have 3 active assignments. Your top priority is 'Distributed Systems Lab 3' due this Friday at 11:59 PM.",
      });
    } else if (text.includes('study plan') || text.includes('min') || text.includes('hour')) {
      setActiveVoiceDemo({
        prompt: promptText,
        tool: 'create_study_plan',
        response:
          "I generated a 45-minute Pomodoro study sprint for Algorithms. Block 1: 25 mins deep dive; 5 min break; Block 2: 15 mins problem set review. Ready to begin?",
      });
    } else if (text.includes('complete') || text.includes('done') || text.includes('finished')) {
      setActiveVoiceDemo({
        prompt: promptText,
        tool: 'update_progress',
        response:
          "Great work! I marked 'CS 420 Lab 3' as completed. Your course progress has increased to 75%.",
      });
    } else {
      setActiveVoiceDemo({
        prompt: promptText,
        tool: 'get_course_progress',
        response:
          "You're currently enrolled in 4 courses, tracking an average 72% completion rate with 14.5 study hours logged this week.",
      });
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(
        activeVoiceDemo?.response || "I've triaged your coursework and organized your schedule."
      );
      utt.rate = 1.05;
      window.speechSynthesis.speak(utt);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-white selection:bg-cyan-500/20 selection:text-cyan-200 font-sans antialiased overflow-x-hidden">
      {/* ============================================================== */}
      {/* 1. REAL-TIME CONTINUOUS SCROLL PROGRESS BAR                     */}
      {/* ============================================================== */}
      <div className="fixed top-0 left-0 right-0 h-1.5 z-[70] bg-white/[0.04] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 transition-all duration-150 ease-out shadow-[0_0_12px_rgba(34,211,238,0.7)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ============================================================== */}
      {/* 2. FIXED BACKGROUND VIDEO: Academic Study & Campus Visual Canvas*/}
      {/* ============================================================== */}
      <div className="fixed inset-0 h-full w-full pointer-events-none z-0 overflow-hidden">
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src="/academic-study.mp4"
        />
        {/* Soft atmospheric overlay ensuring high-contrast readability for bubbly pods */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-[#030712]/95 pointer-events-none" />

        {/* Ambient atmospheric radial glows */}
        <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute top-[40%] -right-40 w-[38rem] h-[38rem] rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-20 left-1/4 w-[42rem] h-[28rem] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
      </div>

      {/* ============================================================== */}
      {/* 3. FLOATING CHAPTER STORY NAVIGATOR (Continuous Scroll Guide)  */}
      {/* ============================================================== */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3 p-2.5 rounded-full bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl">
        {[
          { id: 'hero', label: 'Awakening', num: '01' },
          { id: 'story', label: 'The Dilemma', num: '02' },
          { id: 'voice-studio', label: 'Voice AI', num: '03' },
          { id: 'mcp-architecture', label: 'MCP Tools', num: '04' },
          { id: 'focus-flow', label: 'Focus Flow', num: '05' },
          { id: 'privacy', label: 'Privacy', num: '06' },
          { id: 'launch', label: 'Launch', num: '07' },
        ].map((chap) => {
          const isActive = activeChapter === chap.id;
          return (
            <button
              key={chap.id}
              onClick={() => scrollToSection(chap.id)}
              className="group relative flex items-center justify-end cursor-pointer"
              title={chap.label}
            >
              {/* Tooltip on Hover */}
              <span className="absolute right-8 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-black/80 text-cyan-300 border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
                {chap.num} · {chap.label}
              </span>

              {/* Indicator Dot Pill */}
              <div
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                  isActive
                    ? 'w-7 h-7 bg-cyan-400/20 border border-cyan-400 text-cyan-300 font-mono text-[9px] font-bold shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                    : 'bg-white/20 hover:bg-white/50 border border-transparent'
                }`}
              >
                {isActive && chap.num}
              </div>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 4. STICKY GLASS BUBBLE NAVIGATION BAR                          */}
      {/* ============================================================== */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <nav className="flex items-center justify-between p-2 rounded-full bg-black/60 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-3 pl-3 py-1 cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  StudyMate
                </span>
                <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-cyan-300 border border-cyan-500/30">
                  Alexa+ MCP
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Bubble Pill Cluster */}
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/10">
            <button
              type="button"
              onClick={() => scrollToSection('story')}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer ${
                activeChapter === 'story'
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              The Story
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('voice-studio')}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeChapter === 'voice-studio'
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Mic className="h-3 w-3 text-cyan-400" />
              <span>Voice AI</span>
            </button>

            {/* MCP Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsToolsDropdownOpen((prev) => !prev)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  activeChapter === 'mcp-architecture'
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>5 MCP Tools</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${
                    isToolsDropdownOpen ? 'rotate-180 text-cyan-400' : ''
                  }`}
                />
              </button>

              {isToolsDropdownOpen && (
                <div
                  onMouseLeave={() => setIsToolsDropdownOpen(false)}
                  className="absolute left-0 top-full mt-3 w-80 rounded-[2rem] bg-black/95 p-4 backdrop-blur-3xl border border-white/15 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1.5"
                >
                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-cyan-300/80">
                    Model Context Protocol Registry
                  </div>
                  {mcpTools.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => {
                        setIsToolsDropdownOpen(false);
                        scrollToSection('mcp-architecture');
                        setActiveMcpTab(t.name);
                      }}
                      className="w-full flex flex-col items-start rounded-2xl p-2.5 text-left transition hover:bg-white/10 cursor-pointer group"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">
                          {t.name}
                        </span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium text-white/60">
                          {t.tag}
                        </span>
                      </div>
                      <span className="text-[11px] text-white/60 mt-0.5 line-clamp-1">
                        {t.desc}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => scrollToSection('focus-flow')}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer ${
                activeChapter === 'focus-flow'
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Focus Flow
            </button>
            <button
              type="button"
              onClick={() => setIsArchModalOpen(true)}
              className="rounded-full px-4 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              Architecture
            </button>
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2 pr-1">
            <button
              type="button"
              onClick={() => {
                if (onOpenDashboard) onOpenDashboard();
                else handleRunVoiceCommand("Alexa, what's due this week?");
              }}
              className="px-5 py-2 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90 shadow-xl border border-white/20 active:scale-95 flex items-center space-x-1.5 cursor-pointer bg-gradient-to-b from-[#2B2B2B] to-[#101010]"
            >
              <span>Launch Companion</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white md:hidden cursor-pointer"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </nav>
      </header>

      {/* MOBILE SLIDE-IN MENU */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl p-6 flex flex-col justify-between animate-fadeIn md:hidden">
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-cyan-400" />
              <span className="font-bold text-base">StudyMate</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full bg-white/10 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col gap-3 py-8 text-base font-semibold">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                scrollToSection('story');
              }}
              className="text-left py-2 hover:text-cyan-300"
            >
              1. The Student Dilemma
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                scrollToSection('voice-studio');
              }}
              className="text-left py-2 hover:text-cyan-300"
            >
              2. Alexa+ Voice Studio
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                scrollToSection('mcp-architecture');
              }}
              className="text-left py-2 hover:text-cyan-300"
            >
              3. 5 Native MCP Tools
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                scrollToSection('focus-flow');
              }}
              className="text-left py-2 hover:text-cyan-300"
            >
              4. Pomodoro Focus Velocity
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsArchModalOpen(true);
              }}
              className="text-left py-2 hover:text-cyan-300"
            >
              5. System Architecture
            </button>
          </div>

          <button
            onClick={() => {
              setIsMenuOpen(false);
              if (onOpenDashboard) onOpenDashboard();
            }}
            className="w-full py-3.5 rounded-full text-center font-bold text-sm text-white bg-gradient-to-b from-[#2B2B2B] to-[#101010] border border-white/20"
          >
            Launch Live Companion
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MAIN STORY-TELLING SCROLLABLE BODY WITH CONTINUOUS REVEALS  */}
      {/* ============================================================== */}
      <main className="relative z-10 space-y-28 sm:space-y-40 pb-28 pt-8">
        {/* ============================================================== */}
        {/* ACT 1: HERO AWAKENING — BUBBLY INTRO                           */}
        {/* ============================================================== */}
        <section
          id="hero"
          ref={heroRef}
          className={`px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto pt-6 sm:pt-12 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            heroVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-[0.98]'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12 overflow-hidden">
            {/* Left Narrative Column - Flies in from Left */}
            <div
              className={`max-w-2xl space-y-6 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24'
              }`}
            >
              {/* Bubbly Track Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-2xl border border-white/20 text-xs font-semibold text-white shadow-xl hover:border-cyan-400/40 transition-colors">
                <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span>Alexa+ Model Context Protocol (MCP) Add-on</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-[4.2rem] font-bold tracking-tight leading-[1.08] text-white">
                Your academic life, organized through{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300">
                  conversation.
                </span>
              </h1>

              {/* Sub-lead Narrative */}
              <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-xl">
                An autonomous voice-first co-pilot for college students. Triage syllabus deadlines, launch calibrated Pomodoro focus sprints, and update course mastery simply by talking to Alexa.
              </p>

              {/* Interactive Voice Capsule Bubble Form */}
              <div className="pt-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (voiceQuery.trim()) {
                      handleRunVoiceCommand(voiceQuery);
                    } else {
                      handleRunVoiceCommand("Alexa, what's due this week?");
                    }
                  }}
                  className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl hover:border-cyan-400/40 transition-all"
                >
                  <div className="flex items-center pl-4 pr-2 w-full sm:w-auto flex-1">
                    <Mic className="h-4 w-4 text-cyan-400 shrink-0 mr-2.5 animate-pulse" />
                    <input
                      type="text"
                      value={voiceQuery}
                      onChange={(e) => setVoiceQuery(e.target.value)}
                      placeholder="Ask Alexa: 'What's due this week?'"
                      className="w-full bg-transparent text-sm text-white placeholder-white/50 outline-none font-sans py-2"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto rounded-full px-6 py-3 text-xs font-semibold text-white transition-all hover:opacity-90 shadow-xl border border-white/20 active:scale-95 shrink-0 cursor-pointer bg-gradient-to-b from-[#2B2B2B] to-[#101010]"
                  >
                    Ask Alexa
                  </button>
                </form>

                {/* Spoken Prompt Chips */}
                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-white/50">Quick speech cues:</span>
                  {[
                    "Alexa, what's due this week?",
                    '45 min study plan',
                    'Mark OS lab complete',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleRunVoiceCommand(chip)}
                      className="rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-white/80 backdrop-blur-xl border border-white/10 transition-all hover:bg-white/20 hover:text-white cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Speech Output Bubble */}
              {activeVoiceDemo && (
                <div className="rounded-[2rem] bg-black/85 p-5 backdrop-blur-3xl border border-cyan-500/40 shadow-2xl animate-fadeIn space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="font-mono font-bold text-cyan-300">
                        TOOL: {activeVoiceDemo.tool}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveVoiceDemo(null)}
                      className="text-white/40 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-white/90">
                    <strong className="text-cyan-300">Alexa+: </strong>
                    {activeVoiceDemo.response}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenDashboard) onOpenDashboard();
                    }}
                    className="text-xs font-semibold text-cyan-300 hover:underline flex items-center gap-1"
                  >
                    <span>View in Dashboard</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Bubbly Cards Column - Flies in from Right */}
            <div
              className={`flex flex-col sm:flex-row lg:flex-col gap-5 w-full lg:w-80 shrink-0 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-150 ${
                heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24'
              }`}
            >
              {/* Card 1: Silkscreen Metric Bubble */}
              <div className="p-6 rounded-[2.5rem] bg-white/[0.08] backdrop-blur-2xl border border-white/15 shadow-2xl space-y-4 hover:border-cyan-400/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-semibold">
                    Autonomous MCP Ops
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-semibold text-emerald-300 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live SQLite
                  </span>
                </div>

                <div
                  className="text-4xl font-normal tracking-tight text-white"
                  style={{ fontFamily: "'Silkscreen', cursive" }}
                >
                  42,500+
                </div>

                <p className="text-xs text-white/70 leading-relaxed">
                  Sub-millisecond tool executions with zero cloud database fees. Pure local data sovereignty.
                </p>

                <div className="pt-2 flex flex-wrap gap-1.5">
                  {['get_tasks', 'add_task', 'create_study_plan'].map((tool) => (
                    <span
                      key={tool}
                      className="font-mono text-[9px] rounded-full bg-black/40 px-2.5 py-1 text-white/70 border border-white/10"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card 2: Voice Flow Capsule */}
              <div className="p-6 rounded-[2.5rem] bg-white/[0.08] backdrop-blur-2xl border border-white/15 shadow-2xl space-y-3 hover:border-indigo-400/40 transition-all">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  <span>Alexa+ Multi-Turn Memory</span>
                </div>
                <p className="text-xs text-white/70 italic leading-relaxed">
                  "No tedious form fields or kanban dragging. You speak to your Echo, and your academic priorities update instantly."
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-white/60 border-t border-white/10">
                  <span>Student Companion</span>
                  <button
                    onClick={() => scrollToSection('voice-studio')}
                    className="text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Test speech</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Continuous Scroll Indicator */}
          <div className="pt-16 flex flex-col items-center justify-center text-center">
            <button
              onClick={() => scrollToSection('story')}
              className="flex flex-col items-center gap-2 text-white/50 hover:text-white transition group cursor-pointer"
            >
              <span className="text-[11px] font-mono tracking-widest uppercase">Scroll To Explore The Story</span>
              <div className="w-8 h-12 rounded-full border border-white/20 flex items-center justify-center p-1 group-hover:border-cyan-400 transition-colors">
                <div className="w-1.5 h-3 bg-cyan-400 rounded-full animate-bounce" />
              </div>
            </button>
          </div>
        </section>

        {/* ============================================================== */}
        {/* ACT 2: THE STUDENT DILEMMA — CHAOS VS STUDYMATE FLOW            */}
        {/* ============================================================== */}
        <section
          id="story"
          ref={storyRef}
          className="px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-12 overflow-hidden"
        >
          <div
            className={`text-center max-w-2xl mx-auto space-y-3 transition-all duration-700 ease-out ${
              storyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'
            }`}
          >
            <span className="font-mono text-xs font-semibold px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase tracking-wider">
              Act I · The Academic Friction
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Why university students drop deadlines.
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              Between Canvas, PDF syllabi, Slack, and email notifications, cognitive overload kills deep academic focus.
            </p>
          </div>

          {/* Two Bubbly Contrast Pods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* The Chaotic Way - Flies in from Left */}
            <div
              className={`rounded-[3rem] p-8 sm:p-10 bg-rose-950/20 backdrop-blur-2xl border border-rose-500/25 shadow-2xl space-y-6 flex flex-col justify-between relative overflow-hidden group hover:border-rose-400/40 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                storyVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24'
              }`}
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-3.5 py-1 text-xs font-semibold text-rose-300 border border-rose-500/30">
                  <X className="w-3.5 h-3.5" />
                  <span>The Fragmented Reality</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Manual Disorganization</h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  Students spend up to 45 minutes every Sunday manually transcribing syllabus tables into Trello or Notion, only to abandon them when exams hit.
                </p>
                <div className="space-y-3 pt-2 text-xs">
                  {[
                    'Surprise assignments discovered 2 hours before the portal closes',
                    'Uncalibrated study sessions causing rapid mental fatigue',
                    'Guilt and anxiety over which course needs attention today',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-rose-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-rose-500/20 font-mono text-[11px] text-rose-300/80">
                Avg. Student Friction: 4.8 hrs lost/week on syllabus management
              </div>
            </div>

            {/* The StudyMate Way - Flies in from Right */}
            <div
              className={`rounded-[3rem] p-8 sm:p-10 bg-gradient-to-br from-cyan-950/35 via-blue-950/25 to-black/70 backdrop-blur-3xl border border-cyan-500/40 shadow-[0_15px_50px_rgba(6,182,212,0.15)] space-y-6 flex flex-col justify-between relative overflow-hidden group hover:border-cyan-400/60 hover:shadow-[0_20px_60px_rgba(6,182,212,0.25)] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-150 animate-float-slow ${
                storyVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24'
              }`}
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-3.5 py-1 text-xs font-semibold text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>The StudyMate Flow</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Zero-Friction Voice Intelligence</h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  Speak one sentence as you walk back to your dorm. StudyMate triages deadline urgency and schedules Pomodoro sprints immediately.
                </p>
                <div className="space-y-3 pt-2 text-xs">
                  {[
                    'Instant Alexa+ triage: priority ordering by due date & course weight',
                    'Cognitively-structured 25m focus & 5m recovery intervals',
                    'Embedded local SQLite engine with sub-millisecond response',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-cyan-200/90">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/20 font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                <span>Response Latency: &lt; 25ms</span>
                <span className="font-semibold text-emerald-400">100% Student-Sovereign</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* ACT 3: VOICE STUDIO — MULTI-TURN CONVERSATION SCENARIO         */}
        {/* ============================================================== */}
        <section
          id="voice-studio"
          ref={voiceRef}
          className="px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-12 overflow-hidden"
        >
          <div
            className={`text-center max-w-2xl mx-auto space-y-3 transition-all duration-700 ease-out ${
              voiceVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'
            }`}
          >
            <span className="font-mono text-xs font-semibold px-3.5 py-1 rounded-full bg-blue-500/10 text-cyan-300 border border-blue-500/20 uppercase tracking-wider">
              Act II · Spoken Dialogue
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Experience the multi-turn conversational loop.
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              Click through a real academic dialog turn. Watch how StudyMate tracks conversational context from inquiry to timer initiation.
            </p>
          </div>

          {/* Interactive Bubbly Speech Console Card - Rises from Bottom Up */}
          <div
            className={`rounded-[3rem] p-6 sm:p-10 bg-white/[0.04] backdrop-blur-3xl border border-white/15 shadow-2xl space-y-8 hover:border-cyan-400/40 hover:shadow-[0_0_50px_rgba(6,182,212,0.15)] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              voiceVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-24 scale-95'
            }`}
          >
            {/* Step Selector Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { turn: 1, title: '1. Check Due Dates', prompt: "Alexa, what's due this week?" },
                { turn: 2, title: '2. Request Study Plan', prompt: 'I have 45 minutes, help me study' },
                { turn: 3, title: '3. Confirm & Start', prompt: 'Yes, start now' },
              ].map((step) => (
                <button
                  key={step.turn}
                  type="button"
                  onClick={() => setActiveStoryTurn(step.turn)}
                  className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeStoryTurn === step.turn
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 scale-105'
                      : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {step.title}
                </button>
              ))}
            </div>

            {/* Conversation Display Bubble */}
            <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-[2.5rem] bg-black/60 border border-white/10 space-y-6">
              {/* User Voice Utterance - Slides from Right */}
              <div
                className={`flex items-start justify-end gap-3 transition-all duration-700 ease-out delay-150 ${
                  voiceVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
                }`}
              >
                <div className="p-4 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-medium shadow-xl">
                  {activeStoryTurn === 1 && '"Alexa, what is due this week for my classes?"'}
                  {activeStoryTurn === 2 && '"I have 45 minutes tonight. Can you build me a study plan?"'}
                  {activeStoryTurn === 3 && '"Yes, let\'s start right now!"'}
                </div>
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs shrink-0">
                  ST
                </div>
              </div>

              {/* Animated Soundwave Visualizer Bubble */}
              <div className="flex items-center justify-center gap-1.5 py-3 px-6 rounded-full bg-white/[0.04] border border-white/10 max-w-sm mx-auto shadow-inner">
                <Mic className="w-3.5 h-3.5 text-cyan-400 mr-2 animate-pulse" />
                {[10, 22, 34, 16, 40, 26, 14, 30, 42, 20, 12].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-cyan-400 to-sky-300 rounded-full eq-anim-bar shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                    style={{
                      height: `${h}px`,
                      animationDelay: `${(i * 0.12).toFixed(2)}s`,
                    }}
                  />
                ))}
              </div>

              {/* StudyMate Voice Response - Slides from Left */}
              <div
                className={`flex items-start justify-start gap-3 transition-all duration-700 ease-out delay-300 ${
                  voiceVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-black font-bold text-xs shrink-0 shadow-lg">
                  AI
                </div>
                <div className="p-5 rounded-[2rem] bg-white/[0.07] border border-white/15 text-white text-xs sm:text-sm leading-relaxed max-w-xl space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300">
                    <span>
                      {activeStoryTurn === 1 && 'EXECUTED: get_tasks(status="pending")'}
                      {activeStoryTurn === 2 && 'EXECUTED: create_study_plan(duration=45)'}
                      {activeStoryTurn === 3 && 'EXECUTED: start_pomodoro_timer(mins=25)'}
                    </span>
                    <span className="text-white/40">Latency: 18ms</span>
                  </div>

                  <p>
                    {activeStoryTurn === 1 &&
                      "You have 3 active assignments. Your most urgent is 'Problem Set 4: Dynamic Programming' for CS 301, due tomorrow at 5:00 PM."}
                    {activeStoryTurn === 2 &&
                      "I've built a 45-minute focused protocol for Algorithms. Interval 1: 25-minute deep focus; 5-minute recovery break; Interval 2: 15-minute problem review. Ready to begin?"}
                    {activeStoryTurn === 3 &&
                      "Starting your 25-minute deep work Pomodoro session for CS 301 now! I've activated your companion timer. Let's make today count!"}
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenVoice) onOpenVoice();
                      }}
                      className="text-xs font-semibold text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Full Voice Console</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* ACT 4: 5 NATIVE MCP TOOLS ARCHITECTURE                         */}
        {/* ============================================================== */}
        <section
          id="mcp-architecture"
          ref={mcpRef}
          className="px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-12 overflow-hidden"
        >
          <div
            className={`text-center max-w-2xl mx-auto space-y-3 transition-all duration-700 ease-out ${
              mcpVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'
            }`}
          >
            <span className="font-mono text-xs font-semibold px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 uppercase tracking-wider">
              Act III · The Native Engine
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              5 Standard MCP Tools. Pure Precision.
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              StudyMate implements the official Model Context Protocol (MCP) specification over standard JSON-RPC 2.0 with streamable HTTP.
            </p>
          </div>

          {/* 5 Bubbly MCP Tool Cards - Multi-directional entry (Left, Bottom, Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mcpTools.map((tool, idx) => {
              const animClass =
                idx % 3 === 0
                  ? mcpVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
                  : idx % 3 === 1
                  ? mcpVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                  : mcpVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20';

              return (
                <div
                  key={tool.name}
                  className={`p-6 rounded-[2.5rem] bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-2xl border border-white/15 hover:border-cyan-400/50 shadow-xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] space-y-4 group cursor-pointer ${animClass}`}
                  onClick={() => {
                    if (tool.action) tool.action();
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                      {tool.name}
                    </span>
                    <span className="font-mono text-[9px] uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                      {tool.tag}
                    </span>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed min-h-[36px]">
                    {tool.desc}
                  </p>

                  <div className="p-3 rounded-2xl bg-black/60 border border-white/10 font-mono text-[10px] text-white/60 truncate">
                    {tool.payload}
                  </div>

                  <div className="flex items-center justify-between text-xs text-cyan-300/80 group-hover:text-cyan-300 font-semibold pt-1">
                    <span>Explore Tool</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}

            {/* Architecture Explainer Card - Slides from Right */}
            <div
              onClick={() => setIsArchModalOpen(true)}
              className={`p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-black/60 backdrop-blur-2xl border border-indigo-500/30 shadow-xl space-y-4 cursor-pointer hover:border-indigo-400 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-150 flex flex-col justify-between ${
                mcpVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider font-mono">
                  <Cpu className="w-4 h-4" />
                  <span>Architecture</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-2">Local SQLite WAL Engine</h3>
                <p className="text-xs text-white/70 mt-2 leading-relaxed">
                  StudyMate connects Alexa+ directly to an embedded SQLite database using WAL mode for concurrent reading without locks.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-indigo-300 pt-2 border-t border-white/10">
                <span>View Full System Diagram</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* ACT 5: FOCUS FLOW & HABIT VELOCITY                             */}
        {/* ============================================================== */}
        <section
          id="focus-flow"
          ref={focusRef}
          className="px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-12 overflow-hidden"
        >
          <div
            className={`text-center max-w-2xl mx-auto space-y-3 transition-all duration-700 ease-out ${
              focusVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'
            }`}
          >
            <span className="font-mono text-xs font-semibold px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-wider">
              Act IV · Deep Work Velocity
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Maintain momentum without academic burnout.
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              StudyMate pairs voice execution with structured Pomodoro pacing and velocity metrics across your entire semester.
            </p>
          </div>

          {/* Bubbly Focus Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Pomodoro Timer Visualizer (5 cols) - Flies in from Left */}
            <div
              className={`lg:col-span-5 p-8 rounded-[3rem] bg-white/[0.05] backdrop-blur-3xl border border-white/15 shadow-2xl text-center space-y-5 hover:border-cyan-400/50 hover:shadow-[0_15px_50px_rgba(6,182,212,0.18)] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] animate-float-slow ${
                focusVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24'
              }`}
            >
              <span className="font-mono text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">
                Autonomous Focus Sprint
              </span>

              <div className="font-mono text-6xl font-light text-white tracking-widest py-2">
                {formatTimer(heroTimerSeconds)}
              </div>

              <p className="text-xs text-white/60">
                Interval 1 of 3: CS 301 Algorithms & Dynamic Programming
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setHeroTimerRunning(!heroTimerRunning)}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold text-white transition shadow-xl border border-white/20 active:scale-95 hover:opacity-90 flex items-center space-x-1.5 cursor-pointer bg-gradient-to-b from-[#2B2B2B] to-[#101010]"
                >
                  {heroTimerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause Sprint</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{heroTimerSeconds < 25 * 60 ? 'Resume Sprint' : 'Start Focus'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHeroTimerRunning(false);
                    setHeroTimerSeconds(25 * 60);
                  }}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/15 transition cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right: Velocity Graph & Streak Pod (7 cols) - Flies in from Right */}
            <div
              className={`lg:col-span-7 p-8 rounded-[3rem] bg-white/[0.05] backdrop-blur-3xl border border-white/15 shadow-2xl space-y-6 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-150 ${
                focusVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white">Weekly Focus Velocity</h3>
                  <p className="text-xs text-white/60">Study hours logged across all courses</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-mono">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  <span>6 Day Streak</span>
                </div>
              </div>

              {/* Visual Pillar Graph */}
              <div className="flex items-end justify-between gap-3 h-36 px-2 pt-4">
                {[
                  { day: 'Mon', h: 55, active: false },
                  { day: 'Tue', h: 70, active: false },
                  { day: 'Wed', h: 90, active: false },
                  { day: 'Thu', h: 60, active: false },
                  { day: 'Fri', h: 80, active: false },
                  { day: 'Sat', h: 40, active: false },
                  { day: 'Today', h: 85, active: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="w-full rounded-2xl bg-white/5 h-full flex items-end p-1 border border-white/10">
                      <div
                        className={`w-full rounded-xl transition-all duration-500 ${
                          item.active
                            ? 'bg-gradient-to-t from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30 animate-pulse'
                            : 'bg-white/20'
                        }`}
                        style={{ height: `${item.h}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-mono ${item.active ? 'text-cyan-300 font-bold' : 'text-white/50'}`}>
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-white/60">
                <span>Total: 16.5 hrs logged</span>
                <button
                  onClick={() => {
                    if (onOpenPlanner) onOpenPlanner();
                  }}
                  className="text-cyan-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>Open Full Tracker</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* ACT 6: DATA SOVEREIGNTY & PRIVACY                              */}
        {/* ============================================================== */}
        <section
          id="privacy"
          ref={privacyRef}
          className="px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto overflow-hidden"
        >
          <div
            className={`p-8 sm:p-12 rounded-[3.5rem] bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-3xl border border-white/15 shadow-2xl space-y-6 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              privacyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Student Data Sovereignty</h3>
                  <p className="text-xs text-white/60">Your academic records belong exclusively to you</p>
                </div>
              </div>
              <span className="font-mono text-xs px-3.5 py-1 rounded-full bg-white/10 text-white/80 border border-white/15 self-start md:self-auto">
                No Cloud Subscription Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-white/70 leading-relaxed">
              {/* Card 1 - Flies in from Left */}
              <div
                className={`p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 transition-all duration-700 ease-out delay-100 ${
                  privacyVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
                }`}
              >
                <span className="font-bold text-white text-sm block">1. Clean Guest Mode</span>
                <p>Browse and test the app with zero dummy data and zero tracking. When you're ready, sign in to unlock cloud sync.</p>
              </div>

              {/* Card 2 - Flies in from Bottom */}
              <div
                className={`p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 transition-all duration-700 ease-out delay-200 ${
                  privacyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                }`}
              >
                <span className="font-bold text-white text-sm block">2. Local SQLite Core</span>
                <p>All coursework records live in an embedded SQLite file with sub-millisecond execution and zero cloud latency.</p>
              </div>

              {/* Card 3 - Flies in from Right */}
              <div
                className={`p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 transition-all duration-700 ease-out delay-300 ${
                  privacyVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
                }`}
              >
                <span className="font-bold text-white text-sm block">3. Multi-Device Clerk Auth</span>
                <p>Authenticate with Clerk to sync your tasks and focus history securely between your laptop, tablet, and Echo device.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* ACT 7: THE GRAND FINALE CALL TO ACTION BUBBLE                  */}
        {/* ============================================================== */}
        <section
          id="launch"
          ref={launchRef}
          className="px-5 sm:px-8 lg:px-12 max-w-5xl mx-auto text-center space-y-8 overflow-hidden"
        >
          <div
            className={`p-10 sm:p-16 rounded-[4rem] bg-gradient-to-b from-blue-900/40 via-black/80 to-black/95 backdrop-blur-3xl border border-white/25 shadow-[0_0_70px_rgba(6,182,212,0.2)] hover:shadow-[0_0_100px_rgba(6,182,212,0.35)] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] space-y-6 ${
              launchVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'
            }`}
          >
            <span className="font-mono text-xs font-semibold px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest">
              Ready to Upgrade Your Academic Life?
            </span>

            <h2 className="text-3xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
              Start your first voice-directed focus session.
            </h2>

            <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
              Experience the future of academic management. Free to use with 0 dummy data, native MCP tools, and seamless voice triage.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (onOpenDashboard) onOpenDashboard();
                }}
                className="px-8 py-3.5 rounded-full text-sm font-semibold text-white transition shadow-2xl active:scale-95 hover:opacity-90 flex items-center space-x-2 cursor-pointer bg-gradient-to-b from-[#2B2B2B] to-[#101010] border border-white/25"
              >
                <span>Launch Companion Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenVoice) onOpenVoice();
                }}
                className="px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 transition active:scale-95 cursor-pointer flex items-center space-x-2"
              >
                <Mic className="w-4 h-4 text-cyan-300" />
                <span>Open Voice Console</span>
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* FOOTER: SLEEK BUBBLY BRAND SIGNATURE                           */}
        {/* ============================================================== */}
        <footer className="px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto pt-12 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-white/60">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-bold text-white text-sm">StudyMate</span>
              <span>· Built for the Alexa+ MCP Challenge</span>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px]">
              <button onClick={() => scrollToSection('hero')} className="hover:text-white cursor-pointer">
                Back to Top ↑
              </button>
              <span>•</span>
              <button onClick={() => setIsArchModalOpen(true)} className="hover:text-white cursor-pointer">
                Architecture Spec
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* SYSTEM ARCHITECTURE MODAL */}
      {isArchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-[3rem] bg-black/95 p-6 sm:p-8 backdrop-blur-3xl border border-white/20 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    StudyMate Technical Architecture
                  </h3>
                  <p className="text-xs text-white/60">
                    Alexa+ Model Context Protocol (MCP) Add-on Specification
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsArchModalOpen(false)}
                className="p-2 rounded-full bg-white/10 text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-cyan-400 font-bold">1. Student Surface</span>
                  <div className="text-white/60 text-[11px] mt-0.5">
                    Spoken voice via Echo device or Sleek Web Companion
                  </div>
                </div>
                <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] text-cyan-300">
                  Echo / Web
                </span>
              </div>

              <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-indigo-400 font-bold">2. Alexa+ Conversational Layer</span>
                  <div className="text-white/60 text-[11px] mt-0.5">
                    LLM tool selection, argument parsing & multi-turn dialog context
                  </div>
                </div>
                <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] text-indigo-300">
                  Amazon Alexa+
                </span>
              </div>

              <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-emerald-400 font-bold">3. Streamable HTTP Transport</span>
                  <div className="text-white/60 text-[11px] mt-0.5">
                    POST /mcp via Cloudflare Quick Tunnel (Free TLS/HTTPS)
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] text-emerald-300">
                  Cloudflare Quick Tunnel
                </span>
              </div>

              <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-amber-400 font-bold">4. StudyMate MCP Server</span>
                  <div className="text-white/60 text-[11px] mt-0.5">
                    @modelcontextprotocol/sdk TypeScript JSON-RPC 2.0 Engine
                  </div>
                </div>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] text-amber-300">
                  Node 22 + Express
                </span>
              </div>

              <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-purple-400 font-bold">5. Embedded SQLite (WAL Mode)</span>
                  <div className="text-white/60 text-[11px] mt-0.5">
                    Sub-millisecond local-first academic database with zero cloud bills
                  </div>
                </div>
                <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] text-purple-300">
                  node:sqlite
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsArchModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold text-white/70 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsArchModalOpen(false);
                  if (onOpenDashboard) onOpenDashboard();
                }}
                className="px-5 py-2 rounded-full text-xs font-semibold text-white shadow-lg border border-white/20 bg-gradient-to-b from-[#2B2B2B] to-[#101010]"
              >
                Launch Dashboard →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMateHero;
