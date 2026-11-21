import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Compass,
  Eye,
  Lightbulb,
  Lock,
  Mic,
  MicOff,
  Volume2,
  X,
} from 'lucide-react';
import { getPracticalGuide } from '../data/practicalGuides';
import type { ExperimentId, LabStep, Language } from '../types/lab';
import type { MistakeDiagnostic } from '../utils/practicalValidation';

interface StepGuidePanelProps {
  lang: Language;
  experimentId: ExperimentId;
  steps: LabStep[];
  currentStepIdx: number;
  isCurrentStepDone: boolean;
  quizSelected: number | null;
  collapsed: boolean;
  mistakeAlert: MistakeDiagnostic | null;
  voiceListening?: boolean;
  onDismissMistake: () => void;
  onToggleCollapse: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSelectQuizOption: (idx: number) => void;
  onCompleteStation: () => void;
  onSpeakText?: (text: string) => void;
  onToggleVoiceAccess?: () => void;
}

export function StepGuidePanel({
  lang,
  experimentId,
  steps,
  currentStepIdx,
  isCurrentStepDone,
  quizSelected,
  collapsed,
  mistakeAlert,
  voiceListening = false,
  onDismissMistake,
  onToggleCollapse,
  onPrevStep,
  onNextStep,
  onSelectQuizOption,
  onCompleteStation,
  onSpeakText,
  onToggleVoiceAccess,
}: StepGuidePanelProps) {
  const [whyOpen, setWhyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'guide'>('steps');
  const step = steps[currentStepIdx];
  const isLastStep = currentStepIdx === steps.length - 1;
  const pct = ((currentStepIdx + (isCurrentStepDone ? 1 : 0)) / Math.max(1, steps.length)) * 100;
  const guide = getPracticalGuide(experimentId);

  const isWrongQuizPicked =
    Boolean(step.quizQuestion) &&
    quizSelected !== null &&
    quizSelected !== step.quizQuestion!.correctIndex;

  const speakCurrentHowTo = () => {
    if (!onSpeakText) return;
    const howToPrefix =
      lang === 'si' ? 'මෙම පියවර කරන විදිය: ' : 'How to do this step: ';
    onSpeakText(
      `${howToPrefix}${step.taskTitle[lang]}. ${step.instruction[lang]}. ${step.assistantHint[lang]}`
    );
  };

  return (
    <div className="relative z-20 flex items-start pointer-events-auto">
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Open Step Guide' : 'Collapse Step Guide'}
        className="mt-8 -mr-[1px] px-1.5 py-3 rounded-l-xl bg-[#0D2E36] border-2 border-r-0 border-[#287482] text-[#7DD3FC] hover:text-white cursor-pointer shadow-lg transition-colors"
      >
        {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {!collapsed && (
        <aside
          aria-label={lang === 'si' ? 'පරීක්ෂණ පියවර මඟපෙන්වීම' : 'Experiment Step Guide'}
          className="smooth-panel w-[285px] sm:w-[325px] teal-guide-panel rounded-2xl p-4 text-[#F1F5F9] max-h-[72vh] flex flex-col"
        >
          {/* Segmented Tab Switch: Steps vs Procedure / Observations / Conclusions */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#06181E] border border-[#1E5664] mb-2.5">
            <button
              type="button"
              data-testid="step-panel-tab-steps"
              onClick={() => setActiveTab('steps')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeTab === 'steps'
                  ? 'bg-[#F38B21] text-[#1A0E06]'
                  : 'text-[#CBD5E1] hover:text-white'
              }`}
            >
              {lang === 'si' ? 'පියවර (Steps)' : 'Steps'}
            </button>
            <button
              type="button"
              data-testid="step-panel-tab-guide"
              onClick={() => setActiveTab('guide')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-[#0284C7] text-white'
                  : 'text-[#CBD5E1] hover:text-white'
              }`}
            >
              {lang === 'si' ? 'ක්‍රමය · නිරීක්ෂණ' : 'Method & Result'}
            </button>
          </div>

          {activeTab === 'steps' ? (
            <>
              {/* Step Header + Progress */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#FBBF24] font-mono-tabular">
                  {lang === 'si'
                    ? `පියවර ${currentStepIdx + 1} / ${steps.length}`
                    : `Step ${currentStepIdx + 1} / ${steps.length}`}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={onPrevStep}
                    disabled={currentStepIdx === 0}
                    aria-label="Previous Step"
                    className="p-1.5 rounded-lg bg-[#16414C] hover:bg-[#1E5664] disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={onNextStep}
                    disabled={isLastStep}
                    aria-label="Next Step"
                    className="p-1.5 rounded-lg bg-[#16414C] hover:bg-[#1E5664] disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h2 className="font-display text-base font-bold text-white mt-1.5 leading-snug">
                {step.title[lang]}
              </h2>

              <div className="w-full h-1.5 bg-[#071C22] rounded-full overflow-hidden my-2.5">
                <div
                  className="h-full bg-[#F59E0B] transition-all duration-300 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Scrollable Steps Body */}
              <div className="overflow-y-auto lab-scroll pr-1 space-y-2.5 flex-1">
                {/* Explicit Mistake Alert Card */}
                {mistakeAlert && (
                  <div
                    role="alert"
                    data-testid="practical-mistake-alert"
                    className="animate-mistake-pop rounded-xl bg-[#450A0A]/95 border-2 border-[#EF4444] p-2.5 space-y-1 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#FCA5A5]">
                        <AlertTriangle className="w-4 h-4 text-[#F87171] shrink-0" />
                        <span>{mistakeAlert.title[lang]}</span>
                      </div>
                      <button
                        type="button"
                        onClick={onDismissMistake}
                        aria-label="Dismiss Mistake"
                        className="text-[#FCA5A5] hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-[#FEE2E2] leading-snug">
                      {mistakeAlert.message[lang]}
                    </p>
                    <div className="text-[10px] text-[#FDE68A] font-semibold pt-0.5">
                      {lang === 'si' ? 'නිවැරදි කරන විදිය: ' : 'Fix: '}
                      {mistakeAlert.fixHint[lang]}
                    </div>
                  </div>
                )}

                {/* Do Now Card */}
                <div
                  className={`rounded-xl p-3 border transition-colors duration-200 ${
                    isCurrentStepDone
                      ? 'bg-[#12382D] border-[#4ADE80]/60'
                      : 'bg-[#092229] border-[#F59E0B]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                    <span className={isCurrentStepDone ? 'text-[#4ADE80]' : 'text-[#FBBF24]'}>
                      {isCurrentStepDone
                        ? lang === 'si'
                          ? 'සම්පූර්ණයි ✓'
                          : 'Completed ✓'
                        : lang === 'si'
                          ? 'දැන් කරන්න'
                          : 'Do Now'}
                    </span>
                    {isCurrentStepDone && <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-white leading-snug">
                    {step.taskTitle[lang]}
                  </p>
                </div>

                <p className="text-xs text-[#CBD5E1] leading-relaxed">{step.instruction[lang]}</p>

                {/* How To Do This Step + Voice Access Quick Coaching Card */}
                <div
                  data-testid="step-howto-card"
                  className="rounded-xl bg-[#072630] border border-[#38BDF8]/50 p-2.5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#7DD3FC] whitespace-nowrap">
                      <Compass className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                      <span>{lang === 'si' ? 'කරන විදිය' : 'How To Do'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {onSpeakText && (
                        <button
                          type="button"
                          data-testid="step-hear-howto-btn"
                          onClick={speakCurrentHowTo}
                          className="px-2 py-1 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{lang === 'si' ? 'අසන්න' : 'Hear'}</span>
                        </button>
                      )}
                      {onToggleVoiceAccess && (
                        <button
                          type="button"
                          onClick={onToggleVoiceAccess}
                          title={lang === 'si' ? 'හඬින් විධාන දෙන්න' : 'Voice Command Mic'}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            voiceListening
                              ? 'bg-[#DC2626] text-white animate-pulse'
                              : 'bg-[#123842] hover:bg-[#194E5C] text-[#BAE6FD] border border-[#38BDF8]/40'
                          }`}
                        >
                          {voiceListening ? (
                            <MicOff className="w-3 h-3" />
                          ) : (
                            <Mic className="w-3 h-3" />
                          )}
                          <span>{voiceListening ? (lang === 'si' ? 'සවන් දේ' : 'Live') : 'Mic'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#E0F2FE] leading-relaxed">
                    {step.assistantHint[lang]}
                  </p>
                </div>

                {/* Optional Concept Verification Quiz */}
                {step.quizQuestion && (
                  <div className="rounded-xl bg-[#071F26] border border-[#287482] p-3">
                    <div className="text-[11px] font-bold text-[#7DD3FC] mb-1.5">
                      {lang === 'si' ? 'සංකල්ප පරීක්ෂාව:' : 'Concept Check:'}
                    </div>
                    <p className="text-xs text-white font-medium mb-2">
                      {step.quizQuestion.prompt[lang]}
                    </p>
                    <div className="space-y-1.5">
                      {step.quizQuestion.options.map((opt, idx) => {
                        const isPicked = quizSelected === idx;
                        const isRight = idx === step.quizQuestion!.correctIndex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => onSelectQuizOption(idx)}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                              isPicked
                                ? isRight
                                  ? 'bg-[#14532D] border-[#4ADE80] text-white'
                                  : 'bg-[#7F1D1D] border-[#F87171] text-white'
                                : 'bg-[#0E313A] border-[#1F5360] text-[#E2E8F0] hover:border-[#38BDF8]'
                            }`}
                          >
                            {opt[lang]}
                          </button>
                        );
                      })}
                    </div>
                    {isWrongQuizPicked && (
                      <p
                        data-testid="quiz-wrong-feedback"
                        className="mt-2 text-[11px] font-bold text-[#FCA5A5] leading-snug animate-mistake-pop"
                      >
                        {lang === 'si'
                          ? '✗ වැරදියි! නැවත පරීක්ෂා කර නිවැරදි පිළිතුර තෝරන්න.'
                          : '✗ Incorrect! Re-check your bench observation and try again.'}
                      </p>
                    )}
                    {quizSelected === step.quizQuestion.correctIndex && (
                      <p className="mt-2 text-[11px] text-[#86EFAC] leading-snug">
                        ✓ {step.quizQuestion.explanation[lang]}
                      </p>
                    )}
                  </div>
                )}

                {/* Accordion: Why do this? */}
                <div className="rounded-xl bg-[#082229] border border-[#1E5664]">
                  <button
                    type="button"
                    onClick={() => setWhyOpen(!whyOpen)}
                    aria-expanded={whyOpen}
                    className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-[#93C5FD] cursor-pointer"
                  >
                    <span>{lang === 'si' ? 'මෙහෙම කරන්නේ ඇයි?' : 'Why do we do this?'}</span>
                    {whyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {whyOpen && (
                    <div className="px-3 pb-3 text-[11px] text-[#CBD5E1] leading-relaxed">
                      {step.whyText[lang]}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer (always clickable so incomplete clicks show exact mistake + Puck guidance) */}
              <div className="mt-3 pt-2.5 border-t border-[#1E5664]">
                {isLastStep ? (
                  <button
                    type="button"
                    data-testid="step-complete-btn"
                    onClick={onCompleteStation}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      isCurrentStepDone
                        ? 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-lg'
                        : 'bg-[#14353E] hover:bg-[#1C4955] text-[#CBD5E1] border border-[#287482]'
                    }`}
                  >
                    {!isCurrentStepDone && <Lock className="w-3.5 h-3.5 text-[#FBBF24]" />}
                    <span className="whitespace-nowrap">
                      {isCurrentStepDone
                        ? lang === 'si'
                          ? 'පරීක්ෂණය සම්පූර්ණ කරන්න'
                          : 'Complete Practical'
                        : lang === 'si'
                          ? 'පරීක්ෂා කර සම්පූර්ණ කරන්න'
                          : 'Check & Complete'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid="step-next-btn"
                    onClick={onNextStep}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      isCurrentStepDone
                        ? 'bg-[#F38B21] hover:bg-[#FFA23A] text-[#1E1005] shadow-lg'
                        : 'bg-[#14353E] hover:bg-[#1C4955] text-[#E2E8F0] border border-[#287482]'
                    }`}
                  >
                    {!isCurrentStepDone && <Lock className="w-3.5 h-3.5 text-[#FBBF24]" />}
                    <span className="whitespace-nowrap">
                      {isCurrentStepDone
                        ? lang === 'si'
                          ? 'ඊළඟ පියවර →'
                          : 'Next Step →'
                        : lang === 'si'
                          ? 'පරීක්ෂා කර ඊළඟට →'
                          : 'Check & Next Step →'}
                    </span>
                  </button>
                )}
              </div>
            </>
          ) : (
            /* PROCEDURE · OBSERVATIONS · CONCLUSIONS TAB */
            <div
              className="overflow-y-auto lab-scroll pr-1 space-y-3 flex-1"
              data-testid="practical-guide-panel"
            >
              {/* Procedure */}
              <div className="rounded-xl bg-[#092229] border border-[#38BDF8]/45 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#7DD3FC]">
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>{lang === 'si' ? 'පරීක්ෂණ ක්‍රමය (Procedure)' : 'Procedure'}</span>
                  </div>
                  {onSpeakText && (
                    <button
                      type="button"
                      onClick={() => onSpeakText(guide.procedure.map((x) => x[lang]).join('. '))}
                      aria-label={lang === 'si' ? 'ක්‍රමය හඬින් අසන්න' : 'Speak Procedure'}
                      className="w-6 h-6 rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white flex items-center justify-center cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <ol className="space-y-1.5 text-[11px] text-[#E2E8F0] leading-relaxed list-decimal list-inside">
                  {guide.procedure.map((line, i) => (
                    <li key={i}>{line[lang]}</li>
                  ))}
                </ol>
              </div>

              {/* Observations */}
              <div className="rounded-xl bg-[#0B2D22] border border-[#4ADE80]/55 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#4ADE80]">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{lang === 'si' ? 'නිරීක්ෂණ (Observations)' : 'Observations'}</span>
                  </div>
                  {onSpeakText && (
                    <button
                      type="button"
                      onClick={() => onSpeakText(guide.observations.map((x) => x[lang]).join('. '))}
                      aria-label={lang === 'si' ? 'නිරීක්ෂණ හඬින් අසන්න' : 'Speak Observations'}
                      className="w-6 h-6 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center justify-center cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <ul className="space-y-1.5 text-[11px] text-[#DCFCE7] leading-relaxed list-disc list-inside">
                  {guide.observations.map((line, i) => (
                    <li key={i}>{line[lang]}</li>
                  ))}
                </ul>
              </div>

              {/* Conclusions */}
              <div className="rounded-xl bg-[#27180B] border border-[#F59E0B]/60 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FCD34D]">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{lang === 'si' ? 'නිගමන (Conclusions)' : 'Conclusions'}</span>
                  </div>
                  {onSpeakText && (
                    <button
                      type="button"
                      onClick={() => onSpeakText(guide.conclusions.map((x) => x[lang]).join('. '))}
                      aria-label={lang === 'si' ? 'නිගමන හඬින් අසන්න' : 'Speak Conclusions'}
                      className="w-6 h-6 rounded-full bg-[#D97706] hover:bg-[#B45309] text-white flex items-center justify-center cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <ul className="space-y-1.5 text-[11px] text-[#FEF3C7] leading-relaxed list-disc list-inside">
                  {guide.conclusions.map((line, i) => (
                    <li key={i}>{line[lang]}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
