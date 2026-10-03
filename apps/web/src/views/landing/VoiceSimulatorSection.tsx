import React, { useState } from 'react';
import {
  Mic,
  Volume2,
  Terminal,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Radio,
  Cpu,
  Layers,
  Code2,
} from 'lucide-react';
import { simulateVoice, type VoiceSimulationResponse } from '../../api.js';

interface VoiceSimulatorSectionProps {
  currentPrompt: string;
  onPromptChange: (text: string) => void;
  onOpenDashboard: () => void;
}

export const VoiceSimulatorSection: React.FC<VoiceSimulatorSectionProps> = ({
  currentPrompt,
  onPromptChange,
  onOpenDashboard,
}) => {
  const [response, setResponse] = useState<VoiceSimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const handleSimulate = async () => {
    if (!currentPrompt.trim()) return;
    setIsLoading(true);
    try {
      const res = await simulateVoice(currentPrompt);
      setResponse(res);
    } catch {
      // handled inside api fallback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="voice-demo" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Real-time Conversational Sandbox</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Test the Alexa+ Voice Engine Live
        </h2>
        <p className="text-slate-300 text-base sm:text-lg">
          Speak or type any natural student request. StudyMate resolves the intent, executes the
          appropriate Model Context Protocol tool, and returns conversational speech.
        </p>
      </div>

      {/* Main Glassmorphic Interactive Console */}
      <div className="max-w-4xl mx-auto glass-panel-glow rounded-3xl p-6 sm:p-10 relative overflow-hidden border border-slate-700/60 shadow-2xl">
        {/* Top Header & Equalizer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white">Alexa+ Voice Interface</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Live MCP Link
                </span>
              </div>
              <p className="text-xs text-slate-400">Natural language understanding with context retention</p>
            </div>
          </div>

          {/* Equalizer Visualizer */}
          <div className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 self-start sm:self-auto">
            <Volume2 className="w-4 h-4 text-cyan-400 mr-1.5" />
            <span className="w-1 h-3 bg-cyan-500 rounded-full eq-anim-bar" style={{ animationDelay: '0.1s' }} />
            <span className="w-1 h-5 bg-sky-400 rounded-full eq-anim-bar" style={{ animationDelay: '0.3s' }} />
            <span className="w-1 h-7 bg-cyan-300 rounded-full eq-anim-bar" style={{ animationDelay: '0.2s' }} />
            <span className="w-1 h-4 bg-indigo-400 rounded-full eq-anim-bar" style={{ animationDelay: '0.4s' }} />
            <span className="w-1 h-6 bg-cyan-400 rounded-full eq-anim-bar" style={{ animationDelay: '0.15s' }} />
            <span className="text-[10px] font-mono font-bold text-cyan-300 ml-2">Audio Stream</span>
          </div>
        </div>

        {/* Input Bar */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={currentPrompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="e.g. What's due this week? or I have 60 minutes tonight..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl px-5 py-4 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium"
              onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
            />
          </div>

          <button
            onClick={handleSimulate}
            disabled={isLoading || !currentPrompt.trim()}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Executing Tool...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-cyan-200" />
                <span>Simulate Query</span>
              </>
            )}
          </button>
        </div>

        {/* Voice Result Card */}
        {response ? (
          <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
            {/* Speech Output */}
            <div className="bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-6 shadow-xl relative">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                    Synthesized Alexa+ Voice Output
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 font-semibold">
                    tool: {response.tool}
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
                    intent: {response.intent}
                  </span>
                </div>
              </div>

              <p className="text-white text-base sm:text-lg font-medium leading-relaxed italic">
                "{response.speechResponse}"
              </p>

              {/* JSON inspection toggle */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => setShowJson(!showJson)}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{showJson ? 'Hide Structured Tool Payload' : 'Inspect JSON-RPC Execution Payload'}</span>
                </button>

                <button
                  onClick={onOpenDashboard}
                  className="text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <span>View in Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Raw JSON Code Drawer */}
              {showJson && (
                <pre className="mt-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                  {JSON.stringify(
                    {
                      tool: response.tool,
                      intent: response.intent,
                      arguments: response.arguments,
                      data: response.data,
                    },
                    null,
                    2
                  )}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 text-center text-slate-400 text-sm flex items-center justify-center space-x-3">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Click any quick phrase above or enter your question to run the tool pipeline.</span>
          </div>
        )}
      </div>
    </section>
  );
};
