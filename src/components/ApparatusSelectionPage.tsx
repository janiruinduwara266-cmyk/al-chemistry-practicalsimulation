import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Box,
  CheckCircle2,
  ClipboardList,
  Compass,
  Eye,
  FlaskConical,
  Globe,
  Layers,
  Lightbulb,
  Loader2,
  Menu,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { EXPERIMENTS, getUnitForExperiment } from '../data/curriculum';
import { getPracticalGuide } from '../data/practicalGuides';
import { useBackgroundAssets } from '../contexts/BackgroundAssetsContext';
import { useVoiceInstructor } from '../hooks/useVoiceInstructor';
import { soundFX } from '../utils/soundEffects';
import { AIAssistantDrawer } from './AIAssistantDrawer';
import { ApparatusBox3DCanvas } from './ApparatusBox3DCanvas';
import { FooterBar } from './FooterBar';
import type {
  CameraPreset,
  EquipmentItem,
  ExperimentId,
  Language,
  StudentProfile,
  VoiceName,
} from '../types/lab';

interface ApparatusSelectionPageProps {
  lang: Language;
  experimentId: ExperimentId;
  initialSelectedIds: string[];
  muted: boolean;
  voiceName: VoiceName;
  studentProfile: StudentProfile | null;
  onChangeLang: (lang: Language) => void;
  onToggleMute: () => void;
  onOpenSideMenu: () => void;
  onOpenTopics: () => void;
  onBackToMap: () => void;
  onEnterWorkbench: (selectedIds: string[]) => void;
}

function GlassApparatusIcon({ type }: { type: EquipmentItem['iconType'] }) {
  switch (type) {
    case 'coil':
      return <span className="text-xl font-bold text-amber-300">⚡</span>;
    case 'tube':
      return <span className="text-xl font-bold text-emerald-300">🧪</span>;
    case 'pump':
      return <span className="text-xl font-bold text-sky-300">⏱</span>;
    case 'magnet':
      return <span className="text-xl font-bold text-rose-300">🧲</span>;
    case 'burner':
      return <span className="text-xl font-bold text-orange-300">🔥</span>;
    case 'thermometer':
      return <span className="text-xl font-bold text-red-300">🌡</span>;
    case 'battery':
      return <span className="text-xl font-bold text-lime-300">🔋</span>;
    case 'molecule':
      return <span className="text-xl font-bold text-cyan-300">⚛</span>;
    default:
      return <FlaskConical className="w-5 h-5 text-[#7DD3FC]" />;
  }
}

