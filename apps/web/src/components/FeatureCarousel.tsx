import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Clock,
  Mic,
  BookOpen,
  BarChart3,
  Cpu,
  Play,
  Volume2,
  CheckCircle2,
  Calendar,
  Flame,
  Terminal,
} from 'lucide-react';

interface FeatureCardItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge: string;
  theme: 'blue' | 'indigo' | 'emerald' | 'amber' | 'cyan';
  renderPreview: () => React.ReactNode;
  onAction?: () => void;
}

interface FeatureCarouselProps {
  onOpenDashboard?: () => void;
  onOpenVoice?: () => void;
  onOpenPlanner?: () => void;
  onOpenAssignments?: () => void;
  onOpenTelemetry?: () => void;
}

export const FeatureCarousel: React.FC<FeatureCarouselProps> = ({
  onOpenDashboard,
  onOpenVoice,
  onOpenPlanner,
  onOpenAssignments,
  onOpenTelemetry,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);

    const cardWidth = 340;
    const newIndex = Math.min(
      cards.length - 1,
      Math.max(0, Math.round(scrollLeft / cardWidth))
    );
    setActiveIndex(newIndex);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      checkScroll();
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scrollBy = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 340;
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
      setActiveIndex(index);
    }
  };

  const cards: FeatureCardItem[] = [
    {
      id: 'voice-studio',
      category: 'Voice Studio',
      title: 'Conversational Voice AI',
      subtitle: 'Natural language query resolution and speech feedback with zero latency.',
      icon: Mic,
      badge: 'Alexa+ Compatible',
      theme: 'blue',
      onAction: onOpenVoice,
      renderPreview: () => (
        <div className="rounded-xl bg-[#2E2620] border border-[#5C4E43] p-4 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-[#B0A494] font-mono">
            <span>Query Transcript</span>
            <span className="text-[#FEC868]">00:01:24</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#ABC270]/15 border border-[#ABC270]/30 text-[#FAF8F1] text-xs">
            <span className="text-[10px] text-[#ABC270] font-mono block font-semibold">Student:</span>
            "What should I focus on for my Operating Systems lab tonight?"
          </div>

          {/* Audio Waveform Simulator */}
          <div className="flex items-center justify-center gap-1 py-1 h-7">
            {[40, 70, 30, 90, 60, 100, 45, 80, 55, 95, 35, 65].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-[#FDA769] rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 0.08}s`,
                  animationDuration: '1.2s',
                }}
              />
            ))}
          </div>

          <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-[#FAF8F1] text-xs font-sans">
            <span className="text-[10px] text-[#FEC868] font-mono block font-semibold">StudyMate Response:</span>
            Schedule a 45m block on Virtual Memory Paging. Due in 48 hours.
          </div>
        </div>
      ),
    },
    {
      id: 'focus-desk',
      category: 'Focus Engine',
      title: 'Smart Pomodoro & Rain Audio',
      subtitle: 'Calibrated study intervals with native Web Audio rain synthesizer.',
      icon: Clock,
      badge: 'Browser Native',
      theme: 'indigo',
      onAction: onOpenPlanner,
      renderPreview: () => (
        <div className="rounded-xl bg-[#2E2620] border border-[#5C4E43] p-4 space-y-4 shadow-inner text-center">
          <div className="flex items-center justify-between text-[11px] text-[#B0A494] font-mono">
            <span>Interval Timer</span>
            <span className="text-[#ABC270] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ABC270] animate-ping" />
              Active
            </span>
          </div>

          <div className="py-1">
            <div className="font-mono text-4xl font-bold tracking-widest text-[#FAF8F1] tabular-nums">
              24:45
            </div>
            <span className="text-[10px] font-mono uppercase text-[#B0A494] mt-1 block">
              Deep Work • CS 420 Distributed Systems
            </span>
          </div>

          <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-xs text-[#FAF8F1]">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-[#FEC868]" />
              <span className="text-[11px]">Brown Noise Synthesizer</span>
            </div>
            <span className="text-[10px] font-mono text-[#ABC270]">Playing</span>
          </div>

          <div className="flex justify-center gap-1.5">
            {['25m', '45m', '60m'].map((m, i) => (
              <span
                key={m}
                className={`px-3 py-1 rounded text-[11px] font-mono ${
                  i === 0
                    ? 'bg-[#ABC270] text-[#473C33] font-bold'
                    : 'bg-white/10 text-[#FAF8F1]/60'
                }`}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'kanban-board',
      category: 'Coursework Board',
      title: 'Visual Multi-Course Kanban',
      subtitle: 'Interactive drag-and-drop assignment columns with priority weighting.',
      icon: BookOpen,
      badge: 'Drag & Drop',
      theme: 'emerald',
      onAction: onOpenAssignments,
      renderPreview: () => (
        <div className="rounded-xl bg-[#2E2620] border border-[#5C4E43] p-3.5 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-[#B0A494] font-mono">
            <span>Kanban Pipeline</span>
            <span className="text-[#ABC270]">4 Active</span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#FAF8F1]">Distributed Consensus Lab</span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#FDA769] text-[#473C33] font-bold">
                  High
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#B0A494] font-mono">
                <span>CS 420</span>
                <span>Due in 2 days</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#FAF8F1]">Real Analysis Problem Set 4</span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#FEC868] text-[#473C33] font-bold">
                  Med
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#B0A494] font-mono">
                <span>MATH 312</span>
                <span>Due Friday</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-[#ABC270]/20 border border-[#ABC270]/30 text-xs flex items-center justify-between text-[#ABC270]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Compiler Optimization Quiz</span>
              </span>
              <span className="font-mono text-[10px] font-bold">Done</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'mastery-radar',
      category: 'Analytics & Pace',
      title: 'Course Mastery & Habit Velocity',
      subtitle: 'Real-time velocity tracking across days, weeks, and semesters.',
      icon: BarChart3,
      badge: 'Habit Radar',
      theme: 'amber',
      onAction: onOpenDashboard,
      renderPreview: () => (
        <div className="rounded-xl bg-[#2E2620] border border-[#5C4E43] p-4 space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-[#B0A494] font-mono">
            <span>Weekly Velocity</span>
            <span className="text-[#FEC868] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#FDA769]" />
              7 Day Streak
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-[#FAF8F1] mb-1">
                <span>Algorithms & Complexity</span>
                <span className="font-mono text-[#ABC270]">84%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#ABC270] h-full w-[84%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#FAF8F1] mb-1">
                <span>Operating Systems</span>
                <span className="font-mono text-[#FEC868]">68%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#FEC868] h-full w-[68%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#FAF8F1] mb-1">
                <span>Linear Algebra</span>
                <span className="font-mono text-[#FDA769]">92%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#FDA769] h-full w-[92%]" />
              </div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex justify-between text-[11px] text-[#B0A494] font-mono">
            <span>Total Study: 14.5 hrs</span>
            <span className="text-[#ABC270]">+2.5 hrs vs last wk</span>
          </div>
        </div>
      ),
    },
    {
      id: 'mcp-terminal',
      category: 'MCP Protocol',
      title: 'Local SQLite & Echo Tunnel',
      subtitle: 'Deterministic JSON-RPC tools with zero third-party cloud lock-in.',
      icon: Cpu,
      badge: 'Model Context Protocol',
      theme: 'cyan',
      onAction: onOpenTelemetry,
      renderPreview: () => (
        <div className="rounded-xl bg-[#2E2620] border border-[#5C4E43] p-3.5 space-y-2.5 shadow-inner font-mono text-[11px]">
          <div className="flex items-center justify-between text-[10px] text-[#B0A494] border-b border-white/10 pb-1.5">
            <span className="flex items-center gap-1.5 text-[#ABC270]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ABC270]" />
              POST /mcp
            </span>
            <span>200 OK • 0.4ms</span>
          </div>

          <pre className="text-[#FEC868] text-[10px] leading-tight overflow-x-auto p-2 rounded bg-[#231D19] border border-white/5">
{`{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get_tasks",
    "arguments": {
      "status": "pending"
    }
  }
}`}
          </pre>

          <div className="flex items-center justify-between text-[10px] text-[#B0A494] pt-1">
            <span>DB: SQLite Local</span>
            <span className="text-[#FDA769] font-semibold">Zero Cloud Dependency</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Horizontal Carousel Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-5 overflow-x-auto scrollbar-none py-2 px-1 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {cards.map((card, idx) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="min-w-[310px] sm:min-w-[350px] max-w-[360px] rounded-3xl bg-[#473C33] text-[#FAF8F1] border border-[#5C4E43] hover:border-[#ABC270] p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group snap-start transition-all"
            >
              {/* Card Ambient Highlight Glow */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-[#ABC270]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#ABC270]/20 transition-all duration-500" />

              {/* Card Top: Header & Badge */}
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-[#FEC868]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-[10px] font-semibold text-[#D6CEBF] uppercase tracking-wider">
                      {card.category}
                    </span>
                  </div>

                  <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#ABC270]/20 text-[#ABC270] border border-[#ABC270]/35 font-semibold">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-[#FAF8F1] tracking-tight pt-1">
                  {card.title}
                </h3>
                <p className="text-xs text-[#D6CEBF] leading-relaxed">
                  {card.subtitle}
                </p>
              </div>

              {/* Card Middle: Rich Realistic In-Card Interactive Preview */}
              <div className="relative z-10 my-4">
                {card.renderPreview()}
              </div>

              {/* Card Bottom: Circular Action Button */}
              <div className="relative z-10 pt-2 flex items-center justify-between border-t border-white/10">
                <span className="text-[11px] font-mono text-[#B0A494]">
                  Feature 0{idx + 1}
                </span>

                <button
                  type="button"
                  onClick={card.onAction || onOpenDashboard}
                  className="w-10 h-10 rounded-full bg-[#FEC868] hover:bg-[#F5BC56] text-[#473C33] flex items-center justify-center transition shadow-lg group-hover:scale-110 active:scale-95 cursor-pointer"
                  title={`Open ${card.title}`}
                >
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Controls: Left/Right Buttons & Dots Pagination */}
      <div className="flex items-center justify-between pt-2 px-1">
        {/* Pagination Dots */}
        <div className="flex items-center space-x-1.5">
          {cards.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToCard(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx
                  ? 'w-6 bg-[#ABC270]'
                  : 'w-2 bg-[#D6CEBF] dark:bg-white/20 hover:bg-[#839758]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Arrow Navigation Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => scrollBy(-360)}
            disabled={!canScrollLeft}
            className="w-9 h-9 rounded-full bg-white dark:bg-[#2E2620] hover:bg-[#FAF8F1] dark:hover:bg-[#3A3028] text-[#473C33] dark:text-[#FAF8F1] border border-[#E6E0D0] dark:border-[#473C33] flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(360)}
            disabled={!canScrollRight}
            className="w-9 h-9 rounded-full bg-white dark:bg-[#2E2620] hover:bg-[#FAF8F1] dark:hover:bg-[#3A3028] text-[#473C33] dark:text-[#FAF8F1] border border-[#E6E0D0] dark:border-[#473C33] flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
