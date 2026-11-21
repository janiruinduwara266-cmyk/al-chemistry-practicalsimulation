import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Bot,
  Loader2,
  Mic,
  MicOff,
  Send,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import { useBackgroundAssets } from '../contexts/BackgroundAssetsContext';
import type { Language, StudentProfile, UnitRoman, VoiceName } from '../types/lab';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  spokenScript?: string;
}

interface AIAssistantDrawerProps {
  open: boolean;
  lang: Language;
  unitRoman: UnitRoman;
  experimentTitle: string;
  stepTitle: string;
  stepTask: string;
  stepInstruction: string;
  liveTelemetry: string;
  muted: boolean;
  voiceSpeaking: boolean;
  voiceLoading: boolean;
  voiceError: string | null;
  voiceName: VoiceName;
  studentProfile?: StudentProfile | null;
  onSpeakText: (text: string) => void;
  onStopVoice: () => void;
  onClose: () => void;
}

export function AIAssistantDrawer({
  open,
  lang,
  unitRoman,
  experimentTitle,
  stepTitle,
  stepTask,
  stepInstruction,
  liveTelemetry,
  muted,
  voiceSpeaking,
  voiceLoading,
  voiceError,
  voiceName,
  studentProfile,
  onSpeakText,
  onStopVoice,
  onClose,
}: AIAssistantDrawerProps) {
  const { assets } = useBackgroundAssets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [followups, setFollowups] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!open) return null;

  const quickPrompts =
    lang === 'si'
      ? [
          'මෙම පියවර පැහැදිලි කරන්න',
          'මෙහි ප්‍රධාන සමීකරණය කුමක්ද?',
          'විභාගයට වැදගත් නිරීක්ෂණ මොනවාද?',
        ]
      : [
          'Explain this step simply',
          'What is the key exam equation?',
          'Why do we observe this color/result?',
        ];

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    setChatError(null);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    const applyLocalTutorFallback = () => {
      const student = (studentProfile?.username || studentProfile?.name || '').trim();
      const prefix = student ? `${student}, ` : '';
      const reply =
        lang === 'si'
          ? `${prefix}දැන් ඔබ සිටින්නේ "${stepTitle}" පියවරේයි.\n\nකළ යුතු කාර්යය: ${stepTask}\nඋපදෙස: ${stepInstruction}\n\nසජීවී දත්ත: ${liveTelemetry}`
          : `${prefix}You are on "${stepTitle}" (Unit ${unitRoman} · ${experimentTitle}).\n\nTask: ${stepTask}\nGuidance: ${stepInstruction}\n\nLive Reading: ${liveTelemetry}`;
      const spokenScript =
        lang === 'si'
          ? `${prefix}${stepTitle}. ${stepTask}. ${stepInstruction}`
          : `${prefix}${stepTitle}. ${stepTask}. ${stepInstruction}`;

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: reply,
        spokenScript,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setFollowups(quickPrompts.slice(0, 2));
      if (!muted) {
        onSpeakText(spokenScript);
      }
    };

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          lang,
          unitRoman,
          experimentTitle,
          stepTitle,
          stepTask,
          liveTelemetry,
          studentName: studentProfile?.username || studentProfile?.name || '',
          studentAge: studentProfile?.age,
          history: nextMessages.slice(-4).map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      if (!res.ok) {
        applyLocalTutorFallback();
        return;
      }
      const data = await res.json();
      if (data.error || !data.reply) {
        applyLocalTutorFallback();
        return;
      }

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: data.reply,
        spokenScript: data.spokenScript,
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (Array.isArray(data.suggestedFollowups)) {
        setFollowups(data.suggestedFollowups.slice(0, 2));
      }

      if (!muted && (data.spokenScript || data.reply)) {
        onSpeakText(data.spokenScript || data.reply);
      }
    } catch {
      applyLocalTutorFallback();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMic = async () => {
    if (recording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      return;
    }

    setChatError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setChatError(
        lang === 'si'
          ? 'මෙම බ්‍රව්සරයේ මයික්‍රොෆෝනයට සහාය නොදක්වයි.'
          : 'Microphone recording is not supported in this browser.'
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
        if (blob.size < 200) return;
        setTranscribing(true);
        try {
          const reader = new FileReader();
          const base64: string = await new Promise((resolve, reject) => {
            reader.onloadend = () => {
              const res = String(reader.result || '');
              const idx = res.indexOf(',');
              resolve(idx >= 0 ? res.slice(idx + 1) : res);
            };
            reader.onerror = () => reject(new Error('Failed to read audio'));
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
            setChatError(data.error || 'Voice transcription failed.');
          } else if (data.transcript) {
            setInput(data.transcript);
          }
        } catch {
          setChatError('Failed to process voice recording.');
        } finally {
          setTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setChatError(
        lang === 'si'
          ? 'මයික්‍රොෆෝන් අවසරය ප්‍රතික්ෂේප විය.'
          : 'Microphone permission denied.'
      );
    }
  };

  return (
    <aside
      role="dialog"
      aria-label={lang === 'si' ? 'AI රසායන විද්‍යා සහායක' : 'AI Chemistry Lab Assistant'}
      className="fixed right-3 top-14 bottom-36 z-40 w-[340px] max-w-[calc(100vw-24px)] wood-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl border-2 border-[#C89242]"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-[#1E120A] border-b border-[#8E6234] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={assets.assistantAvatar}
            alt="AI Lab Instructor"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover object-top border border-[#F5C56B] shrink-0"
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#FFE5AD] flex items-center gap-1.5 truncate">
              <Bot className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span className="truncate">
                {lang === 'si' ? 'AI රසායන සහායක & හඬ' : 'AI Chemistry Tutor & Voice'}
              </span>
            </div>
            <div className="text-[10px] text-[#CBD5E1] truncate">
              Unit {unitRoman} · {experimentTitle}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI Assistant"
          className="w-7 h-7 rounded-full bg-[#4E3422] text-[#EADAC2] hover:text-white flex items-center justify-center cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* AI Voice Instructing Assistant Strip */}
      <div className="px-3.5 py-2.5 bg-[#0C262E] border-b border-[#1E5664] space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-[#7DD3FC]">
            {lang === 'si' ? 'AI හඬ උපදේශක (Voice Coach)' : 'AI Voice Instructor'}
          </span>
          <span className="bg-[#08191F] border border-[#287482] rounded px-2 py-0.5 text-[10px] font-bold text-[#FFE5AD]">
            {voiceName} ({lang === 'si' ? 'පිරිමි හඬ' : 'Male'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {voiceSpeaking ? (
            <button
              type="button"
              onClick={onStopVoice}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>{lang === 'si' ? 'හඬ නවතන්න' : 'Stop Voice'}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={voiceLoading || muted}
              onClick={() => onSpeakText(`${stepTitle}. ${stepTask}. ${stepInstruction}`)}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-50 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {voiceLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
              <span>
                {lang === 'si' ? 'පියවර හඬින් අසන්න' : 'Speak Current Step'}
              </span>
            </button>
          )}
        </div>

        {voiceError && (
          <div className="text-[10px] text-[#FCA5A5] flex items-start gap-1">
            <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
            <span>{voiceError}</span>
          </div>
        )}
      </div>

      {/* Chat History */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto lab-scroll p-3 space-y-2.5 bg-[#19100A]">
        {messages.length === 0 && (
          <div className="rounded-xl bg-[#25170E] border border-[#7C5229] p-3 text-xs text-[#EADAC2] leading-relaxed">
            {(() => {
              const displayName = studentProfile?.username || studentProfile?.name;
              if (lang === 'si') {
                return displayName
                  ? `ආයුබෝවන් ${displayName}! මම ඔබේ AI රසායන විද්‍යා ගුරුවරයා. දැන් ඔබ සිටින්නේ "${experimentTitle}" පරීක්ෂණයේයි. ඕනෑම ප්‍රශ්නයක් සිංහලෙන් හෝ English වලින් අසන්න!`
                  : `ආයුබෝවන්! මම ඔබේ AI රසායන විද්‍යා ගුරුවරයා. දැන් ඔබ සිටින්නේ "${experimentTitle}" පරීක්ෂණයේයි. ඕනෑම ප්‍රශ්නයක් සිංහලෙන් හෝ English වලින් අසන්න!`;
              }
              return displayName
                ? `Ayubowan ${displayName}! I'm your AI Chemistry Lab Tutor. Ask anything about "${experimentTitle}", equations, color changes, or exam tips in English or Sinhala.`
                : `Ayubowan! I'm your AI Chemistry Lab Tutor. Ask anything about "${experimentTitle}", equations, color changes, or exam tips in English or Sinhala.`;
            })()}
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            data-testid={m.role === 'assistant' ? 'ai-assistant-reply' : 'ai-user-msg'}
            className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
              m.role === 'user'
                ? 'ml-6 bg-[#3A2414] border border-[#A8733B] text-[#FFF7E6]'
                : 'mr-4 bg-[#0D2E36] border border-[#287482] text-[#F1F5F9]'
            }`}
          >
            <div className="whitespace-pre-wrap">{m.text}</div>
            {m.role === 'assistant' && (
              <button
                type="button"
                onClick={() => onSpeakText(m.spokenScript || m.text)}
                className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#7DD3FC] hover:text-white cursor-pointer"
              >
                <Volume2 className="w-3 h-3" />
                <span>{lang === 'si' ? 'හඬින් අසන්න' : 'Listen'}</span>
              </button>
            )}
          </div>
        ))}

        {loading && (
          <div className="mr-8 rounded-xl px-3 py-2 bg-[#0D2E36] border border-[#287482] text-xs text-[#7DD3FC] flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>{lang === 'si' ? 'පිළිතුර සකසමින්...' : 'Thinking...'}</span>
          </div>
        )}

        {chatError && (
          <div className="rounded-xl px-3 py-2 bg-[#450A0A] border border-[#EF4444]/60 text-[11px] text-[#FECACA] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#F87171]" />
            <span>{chatError}</span>
          </div>
        )}

        {/* Quick Prompts or AI Suggested Follow-ups */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(followups.length > 0 ? followups : quickPrompts).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendQuestion(q)}
              className="px-2.5 py-1 rounded-lg bg-[#2A1B10] hover:bg-[#3B2617] border border-[#8E6234] text-[10px] text-[#F5C56B] text-left cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input + Voice Mic Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendQuestion(input);
        }}
        className="p-2.5 bg-[#1E120A] border-t border-[#8E6234] flex items-center gap-1.5"
      >
        <button
          type="button"
          onClick={handleToggleMic}
          disabled={transcribing}
          title={lang === 'si' ? 'හඬින් ප්‍රශ්නය අසන්න' : 'Ask by voice'}
          aria-label="Voice Question Input"
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 cursor-pointer ${
            recording
              ? 'bg-[#DC2626] text-white animate-pulse'
              : 'bg-[#2E1C10] border border-[#8E6234] text-[#F5C56B] hover:text-white'
          }`}
        >
          {transcribing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : recording ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            lang === 'si' ? 'රසායන විද්‍යා ප්‍රශ්නයක් අසන්න...' : 'Ask the AI chemistry tutor...'
          }
          className="flex-1 min-w-0 bg-[#120B06] border border-[#7C5229] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#F59E0B]"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          aria-label="Send question"
          className="w-8 h-8 rounded-lg bg-[#F38B21] hover:bg-[#FFA13B] disabled:opacity-45 text-[#1E1005] flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </aside>
  );
}
