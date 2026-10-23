import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Bot,
  RotateCcw,
  AlertCircle,
  Radio,
  Clock,
} from 'lucide-react';
import {
  simulateVoice,
  getActiveStudent,
  clearConversationState,
  type VoiceSimulationResponse,
  updateTask,
} from '../api.js';
import { usePomodoro } from '../context/PomodoroContext.js';
import { VoiceResponseCard } from '../components/VoiceResponseCard.js';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  result?: VoiceSimulationResponse;
  latencyMs?: number;
}

export const VoiceConsoleView: React.FC<{ onDataChanged: () => void }> = ({ onDataChanged }) => {
  const currentStudent = getActiveStudent();
  const studentFirstName = currentStudent.name.split(' ')[0];
  const studentInitials = currentStudent.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello ${studentFirstName}. I am your Alexa+ study companion. You can ask what assignments are due, request a 45-minute focus plan, or mark completed tasks.`,
      timestamp: 'Just now',
    },
  ]);
  const [inputUtterance, setInputUtterance] = useState('');
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.05);

  // Web Speech API Microphone State
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Global Pomodoro Timer Context
  const {
    startTimer,
    setDuration,
    setTargetCourse,
    setTargetTitle,
    setMode,
    setFloatingWidgetOpen,
  } = usePomodoro();

  const samplePrompts = [
    "What's due this week?",
    '45 min study plan',
    'yes',
    'What should I do next?',
    'How am I doing in Algorithms?',
    'Add a task: Finish OS Lab due Friday',
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        } catch { }
      }
    };
  }, []);

  const handleSpeak = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleListening = () => {
    setSpeechError(null);

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch { }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Microphone speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setInputUtterance(transcript);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'aborted' || event.error === 'no-speech') {
          setIsListening(false);
          return;
        }

        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in browser settings.');
        } else {
          setSpeechError(`Voice recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setSpeechError('Could not initialize microphone.');
      setIsListening(false);
    }
  };

  const handleStartPomodoro = (minutes: number, course: string, title?: string) => {
    setDuration(minutes);
    setTargetCourse(course);
    setTargetTitle(title || `Focused Study Block (${minutes}m)`);
    setMode('focus');
    startTimer();
    setFloatingWidgetOpen(true);
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      await updateTask(taskId, 'done', 45);
      onDataChanged();
    } catch (err) {
      console.warn('Could not update task:', err);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      role: 'user',
      content: text.trim(),
      timestamp: now,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputUtterance('');
    setLoading(true);

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch { }
      setIsListening(false);
    }

    const startTime = performance.now();
    try {
      const result = await simulateVoice(text.trim());
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

      if (result.intent === 'ConfirmStartStudyPlanIntent' && result.data?.action === 'start_timer') {
        const dur = result.data.duration_minutes || 25;
        const crs = result.data.course || 'Coursework';
        handleStartPomodoro(dur, crs, 'Deep Focus Block 1');
      }

      onDataChanged();
    } catch (err) {
      console.error('Error simulating voice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    clearConversationState();
    setMessages([
      {
        role: 'assistant',
        content: `Chat session reset. What would you like to review, ${studentFirstName}?`,
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Top Banner */}
      <div className="rounded-xl p-6 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Alexa+ Voice Console
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 flex items-center space-x-1.5">
              <Radio className="w-3 h-3 text-emerald-500" />
              <span>Multi-Turn Dialogue</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simulate spoken queries to the Alexa+ StudyMate skill. Responses execute deterministic MCP tools against SQLite.
          </p>
        </div>

        {/* Audio & Session Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">
            <span>Speed:</span>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-16 accent-slate-900 dark:accent-white"
            />
            <span className="font-semibold">{speechRate}x</span>
          </div>

          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition flex items-center space-x-1.5 cursor-pointer font-medium ${
              ttsEnabled
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:text-white border-slate-200 dark:border-white/10'
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{ttsEnabled ? 'Spoken Readback ON' : 'Readback OFF'}</span>
          </button>

          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Conversation Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chat Feed & Input (8 cols) */}
        <div className="lg:col-span-8 rounded-xl p-5 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between min-h-[580px] space-y-4">
          {/* Chat Messages Feed */}
          <div className="space-y-4 min-h-[420px] max-h-[540px] overflow-y-auto pr-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start space-x-2.5 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Assistant Avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Message Content Container */}
                <div
                  className={`rounded-lg p-3 text-xs leading-relaxed transition ${
                    msg.role === 'user'
                      ? 'max-w-[80%] bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-medium'
                      : 'w-full max-w-[90%] bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <div>
                      <p>{msg.content}</p>
                      <span className="text-[10px] opacity-60 block text-right mt-1 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  ) : msg.result ? (
                    <VoiceResponseCard
                      result={msg.result}
                      onStartTimer={handleStartPomodoro}
                      onToggleTask={handleToggleTask}
                      onSpeak={handleSpeak}
                    />
                  ) : (
                    <div>
                      <p>{msg.content}</p>
                      <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 dark:bg-white/15 dark:text-white flex items-center justify-center shrink-0 text-xs font-mono font-medium">
                    {studentInitials}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] flex items-center space-x-2 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-slate-600 dark:bg-slate-300 animate-ping" />
                  <span>Processing speech intent & querying SQLite...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Voice Microphone Error Notification */}
          {speechError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{speechError}</span>
            </div>
          )}

          {/* Voice Listening Active Waveform Banner */}
          {isListening && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-medium">Listening... speak your request</span>
              </div>
              <button
                type="button"
                onClick={handleToggleListening}
                className="px-2.5 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-medium cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputUtterance);
            }}
            className="flex items-center space-x-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]"
          >
            {/* Live Microphone Toggle */}
            <button
              type="button"
              onClick={handleToggleListening}
              className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-slate-100 dark:bg-white/[0.05] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1]'
              }`}
              title={isListening ? 'Stop recording' : 'Speak query via microphone'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputUtterance}
              onChange={(e) => setInputUtterance(e.target.value)}
              placeholder="Ask Alexa (e.g. 'What's due this week?', 'Build a 45 min study plan', 'yes'...)"
              className="flex-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-400 transition"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !inputUtterance.trim()}
              className="px-4 py-2 rounded-lg text-white font-medium text-xs transition flex items-center space-x-1.5 disabled:opacity-40 cursor-pointer bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right Column: Prompt Scenarios (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Sample Voice Queries
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Click any query below to test intent resolution and speech playback:
            </p>

            <div className="space-y-1.5 pt-1">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:border-white/[0.06] transition text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">"{prompt}"</span>
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white shrink-0 ml-2">
                    Test →
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] space-y-2 text-xs">
            <div className="flex items-center space-x-2 font-semibold text-slate-800 dark:text-slate-200">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Contextual Multi-Turn Memory</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              StudyMate stores pending conversational state in memory. For example, if you ask for a study plan and then reply "yes", the system recognizes your intent and automatically starts your Pomodoro focus session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
