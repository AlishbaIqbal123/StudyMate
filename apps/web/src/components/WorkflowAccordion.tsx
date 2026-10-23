import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Mic,
  BookOpen,
  Cpu,
  ArrowUpRight,
  Play,
  Volume2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface WorkflowItem {
  id: string;
  category: string;
  title: string;
  quote: string;
  author: string;
  role: string;
  actionText: string;
  icon: React.ElementType;
  bgGradient: string;
  badgeColor: string;
  miniStats: { label: string; value: string };
  onAction?: () => void;
}

interface WorkflowAccordionProps {
  onOpenDashboard?: () => void;
  onOpenVoice?: () => void;
  onOpenPlanner?: () => void;
  onOpenAssignments?: () => void;
}

export const WorkflowAccordion: React.FC<WorkflowAccordionProps> = ({
  onOpenDashboard,
  onOpenVoice,
  onOpenPlanner,
  onOpenAssignments,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const workflows: WorkflowItem[] = [
    {
      id: 'focus',
      category: 'Focus Engine',
      title: 'Distraction-free deep work with native ambient sound synthesis',
      quote:
        'StudyMate eliminated the cognitive friction of starting difficult coursework. With one click or voice command, my 45-minute sprint is active and rain audio begins.',
      author: 'Maya Lin',
      role: 'Cognitive Science & Pre-Law',
      actionText: 'Launch Focus Timer',
      icon: Clock,
      bgGradient: 'from-[#839758]/80 via-[#473C33]/95 to-[#2E2620]',
      badgeColor: 'bg-[#ABC270]/25 text-[#ABC270] border-[#ABC270]/40',
      miniStats: { label: 'Session Length', value: '45m Sprint' },
      onAction: onOpenPlanner,
    },
    {
      id: 'voice',
      category: 'Conversational Voice AI',
      title: 'Natural speech interaction backed by deterministic SQLite tools',
      quote:
        'Instead of digging through 4 syllabus PDFs, I ask Alexa what is due next. StudyMate queries my local database and reads back my exact priority tasks.',
      author: 'David Vance',
      role: 'Computer Systems Engineering',
      actionText: 'Try Voice Console',
      icon: Mic,
      bgGradient: 'from-[#FDA769]/40 via-[#473C33]/95 to-[#2E2620]',
      badgeColor: 'bg-[#FDA769]/25 text-[#FDA769] border-[#FDA769]/40',
      miniStats: { label: 'Latency', value: '85ms Local' },
      onAction: onOpenVoice,
    },
    {
      id: 'assignments',
      category: 'Coursework Kanban',
      title: 'Visual workload velocity and multi-course deadline management',
      quote:
        'The Kanban board gives me instant visual clarity on exam weeks. Dragging cards from in-progress to done with automatic time tracking keeps me honest.',
      author: 'Sophia Chen',
      role: 'Applied Mathematics & Statistics',
      actionText: 'Open Coursework Board',
      icon: BookOpen,
      bgGradient: 'from-[#FEC868]/35 via-[#473C33]/95 to-[#2E2620]',
      badgeColor: 'bg-[#FEC868]/25 text-[#FEC868] border-[#FEC868]/40',
      miniStats: { label: 'Tracked Pace', value: '94% On-Time' },
      onAction: onOpenAssignments,
    },
    {
      id: 'mcp',
      category: 'Local SQLite & MCP',
      title: 'Private offline data sovereignty with standard Streamable HTTP',
      quote:
        'My coursework data stays entirely in my local SQLite database. No tracking pixels, no telemetry selling, and standard Model Context Protocol support.',
      author: 'Marcus Brody',
      role: 'Cybersecurity & Networks',
      actionText: 'Inspect Protocol',
      icon: Cpu,
      bgGradient: 'from-[#ABC270]/50 via-[#473C33]/95 to-[#2E2620]',
      badgeColor: 'bg-[#ABC270]/25 text-[#ABC270] border-[#ABC270]/40',
      miniStats: { label: 'Data Privacy', value: '100% Local DB' },
      onAction: onOpenDashboard,
    },
  ];

  return (
    <div className="w-full">
      {/* Interactive Accordion Strip Container */}
      <div className="flex flex-col lg:flex-row gap-3 h-auto lg:h-[460px] w-full">
        {workflows.map((item, index) => {
          const isActive = activeIndex === index;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.id}
              layout
              transition={{
                layout: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
              }}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border ${
                isActive
                  ? 'lg:flex-[4] flex-1 border-[#839758]/40 shadow-2xl bg-[#473C33]'
                  : 'lg:flex-1 flex-none h-20 lg:h-full border-[#E6E0D0] dark:border-[#473C33] hover:border-[#ABC270] bg-white dark:bg-[#2E2620]'
              }`}
            >
              {/* Collapsed Strip View (Desktop) */}
              {!isActive && (
                <div className="h-full w-full p-4 flex lg:flex-col items-center justify-between transition-opacity duration-300">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF8F1] dark:bg-[#3A3028] border border-[#E6E0D0] dark:border-[#5C4E43] flex items-center justify-center text-[#473C33] dark:text-[#FAF8F1] shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Vertical rotated text label on desktop */}
                  <div className="hidden lg:flex items-center justify-center flex-1 py-6">
                    <span
                      className="font-mono text-xs font-semibold uppercase tracking-widest text-[#786B5E] dark:text-[#B0A494] whitespace-nowrap"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Horizontal text label on mobile/tablet */}
                  <div className="lg:hidden flex-1 px-3 text-left">
                    <span className="font-semibold text-xs text-[#473C33] dark:text-[#FAF8F1] block">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-[#786B5E] dark:text-[#B0A494] truncate block">
                      {item.title}
                    </span>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-[#FAF8F1] dark:bg-[#3A3028] flex items-center justify-center text-[#786B5E] dark:text-[#B0A494] shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

              {/* Expanded Card View */}
              {isActive && (
                <div className="relative h-full w-full p-6 sm:p-8 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#473C33] via-[#3A3028] to-[#231D19] text-[#FAF8F1]">
                  {/* Subtle Background Accent & Vignette */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-60 pointer-events-none`} />
                  <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/20 to-black/50 pointer-events-none" />

                  {/* Card Header */}
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`font-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${item.badgeColor}`}>
                          {item.category}
                        </span>
                        <span className="font-mono text-[10px] text-[#FAF8F1]/70 px-2 py-0.5 rounded bg-white/10 border border-white/15">
                          {item.miniStats.label}: {item.miniStats.value}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#FAF8F1] leading-tight max-w-xl">
                        {item.title}
                      </h3>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-[#FEC868] shrink-0 shadow-lg">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card Center: Authentic Quote & Mini Preview */}
                  <div className="relative z-10 py-4 my-auto max-w-2xl">
                    <blockquote className="text-sm sm:text-base text-[#FAF8F1]/90 leading-relaxed font-light italic border-l-2 border-[#ABC270] pl-4 py-1">
                      "{item.quote}"
                    </blockquote>
                    <div className="mt-3 pl-4 flex items-center space-x-2 text-xs">
                      <span className="font-semibold text-[#FAF8F1]">{item.author}</span>
                      <span className="text-[#FAF8F1]/40">•</span>
                      <span className="text-[#D6CEBF] font-mono">{item.role}</span>
                    </div>
                  </div>

                  {/* Card Footer: Action Button & Pill Indicator */}
                  <div className="relative z-10 pt-4 flex items-center justify-between border-t border-white/10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.onAction) item.onAction();
                        else if (onOpenDashboard) onOpenDashboard();
                      }}
                      className="px-5 py-2.5 rounded-full bg-[#FEC868] hover:bg-[#F5BC56] text-[#473C33] font-bold text-xs flex items-center space-x-2 transition cursor-pointer shadow-lg active:scale-95 group"
                    >
                      <span>{item.actionText}</span>
                      <div className="w-5 h-5 rounded-full bg-[#473C33]/15 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                        <ArrowUpRight className="w-3 h-3 text-[#473C33]" />
                      </div>
                    </button>

                    <div className="flex items-center space-x-1.5 text-xs text-[#FAF8F1]/60 font-mono">
                      <span>0{index + 1}</span>
                      <span>/</span>
                      <span>0{workflows.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
