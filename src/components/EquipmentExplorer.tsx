import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  Compass,
  FlaskConical,
  Globe,
  Loader2,
  Menu,
  Power,
  Search,
  Square,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import {
  EQUIPMENT_CATALOG,
  EQUIPMENT_CATEGORIES,
  evaluateInstrumentTelemetry,
  type EquipmentCategory,
  type InstrumentRuntimeState,
} from '../data/equipmentCatalog';
import { useBackgroundAssets } from '../contexts/BackgroundAssetsContext';
import { useVoiceInstructor } from '../hooks/useVoiceInstructor';
import { AIAssistantDrawer } from './AIAssistantDrawer';
import { EquipmentCanvas3D } from './EquipmentCanvas3D';
import { FooterBar } from './FooterBar';
import type { CameraPreset, Language, StudentProfile, VoiceName } from '../types/lab';

interface EquipmentExplorerProps {
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

export function EquipmentExplorer({
  lang,
  muted,
  voiceName,
  studentProfile,
  onChangeLang,
  onToggleMute,
  onOpenSideMenu,
  onOpenTopics,
  onBackToMap,
}: EquipmentExplorerProps) {
  const [category, setCategory] = useState<EquipmentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>(EQUIPMENT_CATALOG[3].id); // Digital pH Meter / Electric showcase first or first matching
  const { assets } = useBackgroundAssets();
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [presetVersion, setPresetVersion] = useState(0);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const selectedSpec = useMemo(
    () => EQUIPMENT_CATALOG.find((item) => item.id === selectedId) || EQUIPMENT_CATALOG[0],
    [selectedId]
  );

  const [runtime, setRuntime] = useState<InstrumentRuntimeState>(() => ({
    active: true,
    sliderValue: selectedSpec.sliderDefault,
    sampleId: selectedSpec.defaultSample,
  }));

  useEffect(() => {
    setRuntime({
      active: true,
      sliderValue: selectedSpec.sliderDefault,
      sampleId: selectedSpec.defaultSample,
    });
    setCameraPreset('overview');
    setPresetVersion((v) => v + 1);
  }, [selectedSpec]);

  const {
    voiceLoading,
    voiceSpeaking,
    voiceError,
    speakText,
    stopVoice,
  } = useVoiceInstructor({ lang, muted, voiceName });

  const displayName = studentProfile?.username || studentProfile?.name || '';

  // Always narrate selected equipment summary live in boy voice whenever unmuted
  useEffect(() => {
    if (!muted && selectedSpec) {
      const prefix = displayName
        ? lang === 'si'
          ? `${displayName}, `
          : `${displayName}, `
        : '';
      speakText(`${prefix}${selectedSpec.name[lang]}. ${selectedSpec.voiceSummary[lang]}`, true);
    }
    return () => stopVoice();
  }, [selectedSpec, lang, muted, displayName]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return EQUIPMENT_CATALOG.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!q) return true;
      return (
        item.name.si.toLowerCase().includes(q) ||
        item.name.en.toLowerCase().includes(q) ||
        item.shortName.si.toLowerCase().includes(q) ||
        item.shortName.en.toLowerCase().includes(q)
      );
    });
  }, [category, searchQuery]);

  const telemetry = useMemo(
    () => evaluateInstrumentTelemetry(selectedSpec.id, runtime),
    [selectedSpec.id, runtime]
  );

  return (
    <div
      className="relative w-full min-h-screen lg:h-screen flex flex-col overflow-x-hidden lg:overflow-hidden bg-[#120D09]"
      data-screen="equipment-explorer"
      data-instrument={selectedSpec.id}
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

          <div className="ml-1">
            <h1 className="font-display text-sm sm:text-base font-extrabold text-[#FFE5AD] leading-tight">
              {lang === 'si'
                ? '3D විද්‍යාගාර හා විදුලි උපකරණ ගවේෂණය'
                : '3D Chemistry & Electric Equipment Explorer'}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-[#D4BFA2] hidden md:block">
              {lang === 'si'
                ? 'A/L විෂය නිර්දේශයේ සියලුම විදුලි හා රසායනික උපකරණ 3D වලින් ක්‍රියාත්මක කර බලන්න'
                : 'Operate and inspect all 20 electric meters, volumetric glassware & thermal apparatus in 3D'}
            </p>
          </div>
        </div>

        {/* Right Voice + AI + Lang Quick Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={voiceLoading || muted}
            onClick={() => {
              if (voiceSpeaking) {
                stopVoice();
              } else {
                speakText(`${selectedSpec.name[lang]}. ${selectedSpec.voiceSummary[lang]}`, false);
              }
            }}
            aria-label={lang === 'si' ? 'උපකරණය හඬින් අසන්න' : 'Speak Equipment Guide'}
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
              {lang === 'si' ? `සජීවී හඬ (${voiceName})` : `Live Voice (${voiceName})`}
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

      {/* Main 3-Column Explorer Body */}
      <div className="relative flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* LEFT CATALOG COLUMN */}
        <section
          aria-label={lang === 'si' ? 'උපකරණ ලැයිස්තුව' : 'Lab Instrument Catalog'}
          className="w-full lg:w-[290px] xl:w-[310px] bg-[#1A110B] border-b lg:border-b-0 lg:border-r border-[#8E6234] p-3 flex flex-col gap-2.5 lg:h-full lg:overflow-hidden shrink-0"
        >
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#D4BFA2] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'si' ? 'උපකරණ සොයන්න...' : 'Search apparatus...'}
              className="w-full bg-[#120B06] border border-[#7C5229] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#F59E0B]"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            {EQUIPMENT_CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
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

          {/* Scrollable Instrument Cards */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lab-scroll pb-1 lg:pr-1 lg:flex-1">
            {filteredTools.map((tool) => {
              const selected = tool.id === selectedSpec.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  aria-pressed={selected}
                  data-selected={selected ? 'true' : 'false'}
                  onClick={() => setSelectedId(tool.id)}
                  className={`min-w-[195px] lg:min-w-0 w-full text-left p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 shrink-0 ${
                    selected
                      ? 'bg-[#0E3641] border-[#38BDF8] shadow-lg'
                      : 'bg-[#23160D] border-[#6E4927]/70 hover:border-[#C89242]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      tool.isElectric
                        ? 'liquid-glass-icon text-[#38BDF8]'
                        : 'liquid-glass-card text-[#FCD34D]'
                    }`}
                  >
                    {tool.isElectric ? <Zap className="w-4 h-4" /> : <FlaskConical className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#FFF7E6] leading-snug line-clamp-1">
                      {tool.shortName[lang]}
                    </div>
                    <div className="text-[10px] text-[#CBD5E1] line-clamp-1 mt-0.5">
                      {lang === 'si' ? tool.shortName.en : tool.shortName.si}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {tool.isElectric && (
                        <span className="px-1.5 py-0.2 rounded bg-[#0284C7]/30 text-[#7DD3FC] text-[9px] font-bold">
                          {lang === 'si' ? 'විදුලි' : 'ELECTRIC'}
                        </span>
                      )}
                      <span className="text-[9px] text-[#F5C56B] font-mono-tabular">
                        Units {tool.unitBadges.join(', ')}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* CENTER 3D STAGE + LIVE TELEMETRY & INTERACTIVE CONTROLS */}
        <section className="relative flex-1 min-h-[380px] lg:min-h-0 flex flex-col overflow-hidden bg-[#120D09]">
          <img
            src={assets.labRoomBackdrop}
            alt="Chemistry Lab Background"
            decoding="async"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/45 pointer-events-none" />

          {/* 3D Equipment Stage */}
          <div className="relative z-10 flex-1 min-h-[300px]">
            <EquipmentCanvas3D
              instrumentId={selectedSpec.id}
              runtime={runtime}
              cameraPreset={cameraPreset}
              presetVersion={presetVersion}
            />
          </div>

          {/* Top-Center Live Instrument Telemetry HUD */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-[92%] max-w-[440px]">
            <div className="rounded-2xl bg-[#0D2028]/92 border border-[#38BDF8]/65 px-4 py-2 shadow-2xl text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7DD3FC]">
                {telemetry.statusLabel[lang]}
              </div>
              <div
                className="text-base sm:text-lg font-extrabold font-mono-tabular mt-0.5"
                style={{ color: telemetry.accentColor }}
                data-testid="explorer-telemetry-reading"
              >
                {telemetry.primaryReading}
              </div>
              <div className="text-[11px] text-[#CBD5E1]">{telemetry.secondaryReading}</div>
            </div>
          </div>

          {/* Bottom Interactive Equipment Controls Dock */}
          <div className="relative z-20 mx-3 mb-3 wood-panel rounded-2xl p-3 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3">
            {/* Operate / Power Toggle */}
            <button
              type="button"
              onClick={() => setRuntime((r) => ({ ...r, active: !r.active }))}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-colors whitespace-nowrap ${
                runtime.active
                  ? 'bg-[#16A34A] border-[#BBF7D0] text-white'
                  : 'bg-[#334155] border-[#64748B] text-[#E2E8F0]'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>
                {selectedSpec.operateLabel[lang]}: {runtime.active ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Primary Live Slider */}
            <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
              <label
                htmlFor="explorer-param-slider"
                className="text-[11px] font-semibold text-[#F5C56B] whitespace-nowrap"
              >
                {selectedSpec.sliderLabel[lang]}:
              </label>
              <input
                id="explorer-param-slider"
                type="range"
                min={selectedSpec.sliderMin}
                max={selectedSpec.sliderMax}
                step={selectedSpec.sliderStep}
                value={runtime.sliderValue}
                onChange={(e) =>
                  setRuntime((r) => ({ ...r, sliderValue: Number(e.target.value) }))
                }
                className="flex-1 accent-[#F59E0B] cursor-pointer"
              />
              <span className="text-xs font-mono-tabular font-bold text-white min-w-[60px] text-right">
                {runtime.sliderValue} {selectedSpec.sliderUnit}
              </span>
            </div>

            {/* Test Sample Chips */}
            <div className="flex flex-wrap items-center gap-1">
              {selectedSpec.samples.map((smp) => {
                const active = runtime.sampleId === smp.id;
                return (
                  <button
                    key={smp.id}
                    type="button"
                    onClick={() => setRuntime((r) => ({ ...r, sampleId: smp.id }))}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#0284C7] border-[#BAE6FD] text-white'
                        : 'bg-[#1D120B] border-[#7C5229] text-[#EADAC2] hover:border-[#F59E0B]'
                    }`}
                  >
                    {smp.label[lang]}
                  </button>
                );
              })}
            </div>

            {/* Camera Angle Presets */}
            <div className="flex items-center gap-1">
              {(['overview', 'front', 'closeup', 'top'] as CameraPreset[]).map((preset) => (
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
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT BILINGUAL THEORY, FUNCTIONS & VOICE GUIDE COLUMN */}
        <section
          aria-label={lang === 'si' ? 'උපකරණ විස්තරය' : 'Instrument Explanation'}
          className="w-full lg:w-[320px] xl:w-[345px] teal-guide-panel border-t lg:border-t-0 lg:border-l border-[#287482] p-4 flex flex-col gap-3 lg:h-full lg:overflow-y-auto lab-scroll shrink-0"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#FBBF24]">
                {lang === 'si'
                  ? `ඒකක: ${selectedSpec.unitBadges.join(', ')}`
                  : `Syllabus Units: ${selectedSpec.unitBadges.join(', ')}`}
              </div>
              <h2 className="font-display text-base font-extrabold text-white mt-0.5 leading-snug">
                {selectedSpec.name[lang]}
              </h2>
            </div>
          </div>

          <div className="rounded-xl bg-[#092229] border border-[#287482] p-3">
            <h3 className="text-xs font-bold text-[#7DD3FC] mb-1">
              {lang === 'si' ? 'කාර්යය හා සිදුවන දේ (What It Does)' : 'What It Does & Effects'}
            </h3>
            <p className="text-xs text-[#E2E8F0] leading-relaxed">
              {selectedSpec.whatItDoes[lang]}
            </p>
          </div>

          <div className="rounded-xl bg-[#092229] border border-[#287482] p-3">
            <h3 className="text-xs font-bold text-[#4ADE80] mb-1">
              {lang === 'si' ? 'ක්‍රියාත්මක වන ආකාරය (How To Use)' : 'How It Works in the Lab'}
            </h3>
            <p className="text-xs text-[#E2E8F0] leading-relaxed">
              {selectedSpec.howItWorks[lang]}
            </p>
          </div>

          <div className="rounded-xl bg-[#1D160B] border border-[#C89242]/75 p-3">
            <h3 className="text-xs font-bold text-[#FCD34D] mb-1">
              {lang === 'si' ? 'වැදගත් A/L විභාග කරුණු' : 'Key A/L Exam Tips'}
            </h3>
            <p className="text-xs text-[#FFF7E6] leading-relaxed">
              {selectedSpec.examTips[lang]}
            </p>
          </div>

          {/* Direct Boy Voice Assist Card */}
          <div className="rounded-xl bg-[#0D2E36] border border-[#38BDF8]/60 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#7DD3FC]">
                {lang === 'si' ? 'AI පිරිමි හඬ උපදේශක' : 'Boy Voice Lab Guide'}
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
                } else {
                  speakText(
                    `${selectedSpec.name[lang]}. ${selectedSpec.voiceSummary[lang]} ${selectedSpec.examTips[lang]}`,
                    false
                  );
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
                    ? 'මෙම උපකරණය ගැන හඬින් අසන්න'
                    : 'Listen to Boy Voice Guide'}
              </span>
            </button>
          </div>
        </section>
      </div>

      <AIAssistantDrawer
        open={aiDrawerOpen}
        lang={lang}
        unitRoman={selectedSpec.unitBadges[0]}
        experimentTitle={selectedSpec.name[lang]}
        stepTitle={selectedSpec.shortName[lang]}
        stepTask={telemetry.statusLabel[lang]}
        stepInstruction={selectedSpec.whatItDoes[lang]}
        liveTelemetry={`${telemetry.primaryReading} | ${telemetry.secondaryReading}`}
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
