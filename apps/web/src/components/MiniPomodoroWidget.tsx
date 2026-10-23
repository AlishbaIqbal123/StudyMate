import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Minus,
  ExternalLink,
  Volume2,
  VolumeX,
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

  // Web Audio Ambient Synthesizer
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

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

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
      console.warn('Could not start ambient sound:', err);
    }
  }, []);

  const toggleAmbientSound = () => {
    if (ambientSoundActive) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
  };

  // Canvas PiP Support
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const totalSeconds = (mode === 'focus' ? totalDuration : 10) * 60;
  const elapsed = totalSeconds - secondsRemaining;
  const progressPct = Math.min(100, Math.max(0, (elapsed / totalSeconds) * 100));

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  const renderPiPCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#090B10';
    ctx.fillRect(0, 0, 340, 190);

    ctx.fillStyle = mode === 'focus' ? '#4f46e5' : '#d97706';
    ctx.fillRect(0, 0, 340, 3);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(mode === 'focus' ? 'FOCUS SESSION' : 'REST INTERVAL', 20, 30);

    ctx.fillStyle = timerRunning ? '#10b981' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(280, 26, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(timerRunning ? 'ACTIVE' : 'PAUSED', 290, 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px monospace';
    ctx.fillText(formatTime(secondsRemaining), 20, 90);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px sans-serif';
    const label = focusTitle ? `${focusTitle}` : `${selectedCourse || 'Academic Sprint'}`;
    ctx.fillText(label.slice(0, 34), 20, 126);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(20, 146, 300, 6);

    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(20, 146, Math.max(4, (300 * progressPct) / 100), 6);
  }, [mode, timerRunning, secondsRemaining, focusTitle, selectedCourse, progressPct, formatTime]);

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
      console.warn('PiP error:', err);
    }
  };

  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, [stopAmbientSound]);

  if (!isFloatingWidgetOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-fadeIn select-none">
      {isMinimized ? (
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/15 shadow-lg">
          <span className={`w-2 h-2 rounded-full ${timerRunning ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white tabular-nums">
            {formatTime(secondsRemaining)}
          </span>
          <button
            type="button"
            onClick={toggleTimer}
            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            {timerRunning ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          </button>
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            title="Expand"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setFloatingWidgetOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="w-[320px] rounded-xl bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-white/[0.08] shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${timerRunning ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {mode === 'focus' ? 'Focus Sprint' : 'Break'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">({totalDuration}m)</span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={toggleAmbientSound}
                className={`p-1.5 rounded text-xs transition cursor-pointer ${
                  ambientSoundActive
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                }`}
                title={ambientSoundActive ? 'Rain audio active' : 'Turn on rain audio'}
              >
                {ambientSoundActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={triggerPictureInPicture}
                className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                title="Picture-in-Picture window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                title="Minimize"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setFloatingWidgetOpen(false)}
                className="p-1.5 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-900 dark:text-white truncate">
                  {focusTitle || selectedCourse || 'Study Session'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {focusTitle ? selectedCourse : 'Active Pomodoro'}
                </div>
              </div>

              {currentScreen !== 'planner' && (
                <button
                  type="button"
                  onClick={onNavigateToPlanner}
                  className="px-2 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 flex items-center space-x-1 cursor-pointer shrink-0"
                >
                  <span>Planner</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Countdown & Controls */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-3">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    className="stroke-slate-200 dark:stroke-white/10"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    className="transition-all duration-500 ease-out stroke-slate-900 dark:stroke-white"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="font-mono text-3xl font-light text-slate-900 dark:text-white tracking-widest tabular-nums">
                  {formatTime(secondsRemaining)}
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition cursor-pointer"
                >
                  {timerRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-white/10 transition cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
