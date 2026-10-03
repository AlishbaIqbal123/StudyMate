import React from 'react';
import {
  Sparkles,
  Radio,
  ArrowRight,
  Mic,
  Calendar,
  Clock,
  CheckCircle2,
  BarChart3,
  PlusCircle,
  Zap,
  Bot,
  Layers,
  Activity,
  Terminal,
} from 'lucide-react';

interface HeroSectionProps {
  onOpenDashboard: () => void;
  onOpenVoice: () => void;
  onSelectPrompt: (prompt: string) => void;
  activePrompt: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenDashboard,
  onOpenVoice,
  onSelectPrompt,
  activePrompt,
}) => {
  const quickPrompts = [
    {
      text: "What's due this week?",
      label: 'Check Deadlines',
      icon: Calendar,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
    {
      text: 'I have 90 minutes tonight, help me study',
      label: 'Build Study Plan',
      icon: Clock,
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    },
    {
      text: 'Add a task: finish OS assignment, due Monday, high priority',
      label: 'Voice Capture',
      icon: PlusCircle,
      color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    },
    {
      text: 'I finished my linear algebra homework',
      label: 'Update Progress',
      icon: CheckCircle2,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
    {
      text: 'How am I doing in Algorithms?',
      label: 'Course Analytics',
      icon: BarChart3,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
  ];

  return (
    <section className="relative pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Animated Glow Meshes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-cyan-500/20 via-sky-500/15 to-indigo-600/10 blur-[130px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute -top-10 left-1/4 w-[350px] h-[350px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="text-center max-w-4xl mx-auto">
        {/* Glowing Announcement Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/90 border border-cyan-500/30 shadow-lg shadow-cyan-950/40 backdrop-blur-md mb-8 hover:border-cyan-500/60 transition-colors">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
          </span>
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-cyan-300">
            Amazon Alexa+ Hackathon Submission · Model Context Protocol (MCP) Add-on
          </span>
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        {/* Master Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] mb-6">
          Your Academic Life,{' '}
          <span className="block mt-1 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 drop-shadow-sm">
            Organized Through Conversation.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 leading-relaxed font-normal mb-10">
          Transform unstructured syllabi, tight deadlines, and exam anxiety into an intuitive voice
          dialogue on Alexa+, backed by real-time visual synchronization on your student dashboard.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <button
            onClick={onOpenDashboard}
            className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-2.5 cursor-pointer"
          >
            <Layers className="w-5 h-5 text-cyan-100" />
            <span>Launch Student Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </button>

          <button
            onClick={onOpenVoice}
            className="group px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 font-bold text-base shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-2.5 backdrop-blur-md cursor-pointer"
          >
            <Mic className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Open Voice Console</span>
          </button>
        </div>

        {/* Interactive Query Chips */}
        <div className="pt-2 pb-6">
          <div className="flex items-center justify-center space-x-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Select a voice phrase to trigger the live assistant:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto">
            {quickPrompts.map((item) => {
              const Icon = item.icon;
              const isSelected = activePrompt === item.text;
              return (
                <button
                  key={item.text}
                  onClick={() => onSelectPrompt(item.text)}
                  className={`group px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-200 flex items-center space-x-2 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-950/50 scale-[1.02]'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>"{item.text}"</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
