import { useCallback, useEffect, useRef, useState } from 'react';
import { prepareTextForSpeech } from '../utils/speechText';
import type { Language, VoiceName } from '../types/lab';

interface UseVoiceInstructorOptions {
  lang: Language;
  muted: boolean;
  voiceName: VoiceName;
}

const clientAudioCache = new Map<string, string>();

function pickSpeechSynthesisVoice(lang: Language): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const isFemaleVoice = (name: string) =>
    /female|zira|samantha|victoria|karen|moira|tessa|fiona|veena|lekha|heera|kalpana|swara|thilini|aria|jenny|sonia|natasha|google .* female/i.test(
      name
    );

  if (lang === 'si') {
    const siVoices = voices.filter((v) => /si[-_]?LK|^si\b|sinhala/i.test(`${v.lang} ${v.name}`));
    if (siVoices.length) {
      const siMale = siVoices.find((v) => !isFemaleVoice(v.name));
      return siMale || siVoices[0];
    }
  }

  const langVoices = voices.filter((v) => /^en/i.test(v.lang));
  const pool = langVoices.length ? langVoices : voices;

  return (
    pool.find((v) =>
      /male|daniel|david|alex|rishi|aaron|fred|mark|george|arthur|oliver|guy|christopher|ryan|google uk english male/i.test(
        v.name
      )
    ) ||
    pool.find((v) => !isFemaleVoice(v.name)) ||
    pool[0]
  );
}

