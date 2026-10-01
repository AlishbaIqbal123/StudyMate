import React, { useState } from 'react';
import { Mic, Volume2, VolumeX, Sparkles, Terminal, Bot, Activity, Zap } from 'lucide-react';
import { simulateVoice } from '../api.js';

interface VoiceAssistantWidgetProps {
  onDataChanged: () => void;
}

export const VoiceAssistantWidget: React.FC<VoiceAssistantWidgetProps> = ({
  onDataChanged,
}) => {
  const [inputUtterance, setInputUtterance] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState(
    'StudyMate is standing by. You have 3 tasks due this week, with your OS Lab high on priority.'
  );
  const [activeToolExecution, setActiveToolExecution] = useState('get_tasks({ status: "pending" })');
  const [activeLatency, setActiveLatency] = useState('112ms');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const fastPrompts = [
    "What's due this week?",
    "Add a task: Complete OS Lab due Friday",
    "I have 60 minutes, make a study plan",
    "How am I doing in Operating Systems?",
  ];

  const handleSpeak = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const executeUtterance = async (utteranceText: string) => {
    if (!utteranceText.trim() || loading) return;
    setLoading(true);
    const start = performance.now();
    try {
      const result = await simulateVoice(utteranceText);
      const elapsed = Math.round(performance.now() - start);
      setActiveLatency(`${elapsed}ms`);
      setActiveSpeech(result.speechResponse);
      setActiveToolExecution(
        `${result.tool}(${JSON.stringify(result.arguments)})`
      );
      handleSpeak(result.speechResponse);
      onDataChanged();
      setInputUtterance('');
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl p-6 bg-app-card border border-app-border shadow-sm relative overflow-hidden transition-colors duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-app-border gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/25">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-headline text-base font-bold text-app-text tracking-tight">
                Alexa+ MCP Voice Simulator
              </h2>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 uppercase">
                Active Protocol
              </span>
            </div>
            <p className="text-xs text-app-muted">
              Natural language academic orchestrator & tool execution
            </p>
          </div>
        </div>

        {/* Right Status & Toggle */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Standing by</span>
          </div>

          <div className="flex items-center space-x-2 pl-3 border-l border-app-border">
            <span className="text-xs font-mono text-app-muted">Audio Readback:</span>
            <button
              onClick={() => {
                if (ttsEnabled && isSpeaking) window.speechSynthesis.cancel();
                setTtsEnabled(!ttsEnabled);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                ttsEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                  ttsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-xs font-mono font-bold text-[#4f91b0]">
              {ttsEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      {/* Center 2-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 my-5">
        {/* Left: Waveform & Equalizer */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-app-subtle/60 border border-app-border flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-app-muted">
            <span className="flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-[#4f91b0]" />
              <span>Voice Stream</span>
            </span>
            <span className="text-[10px] text-slate-400">48 kHz PCM</span>
          </div>

          {/* Equalizer Visualizer */}
          <div className="flex items-end justify-center space-x-1.5 h-16 py-1">
            {[18, 35, 52, 24, 68, 42, 85, 95, 60, 48, 70, 32, 55, 20].map((height, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isSpeaking
                    ? 'eq-anim-bar bg-gradient-to-t from-indigo-600 to-indigo-400'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
                style={{
                  height: isSpeaking ? undefined : `${Math.max(8, height * 0.45)}px`,
                  animationDelay: `${(i * 0.08).toFixed(2)}s`,
                }}
              />
            ))}
          </div>

          <div className="text-center font-mono text-xs font-bold text-[#4f91b0]">
            {isSpeaking ? 'Speaking Output...' : 'Awaiting Voice Input'}
          </div>
        </div>

        {/* Right: Speech Response & Tool Execution */}
        <div className="lg:col-span-8 p-4 rounded-xl bg-app-subtle/60 border border-app-border flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-app-muted pb-2 border-b border-app-border mb-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-[#4f91b0]">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span className="font-headline font-bold text-app-text">
                  Alexa+ Response
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">{activeLatency} latency</span>
            </div>

            <p className="text-sm font-sans text-app-text leading-relaxed italic">
              "{activeSpeech}"
            </p>
          </div>

          {/* Monospace Tool Call Box */}
          <div className="p-2.5 rounded-lg bg-app-card border border-app-border font-mono text-xs text-[#4f91b0] flex items-center space-x-2 truncate">
            <Terminal className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
            <span className="text-slate-400 font-semibold shrink-0">MCP Invocation:</span>
            <span className="truncate text-app-text">{activeToolExecution}</span>
          </div>
        </div>
      </div>

      {/* Bottom Fast Prompts Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t border-app-border">
        <span className="text-[11px] font-mono font-bold text-app-muted uppercase tracking-wider shrink-0 flex items-center space-x-1">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Utterances:</span>
        </span>

        <div className="flex flex-wrap gap-2 flex-1">
          {fastPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => executeUtterance(prompt)}
              disabled={loading}
              className="text-xs font-sans px-3 py-1.5 rounded-xl bg-app-subtle hover:bg-indigo-50 dark:hover:bg-indigo-500/15 text-app-text hover:text-indigo-600 dark:hover:text-indigo-400 border border-app-border hover:border-indigo-300 dark:hover:border-indigo-500/40 transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Mic className="w-3 h-3 text-indigo-500 shrink-0" />
              <span>"{prompt}"</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
