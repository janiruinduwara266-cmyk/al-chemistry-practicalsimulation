import { useCallback, useEffect, useRef, useState } from 'react';
import type { Language } from '../types/lab';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface UseVoiceAccessOptions {
  lang: Language;
  onTranscript: (transcript: string) => void;
}

export function useVoiceAccess({ lang, onTranscript }: UseVoiceAccessOptions) {
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [voiceAccessError, setVoiceAccessError] = useState<string | null>(null);

  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore stop race
    }
    recognitionRef.current = null;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore stop race
      }
    }
    setListening(false);
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  const startMediaRecorderFallback = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceAccessError(
        lang === 'si'
          ? 'මෙම බ්‍රව්සරයේ හඬ පාලනය (Microphone) සඳහා සහාය නොමැත.'
          : 'Voice microphone access is not supported in this browser.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (blob.size < 200) {
          setListening(false);
          return;
        }
        setTranscribing(true);
        try {
          const base64: string = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const raw = String(reader.result || '');
              const idx = raw.indexOf(',');
              resolve(idx >= 0 ? raw.slice(idx + 1) : raw);
            };
            reader.onerror = () => reject(new Error('Audio read error'));
            reader.readAsDataURL(blob);
          });

          const resp = await fetch('/api/ai/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64,
              mimeType: blob.type || 'audio/webm',
              lang,
            }),
          });
          const data = await resp.json();
          if (!resp.ok || data.error) {
            setVoiceAccessError(data.error || 'Voice transcription failed.');
          } else if (data.transcript) {
            setLastTranscript(data.transcript);
            onTranscriptRef.current(data.transcript);
          }
        } catch {
          setVoiceAccessError(
            lang === 'si'
              ? 'හඬ පණිවිඩය පරිවර්තනය කිරීමට නොහැකි විය.'
              : 'Failed to process voice command.'
          );
        } finally {
          setTranscribing(false);
          setListening(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setListening(true);
    } catch {
      setVoiceAccessError(
        lang === 'si'
          ? 'මයික්‍රොෆෝන් අවසරය ප්‍රතික්ෂේප විය.'
          : 'Microphone permission was denied.'
      );
      setListening(false);
    }
  }, [lang]);

  const startListening = useCallback(() => {
    setVoiceAccessError(null);
    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      void startMediaRecorderFallback();
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.lang = lang === 'si' ? 'si-LK' : 'en-US';
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.continuous = false;

      rec.onresult = (ev) => {
        const lastIdx = ev.results.length - 1;
        if (lastIdx < 0) return;
        const result = ev.results[lastIdx];
        const transcript = result?.[0]?.transcript?.trim() || '';
        if (transcript) {
          setLastTranscript(transcript);
          if (result.isFinal) {
            onTranscriptRef.current(transcript);
            setListening(false);
          }
        }
      };

      rec.onerror = (ev) => {
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
          setVoiceAccessError(
            lang === 'si'
              ? 'මයික්‍රොෆෝන් අවසරය අවශ්‍යයි.'
              : 'Microphone permission required.'
          );
          setListening(false);
        } else {
          // Seamless fallback to Gemini transcription recorder if browser speech rec errors
          recognitionRef.current = null;
          setListening(false);
          void startMediaRecorderFallback();
        }
      };

      rec.onend = () => {
        recognitionRef.current = null;
        setListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      void startMediaRecorderFallback();
    }
  }, [lang, startMediaRecorderFallback]);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }, [listening, startListening, stopListening]);

  return {
    listening,
    transcribing,
    lastTranscript,
    voiceAccessError,
    startListening,
    stopListening,
    toggleListening,
  };
}
