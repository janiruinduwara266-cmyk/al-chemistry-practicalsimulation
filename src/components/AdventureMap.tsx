import { useEffect } from 'react';
import {
  Atom,
  BookOpen,
  Check,
  Compass,
  FlaskConical,
  Globe,
  Home,
  Menu,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import {
  AL_CHEMISTRY_TOPICS,
  EXPERIMENTS,
  getExperimentsForUnit,
} from '../data/curriculum';
import { useBackgroundAssets } from '../contexts/BackgroundAssetsContext';
import { useVoiceInstructor } from '../hooks/useVoiceInstructor';
import { FooterBar } from './FooterBar';
import type { ExperimentId, Language, StudentProfile, UnitRoman, VoiceName } from '../types/lab';

interface AdventureMapProps {
  lang: Language;
  activeUnitRoman: UnitRoman;
  completedIds: Set<ExperimentId>;
  muted: boolean;
  voiceName: VoiceName;
  studentProfile: StudentProfile | null;
  onToggleMute: () => void;
  onChangeLang: (lang: Language) => void;
  onSelectExperiment: (id: ExperimentId) => void;
  onOpenTopics: () => void;
  onOpenExplorer: () => void;
  onOpenReactions: () => void;
  onOpenElements: () => void;
  onOpenSideMenu: () => void;
  onBackWelcome: () => void;
}

const SLOT_COORDS = [
  { left: '44%', top: '42%', accent: 'from-[#FB7185] to-[#E11D48]' },
  { left: '34.5%', top: '71%', accent: 'from-[#FCD34D] to-[#D97706]' },
  { left: '66.5%', top: '42%', accent: 'from-[#C084FC] to-[#7C3AED]' },
  { left: '58%', top: '68.5%', accent: 'from-[#38BDF8] to-[#0284C7]' },
];

function StationGlyph({ id }: { id: ExperimentId }) {
  const mode = EXPERIMENTS[id]?.benchMode;
  if (id === 'cathode-tube') {
    return (
      <svg viewBox="0 0 64 40" className="w-11 h-7 text-white drop-shadow">
        <rect x="6" y="14" width="32" height="12" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M38 14 L54 8 L54 32 L38 26" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <line x1="12" y1="20" x2="50" y2="20" stroke="#A7F3D0" strokeWidth="2.5" strokeDasharray="3 2" />
      </svg>
    );
  }
  if (id === 'thomson-canal') {
    return (
      <svg viewBox="0 0 64 40" className="w-11 h-7 text-white drop-shadow">
        <line x1="8" y1="20" x2="26" y2="20" stroke="#FEF08A" strokeWidth="2.5" />
        <path d="M26 20 Q40 18 54 9" fill="none" stroke="#86EFAC" strokeWidth="2.5" />
        <line x1="26" y1="10" x2="42" y2="10" stroke="currentColor" strokeWidth="2.5" />
        <line x1="26" y1="30" x2="42" y2="30" stroke="currentColor" strokeWidth="2.5" />
      </svg>
    );
  }
  if (id === 'millikan') {
    return (
      <svg viewBox="0 0 64 40" className="w-11 h-7 text-white drop-shadow">
        <line x1="14" y1="10" x2="50" y2="10" stroke="currentColor" strokeWidth="3" />
        <line x1="14" y1="30" x2="50" y2="30" stroke="currentColor" strokeWidth="3" />
        <circle cx="32" cy="20" r="4.5" fill="#FEF08A" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  if (id === 'rutherford') {
    return (
      <svg viewBox="0 0 64 40" className="w-11 h-7 text-white drop-shadow">
        <line x1="32" y1="6" x2="32" y2="34" stroke="#FDE047" strokeWidth="2.5" />
        <line x1="10" y1="20" x2="54" y2="20" stroke="#FDE68A" strokeWidth="2" />
        <path d="M18 20 Q28 20 20 10" fill="none" stroke="#FCA5A5" strokeWidth="2" />
        <circle cx="32" cy="20" r="3.5" fill="#F97316" />
      </svg>
    );
  }
  if (mode === 'flame-burner') {
    return (
      <svg viewBox="0 0 64 40" className="w-11 h-7 text-white drop-shadow">
        <path d="M32 6 C39 15 39 22 32 25 C25 22 25 15 32 6 Z" fill="#FDE047" />
        <rect x="29" y="24" width="6" height="11" fill="currentColor" />
      </svg>
    );
  }
  if (mode === 'titration-burette') {
    return (
      <svg viewBox="0 0 64 40" className="w-11 h-7 text-white drop-shadow">
        <rect x="29" y="4" width="6" height="16" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M27 24 H37 L42 35 H22 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="32" cy="22" r="2" fill="#F9A8D4" />
      </svg>
    );
  }
  if (mode === 'vsepr-3d') {
    return (
      <svg viewBox="0 0 64 40" className="w-11 h-7 text-white drop-shadow">
        <line x1="32" y1="20" x2="32" y2="8" stroke="currentColor" strokeWidth="2.5" />
        <line x1="32" y1="20" x2="18" y2="31" stroke="currentColor" strokeWidth="2.5" />
        <line x1="32" y1="20" x2="46" y2="31" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="32" cy="20" r="4.5" fill="#FDE047" />
        <circle cx="32" cy="8" r="3.5" fill="#BAE6FD" />
        <circle cx="18" cy="31" r="3.5" fill="#BAE6FD" />
        <circle cx="46" cy="31" r="3.5" fill="#BAE6FD" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 40" className="w-11 h-7 text-white drop-shadow">
      <path d="M26 7 H38 V15 L47 33 H17 L26 15 Z" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path d="M21 26 H43 L45 32 H19 Z" fill="#A7F3D0" fillOpacity="0.85" />
    </svg>
  );
}

export function AdventureMap({
  lang,
  activeUnitRoman,
  completedIds,
  muted,
  voiceName,
  studentProfile,
  onToggleMute,
  onChangeLang,
  onSelectExperiment,
  onOpenTopics,
  onOpenExplorer,
  onOpenReactions,
  onOpenElements,
  onOpenSideMenu,
  onBackWelcome,
}: AdventureMapProps) {
  const unitTopic =
    AL_CHEMISTRY_TOPICS.find((t) => t.roman === activeUnitRoman) || AL_CHEMISTRY_TOPICS[0];
  const unitExperiments = getExperimentsForUnit(activeUnitRoman);
  const displayName = studentProfile?.username || studentProfile?.name || '';
  const { assets } = useBackgroundAssets();

  const { voiceSpeaking, speakText, stopVoice } = useVoiceInstructor({ lang, muted, voiceName });

  const unitSpeech =
    lang === 'si'
      ? `${displayName ? `${displayName}, ` : ''}ඒකකය ${unitTopic.roman}: ${unitTopic.title.si}. පරීක්ෂණයක් තෝරා පළමුව උපකරණ පෙට්ටියෙන් අවශ්‍ය උපකරණ තෝරන්න.`
      : `${displayName ? `${displayName}, ` : ''}Unit ${unitTopic.roman}: ${unitTopic.title.en}. Pick any experiment station to select your apparatus from the box.`;

  useEffect(() => {
    if (muted) return;
    speakText(unitSpeech, true);
    return () => stopVoice();
  }, [activeUnitRoman, lang, muted, displayName]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-[#1B110A] overflow-hidden">
      {/* Main Framed Island Canvas */}
      <div className="relative flex-1 border-4 border-[#6B4423] overflow-hidden">
        <img
          src={assets.islandMap}
          alt="ChemLab LK Chemistry Adventure Map"
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/35 pointer-events-none" />

        {/* Top Bar Title Banner & Topics Signpost */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 px-4 sm:px-6 pt-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenSideMenu}
              aria-label={lang === 'si' ? 'මෙනුව විවෘත කරන්න' : 'Open Lab Menu'}
              className="w-9 h-9 rounded-xl bg-[#2B1B10]/95 border border-[#C89242] text-[#FFE5AD] hover:bg-[#3B2516] flex items-center justify-center cursor-pointer shadow-lg shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onBackWelcome}
              className="px-3.5 py-2 rounded-xl bg-[#2B1B10]/95 border border-[#B58246] text-[#FBF5EA] text-xs sm:text-sm font-semibold hover:bg-[#3B2516] flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Home className="w-4 h-4 text-[#F5C56B]" />
              <span className="whitespace-nowrap">
                {lang === 'si' ? 'මුල් පිටුව' : 'Welcome'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenTopics}
              className="px-4 py-2 rounded-xl bg-[#4E2F16]/95 border-2 border-[#C89242] text-[#FFF4DC] text-xs sm:text-sm font-bold hover:bg-[#5E3A1C] flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Compass className="w-4 h-4 text-[#FCD34D]" />
              <span className="whitespace-nowrap">
                {lang === 'si' ? 'මාතෘකා තෝරන්න (1–10)' : 'Select Topics (1–10)'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenExplorer}
              className="px-3.5 py-2 rounded-xl liquid-glass-icon text-[#E0F2FE] text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#38BDF8]" />
              <span className="whitespace-nowrap">
                {lang === 'si' ? 'විදුලි හා රසායන උපකරණ 3D' : '3D Electric & Lab Tools'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenReactions}
              className="px-3.5 py-2 rounded-xl liquid-glass-emerald text-[#DCFCE7] text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FlaskConical className="w-4 h-4 text-[#4ADE80]" />
              <span className="whitespace-nowrap">
                {lang === 'si' ? '3D රසායනික ප්‍රතික්‍රියා' : '3D Reactions Lab'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenElements}
              className="px-3.5 py-2 rounded-xl liquid-glass-violet text-[#EDE9FE] text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Atom className="w-4 h-4 text-[#C4B5FD]" />
              <span className="whitespace-nowrap">
                {lang === 'si' ? 'මූලද්‍රව්‍ය 118' : '118 Elements'}
              </span>
            </button>
          </div>

          <div className="bg-[#1E140D]/92 border border-[#B58246] rounded-xl px-4 py-2 shadow-lg">
            <span className="text-xs sm:text-sm font-bold text-[#FFE5AD]">
              {lang === 'si'
                ? `ඒකකය ${unitTopic.roman}: ${unitTopic.title.si} (${unitTopic.numberRange})`
                : `Unit ${unitTopic.roman}: ${unitTopic.title.en} (${unitTopic.numberRange})`}
            </span>
          </div>
        </div>

        {/* Desktop Interactive Station Medallions Positioned on Map Clearings */}
        <div className="hidden md:block relative w-full h-full min-h-[540px]">
          {unitExperiments.map((id, idx) => {
            const exp = EXPERIMENTS[id];
            const coords = SLOT_COORDS[idx % SLOT_COORDS.length];
            const done = completedIds.has(id);

            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectExperiment(id)}
                style={{ left: coords.left, top: coords.top }}
                className="group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer focus:outline-none z-20"
              >
                <div className="relative">
                  <div
                    className={`w-20 h-20 rounded-full liquid-glass-orb bg-gradient-to-br ${coords.accent} border-[3px] border-[#FFF5D6] flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}
                  >
                    <StationGlyph id={id} />
                  </div>
                  {done && (
                    <span
                      title="Completed"
                      className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#16A34A] border-2 border-white flex items-center justify-center shadow-md"
                    >
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </span>
                  )}
                </div>

                <div className="mt-2 px-3.5 py-1.5 rounded-xl liquid-glass-card text-center min-w-[175px] max-w-[220px] transition-colors group-hover:border-[#FCD34D]">
                  <div className="text-xs font-bold text-[#FCD34D] font-mono-tabular">
                    {exp.number}
                  </div>
                  <div className="text-xs font-bold text-white leading-snug truncate">
                    {exp.shortTitle[lang]}
                  </div>
                  <div className="text-[10px] text-[#CBD5E1] tracking-wider uppercase mt-0.5 truncate">
                    {lang === 'si' ? exp.shortTitle.en : exp.shortTitle.si}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile Responsive 2x2 Card Grid over Map */}
        <div className="md:hidden relative z-20 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 mt-4 pb-24">
          {unitExperiments.map((id, idx) => {
            const exp = EXPERIMENTS[id];
            const coords = SLOT_COORDS[idx % SLOT_COORDS.length];
            const done = completedIds.has(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectExperiment(id)}
                className="flex items-center gap-3 p-3.5 rounded-2xl liquid-glass-card text-left cursor-pointer"
              >
                <div
                  className={`w-14 h-14 rounded-full liquid-glass-orb bg-gradient-to-br ${coords.accent} border-2 border-[#FFF5D6] flex items-center justify-center shrink-0`}
                >
                  <StationGlyph id={id} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#FCD34D] font-mono-tabular">
                      {exp.number}
                    </span>
                    {done && <Check className="w-4 h-4 text-[#4ADE80]" />}
                  </div>
                  <div className="text-sm font-bold text-white truncate">
                    {exp.shortTitle[lang]}
                  </div>
                  <div className="text-xs text-[#D4BFA2] truncate">{exp.shortTitle.en}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom-Left Floating Circular Controls (AP LAB style) */}
        <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenTopics}
            aria-label={lang === 'si' ? 'මාතෘකා බලන්න' : 'Open Topics'}
            title={lang === 'si' ? 'මාතෘකා' : 'Topics'}
            className="w-11 h-11 rounded-full bg-[#2563EB] border-2 border-[#DBEAFE] text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onChangeLang(lang === 'si' ? 'en' : 'si')}
            aria-label="Switch Language"
            title="Switch Language"
            className="w-11 h-11 rounded-full bg-[#EA580C] border-2 border-[#FFEDD5] text-white text-xs font-extrabold shadow-lg flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
          >
            <Globe className="w-4 h-4 mr-0.5" />
            {lang === 'si' ? 'සිං' : 'EN'}
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute Sound' : 'Mute Sound'}
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-11 h-11 rounded-full bg-[#D97706] border-2 border-[#FEF3C7] text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            type="button"
            disabled={muted}
            onClick={() => (voiceSpeaking ? stopVoice() : speakText(unitSpeech, false))}
            aria-label={lang === 'si' ? 'පිරිමි හඬ (Puck) අසන්න' : 'Play Puck Voice'}
            className="h-11 px-3.5 rounded-full bg-[#0284C7] border-2 border-[#BAE6FD] text-white text-xs font-bold shadow-lg flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer disabled:opacity-50"
          >
            <Volume2 className={`w-4 h-4 ${voiceSpeaking ? 'animate-pulse' : ''}`} />
            <span>{voiceSpeaking ? 'Stop (Puck)' : 'Puck'}</span>
          </button>
        </div>

        {/* Bottom-Right Lab Assistant Character */}
        <div className="hidden sm:flex absolute bottom-3 right-4 z-30 items-end gap-3 pointer-events-none">
          <div className="mb-4 max-w-[245px] liquid-glass-card rounded-xl px-3.5 py-2.5 text-xs text-[#E2E8F0]">
            {lang === 'si'
              ? `${displayName ? `${displayName}, ` : ''}පරීක්ෂණයක් තෝරා පළමුව උපකරණ පෙට්ටියෙන් උපකරණ තෝරා 3D වැඩ මේසයට යන්න!`
              : `${displayName ? `${displayName}, p` : 'P'}ick a station to select apparatus from the box before entering the 3D Bench!`}
          </div>
          <img
            src={assets.assistantAvatar}
            alt="Lab Assistant"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-full object-cover object-top border-2 border-[#C89242] shadow-2xl"
          />
        </div>
      </div>

      <FooterBar lang={lang} />
    </div>
  );
}
