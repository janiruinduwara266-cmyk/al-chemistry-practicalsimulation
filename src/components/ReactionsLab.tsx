import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Beaker,
  Bot,
  Compass,
  Flame,
  FlaskConical,
  Globe,
  Loader2,
  Menu,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Square,
  Thermometer,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import {
  MIXABLE_REAGENTS_A,
  MIXABLE_REAGENTS_B,
  REACTION_CATEGORIES,
  REACTION_CONDITIONS,
  SYLLABUS_REACTIONS,
  evaluateCustomMixture,
  type ReactionCategory,
  type ReactionCondition,
  type SyllabusReactionSpec,
} from '../data/reactionsCatalog';
import { useBackgroundAssets } from '../contexts/BackgroundAssetsContext';
import { useVoiceInstructor } from '../hooks/useVoiceInstructor';
import { soundFX } from '../utils/soundEffects';
import { AIAssistantDrawer } from './AIAssistantDrawer';
import { FooterBar } from './FooterBar';
import { ReactionCanvas3D } from './ReactionCanvas3D';
import type { CameraPreset, Language, StudentProfile, VoiceName } from '../types/lab';

interface ReactionsLabProps {
  lang: Language;
  muted: boolean;
  voiceName: VoiceName;
  studentProfile: StudentProfile | null;
  onChangeLang: (lang: Language) => void;
  onToggleMute: () => void;
  onOpenSideMenu: () => void;
  onOpenTopics: () => void;
  onOpenExplorer: () => void;
  onBackToMap: () => void;
}

type ReactionMode = 'presets' | 'custom';

