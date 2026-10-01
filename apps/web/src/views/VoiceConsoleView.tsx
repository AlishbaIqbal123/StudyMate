import React, { useState } from 'react';
import {
  Mic,
  Send,
  Volume2,
  VolumeX,
  Bot,
  User,
  Terminal,
  Activity,
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';
import { simulateVoice, type VoiceSimulationResponse } from '../api.js';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  result?: VoiceSimulationResponse;
  latencyMs?: number;
}

export const VoiceConsoleView: React.FC<{ onDataChanged: () => void }> = ({ onDataChanged }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello Alishba! I am StudyMate, your Alexa+ conversational academic assistant. How can I help organize your studies today?',
      timestamp: '10:00 AM',
    },
  ]);
  const [inputUtterance, setInputUtterance] = useState('');
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.05);

  const samplePrompts = [
    "What's due this week?",
    "Add a task: Finish OS lab for CS 420 due Friday, high priority",
    "I have 90 minutes tonight, help me study",
    "I finished my Linear Algebra homework",
    "How am I doing in Algorithms?",
  ];

  const handleSpeak = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: now,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputUtterance('');
    setLoading(true);

    const startTime = performance.now();
    try {
      const result = await simulateVoice(text);
      const latencyMs = Math.round(performance.now() - startTime);

      const assistantMsg: Message = {
        role: 'assistant',
        content: result.speechResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        result,
        latencyMs,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      handleSpeak(result.speechResponse);
      onDataChanged();
    } catch (err) {
      console.error('Error simulating voice:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-app-card border border-app-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="font-headline text-2xl font-bold tracking-tight text-app-text">
              Voice Assistant
            </h1>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
              Alexa+ Voice
            </span>
          </div>
          <p className="text-xs text-app-muted mt-1">
            Talk with StudyMate to organize coursework, check deadlines, and schedule focus sessions
          </p>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-app-muted">
            <span>Speed:</span>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-20"
            />
            <span>{speechRate}x</span>
          </div>

          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-2 rounded-xl text-xs border transition flex items-center space-x-1.5 cursor-pointer ${
              ttsEnabled
                ? 'bg-themePrimary-500/15 text-[#3895c7] border-themePrimary-500/30'
                : 'bg-app-subtle text-app-muted border-app-border'
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="font-mono text-[11px] font-bold">
              {ttsEnabled ? 'Audio ON' : 'Audio OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Conversation Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chat Feed & Input (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-app-card border border-app-border shadow-sm space-y-4">
          {/* Chat Messages */}
          <div className="space-y-4 min-h-[380px] max-h-[500px] overflow-y-auto pr-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start space-x-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#4f91b0] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-[#4f91b0] text-white shadow-sm'
                      : 'bg-app-subtle border border-app-border text-app-text'
                  }`}
                >
                  <p className="text-sm font-sans leading-relaxed">{msg.content}</p>
                  <div
                    className={`text-[10px] font-mono flex items-center justify-between pt-1 ${
                      msg.role === 'user'
                        ? 'text-white/80'
                        : 'text-app-muted border-t border-app-border'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.latencyMs && <span>{msg.latencyMs}ms roundtrip</span>}
                  </div>

                  {/* Monospace MCP Telemetry line if assistant call */}
                  {msg.result && (
                    <div className="p-2 rounded-lg bg-black/40 text-emerald-400 font-mono text-[11px] space-y-1 border border-white/10">
                      <div className="text-[10px] text-white/70">
                        Tool: <span className="text-[#88bfdd] font-bold">{msg.result.tool}</span> ({msg.result.intent})
                      </div>
                      <div className="truncate text-white/60">
                        Args: {JSON.stringify(msg.result.arguments)}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#163c50] text-white flex items-center justify-center shrink-0 shadow-sm text-xs font-bold font-headline">
                    AK
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputUtterance);
            }}
            className="flex items-center space-x-2 pt-3 border-t border-app-border"
          >
            <input
              type="text"
              value={inputUtterance}
              onChange={(e) => setInputUtterance(e.target.value)}
              placeholder="Ask Alexa+ (e.g. 'What's due this week?' or 'Add a task...')"
              className="flex-1 bg-app-subtle border border-app-border rounded-xl px-4 py-3 text-sm text-app-text placeholder-app-muted focus:outline-none focus:border-[#4f91b0] font-sans"
            />
            <button
              type="submit"
              disabled={loading || !inputUtterance.trim()}
              className="px-5 py-3 rounded-xl bg-[#4f91b0] hover:bg-[#3f748d] text-white font-headline font-bold text-xs transition flex items-center space-x-1.5 shadow-md shadow-[#4f91b0]/20 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right Column: 1-Click Fast Scenarios (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-app-card border border-app-border shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-xs font-headline font-bold text-app-text">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>1-Click Voice Prompts</span>
            </div>
            <p className="text-xs text-app-muted">
              Click any scenario to simulate voice dialogue and inspect live MCP execution:
            </p>

            <div className="space-y-2 pt-1">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-xl bg-app-subtle hover:bg-themePrimary-500/15 border border-app-border hover:border-[#4f91b0]/40 transition text-xs text-app-text flex items-start space-x-2 cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5 text-[#4f91b0] mt-0.5 shrink-0" />
                  <span className="font-sans font-medium">"{prompt}"</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
