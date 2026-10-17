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
  threshold = 0.08,
  initialVisible = false
) {
  const [isIntersecting, setIntersecting] = useState(initialVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
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

  // Continuous Scroll Listener with requestAnimationFrame
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
      seal: '締め切り',
      desc: 'Triages upcoming coursework & exams prioritized by due date.',
      payload: '{"status": "pending", "limit": 5}',
      action: onOpenAssignments || onOpenDashboard,
    },
    {
      name: 'add_task',
      tag: 'Capture',
      seal: '录入',
      desc: 'Zero-friction voice ingestion directly into local SQLite.',
      payload: '{"title": "CS 420 Lab 3", "priority": "high", "est_minutes": 90}',
      action: onOpenDashboard,
    },
    {
      name: 'create_study_plan',
      tag: 'Pomodoro',
      seal: '番茄时钟',
      desc: 'Generates structured 25-45 min focus sprints with breaks.',
      payload: '{"available_minutes": 45, "course": "Distributed Systems"}',
      action: onOpenPlanner || onOpenDashboard,
    },
    {
      name: 'update_progress',
      tag: 'Progress',
      seal: '进度',
      desc: 'Marks assignments complete and recalibrates course mastery.',
      payload: '{"task_id": 1, "status": "done", "minutes_spent": 45}',
      action: onOpenDashboard,
    },
    {
      name: 'get_course_progress',
      tag: 'Analytics',
      seal: '统计',
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
      utt.rate = 1.02;
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
    const mm = m < 10 ? '0' + m : '' + m;
    const ss = s < 10 ? '0' + s : '' + s;
    return mm + ':' + ss;
  };

  return (
    <div className="relative min-h-[100svh] w-full bg-[#0B0D13] text-[#F3EFEA] selection:bg-[#E5A952]/25 selection:text-[#F8E3C2] font-sans antialiased overflow-x-hidden">
      {/* ============================================================== */}
      {/* 1. REAL-TIME CONTINUOUS SCROLL PROGRESS BAR                     */}
      {/* ============================================================== */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[70] bg-[#141824]/60 pointer-events-none">
        <div
          className="h-full bg-[#E5A952] transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ============================================================== */}
      {/* 2. FIXED BACKGROUND VIDEO: University Campus & Study Ambience   */}
      {/* ============================================================== */}
      <div className="fixed inset-0 h-full w-full pointer-events-none z-0 overflow-hidden">
        <video
          className="h-full w-full object-cover filter contrast-[1.05] brightness-90 saturate-[0.85]"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src="/academic-study.mp4"
        />
        {/* Warm library & study cafe atmosphere overlay */}
        <div className="absolute inset-0 bg-[#0B0D13]/85 pointer-events-none" />

        {/* Muted study desk lamp amber & celadon jade radial lights */}
        <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] rounded-full bg-[#E5A952]/[0.08] blur-[160px] pointer-events-none" />
        <div className="absolute top-[30%] -right-36 w-[42rem] h-[42rem] rounded-full bg-[#4E7A68]/[0.09] blur-[160px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[45rem] h-[30rem] rounded-full bg-[#1F2538]/[0.15] blur-[170px] pointer-events-none" />
      </div>

      {/* ============================================================== */}
      {/* 3. FLOATING CHAPTER STORY NAVIGATOR (Minimalist Study Index)   */}
      {/* ============================================================== */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-2.5 p-2 rounded-full bg-[#11141C] border border-white/[0.08] ">
        {[
          { id: 'hero', label: 'Awakening', seal: '序' },
          { id: 'story', label: 'The Dilemma', seal: '困' },
          { id: 'voice-studio', label: 'Voice AI', seal: '音' },
          { id: 'mcp-architecture', label: 'MCP Tools', seal: '器' },
          { id: 'focus-flow', label: 'Focus Flow', seal: '心' },
          { id: 'privacy', label: 'Privacy', seal: '私' },
          { id: 'launch', label: 'Launch', seal: '始' },
        ].map((chap, idx) => {
          const isActive = activeChapter === chap.id;
          return (
            <button
              key={chap.id}
              onClick={() => scrollToSection(chap.id)}
              className="group relative flex items-center justify-end cursor-pointer"
              title={chap.label}
            >
              {/* Tooltip on Hover */}
              <span className="absolute right-9 px-2.5 py-1 rounded-md text-[10px] font-sans font-medium bg-[#141824] text-[#E5A952] border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {chap.seal} · {chap.label}
              </span>

              {/* Indicator Dot Pill */}
              <div
                className={`w-3.5 h-3.5 rounded-full transition-colors duration-300 flex items-center justify-center font-serif text-[9px] ${
                  isActive
                    ? 'w-7 h-7 bg-[#E5A952] text-[#0E1117] font-bold '
                    : 'bg-white/20 hover:bg-[#E5A952]/40 text-[#E5A952]'
                }`}
              >
                {isActive && chap.seal}
              </div>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 4. REFINED EDITORIAL NAVIGATION HEADER                         */}
      {/* ============================================================== */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <nav className="flex items-center justify-between p-2 rounded-full bg-[#11141C]/80 backdrop-blur-2xl border border-white/[0.08] ">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-3 pl-3 py-1 cursor-pointer group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E5A952] text-[#0E1117] group-hover:scale-105 transition-transform">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-base tracking-tight text-[#F5EFE6] font-medium group-hover:text-[#E5A952] transition-colors">
                StudyMate
              </span>
              <span className="rounded-full bg-[#E5A952]/10 px-2.5 py-0.5 font-sans tabular-nums text-[9px] font-medium text-[#E5A952] border border-[#E5A952]/25">
                열공 ∙ Alexa+ MCP
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <button
              type="button"
              onClick={() => scrollToSection('story')}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer ${
                activeChapter === 'story'
                  ? 'bg-white/10 text-[#F5EFE6] font-semibold'
                  : 'text-[#D0C8BE] hover:text-[#F5EFE6] hover:bg-white/[0.05]'
              }`}
            >
              The Story
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('voice-studio')}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeChapter === 'voice-studio'
                  ? 'bg-white/10 text-[#F5EFE6] font-semibold'
                  : 'text-[#D0C8BE] hover:text-[#F5EFE6] hover:bg-white/[0.05]'
              }`}
            >
              <Mic className="h-3 w-3 text-[#E5A952]" />
              <span>Voice AI</span>
            </button>

            {/* MCP Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsToolsDropdownOpen((prev) => !prev)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  activeChapter === 'mcp-architecture'
                    ? 'bg-white/10 text-[#F5EFE6] font-semibold'
                    : 'text-[#D0C8BE] hover:text-[#F5EFE6] hover:bg-white/[0.05]'
                }`}
              >
                <span>5 Tools</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${
                    isToolsDropdownOpen ? 'rotate-180 text-[#E5A952]' : ''
                  }`}
                />
              </button>

              {isToolsDropdownOpen && (
                <div
                  onMouseLeave={() => setIsToolsDropdownOpen(false)}
                  className="absolute left-0 top-full mt-3 w-80 rounded-[2rem] bg-[#121622] p-4 border border-white/10 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1"
                >
                  <div className="px-3 py-1 text-[10px] font-sans text-[#E5A952]/90 flex items-center justify-between">
                    <span>Model Context Protocol</span>
                    <span className="font-serif text-[#D0C8BE]/70">工具</span>
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
                      className="w-full flex flex-col items-start rounded-xl p-2.5 text-left transition hover:bg-white/[0.06] cursor-pointer group"
                    >
                      <div className="flex w-full items-center justify-between">
                        <code className="text-xs font-medium text-[#F5EFE6] group-hover:text-[#E5A952]">
                          {t.name}
                        </code>
                        <span className="rounded-full bg-[#E5A952]/10 px-2 py-0.5 text-[9px] font-sans text-[#E5A952] border border-[#E5A952]/20">
                          {t.seal} · {t.tag}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#A8A196] mt-0.5 line-clamp-1">
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
                  ? 'bg-white/10 text-[#F5EFE6] font-semibold'
                  : 'text-[#D0C8BE] hover:text-[#F5EFE6] hover:bg-white/[0.05]'
              }`}
            >
              Focus Flow
            </button>
            <button
              type="button"
              onClick={() => setIsArchModalOpen(true)}
              className="rounded-full px-4 py-1.5 text-xs font-medium text-[#D0C8BE] hover:text-[#E5A952] hover:bg-white/[0.05] transition cursor-pointer"
            >
              Architecture
            </button>
          </div>

          {/* Action CTAs: Button-in-Button Trailing Pattern */}
          <div className="hidden sm:flex items-center gap-2 pr-1">
            <button
              type="button"
              onClick={() => {
                if (onOpenDashboard) onOpenDashboard();
                else handleRunVoiceCommand("Alexa, what's due this week?");
              }}
              className="pl-4 pr-1.5 py-1.5 rounded-full text-xs font-medium text-[#0E1117] transition-colors hover:bg-white active:scale-[0.98] flex items-center gap-2.5 cursor-pointer bg-[#F5EFE6]  group"
            >
              <span className="font-semibold">Open Desk</span>
              <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[#F5EFE6] md:hidden cursor-pointer hover:bg-white/15"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </nav>
      </header>

      {/* MOBILE SLIDE-IN MENU */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B0D13] p-6 flex flex-col justify-between animate-fadeIn md:hidden">
          <div className="flex items-center justify-between pb-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[#E5A952]" />
              <span className="font-serif text-lg text-[#F5EFE6]">StudyMate</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full bg-white/10 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-4 py-8 text-base font-serif">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                scrollToSection('story');
              }}
              className="text-left py-2 hover:text-[#E5A952]"
            >
              1. The Academic Dilemma (困)
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                scrollToSection('voice-studio');
              }}
              className="text-left py-2 hover:text-[#E5A952]"
            >
              2. Alexa+ Voice Studio (音)
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                scrollToSection('mcp-architecture');
              }}
              className="text-left py-2 hover:text-[#E5A952]"
            >
              3. 5 MCP Tools Desk (器)
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                scrollToSection('focus-flow');
              }}
              className="text-left py-2 hover:text-[#E5A952]"
            >
              4. Pomodoro Focus Velocity (心)
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsArchModalOpen(true);
              }}
              className="text-left py-2 hover:text-[#E5A952]"
            >
              5. System Architecture
            </button>
          </div>

          <button
            onClick={() => {
              setIsMenuOpen(false);
              if (onOpenDashboard) onOpenDashboard();
            }}
            className="w-full py-3.5 rounded-full text-center font-semibold text-sm text-[#0E1117] bg-[#F5EFE6] hover:bg-white transition-colors"
          >
            Launch Companion Desk
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MAIN STORY-TELLING SCROLLABLE BODY WITH DOUBLE-BEZEL PODS   */}
      {/* ============================================================== */}
      <main className="relative z-10 space-y-28 sm:space-y-36 pb-28 pt-8">
        {/* ============================================================== */}
        {/* ACT 1: HERO AWAKENING — QUIET STUDY DESK                       */}
        {/* ============================================================== */}
        <section
          id="hero"
          ref={heroRef}
          className={`px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto pt-8 sm:pt-16 transition-[transform,opacity] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            heroVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-[0.98]'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12">
            {/* Left Column: Literary Academic Copy */}
            <div
              className={`max-w-2xl space-y-6 transition-[transform,opacity] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
              }`}
            >
              {/* East Asian Study Seal Stamp */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#161B26] px-3.5 py-1 border border-white/10 text-xs text-[#D8CEBD]">
                <span className="w-2 h-2 rounded-full bg-[#E5A952]" />
                <span className="font-sans text-[11px] tracking-wide text-[#E5A952]">열공 ∙ 專注</span>
                <span className="text-[#8B8378]">|</span>
                <span className="text-[11px]">Alexa+ Academic Add-on</span>
              </div>

              {/* Dignified Editorial Headline */}
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-[4.2rem] font-medium tracking-tight leading-[1.08] text-[#F5EFE6]">
                Your academic life, organized through{' '}
                <em className="font-editorial italic font-normal text-[#E5A952] ">
                  quiet conversation.
                </em>
              </h1>

              {/* Sub-lead Narrative */}
              <p className="text-base sm:text-lg text-[#C8BFB2] leading-relaxed max-w-xl font-normal">
                An autonomous, voice-first companion for the focused student. Triage syllabus deadlines, commence calibrated Pomodoro sprints, and recalibrate course mastery without ever leaving your study desk.
              </p>

              {/* Double-Bezel Voice Input Capsule */}
              <div className="pt-2">
                <div className="p-1.5 rounded-[2.2rem] bg-white/[0.03] border border-white/[0.08] ring-1 ring-white/[0.03]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (voiceQuery.trim()) {
                        handleRunVoiceCommand(voiceQuery);
                      } else {
                        handleRunVoiceCommand("Alexa, what's due this week?");
                      }
                    }}
                    className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-[1.8rem] bg-[#12151F] border border-white/[0.06]"
                  >
                    <div className="flex items-center pl-4 pr-2 w-full sm:w-auto flex-1">
                      <Mic className="h-4 w-4 text-[#E5A952] shrink-0 mr-2.5" />
                      <input
                        type="text"
                        value={voiceQuery}
                        onChange={(e) => setVoiceQuery(e.target.value)}
                        placeholder="Say: 'Alexa, what's due this week?'"
                        className="w-full bg-transparent text-sm text-[#F5EFE6] placeholder-[#8E867A] outline-none font-sans py-2"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto rounded-full px-5 py-2.5 text-xs font-semibold text-[#0E1117] bg-[#E5A952] hover:bg-[#F2BC66] transition-colors active:scale-95 shrink-0 cursor-pointer"
                    >
                      Ask Alexa
                    </button>
                  </form>
                </div>

                {/* Subtle Prompt Chips */}
                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[#8B8378] font-sans">Quick cues:</span>
                  {[
                    "Alexa, what's due this week?",
                    '45 min study sprint',
                    'Mark CS lab complete',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleRunVoiceCommand(chip)}
                      className="rounded-full bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1 text-xs text-[#D8CEBD] border border-white/[0.06] transition-colors cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Voice Output Dialog Box */}
              {activeVoiceDemo && (
                <div className="rounded-2xl bg-[#141824] p-5 border border-[#E5A952]/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 text-xs">
                    <div className="flex items-center gap-2 font-sans text-[#E5A952]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E5A952]" />
                      <code>TOOL: {activeVoiceDemo.tool}</code>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveVoiceDemo(null)}
                      className="text-[#8B8378] hover:text-[#F5EFE6]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-[#D8CEBD]">
                    <strong className="text-[#E5A952]">Alexa+: </strong>
                    {activeVoiceDemo.response}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenDashboard) onOpenDashboard();
                    }}
                    className="text-xs font-medium text-[#E5A952] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect on Desk Dashboard</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Double-Bezel Desk Artifacts */}
            <div
              className={`flex flex-col sm:flex-row lg:flex-col gap-4 w-full lg:w-80 shrink-0 transition-[transform,opacity] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-150 ${
                heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
              }`}
            >
              {/* Double-Bezel Card 1: Local SQLite Velocity */}
              <div className="p-1.5 rounded-[2.2rem] bg-white/[0.03] border border-white/[0.08] ring-1 ring-white/[0.03]">
                <div className="p-6 rounded-[1.8rem] bg-[#12151F] border border-white/[0.06] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans text-[#E5A952] font-semibold">
                      Autonomous Ops
                    </span>
                    <span className="rounded-full bg-[#4E7A68]/20 px-2 py-0.5 text-[9px] font-sans font-medium text-[#7AB89F] border border-[#4E7A68]/30">
                      WAL Mode
                    </span>
                  </div>

                  <div
                    className="text-3xl font-normal text-[#F5EFE6]"
                    style={{ fontFamily: "'Silkscreen', cursive" }}
                  >
                    42,500+
                  </div>

                  <p className="text-xs text-[#A8A196] leading-relaxed">
                    Sub-millisecond tool executions with zero cloud database fees. Pure local data sovereignty.
                  </p>

                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {['get_tasks', 'add_task', 'create_study_plan'].map((tool) => (
                      <code
                        key={tool}
                        className="text-[9px] rounded-md bg-white/[0.04] px-2 py-0.5 text-[#C8BFB2] border border-white/[0.06]"
                      >
                        {tool}
                      </code>
                    ))}
                  </div>
                </div>
              </div>

              {/* Double-Bezel Card 2: Dokseosil Multi-Turn Memory */}
              <div className="p-1.5 rounded-[2.2rem] bg-white/[0.03] border border-white/[0.08] ring-1 ring-white/[0.03]">
                <div className="p-6 rounded-[1.8rem] bg-[#12151F] border border-white/[0.06] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-serif font-medium text-[#F5EFE6]">
                    <Sparkles className="h-3.5 w-3.5 text-[#E5A952]" />
                    <span>Multi-Turn Dialogue Context</span>
                  </div>
                  <p className="text-xs text-[#A8A196] italic leading-relaxed font-serif">
                    "No tedious form fields or kanban dragging. You speak to your Echo, and your academic priorities update instantly."
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-[#8B8378] ">
                    <span className="font-sans text-[10px]">Study Desk Companion</span>
                    <button
                      onClick={() => scrollToSection('voice-studio')}
                      className="text-[#E5A952] hover:underline flex items-center gap-1 cursor-pointer text-xs"
                    >
                      <span>Try audio</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continuous Scroll Indicator */}
          <div className="pt-16 flex flex-col items-center justify-center text-center">
            <button
              onClick={() => scrollToSection('story')}
              className="flex flex-col items-center gap-2 text-[#8B8378] hover:text-[#E5A952] transition-colors cursor-pointer group"
            >
              <span className="text-[10px] font-sans">The Study Journey</span>
              <div className="w-5 h-8 rounded-full border border-white/20 flex items-center justify-center p-0.5 group-hover:border-[#E5A952] transition-colors">
                <div className="w-1 h-2 bg-[#E5A952] rounded-full" />
              </div>
            </button>
          </div>
        </section>

        {/* ============================================================== */}
        {/* ACT 2: THE ACADEMIC FRICTION (困 — CHAOS VS STUDYMATE FLOW)    */}
        {/* ============================================================== */}
        <section
          id="story"
          ref={storyRef}
          className="px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto space-y-12 overflow-hidden"
        >
          <div
            className={`text-center max-w-xl mx-auto space-y-3 transition-[transform,opacity] duration-700 ease-out ${
              storyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'
            }`}
          >
            <span className="font-sans text-xs font-medium px-3 py-1 rounded-full bg-[#C24138]/10 text-[#E06357] border border-[#C24138]/30">
              Act I · The Academic Friction (困)
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#F5EFE6]">
              Why university students drop deadlines.
            </h2>
            <p className="text-sm text-[#A8A196] leading-relaxed">
              Between Canvas, PDF syllabi, Slack, and email notifications, cognitive overload kills deep academic focus.
            </p>
          </div>

          {/* Asymmetrical Bento Contrast */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* The Fragmented Reality (Cinnabar Warning) */}
            <div
              className={`p-1.5 rounded-[2.5rem] bg-white/[0.02] border border-[#C24138]/20 ring-1 ring-[#C24138]/10 transition-[transform,opacity] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                storyVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
              }`}
            >
              <div className="h-full p-8 rounded-[2rem] bg-[#161215]/80 border border-[#C24138]/15 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#C24138]/15 px-3 py-1 text-xs font-sans text-[#E06357] border border-[#C24138]/25">
                    <X className="w-3 h-3" />
                    <span>The Fragmented Reality</span>
                  </div>
                  <h3 className="font-serif text-2xl text-[#F5EFE6]">Manual Disorganization</h3>
                  <p className="text-xs text-[#C8BFB2] leading-relaxed">
                    Students spend 45 minutes every Sunday manually copying syllabus tables into Trello or Notion, only to abandon them when midterm season strikes.
                  </p>
                  <div className="space-y-2.5 pt-2 text-xs">
                    {[
                      'Surprise assignments discovered 2 hours before the portal closes',
                      'Uncalibrated study sessions causing rapid mental fatigue',
                      'Persistent anxiety over which course requires attention today',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-[#E0B8B4]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C24138] mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-[#C24138]/20 font-sans text-[11px] text-[#E06357]">
                  Friction Audit: 4.8 hrs lost/week on syllabus housekeeping
                </div>
              </div>
            </div>

            {/* The StudyMate Flow (Bamboo Celadon & Amber) */}
            <div
              className={`p-1.5 rounded-[2.5rem] bg-white/[0.03] border border-[#4E7A68]/30 ring-1 ring-[#4E7A68]/15 transition-[transform,opacity] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-150 ${
                storyVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
              }`}
            >
              <div className="h-full p-8 rounded-[2rem] bg-[#0E151A]/85 border border-[#4E7A68]/25 space-y-6 flex flex-col justify-between ">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#4E7A68]/20 px-3 py-1 text-xs font-sans text-[#7AB89F] border border-[#4E7A68]/35">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#7AB89F]" />
                    <span>The StudyMate Flow (靜心)</span>
                  </div>
                  <h3 className="font-serif text-2xl text-[#F5EFE6]">Zero-Friction Voice Intelligence</h3>
                  <p className="text-xs text-[#C8BFB2] leading-relaxed">
                    Speak one sentence as you return to your room. StudyMate triages deadline urgency and schedules calibrated focus sprints immediately.
                  </p>
                  <div className="space-y-2.5 pt-2 text-xs">
                    {[
                      'Instant Alexa+ triage: prioritized by due date & syllabus weight',
                      'Cognitively-structured 25m focus & 5m recovery intervals',
                      'Embedded local SQLite engine with sub-millisecond response',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-[#D1E5DC]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#7AB89F] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-[#4E7A68]/25 font-sans text-[11px] text-[#7AB89F] flex items-center justify-between">
                  <span>Latency: &lt; 25ms</span>
                  <span className="font-semibold text-[#E5A952]">100% Student-Sovereign</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* ACT 3: VOICE STUDIO (音 — MULTI-TURN CONVERSATION SCENARIO)     */}
        {/* ============================================================== */}
        <section
          id="voice-studio"
          ref={voiceRef}
          className="px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto space-y-12 overflow-hidden"
        >
          <div
            className={`text-center max-w-xl mx-auto space-y-3 transition-[transform,opacity] duration-700 ease-out ${
              voiceVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'
            }`}
          >
            <span className="font-sans text-xs font-medium px-3 py-1 rounded-full bg-[#E5A952]/10 text-[#E5A952] border border-[#E5A952]/25">
              Act II · Spoken Dialogue (音)
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#F5EFE6]">
              The multi-turn conversational loop.
            </h2>
            <p className="text-sm text-[#A8A196] leading-relaxed">
              Step through a real academic dialog turn. Watch StudyMate preserve context from deadline inquiry to focus timer initiation.
            </p>
          </div>

          {/* Double-Bezel Speech Console */}
          <div
            className={`p-2 rounded-[2.8rem] bg-white/[0.03] border border-white/[0.08] ring-1 ring-white/[0.03] transition-[transform,opacity] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              voiceVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
            }`}
          >
            <div className="p-6 sm:p-10 rounded-[2.3rem] bg-[#121520] border border-white/[0.06] space-y-8">
              {/* Step Selector Tabs (Desk Bookmarks) */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { turn: 1, title: '1. Check Due Dates', seal: '查' },
                  { turn: 2, title: '2. Request Study Plan', seal: '划' },
                  { turn: 3, title: '3. Confirm & Start', seal: '行' },
                ].map((step) => (
                  <button
                    key={step.turn}
                    type="button"
                    onClick={() => setActiveStoryTurn(step.turn)}
                    className={`px-4 py-2 rounded-full text-xs font-sans transition-colors cursor-pointer ${
                      activeStoryTurn === step.turn
                        ? 'bg-[#E5A952] text-[#0E1117] font-bold '
                        : 'bg-white/[0.04] text-[#A8A196] hover:bg-white/[0.08] hover:text-[#F5EFE6]'
                    }`}
                  >
                    <span>{step.seal} · </span>
                    <span>{step.title}</span>
                  </button>
                ))}
              </div>

              {/* Conversation Display Container */}
              <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-[2rem] bg-[#0B0D14] border border-white/[0.06] space-y-5">
                {/* User Voice Utterance */}
                <div
                  className={`flex items-start justify-end gap-3 transition-[transform,opacity] duration-700 ease-out delay-150 ${
                    voiceVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                  }`}
                >
                  <div className="p-4 rounded-2xl bg-[#1C2232] text-[#F5EFE6] text-xs sm:text-sm font-sans border border-white/10 "
                  >
                    {activeStoryTurn === 1 && '"Alexa, what is due this week for my classes?"'}
                    {activeStoryTurn === 2 && '"I have 45 minutes tonight. Can you build me a study plan?"'}
                    {activeStoryTurn === 3 && '"Yes, let\'s start right now!"'}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-sans text-xs text-[#E5A952] shrink-0">
                    ST
                  </div>
                </div>

                {/* Animated Soundwave Visualizer */}
                <div className="flex items-center justify-center gap-1.5 py-2 px-5 rounded-full bg-white/[0.02] border border-white/[0.06] max-w-xs mx-auto">
                  <Mic className="w-3 h-3 text-[#E5A952] mr-2" />
                  {[8, 18, 28, 14, 32, 22, 12, 26, 34, 16, 10].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#E5A952] rounded-full eq-anim-bar opacity-80"
                      style={{
                        height: `${h}px`,
                        animationDelay: `${(i * 0.12).toFixed(2)}s`,
                      }}
                    />
                  ))}
                </div>

                {/* StudyMate Voice Response */}
                <div
                  className={`flex items-start justify-start gap-3 transition-[transform,opacity] duration-700 ease-out delay-300 ${
                    voiceVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#E5A952] text-[#0E1117] flex items-center justify-center font-serif font-bold text-xs shrink-0 ">
                    AI
                  </div>
                  <div className="p-5 rounded-2xl bg-[#141824] border border-white/[0.08] text-[#D8CEBD] text-xs sm:text-sm leading-relaxed max-w-xl space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-sans text-[#E5A952]">
                      <code>
                        {activeStoryTurn === 1 && 'EXECUTED: get_tasks(status="pending")'}
                        {activeStoryTurn === 2 && 'EXECUTED: create_study_plan(duration=45)'}
                        {activeStoryTurn === 3 && 'EXECUTED: start_pomodoro_timer(mins=25)'}
                      </code>
                      <span className="text-[#8B8378]">18ms WAL</span>
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
                        className="text-xs font-medium text-[#E5A952] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Voice Console</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* ACT 4: 5 NATIVE MCP TOOLS (器 — THE STUDY DESK COMPARTMENTS)   */}
        {/* ============================================================== */}
        <section
          id="mcp-architecture"
          ref={mcpRef}
          className="px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto space-y-12 overflow-hidden"
        >
          <div
            className={`text-center max-w-xl mx-auto space-y-3 transition-[transform,opacity] duration-700 ease-out ${
              mcpVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'
            }`}
          >
            <span className="font-sans text-xs font-medium px-3 py-1 rounded-full bg-[#4E7A68]/10 text-[#7AB89F] border border-[#4E7A68]/25">
              Act III · The Native Engine (器)
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#F5EFE6]">
              5 Standard MCP Tools. Zero Fluff.
            </h2>
            <p className="text-sm text-[#A8A196] leading-relaxed">
              StudyMate implements the official Model Context Protocol (MCP) specification over standard JSON-RPC 2.0 with streamable HTTP.
            </p>
          </div>

          {/* Double-Bezel Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mcpTools.map((tool, idx) => {
              const animClass =
                idx % 3 === 0
                  ? mcpVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
                  : idx % 3 === 1
                  ? mcpVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                  : mcpVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16';

              return (
                <div
                  key={tool.name}
                  onClick={() => {
                    if (tool.action) tool.action();
                  }}
                  className={`p-1.5 rounded-[2.2rem] bg-white/[0.03] border border-white/[0.08] ring-1 ring-white/[0.03] hover:border-[#E5A952]/40 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group cursor-pointer ${animClass}`}
                >
                  <div className="h-full p-6 rounded-[1.8rem] bg-[#12151F] border border-white/[0.05] space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-semibold text-[#F5EFE6] group-hover:text-[#E5A952] transition-colors">
                          {tool.name}
                        </code>
                        <span className="font-sans text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-[#A8A196] border border-white/[0.06]">
                          {tool.seal} · {tool.tag}
                        </span>
                      </div>

                      <p className="text-xs text-[#A8A196] leading-relaxed min-h-[36px]">
                        {tool.desc}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="p-2.5 rounded-xl bg-[#0B0D13] border border-white/[0.06] text-[10px] text-[#C8BFB2] truncate">
                        <code>{tool.payload}</code>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#E5A952] font-sans pt-1">
                        <span>Execute Protocol</span>
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Architecture Explainer Card */}
            <div
              onClick={() => setIsArchModalOpen(true)}
              className={`p-1.5 rounded-[2.2rem] bg-white/[0.03] border border-[#E5A952]/30 ring-1 ring-[#E5A952]/10 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-150 cursor-pointer group ${
                mcpVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
              }`}
            >
              <div className="h-full p-6 rounded-[1.8rem] bg-[#161A26] border border-[#E5A952]/20 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#E5A952] text-xs font-medium">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Embedded WAL Engine</span>
                  </div>
                  <h3 className="font-serif text-xl text-[#F5EFE6] mt-2">Local SQLite Sovereignty</h3>
                  <p className="text-xs text-[#A8A196] mt-2 leading-relaxed">
                    StudyMate connects Alexa+ directly to an embedded SQLite database using WAL mode for concurrent reading without locks.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-sans text-[#E5A952] pt-2">
                  <span>System Architecture Spec</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* ACT 5: FOCUS FLOW (心 — GONGBANG POMODORO & VELOCITY)          */}
        {/* ============================================================== */}
        <section
          id="focus-flow"
          ref={focusRef}
          className="px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto space-y-12 overflow-hidden"
        >
          <div
            className={`text-center max-w-xl mx-auto space-y-3 transition-[transform,opacity] duration-700 ease-out ${
              focusVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'
            }`}
          >
            <span className="font-sans text-xs font-medium px-3 py-1 rounded-full bg-[#E5A952]/10 text-[#E5A952] border border-[#E5A952]/25">
              Act IV · Gongbang Study Rhythm (心)
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#F5EFE6]">
              Maintain momentum without academic burnout.
            </h2>
            <p className="text-sm text-[#A8A196] leading-relaxed">
              StudyMate pairs voice execution with structured Pomodoro pacing and velocity metrics across your entire semester.
            </p>
          </div>

          {/* Double-Bezel Focus Rhythm Pods */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Pomodoro Timer Visualizer (5 cols) */}
            <div
              className={`lg:col-span-5 p-1.5 rounded-[2.5rem] bg-white/[0.03] border border-white/[0.08] ring-1 ring-white/[0.03] transition-[transform,opacity] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                focusVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
              }`}
            >
              <div className="h-full p-8 rounded-[2rem] bg-[#121520] border border-white/[0.06] text-center space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#E5A952]/10 px-3 py-1 text-xs font-sans text-[#E5A952] border border-[#E5A952]/25">
                    <Clock className="w-3.5 h-3.5" />
                    <span>25m Focus Block (專注)</span>
                  </div>

                  <div className="font-sans tabular-nums text-5xl font-light text-[#F5EFE6] tracking-widest py-2">
                    {formatTimer(heroTimerSeconds)}
                  </div>

                  <p className="text-xs text-[#A8A196]">
                    Interval 1 of 3: CS 301 Algorithms & Dynamic Programming
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4 ">
                  <button
                    type="button"
                    onClick={() => setHeroTimerRunning(!heroTimerRunning)}
                    className="pl-5 pr-2 py-2 rounded-full text-xs font-semibold text-[#0E1117] transition-colors bg-[#E5A952] hover:bg-[#F2BC66] active:scale-95 flex items-center gap-2 cursor-pointer group"
                  >
                    <span>{heroTimerRunning ? 'Pause Sprint' : heroTimerSeconds < 25 * 60 ? 'Resume' : 'Start Focus'}</span>
                    <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                      {heroTimerRunning ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeroTimerRunning(false);
                      setHeroTimerSeconds(25 * 60);
                    }}
                    className="p-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#D8CEBD] border border-white/[0.06] transition-colors cursor-pointer"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: B5 Study Planner Velocity Graph (7 cols) */}
            <div
              className={`lg:col-span-7 p-1.5 rounded-[2.5rem] bg-white/[0.03] border border-white/[0.08] ring-1 ring-white/[0.03] transition-[transform,opacity] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-150 ${
                focusVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
              }`}
            >
              <div className="h-full p-8 rounded-[2rem] bg-[#121520] border border-white/[0.06] space-y-6 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <h3 className="font-serif text-lg text-[#F5EFE6]">Weekly Focus Velocity</h3>
                    <p className="text-xs text-[#8B8378] font-sans">B5 Gridded Log ∙ 7-Day Investment</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-sans text-[#E5A952] bg-[#E5A952]/10 px-3 py-1 rounded-full border border-[#E5A952]/25">
                    <Flame className="w-3.5 h-3.5 fill-[#E5A952]" />
                    <span>6 Day Streak</span>
                  </div>
                </div>

                {/* Grid Bar Chart */}
                <div className="flex items-end justify-between gap-3 h-32 px-2 pt-2">
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
                      <div className="w-full rounded-lg bg-white/[0.02] h-full flex items-end p-1 border border-white/[0.04]">
                        <div
                          className={`w-full rounded transition-[transform,opacity] duration-500 ${
                            item.active
                              ? 'bg-[#E5A952] '
                              : 'bg-white/15'
                          }`}
                          style={{ height: `${item.h}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-sans ${item.active ? 'text-[#E5A952] font-semibold' : 'text-[#8B8378]'}`}>
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-[#A8A196] ">
                  <span>Weekly Total: <strong className="text-[#F5EFE6]">16.5 hrs</strong> logged</span>
                  <button
                    onClick={() => {
                      if (onOpenPlanner) onOpenPlanner();
                    }}
                    className="text-[#E5A952] hover:underline flex items-center gap-1 font-sans text-xs cursor-pointer"
                  >
                    <span>Full Log View</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* ACT 6: DATA SOVEREIGNTY & PRIVACY (私)                          */}
        {/* ============================================================== */}
        <section
          id="privacy"
          ref={privacyRef}
          className="px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto overflow-hidden"
        >
          <div
            className={`p-1.5 rounded-[2.8rem] bg-white/[0.03] border border-white/[0.08] ring-1 ring-white/[0.03] transition-[transform,opacity] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              privacyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`}
          >
            <div className="p-8 sm:p-10 rounded-[2.3rem] bg-[#121520] border border-white/[0.06] space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#4E7A68]/20 text-[#7AB89F] border border-[#4E7A68]/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-[#F5EFE6]">Student Data Sovereignty (私)</h3>
                    <p className="text-xs text-[#8B8378]">Your coursework records belong exclusively to you</p>
                  </div>
                </div>
                <span className="font-sans text-xs px-3 py-1 rounded-full bg-white/[0.04] text-[#D8CEBD] border border-white/10 self-start md:self-auto">
                  No Subscription Paywalls
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-[#A8A196] leading-relaxed">
                <div
                  className={`p-5 rounded-2xl bg-[#0B0D13] border border-white/[0.06] space-y-2 transition-[transform,opacity] duration-700 ease-out delay-100 ${
                    privacyVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                  }`}
                >
                  <span className="font-serif text-[#F5EFE6] text-sm block">1. Clean Guest Mode</span>
                  <p>Explore and test the workspace with 0 dummy seed clutter. When ready, authenticate to preserve records across devices.</p>
                </div>

                <div
                  className={`p-5 rounded-2xl bg-[#0B0D13] border border-white/[0.06] space-y-2 transition-[transform,opacity] duration-700 ease-out delay-200 ${
                    privacyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                >
                  <span className="font-serif text-[#F5EFE6] text-sm block">2. Local SQLite Engine</span>
                  <p>All coursework records live in an embedded SQLite file with sub-millisecond execution and zero cloud latency.</p>
                </div>

                <div
                  className={`p-5 rounded-2xl bg-[#0B0D13] border border-white/[0.06] space-y-2 transition-[transform,opacity] duration-700 ease-out delay-300 ${
                    privacyVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                  }`}
                >
                  <span className="font-serif text-[#F5EFE6] text-sm block">3. Multi-Surface Clerk Auth</span>
                  <p>Authenticate with Clerk to sync deadlines and Pomodoro logs securely between your laptop and Echo device.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* ACT 7: THE GRAND FINALE CALL TO ACTION (始)                    */}
        {/* ============================================================== */}
        <section
          id="launch"
          ref={launchRef}
          className="px-5 sm:px-8 lg:px-12 max-w-4xl mx-auto text-center space-y-8 overflow-hidden"
        >
          <div
            className={`p-1.5 rounded-[3rem] bg-white/[0.03] border border-white/[0.08] ring-1 ring-white/[0.03] transition-[transform,opacity] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              launchVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-24 scale-95'
            }`}
          >
            <div className="p-10 sm:p-14 rounded-[2.6rem] bg-[#121520] border border-white/[0.06] space-y-6">
              <span className="font-sans text-xs font-medium px-3.5 py-1 rounded-full bg-[#E5A952]/10 text-[#E5A952] border border-[#E5A952]/25">
                Begin Your First Session (始)
              </span>

              <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#F5EFE6] leading-tight">
                Quiet your desk. Triage your week.
              </h2>

              <p className="text-sm sm:text-base text-[#A8A196] max-w-md mx-auto leading-relaxed font-sans">
                Experience the calm of conversational academic management. Free to use with 0 dummy data and sub-millisecond local SQLite.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenDashboard) onOpenDashboard();
                  }}
                  className="pl-6 pr-2 py-2.5 rounded-full text-xs font-semibold text-[#0E1117] transition-colors bg-[#F5EFE6] hover:bg-white active:scale-95 flex items-center gap-3 cursor-pointer group"
                >
                  <span>Launch Study Companion</span>
                  <div className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenVoice) onOpenVoice();
                  }}
                  className="px-6 py-3 rounded-full text-xs font-medium text-[#D8CEBD] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer flex items-center space-x-2"
                >
                  <Mic className="w-3.5 h-3.5 text-[#E5A952]" />
                  <span>Open Voice Console</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* FOOTER: CALM EDITORIAL SIGNATURE                               */}
        {/* ============================================================== */}
        <footer className="px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto pt-12 ">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#8B8378]">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E5A952] text-[#0E1117]">
                <GraduationCap className="h-3.5 w-3.5" />
              </div>
              <span className="font-serif text-[#F5EFE6] font-medium text-sm">StudyMate</span>
              <span className="font-sans text-[10px]">· Alexa+ Model Context Protocol (MCP)</span>
            </div>

            <div className="flex items-center gap-4 font-sans text-[11px]">
              <button onClick={() => scrollToSection('hero')} className="hover:text-[#E5A952] transition-colors cursor-pointer">
                Back to Desk ↑
              </button>
              <span>•</span>
              <button onClick={() => setIsArchModalOpen(true)} className="hover:text-[#E5A952] transition-colors cursor-pointer">
                Technical Spec
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* SYSTEM ARCHITECTURE MODAL */}
      {isArchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-[2.5rem] bg-[#121520] p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E5A952]/10 text-[#E5A952] border border-[#E5A952]/25">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base text-[#F5EFE6]">
                    StudyMate Technical Architecture
                  </h3>
                  <p className="text-xs text-[#8B8378] font-sans">
                    Alexa+ Model Context Protocol (MCP) Add-on Specification
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsArchModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 text-[#A8A196] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 font-sans text-xs">
              <div className="rounded-xl bg-[#0B0D13] p-3.5 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[#E5A952] font-semibold">1. Student Surface</span>
                  <div className="text-[#8B8378] text-[11px] mt-0.5">
                    Spoken voice via Echo device or Clean Web Companion
                  </div>
                </div>
                <span className="rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[10px] text-[#D8CEBD] border border-white/[0.08]">
                  Echo / Web
                </span>
              </div>

              <div className="rounded-xl bg-[#0B0D13] p-3.5 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[#E2B77A] font-semibold">2. Alexa+ Conversational Layer</span>
                  <div className="text-[#8B8378] text-[11px] mt-0.5">
                    LLM tool selection, argument parsing & multi-turn dialog context
                  </div>
                </div>
                <span className="rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[10px] text-[#D8CEBD] border border-white/[0.08]">
                  Amazon Alexa+
                </span>
              </div>

              <div className="rounded-xl bg-[#0B0D13] p-3.5 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[#7AB89F] font-semibold">3. Streamable HTTP Transport</span>
                  <div className="text-[#8B8378] text-[11px] mt-0.5">
                    POST /mcp via Cloudflare Quick Tunnel (Free TLS/HTTPS)
                  </div>
                </div>
                <span className="rounded-full bg-[#4E7A68]/15 px-2.5 py-0.5 text-[10px] text-[#7AB89F] border border-[#4E7A68]/30">
                  Cloudflare Quick Tunnel
                </span>
              </div>

              <div className="rounded-xl bg-[#0B0D13] p-3.5 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[#E5A952] font-semibold">4. StudyMate MCP Server</span>
                  <div className="text-[#8B8378] text-[11px] mt-0.5">
                    @modelcontextprotocol/sdk TypeScript JSON-RPC 2.0 Engine
                  </div>
                </div>
                <span className="rounded-full bg-[#E5A952]/15 px-2.5 py-0.5 text-[10px] text-[#E5A952] border border-[#E5A952]/30">
                  Node 22 + Express
                </span>
              </div>

              <div className="rounded-xl bg-[#0B0D13] p-3.5 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[#C24138] font-semibold">5. Embedded SQLite (WAL Mode)</span>
                  <div className="text-[#8B8378] text-[11px] mt-0.5">
                    Sub-millisecond local-first academic database with zero cloud bills
                  </div>
                </div>
                <span className="rounded-full bg-[#C24138]/15 px-2.5 py-0.5 text-[10px] text-[#E06357] border border-[#C24138]/30">
                  node:sqlite
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsArchModalOpen(false)}
                className="px-4 py-2 text-xs font-sans text-[#8B8378] hover:text-white cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsArchModalOpen(false);
                  if (onOpenDashboard) onOpenDashboard();
                }}
                className="px-5 py-2 rounded-full text-xs font-semibold text-[#0E1117] bg-[#F5EFE6] hover:bg-white cursor-pointer transition-colors"
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
