import React from 'react';
import { Sparkles, ArrowRight, LayoutDashboard, Mic } from 'lucide-react';

interface CtaSectionProps {
  onOpenDashboard: () => void;
  onOpenVoice: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({
  onOpenDashboard,
  onOpenVoice,
}) => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl p-8 sm:p-14 overflow-hidden border border-cyan-500/30 glass-panel-glow text-center shadow-2xl">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/20 blur-[90px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-600/15 blur-[90px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive Student Experience</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
          Ready to Experience Voice-First Academic Organization?
        </h2>

        <p className="text-slate-300 max-w-2xl mx-auto mb-10 text-base sm:text-lg leading-relaxed">
          Open the companion dashboard to manage your assignments, test Pomodoro study sessions, or
          speak directly to the conversational agent.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onOpenDashboard}
            className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-cyan-500/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-2.5 cursor-pointer"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Launch Companion Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenVoice}
            className="px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold text-base shadow-md transition-all duration-300 flex items-center space-x-2.5 cursor-pointer"
          >
            <Mic className="w-5 h-5 text-cyan-400" />
            <span>Open Voice Console</span>
          </button>
        </div>
      </div>
    </section>
  );
};
