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

    ctx.fillStyle = '#473C33';
    ctx.fillRect(0, 0, 340, 190);

    ctx.fillStyle = mode === 'focus' ? '#ABC270' : '#FDA769';
    ctx.fillRect(0, 0, 340, 4);

    ctx.fillStyle = '#FEC868';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(mode === 'focus' ? 'FOCUS SESSION' : 'REST INTERVAL', 20, 30);

    ctx.fillStyle = timerRunning ? '#ABC270' : '#FEC868';
    ctx.beginPath();
    ctx.arc(280, 26, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FAF8F1';
    ctx.font = '10px monospace';
    ctx.fillText(timerRunning ? 'ACTIVE' : 'PAUSED', 290, 30);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px monospace';
    ctx.fillText(formatTime(secondsRemaining), 20, 90);

    ctx.fillStyle = '#E6E0D0';
    ctx.font = '12px sans-serif';
    const label = focusTitle ? `${focusTitle}` : `${selectedCourse || 'Academic Sprint'}`;
    ctx.fillText(label.slice(0, 34), 20, 126);

    ctx.fillStyle = '#2E2620';
    ctx.fillRect(20, 146, 300, 6);

    ctx.fillStyle = '#ABC270';
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
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/20 shadow-lg">
          <span className={`w-2 h-2 rounded-full ${timerRunning ? 'bg-[#ABC270]' : 'bg-[#FEC868]'}`} />
          <span className="font-mono text-xs font-semibold text-[#473C33] dark:text-[#FAF8F1] tabular-nums">
            {formatTime(secondsRemaining)}
          </span>
          <button
            type="button"
            onClick={toggleTimer}
            className="p-1 rounded text-[#63574B] hover:text-[#473C33] dark:hover:text-white cursor-pointer"
          >
            {timerRunning ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          </button>
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded text-[#87796B] hover:text-[#473C33] dark:hover:text-white cursor-pointer"
            title="Expand"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setFloatingWidgetOpen(false)}
            className="p-1 rounded text-[#87796B] hover:text-[#FDA769] cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="w-[320px] rounded-2xl bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/20 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-[#839758] to-[#ABC270] text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${timerRunning ? 'bg-[#FEC868]' : 'bg-white'}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-white">
                {mode === 'focus' ? 'Focus Sprint' : 'Break'}
              </span>
              <span className="text-[10px] font-mono text-white/80">({totalDuration}m)</span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={toggleAmbientSound}
                className={`p-1.5 rounded text-xs transition cursor-pointer ${
                  ambientSoundActive
                    ? 'text-[#473C33] bg-[#FEC868]'
                    : 'text-white/80 hover:text-white'
                }`}
                title={ambientSoundActive ? 'Rain audio active' : 'Turn on rain audio'}
              >
                {ambientSoundActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={triggerPictureInPicture}
                className="p-1.5 rounded text-white/80 hover:text-white cursor-pointer"
                title="Picture-in-Picture window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded text-white/80 hover:text-white cursor-pointer"
                title="Minimize"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setFloatingWidgetOpen(false)}
                className="p-1.5 rounded text-white/80 hover:text-white cursor-pointer"
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
                <div className="font-semibold text-[#473C33] dark:text-[#FAF8F1] truncate">
                  {focusTitle || selectedCourse || 'Study Session'}
                </div>
                <div className="text-[10px] text-[#7A6C5E] dark:text-[#C2B2A1] truncate">
                  {focusTitle ? selectedCourse : 'Active Pomodoro'}
                </div>
              </div>

              {currentScreen !== 'planner' && (
                <button
                  type="button"
                  onClick={onNavigateToPlanner}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-medium text-[#586738] dark:text-[#ABC270] bg-[#ABC270]/15 border border-[#ABC270]/35 flex items-center space-x-1 cursor-pointer shrink-0"
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
                    className="stroke-[#E6E0D0] dark:stroke-white/10"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    className="transition-all duration-500 ease-out stroke-[#ABC270]"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="font-mono text-3xl font-light text-[#473C33] dark:text-[#FAF8F1] tracking-widest tabular-nums">
                  {formatTime(secondsRemaining)}
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] transition cursor-pointer shadow-xs"
                >
                  {timerRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  className="p-1.5 rounded-xl text-[#63574B] hover:text-[#473C33] dark:text-[#C2B2A1] dark:hover:text-white border border-[#E6E0D0] dark:border-[#FEC868]/15 transition cursor-pointer"
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
