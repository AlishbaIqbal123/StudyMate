import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type PomodoroMode = 'focus' | 'break';

interface PomodoroContextType {
  timerRunning: boolean;
  secondsRemaining: number;
  totalDuration: number;
  selectedCourse: string;
  focusTitle: string;
  mode: PomodoroMode;
  isFloatingWidgetOpen: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  setDuration: (minutes: number) => void;
  setMode: (mode: PomodoroMode) => void;
  setTargetCourse: (course: string) => void;
  setTargetTitle: (title: string) => void;
  setFloatingWidgetOpen: (open: boolean) => void;
  triggerNotification: (title: string, body: string) => void;
  formatTime: (seconds: number) => string;
  requestNotificationPermission: () => Promise<void>;
  notificationsEnabled: boolean;
}

const PomodoroContext = createContext<PomodoroContextType | null>(null);

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [totalDuration, setTotalDuration] = useState<number>(60);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [mode, setModeState] = useState<PomodoroMode>('focus');
  const [selectedCourse, setSelectedCourse] = useState<string>('CS 420: Distributed Systems');
  const [focusTitle, setFocusTitle] = useState<string>('');
  const [isFloatingWidgetOpen, setFloatingWidgetOpen] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Play pleasant notification chime
  const playChime = useCallback(() => {
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (err) {
      console.warn('Audio chime unavailable:', err);
    }
  }, []);

  // Format time utility
  const formatTime = useCallback((totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  // Request browser desktop notifications
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationsEnabled(perm === 'granted');
    }
  };

  const triggerNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.warn('Could not trigger notification:', err);
      }
    }
  }, []);

  // Auto show floating widget when timer starts or tab is backgrounded
  const startTimer = () => {
    setTimerRunning(true);
    setFloatingWidgetOpen(true);
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const toggleTimer = () => {
    if (timerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const resetTimer = () => {
    setTimerRunning(false);
    const mins = mode === 'focus' ? totalDuration : 10;
    setSecondsRemaining(mins * 60);
  };

  const setDuration = (minutes: number) => {
    setTotalDuration(minutes);
    if (mode === 'focus') {
      setSecondsRemaining(minutes * 60);
      setTimerRunning(false);
    }
  };

  const setMode = (nextMode: PomodoroMode) => {
    setModeState(nextMode);
    setTimerRunning(false);
    const mins = nextMode === 'focus' ? totalDuration : 10;
    setSecondsRemaining(mins * 60);
  };

  const setTargetCourse = (course: string) => {
    setSelectedCourse(course);
  };

  const setTargetTitle = (title: string) => {
    setFocusTitle(title);
  };

  // 1. Timer Countdown Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Timer completed!
            setTimerRunning(false);
            playChime();
            const nextModeLabel = mode === 'focus' ? 'Break Time!' : 'Focus Time!';
            const msg =
              mode === 'focus'
                ? `Great job! Your ${totalDuration}-minute focus session for ${selectedCourse || 'study'} is complete. Take a well-deserved rest.`
                : 'Break interval finished. Ready to jump back into your coursework?';

            triggerNotification(`⏰ Pomodoro: ${nextModeLabel}`, msg);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, secondsRemaining, mode, totalDuration, selectedCourse, playChime, triggerNotification]);

  // 2. Dynamic Browser Title Ticker for Background Tabs
  useEffect(() => {
    const originalTitle = 'StudyMate — Academic Management & Alexa+ Companion';
    if (timerRunning) {
      document.title = `(${formatTime(secondsRemaining)}) [${mode === 'focus' ? 'Focus' : 'Break'}] | StudyMate`;
    } else if (secondsRemaining === 0) {
      document.title = '(00:00) Focus Session Complete! | StudyMate';
    } else {
      document.title = originalTitle;
    }

    return () => {
      document.title = originalTitle;
    };
  }, [timerRunning, secondsRemaining, mode, formatTime]);

  // 3. Tab Visibility Listener (Show floating widget if user returns or leaves)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (timerRunning) {
        setFloatingWidgetOpen(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timerRunning]);

  return (
    <PomodoroContext.Provider
      value={{
        timerRunning,
        secondsRemaining,
        totalDuration,
        selectedCourse,
        focusTitle,
        mode,
        isFloatingWidgetOpen,
        startTimer,
        pauseTimer,
        toggleTimer,
        resetTimer,
        setDuration,
        setMode,
        setTargetCourse,
        setTargetTitle,
        setFloatingWidgetOpen,
        triggerNotification,
        formatTime,
        requestNotificationPermission,
        notificationsEnabled,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
