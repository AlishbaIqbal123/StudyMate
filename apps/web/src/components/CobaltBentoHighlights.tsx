import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ShieldCheck,
  Award,
  Sparkles,
  BookOpen,
  Mic,
  Radio,
  Clock,
  Layers,
  GraduationCap,
} from 'lucide-react';

interface CobaltBentoHighlightsProps {
  onOpenDashboard?: () => void;
  onOpenVoice?: () => void;
  onOpenPlanner?: () => void;
  onOpenAssignments?: () => void;
  onOpenTelemetry?: () => void;
}

export const CobaltBentoHighlights: React.FC<CobaltBentoHighlightsProps> = ({
  onOpenDashboard,
  onOpenVoice,
  onOpenPlanner,
  onOpenAssignments,
  onOpenTelemetry,
}) => {
  return (
    <div className="w-full">
      {/* Asymmetric 3-Column Palette 18 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
        {/* Card 1: Tall Left (4 cols) - StudyMate Notes & Live Transcription */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25 }}
          onClick={onOpenVoice}
          className="lg:col-span-4 rounded-3xl p-7 bg-gradient-to-br from-[#839758] to-[#ABC270] hover:from-[#76894E] hover:to-[#9BB360] text-white flex flex-col justify-between shadow-xl relative overflow-hidden group cursor-pointer transition-colors"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FEC868]/20 rounded-full blur-2xl pointer-events-none" />

          {/* Content Top */}
          <div className="relative z-10 space-y-2.5">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight leading-snug">
              Meet StudyMate Notes: Your speech-to-syllabus assistant
            </h3>
            <p className="text-xs text-white/85 leading-relaxed font-sans">
              Capture insights from lectures, organize deadlines hands-free, and query coursework across your entire semester.
            </p>
          </div>

          {/* Visual Middle: Student Workspace with Frosted Glass Note Overlay */}
          <div className="relative z-10 my-6 py-4 flex flex-col items-center">
            {/* Student illustration / desk silhouette representation */}
            <div className="w-full max-w-[240px] rounded-2xl bg-[#473C33]/35 backdrop-blur-md p-4 border border-white/25 shadow-xl space-y-2 group-hover:translate-y-[-2px] transition-transform">
              <div className="flex items-center justify-between text-[10px] font-mono text-white/80 border-b border-white/15 pb-1.5">
                <span className="flex items-center gap-1 font-semibold text-white">
                  <Mic className="w-3 h-3 text-[#FEC868]" />
                  [CS 420] Exam Prep Note
                </span>
                <span>Just now</span>
              </div>
              <p className="text-[11px] text-white/95 leading-relaxed font-sans">
                "Consensus quorum requires 2f+1 nodes. Focus on Raft log replication and leader heartbeat timeouts."
              </p>
              <div className="flex items-center justify-between text-[9px] font-mono text-[#FEC868] pt-1 font-bold">
                <span>Auto-parsed into Kanban</span>
                <span>Priority: High</span>
              </div>
            </div>
          </div>

          {/* Footer with Circular Action Button */}
          <div className="relative z-10 pt-2 flex items-center justify-between">
            <span className="font-mono text-xs text-white/80">
              Voice Engine
            </span>

            <div className="w-10 h-10 rounded-full bg-[#FEC868] text-[#473C33] shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4 font-bold" />
            </div>
          </div>
        </motion.div>

        {/* Card 2: Tall Middle (4 cols) - Local SQLite & Autonomous Engineering */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25 }}
          onClick={onOpenTelemetry}
          className="lg:col-span-4 rounded-3xl p-7 bg-[#473C33] hover:bg-[#3A3028] text-[#FAF8F1] flex flex-col justify-between shadow-xl relative overflow-hidden group cursor-pointer transition-colors border border-[#5C4E43]"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#ABC270]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Content Top */}
          <div className="relative z-10 space-y-2.5">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#FAF8F1] tracking-tight leading-snug">
              Engineered for Student Privacy, Science & Technology
            </h3>
            <p className="text-xs text-[#D6CEBF] leading-relaxed font-sans">
              From local-first SQLite persistence to deterministic MCP schemas, StudyMate gives students total data sovereignty.
            </p>
          </div>

          {/* Visual Middle: Golden Privacy Shield / Award Emblem */}
          <div className="relative z-10 my-8 flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FDA769] to-[#FEC868] text-[#473C33] flex items-center justify-center shadow-[0_0_40px_rgba(254,200,104,0.3)] group-hover:scale-105 transition-transform border-2 border-white/40">
              <ShieldCheck className="w-12 h-12 text-[#473C33]" />
            </div>
            <div className="mt-4 px-3 py-1 rounded-full bg-[#ABC270]/20 border border-[#ABC270]/40 text-[11px] font-mono text-[#ABC270] font-semibold">
              100% Offline Autonomy
            </div>
          </div>

          {/* Footer with Circular Action Button */}
          <div className="relative z-10 pt-2 flex items-center justify-between">
            <span className="font-mono text-xs text-[#B0A494]">
              MCP Protocol
            </span>

            <div className="w-10 h-10 rounded-full bg-[#ABC270] text-[#473C33] shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4 font-bold" />
            </div>
          </div>
        </motion.div>

        {/* Column 3: Stacked Horizontal Cards (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
          {/* Card 3 (Top Horizontal) */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            onClick={onOpenVoice}
            className="flex-1 rounded-3xl p-6 bg-[#FDA769] hover:bg-[#F59856] text-[#473C33] flex flex-col justify-between shadow-xl relative overflow-hidden group cursor-pointer transition-colors"
          >
            <div className="space-y-2">
              <h4 className="text-lg font-serif font-bold text-[#473C33] tracking-tight leading-snug">
                Amazon Echo & Alexa+ Hardware Integration
              </h4>
              <p className="text-xs text-[#473C33]/85 leading-relaxed font-sans font-medium">
                Pair physical Amazon Echo devices with end-to-end encrypted student authentication at zero extra cost.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="font-mono text-[11px] text-[#473C33]/80 font-semibold">
                Echo Pairing
              </span>

              <div className="w-9 h-9 rounded-full bg-[#473C33] text-[#FAF8F1] shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-3.5 h-3.5 font-bold" />
              </div>
            </div>
          </motion.div>

          {/* Card 4 (Bottom Horizontal) */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            onClick={onOpenPlanner}
            className="flex-1 rounded-3xl p-6 bg-[#FEC868] hover:bg-[#F5BC56] text-[#473C33] flex flex-col justify-between shadow-xl relative overflow-hidden group cursor-pointer transition-colors"
          >
            <div className="space-y-2">
              <h4 className="text-lg font-serif font-bold text-[#473C33] tracking-tight leading-snug">
                Deterministic Semester Pacing & Velocity
              </h4>
              <p className="text-xs text-[#473C33]/85 leading-relaxed font-sans font-medium">
                Dynamic workload balancing, exam countdowns, and automated recovery breaks for university terms.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="font-mono text-[11px] text-[#473C33]/80 font-semibold">
                Pacing Engine
              </span>

              <div className="w-9 h-9 rounded-full bg-[#473C33] text-[#FAF8F1] shadow-lg flex items-center justify-center group-hover:scale-110 transition-all">
                <ArrowUpRight className="w-3.5 h-3.5 font-bold" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
