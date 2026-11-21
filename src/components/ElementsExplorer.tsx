import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Atom,
  Bot,
  Compass,
  Globe,
  Loader2,
  Menu,
  Search,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  ALL_ELEMENTS,
  ELEMENT_CATEGORY_META,
  type ChemicalElementSpec,
  type ElementBlock,
  type ElementCategory,
} from '../data/elementsCatalog';
import { useBackgroundAssets } from '../contexts/BackgroundAssetsContext';
import { useVoiceInstructor } from '../hooks/useVoiceInstructor';
import { AIAssistantDrawer } from './AIAssistantDrawer';
import { ElementAtomCanvas3D } from './ElementAtomCanvas3D';
import { FooterBar } from './FooterBar';
import type { Language, StudentProfile, VoiceName } from '../types/lab';

interface ElementsExplorerProps {
  lang: Language;
  muted: boolean;
  voiceName: VoiceName;
  studentProfile: StudentProfile | null;
  onChangeLang: (lang: Language) => void;
  onToggleMute: () => void;
  onOpenSideMenu: () => void;
  onOpenTopics: () => void;
  onBackToMap: () => void;
}

export function ElementsExplorer({
  lang,
  muted,
  voiceName,
  studentProfile,
  onChangeLang,
  onToggleMute,
  onOpenSideMenu,
  onOpenTopics,
  onBackToMap,
}: ElementsExplorerProps) {
  const [selectedZ, setSelectedZ] = useState<number>(24); // Start on Cr (classic Aufbau exception!) or H
  const [searchQuery, setSearchQuery] = useState('');
  const [blockFilter, setBlockFilter] = useState<ElementBlock | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ElementCategory | 'all'>('all');
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const { assets } = useBackgroundAssets();

  const selectedElement: ChemicalElementSpec = useMemo(
    () => ALL_ELEMENTS.find((e) => e.z === selectedZ) || ALL_ELEMENTS[0],
    [selectedZ]
  );
  const categoryMeta = ELEMENT_CATEGORY_META[selectedElement.category];
  const studentDisplay = studentProfile?.username || studentProfile?.name || '';

  const { voiceLoading, voiceSpeaking, voiceError, speakText, stopVoice } =
    useVoiceInstructor({ lang, muted, voiceName });

  useEffect(() => {
    if (muted) return;
    const prefix = studentDisplay ? `${studentDisplay}, ` : '';
    const text =
      lang === 'si'
        ? `${prefix}පරමාණුක ක්‍රමාංකය ${selectedElement.z}, ${selectedElement.name.si} (${selectedElement.symbol}). ඉලෙක්ට්‍රෝන වින්‍යාසය ${selectedElement.shortElectronConfig}. ${selectedElement.description.si}`
        : `${prefix}Atomic number ${selectedElement.z}, ${selectedElement.name.en} (${selectedElement.symbol}). Electron configuration ${selectedElement.shortElectronConfig}. ${selectedElement.description.en}`;
    speakText(text, true);
    return () => stopVoice();
  }, [selectedElement.z, lang, muted]); // eslint-disable-line react-hooks/exhaustive-deps

  const matchingSet = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matched = new Set<number>();
    for (const el of ALL_ELEMENTS) {
      if (blockFilter !== 'all' && el.block !== blockFilter) continue;
      if (categoryFilter !== 'all' && el.category !== categoryFilter) continue;
      if (q) {
        const hit =
          el.symbol.toLowerCase().includes(q) ||
          el.name.en.toLowerCase().includes(q) ||
          el.name.si.toLowerCase().includes(q) ||
          String(el.z) === q;
        if (!hit) continue;
      }
      matched.add(el.z);
    }
    return matched;
  }, [blockFilter, categoryFilter, searchQuery]);

  const mainGridElements = useMemo(
    () => ALL_ELEMENTS.filter((e) => e.gridRow <= 7),
    []
  );
  const lanthanides = useMemo(
    () => ALL_ELEMENTS.filter((e) => e.gridRow === 9),
    []
  );
  const actinides = useMemo(
    () => ALL_ELEMENTS.filter((e) => e.gridRow === 10),
    []
  );

  const renderTile = (el: ChemicalElementSpec) => {
    const isSelected = el.z === selectedElement.z;
    const isMatch = matchingSet.has(el.z);
    const meta = ELEMENT_CATEGORY_META[el.category];

    return (
      <button
        key={el.z}
        type="button"
        data-testid={`element-tile-${el.z}`}
        aria-pressed={isSelected}
        onClick={() => setSelectedZ(el.z)}
        style={{
          gridColumnStart: el.gridRow <= 7 ? el.gridCol : undefined,
          gridRowStart: el.gridRow <= 7 ? el.gridRow : undefined,
          borderColor: isSelected ? '#FACC15' : `${meta.accentHex}55`,
          background: isSelected
            ? `linear-gradient(155deg, ${meta.accentHex}66, rgba(15,23,42,0.92))`
            : `linear-gradient(155deg, ${meta.accentHex}26, rgba(15,23,42,0.72))`,
        }}
        className={`relative rounded-lg p-1 border text-left transition-transform cursor-pointer select-none min-w-[42px] h-[48px] flex flex-col justify-between shadow ${
          isSelected
            ? 'ring-2 ring-[#FACC15] scale-[1.06] z-10'
            : 'hover:scale-[1.04] hover:border-white/70'
        } ${!isMatch ? 'opacity-25' : ''}`}
      >
        <div className="flex items-center justify-between text-[8px] font-mono-tabular leading-none">
          <span className="font-bold text-[#FDE68A]">{el.z}</span>
          {el.isExceptionConfig && (
            <span className="text-[7px] text-[#4ADE80] font-extrabold">*</span>
          )}
        </div>
        <div className="text-xs font-extrabold text-white leading-none text-center">
          {el.symbol}
        </div>
        <div className="text-[7px] text-[#CBD5E1] truncate leading-none text-center">
          {el.name.en}
        </div>
      </button>
    );
  };

  return (
    <div
      className="relative w-full min-h-screen lg:h-screen flex flex-col overflow-x-hidden lg:overflow-hidden bg-[#0F0B08]"
      data-screen="elements-explorer"
      data-element-z={selectedElement.z}
    >
      <img
        src={assets.labRoomBackdrop}
        alt="Chemistry Periodic Table Backdrop"
        decoding="async"
        referrerPolicy="no-referrer"
        className="fixed inset-0 w-full h-full object-cover object-center brightness-[0.22] pointer-events-none"
      />

      {/* Top Header */}
      <header className="relative z-20 px-3 sm:px-5 py-2.5 bg-[#1B110A]/95 border-b border-[#8E6234] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto sm:flex-1">
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
            className="px-3 py-1.5 rounded-xl liquid-glass-card text-[#FBF5EA] text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#F5C56B]" />
            <span>{lang === 'si' ? 'ප්‍රධාන සිතියම' : 'Lab Map'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenTopics}
            className="hidden sm:flex px-2.5 py-1.5 rounded-xl liquid-glass-amber text-[#1E1005] text-xs font-extrabold items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{lang === 'si' ? 'පාඩම් 1–10' : 'Units 1–10'}</span>
          </button>

          <div className="ml-1 min-w-0">
            <h1 className="font-display text-xs sm:text-base font-extrabold text-[#FFE5AD] leading-tight flex items-center gap-1.5 truncate">
              <Atom className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <span className="truncate">
                {lang === 'si'
                  ? 'ආවර්තිතා වගුව — මූලද්‍රව්‍ය 118 හා ඉලෙක්ට්‍රෝන වින්‍යාස'
                  : 'All 118 Chemical Elements & 3D Electron Configurations'}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={voiceLoading || muted}
            onClick={() =>
              voiceSpeaking
                ? stopVoice()
                : speakText(
                    `${selectedElement.name[lang]} (${selectedElement.symbol}). ${selectedElement.shortElectronConfig}. ${selectedElement.description[lang]}`,
                    false
                  )
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
            <span>{lang === 'si' ? `පිරිමි හඬ (${voiceName})` : `Male Voice (${voiceName})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setAiDrawerOpen((v) => !v)}
            className="h-8 px-3 rounded-full bg-[#0D2E36] border border-[#38BDF8] text-[#E0F2FE] text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
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

      {/* Main Split View: Periodic Table Grid (Left) + 3D Atom & Config Inspector (Right) */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* LEFT: 118-Element Periodic Table + Search & Block Filters */}
        <section className="flex-1 p-3 sm:p-4 flex flex-col gap-3 overflow-y-auto lab-scroll">
          {/* Search + Block Filter Bar */}
          <div className="liquid-glass-card rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-[#D4BFA2] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                data-testid="elements-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === 'si'
                    ? 'මූලද්‍රව්‍ය සොයන්න (උදා: Fe, 24, කොපර්)...'
                    : 'Search by symbol, name, or atomic number...'
                }
                className="w-full bg-black/45 border border-white/20 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {(['all', 's', 'p', 'd', 'f'] as const).map((blk) => (
                <button
                  key={blk}
                  type="button"
                  onClick={() => setBlockFilter(blk)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                    blockFilter === blk
                      ? 'bg-[#F38B21] border-[#FDE68A] text-[#1A0E06]'
                      : 'bg-black/35 border-white/15 text-[#E2E8F0]'
                  }`}
                >
                  {blk === 'all' ? (lang === 'si' ? 'සියලු ගොනු' : 'All Blocks') : `${blk}-block`}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Chips (horizontally scrollable on mobile, wraps cleanly on desktop) */}
          <div className="flex flex-nowrap sm:flex-wrap gap-1.5 overflow-x-auto pb-1 sm:pb-0 lab-scroll">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer shrink-0 whitespace-nowrap ${
                categoryFilter === 'all'
                  ? 'bg-[#0284C7] border-[#BAE6FD] text-white'
                  : 'bg-black/40 border-white/15 text-[#CBD5E1]'
              }`}
            >
              {lang === 'si' ? 'සියල්ල (118)' : 'All (118)'}
            </button>
            {(Object.keys(ELEMENT_CATEGORY_META) as ElementCategory[]).map((cat) => {
              const m = ELEMENT_CATEGORY_META[cat];
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(active ? 'all' : cat)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                    active ? 'ring-2 ring-white text-white bg-black/70' : 'bg-black/35 text-[#CBD5E1]'
                  }`}
                  style={{ borderColor: `${m.accentHex}80` }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: m.accentHex }}
                  />
                  <span>{m.label[lang]}</span>
                </button>
              );
            })}
          </div>

          {/* 18-Column Periodic Table */}
          <div className="liquid-glass-card rounded-2xl p-3 overflow-x-auto lab-scroll">
            <div
              className="grid gap-1 min-w-[790px]"
              style={{ gridTemplateColumns: 'repeat(18, minmax(40px, 1fr))' }}
            >
              {mainGridElements.map(renderTile)}
            </div>

            {/* f-Block Rows (Lanthanides 57-71 & Actinides 89-103) */}
            <div className="mt-3 pt-2.5 border-t border-white/15 space-y-1 min-w-[790px]">
              <div
                className="grid gap-1 items-center"
                style={{ gridTemplateColumns: '68px repeat(15, minmax(40px, 1fr))' }}
              >
                <span className="text-[9px] font-bold text-[#F5C56B] text-right pr-1.5">
                  4f (La–Lu)
                </span>
                {lanthanides.map(renderTile)}
              </div>
              <div
                className="grid gap-1 items-center"
                style={{ gridTemplateColumns: '68px repeat(15, minmax(40px, 1fr))' }}
              >
                <span className="text-[9px] font-bold text-[#FB7185] text-right pr-1.5">
                  5f (Ac–Lr)
                </span>
                {actinides.map(renderTile)}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: 3D Atom Visualizer + Electron Configurations + Details */}
        <aside className="w-full lg:w-[375px] xl:w-[405px] teal-guide-panel border-t lg:border-t-0 lg:border-l border-[#287482] p-4 flex flex-col gap-3 lg:h-full lg:overflow-y-auto lab-scroll shrink-0">
          {/* Element Hero Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl liquid-glass-orb flex flex-col items-center justify-center shrink-0 border-2"
                style={{ borderColor: categoryMeta.accentHex }}
              >
                <span className="text-[10px] font-mono-tabular font-bold text-[#FDE68A]">
                  {selectedElement.z}
                </span>
                <span className="text-xl font-extrabold text-white leading-none">
                  {selectedElement.symbol}
                </span>
              </div>
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: categoryMeta.accentHex }}
                >
                  {categoryMeta.label[lang]} · {selectedElement.block}-block
                </div>
                <h2
                  className="font-display text-lg font-extrabold text-white leading-tight"
                  data-testid="selected-element-title"
                >
                  {selectedElement.name[lang]}
                </h2>
                <div className="text-[11px] text-[#CBD5E1]">
                  {lang === 'si' ? selectedElement.name.en : selectedElement.name.si} · Ar{' '}
                  {selectedElement.mass}
                </div>
              </div>
            </div>
          </div>

          {/* 3D Interactive Bohr Atom */}
          <div className="relative h-[205px] rounded-2xl bg-[#06141A] border border-[#38BDF8]/40 overflow-hidden">
            <ElementAtomCanvas3D
              atomicNumber={selectedElement.z}
              shells={selectedElement.shells}
              accentHex={categoryMeta.accentHex}
            />
            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-[#93C5FD] pointer-events-none">
              <span>
                {lang === 'si' ? 'කවච (Shells):' : 'Shells:'} [{selectedElement.shells.join(', ')}]
              </span>
              <span>{lang === 'si' ? '3D කරකවා බලන්න' : 'Drag 3D Atom'}</span>
            </div>
          </div>

          {/* Electron Configurations Card */}
          <div className="rounded-2xl bg-[#071A20] border border-[#38BDF8]/50 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7DD3FC]">
                {lang === 'si' ? 'ඉලෙක්ට්‍රෝන වින්‍යාසය' : 'Electron Configuration'}
              </span>
              {selectedElement.isExceptionConfig && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-400/70 text-[9px] font-bold text-[#86EFAC]">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{lang === 'si' ? 'Aufbau ව්‍යතිරේකය' : 'Aufbau Exception'}</span>
                </span>
              )}
            </div>

            <div
              className="text-sm font-extrabold font-mono-tabular text-[#FDE68A]"
              data-testid="element-short-config"
            >
              {selectedElement.shortElectronConfig}
            </div>
            <div className="text-[11px] font-mono-tabular text-[#CBD5E1] break-words leading-relaxed pt-1 border-t border-[#1E5664]">
              {selectedElement.fullElectronConfig}
            </div>
          </div>

          {/* Quick Atomic Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-[#092229] border border-[#287482] p-2">
              <div className="text-[9px] text-[#93C5FD]">
                {lang === 'si' ? 'සා.ප.ස් (Ar)' : 'Atomic Mass'}
              </div>
              <div className="text-xs font-bold font-mono-tabular text-white mt-0.5">
                {selectedElement.mass}
              </div>
            </div>
            <div className="rounded-xl bg-[#092229] border border-[#287482] p-2">
              <div className="text-[9px] text-[#93C5FD]">
                {lang === 'si' ? 'වි.ඍණතාව (EN)' : 'Electroneg.'}
              </div>
              <div className="text-xs font-bold font-mono-tabular text-white mt-0.5">
                {selectedElement.electronegativity ?? '—'}
              </div>
            </div>
            <div className="rounded-xl bg-[#092229] border border-[#287482] p-2">
              <div className="text-[9px] text-[#93C5FD]">
                {lang === 'si' ? 'ඔක්සිකරණ' : 'Oxidation'}
              </div>
              <div className="text-[11px] font-bold font-mono-tabular text-white mt-0.5 truncate">
                {selectedElement.oxidationStates}
              </div>
            </div>
          </div>

          {/* Description & Uses */}
          <div className="rounded-xl bg-[#092229] border border-[#287482] p-3">
            <h3 className="text-xs font-bold text-[#7DD3FC] mb-1">
              {lang === 'si' ? 'මූලද්‍රව්‍ය විස්තරය' : 'Properties & Chemistry Notes'}
            </h3>
            <p className="text-xs text-[#E2E8F0] leading-relaxed">
              {selectedElement.description[lang]}
            </p>
          </div>

          <div className="rounded-xl bg-[#1D160B] border border-[#C89242]/75 p-3">
            <h3 className="text-xs font-bold text-[#FCD34D] mb-1">
              {lang === 'si' ? 'ප්‍රධාන භාවිතයන්' : 'Key Laboratory & Real-World Uses'}
            </h3>
            <p className="text-xs text-[#FFF7E6] leading-relaxed">
              {selectedElement.usesAndLabNotes[lang]}
            </p>
          </div>
        </aside>
      </div>

      <AIAssistantDrawer
        open={aiDrawerOpen}
        lang={lang}
        unitRoman={selectedElement.z <= 36 ? 'II' : 'VI'}
        experimentTitle={`${selectedElement.name[lang]} (${selectedElement.symbol}, Z=${selectedElement.z})`}
        stepTitle={selectedElement.shortElectronConfig}
        stepTask={selectedElement.fullElectronConfig}
        stepInstruction={selectedElement.description[lang]}
        liveTelemetry={`Z=${selectedElement.z}, Ar=${selectedElement.mass}, Shells=[${selectedElement.shells.join(',')}], Block=${selectedElement.block}`}
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
