import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Atom,
  Globe,
  Image as ImageIcon,
  Loader2,
  Mail,
  Sparkles,
  Square,
  User,
  UserCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useBackgroundAssets } from '../contexts/BackgroundAssetsContext';
import { useVoiceInstructor } from '../hooks/useVoiceInstructor';
import { FooterBar } from './FooterBar';
import { PWAInstallButton } from './PWAInstallButton';
import type { Language, StudentProfile, VoiceName } from '../types/lab';

interface SignInScreenProps {
  lang: Language;
  muted: boolean;
  voiceName: VoiceName;
  existingProfile: StudentProfile | null;
  onChangeLang: (lang: Language) => void;
  onToggleMute: () => void;
  onCompleteSignIn: (profile: StudentProfile) => void;
}

export function SignInScreen({
  lang,
  muted,
  voiceName,
  existingProfile,
  onChangeLang,
  onToggleMute,
  onCompleteSignIn,
}: SignInScreenProps) {
  const [name, setName] = useState(existingProfile?.name ?? '');
  const [age, setAge] = useState(existingProfile ? String(existingProfile.age) : '');
  const [email, setEmail] = useState(existingProfile?.email ?? '');
  const [username, setUsername] = useState(existingProfile?.username ?? '');
  const [usernameEdited, setUsernameEdited] = useState(Boolean(existingProfile?.username));
  const [formError, setFormError] = useState<string | null>(null);

  const { assets, openBgModal } = useBackgroundAssets();

  const { voiceLoading, voiceSpeaking, speakText, stopVoice } = useVoiceInstructor({
    lang,
    muted,
    voiceName,
  });

  const welcomeSpeech =
    lang === 'si'
      ? 'සාදරයෙන් පිළිගනිමු! ChemLab LK උසස් පෙළ රසායන විද්‍යා 3D විද්‍යාගාරයට පිවිසීමට ඔබේ නම, වයස, ඊමේල් සහ පරිශීලක නාමය ඇතුළත් කරන්න.'
      : 'Welcome! Please enter your name, age, email, and username to enter ChemLab LK 3D Chemistry Laboratory.';

  useEffect(() => {
    if (!muted) {
      speakText(welcomeSpeech, true);
    }
    return () => stopVoice();
  }, [lang, muted, voiceName]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNameChange = (val: string) => {
    setName(val);
    if (!usernameEdited) {
      const suggested = val
        .trim()
        .split(/\s+/)[0]
        ?.replace(/[^a-zA-Z0-9_\u0D80-\u0DFF]/g, '');
      setUsername(suggested || '');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const numericAge = Number(age);
    const cleanEmail = email.trim();
    const cleanUsername = username.trim() || cleanName.split(/\s+/)[0] || cleanName;

    if (cleanName.length < 2) {
      setFormError(
        lang === 'si' ? 'කරුණාකර ඔබේ නම නිවැරදිව ඇතුළත් කරන්න.' : 'Please enter your full name.'
      );
      return;
    }
    if (!Number.isFinite(numericAge) || numericAge < 10 || numericAge > 99) {
      setFormError(
        lang === 'si'
          ? 'කරුණාකර වලංගු වයසක් (10–99) ඇතුළත් කරන්න.'
          : 'Please enter a valid age between 10 and 99.'
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError(
        lang === 'si'
          ? 'කරුණාකර වලංගු ඊමේල් ලිපිනයක් ඇතුළත් කරන්න.'
          : 'Please enter a valid email address.'
      );
      return;
    }
    if (cleanUsername.length < 2) {
      setFormError(
        lang === 'si'
          ? 'කරුණාකර පරිශීලක නාමයක් (Username) ඇතුළත් කරන්න.'
          : 'Please choose a username (at least 2 characters).'
      );
      return;
    }

    setFormError(null);
    stopVoice();
    onCompleteSignIn({
      name: cleanName,
      age: Math.round(numericAge),
      email: cleanEmail,
      username: cleanUsername,
      createdAt: existingProfile?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <div
      className="relative w-full min-h-screen flex flex-col bg-[#160F0A] overflow-x-hidden"
      data-screen="signin"
    >
      <div className="relative flex-1 flex items-center justify-center lg:justify-end pt-28 pb-6 px-4 sm:p-8 sm:pt-20 lg:pt-8 lg:pr-16">
        <img
          src={assets.welcomeBackdrop}
          alt="ChemLab LK Academy Sign In"
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/45 to-black/75" />

        {/* Top-Right Language + Android App + Free Offline Backgrounds + Male Voice Quick Bar */}
        <div className="absolute top-4 right-4 left-4 sm:left-auto z-20 flex flex-wrap items-center justify-end gap-2">
          <PWAInstallButton lang={lang} compact />

          <button
            type="button"
            onClick={openBgModal}
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer liquid-glass-card text-[#E0F2FE]"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{lang === 'si' ? 'පසුබිම් රූප' : 'Backgrounds'}</span>
          </button>

          <button
            type="button"
            disabled={voiceLoading || muted}
            onClick={() => (voiceSpeaking ? stopVoice() : speakText(welcomeSpeech, false))}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer liquid-glass-card ${
              voiceSpeaking ? 'text-[#FCA5A5]' : 'text-[#BAE6FD]'
            }`}
          >
            {voiceLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : voiceSpeaking ? (
              <Square className="w-3 h-3 fill-current" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            <span>{lang === 'si' ? `පිරිමි හඬ (${voiceName})` : `Male Voice (${voiceName})`}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-9 h-9 rounded-xl liquid-glass-amber text-[#1E1005] flex items-center justify-center cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => onChangeLang(lang === 'si' ? 'en' : 'si')}
            className="px-3 py-1.5 rounded-xl liquid-glass-card text-[#FFE5AD] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#F5C56B]" />
            <span>{lang === 'si' ? 'සිංහල / EN' : 'English / සිං'}</span>
          </button>
        </div>

        {/* 3D Liquid Glass Sign-In Card */}
        <div className="relative z-10 w-full max-w-[440px] liquid-glass-card rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-white/25">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl liquid-glass-orb flex items-center justify-center mb-3.5">
              <Atom className="w-9 h-9 text-[#FFE5AD]" strokeWidth={2.2} />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-300/40 text-[11px] font-bold text-[#FDE68A] tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CHEMLAB LK · A/L CHEMISTRY 3D</span>
            </span>

            <h1
              className="font-display text-2xl sm:text-3xl font-extrabold text-[#FFF7E6] mt-3 leading-tight"
              data-testid="signin-welcome-heading"
            >
              {lang === 'si' ? 'සාදරයෙන් පිළිගනිමු!' : 'සාදරයෙන් පිළිගනිමු! · Welcome'}
            </h1>
            <p className="text-xs sm:text-sm text-[#E2E8F0] mt-1.5 leading-relaxed">
              {lang === 'si'
                ? 'විද්‍යාගාරය තුළ ඔබේ නමින් කතා කිරීමට සහ ප්‍රගතිය සුරැකීමට ඔබේ තොරතුරු ඇතුළත් කරන්න.'
                : 'Enter your student details so your AI Tutor & Live Voice Instructor address you personally.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            <div>
              <label
                htmlFor="signin-name"
                className="block text-xs font-bold text-[#FFE5AD] mb-1"
              >
                {lang === 'si' ? 'සම්පූර්ණ නම (Name)' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#F5C56B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="signin-name"
                  data-testid="signin-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={lang === 'si' ? 'උදා: කවිඳු පෙරේරා / Kavindu' : 'e.g. Kavindu Perera'}
                  className="w-full rounded-xl bg-black/45 border border-white/25 pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#FBBF24]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="signin-age"
                  className="block text-xs font-bold text-[#FFE5AD] mb-1"
                >
                  {lang === 'si' ? 'වයස (Age)' : 'Age'}
                </label>
                <input
                  id="signin-age"
                  data-testid="signin-age-input"
                  type="number"
                  min={10}
                  max={99}
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="18"
                  className="w-full rounded-xl bg-black/45 border border-white/25 px-3 py-2.5 text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#FBBF24]"
                />
              </div>

              <div>
                <label
                  htmlFor="signin-username"
                  className="block text-xs font-bold text-[#7DD3FC] mb-1"
                >
                  {lang === 'si' ? 'පරිශීලක නාමය (Username)' : 'Username'}
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-[#38BDF8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signin-username"
                    data-testid="signin-username-input"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsernameEdited(true);
                      setUsername(e.target.value);
                    }}
                    placeholder={lang === 'si' ? 'උදා: Kavindu' : 'e.g. Kavindu'}
                    className="w-full rounded-xl bg-black/45 border border-white/25 pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="signin-email"
                className="block text-xs font-bold text-[#FFE5AD] mb-1"
              >
                {lang === 'si' ? 'ඊමේල් ලිපිනය (Email)' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#F5C56B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="signin-email"
                  data-testid="signin-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@school.lk"
                  className="w-full rounded-xl bg-black/45 border border-white/25 pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#FBBF24]"
                />
              </div>
            </div>

            {formError && (
              <div
                role="alert"
                className="rounded-xl bg-red-950/75 border border-red-400/60 px-3 py-2 text-xs text-red-200 font-medium"
              >
                {formError}
              </div>
            )}

            <button
              type="submit"
              data-testid="signin-submit-btn"
              className="mt-2 w-full amber-cta rounded-xl py-3 px-5 text-sm sm:text-base font-extrabold text-[#1E1005] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
            >
              <span>
                {lang === 'si' ? 'ගිණුම සාදා ඉදිරියට යන්න' : 'Create Profile & Continue'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-white/15 text-center text-xs text-[#D8C3A5]">
            <span>Design by </span>
            <strong className="text-[#FFD98E] font-semibold">Janiru Induwara</strong>
          </div>
        </div>
      </div>

      <FooterBar lang={lang} />
    </div>
  );
}
