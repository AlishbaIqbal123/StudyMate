import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  ExternalLink,
  Cpu,
  GraduationCap,
  Flame,
} from 'lucide-react';

export interface StudyMateHeroProps {
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [activeVoiceDemo, setActiveVoiceDemo] = useState<{
    prompt: string;
    tool: string;
    response: string;
  } | null>(null);

  // Set document title according to project concept
  useEffect(() => {
    document.title = 'StudyMate — Alexa+ Conversational Academic Co-Pilot';
  }, []);

  // Lock body scroll while mobile menu is open
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
      desc: 'Triages upcoming homework & exams prioritized by due date.',
      action: onOpenAssignments || onOpenDashboard,
    },
    {
      name: 'add_task',
      tag: 'Capture',
      desc: 'Zero-friction voice ingestion directly into local SQLite.',
      action: onOpenDashboard,
    },
    {
      name: 'create_study_plan',
      tag: 'Pomodoro',
      desc: 'Generates structured 25-40 min focus sprints with breaks.',
      action: onOpenPlanner || onOpenDashboard,
    },
    {
      name: 'update_progress',
      tag: 'Progress',
      desc: 'Marks assignments complete and recalibrates mastery.',
      action: onOpenDashboard,
    },
    {
      name: 'get_course_progress',
      tag: 'Analytics',
      desc: 'Returns completion percentages & weekly study investment.',
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
          'Invoked get_tasks. Found 2 urgent deadlines: Distributed Systems Lab 3 (Due Friday, 11:59 PM) and Algorithms Problem Set 4 (Due Monday). Would you like me to start a Pomodoro session for Distributed Systems?',
      });
    } else if (text.includes('plan') || text.includes('minute') || text.includes('hour')) {
      setActiveVoiceDemo({
        prompt: promptText,
        tool: 'create_study_plan',
        response:
          'Invoked create_study_plan(minutes: 90). Structured 2 focus blocks: Block 1 (40 min on Raft Consensus), Rest (10 min), Block 2 (40 min on RPC Testing). Focus timer synchronized with your web companion.',
      });
    } else if (text.includes('mark') || text.includes('finish') || text.includes('done')) {
      setActiveVoiceDemo({
        prompt: promptText,
        tool: 'update_progress',
        response:
          'Invoked update_progress(task: "OS Lab 3", status: "done"). Task archived, 2.5 study hours logged. Your Distributed Systems course mastery updated to 85%.',
      });
    } else {
      setActiveVoiceDemo({
        prompt: promptText,
        tool: 'get_tasks',
        response: `Invoked MCP tool for: "${promptText}". Response successfully dispatched across Streamable HTTP with sub-millisecond local SQLite persistence.`,
      });
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden select-none font-sans antialiased bg-[#050508] text-white">
      {/* Background Full-Bleed Video with Dark Cinematic Atmosphere */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260803_192301_9231ed6b-c55c-4a48-909c-4ebe11cf2e11.mp4"
      />

      {/* Subtle Atmospheric Gradient Overlay to Ensure Contrast in all Light/Dark Frame Conditions */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/60 pointer-events-none" />

      {/* Main Content Layout */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Navigation Top Bar */}
        <nav className="flex items-center justify-between px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-inner">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  studymate
                </span>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-cyan-300 uppercase border border-cyan-500/30">
                  Alexa+ MCP
                </span>
              </div>
              <span className="text-[11px] font-medium text-white/50 tracking-wide">
                Build, Ship, Shape · 2026
              </span>
            </div>
          </div>

          {/* Desktop Navigation Pill Cluster */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="relative flex items-center gap-1 rounded-full bg-white/10 px-2 py-1.5 backdrop-blur-xl border border-white/10 shadow-lg">
              <button
                type="button"
                onClick={() => setActiveVoiceDemo(null)}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                Overview
              </button>

              {/* MCP Tools Dropdown Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsToolsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <span>5 MCP Tools</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      isToolsDropdownOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isToolsDropdownOpen && (
                  <div
                    onMouseLeave={() => setIsToolsDropdownOpen(false)}
                    className="absolute left-0 top-full mt-2 w-80 rounded-2xl bg-black/90 p-3 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      Standard MCP Tool Registry
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      {mcpTools.map((t) => (
                        <button
                          key={t.name}
                          type="button"
                          onClick={() => {
                            setIsToolsDropdownOpen(false);
                            if (t.action) t.action();
                            else handleRunVoiceCommand(`Alexa, call ${t.name}`);
                          }}
                          className="flex flex-col items-start rounded-xl p-2.5 text-left transition-all hover:bg-white/10 group"
                        >
                          <div className="flex w-full items-center justify-between">
                            <span className="font-mono text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">
                              {t.name}
                            </span>
                            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-medium text-white/60">
                              {t.tag}
                            </span>
                          </div>
                          <span className="mt-1 text-xs text-white/60 line-clamp-1">
                            {t.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Console */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenVoice) onOpenVoice();
                  else handleRunVoiceCommand("Alexa, what's due this week?");
                }}
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Mic className="h-3.5 w-3.5 text-red-400 animate-pulse" />
                <span>Voice Agent</span>
              </button>

              {/* Telemetry */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenTelemetry) onOpenTelemetry();
                  else setIsArchModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                <span>Telemetry</span>
              </button>

              {/* Architecture Modal Trigger */}
              <button
                type="button"
                onClick={() => setIsArchModalOpen(true)}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                Architecture
              </button>
            </div>

            {/* Launch Companion CTA Button */}
            <button
              type="button"
              onClick={() => {
                if (onOpenDashboard) onOpenDashboard();
                else handleRunVoiceCommand("Alexa, what's due this week?");
              }}
              className="group flex self-stretch items-center gap-2 rounded-full px-6 text-sm font-medium text-white transition-all hover:opacity-95 shadow-xl border border-white/20 active:scale-95"
              style={{
                background: 'linear-gradient(to bottom, #2B2B2B, #101010)',
              }}
            >
              <span>Launch Companion</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl text-white border border-white/15 transition-colors md:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <Menu
              className={`absolute h-5 w-5 transition-all duration-300 ${
                isMenuOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
              }`}
            />
            <X
              className={`absolute h-5 w-5 transition-all duration-300 ${
                isMenuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
              }`}
            />
          </button>
        </nav>

        {/* Mobile Backdrop Overlay */}
        <div
          onClick={() => setIsMenuOpen(false)}
          className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300 md:hidden ${
            isMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />

        {/* Mobile Slide-In Panel */}
        <div
          className={`fixed right-0 top-0 z-40 flex h-full w-80 flex-col bg-black/95 backdrop-blur-2xl border-l border-white/10 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col gap-2 px-6 pt-24">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
              StudyMate Navigation
            </div>
            {[
              {
                label: 'Companion Dashboard',
                action: () => {
                  setIsMenuOpen(false);
                  if (onOpenDashboard) onOpenDashboard();
                },
              },
              {
                label: 'Voice Console (Echo Simulator)',
                action: () => {
                  setIsMenuOpen(false);
                  if (onOpenVoice) onOpenVoice();
                  else handleRunVoiceCommand("Alexa, what's due this week?");
                },
              },
              {
                label: 'Pomodoro Focus Planner',
                action: () => {
                  setIsMenuOpen(false);
                  if (onOpenPlanner) onOpenPlanner();
                },
              },
              {
                label: 'MCP Protocol Telemetry',
                action: () => {
                  setIsMenuOpen(false);
                  if (onOpenTelemetry) onOpenTelemetry();
                },
              },
              {
                label: 'System Architecture',
                action: () => {
                  setIsMenuOpen(false);
                  setIsArchModalOpen(true);
                },
              },
            ].map((link, idx) => (
              <button
                key={link.label}
                type="button"
                onClick={link.action}
                className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-left text-base font-medium text-white/90 transition-colors hover:bg-white/10 ${
                  isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
                }`}
                style={{
                  transition:
                    'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1), transform 400ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms',
                  transitionDelay: isMenuOpen ? `${(idx + 1) * 60}ms` : '0ms',
                }}
              >
                <span>{link.label}</span>
                <ArrowRight className="h-4 w-4 text-white/40" />
              </button>
            ))}
          </div>

          {/* Bottom Mobile CTA */}
          <div className="mt-auto px-6 pb-10">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                if (onOpenDashboard) onOpenDashboard();
              }}
              className="w-full rounded-full py-3.5 text-center text-sm font-semibold text-white shadow-xl border border-white/20"
              style={{
                background: 'linear-gradient(to bottom, #2B2B2B, #101010)',
              }}
            >
              Open Live Dashboard
            </button>
          </div>
        </div>

        {/* Bottom-Anchored Main Content */}
        <main className="mt-auto flex flex-col gap-8 px-5 pb-8 sm:gap-8 sm:px-8 sm:pb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:px-12 lg:pb-14">
          {/* Left: Headline + Alexa+ MCP Concept + Interactive Voice Capsule */}
          <div className="max-w-2xl">
            {/* Hackathon Track Tag */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 backdrop-blur-xl border border-white/15 text-xs font-medium text-white/90 shadow-md">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Track: Alexa+ Model Context Protocol (MCP) Add-on</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
              Your academic life, organized through conversation.
            </h1>

            {/* Subtitle grounded in project PRD */}
            <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg max-w-xl">
              An autonomous academic co-pilot powered by Alexa+. Check deadlines,
              trigger Pomodoro study sprints, and triage coursework simply by speaking
              — zero manual Kanban clicks required.
            </p>

            {/* Interactive Voice Capsule Form */}
            <div className="mt-6 sm:mt-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (voiceQuery.trim()) {
                    handleRunVoiceCommand(voiceQuery);
                  } else {
                    handleRunVoiceCommand("Alexa, what's due this week?");
                  }
                }}
                className="flex flex-col gap-3 sm:inline-flex sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:bg-white sm:p-1.5 shadow-2xl"
              >
                <div className="flex items-center pl-4 pr-2 sm:pr-0">
                  <Mic className="h-4 w-4 text-cyan-600 sm:text-cyan-700 shrink-0" />
                  <input
                    type="text"
                    value={voiceQuery}
                    onChange={(e) => setVoiceQuery(e.target.value)}
                    placeholder="Ask Alexa: 'What's due this week?'"
                    className="w-full bg-white px-3 py-3 text-sm text-gray-900 placeholder-gray-500 outline-none sm:w-80 sm:rounded-none sm:bg-transparent sm:py-2"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 sm:py-2.5 active:scale-95 shrink-0"
                  style={{
                    background: 'linear-gradient(to bottom, #2B2B2B, #101010)',
                  }}
                >
                  Ask Alexa
                </button>
              </form>

              {/* Quick Interactive Spoken Prompt Chips */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-white/50">Try prompt:</span>
                {[
                  "Alexa, what's due this week?",
                  'Alexa, create a 90 min study plan',
                  'Alexa, mark OS lab complete',
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleRunVoiceCommand(chip)}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md border border-white/10 transition-all hover:bg-white/20 hover:text-white active:scale-95"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Simulated Voice Dialog Modal/Banner when Prompt is Executed */}
            {activeVoiceDemo && (
              <div className="mt-4 rounded-2xl bg-black/85 p-4 backdrop-blur-2xl border border-cyan-500/30 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-mono text-xs font-bold text-cyan-300">
                      TOOL: {activeVoiceDemo.tool}
                    </span>
                    <span className="text-[10px] rounded bg-white/10 px-1.5 py-0.5 text-white/60">
                      Streamable HTTP (200 OK)
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
                <div className="mt-2 text-xs text-white/50">
                  Spoken: <span className="text-white font-medium">"{activeVoiceDemo.prompt}"</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/90">
                  <span className="font-semibold text-cyan-400">Alexa+: </span>
                  {activeVoiceDemo.response}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenDashboard) onOpenDashboard();
                    }}
                    className="rounded-lg bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors"
                  >
                    View in Live Companion &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveVoiceDemo(null)}
                    className="text-xs text-white/50 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Two Floating Glass Cards */}
          <div className="flex flex-col gap-4 sm:flex-row lg:w-auto lg:gap-5">
            {/* Card 1: Real-time Stats Card (Silkscreen Font) */}
            <div className="flex flex-col justify-between rounded-2xl bg-white/10 p-5 backdrop-blur-xl border border-white/15 shadow-2xl sm:w-72 sm:p-6 transition-all hover:bg-white/15">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                    MCP Protocol Engine
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live (WAL)
                  </span>
                </div>

                {/* Big Stat Number in Silkscreen font */}
                <div
                  className="mt-3 text-3xl font-normal tracking-tight text-white sm:text-4xl"
                  style={{ fontFamily: "'Silkscreen', cursive" }}
                >
                  42,500+
                </div>

                <p className="mt-3 text-xs leading-relaxed text-white/70">
                  Autonomous MCP tool calls executed with sub-millisecond local SQLite
                  persistence.
                </p>
              </div>

              {/* 5 MCP Tool Pills */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-[10px] uppercase font-semibold text-white/40 mb-2">
                  Standard Tools Active
                </div>
                <div className="flex flex-wrap gap-1">
                  {['get_tasks', 'add_task', 'create_study_plan', 'update_progress', 'get_course_progress'].map(
                    (toolName) => (
                      <span
                        key={toolName}
                        className="font-mono text-[9px] rounded bg-black/40 px-1.5 py-0.5 text-white/80 border border-white/10"
                      >
                        {toolName}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Student & Alexa+ Co-Pilot Card */}
            <div className="flex flex-col justify-between rounded-2xl bg-white/10 p-5 backdrop-blur-xl border border-white/15 shadow-2xl sm:w-72 sm:p-6 transition-all hover:bg-white/15">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-black text-xs font-bold text-white border border-white/20">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                    </div>
                    <span className="text-xs font-semibold text-white tracking-wide">
                      Alexa+ Academic Co-Pilot
                    </span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-white/80 italic">
                  "With StudyMate, students no longer drown in complex task boards. They simply
                  talk to Alexa and stay ahead of deadlines."
                </p>
              </div>

              {/* Student / Builder Info */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 font-bold text-xs text-white shadow-md">
                    AI
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Alishba Iqbal</div>
                    <div className="text-[10px] text-white/60">
                      Lead Builder · CS & AI
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsArchModalOpen(true)}
                  className="rounded-full bg-white/10 p-1.5 text-white/60 hover:text-white transition-colors"
                  title="View Technical Architecture"
                >
                  <Cpu className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* System Architecture Modal */}
      {isArchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-black/90 p-6 sm:p-8 backdrop-blur-2xl border border-white/15 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsArchModalOpen(false)}
              className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white/60 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  StudyMate Technical Architecture
                </h3>
                <p className="text-xs text-white/60">
                  Alexa+ Model Context Protocol (MCP) Add-on Specification
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3 font-mono text-xs">
              <div className="rounded-xl bg-white/5 p-3 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-cyan-400">1. Student Surface</span>
                  <div className="text-white/60 text-[11px] mt-0.5">
                    Spoken voice via Echo device or Sleek Web Companion
                  </div>
                </div>
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300">
                  Voice / Web
                </span>
              </div>

              <div className="rounded-xl bg-white/5 p-3 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-indigo-400">2. Alexa+ Conversational Layer</span>
                  <div className="text-white/60 text-[11px] mt-0.5">
                    LLM tool selection, argument parsing & multi-turn dialog context
                  </div>
                </div>
                <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300">
                  Amazon Alexa+
                </span>
              </div>

              <div className="rounded-xl bg-white/5 p-3 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-emerald-400">3. Streamable HTTP Transport</span>
                  <div className="text-white/60 text-[11px] mt-0.5">
                    POST /mcp via Cloudflare Quick Tunnel (Free TLS/HTTPS)
                  </div>
                </div>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                  Cloudflare Quick Tunnel
                </span>
              </div>

              <div className="rounded-xl bg-white/5 p-3 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-amber-400">4. StudyMate MCP Server</span>
                  <div className="text-white/60 text-[11px] mt-0.5">
                    @modelcontextprotocol/sdk TypeScript JSON-RPC 2.0 Engine
                  </div>
                </div>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">
                  Node 22 + Express
                </span>
              </div>

              <div className="rounded-xl bg-white/5 p-3 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-purple-400">5. Embedded SQLite (WAL Mode)</span>
                  <div className="text-white/60 text-[11px] mt-0.5">
                    Sub-millisecond local-first academic database with zero cloud bills
                  </div>
                </div>
                <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300">
                  node:sqlite
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsArchModalOpen(false)}
                className="rounded-full px-5 py-2 text-xs font-semibold text-white/70 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsArchModalOpen(false);
                  if (onOpenDashboard) onOpenDashboard();
                }}
                className="rounded-full px-5 py-2 text-xs font-semibold text-white shadow-lg border border-white/20"
                style={{
                  background: 'linear-gradient(to bottom, #2B2B2B, #101010)',
                }}
              >
                Explore Live App &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StudyMateHero;
