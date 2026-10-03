import React from 'react';
import {
  Layers,
  Radio,
  Cpu,
  Database,
  Monitor,
  Lock,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';

export const ArchitectureSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Conversational Layer',
      subtitle: 'Amazon Alexa+',
      desc: 'Performs speech recognition, multi-turn context retention, and selects MCP tools based on student requests.',
      icon: Radio,
      accent: 'from-blue-500 to-cyan-500',
    },
    {
      num: '02',
      title: 'Transport Layer',
      subtitle: 'Streamable HTTP / HTTPS',
      desc: 'Transmits JSON-RPC 2.0 payloads over POST /mcp with OAuth 2.1 + PKCE authentication tokens.',
      icon: Zap,
      accent: 'from-cyan-500 to-sky-500',
    },
    {
      num: '03',
      title: 'MCP Server',
      subtitle: 'Node.js + TypeScript',
      desc: 'Validates inputs with Zod schemas and executes the 5 academic tools in under 50 milliseconds.',
      icon: Cpu,
      accent: 'from-purple-500 to-indigo-500',
    },
    {
      num: '04',
      title: 'Data Persistence',
      subtitle: 'SQLite & Supabase',
      desc: 'Stores student coursework, assignment deadlines, completion rates, and Pomodoro study session logs.',
      icon: Database,
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      num: '05',
      title: 'Visual Surface',
      subtitle: 'React Dashboard',
      desc: 'Live companion web application reflecting every task created, updated, or checked by voice in real time.',
      icon: Monitor,
      accent: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Full-Stack Engineering</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Production Architecture & Security
        </h2>
        <p className="text-slate-300 text-base sm:text-lg">
          Designed for low latency, zero user-credential exposure, and complete separation between
          the voice conversational agent and the visual companion interface.
        </p>
      </div>

      {/* 5-Step Architecture Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative mb-16">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${step.accent} p-[1px]`}>
                    <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500">{step.num}</span>
                </div>

                <h3 className="font-bold text-sm text-white mb-0.5">{step.title}</h3>
                <p className="text-xs font-semibold text-cyan-400 mb-2.5 font-mono">{step.subtitle}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Security & Compliance Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
            <Lock className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-white text-base mb-2">OAuth 2.1 + PKCE Account Linking</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Alexa+ uses PKCE authentication flows. Tokens are securely validated at the handler
            boundary to resolve the student profile without exposing user credentials.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-white text-base mb-2">Zero Hardcoded Secrets</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            All API keys and client credentials are strictly injected via runtime environment
            variables. The repository contains zero committed passwords or private tokens.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
            <Zap className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-white text-base mb-2">Instant Hybrid Fallback</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Built-in client fallback store ensures 100% operational uptime for offline exploration,
            server cold starts, and rapid local demo testing.
          </p>
        </div>
      </div>
    </section>
  );
};
