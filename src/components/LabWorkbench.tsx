import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Bot,
  Compass,
  Globe,
  Loader2,
  Menu,
  Mic,
  MicOff,
  Package,
  RotateCcw,
  Sliders,
  Square,
  Trash2,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  EXPERIMENTS,
  evaluateStepCompletion,
  getExperimentsForUnit,
  getUnitForExperiment,
} from '../data/curriculum';
import { getPracticalGuide } from '../data/practicalGuides';
import { useBackgroundAssets } from '../contexts/BackgroundAssetsContext';
import { useVoiceAccess } from '../hooks/useVoiceAccess';
import { useVoiceInstructor } from '../hooks/useVoiceInstructor';
import {
  computeBeamTrajectory,
  computeMillikanState,
} from '../physics/cathodePhysics';
import { evaluateChemistryBench } from '../physics/chemistryEngine';
import {
  diagnoseInvalidControlAction,
  diagnoseStepMistake,
  parseVoiceLabCommand,
  type MistakeDiagnostic,
} from '../utils/practicalValidation';
import { soundFX } from '../utils/soundEffects';
import { AIAssistantDrawer } from './AIAssistantDrawer';
import { ControlDock } from './ControlDock';
import { FooterBar } from './FooterBar';
import { LabCanvas3D } from './LabCanvas3D';
import {
  ApparatusConfigModal,
  LabNotebookModal,
  WelcomeTourModal,
} from './LabModals';
import { MagnifierLoupe } from './MagnifierLoupe';
import { StepGuidePanel } from './StepGuidePanel';
import { ToolboxPanel } from './ToolboxPanel';
import type {
  CameraPreset,
  ExperimentId,
  LabSimulationParams,
  Language,
  StudentProfile,
  VoiceName,
} from '../types/lab';

interface LabWorkbenchProps {
  lang: Language;
  experimentId: ExperimentId;
  initialPlacedIds?: string[];
  muted: boolean;
  skipInitialTour: boolean;
  voiceName: VoiceName;
  studentProfile: StudentProfile | null;
  onChangeLang: (lang: Language) => void;
  onToggleMute: () => void;
  onSelectExperiment: (id: ExperimentId) => void;
  onOpenTopics: () => void;
  onOpenSideMenu: () => void;
  onBackToPrep: () => void;
  onBackToMap: () => void;
  onMarkCompleted: (id: ExperimentId) => void;
}

function createInitialParams(experimentId: ExperimentId): LabSimulationParams {
  return {
    experimentId,
    hvEnabled: true,
    voltageKv: 12,
    pressureMmHg: experimentId === 'cathode-tube' ? 760 : 0.005,
    gas: 'air',
    cathodeMetal: 'copper',
    malteseCrossUp: false,
    paddleWheelEngaged: false,
    magnetActive: false,
    magnetPolarity: 1,
    thomsonMode: 'cathode-rays',
    electricVoltageV: 0,
    magneticFieldMt: 0,
    dropletChargeN: 2,
    dropletRadiusUm: 1.0,
    millikanVoltageV: 0,
    xrayActive: false,
    sprayPulse: 0,
    alphaBeamEnabled: false,
    detectorAngleDeg: 0,
    foilMaterial: 'gold',
    foilThicknessNm: 400,
    chem: {
      burnerOn: false,
      reagentAdded: false,
      stirringOn: false,
      temperatureC: 25,
      concentrationM: 1.0,
      flameCation: 'Na+',
      liquidSample: 'nacl-aq',
      vseprMolecule: 'CH4',
      buretteVolumeMl: 0,
      indicatorType: 'phenolphthalein',
      pressureKpa: 100,
      halideSample: 'Cl-',
      transitionIon: 'Cu2+',
      organicSample: 'alkene',
      catalyst: 'none',
      surfaceArea: 'lumps',
      eqAction: 'neutral',
      electrodePair: 'Zn-Cu',
      appliedVoltageV: 4.5,
    },
    darkRoom: false,
  };
}

