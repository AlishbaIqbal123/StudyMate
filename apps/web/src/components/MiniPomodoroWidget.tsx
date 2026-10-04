import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Minus,
  Maximize2,
  Minimize2,
  ExternalLink,
  Sparkles,
  Coffee,
  Volume2,
  VolumeX,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import { usePomodoro } from '../context/PomodoroContext.js';

interface MiniPomodoroWidgetProps {
  onNavigateToPlanner: () => void;
  currentScreen: string;
}

export const MiniPomodoroWidget: React.FC<MiniPomodoroWidgetProps> = ({
  onNavigateToPlanner,
  currentScreen,
}) => {
  const {
    timerRunning,
    secondsRemaining,
    totalDuration,
    selectedCourse,
    focusTitle,
    mode,
    isFloatingWidgetOpen,
    toggleTimer,
    resetTimer,
    setFloatingWidgetOpen,
    formatTime,
  } = usePomodoro();

  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [ambientSoundActive, setAmbientSoundActive] = useState<boolean>(false);

  // Web Audio Ambient Vibe Synthesizer (Zero-cost, browser-native soothing brown noise / rain vibe)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const stopAmbientSound = useCallback(() => {
    try {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.2);
        setTimeout(() => {
          noiseNodeRef.current?.disconnect();
          noiseNodeRef.current = null;
        }, 300);
      }
    } catch (e) {
      console.warn(e);
    }
    setAmbientSoundActive(false);
  }, []);

  const startAmbientSound = useCallback(() => {
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Generate brown noise buffer (calming deep ambient rain/ocean study vibe)
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain boost
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Lowpass filter for cozy ambient warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 1.0);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
      gainNodeRef.current = gain;
      setAmbientSoundActive(true);
    } catch (err) {
      console.warn('Could not start ambient vibe:', err);
    }
  }, []);

  const toggleAmbientSound = () => {
    if (ambientSoundActive) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
  };

  // Canvas PiP Support for OS-level floating window
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const totalSeconds = (mode === 'focus' ? totalDuration : 10) * 60;
  const elapsed = totalSeconds - secondsRemaining;
  const progressPct = Math.min(100, Math.max(0, (elapsed / totalSeconds) * 100));

  // Circular progress math (Radius: 28, Circumference = 2 * PI * 28 ≈ 175.93)
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  // Real-time canvas renderer for Picture-in-Picture window
  const renderPiPCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#080f12';
    ctx.fillRect(0, 0, 340, 190);

    // Accent line at top
    ctx.fillStyle = mode === 'focus' ? '#4f91b0' : '#d97706';
    ctx.fillRect(0, 0, 340, 4);

    // Mode title
    ctx.fillStyle = mode === 'focus' ? '#4f91b0' : '#d97706';
    ctx.font = 'bold 12px "Space Grotesk", sans-serif';
    ctx.fillText(mode === 'focus' ? 'STUDYMATE FOCUS POD' : 'REST BREAK', 22, 32);

    // Status pill (RUNNING vs PAUSED)
    ctx.fillStyle = timerRunning ? '#10b981' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(280, 28, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(timerRunning ? 'ACTIVE' : 'PAUSED', 290, 32);

    // Large Countdown
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 46px monospace';
    ctx.fillText(formatTime(secondsRemaining), 22, 94);

    // Course / Task name
    ctx.fillStyle = '#90c7d5';
    ctx.font = '12px sans-serif';
    const label = focusTitle ? `${focusTitle}` : `${selectedCourse || 'Academic Session'}`;
    ctx.fillText(label.slice(0, 34), 22, 130);

    // Progress percentage label
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`${Math.round(progressPct)}%`, 290, 130);

    // Progress Bar Background & Active Bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(22, 150, 296, 8);

    ctx.fillStyle = mode === 'focus' ? '#4f91b0' : '#f59e0b';
    ctx.fillRect(22, 150, Math.max(4, (296 * progressPct) / 100), 8);
  }, [mode, timerRunning, secondsRemaining, focusTitle, selectedCourse, progressPct, formatTime]);

  // Keep canvas continuously redrawn on countdown change
  useEffect(() => {
    renderPiPCanvas();
  }, [renderPiPCanvas, secondsRemaining, timerRunning, mode, progressPct]);

  const triggerPictureInPicture = async () => {
    try {
      if (!canvasRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = 340;
        canvas.height = 190;
        canvasRef.current = canvas;
      }

      renderPiPCanvas();

      let video = videoRef.current;
      if (!video) {
        video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        videoRef.current = video;
      }

      const stream = canvasRef.current!.captureStream(15);
      video.srcObject = stream;
      await video.play();

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (video.requestPictureInPicture) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('Picture in Picture error:', err);
    }
  };

  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, [stopAmbientSound]);

  if (!isFloatingWidgetOpen && !timerRunning) {
    return null;
  }

  if (!isFloatingWidgetOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-fadeIn select-none">
      {isMinimized ? (
        /* Dynamic Island / Sleek Floating Capsule Pill matching screenshot media_1790800780061.jpg */
        <div className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#071318] border border-slate-700/60 shadow-[0_12px_40px_rgba(0,0,0,0.75)] backdrop-blur-md transition-all duration-300 hover:border-[#4f91b0]/60 hover:shadow-[0_16px_50px_rgba(0,0,0,0.85)]">
          {/* Cyan Glowing / Pulsing Dot */}
          <div className="relative flex items-center justify-center pl-0.5">
            {timerRunning && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#4f91b0] animate-ping opacity-75 absolute" />
            )}
            <span className="w-2.5 h-2.5 rounded-full bg-[#4f91b0] shadow-[0_0_8px_#4f91b0]" />
          </div>

          {/* Live Countdown in Bold Crisp White Text */}
          <span className="font-mono text-sm font-bold text-white tracking-tight leading-none">
            {formatTime(secondsRemaining)}
          </span>

          {/* Subtle Vertical Divider */}
          <span className="h-3.5 w-[1px] bg-slate-700/80 mx-0.5 shrink-0" />

          {/* Quick Play/Pause (Cyan Accent) */}
          <button
            type="button"
            onClick={toggleTimer}
            className="p-1 rounded-md text-[#4f91b0] hover:text-[#72a7c0] hover:bg-white/10 transition cursor-pointer"
            title={timerRunning ? 'Pause timer' : 'Resume timer'}
          >
            {timerRunning ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
          </button>

          {/* Expand / Maximize (Diagonal Double Arrow matching reference) */}
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Expand timer pod"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>

          {/* Close Cross */}
          <button
            type="button"
            onClick={() => setFloatingWidgetOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-white/10 transition cursor-pointer"
            title="Close popup"
          >
            <X className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>
      ) : (
        /* Aesthetic Studio Focus Pod (100% Solid, Glassmorphism Glow, Zero Bleed-Through) */
        <div className="w-[340px] rounded-3xl bg-white dark:bg-[#0c1a20] border border-slate-200 dark:border-[#1f3d47] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] ring-1 ring-black/5 dark:ring-white/10 overflow-hidden transition-all duration-300">
          {/* Glowing Ambient Top Highlight Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#3895c7] via-[#4f91b0] to-[#7650af]" />

          {/* Top Header Row */}
          <div
            onDoubleClick={() => setIsMinimized(true)}
            className="px-4 py-3 bg-slate-50/90 dark:bg-[#0f2129]/90 border-b border-slate-100 dark:border-[#172e38] flex items-center justify-between cursor-default"
            title="Double click to minimize"
          >
            {/* Status Aura Badge */}
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                {timerRunning && (
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      mode === 'focus' ? 'bg-[#4f91b0]' : 'bg-amber-500'
                    }`}
                  />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    mode === 'focus' ? 'bg-[#4f91b0]' : 'bg-amber-500'
                  }`}
                />
              </span>

              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {mode === 'focus' ? 'Deep Focus' : 'Rest Break'}
              </span>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#4f91b0]/15 text-[#3895c7] dark:text-[#90c7d5]">
                {totalDuration}m
              </span>
            </div>

            {/* Quick Action Icons */}
            <div className="flex items-center space-x-1">
              {/* Ambient Rain / Brown Noise Vibe Toggle */}
              <button
                type="button"
                onClick={toggleAmbientSound}
                className={`p-1.5 rounded-xl transition cursor-pointer ${
                  ambientSoundActive
                    ? 'bg-[#4f91b0] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-[#1a3440]'
                }`}
                title={ambientSoundActive ? 'Turn off ambient sound' : 'Turn on relaxing study white noise'}
              >
                {ambientSoundActive ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Popout Picture-in-Picture */}
              <button
                type="button"
                onClick={triggerPictureInPicture}
                className="p-1.5 rounded-xl text-slate-400 hover:text-[#4f91b0] hover:bg-slate-200/50 dark:hover:bg-[#1a3440] transition cursor-pointer"
                title="Pop out desktop Picture-in-Picture (Always on top)"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              {/* Minimize to Pill */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#1a3440] transition cursor-pointer"
                title="Minimize to capsule pill"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => setFloatingWidgetOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                title="Close floating pod"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="p-4 space-y-4 bg-white dark:bg-[#0c1a20]">
            {/* Subject / Task Information Pill */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-[#13252d] border border-slate-100 dark:border-[#1f3d47]">
              <div className="min-w-0 flex-1">
                <div className="font-headline text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {focusTitle || selectedCourse || 'Academic Study Session'}
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {focusTitle ? selectedCourse : 'Active Pomodoro Interval'}
                </div>
              </div>

              {currentScreen !== 'planner' && (
                <button
                  type="button"
                  onClick={onNavigateToPlanner}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-headline font-bold text-[#3895c7] dark:text-[#90c7d5] hover:bg-[#4f91b0]/15 transition flex items-center space-x-1 shrink-0 cursor-pointer"
                >
                  <span>Planner</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Circular Timer & Controls Centerpiece */}
            <div className="flex items-center justify-between px-1">
              {/* Left: Animated Circular Progress Clock */}
              <div className="flex items-center space-x-3.5">
                <div className="relative flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      className="stroke-slate-100 dark:stroke-slate-800"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      className="transition-all duration-700 ease-out"
                      stroke={mode === 'focus' ? '#4f91b0' : '#d97706'}
                      strokeWidth="5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {Math.round(progressPct)}%
                    </span>
                  </div>
                </div>

                {/* Live Countdown Numbers */}
                <div>
                  <div className="font-mono text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                    {formatTime(secondsRemaining)}
                  </div>
                  <div className="text-[10px] font-headline font-medium text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                    <Flame className="w-3 h-3 text-amber-500" />
                    <span>{mode === 'focus' ? (timerRunning ? 'Keep momentum' : 'Paused') : 'Breathe & relax'}</span>
                  </div>
                </div>
              </div>

              {/* Right: Primary Play/Pause & Reset Action */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className={`px-3.5 py-2.5 rounded-2xl font-headline text-xs font-bold text-white transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center space-x-1.5 cursor-pointer ${
                    timerRunning
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/25'
                      : 'bg-gradient-to-r from-[#3895c7] to-[#4f91b0] hover:from-[#2d779f] hover:to-[#3895c7] shadow-[#4f91b0]/30'
                  }`}
                >
                  {timerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#13252d] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-[#1c3642] transition cursor-pointer border border-transparent dark:border-[#1f3d47]"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick footer with minimize toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#172e38] text-[10px] text-slate-400">
              <span className="font-mono">StudyMate Studio Pod</span>
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="hover:text-[#4f91b0] transition flex items-center space-x-1 cursor-pointer font-headline font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-[#90c7d5]"
                title="Minimize into compact floating pill"
              >
                <span>Minimize to pill</span>
                <Minus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Aesthetic Segmented Bottom Glow Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 overflow-hidden">
            <div
              className={`h-1.5 transition-all duration-500 ease-out ${
                mode === 'focus'
                  ? 'bg-gradient-to-r from-[#3895c7] to-[#4f91b0]'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