export function ReactionsLab({
  lang,
  muted,
  voiceName,
  studentProfile,
  onChangeLang,
  onToggleMute,
  onOpenSideMenu,
  onOpenTopics,
  onOpenExplorer,
  onBackToMap,
}: ReactionsLabProps) {
  const { assets } = useBackgroundAssets();
  const [mode, setMode] = useState<ReactionMode>('presets');
  const [category, setCategory] = useState<ReactionCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    SYLLABUS_REACTIONS[0].id
  );

  // Custom Mix state
  const [reagentAId, setReagentAId] = useState<string>('cuso4');
  const [reagentBId, setReagentBId] = useState<string>('nh3-aq');
  const [condition, setCondition] = useState<ReactionCondition>(
    SYLLABUS_REACTIONS[0].defaultCondition
  );

  // Simulation playback state
  const [progress, setProgress] = useState<number>(0);
  const [isReacting, setIsReacting] = useState<boolean>(false);
  const [hasMixed, setHasMixed] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [presetVersion, setPresetVersion] = useState(0);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const selectedPreset = useMemo(
    () =>
      SYLLABUS_REACTIONS.find((r) => r.id === selectedPresetId) ||
      SYLLABUS_REACTIONS[0],
    [selectedPresetId]
  );

  const customEvaluation = useMemo(
    () => evaluateCustomMixture(reagentAId, reagentBId, condition),
    [reagentAId, reagentBId, condition]
  );

  const activeReaction: SyllabusReactionSpec | null =
    mode === 'presets' ? selectedPreset : customEvaluation.reaction;

  const activeReagentA = useMemo(() => {
    const targetId =
      mode === 'presets' ? selectedPreset.reagentAId : reagentAId;
    return (
      MIXABLE_REAGENTS_A.find((r) => r.id === targetId) ||
      MIXABLE_REAGENTS_A[0]
    );
  }, [mode, selectedPreset, reagentAId]);

  const activeReagentB = useMemo(() => {
    const targetId =
      mode === 'presets' ? selectedPreset.reagentBId : reagentBId;
    return (
      MIXABLE_REAGENTS_B.find((r) => r.id === targetId) ||
      MIXABLE_REAGENTS_B[0]
    );
  }, [mode, selectedPreset, reagentBId]);

  // Reset flask when changing selected reaction or reagent pair
  useEffect(() => {
    if (mode === 'presets') {
      setCondition(selectedPreset.defaultCondition);
    }
    setProgress(0);
    setIsReacting(false);
    setHasMixed(false);
  }, [mode, selectedPreset, reagentAId, reagentBId]);

  // Smooth animation loop when Mix & React is triggered
  useEffect(() => {
    if (!isReacting) return;
    let rafId = 0;
    let lastTs = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      setProgress((prev) => {
        const next = Math.min(1, prev + dt * 0.34);
        if (next >= 1) {
          setIsReacting(false);
        }
        return next;
      });
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isReacting]);

  const {
    voiceLoading,
    voiceSpeaking,
    voiceError,
    speakText,
    stopVoice,
  } = useVoiceInstructor({ lang, muted, voiceName });

  const displayName = studentProfile?.username || studentProfile?.name || '';

  // Always narrate selected reaction live when unmuted
  useEffect(() => {
    if (muted) return;
    if (activeReaction) {
      const prefix = displayName ? `${displayName}, ` : '';
      speakText(
        `${prefix}${activeReaction.title[lang]}. ${activeReaction.voiceSummary[lang]}`,
        true
      );
    } else if (hasMixed && customEvaluation.noReactionReason) {
      speakText(customEvaluation.noReactionReason[lang], true);
    }
    return () => stopVoice();
  }, [activeReaction?.id, mode, lang, muted, displayName]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredPresets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SYLLABUS_REACTIONS.filter((rx) => {
      if (category !== 'all' && rx.category !== category) return false;
      if (!q) return true;
      return (
        rx.title.si.toLowerCase().includes(q) ||
        rx.title.en.toLowerCase().includes(q) ||
        rx.shortTitle.si.toLowerCase().includes(q) ||
        rx.shortTitle.en.toLowerCase().includes(q) ||
        rx.equation.toLowerCase().includes(q)
      );
    });
  }, [category, searchQuery]);

  const handleMixAndReact = () => {
    setProgress(0.02);
    setHasMixed(true);
    setIsReacting(true);
    if (!activeReaction) {
      soundFX.playError();
    } else {
      soundFX.playSuccess();
    }
    if (!muted) {
      if (activeReaction) {
        speakText(activeReaction.observation[lang], true);
      } else if (customEvaluation.noReactionReason) {
        const prefixSi = 'වැරදි මිශ්‍රණයක්! ප්‍රතික්‍රියාවක් සිදු නොවේ. ';
        const prefixEn = 'No reaction occurs with this pair. ';
        speakText(
          `${lang === 'si' ? prefixSi : prefixEn}${customEvaluation.noReactionReason[lang]}`,
          true
        );
      }
    }
  };

  const handleResetFlask = () => {
    setIsReacting(false);
    setHasMixed(false);
    setProgress(0);
  };

  const baseTemp = condition === 'warm' ? 62 : 25;
  const liveTemp =
    baseTemp +
    (activeReaction ? activeReaction.tempRiseC * Math.max(0, (progress - 0.15) / 0.85) : 0);

  const benchRuntime = useMemo(
    () => ({
      reaction: hasMixed || progress > 0 ? activeReaction : null,
      reagentAColorHex:
        activeReaction?.initialColorHex || activeReagentA.colorHex,
      reagentBColorHex:
        activeReaction?.reagentBColorHex || activeReagentB.colorHex,
      reagentAFormula: activeReagentA.formula,
      reagentBFormula: activeReagentB.formula,
      condition,
      progress,
      isReacting,
    }),
    [
      hasMixed,
      progress,
      activeReaction,
      activeReagentA,
      activeReagentB,
      condition,
      isReacting,
    ]
  );

  const statusText = useMemo(() => {
    if (!hasMixed && progress === 0) {
      return lang === 'si'
        ? 'මිශ්‍ර කිරීමට සූදානම් (READY TO MIX)'
        : 'READY TO MIX REAGENTS';
    }
    if (!activeReaction) {
      return lang === 'si'
        ? 'දෘශ්‍යමාන ප්‍රතික්‍රියාවක් නොමැත (NO REACTION)'
        : 'NO VISIBLE REACTION';
    }
    if (isReacting && progress < 0.99) {
      return lang === 'si'
        ? 'ප්‍රතික්‍රියාව සිදුවෙමින් පවතී...'
        : 'REACTING IN 3D FLASK...';
    }
    return lang === 'si'
      ? 'ප්‍රතික්‍රියාව සම්පූර්ණයි ✓'
      : 'REACTION COMPLETE ✓';
  }, [hasMixed, progress, activeReaction, isReacting, lang]);

  return (
    <div
      className="relative w-full min-h-screen lg:h-screen flex flex-col overflow-x-hidden lg:overflow-hidden bg-[#120D09]"
      data-screen="reactions-lab"
      data-reaction={activeReaction?.id || 'no-reaction'}
    >
      {/* Top Header Bar */}
      <header className="relative z-20 px-3 sm:px-5 py-2.5 bg-[#1B110A]/95 border-b border-[#8E6234] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSideMenu}
            aria-label={lang === 'si' ? 'මෙනුව විවෘත කරන්න' : 'Open Lab Menu'}
            className="w-9 h-9 rounded-xl bg-[#2B1B10] border border-[#C89242] text-[#FFE5AD] hover:bg-[#3E2717] flex items-center justify-center cursor-pointer shadow shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onBackToMap}
            className="px-3 py-1.5 rounded-xl bg-[#2B1B10] border border-[#B58246] text-[#FBF5EA] text-xs font-bold hover:bg-[#3E2717] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#F5C56B]" />
            <span>{lang === 'si' ? 'ප්‍රධාන සිතියම' : 'Lab Map'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenTopics}
            className="hidden sm:flex px-2.5 py-1.5 rounded-xl bg-[#3D2514] border border-[#C89242] text-[#FFE5AD] text-xs font-bold hover:bg-[#52321B] items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5 text-[#FCD34D]" />
            <span>{lang === 'si' ? 'පාඩම් 1–10' : 'Units 1–10'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenExplorer}
            className="hidden md:flex px-2.5 py-1.5 rounded-xl bg-[#0D2E36] border border-[#38BDF8]/70 text-[#E0F2FE] text-xs font-bold hover:bg-[#13424E] items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{lang === 'si' ? '3D උපකරණ' : '3D Equipment'}</span>
          </button>

          <div className="ml-1">
            <h1 className="font-display text-sm sm:text-base font-extrabold text-[#FFE5AD] leading-tight">
              {lang === 'si'
                ? '3D රසායනික ප්‍රතික්‍රියා විද්‍යාගාරය'
                : '3D Syllabus Chemical Reactions Lab'}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-[#D4BFA2] hidden xl:block">
              {lang === 'si'
                ? `A/L විෂය නිර්දේශයේ ප්‍රධාන ප්‍රතික්‍රියා ${SYLLABUS_REACTIONS.length} හා නිදහස් මිශ්‍ර පරීක්ෂණාගාරය`
                : `Test ${SYLLABUS_REACTIONS.length} Sri Lankan A/L syllabus reactions & free-mix reagent pairs in real-time 3D`}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={voiceLoading || muted}
            onClick={() => {
              if (voiceSpeaking) {
                stopVoice();
              } else if (activeReaction) {
                speakText(
                  `${activeReaction.title[lang]}. ${activeReaction.voiceSummary[lang]} ${activeReaction.observation[lang]}`,
                  false
                );
              } else if (customEvaluation.noReactionReason) {
                speakText(customEvaluation.noReactionReason[lang], false);
              }
            }}
            aria-label={
              lang === 'si' ? 'ප්‍රතික්‍රියාව හඬින් අසන්න' : 'Speak Reaction Guide'
            }
            className={`h-8 px-2.5 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer border whitespace-nowrap ${
              voiceSpeaking
                ? 'bg-[#DC2626] border-[#FCA5A5] text-white'
                : 'bg-[#0284C7] border-[#BAE6FD] text-white hover:bg-[#0369A1]'
            }`}
          >
            {voiceLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : voiceSpeaking ? (
              <Square className="w-3 h-3 fill-current" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            <span>
              {lang === 'si'
                ? `සජීවී හඬ (${voiceName})`
                : `Live Voice (${voiceName})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAiDrawerOpen((v) => !v)}
            className={`h-8 px-3 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer border whitespace-nowrap ${
              aiDrawerOpen
                ? 'bg-[#7C3AED] border-[#DDD6FE] text-white'
                : 'bg-[#0D2E36] border-[#38BDF8] text-[#E0F2FE] hover:bg-[#13424E]'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{lang === 'si' ? 'AI ගුරුවරයා' : 'AI Tutor'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="w-8 h-8 rounded-full bg-[#D97706] border border-[#FEF3C7] text-white flex items-center justify-center cursor-pointer"
          >
            {muted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangeLang(lang === 'si' ? 'en' : 'si')}
            className="h-8 px-2.5 rounded-full bg-[#EA580C] border border-[#FFEDD5] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'si' ? 'සිං' : 'EN'}</span>
          </button>
        </div>
      </header>

      {/* Main 3-Column Body */}
      <div className="relative flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* LEFT COLUMN: PRESET SYLLABUS REACTIONS OR CUSTOM MIX SELECTORS */}
        <section
          aria-label={
            lang === 'si'
              ? 'ප්‍රතික්‍රියා හා ප්‍රතිකාරක ලැයිස්තුව'
              : 'Syllabus Reactions & Custom Mix'
          }
          className="w-full lg:w-[300px] xl:w-[325px] bg-[#1A110B] border-b lg:border-b-0 lg:border-r border-[#8E6234] p-3 flex flex-col gap-2.5 lg:h-full lg:overflow-hidden shrink-0"
        >
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#120B06] border border-[#6E4927]">
            <button
              type="button"
              data-testid="tab-preset-reactions"
              onClick={() => setMode('presets')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer ${
                mode === 'presets'
                  ? 'bg-[#F38B21] text-[#1A0E06]'
                  : 'text-[#EADAC2] hover:text-white'
              }`}
            >
              {lang === 'si'
                ? `විෂය ප්‍රතික්‍රියා (${SYLLABUS_REACTIONS.length})`
                : `Syllabus (${SYLLABUS_REACTIONS.length})`}
            </button>
            <button
              type="button"
              data-testid="tab-custom-mix"
              onClick={() => setMode('custom')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer ${
                mode === 'custom'
                  ? 'bg-[#0284C7] text-white'
                  : 'text-[#EADAC2] hover:text-white'
              }`}
            >
              {lang === 'si' ? 'නිදහස් මිශ්‍ර (Mix)' : 'Custom Mix Lab'}
            </button>
          </div>

          {mode === 'presets' ? (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#D4BFA2] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    lang === 'si'
                      ? 'ප්‍රතික්‍රියා සොයන්න...'
                      : 'Search reactions...'
                  }
                  className="w-full bg-[#120B06] border border-[#7C5229] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1">
                {REACTION_CATEGORIES.map((cat) => {
                  const active = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#F38B21] border-[#FDE68A] text-[#1A0E06]'
                          : 'bg-[#26180F] border-[#6E4927] text-[#EADAC2] hover:border-[#C89242]'
                      }`}
                    >
                      {cat.label[lang]}
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Reaction Cards */}
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lab-scroll pb-1 lg:pr-1 lg:flex-1">
                {filteredPresets.map((rx) => {
                  const selected = rx.id === selectedPreset.id;
                  return (
                    <button
                      key={rx.id}
                      type="button"
                      aria-pressed={selected}
                      data-selected={selected ? 'true' : 'false'}
                      data-testid={`reaction-card-${rx.id}`}
                      onClick={() => setSelectedPresetId(rx.id)}
                      className={`min-w-[205px] lg:min-w-0 w-full text-left p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 shrink-0 ${
                        selected
                          ? 'bg-[#0E3641] border-[#38BDF8] shadow-lg'
                          : 'bg-[#23160D] border-[#6E4927]/70 hover:border-[#C89242]'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-xl liquid-glass-orb border border-white/40 shrink-0 mt-0.5 flex items-center justify-center"
                        style={{ backgroundColor: rx.finalColorHex }}
                      >
                        <FlaskConical className="w-3.5 h-3.5 text-slate-900/85" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#FFF7E6] leading-snug line-clamp-1">
                          {rx.shortTitle[lang]}
                        </div>
                        <div className="text-[10px] text-[#CBD5E1] line-clamp-1 mt-0.5 font-mono-tabular">
                          {rx.equation}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] text-[#F5C56B] font-mono-tabular">
                            Units {rx.unitBadges.join(', ')}
                          </span>
                          <span className="text-[9px] text-[#7DD3FC]">
                            · {rx.deltaHLabel}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* CUSTOM MIX SELECTOR PANEL */
            <div className="flex-1 overflow-y-auto lab-scroll space-y-3 pr-1">
              <div>
                <label
                  htmlFor="reagent-a-select"
                  className="block text-[11px] font-bold text-[#F5C56B] mb-1"
                >
                  {lang === 'si'
                    ? '1. ප්‍රතිකාරකය A (Flask තුළ):'
                    : '1. Reagent A (Inside Reaction Flask):'}
                </label>
                <select
                  id="reagent-a-select"
                  data-testid="custom-reagent-a"
                  value={reagentAId}
                  onChange={(e) => setReagentAId(e.target.value)}
                  className="w-full bg-[#120B06] border border-[#8E6234] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                >
                  {MIXABLE_REAGENTS_A.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.formula} — {r.label[lang]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="reagent-b-select"
                  className="block text-[11px] font-bold text-[#7DD3FC] mb-1"
                >
                  {lang === 'si'
                    ? '2. ප්‍රතිකාරකය B (එක් කරන ද්‍රාවණය):'
                    : '2. Reagent B (Poured from Beaker):'}
                </label>
                <select
                  id="reagent-b-select"
                  data-testid="custom-reagent-b"
                  value={reagentBId}
                  onChange={(e) => setReagentBId(e.target.value)}
                  className="w-full bg-[#120B06] border border-[#8E6234] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                >
                  {MIXABLE_REAGENTS_B.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.formula} — {r.label[lang]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-[11px] font-bold text-[#FCD34D] mb-1.5">
                  {lang === 'si'
                    ? '3. තත්ත්වය තෝරන්න (Condition):'
                    : '3. Reaction Condition:'}
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {REACTION_CONDITIONS.map((cond) => {
                    const active = condition === cond.id;
                    return (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => setCondition(cond.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border text-left flex items-center justify-between cursor-pointer ${
                          active
                            ? 'bg-[#0E3641] border-[#38BDF8] text-white'
                            : 'bg-[#23160D] border-[#6E4927] text-[#EADAC2] hover:border-[#C89242]'
                        }`}
                      >
                        <span>{cond.label[lang]}</span>
                        {cond.id === 'warm' && (
                          <Flame className="w-3.5 h-3.5 text-[#FB923C]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Valid A/L Mix Hints */}
              <div className="rounded-xl bg-[#0C262E] border border-[#287482] p-2.5 space-y-1.5">
                <div className="text-[10px] font-bold text-[#7DD3FC] uppercase tracking-wider">
                  {lang === 'si'
                    ? 'ජනප්‍රිය මිශ්‍රණ උත්සාහ කරන්න'
                    : 'Quick Syllabus Combinations'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { a: 'pbno3', b: 'ki', c: 'room' as ReactionCondition, label: 'Pb²⁺ + KI' },
                    { a: 'cuso4', b: 'nh3-aq', c: 'excess' as ReactionCondition, label: 'Cu²⁺ + Exc. NH₃' },
                    { a: 'fecl3', b: 'kscn', c: 'room' as ReactionCondition, label: 'Fe³⁺ + KSCN' },
                    { a: 'tollens', b: 'aldehyde', c: 'warm' as ReactionCondition, label: 'Tollens + Warm' },
                    { a: 'na-metal', b: 'water', c: 'room' as ReactionCondition, label: 'Na + Water' },
                  ].map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => {
                        setReagentAId(q.a);
                        setReagentBId(q.b);
                        setCondition(q.c);
                      }}
                      className="px-2 py-1 rounded-lg bg-[#123842] hover:bg-[#194E5C] border border-[#38BDF8]/40 text-[10px] font-bold text-[#E0F2FE] cursor-pointer"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* CENTER 3D REACTION STAGE + MIX CONTROLS */}
        <section className="relative flex-1 min-h-[390px] lg:min-h-0 flex flex-col overflow-hidden bg-[#120D09]">
          <img
            src={assets.labRoomBackdrop}
            alt="Chemistry Lab Background"
            decoding="async"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/45 pointer-events-none" />

          {/* 3D Reaction Stage */}
          <div className="relative z-10 flex-1 min-h-[300px]">
            <ReactionCanvas3D
              runtime={benchRuntime}
              cameraPreset={cameraPreset}
              presetVersion={presetVersion}
            />
          </div>

          {/* Top-Center Live Reaction Telemetry HUD */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-[94%] max-w-[560px]">
            <div className="rounded-2xl bg-[#0D2028]/92 border border-[#38BDF8]/65 px-4 py-2 shadow-2xl text-center">
              <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                <span className="text-[#7DD3FC]" data-testid="reaction-status-label">
                  {statusText}
                </span>
                <span className="text-[#CBD5E1] font-mono-tabular flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-[#FB923C]" />
                  {liveTemp.toFixed(1)} °C
                </span>
              </div>
              <div
                className="text-xs sm:text-sm font-extrabold font-mono-tabular text-[#FFF7E6] mt-0.5 truncate"
                data-testid="reaction-hud-equation"
              >
                {activeReaction
                  ? activeReaction.equation
                  : `${activeReagentA.formula} + ${activeReagentB.formula}`}
              </div>
            </div>
          </div>

          {/* Bottom Interactive Mix & React Controls Dock */}
          <div className="relative z-20 mx-3 mb-3 wood-panel rounded-2xl p-3 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="mix-react-btn"
                onClick={handleMixAndReact}
                className="px-4 py-2 rounded-xl amber-cta text-xs font-extrabold text-[#1E1005] flex items-center gap-1.5 cursor-pointer shadow-lg whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {lang === 'si' ? 'මිශ්‍ර කර ප්‍රතික්‍රියා කරවන්න' : 'Mix & React'}
                </span>
              </button>

              <button
                type="button"
                data-testid="reset-flask-btn"
                onClick={handleResetFlask}
                className="px-3 py-2 rounded-xl bg-[#2E1C10] hover:bg-[#3F2717] border border-[#B58246] text-[#FBF5EA] text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#F5C56B]" />
                <span>{lang === 'si' ? 'නැවත අරඹන්න' : 'Reset'}</span>
              </button>
            </div>

            {/* Condition quick-toggle */}
            <div className="flex items-center gap-1">
              {REACTION_CONDITIONS.map((cond) => (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => setCondition(cond.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer whitespace-nowrap ${
                    condition === cond.id
                      ? 'bg-[#0284C7] border-[#BAE6FD] text-white'
                      : 'bg-[#1D120B] border-[#7C5229] text-[#EADAC2]'
                  }`}
                >
                  {cond.id === 'room'
                    ? '25°C'
                    : cond.id === 'warm'
                      ? lang === 'si'
                        ? 'තාපය (Warm)'
                        : 'Warm'
                      : lang === 'si'
                        ? 'අතිරික්ත'
                        : 'Excess'}
                </button>
              ))}
            </div>

            {/* Progress Bar / Scrubber */}
            <div className="flex items-center gap-2 flex-1 min-w-[160px]">
              <span className="text-[10px] font-bold text-[#F5C56B] whitespace-nowrap">
                {Math.round(progress * 100)}%
              </span>
              <input
                type="range"
                aria-label="Reaction Progress"
                min={0}
                max={1}
                step={0.01}
                value={progress}
                onChange={(e) => {
                  setIsReacting(false);
                  setHasMixed(Number(e.target.value) > 0);
                  setProgress(Number(e.target.value));
                }}
                className="flex-1 accent-[#F59E0B] cursor-pointer"
              />
            </div>

            {/* Camera Angle Presets */}
            <div className="flex items-center gap-1">
              {(['overview', 'front', 'closeup', 'top'] as CameraPreset[]).map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setCameraPreset(preset);
                      setPresetVersion((v) => v + 1);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase cursor-pointer border ${
                      cameraPreset === preset
                        ? 'bg-[#F38B21] border-[#FDE68A] text-[#1A0E06]'
                        : 'bg-[#1D120B] border-[#6E4927] text-[#CBD5E1]'
                    }`}
                  >
                    {preset}
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: EQUATIONS, OBSERVATION, MECHANISM & VOICE GUIDE */}
        <section
          aria-label={
            lang === 'si' ? 'ප්‍රතික්‍රියා විස්තරය' : 'Reaction Analysis'
          }
          className="w-full lg:w-[325px] xl:w-[355px] teal-guide-panel border-t lg:border-t-0 lg:border-l border-[#287482] p-4 flex flex-col gap-3 lg:h-full lg:overflow-y-auto lab-scroll shrink-0"
        >
          {activeReaction ? (
            <>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#FBBF24]">
                  {lang === 'si'
                    ? `ඒකක: ${activeReaction.unitBadges.join(', ')} · ${activeReaction.deltaHLabel}`
                    : `Units: ${activeReaction.unitBadges.join(', ')} · ${activeReaction.deltaHLabel}`}
                </div>
                <h2 className="font-display text-base font-extrabold text-white mt-0.5 leading-snug">
                  {activeReaction.title[lang]}
                </h2>
              </div>

              {/* Balanced & Ionic Equation Card */}
              <div className="rounded-xl bg-[#071A20] border border-[#38BDF8]/50 p-3 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#7DD3FC] flex items-center gap-1">
                  <Beaker className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'si' ? 'තුලිත රසායනික සමීකරණය' : 'Balanced Equation'}
                  </span>
                </div>
                <div className="text-xs font-bold font-mono-tabular text-[#FFF7E6] break-words">
                  {activeReaction.equation}
                </div>
                <div className="text-[11px] font-mono-tabular text-[#93C5FD] pt-1 border-t border-[#1E5664]">
                  {activeReaction.ionicEquation}
                </div>
              </div>

              {/* Observation Card */}
              <div
                className={`rounded-xl p-3 border ${
                  hasMixed && progress >= 0.3
                    ? 'bg-[#092B1F] border-[#4ADE80]/80'
                    : 'bg-[#092229] border-[#287482]'
                }`}
              >
                <h3 className="text-xs font-bold text-[#4ADE80] mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'si'
                      ? 'නිරීක්ෂණය (Lab Observation)'
                      : 'Observable Lab Result'}
                  </span>
                </h3>
                <p
                  className="text-xs text-[#E2E8F0] leading-relaxed"
                  data-testid="reaction-observation-text"
                >
                  {activeReaction.observation[lang]}
                </p>
              </div>

              {/* Explanation */}
              <div className="rounded-xl bg-[#092229] border border-[#287482] p-3">
                <h3 className="text-xs font-bold text-[#7DD3FC] mb-1">
                  {lang === 'si'
                    ? 'රසායනික හේතුව (Why It Happens)'
                    : 'Chemical Explanation'}
                </h3>
                <p className="text-xs text-[#E2E8F0] leading-relaxed">
                  {activeReaction.explanation[lang]}
                </p>
              </div>

              {/* Exam Notes */}
              <div className="rounded-xl bg-[#1D160B] border border-[#C89242]/75 p-3">
                <h3 className="text-xs font-bold text-[#FCD34D] mb-1">
                  {lang === 'si'
                    ? 'වැදගත් A/L විභාග කරුණු'
                    : 'A/L Exam High-Yield Points'}
                </h3>
                <p className="text-xs text-[#FFF7E6] leading-relaxed">
                  {activeReaction.examNotes[lang]}
                </p>
              </div>
            </>
          ) : (
            /* Unreactive pair notice in Custom Mix */
            <div
              className={`rounded-xl p-4 space-y-2 ${
                hasMixed
                  ? 'animate-mistake-pop bg-[#450A0A]/90 border-2 border-[#EF4444]'
                  : 'bg-[#2A1810] border border-[#F59E0B]/70'
              }`}
              data-testid="no-reaction-card"
            >
              <div
                className={`flex items-center gap-2 font-bold text-sm ${
                  hasMixed ? 'text-[#FCA5A5]' : 'text-[#FCD34D]'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span data-testid="reaction-mistake-banner">
                  {hasMixed
                    ? lang === 'si'
                      ? 'වැරදියි! දෘශ්‍යමාන ප්‍රතික්‍රියාවක් සිදු නොවේ'
                      : 'Incorrect Mix! No Observable Reaction'
                    : lang === 'si'
                      ? 'කැපී පෙනෙන ප්‍රතික්‍රියාවක් නැත'
                      : 'No Observable Reaction'}
                </span>
              </div>
              <div className="text-xs font-mono-tabular text-[#FFF7E6]">
                {activeReagentA.formula} + {activeReagentB.formula}
              </div>
              <p className="text-xs text-[#FEE2E2] leading-relaxed">
                {customEvaluation.noReactionReason?.[lang]}
              </p>
            </div>
          )}

          {/* Direct Boy Voice Guide Box */}
          <div className="rounded-xl bg-[#0D2E36] border border-[#38BDF8]/60 p-3 space-y-2 mt-auto">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#7DD3FC]">
                {lang === 'si' ? 'AI පිරිමි හඬ උපදේශක' : 'Boy Voice Guide'}
              </span>
              <span className="bg-[#08191F] border border-[#287482] rounded px-2 py-0.5 text-[10px] font-bold text-[#FFE5AD]">
                {voiceName} ({lang === 'si' ? 'පිරිමි හඬ' : 'Male'})
              </span>
            </div>

            <button
              type="button"
              disabled={voiceLoading || muted}
              onClick={() => {
                if (voiceSpeaking) {
                  stopVoice();
                } else if (activeReaction) {
                  speakText(
                    `${activeReaction.title[lang]}. ${activeReaction.voiceSummary[lang]} ${activeReaction.examNotes[lang]}`,
                    false
                  );
                } else if (customEvaluation.noReactionReason) {
                  speakText(customEvaluation.noReactionReason[lang], false);
                }
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {voiceLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : voiceSpeaking ? (
                <Square className="w-3 h-3 fill-current" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
              <span>
                {voiceSpeaking
                  ? lang === 'si'
                    ? 'හඬ නවතන්න'
                    : 'Stop Voice'
                  : lang === 'si'
                    ? 'ප්‍රතික්‍රියාව හඬින් අසන්න'
                    : 'Listen to Boy Voice'}
              </span>
            </button>
          </div>
        </section>
      </div>

      <AIAssistantDrawer
        open={aiDrawerOpen}
        lang={lang}
        unitRoman={activeReaction?.unitBadges[0] || 'VI'}
        experimentTitle={
          activeReaction
            ? activeReaction.title[lang]
            : `${activeReagentA.formula} + ${activeReagentB.formula}`
        }
        stepTitle={statusText}
        stepTask={
          activeReaction
            ? activeReaction.equation
            : `${activeReagentA.formula} + ${activeReagentB.formula}`
        }
        stepInstruction={
          activeReaction
            ? activeReaction.explanation[lang]
            : customEvaluation.noReactionReason?.[lang] || ''
        }
        liveTelemetry={`${liveTemp.toFixed(1)} °C | Condition: ${condition} | Mix: ${Math.round(progress * 100)}%`}
        muted={muted}
        voiceSpeaking={voiceSpeaking}
        voiceLoading={voiceLoading}
        voiceError={voiceError}
        voiceName={voiceName}
        studentProfile={studentProfile}
        onSpeakText={(txt) => speakText(txt, false)}
        onStopVoice={stopVoice}
        onClose={() => setAiDrawerOpen(false)}
      />

      <FooterBar lang={lang} />
    </div>
  );
}
