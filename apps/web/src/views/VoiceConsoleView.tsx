import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Bot,
  User,
  Activity,
  Sparkles,
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
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
      content: `Hello ${studentFirstName}! I am StudyMate, your Alexa+ conversational academic assistant. How can I help organize your studies today? You can ask what's due, request a 45-minute study plan, or ask what to do next.`,
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
    'How should I study for exams?',
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
          recognitionRef.current.abort();
        } catch {}
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

    // If currently listening, stop it
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    // Check for browser Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Microphone speech recognition is not supported in this browser. Please type your question.');
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
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (event.error !== 'no-speech') {
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
      setSpeechError('Could not initialize microphone. Please check permissions.');
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

    // Stop listening if user hits send
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
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

      // If the intent confirms starting a study plan, trigger the timer!
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
        content: `Chat session reset! Ready for a fresh start, ${studentFirstName}. How can I help you today?`,
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-[1400px] mx-auto">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent backdrop-blur-2xl border border-white/15 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Voice Assistant Console
            </h1>
            <span className="font-mono text-xs font-semibold px-3 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase tracking-wider flex items-center space-x-1.5">
              <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
              <span>Multi-Turn Dialogue</span>
            </span>
          </div>
          <p className="text-xs text-white/60 mt-1">
            Real-time conversational intelligence for {currentStudent.name} ({currentStudent.major})
          </p>
        </div>

        {/* Audio & Session Controls */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="flex items-center space-x-2 text-xs font-mono text-white/60 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10">
            <span>Speed:</span>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-16 accent-cyan-400"
            />
            <span className="text-white/80">{speechRate}x</span>
          </div>

          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`px-3.5 py-1.5 rounded-full text-xs border transition flex items-center space-x-1.5 cursor-pointer font-semibold font-mono ${
              ttsEnabled
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                : 'bg-white/[0.04] text-white/60 border-white/10'
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{ttsEnabled ? 'Readback ON' : 'Readback OFF'}</span>
          </button>

          <button
            onClick={handleClearChat}
            className="p-2 rounded-full border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Clear conversation history"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Conversation Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chat Feed & Input (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl space-y-4 flex flex-col justify-between min-h-[620px]">
          {/* Chat Messages Feed */}
          <div className="space-y-5 min-h-[440px] max-h-[560px] overflow-y-auto pr-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start space-x-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Assistant Avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-2xl bg-white/[0.08] border border-white/15 text-cyan-300 flex items-center justify-center shrink-0 shadow-lg">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Content Container */}
                <div
                  className={`rounded-2xl p-4 transition-all ${
                    msg.role === 'user'
                      ? 'max-w-[80%] text-white border border-white/20 shadow-xl'
                      : 'w-full max-w-[88%] bg-white/[0.04] border border-white/10 text-white shadow-lg'
                  }`}
                  style={msg.role === 'user' ? { background: 'linear-gradient(to bottom, #2B2B2B, #101010)' } : undefined}
                >
                  {msg.role === 'user' ? (
                    <div>
                      <p className="text-sm font-sans font-medium leading-relaxed">{msg.content}</p>
                      <span className="text-[10px] font-mono opacity-60 block text-right mt-1.5">
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
                      <p className="text-sm font-sans leading-relaxed text-white">
                        {msg.content}
                      </p>
                      <span className="text-[10px] font-mono text-white/50 block mt-1.5">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Avatar with Student Initials */}
                {msg.role === 'user' && (
                  <div className="w-9 h-9 rounded-2xl bg-white/15 border border-white/20 text-white flex items-center justify-center shrink-0 shadow-md text-xs font-bold font-mono">
                    {studentInitials}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center space-x-3 text-xs text-white/60">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Processing natural language & executing MCP tools...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Voice Microphone Error Notification */}
          {speechError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{speechError}</span>
            </div>
          )}

          {/* Voice Listening Active Waveform Banner */}
          {isListening && (
            <div className="p-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-semibold">Listening to your voice... Speak now!</span>
              </div>
              <button
                type="button"
                onClick={handleToggleListening}
                className="px-3 py-1 rounded-full bg-red-500 text-white font-mono text-[10px] font-semibold cursor-pointer hover:bg-red-600 transition"
              >
                Stop Mic
              </button>
            </div>
          )}

          {/* Input Bar with Direct Microphone Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputUtterance);
            }}
            className="flex items-center space-x-2.5 pt-3 border-t border-white/10"
          >
            {/* Live Microphone Toggle Button */}
            <button
              type="button"
              onClick={handleToggleListening}
              className={`p-3 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-bounce shadow-lg shadow-rose-500/30'
                  : 'bg-white/[0.06] border-white/10 text-cyan-300 hover:bg-white/[0.12] hover:text-white'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input (speak via microphone)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputUtterance}
              onChange={(e) => setInputUtterance(e.target.value)}
              placeholder="Talk to StudyMate (e.g. 'What's due this week?', '45 min study plan', 'yes'...)"
              className="flex-1 bg-white/[0.05] border border-white/15 rounded-full px-5 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition-colors font-sans"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !inputUtterance.trim()}
              className="px-6 py-3 rounded-full text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-xl border border-white/20 disabled:opacity-40 cursor-pointer hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(to bottom, #2B2B2B, #101010)' }}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right Column: 1-Click Conversational Prompt Scenarios (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Interactive Voice Scenarios</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Click any scenario or test multi-turn flow: ask for a study plan, then click "yes" to launch the session!
            </p>

            <div className="space-y-2 pt-2">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="w-full text-left p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 transition-all text-xs text-white flex items-center justify-between group cursor-pointer shadow-md"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <Mic className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-sans font-medium truncate">"{prompt}"</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Run →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Multi-Turn Memory Callout Card */}
          <div className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl space-y-2 text-xs">
            <div className="flex items-center space-x-2 font-bold text-white">
              <Clock className="w-4 h-4 text-cyan-300" />
              <span>Contextual State Memory</span>
            </div>
            <p className="text-white/50 leading-relaxed">
              StudyMate tracks your pending questions across conversational turns. Saying "yes", "sure", or "start" after requesting a study plan will seamlessly initiate your Pomodoro timer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
