import { useEffect } from 'react';
import {
  Atom,
  ArrowRight,
  FlaskConical,
  Globe,
  Image as ImageIcon,
  Menu,
  Sparkles,
  UserCheck,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { useBackgroundAssets } from '../contexts/BackgroundAssetsContext';
import { SYLLABUS_REACTIONS } from '../data/reactionsCatalog';
import { useVoiceInstructor } from '../hooks/useVoiceInstructor';
import { FooterBar } from './FooterBar';
import { PWAInstallButton } from './PWAInstallButton';
import type { Language, StudentProfile, VoiceName } from '../types/lab';

interface WelcomeScreenProps {
  lang: Language;
  muted: boolean;
  voiceName: VoiceName;
  studentProfile: StudentProfile | null;
  onChangeLang: (lang: Language) => void;
  onToggleMute: () => void;
  onEnterLab: () => void;
  onOpenExplorer: () => void;
  onOpenReactions: () => void;
  onOpenElements: () => void;
  onOpenSideMenu: () => void;
  onSwitchAccount: () => void;
}

export function WelcomeScreen({
  lang,
  muted,
  voiceName,
  studentProfile,
  onChangeLang,
  onToggleMute,
  onEnterLab,
  onOpenExplorer,
  onOpenReactions,
  onOpenElements,
  onOpenSideMenu,
  onSwitchAccount,
}: WelcomeScreenProps) {
  const displayName = studentProfile?.username || studentProfile?.name || '';
  const { assets, openBgModal } = useBackgroundAssets();
  const { voiceSpeaking, speakText, stopVoice } = useVoiceInstructor({
    lang,
    muted,
    voiceName,
  });

  const welcomeMessage =
    lang === 'si'
      ? displayName
        ? `සාදරයෙන් පිළිගනිමු ${displayName}! ChemLab LK 3D රසායන විද්‍යාගාරයට ඔබව පිළිගන්නවා. පාඩම් දහයම, රසායනික ප්‍රතික්‍රියා ${SYLLABUS_REACTIONS.length} ක් සහ මූලද්‍රව්‍ය 118 ම අද ඔබට මෙහිදී අත්හදා බැලිය හැකියි.`
        : `සාදරයෙන් පිළිගනිමු! ChemLab LK 3D රසායන විද්‍යාගාරයට ඔබව පිළිගන්නවා.`
      : displayName
        ? `Welcome ${displayName} to ChemLab LK! Explore all 10 Sri Lankan A/L Chemistry units, ${SYLLABUS_REACTIONS.length} 3D reactions, and all 118 elements with live voice coaching.`
        : `Welcome to ChemLab LK 3D Chemistry Virtual Lab!`;

  useEffect(() => {
    if (muted) return;
    speakText(welcomeMessage, true);
    return () => stopVoice();
  }, [lang, muted, displayName, voiceName]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="relative w-full min-h-screen flex flex-col bg-[#160F0A] overflow-hidden"
      data-screen="welcome"
    >
      {/* Main Full-Bleed Fantasy Chemistry Academy Artwork */}
      <div className="relative flex-1 flex items-center justify-center lg:justify-end pt-28 pb-6 px-4 sm:p-8 sm:pt-20 lg:pt-8 lg:pr-16">
        <img
          src={assets.welcomeBackdrop}
          alt="ChemLab LK Floating Chemistry Academy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/30 to-black/70" />

        {/* Top-Left Floating Side Menu & Male Voice Controls */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenSideMenu}
            aria-label={lang === 'si' ? 'මෙනුව විවෘත කරන්න' : 'Open Lab Menu'}
            className="liquid-glass-card px-3 py-2 rounded-xl text-[#FFE5AD] hover:brightness-110 flex items-center gap-2 cursor-pointer"
          >
            <Menu className="w-4 h-4 text-[#F5C56B]" />
            <span className="text-xs font-bold">{lang === 'si' ? 'මෙනුව' : 'Menu'}</span>
          </button>

          <button
            type="button"
            onClick={openBgModal}
            className="liquid-glass-card px-3 py-2 rounded-xl text-[#E0F2FE] hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-xs font-bold">
              {lang === 'si' ? 'පසුබිම් රූප' : 'Backgrounds'}
            </span>
          </button>

          <PWAInstallButton lang={lang} />

          <button
            type="button"
            disabled={muted}
            onClick={() => {
              if (voiceSpeaking) {
                stopVoice();
              } else {
                speakText(welcomeMessage, false);
              }
            }}
            aria-label={lang === 'si' ? 'පිරිමි හඬින් අසන්න' : 'Play Welcome Male Voice'}
            className="liquid-glass-card px-3 py-2 rounded-xl text-[#E0F2FE] hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 className={`w-4 h-4 text-[#38BDF8] ${voiceSpeaking ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-bold">
              {voiceSpeaking
                ? lang === 'si'
                  ? `පිරිමි හඬ (${voiceName})...`
                  : `Speaking (${voiceName})...`
                : lang === 'si'
                  ? `පිරිමි හඬ (${voiceName})`
                  : `Male Voice (${voiceName})`}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute Live Voice' : 'Mute Live Voice'}
            className="liquid-glass-card w-9 h-9 rounded-xl text-[#E0F2FE] hover:brightness-110 flex items-center justify-center cursor-pointer"
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-[#FCA5A5]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#4ADE80]" />
            )}
          </button>
        </div>

        {/* Right-side 3D Liquid Glass Welcome Card */}
        <div className="relative z-10 w-full max-w-[420px] liquid-glass-card rounded-3xl p-6 sm:p-7 text-center flex flex-col items-center">
          {/* Top 3D Liquid Glass Crest */}
          <div className="w-16 h-16 rounded-full liquid-glass-orb bg-gradient-to-br from-[#FBF5EA] to-[#E2C28E] border-2 border-[#FFF5D6] flex items-center justify-center mb-3.5">
            <Atom className="w-9 h-9 text-[#1D3557]" strokeWidth={2.2} />
          </div>

          {displayName && (
            <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D2E36]/85 border border-[#38BDF8]/50 text-[11px] font-bold text-[#7DD3FC]">
              <UserCheck className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span>
                {lang === 'si' ? `ආයුබෝවන්, ${displayName}!` : `Welcome, ${displayName}!`}
              </span>
            </div>
          )}

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-wide text-[#FFF7E6] drop-shadow">
            CHEM LAB
          </h1>
          <p className="mt-1 text-xs sm:text-[13px] font-semibold tracking-[0.11em] text-[#F5C56B] uppercase">
            {lang === 'si'
              ? `A/L CHEMISTRY · පාඩම් 1–10 · මූලද්‍රව්‍ය 118`
              : `A/L CHEMISTRY · UNITS 01–10 · 118 ELEMENTS`}
          </p>

          <p className="mt-3.5 text-xs sm:text-sm text-[#EADAC2] leading-relaxed max-w-sm">
            {lang === 'si'
              ? `උපකරණ නොමැති පාසල් සිසුන් වෙනුවෙන්ම සැකසූ සැබෑ ත්‍රිමාණ (3D) රසායන විද්‍යාගාරය — පරීක්ෂණ 40, ප්‍රතික්‍රියා ${SYLLABUS_REACTIONS.length}+ සහ මූලද්‍රව්‍ය 118 සජීවී AI හඬ සමඟ!`
              : `Interactive 3D virtual laboratory covering 40 Sri Lankan A/L practicals, ${SYLLABUS_REACTIONS.length}+ reactions & all 118 elements with live AI Voice coaching.`}
          </p>

          {/* Language Switcher */}
          <div className="mt-4 inline-flex items-center gap-1 p-1 rounded-xl bg-[#180E08]/90 border border-[#8E6234]">
            <span className="px-2 text-[#D4BFA2]" aria-hidden="true">
              <Globe className="w-3.5 h-3.5" />
            </span>
            <button
              type="button"
              onClick={() => onChangeLang('si')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                lang === 'si'
                  ? 'bg-[#F38B21] text-[#1A0E06]'
                  : 'text-[#EADAC2] hover:text-white'
              }`}
            >
              සිංහල
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#F38B21] text-[#1A0E06]'
                  : 'text-[#EADAC2] hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          {/* Primary Glossy Amber CTA */}
          <button
            type="button"
            onClick={onEnterLab}
            className="mt-5 w-full liquid-glass-amber rounded-2xl py-3.5 px-6 text-base font-extrabold text-[#1E1005] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
          >
            <span className="whitespace-nowrap">
              {lang === 'si' ? 'විද්‍යාගාරයට පිවිසෙන්න' : 'Enter Chemistry Lab'}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* 3D Equipment & Electric Lab Shortcut */}
          <button
            type="button"
            onClick={onOpenExplorer}
            className="mt-2.5 w-full liquid-glass-icon py-2.5 px-4 rounded-xl text-[#E0F2FE] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-[#38BDF8]" />
            <span>
              {lang === 'si'
                ? 'විදුලි හා රසායන උපකරණ 3D ගවේෂණය'
                : '3D Electric & Lab Equipment Explorer'}
            </span>
          </button>

          {/* 3D Chemical Reactions Lab Shortcut (100+ Reactions) */}
          <button
            type="button"
            onClick={onOpenReactions}
            className="mt-2 w-full liquid-glass-emerald py-2.5 px-4 rounded-xl text-[#DCFCE7] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <FlaskConical className="w-4 h-4 text-[#4ADE80]" />
            <span>
              {lang === 'si'
                ? `රසායනික ප්‍රතික්‍රියා ${SYLLABUS_REACTIONS.length}+ 3D විද්‍යාගාරය`
                : `3D Chemical Reactions Lab (${SYLLABUS_REACTIONS.length}+)`}
            </span>
          </button>

          {/* 3D All 118 Elements Explorer Shortcut */}
          <button
            type="button"
            onClick={onOpenElements}
            className="mt-2 w-full liquid-glass-violet py-2.5 px-4 rounded-xl text-[#EDE9FE] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#C4B5FD]" />
            <span>
              {lang === 'si'
                ? 'මූලද්‍රව්‍ය 118 හා ඉලෙක්ට්‍රෝන වින්‍යාස 3D'
                : 'All 118 Elements & Electron Configs (3D)'}
            </span>
          </button>

          {/* Switch Account / Edit Profile Link */}
          <button
            type="button"
            onClick={onSwitchAccount}
            className="mt-3 text-[11px] font-semibold text-[#CBD5E1] hover:text-[#FFE5AD] underline underline-offset-4 cursor-pointer"
          >
            {lang === 'si'
              ? 'ගිණුම මාරු කරන්න / නම වෙනස් කරන්න'
              : 'Need to change student account?'}
          </button>

          {/* Designer Credit inside Welcome Card */}
          <div className="mt-4 pt-3.5 w-full border-t border-[#8E6234]/45 text-xs text-[#D8C3A5]">
            <span className="font-medium">Design by </span>
            <strong className="text-[#FFD98E] font-semibold">Janiru Induwara</strong>
            <span className="mx-1.5 text-[#8E6234]" aria-hidden="true">
              ·
            </span>
            <span>Units I–X + Live AI Voice</span>
          </div>
        </div>
      </div>

      <FooterBar lang={lang} />
    </div>
  );
}