export function LabWorkbench({
  lang,
  experimentId,
  initialPlacedIds = [],
  muted,
  skipInitialTour,
  voiceName,
  studentProfile,
  onChangeLang,
  onToggleMute,
  onSelectExperiment,
  onOpenTopics,
  onOpenSideMenu,
  onBackToPrep,
  onBackToMap,
  onMarkCompleted,
}: LabWorkbenchProps) {
  const experiment = EXPERIMENTS[experimentId];
  const activeUnitRoman = getUnitForExperiment(experimentId);
  const unitExperimentOrder = getExperimentsForUnit(activeUnitRoman);
  const displayName = studentProfile?.username || studentProfile?.name || '';
  const { assets } = useBackgroundAssets();

  const requiredIds = useMemo(
    () => experiment.equipment.map((e) => e.id),
    [experiment]
  );

  const preAssembled =
    initialPlacedIds.length > 0 && requiredIds.every((id) => initialPlacedIds.includes(id));

  const [params, setParams] = useState<LabSimulationParams>(() =>
    createInitialParams(experimentId)
  );
  const [placedIds, setPlacedIds] = useState<Set<string>>(() => new Set(initialPlacedIds));
  const [currentStepIdx, setCurrentStepIdx] = useState(() =>
    preAssembled && experiment.steps.length > 1 ? 1 : 0
  );
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [visitedGasChange, setVisitedGasChange] = useState(false);
  const [visitedMetalChange, setVisitedMetalChange] = useState(false);
  const [chemVariableAdjusted, setChemVariableAdjusted] = useState(false);

  const [toolboxCollapsed, setToolboxCollapsed] = useState(() =>
    preAssembled || (typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  );
  const [guideCollapsed, setGuideCollapsed] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [presetVersion, setPresetVersion] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);

  const [tourOpen, setTourOpen] = useState(!skipInitialTour);
  const [tourPage, setTourPage] = useState(0);
  const [configOpen, setConfigOpen] = useState(false);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [completionBanner, setCompletionBanner] = useState(false);
  const [mistakeAlert, setMistakeAlert] = useState<MistakeDiagnostic | null>(null);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  // AI Assistant + Boy Voice Instructing Coach state
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const {
    voiceLoading,
    voiceSpeaking,
    voiceError,
    speakText,
    stopVoice,
  } = useVoiceInstructor({ lang, muted, voiceName });

  // Collapse side panels automatically on narrow mobile resize so nothing overlaps
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768) {
        setToolboxCollapsed(true);
        setGuideCollapsed(true);
      }
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Sync experiment switches cleanly
  useEffect(() => {
    stopVoice();
    const exp = EXPERIMENTS[experimentId];
    const req = exp.equipment.map((e) => e.id);
    const hasAll =
      initialPlacedIds.length > 0 && req.every((id) => initialPlacedIds.includes(id));

    setParams(createInitialParams(experimentId));
    setPlacedIds(new Set(initialPlacedIds));
    setCurrentStepIdx(hasAll && exp.steps.length > 1 ? 1 : 0);
    if (hasAll) {
      setToolboxCollapsed(true);
    }
    setQuizSelected(null);
    setVisitedGasChange(false);
    setVisitedMetalChange(false);
    setChemVariableAdjusted(false);
    setCompletionBanner(false);
    setMistakeAlert(null);
    setVoiceToast(null);
    setCameraPreset('overview');
    setPresetVersion((v) => v + 1);
  }, [experimentId, initialPlacedIds, stopVoice]);

  const isAssembled = useMemo(
    () => requiredIds.every((id) => placedIds.has(id)),
    [requiredIds, placedIds]
  );

  const thomsonTraj = useMemo(() => computeBeamTrajectory(params), [params]);
  const millikanState = useMemo(() => computeMillikanState(params), [params]);

  const currentStep = experiment.steps[currentStepIdx] || experiment.steps[0];
  const quizCorrect = currentStep.quizQuestion
    ? quizSelected === currentStep.quizQuestion.correctIndex
    : true;

  // Auto-open toolbox when entering final pack-away step on desktop
  useEffect(() => {
    if (
      currentStep?.validationType === 'pack-away' &&
      typeof window !== 'undefined' &&
      window.innerWidth >= 768
    ) {
      setToolboxCollapsed(false);
    }
  }, [currentStep?.validationType]);

  // Always narrate active step + observations live when unmuted
  useEffect(() => {
    if (!muted && !tourOpen && currentStep) {
      const prefix = displayName ? `${displayName}, ` : '';
      const guide = getPracticalGuide(experimentId);
      const extraObs =
        currentStepIdx === experiment.steps.length - 1
          ? ` ${guide.observations[0]?.[lang] || ''} ${guide.conclusions[0]?.[lang] || ''}`
          : '';
      speakText(
        `${prefix}${currentStep.title[lang]}. ${currentStep.taskTitle[lang]}. ${currentStep.instruction[lang]}${extraObs}`,
        true
      );
    }
  }, [currentStepIdx, experimentId, lang, muted, tourOpen, displayName]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCurrentStepDone = evaluateStepCompletion(
    currentStep,
    placedIds,
    requiredIds,
    params,
    thomsonTraj.isBalanced,
    millikanState.isSuspended,
    quizCorrect,
    visitedGasChange,
    visitedMetalChange,
    chemVariableAdjusted
  );

  // Clear mistake alert automatically once step criteria are satisfied
  useEffect(() => {
    if (isCurrentStepDone && mistakeAlert) {
      setMistakeAlert(null);
    }
  }, [isCurrentStepDone, mistakeAlert]);

  const liveTelemetrySummary = useMemo(() => {
    if (experiment.benchMode === 'crookes') {
      return `p=${params.pressureMmHg} mmHg, V=${params.voltageKv} kV, cross=${params.malteseCrossUp}, magnet=${params.magnetActive}`;
    }
    if (experiment.benchMode === 'thomson') {
      return `E=${params.electricVoltageV} V, B=${params.magneticFieldMt} mT, d=${thomsonTraj.screenDeflectionMm} mm, mode=${params.thomsonMode}`;
    }
    if (experiment.benchMode === 'millikan') {
      return `V=${params.millikanVoltageV} V, q=${params.dropletChargeN}e, v=${millikanState.netVelocityMmPerSec.toFixed(2)} mm/s`;
    }
    if (experiment.benchMode === 'rutherford') {
      return `foil=${params.foilMaterial}, angle=${params.detectorAngleDeg} deg, beam=${params.alphaBeamEnabled}`;
    }
    return evaluateChemistryBench(params).summaryLine;
  }, [experiment.benchMode, millikanState.netVelocityMmPerSec, params, thomsonTraj.screenDeflectionMm]);

  const triggerMistake = (diag: MistakeDiagnostic) => {
    setMistakeAlert(diag);
    soundFX.playError();
    if (!muted) {
      speakText(`${diag.title[lang]}. ${diag.message[lang]}`, true);
    }
  };

  const handleUpdateParams = (patch: Partial<LabSimulationParams>) => {
    // Check invalid control attempt before full assembly
    if (!isAssembled) {
      let labelSi = 'පරීක්ෂණ පාලක';
      let labelEn = 'Instrument Control';
      if (patch.hvEnabled) {
        labelSi = 'අධි වෝල්ටීයතාව (HV)';
        labelEn = 'HV Supply';
      } else if (patch.alphaBeamEnabled) {
        labelSi = 'α-කිරණ කදම්බය';
        labelEn = 'Alpha Beam';
      } else if (patch.chem?.burnerOn) {
        labelSi = 'දාහකය';
        labelEn = 'Burner';
      } else if (patch.chem?.reagentAdded) {
        labelSi = 'ප්‍රතිකාරක';
        labelEn = 'Reagent';
      }
      const inv = diagnoseInvalidControlAction(labelSi, labelEn, false, params);
      if (inv) {
        triggerMistake(inv);
        return;
      }
    }

    // Warn on Maltese Cross / Paddle Wheel / Magnet without adequate vacuum in Station 01
    if (
      params.experimentId === 'cathode-tube' &&
      (patch.malteseCrossUp === true ||
        patch.paddleWheelEngaged === true ||
        patch.magnetActive === true)
    ) {
      const actionSi = patch.malteseCrossUp
        ? 'මෝල්ටීස් කුරුසය'
        : patch.paddleWheelEngaged
          ? 'පැඩල් රෝදය'
          : 'චුම්බකය';
      const actionEn = patch.malteseCrossUp
        ? 'Maltese Cross'
        : patch.paddleWheelEngaged
          ? 'Paddle Wheel'
          : 'Magnet';
      const warn = diagnoseInvalidControlAction(actionSi, actionEn, isAssembled, params);
      if (warn) {
        triggerMistake(warn);
      }
    }

    // Detect Titration Overshoot live when burette volume exceeds endpoint (+1.2 mL tolerance)
    if (
      patch.chem?.buretteVolumeMl !== undefined &&
      experiment.benchMode === 'titration-burette'
    ) {
      const targetVol = 25 / Math.max(0.5, params.chem.concentrationM);
      const prevDiff = params.chem.buretteVolumeMl - targetVol;
      const nextDiff = patch.chem.buretteVolumeMl - targetVol;
      if (nextDiff > 1.2 && prevDiff <= 1.2) {
        const overshootDiag = diagnoseStepMistake({
          step: { ...currentStep, validationType: 'chem-titrate-endpoint' },
          placedIds,
          requiredIds,
          params: { ...params, chem: { ...params.chem, ...patch.chem } },
          isBalancedThomson: thomsonTraj.isBalanced,
          isSuspendedMillikan: millikanState.isSuspended,
          quizSelected,
          visitedGasChange,
          visitedMetalChange,
          chemVariableAdjusted: true,
        });
        if (overshootDiag) {
          triggerMistake(overshootDiag);
        }
      } else if (Math.abs(nextDiff) <= 1.2 && mistakeAlert?.code === 'TITRATION_OVERSHOOT') {
        setMistakeAlert(null);
      }
    }

    if (patch.gas && patch.gas !== 'air') setVisitedGasChange(true);
    if (patch.cathodeMetal && patch.cathodeMetal !== 'copper') setVisitedMetalChange(true);
    if (patch.chem) setChemVariableAdjusted(true);
    if (patch.hvEnabled !== undefined) soundFX.playSpark();
    if (patch.sprayPulse !== undefined) soundFX.playSpray();
    setParams((prev) => ({ ...prev, ...patch }));
  };

  const handlePlaceItem = (id: string) => {
    setMistakeAlert(null);
    setPlacedIds((prev) => {
      if (prev.has(id)) return prev;
      soundFX.playPlace();
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handlePlaceAll = () => {
    setMistakeAlert(null);
    soundFX.playSuccess();
    setPlacedIds(new Set(requiredIds));
  };

  const handleRemoveItem = (id: string) => {
    setPlacedIds((prev) => {
      if (!prev.has(id)) return prev;
      soundFX.playPlace();
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleReturnAll = () => {
    setMistakeAlert(null);
    soundFX.playSuccess();
    setPlacedIds(new Set());
  };

  const handleClearBench = () => {
    setMistakeAlert(null);
    setPlacedIds(new Set());
    setCurrentStepIdx(0);
    setQuizSelected(null);
    setCompletionBanner(false);
  };

  const handleResetAll = () => {
    setMistakeAlert(null);
    setParams(createInitialParams(experimentId));
    setPlacedIds(new Set());
    setCurrentStepIdx(0);
    setQuizSelected(null);
    setVisitedGasChange(false);
    setVisitedMetalChange(false);
    setChemVariableAdjusted(false);
    setCompletionBanner(false);
    setCameraPreset('overview');
    setPresetVersion((v) => v + 1);
    setZoomScale(1);
  };

  const handleCompleteStation = () => {
    if (!isCurrentStepDone) {
      const diag = diagnoseStepMistake({
        step: currentStep,
        placedIds,
        requiredIds,
        params,
        isBalancedThomson: thomsonTraj.isBalanced,
        thomsonDeflectionMm: thomsonTraj.screenDeflectionMm,
        isSuspendedMillikan: millikanState.isSuspended,
        millikanVelocityMmPerSec: millikanState.netVelocityMmPerSec,
        millikanBalanceV: millikanState.balanceVoltageV,
        quizSelected,
        visitedGasChange,
        visitedMetalChange,
        chemVariableAdjusted,
      });
      if (diag) {
        triggerMistake(diag);
      }
      return;
    }
    setMistakeAlert(null);
    soundFX.playSuccess();
    onMarkCompleted(experimentId);
    setCompletionBanner(true);
  };

  const handleAttemptNextStep = () => {
    if (!isCurrentStepDone) {
      const diag = diagnoseStepMistake({
        step: currentStep,
        placedIds,
        requiredIds,
        params,
        isBalancedThomson: thomsonTraj.isBalanced,
        thomsonDeflectionMm: thomsonTraj.screenDeflectionMm,
        isSuspendedMillikan: millikanState.isSuspended,
        millikanVelocityMmPerSec: millikanState.netVelocityMmPerSec,
        millikanBalanceV: millikanState.balanceVoltageV,
        quizSelected,
        visitedGasChange,
        visitedMetalChange,
        chemVariableAdjusted,
      });
      if (diag) {
        triggerMistake(diag);
      }
      return;
    }
    setMistakeAlert(null);
    soundFX.playSuccess();
    setQuizSelected(null);
    setCurrentStepIdx((i) => Math.min(experiment.steps.length - 1, i + 1));
  };

  const handleVoiceTranscript = async (transcript: string) => {
    setVoiceToast(`🎤 "${transcript}"`);
    window.setTimeout(() => setVoiceToast(null), 4200);

    const cmd = parseVoiceLabCommand(transcript);
    if (!cmd) return;

    switch (cmd.type) {
      case 'read-howto':
        speakText(
          `${currentStep.taskTitle[lang]}. ${currentStep.instruction[lang]}. ${currentStep.assistantHint[lang]}`,
          false
        );
        break;
      case 'next-step':
        handleAttemptNextStep();
        break;
      case 'prev-step':
        setMistakeAlert(null);
        setQuizSelected(null);
        setCurrentStepIdx((i) => Math.max(0, i - 1));
        break;
      case 'place-all':
        handlePlaceAll();
        break;
      case 'pack-away':
        handleReturnAll();
        break;
      case 'hv-toggle':
        handleUpdateParams({ hvEnabled: cmd.enabled });
        break;
      case 'burner-toggle':
        handleUpdateParams({ chem: { ...params.chem, burnerOn: cmd.enabled } });
        break;
      case 'darkroom-toggle':
        handleUpdateParams({
          darkRoom: cmd.enabled !== undefined ? cmd.enabled : !params.darkRoom,
        });
        break;
      case 'mix-reagent':
        handleUpdateParams({ chem: { ...params.chem, reagentAdded: true } });
        break;
      case 'toggle-cross':
        handleUpdateParams({
          malteseCrossUp: !params.malteseCrossUp,
          paddleWheelEngaged: false,
        });
        break;
      case 'toggle-paddle':
        handleUpdateParams({
          paddleWheelEngaged: !params.paddleWheelEngaged,
          malteseCrossUp: false,
        });
        break;
      case 'toggle-magnet':
        handleUpdateParams({ magnetActive: !params.magnetActive });
        break;
      case 'reset':
        handleResetAll();
        break;
      case 'open-ai':
        setAiDrawerOpen(true);
        break;
      case 'ask-ai': {
        try {
          const resp = await fetch('/api/ai/assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: cmd.query,
              lang,
              unitRoman: activeUnitRoman,
              experimentTitle: experiment.shortTitle[lang],
              stepTitle: currentStep.title[lang],
              stepTask: currentStep.taskTitle[lang],
              liveTelemetry: liveTelemetrySummary,
              studentName: displayName,
              studentAge: studentProfile?.age,
              history: [],
            }),
          });
          const data = await resp.json();
          if (resp.ok && (data.spokenScript || data.reply) && !muted) {
            speakText(data.spokenScript || data.reply, false);
          }
        } catch {
          // fallback: read current how-to hint
          speakText(currentStep.assistantHint[lang], false);
        }
        break;
      }
    }
  };

  const {
    listening: voiceListening,
    transcribing: voiceTranscribing,
    voiceAccessError,
    toggleListening: toggleVoiceAccess,
  } = useVoiceAccess({
    lang,
    onTranscript: (t) => {
      void handleVoiceTranscript(t);
    },
  });

  return (
    <div
      className="relative w-full h-screen flex flex-col overflow-hidden bg-[#120D09]"
      data-screen="workbench"
      data-experiment={experimentId}
      data-assembled={isAssembled ? 'true' : 'false'}
    >
      {/* Main Workbench Viewport Stage */}
      <div
        className="relative flex-1 overflow-hidden"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const droppedId = e.dataTransfer.getData('text/plain');
          if (droppedId) handlePlaceItem(droppedId);
        }}
      >
        {/* Background Chemistry Laboratory Room Photo (dims smoothly in Darkroom mode) */}
        <img
          src={assets.labRoomBackdrop}
          alt="Sunlit Chemistry Laboratory Room"
          decoding="async"
          referrerPolicy="no-referrer"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ${
            params.darkRoom ? 'brightness-[0.14] contrast-125' : 'brightness-95'
          }`}
        />
        <div
          className={`absolute inset-0 transition-colors duration-500 pointer-events-none ${
            params.darkRoom
              ? 'bg-[#040914]/75'
              : 'bg-gradient-to-b from-black/15 via-transparent to-black/35'
          }`}
        />

        {/* Three.js 3D Apparatus & Wooden Workbench Canvas */}
        <div className="absolute inset-0 z-10">
          <LabCanvas3D
            params={params}
            placedIds={placedIds}
            cameraPreset={cameraPreset}
            presetVersion={presetVersion}
            zoomScale={zoomScale}
            onToggleMalteseCross={() =>
              handleUpdateParams({
                malteseCrossUp: !params.malteseCrossUp,
                paddleWheelEngaged: false,
              })
            }
            onPlaceEquipment={handlePlaceItem}
          />
        </div>

        {/* TOP BAR OVERLAY */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 pt-2.5 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={onOpenSideMenu}
              aria-label={lang === 'si' ? 'මෙනුව විවෘත කරන්න' : 'Open Lab Menu'}
              className="w-8 h-8 rounded-xl bg-[#2B1B10]/95 border border-[#C89242] text-[#FFE5AD] hover:bg-[#3E2717] flex items-center justify-center cursor-pointer shadow-lg shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onBackToMap}
              className="px-3 py-1.5 rounded-xl bg-[#2B1B10]/95 border border-[#B58246] text-[#FBF5EA] text-xs font-bold hover:bg-[#3E2717] flex items-center gap-1.5 cursor-pointer shadow-lg whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#F5C56B]" />
              <span>{lang === 'si' ? 'ප්‍රධාන පිටුව' : 'Lab Map'}</span>
            </button>

            <button
              type="button"
              onClick={onBackToPrep}
              className="px-2.5 py-1.5 rounded-xl bg-[#0D2E36]/95 border border-[#38BDF8] text-[#E0F2FE] text-xs font-bold hover:bg-[#13424E] flex items-center gap-1 cursor-pointer shadow-lg whitespace-nowrap"
            >
              <Package className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{lang === 'si' ? 'උපකරණ තෝරන්න' : 'Change Tools'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenTopics}
              className="px-2.5 py-1.5 rounded-xl bg-[#3D2514]/95 border border-[#C89242] text-[#FFE5AD] text-xs font-bold hover:bg-[#52321B] flex items-center gap-1 cursor-pointer shadow-lg whitespace-nowrap"
            >
              <Compass className="w-3.5 h-3.5 text-[#FCD34D]" />
              <span>{lang === 'si' ? `පාඩම ${activeUnitRoman}` : `Unit ${activeUnitRoman}`}</span>
            </button>

            {/* Quick Experiment Switcher for current unit */}
            <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-[#22150D]/95 border border-[#8E6234]">
              {unitExperimentOrder.map((id) => {
                const exp = EXPERIMENTS[id];
                const active = id === experimentId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelectExperiment(id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#F38B21] text-[#1A0E06]'
                        : 'text-[#EADAC2] hover:text-white'
                    }`}
                  >
                    {exp.number} · {exp.shortTitle[lang]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <div className="bg-[#1B120B]/92 border border-[#B58246]/70 rounded-xl px-3 py-1.5 shadow-lg">
              <div className="text-xs sm:text-sm font-bold text-[#FFE5AD] whitespace-nowrap">
                {experiment.number} · {experiment.shortTitle[lang]}
              </div>
            </div>
          </div>
        </div>

        {/* TOP-CENTER MAGNIFIER OBSERVATION LOUPE */}
        <div className="relative z-20 flex justify-center mt-2 px-3 pointer-events-none">
          <MagnifierLoupe params={params} lang={lang} isAssembled={isAssembled} />
        </div>

        {/* LEFT & RIGHT COLLAPSIBLE LAB PANELS */}
        <div className="absolute inset-x-0 top-32 sm:top-24 bottom-24 z-20 flex items-start justify-between px-2 sm:px-4 pointer-events-none">
          <ToolboxPanel
            lang={lang}
            equipment={experiment.equipment}
            placedIds={placedIds}
            collapsed={toolboxCollapsed}
            highlightPulse={tourOpen && tourPage === 1}
            packAwayMode={currentStep.validationType === 'pack-away'}
            onToggleCollapse={() => {
              const next = !toolboxCollapsed;
              setToolboxCollapsed(next);
              if (!next && typeof window !== 'undefined' && window.innerWidth < 768) {
                setGuideCollapsed(true);
              }
            }}
            onPlaceItem={handlePlaceItem}
            onPlaceAll={handlePlaceAll}
            onRemoveItem={handleRemoveItem}
            onReturnAll={handleReturnAll}
          />

          <StepGuidePanel
            lang={lang}
            experimentId={experimentId}
            steps={experiment.steps}
            currentStepIdx={currentStepIdx}
            isCurrentStepDone={isCurrentStepDone}
            quizSelected={quizSelected}
            collapsed={guideCollapsed}
            mistakeAlert={mistakeAlert}
            voiceListening={voiceListening}
            onDismissMistake={() => setMistakeAlert(null)}
            onToggleCollapse={() => {
              const next = !guideCollapsed;
              setGuideCollapsed(next);
              if (!next && typeof window !== 'undefined' && window.innerWidth < 768) {
                setToolboxCollapsed(true);
              }
            }}
            onPrevStep={() => {
              setMistakeAlert(null);
              setQuizSelected(null);
              setCurrentStepIdx((i) => Math.max(0, i - 1));
            }}
            onNextStep={handleAttemptNextStep}
            onSelectQuizOption={(idx) => {
              setQuizSelected(idx);
              if (currentStep.quizQuestion) {
                if (idx === currentStep.quizQuestion.correctIndex) {
                  setMistakeAlert(null);
                  soundFX.playSuccess();
                } else {
                  const wrongDiag = diagnoseStepMistake({
                    step: currentStep,
                    placedIds,
                    requiredIds,
                    params,
                    isBalancedThomson: thomsonTraj.isBalanced,
                    isSuspendedMillikan: millikanState.isSuspended,
                    quizSelected: idx,
                    visitedGasChange,
                    visitedMetalChange,
                    chemVariableAdjusted,
                  });
                  if (wrongDiag) {
                    triggerMistake(wrongDiag);
                  }
                }
              }
            }}
            onCompleteStation={handleCompleteStation}
            onSpeakText={(txt) => speakText(txt, false)}
            onToggleVoiceAccess={toggleVoiceAccess}
          />
        </div>

        {/* FLOATING MISTAKE TOAST WHEN GUIDE COLLAPSED */}
        {mistakeAlert && guideCollapsed && (
          <div
            role="alert"
            data-testid="workbench-mistake-toast"
            className="animate-mistake-pop absolute top-32 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-[440px] rounded-2xl bg-[#450A0A]/95 border-2 border-[#EF4444] px-4 py-3 flex items-start justify-between gap-2.5 shadow-2xl"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-extrabold text-[#FCA5A5]">{mistakeAlert.title[lang]}</div>
                <p className="text-[#FEE2E2] mt-0.5">{mistakeAlert.message[lang]}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMistakeAlert(null)}
              aria-label="Close Error Toast"
              className="text-[#FCA5A5] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* VOICE ACCESS TRANSCRIPT / STATUS PILL */}
        {(voiceToast || voiceAccessError) && (
          <div className="smooth-panel absolute bottom-20 left-4 z-30 rounded-xl bg-[#0D2E36]/95 border border-[#38BDF8]/70 px-3 py-2 text-xs text-white shadow-xl max-w-[300px]">
            {voiceAccessError ? (
              <span className="text-[#FCA5A5] font-semibold">{voiceAccessError}</span>
            ) : (
              <span className="font-semibold text-[#BAE6FD]">{voiceToast}</span>
            )}
          </div>
        )}

        {/* COMPLETION CONGRATULATIONS TOAST BANNER */}
        {completionBanner && (
          <div className="smooth-panel absolute top-36 left-1/2 -translate-x-1/2 z-30 wood-panel rounded-xl px-5 py-3 flex items-center gap-3 shadow-2xl">
            <span className="text-xs sm:text-sm font-bold text-[#86EFAC]">
              {lang === 'si'
                ? 'විශිෂ්ටයි! මෙම පරීක්ෂණය සාර්ථකව සම්පූර්ණ කළා!'
                : 'Well done! You completed this practical station!'}
            </span>
            <button
              type="button"
              onClick={onBackToMap}
              className="amber-cta px-3 py-1.5 rounded-lg text-xs font-bold text-[#1E1005] cursor-pointer whitespace-nowrap"
            >
              {lang === 'si' ? 'ඊළඟ පරීක්ෂණයට →' : 'Lab Map →'}
            </button>
          </div>
        )}

        {/* UNIFIED NON-OVERLAPPING BOTTOM WORKBENCH BAR (Utility Row + ControlDock) */}
        <div className="absolute bottom-2 inset-x-2 sm:inset-x-4 z-30 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-2 pointer-events-none">
          {/* Utility Controls & AI Tutor / Voice Coach */}
          <div className="flex flex-wrap xl:flex-nowrap items-center justify-center lg:justify-start gap-1 pointer-events-auto order-2 lg:order-1">
            <button
              type="button"
              onClick={handleResetAll}
              title={lang === 'si' ? 'යළි අරඹන්න' : 'Reset Practical'}
              aria-label="Reset Practical"
              className="w-8 h-8 rounded-full bg-[#2A1C12] border border-[#A8733B] text-[#F5C56B] hover:text-white flex items-center justify-center cursor-pointer shadow shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleClearBench}
              title={lang === 'si' ? 'මේසය හිස් කරන්න' : 'Clear Bench'}
              aria-label="Clear Bench"
              className="w-8 h-8 rounded-full bg-[#2A1C12] border border-[#A8733B] text-[#FCA5A5] hover:text-white flex items-center justify-center cursor-pointer shadow shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setConfigOpen(true)}
              title={lang === 'si' ? 'උපකරණ සැකසුම්' : 'Configure Apparatus'}
              aria-label="Configure Apparatus"
              className="w-8 h-8 rounded-full bg-[#16A34A] border border-[#BBF7D0] text-white flex items-center justify-center cursor-pointer shadow shrink-0"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setNotebookOpen(true)}
              title={lang === 'si' ? 'විද්‍යාගාර සටහන් පොත' : 'Lab Theory Notebook'}
              aria-label="Open Lab Notebook"
              className="w-8 h-8 rounded-full bg-[#2563EB] border border-[#DBEAFE] text-white flex items-center justify-center cursor-pointer shadow shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              title={muted ? 'Unmute' : 'Mute'}
              aria-label="Toggle Sound"
              className="w-8 h-8 rounded-full bg-[#D97706] border border-[#FEF3C7] text-white flex items-center justify-center cursor-pointer shadow shrink-0"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => onChangeLang(lang === 'si' ? 'en' : 'si')}
              title="Switch Language"
              aria-label="Switch Language"
              className="h-8 px-2 rounded-full bg-[#EA580C] border border-[#FFEDD5] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow shrink-0"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'si' ? 'සිං' : 'EN'}</span>
            </button>

            {/* AI Voice Step Reader Quick Button */}
            <button
              type="button"
              disabled={voiceLoading || muted}
              onClick={() => {
                if (voiceSpeaking) {
                  stopVoice();
                } else {
                  speakText(
                    `${currentStep.title[lang]}. ${currentStep.taskTitle[lang]}. ${currentStep.instruction[lang]} ${currentStep.assistantHint[lang]}`
                  );
                }
              }}
              aria-label={lang === 'si' ? 'පියවර හඬින් අසන්න' : 'Speak Step Instructions'}
              className={`h-8 px-2.5 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow border whitespace-nowrap transition-all shrink-0 ${
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
              <span>{lang === 'si' ? 'කරන විදිය' : 'How-To'}</span>
            </button>

            {/* Hands-free Voice Access Command Mic */}
            <button
              type="button"
              data-testid="voice-access-btn"
              disabled={voiceTranscribing}
              onClick={toggleVoiceAccess}
              title={
                lang === 'si'
                  ? 'හඬින් පාලනය කරන්න ("ඊළඟ පියවර", "කරන විදිය", "HV ON")'
                  : 'Voice Access ("Next Step", "How to", "Place All", "Darkroom")'
              }
              aria-label={lang === 'si' ? 'හඬ පාලනය' : 'Voice Access Control'}
              className={`h-8 px-2.5 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow border whitespace-nowrap transition-all shrink-0 ${
                voiceListening
                  ? 'bg-[#DC2626] border-[#FCA5A5] text-white animate-pulse'
                  : 'bg-[#14532D] border-[#4ADE80]/70 text-[#DCFCE7] hover:bg-[#166534]'
              }`}
            >
              {voiceTranscribing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : voiceListening ? (
                <MicOff className="w-3.5 h-3.5" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-[#86EFAC]" />
              )}
              <span>
                {voiceListening
                  ? lang === 'si'
                    ? 'සවන් දෙයි...'
                    : 'Listening...'
                  : lang === 'si'
                    ? 'හඬ පාලනය'
                    : 'Voice Mic'}
              </span>
            </button>

            {/* AI Chemistry Tutor Drawer Trigger */}
            <button
              type="button"
              onClick={() => setAiDrawerOpen((v) => !v)}
              aria-label={lang === 'si' ? 'AI රසායන සහායක' : 'Open AI Chemistry Assistant'}
              className={`h-8 px-2.5 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow border whitespace-nowrap transition-all shrink-0 ${
                aiDrawerOpen
                  ? 'bg-[#7C3AED] border-[#DDD6FE] text-white'
                  : 'bg-[#0D2E36] border-[#38BDF8] text-[#E0F2FE] hover:bg-[#13424E]'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{lang === 'si' ? 'AI ගුරු' : 'AI Tutor'}</span>
            </button>

            <div className="hidden 2xl:flex items-center gap-1 bg-[#1D130B] border border-[#8E6234] rounded-full px-2 py-1 text-[11px] font-mono-tabular text-[#EADAC2] shrink-0">
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.max(0.75, Number((z - 0.15).toFixed(2))))}
                aria-label="Zoom Out"
                className="hover:text-white cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1">{Math.round(zoomScale * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.min(1.5, Number((z + 0.15).toFixed(2))))}
                aria-label="Zoom In"
                className="hover:text-white cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Centered / Right-flexed Control Dock */}
          <div className="w-full lg:w-auto flex justify-center order-1 lg:order-2">
            <ControlDock
              lang={lang}
              params={params}
              isAssembled={isAssembled}
              cameraPreset={cameraPreset}
              dockCollapsed={dockCollapsed}
              onToggleDock={() => setDockCollapsed((v) => !v)}
              onUpdateParams={handleUpdateParams}
              onSelectCameraPreset={(preset) => {
                setCameraPreset(preset);
                setPresetVersion((v) => v + 1);
              }}
            />
          </div>
        </div>

        {/* AI CHEMISTRY ASSISTANT & VOICE COACH DRAWER */}
        <AIAssistantDrawer
          open={aiDrawerOpen}
          lang={lang}
          unitRoman={activeUnitRoman}
          experimentTitle={experiment.shortTitle[lang]}
          stepTitle={currentStep.title[lang]}
          stepTask={currentStep.taskTitle[lang]}
          stepInstruction={currentStep.instruction[lang]}
          liveTelemetry={liveTelemetrySummary}
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
      </div>

      {/* MODALS */}
      <WelcomeTourModal
        open={tourOpen}
        tourPage={tourPage}
        lang={lang}
        muted={muted}
        voiceSpeaking={voiceSpeaking}
        onChangePage={setTourPage}
        onSpeakText={(txt, auto) => speakText(txt, Boolean(auto))}
        onStopVoice={stopVoice}
        onClose={() => setTourOpen(false)}
      />

      <ApparatusConfigModal
        open={configOpen}
        lang={lang}
        params={params}
        onUpdateParams={handleUpdateParams}
        onClose={() => setConfigOpen(false)}
      />

      <LabNotebookModal
        open={notebookOpen}
        lang={lang}
        activeExperimentId={experimentId}
        onClose={() => setNotebookOpen(false)}
      />

      <FooterBar lang={lang} />
    </div>
  );
}
