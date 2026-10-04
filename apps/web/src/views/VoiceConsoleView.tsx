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
      <div className="p-6 rounded-3xl bg-app-card border border-app-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="font-headline text-2xl font-bold tracking-tight text-app-text">
              Voice Assistant Console
            </h1>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 flex items-center space-x-1">
              <Radio className="w-3 h-3 animate-pulse text-cyan-500" />
              <span>Multi-Turn Dialogue</span>
            </span>
          </div>
          <p className="text-xs text-app-muted mt-1">
            Real-time conversational intelligence for {currentStudent.name} ({currentStudent.major})
          </p>
        </div>

        {/* Audio & Session Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-app-muted bg-app-subtle px-3 py-1.5 rounded-xl border border-app-border">
            <span>Speed:</span>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-16 accent-cyan-500"
            />
            <span>{speechRate}x</span>
          </div>

          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs border transition flex items-center space-x-1.5 cursor-pointer font-bold font-mono ${
              ttsEnabled
                ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
                : 'bg-app-subtle text-app-muted border-app-border'
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{ttsEnabled ? 'Audio Readback ON' : 'Audio Readback OFF'}</span>
          </button>

          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl text-xs border border-app-border text-app-muted hover:text-app-text hover:bg-app-subtle transition cursor-pointer"
            title="Clear conversation history"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Conversation Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chat Feed & Input (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-app-card border border-app-border shadow-sm space-y-4 flex flex-col justify-between min-h-[620px]">
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
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Content Container */}
                <div
                  className={`rounded-2xl p-4 transition-all ${
                    msg.role === 'user'
                      ? 'max-w-[80%] bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                      : 'w-full max-w-[88%] bg-app-subtle border border-app-border text-app-text'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <div>
                      <p className="text-sm font-sans font-medium leading-relaxed">{msg.content}</p>
                      <span className="text-[10px] font-mono opacity-80 block text-right mt-1">
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
                      <p className="text-sm font-sans leading-relaxed text-app-text">
                        {msg.content}
                      </p>
                      <span className="text-[10px] font-mono text-app-muted block mt-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Avatar with Student Initials */}
                {msg.role === 'user' && (
                  <div className="w-9 h-9 rounded-2xl bg-slate-800 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-sm text-xs font-bold font-mono">
                    {studentInitials}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-app-subtle border border-app-border flex items-center space-x-3 text-xs text-app-muted">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                  <span>Processing natural language & executing MCP tools...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Voice Microphone Error Notification */}
          {speechError && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{speechError}</span>
            </div>
          )}

          {/* Voice Listening Active Waveform Banner */}
          {isListening && (
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold">Listening to your voice... Speak now!</span>
              </div>
              <button
                type="button"
                onClick={handleToggleListening}
                className="px-2.5 py-1 rounded-lg bg-red-500 text-white font-mono text-[10px] font-bold cursor-pointer hover:bg-red-600 transition"
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
            className="flex items-center space-x-2 pt-3 border-t border-app-border"
          >
            {/* Live Microphone Toggle Button */}
            <button
              type="button"
              onClick={handleToggleListening}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-center cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white border-red-600 animate-bounce shadow-lg shadow-red-500/30'
                  : 'bg-app-subtle border-app-border text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/40'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input (speak via microphone)'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputUtterance}
              onChange={(e) => setInputUtterance(e.target.value)}
              placeholder="Talk to StudyMate (e.g. 'What's due this week?', '45 min study plan', 'yes'...)"
              className="flex-1 bg-app-subtle border border-app-border rounded-2xl px-4 py-3 text-sm text-app-text placeholder-app-muted focus:outline-none focus:border-cyan-500 transition-colors font-sans"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !inputUtterance.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-headline font-bold text-xs transition flex items-center space-x-1.5 shadow-md shadow-cyan-600/20 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right Column: 1-Click Conversational Prompt Scenarios (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-app-card border border-app-border shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-xs font-headline font-bold text-app-text">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span>Interactive Voice Scenarios</span>
            </div>
            <p className="text-xs text-app-muted leading-relaxed">
              Click any scenario or test multi-turn flow: ask for a study plan, then click "yes" to launch the session!
            </p>

            <div className="space-y-2 pt-2">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-2xl bg-app-subtle hover:bg-cyan-500/10 border border-app-border hover:border-cyan-500/40 transition-all text-xs text-app-text flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <Mic className="w-3.5 h-3.5 text-cyan-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-sans font-medium truncate">"{prompt}"</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Run →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Multi-Turn Memory Callout Card */}
          <div className="p-5 rounded-3xl bg-app-card border border-app-border shadow-sm space-y-2 text-xs">
            <div className="flex items-center space-x-2 font-bold text-app-text">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span>Contextual State Memory</span>
            </div>
            <p className="text-app-muted leading-relaxed">
              StudyMate tracks your pending questions across conversational turns. Saying "yes", "sure", or "start" after requesting a study plan will seamlessly initiate your Pomodoro timer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