export function useVoiceInstructor({ lang, muted, voiceName }: UseVoiceInstructorOptions) {
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceSpeaking, setVoiceSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestIdRef = useRef(0);
  const pendingAudioRef = useRef<HTMLAudioElement | null>(null);
  const pendingSpeechRef = useRef<{ text: string; lang: Language; voiceName: VoiceName } | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const speakWithWebSpeech = useCallback(
    (text: string, reqId: number, targetLang: Language, targetVoice: VoiceName) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
      try {
        window.speechSynthesis.cancel();
        const clean = prepareTextForSpeech(text, targetLang).slice(0, 750);
        if (!clean) return false;
        const utter = new SpeechSynthesisUtterance(clean);
        utter.lang = targetLang === 'si' ? 'si-LK' : 'en-GB';
        utter.rate = targetLang === 'si' ? 0.91 : 0.98;
        utter.pitch = 0.90;
        const matchedVoice = pickSpeechSynthesisVoice(targetLang);
        if (matchedVoice) {
          utter.voice = matchedVoice;
        }
        utter.onstart = () => {
          if (reqId === requestIdRef.current) {
            setVoiceSpeaking(true);
          }
        };
        utter.onend = () => {
          if (reqId === requestIdRef.current) {
            setVoiceSpeaking(false);
          }
        };
        utter.onerror = () => {
          if (reqId === requestIdRef.current) {
            setVoiceSpeaking(false);
          }
        };
        setVoiceSpeaking(true);
        window.speechSynthesis.speak(utter);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const stopVoice = useCallback(() => {
    requestIdRef.current += 1;
    pendingAudioRef.current = null;
    pendingSpeechRef.current = null;
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore speechSynthesis cancel failure
      }
    }
    setVoiceSpeaking(false);
    setVoiceLoading(false);
  }, []);

  // Unlock deferred autoplay cleanly on first user gesture
  useEffect(() => {
    const unlock = () => {
      if (muted) return;
      const pending = pendingAudioRef.current;
      if (pending) {
        pendingAudioRef.current = null;
        audioRef.current = pending;
        setVoiceSpeaking(true);
        pending.play().catch(() => {
          setVoiceSpeaking(false);
        });
        return;
      }
      const pendingSpeech = pendingSpeechRef.current;
      if (pendingSpeech) {
        pendingSpeechRef.current = null;
        speakWithWebSpeech(
          pendingSpeech.text,
          requestIdRef.current,
          pendingSpeech.lang,
          pendingSpeech.voiceName
        );
      }
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [muted, speakWithWebSpeech]);

  // Pre-load system SpeechSynthesis voices asynchronously so initial Welcome screen gets male voice immediately
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.getVoices();
    const onVoicesChanged = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.addEventListener?.('voiceschanged', onVoicesChanged);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', onVoicesChanged);
    };
  }, []);

  useEffect(() => {
    if (muted) {
      stopVoice();
    }
  }, [muted, stopVoice]);

  useEffect(() => () => stopVoice(), [stopVoice]);

  const playBase64Audio = useCallback(
    async (base64: string, mimeType: string, isAutoTrigger: boolean, fallbackText: string, reqId: number) => {
      const audio = new Audio(`data:${mimeType};base64,${base64}`);
      audio.onended = () => {
        if (audioRef.current === audio) {
          setVoiceSpeaking(false);
        }
      };
      audio.onerror = () => {
        if (audioRef.current === audio) {
          setVoiceSpeaking(false);
          if (!speakWithWebSpeech(fallbackText, reqId, lang, voiceName) && !isAutoTrigger) {
            setVoiceError('Audio playback failed in browser.');
          }
        }
      };

      try {
        audioRef.current = audio;
        setVoiceSpeaking(true);
        await audio.play();
      } catch (playErr) {
        const errName = playErr instanceof Error ? playErr.name : '';
        setVoiceSpeaking(false);
        if (errName === 'NotAllowedError') {
          pendingAudioRef.current = audio;
        } else if (!speakWithWebSpeech(fallbackText, reqId, lang, voiceName) && !isAutoTrigger) {
          setVoiceError('Audio playback was blocked.');
        }
      }
    },
    [lang, speakWithWebSpeech, voiceName]
  );

  const speakText = useCallback(
    async (text: string, isAutoTrigger = false) => {
      const cleaned = text.trim();
      if (!cleaned || muted) return;

      stopVoice();
      const reqId = ++requestIdRef.current;
      setVoiceError(null);

      const cacheKey = `${voiceName}|${lang}|${cleaned}`;
      const cached = clientAudioCache.get(cacheKey);
      if (cached) {
        await playBase64Audio(cached, 'audio/wav', isAutoTrigger, cleaned, reqId);
        return;
      }

      const executeFetch = async (attempt = 0) => {
        if (reqId !== requestIdRef.current) return;
        setVoiceLoading(true);
        try {
          const res = await fetch('/api/ai/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: cleaned, lang, voiceName, auto: isAutoTrigger }),
          });
          const data = await res.json();
          if (reqId !== requestIdRef.current) return;

          if ((res.status === 429 || data.rateLimited) && attempt < 1) {
            // Wait briefly and retry to keep 100% genuine Gemini Puck voice across all screens
            debounceTimerRef.current = window.setTimeout(() => {
              debounceTimerRef.current = null;
              void executeFetch(attempt + 1);
            }, 2200);
            return;
          }

          if (!res.ok || data.error || !data.audioBase64) {
            // Fall back cleanly to free device Web Speech when offline or Gemini TTS is unavailable
            const started = speakWithWebSpeech(cleaned, reqId, lang, voiceName);
            if (!started && !isAutoTrigger && data.error) {
              setVoiceError(data.error);
            }
            return;
          }

          if (clientAudioCache.size >= 120) {
            const firstKey = clientAudioCache.keys().next().value;
            if (firstKey) clientAudioCache.delete(firstKey);
          }
          clientAudioCache.set(cacheKey, data.audioBase64);
          await playBase64Audio(data.audioBase64, data.mimeType || 'audio/wav', isAutoTrigger, cleaned, reqId);
        } catch {
          if (reqId === requestIdRef.current) {
            const started = speakWithWebSpeech(cleaned, reqId, lang, voiceName);
            if (!started && !isAutoTrigger) {
              setVoiceError('Could not connect to AI Voice Instructor.');
              setVoiceSpeaking(false);
            }
          }
        } finally {
          if (reqId === requestIdRef.current) {
            setVoiceLoading(false);
          }
        }
      };

      if (isAutoTrigger) {
        debounceTimerRef.current = window.setTimeout(() => {
          debounceTimerRef.current = null;
          void executeFetch(0);
        }, 320);
      } else {
        await executeFetch(0);
      }
    },
    [lang, muted, playBase64Audio, speakWithWebSpeech, stopVoice, voiceName]
  );

  return {
    voiceLoading,
    voiceSpeaking,
    voiceError,
    speakText,
    stopVoice,
  };
}
