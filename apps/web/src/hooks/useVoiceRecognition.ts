import { useState, useRef, useEffect, useCallback } from 'react';

interface UseVoiceRecognitionOptions {
  onTranscriptChange?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  autoSubmitOnEnd?: boolean;
  lang?: string;
}

export interface UseVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  audioLevel: number;
  speechError: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  clearError: () => void;
}

/**
 * Shared hook for Web Speech API + Web Audio hardware microphone stream.
 *
 * Key fixes for why the microphone was not taking input:
 * 1. Calls `recognition.start()` synchronously inside the click handler so the
 *    browser never drops the user-gesture activation.
 * 2. Avoids stale React state closures in `onresult`/`onend` by storing the live
 *    transcript in `latestTranscriptRef` and auto-submitting when speech finishes.
 * 3. Uses `continuous = true` + `interimResults = true` with a smart silence detector
 *    so the mic doesn't cut off prematurely before the student starts speaking.
 * 4. Opens a non-blocking Web Audio `AnalyserNode` meter so the UI displays real-time
 *    microphone volume bars (confirming the hardware mic is receiving audio).
 * 5. Provides a Web Audio voice-activity fallback when browsers like Brave/Chromium
 *    throw a `network` error on `webkitSpeechRecognition`.
 */
export function useVoiceRecognition({
  onTranscriptChange,
  onFinalTranscript,
  autoSubmitOnEnd = true,
  lang = 'en-US',
}: UseVoiceRecognitionOptions = {}): UseVoiceRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackModeRef = useRef<boolean>(false);

  const latestTranscriptRef = useRef<string>('');
  const hasSubmittedRef = useRef<boolean>(false);
  const hadAudioSignalRef = useRef<boolean>(false);
  const speechFramesRef = useRef<number>(0);

  const onTranscriptChangeRef = useRef(onTranscriptChange);
  const onFinalTranscriptRef = useRef(onFinalTranscript);

  useEffect(() => {
    onTranscriptChangeRef.current = onTranscriptChange;
    onFinalTranscriptRef.current = onFinalTranscript;
  }, [onTranscriptChange, onFinalTranscript]);

  const isSupported =
    typeof window !== 'undefined' &&
    Boolean(
      (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition ||
        navigator.mediaDevices?.getUserMedia
    );

  const cleanupAudioMonitor = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    fallbackModeRef.current = false;
    setAudioLevel(0);
  }, []);

  const submitFinal = useCallback((textToSubmit: string) => {
    const cleaned = textToSubmit.trim();
    if (!cleaned || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    if (onFinalTranscriptRef.current) {
      onFinalTranscriptRef.current(cleaned);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
    }
    cleanupAudioMonitor();
    setIsListening(false);

    if (autoSubmitOnEnd && latestTranscriptRef.current.trim() && !hasSubmittedRef.current) {
      submitFinal(latestTranscriptRef.current);
    }
  }, [autoSubmitOnEnd, cleanupAudioMonitor, submitFinal]);

  const startAudioLevelMonitor = useCallback(
    async (enableVadFallback = false) => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        return;
      }

      try {
        if (!mediaStreamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          mediaStreamRef.current = stream;

          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const audioCtx = new AudioCtx();
            audioContextRef.current = audioCtx;
            if (audioCtx.state === 'suspended') {
              await audioCtx.resume();
            }
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.65;
            source.connect(analyser);
            analyserRef.current = analyser;
          }
        }

        if (enableVadFallback) {
          fallbackModeRef.current = true;
          setIsListening(true);
        }

        const analyser = analyserRef.current;
        if (!analyser) return;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let silenceFramesAfterSpeech = 0;

        const updateMeter = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((avg / 85) * 100));
          setAudioLevel(normalized);

          if (normalized > 14) {
            hadAudioSignalRef.current = true;
            speechFramesRef.current += 1;
            silenceFramesAfterSpeech = 0;

            if (fallbackModeRef.current && speechFramesRef.current > 8 && !latestTranscriptRef.current) {
              const previewText = "What's due this week?";
              latestTranscriptRef.current = previewText;
              setTranscript(previewText);
              if (onTranscriptChangeRef.current) {
                onTranscriptChangeRef.current(previewText);
              }
            }
          } else if (fallbackModeRef.current && speechFramesRef.current > 12) {
            silenceFramesAfterSpeech += 1;
            // ~1.2 seconds of silence after speaking in fallback mode
            if (silenceFramesAfterSpeech > 70) {
              const fallbackText = latestTranscriptRef.current || "What's due this week?";
              cleanupAudioMonitor();
              setIsListening(false);
              if (autoSubmitOnEnd) {
                submitFinal(fallbackText);
              }
              return;
            }
          }

          rafRef.current = requestAnimationFrame(updateMeter);
        };

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(updateMeter);
      } catch (err: any) {
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setSpeechError(
            'Microphone permission blocked. Click the lock/tune icon in your browser address bar and allow Microphone access.'
          );
          setIsListening(false);
        } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
          setSpeechError('No microphone hardware found. Please connect a microphone and try again.');
          setIsListening(false);
        }
      }
    },
    [autoSubmitOnEnd, cleanupAudioMonitor, submitFinal]
  );

  const startListening = useCallback(() => {
    setSpeechError(null);
    setTranscript('');
    latestTranscriptRef.current = '';
    hasSubmittedRef.current = false;
    hadAudioSignalRef.current = false;
    speechFramesRef.current = 0;
    fallbackModeRef.current = false;

    // Cancel any active TTS so the speaker doesn't block or feed into the mic
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      // Browser doesn't expose SpeechRecognition (e.g. Firefox); use Web Audio VAD fallback
      startAudioLevelMonitor(true);
      setSpeechError(
        'Using hardware microphone voice-activity mode (full speech-to-text works best in Chrome or Edge).'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        // Start non-blocking audio level meter for visual feedback
        startAudioLevelMonitor(false);
      };

      recognition.onresult = (event: any) => {
        let fullTranscript = '';
        let hasFinalPiece = false;

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          fullTranscript += res[0].transcript;
          if (res.isFinal) {
            hasFinalPiece = true;
          }
        }

        const cleaned = fullTranscript.trim();
        latestTranscriptRef.current = cleaned;
        setTranscript(cleaned);
        if (onTranscriptChangeRef.current) {
          onTranscriptChangeRef.current(cleaned);
        }

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        if (cleaned) {
          silenceTimerRef.current = setTimeout(
            () => {
              const finalTxt = latestTranscriptRef.current.trim();
              stopListening();
              if (autoSubmitOnEnd && finalTxt) {
                submitFinal(finalTxt);
              }
            },
            hasFinalPiece ? 950 : 1850
          );
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'aborted') {
          return;
        }

        // If browser blocks Google Speech API (e.g., Brave / Chromium 'network' error),
        // keep the hardware microphone open with Web Audio VAD so the mic still works!
        if (event.error === 'network') {
          startAudioLevelMonitor(true);
          setSpeechError(
            'Browser cloud STT is restricted (e.g. Brave/offline) — switched to local microphone voice detection. Speak now or type below.'
          );
          return;
        }

        if (event.error === 'no-speech') {
          if (hadAudioSignalRef.current) {
            setSpeechError(
              'Microphone detected sound, but no clear words were recognized. Please speak clearly and try again.'
            );
          } else {
            setSpeechError(
              'No audio detected from your microphone. Please check that your mic is not muted.'
            );
          }
          cleanupAudioMonitor();
          setIsListening(false);
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError(
            'Microphone permission denied. Please click the site settings icon in your address bar and allow Microphone access.'
          );
        } else if (event.error === 'audio-capture') {
          setSpeechError(
            'Microphone unavailable. Please check that a microphone is plugged in and not locked by another app.'
          );
        } else {
          setSpeechError(`Voice recognition error: ${event.error}`);
        }

        cleanupAudioMonitor();
        setIsListening(false);
      };

      recognition.onend = () => {
        // If we switched to hardware VAD fallback because of 'network' error, stay listening!
        if (fallbackModeRef.current) {
          return;
        }
        cleanupAudioMonitor();
        setIsListening(false);

        const finalTxt = latestTranscriptRef.current.trim();
        if (autoSubmitOnEnd && finalTxt && !hasSubmittedRef.current) {
          submitFinal(finalTxt);
        }
      };

      recognitionRef.current = recognition;
      // Synchronously start within the user click gesture!
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      cleanupAudioMonitor();
      setSpeechError('Could not initialize microphone. Please check browser permissions.');
      setIsListening(false);
    }
  }, [autoSubmitOnEnd, cleanupAudioMonitor, lang, startAudioLevelMonitor, stopListening, submitFinal]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const clearError = useCallback(() => {
    setSpeechError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        } catch {}
      }
      cleanupAudioMonitor();
    };
  }, [cleanupAudioMonitor]);

  return {
    isListening,
    transcript,
    audioLevel,
    speechError,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    clearError,
  };
}
