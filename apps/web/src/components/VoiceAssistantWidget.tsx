import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Terminal,
  Bot,
  Activity,
  Zap,
  Send,
  AlertCircle,
} from 'lucide-react';
import { simulateVoice, type VoiceSimulationResponse } from '../api.js';
import { usePomodoro } from '../context/PomodoroContext.js';
import { VoiceResponseCard } from './VoiceResponseCard.js';

interface VoiceAssistantWidgetProps {
  onDataChanged: () => void;
}

export const VoiceAssistantWidget: React.FC<VoiceAssistantWidgetProps> = ({
  onDataChanged,
}) => {
  const [inputUtterance, setInputUtterance] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState(
    'StudyMate is standing by. You have active deadlines approaching. Ask what is due or request a study plan!'
  );
  const [activeResult, setActiveResult] = useState<VoiceSimulationResponse | null>(null);
  const [activeToolExecution, setActiveToolExecution] = useState('get_tasks({ status: "pending" })');
  const [activeLatency, setActiveLatency] = useState('95ms');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Web Speech API Microphone
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Pomodoro Context
  const {
    startTimer,
    setDuration,
    setTargetCourse,
    setTargetTitle,
    setMode,
    setFloatingWidgetOpen,
  } = usePomodoro();

  const fastPrompts = [
    "What's due this week?",
    '45 min study plan',
    'yes',
    'What should I do next?',
    'How am I doing in Algorithms?',
    'Add a task: Finish OS lab due Friday',
  ];

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

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

  const handleToggleMic = () => {
    setMicError(null);
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Speech recognition is not supported in this browser. Please type.');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      rec.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setInputUtterance(text);
      };

      rec.onerror = (e: any) => {
        if (e.error === 'not-allowed') {
          setMicError('Microphone permission denied.');
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setMicError('Failed to initialize microphone.');
      setIsListening(false);
    }
  };

  const executeUtterance = async (utteranceText: string) => {
    if (!utteranceText.trim() || loading) return;
    setLoading(true);
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }

    const start = performance.now();
    try {
      const result = await simulateVoice(utteranceText.trim());
      const elapsed = Math.round(performance.now() - start);
      setActiveLatency(`${elapsed}ms`);
      setActiveSpeech(result.speechResponse);
      setActiveResult(result);
      setActiveToolExecution(
        `${result.tool}(${JSON.stringify(result.arguments)})`
      );
      handleSpeak(result.speechResponse);

      if (result.intent === 'ConfirmStartStudyPlanIntent' && result.data?.action === 'start_timer') {
        const dur = result.data.duration_minutes || 25;
        const crs = result.data.course || 'Coursework';
        setDuration(dur);
        setTargetCourse(crs);
        setTargetTitle('Deep Focus Block 1');
        setMode('focus');
        startTimer();
        setFloatingWidgetOpen(true);
      }

      onDataChanged();
      setInputUtterance('');
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl p-6 bg-app-card border border-app-border shadow-sm relative overflow-hidden transition-all">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-app-border gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-headline text-base font-bold text-app-text tracking-tight">
                Alexa+ MCP Voice Assistant
              </h2>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                Active Protocol
              </span>
            </div>
            <p className="text-xs text-app-muted">
              Voice-driven academic orchestrator & live MCP tool execution
            </p>
          </div>
        </div>

        {/* Right Status & Toggle */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-app-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Standing by</span>
          </div>

          <div className="flex items-center space-x-2 pl-3 border-l border-app-border">
            <span className="text-xs font-mono text-app-muted">Readback:</span>
            <button
              onClick={() => {
                if (ttsEnabled && isSpeaking) window.speechSynthesis.cancel();
                setTtsEnabled(!ttsEnabled);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                ttsEnabled ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                  ttsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
              {ttsEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      {/* Center Layout: Visualizer & Structured Response */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 my-5">
        {/* Left: Waveform & Equalizer */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-app-subtle border border-app-border flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-app-muted">
            <span className="flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-cyan-500" />
              <span>Voice Stream</span>
            </span>
            <span className="text-[10px]">48 kHz PCM</span>
          </div>

          {/* Equalizer Visualizer */}
          <div className="flex items-end justify-center space-x-1.5 h-16 py-1">
            {[18, 35, 52, 24, 68, 42, 85, 95, 60, 48, 70, 32, 55, 20].map((height, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isSpeaking || isListening
                    ? 'eq-anim-bar bg-gradient-to-t from-cyan-500 to-blue-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
                style={{
                  height: isSpeaking || isListening ? undefined : `${Math.max(8, height * 0.45)}px`,
                  animationDelay: `${(i * 0.08).toFixed(2)}s`,
                }}
              />
            ))}
          </div>

          <div className="text-center font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
            {isListening ? 'Listening to Microphone...' : isSpeaking ? 'Speaking Output...' : 'Awaiting Voice Input'}
          </div>
        </div>

        {/* Right: Structured Response Card or Speech Bubble */}
        <div className="lg:col-span-8 p-4 rounded-2xl bg-app-subtle border border-app-border flex flex-col justify-between space-y-3">
          {activeResult ? (
            <VoiceResponseCard
              result={activeResult}
              onStartTimer={(minutes, course, title) => {
                setDuration(minutes);
                setTargetCourse(course);
                setTargetTitle(title || `Focus Block (${minutes}m)`);
                setMode('focus');
                startTimer();
                setFloatingWidgetOpen(true);
              }}
              onSpeak={handleSpeak}
            />
          ) : (
            <div>
              <div className="flex items-center justify-between text-xs text-app-muted pb-2 border-b border-app-border mb-2.5">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-headline font-bold text-app-text">
                    Alexa+ Response
                  </span>
                </div>
                <span className="font-mono text-[11px]">{activeLatency} latency</span>
              </div>

              <p className="text-sm font-sans text-app-text leading-relaxed font-medium">
                "{activeSpeech}"
              </p>
            </div>
          )}

          {/* Monospace Tool Call Box */}
          <div className="p-2.5 rounded-xl bg-app-card border border-app-border font-mono text-xs text-cyan-600 dark:text-cyan-400 flex items-center space-x-2 truncate">
            <Terminal className="w-3.5 h-3.5 shrink-0 text-cyan-500" />
            <span className="text-app-muted font-semibold shrink-0">MCP Invocation:</span>
            <span className="truncate text-app-text">{activeToolExecution}</span>
          </div>
        </div>
      </div>

      {/* Mic error notice */}
      {micError && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-center space-x-2 mb-3">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{micError}</span>
        </div>
      )}

      {/* Voice Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          executeUtterance(inputUtterance);
        }}
        className="flex items-center space-x-2 mb-3"
      >
        <button
          type="button"
          onClick={handleToggleMic}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            isListening
              ? 'bg-red-500 text-white border-red-600 animate-pulse'
              : 'bg-app-subtle border-app-border text-cyan-500 hover:bg-cyan-500/10'
          }`}
          title={isListening ? 'Stop listening' : 'Speak into microphone'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputUtterance}
          onChange={(e) => setInputUtterance(e.target.value)}
          placeholder="Type or speak a voice command..."
          className="flex-1 bg-app-subtle border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text placeholder-app-muted focus:outline-none focus:border-cyan-500"
        />

        <button
          type="submit"
          disabled={loading || !inputUtterance.trim()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

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
              className="text-xs font-sans px-3 py-1.5 rounded-xl bg-app-subtle hover:bg-cyan-500/10 text-app-text hover:text-cyan-500 border border-app-border hover:border-cyan-500/40 transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Mic className="w-3 h-3 text-cyan-500 shrink-0" />
              <span>"{prompt}"</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