export function ApparatusSelectionPage({
  lang,
  experimentId,
  initialSelectedIds,
  muted,
  voiceName,
  studentProfile,
  onChangeLang,
  onToggleMute,
  onOpenSideMenu,
  onOpenTopics,
  onBackToMap,
  onEnterWorkbench,
}: ApparatusSelectionPageProps) {
  const experiment = EXPERIMENTS[experimentId];
  const unitRoman = getUnitForExperiment(experimentId);
  const guide = getPracticalGuide(experimentId);
  const studentDisplay = studentProfile?.username || studentProfile?.name || '';
  const { assets } = useBackgroundAssets();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() =>
    new Set(
      initialSelectedIds.filter((id) => experiment.equipment.some((e) => e.id === id))
    )
  );
  const [focusedItemId, setFocusedItemId] = useState<string>(
    experiment.equipment[0]?.id ?? ''
  );
  const [hoveredItem, setHoveredItem] = useState<EquipmentItem | null>(null);
  const [guideTab, setGuideTab] = useState<'procedure' | 'observations' | 'conclusions'>(
    'procedure'
  );
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [prepMistake, setPrepMistake] = useState<string | null>(null);
  const [boxPreset, setBoxPreset] = useState<CameraPreset>('overview');
  const [presetVersion, setPresetVersion] = useState(0);
  const [autoEntering, setAutoEntering] = useState(false);

  const autoTimerRef = useRef<number | null>(null);
  const selectedIdsRef = useRef<Set<string>>(selectedIds);
  selectedIdsRef.current = selectedIds;

  const clearAutoTimer = () => {
    if (autoTimerRef.current !== null) {
      window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    setAutoEntering(false);
  };

  useEffect(() => {
    clearAutoTimer();
    const initialSet = new Set(
      initialSelectedIds.filter((id) => experiment.equipment.some((e) => e.id === id))
    );
    selectedIdsRef.current = initialSet;
    setSelectedIds(initialSet);
    setFocusedItemId(experiment.equipment[0]?.id ?? '');
    setHoveredItem(null);
    setPrepMistake(null);
    setBoxPreset('overview');
    setPresetVersion((v) => v + 1);
    return () => clearAutoTimer();
  }, [experimentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const focusedItem =
    hoveredItem ||
    experiment.equipment.find((e) => e.id === focusedItemId) ||
    experiment.equipment[0];

  const { voiceLoading, voiceSpeaking, voiceError, speakText, stopVoice } =
    useVoiceInstructor({ lang, muted, voiceName });

  useEffect(() => {
    if (muted) return;
    const greetingPrefix = studentDisplay ? `${studentDisplay}, ` : '';
    speakText(
      lang === 'si'
        ? `${greetingPrefix}${experiment.shortTitle.si} පරීක්ෂණය සඳහා 3D උපකරණ පෙට්ටියෙන් අවශ්‍ය උපකරණ තෝරන්න. සියලු උපකරණ තෝරා අවසන් වූ පසු ස්වයංක්‍රීයව පරීක්ෂණය ආරම්භ වේ.`
        : `${greetingPrefix}select the apparatus from the 3D supply box for ${experiment.shortTitle.en}. The practical bench opens automatically once all items are packed.`,
      true
    );
    return () => stopVoice();
  }, [experimentId, lang, muted]); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleAutoEnter = (nextIds: Set<string>) => {
    clearAutoTimer();
    if (nextIds.size !== experiment.equipment.length) return;
    setAutoEntering(true);
    soundFX.playSuccess();
    if (!muted) {
      speakText(
        lang === 'si'
          ? 'සියලුම උපකරණ තෝරා අවසන්! දැන් 3D පරීක්ෂණ මේසයට පිවිසෙමු.'
          : 'All apparatus selected! Entering the 3D practical workbench now.',
        true
      );
    }
    const chosen = Array.from(nextIds);
    autoTimerRef.current = window.setTimeout(() => {
      autoTimerRef.current = null;
      stopVoice();
      onEnterWorkbench(chosen);
    }, 1000);
  };

  const toggleItem = (item: EquipmentItem) => {
    setFocusedItemId(item.id);
    setPrepMistake(null);
    soundFX.playPlace();

    const next = new Set(selectedIdsRef.current);
    const willSelect = !next.has(item.id);
    if (willSelect) {
      next.add(item.id);
    } else {
      next.delete(item.id);
      clearAutoTimer();
    }
    selectedIdsRef.current = next;
    setSelectedIds(next);

    if (next.size === experiment.equipment.length) {
      scheduleAutoEnter(next);
    } else if (!muted) {
      speakText(`${item.name[lang]}. ${item.description[lang]}`, true);
    }
  };

  const selectAll = () => {
    setPrepMistake(null);
    const allIds = new Set(experiment.equipment.map((e) => e.id));
    selectedIdsRef.current = allIds;
    setSelectedIds(allIds);
    scheduleAutoEnter(allIds);
  };

  const selectedCount = selectedIds.size;
  const totalCount = experiment.equipment.length;

  const speakHowToDoPractical = () => {
    const procText = guide.procedure.map((x, idx) => `${idx + 1}. ${x[lang]}`).join(' ');
    const obsText = guide.observations[0]?.[lang] || '';
    const intro =
      lang === 'si'
        ? `${experiment.shortTitle.si} පරීක්ෂණය කරන විදිය: `
        : `How to perform ${experiment.shortTitle.en}: `;
    speakText(`${intro}${procText} ${obsText}`, false);
  };

  const handleGoToBench = () => {
    const missingItems = experiment.equipment.filter((item) => !selectedIds.has(item.id));
    if (missingItems.length > 0) {
      soundFX.playError();
      const missingNames = missingItems.map((m) => m.name[lang]).join(', ');
      const errText =
        lang === 'si'
          ? `වැරදියි! පරීක්ෂණය සඳහා තවම උපකරණ ${missingItems.length}ක් තෝරා නැත (${missingNames}). කරුණාකර සියලු උපකරණ තෝරන්න.`
          : `Incorrect! ${missingItems.length} required apparatus item(s) missing (${missingNames}). Please select all items first.`;
      setPrepMistake(errText);
      if (!muted) {
        speakText(errText, true);
      }
      return;
    }
    clearAutoTimer();
    stopVoice();
    onEnterWorkbench(Array.from(selectedIds));
  };

  return (
    <div
      className="relative w-full min-h-screen flex flex-col bg-[#120D09] overflow-x-hidden"
      data-screen="apparatus-prep"
      data-experiment={experimentId}
    >
      <img
        src={assets.labRoomBackdrop}
        alt="Chemistry Prep Room"
        decoding="async"
        referrerPolicy="no-referrer"
        className="fixed inset-0 w-full h-full object-cover object-center brightness-[0.35] pointer-events-none"
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#160F0A]/75 via-[#0F1E24]/70 to-[#120D09]/90 pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-20 px-3 sm:px-5 py-2.5 bg-[#1B110A]/95 border-b border-[#8E6234] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSideMenu}
            aria-label={lang === 'si' ? 'මෙනුව විවෘත කරන්න' : 'Open Lab Menu'}
            className="w-9 h-9 rounded-xl liquid-glass-card text-[#FFE5AD] flex items-center justify-center cursor-pointer shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onBackToMap}
            className="px-3 py-1.5 rounded-xl liquid-glass-card text-[#FBF5EA] text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#F5C56B]" />
            <span>{lang === 'si' ? 'ප්‍රධාන සිතියම' : 'Lab Map'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenTopics}
            className="hidden sm:flex px-2.5 py-1.5 rounded-xl liquid-glass-amber text-white text-xs font-bold items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{lang === 'si' ? `පාඩම ${unitRoman}` : `Unit ${unitRoman}`}</span>
          </button>

          <div className="ml-1">
            <div className="text-[10px] font-bold text-[#F5C56B] uppercase tracking-wider">
              {lang === 'si'
                ? `පියවර 1: 3D උපකරණ පෙට්ටියෙන් බඩු තෝරන්න (${experiment.number})`
                : `Stage 1: Pick Apparatus from 3D Box (${experiment.number})`}
            </div>
            <h1 className="font-display text-sm sm:text-base font-extrabold text-white leading-tight">
              {experiment.fullTitle[lang]}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {studentDisplay && (
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full liquid-glass-card text-[11px] font-bold text-[#FDE68A]">
              <span>👋 {studentDisplay}</span>
            </span>
          )}

          <button
            type="button"
            disabled={voiceLoading || muted}
            onClick={() =>
              voiceSpeaking
                ? stopVoice()
                : speakText(
                    `${experiment.fullTitle[lang]}. ${focusedItem.name[lang]}: ${focusedItem.description[lang]}`,
                    false
                  )
            }
            className={`h-8 px-2.5 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer border whitespace-nowrap ${
              voiceSpeaking
                ? 'bg-[#DC2626] border-[#FCA5A5] text-white'
                : 'liquid-glass-card text-[#BAE6FD]'
            }`}
          >
            {voiceLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : voiceSpeaking ? (
              <Square className="w-3 h-3 fill-current" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            <span>{lang === 'si' ? 'හඬ උපදෙස්' : 'Live Voice'}</span>
          </button>

          <button
            type="button"
            onClick={() => setAiDrawerOpen((v) => !v)}
            className="h-8 px-3 rounded-full liquid-glass-card text-[#E0F2FE] text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Bot className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{lang === 'si' ? 'AI ගුරුවරයා' : 'AI Tutor'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="w-8 h-8 rounded-full liquid-glass-amber text-white flex items-center justify-center cursor-pointer"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
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

      {/* Main Content Grid */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT (7 cols): 3D INTERACTIVE SUPPLY BOX + CHECKLIST */}
        <section className="lg:col-span-7 liquid-glass-card rounded-3xl p-4 sm:p-5 space-y-3.5">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl liquid-glass-amber flex items-center justify-center">
                <Box className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-display text-base sm:text-lg font-extrabold text-[#FFF7E6]">
                  {lang === 'si'
                    ? '3D උපකරණ පෙට්ටියෙන් බඩු තෝරන්න'
                    : '3D Apparatus Supply Box'}
                </h2>
                <p className="text-xs text-[#CBD5E1]">
                  {lang === 'si'
                    ? '3D පෙට්ටියේ ඇති උපකරණ මත ක්ලික් කර තෝරන්න — සියල්ල තේරූ පසු ස්වයංක්‍රීයව පරීක්ෂණය ඇරඹේ!'
                    : 'Click the 3D instruments inside the wooden box — auto-opens the practical bench once all are packed!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full bg-black/45 border border-white/25 text-xs font-mono-tabular font-bold text-[#FCD34D]"
                data-testid="prep-selected-count"
              >
                {selectedCount} / {totalCount}
              </span>
              <button
                type="button"
                data-testid="prep-select-all-btn"
                onClick={selectAll}
                className="px-3 py-1.5 rounded-xl liquid-glass-emerald text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{lang === 'si' ? 'සියල්ල තෝරන්න' : 'Select All'}</span>
              </button>
            </div>
          </div>

          {/* 3D INTERACTIVE SUPPLY BOX STAGE */}
          <div className="relative h-[265px] sm:h-[305px] w-full rounded-2xl overflow-hidden border-2 border-[#A8733B]/85 bg-[#160D08] shadow-inner">
            <ApparatusBox3DCanvas
              equipment={experiment.equipment}
              selectedIds={selectedIds}
              focusedId={focusedItem.id}
              allPacked={selectedCount === totalCount}
              cameraPreset={boxPreset}
              presetVersion={presetVersion}
              onToggleItem={toggleItem}
              onHoverItem={setHoveredItem}
            />

            {/* Top-left live 3D hover / status badge */}
            <div className="pointer-events-none absolute top-2.5 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
              <div className="px-3 py-1 rounded-full bg-black/70 border border-white/20 text-[11px] font-bold text-[#FDE68A] backdrop-blur-sm">
                {hoveredItem
                  ? `${selectedIds.has(hoveredItem.id) ? '✓ ' : ''}${hoveredItem.name[lang]}`
                  : lang === 'si'
                    ? '👆 3D උපකරණ මත ක්ලික් කරන්න (කරකවා බලන්න)'
                    : '👆 Click any 3D instrument inside box (drag to orbit)'}
              </div>

              <div className="pointer-events-auto flex items-center gap-1 bg-black/70 border border-white/20 rounded-full p-0.5 backdrop-blur-sm">
                {(['overview', 'top', 'front', 'closeup'] as CameraPreset[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setBoxPreset(p);
                      setPresetVersion((v) => v + 1);
                    }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize cursor-pointer transition-colors ${
                      boxPreset === p
                        ? 'bg-[#F38B21] text-[#1A0E06]'
                        : 'text-[#E2E8F0] hover:text-white'
                    }`}
                  >
                    {p === 'overview' ? 'Box' : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-enter celebration overlay inside 3D box */}
            {autoEntering && (
              <div
                data-testid="auto-enter-banner"
                className="smooth-panel absolute inset-x-3 bottom-3 rounded-2xl bg-[#052E16]/92 border-2 border-[#4ADE80] p-3 flex flex-wrap items-center justify-between gap-2.5 shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#4ADE80] animate-bounce shrink-0" />
                  <div className="text-xs">
                    <div className="font-extrabold text-[#86EFAC]">
                      {lang === 'si'
                        ? '✓ සියලුම උපකරණ තෝරා අවසන්!'
                        : '✓ All Apparatus Packed!'}
                    </div>
                    <div className="text-[11px] text-[#DCFCE7]">
                      {lang === 'si'
                        ? '3D පරීක්ෂණ මේසයට ස්වයංක්‍රීයව පිවිසෙමින් පවතී...'
                        : 'Automatically entering the 3D practical workbench...'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={clearAutoTimer}
                    className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold cursor-pointer"
                  >
                    {lang === 'si' ? 'නවතන්න' : 'Stay'}
                  </button>
                  <button
                    type="button"
                    onClick={handleGoToBench}
                    className="px-3 py-1 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white text-[11px] font-extrabold cursor-pointer"
                  >
                    {lang === 'si' ? 'දැන්ම යන්න →' : 'Go Now →'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3D Tray Checklist Cards (synced bidirectionally with 3D box!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {experiment.equipment.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const isFocused = focusedItem.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`prep-item-${item.id}`}
                  aria-pressed={isSelected}
                  onMouseEnter={() => setFocusedItemId(item.id)}
                  onClick={() => toggleItem(item)}
                  className={`text-left p-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2.5 ${
                    isSelected
                      ? 'liquid-glass-emerald ring-2 ring-[#4ADE80]/80'
                      : isFocused
                        ? 'liquid-glass-card ring-2 ring-[#38BDF8]/70'
                        : 'liquid-glass-card hover:border-amber-300/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl liquid-glass-icon flex items-center justify-center shrink-0">
                    <GlassApparatusIcon type={item.iconType} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-white leading-snug truncate">
                        {item.slotLabel[lang]}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#86EFAC] shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] font-semibold text-[#FDE68A] line-clamp-1">
                      {item.name[lang]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Focused Apparatus Detail Strip */}
          {focusedItem && (
            <div className="rounded-2xl bg-[#092229]/85 border border-[#38BDF8]/45 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#7DD3FC]">
                  {lang === 'si' ? 'තෝරාගත් උපකරණ විස්තරය' : 'Apparatus Role & Details'}
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {focusedItem.name[lang]}
                </div>
                <p className="text-xs text-[#E2E8F0] mt-0.5 leading-relaxed">
                  {focusedItem.description[lang]}
                </p>
              </div>
              <button
                type="button"
                disabled={muted || voiceLoading}
                onClick={() =>
                  speakText(`${focusedItem.name[lang]}. ${focusedItem.description[lang]}`, false)
                }
                className="px-3 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-center"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{lang === 'si' ? 'විස්තරය අසන්න' : 'Hear Role'}</span>
              </button>
            </div>
          )}

          {/* Missing-apparatus mistake alert banner */}
          {prepMistake && (
            <div
              role="alert"
              data-testid="prep-mistake-alert"
              className="animate-mistake-pop rounded-2xl bg-[#450A0A]/95 border-2 border-[#EF4444] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#FCA5A5] shrink-0 mt-0.5" />
                <p className="text-xs text-[#FEE2E2] font-semibold leading-relaxed">
                  {prepMistake}
                </p>
              </div>
              <button
                type="button"
                onClick={selectAll}
                className="px-3 py-1.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold whitespace-nowrap cursor-pointer shrink-0"
              >
                {lang === 'si' ? 'සියල්ල නිවැරදිව තෝරන්න' : 'Select Missing Items'}
              </button>
            </div>
          )}

          {/* Go to 3D Workbench CTA */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/15">
            <span className="text-xs text-[#E2E8F0]">
              {selectedCount === totalCount
                ? lang === 'si'
                  ? '✓ සියලුම උපකරණ සූදානම්! වැඩ මේසයට පිවිසෙන්න.'
                  : '✓ All items packed in your tray! Enter the 3D bench.'
                : lang === 'si'
                  ? '3D පෙට්ටියෙන් උපකරණ සියල්ල තෝරූ පසු ස්වයංක්‍රීයව පරීක්ෂණයට යයි.'
                  : 'Select all items from the 3D box above to auto-enter the bench.'}
            </span>

            <button
              type="button"
              data-testid="enter-workbench-btn"
              onClick={handleGoToBench}
              className="amber-cta px-5 py-2.5 rounded-xl text-sm font-extrabold text-[#1E1005] flex items-center gap-2 cursor-pointer shadow-xl transition-transform active:scale-[0.98]"
            >
              <span>
                {lang === 'si'
                  ? '3D වැඩ මේසයට යන්න'
                  : 'Go to 3D Practical Bench'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* RIGHT (5 cols): Practical Guide (Procedure · Observations · Conclusions) */}
        <aside className="lg:col-span-5 teal-guide-panel rounded-3xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold text-[#FBBF24] uppercase tracking-wider">
                {experiment.notebookSummary.scientist[lang]} · {experiment.notebookSummary.year}
              </div>
              <h2 className="font-display text-base font-extrabold text-white mt-0.5">
                {lang === 'si'
                  ? 'පරීක්ෂණය කරන විදිය හා මාර්ගෝපදේශය'
                  : 'How to Do Practical & Guide'}
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={muted || voiceLoading}
                onClick={speakHowToDoPractical}
                className="px-2.5 py-1.5 rounded-xl bg-[#F38B21] hover:bg-[#FFA23A] text-[#1E1005] text-[11px] font-extrabold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{lang === 'si' ? 'කරන විදිය අසන්න' : 'Hear How-To'}</span>
              </button>

              <button
                type="button"
                disabled={muted || voiceLoading}
                onClick={() => {
                  const items = guide[guideTab];
                  speakText(items.map((x) => x[lang]).join(' '), false);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{lang === 'si' ? 'කියවන්න' : 'Read Tab'}</span>
              </button>
            </div>
          </div>

          {/* Tabs: Procedure / Observations / Conclusions */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#071A20] border border-[#287482]">
            <button
              type="button"
              onClick={() => setGuideTab('procedure')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                guideTab === 'procedure'
                  ? 'bg-[#F38B21] text-[#1A0E06]'
                  : 'text-[#CBD5E1] hover:text-white'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{lang === 'si' ? 'ක්‍රමය' : 'Procedure'}</span>
            </button>

            <button
              type="button"
              onClick={() => setGuideTab('observations')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                guideTab === 'observations'
                  ? 'bg-[#0284C7] text-white'
                  : 'text-[#CBD5E1] hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{lang === 'si' ? 'නිරීක්ෂණ' : 'Observe'}</span>
            </button>

            <button
              type="button"
              onClick={() => setGuideTab('conclusions')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                guideTab === 'conclusions'
                  ? 'bg-[#16A34A] text-white'
                  : 'text-[#CBD5E1] hover:text-white'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{lang === 'si' ? 'නිගමන' : 'Conclude'}</span>
            </button>
          </div>

          {/* Active Guide List */}
          <ol className="space-y-2.5 max-h-[380px] overflow-y-auto lab-scroll pr-1">
            {guide[guideTab].map((entry, idx) => (
              <li
                key={idx}
                className="rounded-xl bg-[#082229] border border-[#1E5664] p-3 text-xs text-[#E2E8F0] leading-relaxed flex gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-[#16414C] text-[#FBBF24] font-mono-tabular font-bold text-[11px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span>{entry[lang]}</span>
              </li>
            ))}
          </ol>

          {experiment.notebookSummary.equations.length > 0 && (
            <div className="rounded-xl bg-[#071A20] border border-[#38BDF8]/40 p-3 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7DD3FC]">
                {lang === 'si' ? 'ප්‍රධාන සූත්‍ර හා සමීකරණ' : 'Key Equations'}
              </div>
              {experiment.notebookSummary.equations.map((eq, i) => (
                <div key={i} className="text-[11px] font-mono-tabular text-[#FFF7E6] break-words">
                  {eq}
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      <AIAssistantDrawer
        open={aiDrawerOpen}
        lang={lang}
        unitRoman={unitRoman}
        experimentTitle={experiment.shortTitle[lang]}
        stepTitle={lang === 'si' ? '3D උපකරණ පෙට්ටිය' : '3D Apparatus Box'}
        stepTask={focusedItem.name[lang]}
        stepInstruction={focusedItem.description[lang]}
        liveTelemetry={`Selected ${selectedCount}/${totalCount} items`}
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
