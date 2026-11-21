import type { LabSimulationParams, LabStep, LocalizedText } from '../types/lab';

export interface MistakeDiagnostic {
  isWrong: boolean;
  code: string;
  title: LocalizedText;
  message: LocalizedText;
  fixHint: LocalizedText;
}

export interface StepDiagnosisInput {
  step: LabStep;
  placedIds: Set<string>;
  requiredIds: string[];
  params: LabSimulationParams;
  isBalancedThomson: boolean;
  thomsonDeflectionMm?: number;
  isSuspendedMillikan: boolean;
  millikanVelocityMmPerSec?: number;
  millikanBalanceV?: number;
  quizSelected: number | null;
  visitedGasChange: boolean;
  visitedMetalChange: boolean;
  chemVariableAdjusted: boolean;
}

export type VoiceLabCommand =
  | { type: 'next-step' }
  | { type: 'prev-step' }
  | { type: 'read-howto' }
  | { type: 'place-all' }
  | { type: 'pack-away' }
  | { type: 'hv-toggle'; enabled: boolean }
  | { type: 'burner-toggle'; enabled: boolean }
  | { type: 'darkroom-toggle'; enabled?: boolean }
  | { type: 'mix-reagent' }
  | { type: 'toggle-cross' }
  | { type: 'toggle-paddle' }
  | { type: 'toggle-magnet' }
  | { type: 'reset' }
  | { type: 'open-ai' }
  | { type: 'ask-ai'; query: string };

export function diagnoseStepMistake(input: StepDiagnosisInput): MistakeDiagnostic | null {
  const {
    step,
    placedIds,
    requiredIds,
    params,
    isBalancedThomson,
    thomsonDeflectionMm = 0,
    isSuspendedMillikan,
    millikanVelocityMmPerSec = 0,
    millikanBalanceV,
    quizSelected,
    visitedGasChange,
    visitedMetalChange,
    chemVariableAdjusted,
  } = input;

  // Immediate quiz mistake check across any step with quizQuestion
  if (
    step.quizQuestion &&
    quizSelected !== null &&
    quizSelected !== step.quizQuestion.correctIndex
  ) {
    return {
      isWrong: true,
      code: 'WRONG_QUIZ_OPTION',
      title: {
        si: 'වැරදි පිළිතුරක් තෝරා ඇත!',
        en: 'Wrong Answer Selected!',
      },
      message: {
        si: 'ඔබ තෝරාගත් පිළිතුර වැරදියි. කරුණාකර පරීක්ෂණ නිරීක්ෂණය නැවත පරීක්ෂා කර නිවැරදි පිළිතුර තෝරන්න.',
        en: 'The selected answer is incorrect. Check your live 3D observation and try another option.',
      },
      fixHint: step.assistantHint,
    };
  }

  switch (step.validationType) {
    case 'assemble': {
      const missingCount = requiredIds.filter((id) => !placedIds.has(id)).length;
      if (missingCount > 0) {
        return {
          isWrong: true,
          code: 'INCOMPLETE_ASSEMBLY',
          title: {
            si: 'වැරදියි! උපකරණ සවි කිරීම සම්පූර්ණ නැත',
            en: 'Incomplete Setup!',
          },
          message: {
            si: `වැඩ මේසය මත තවත් උපකරණ ${missingCount}ක් සවි කිරීමට ඉතිරිව ඇත.`,
            en: `${missingCount} required apparatus item(s) are still missing from the 3D bench.`,
          },
          fixHint: {
            si: 'වම් පස උපකරණ පෙට්ටියෙන් සියලු උපකරණ මේසය මත තබන්න (නැතහොත් "සියල්ල තබන්න" ඔබන්න).',
            en: 'Place all remaining items from the left Toolbox (or click "Place All").',
          },
        };
      }
      return null;
    }

    case 'evacuate-pressure': {
      if (!params.hvEnabled) {
        return {
          isWrong: true,
          code: 'HV_OFF',
          title: {
            si: 'වැරදියි! HV විදුලි සැපයුම OFF කර ඇත',
            en: 'Mistake: HV Supply is OFF',
          },
          message: {
            si: 'විසර්ජනය නිරීක්ෂණය කිරීමට අධි වෝල්ටීයතා සැපයුම (HV ON) ක්‍රියාත්මක කළ යුතුය.',
            en: 'Turn ON High Voltage (HV) so electric discharge can pass through the gas.',
          },
          fixHint: step.assistantHint,
        };
      }
      if (params.pressureMmHg > 0.015) {
        return {
          isWrong: true,
          code: 'PRESSURE_TOO_HIGH',
          title: {
            si: 'වැරදියි! නළයේ පීඩනය තවමත් වැඩියි',
            en: 'Pressure Still Too High!',
          },
          message: {
            si: `වත්මන් පීඩනය ${params.pressureMmHg} mmHg වේ. කැතෝඩ කිරණ සහ හරිත ප්‍රතිදීප්තිය පෙනීමට පීඩනය 0.015 mmHg හෝ ඊට අඩු විය යුතුය.`,
            en: `Current pressure is ${params.pressureMmHg} mmHg. Evacuate down to ≤ 0.015 mmHg for cathode rays and green ZnS glow.`,
          },
          fixHint: step.assistantHint,
        };
      }
      return null;
    }

    case 'maltese-shadow': {
      if (!params.hvEnabled || params.pressureMmHg > 0.02) {
        return {
          isWrong: true,
          code: 'NEED_VACUUM_FOR_CROSS',
          title: {
            si: 'වැරදියි! පළමුව රික්තය හා HV සකසන්න',
            en: 'Set Low Vacuum & HV First!',
          },
          message: {
            si: 'මෝල්ටීස් කුරුසයේ සෙවණැල්ල පෙනීමට HV ON කර පීඩනය 0.02 mmHg ට අඩු කළ යුතුය.',
            en: 'Keep HV ON and pressure ≤ 0.02 mmHg before raising the Maltese Cross.',
          },
          fixHint: step.assistantHint,
        };
      }
      if (!params.malteseCrossUp) {
        return {
          isWrong: true,
          code: 'CROSS_NOT_UP',
          title: {
            si: 'වැරදියි! මෝල්ටීස් කුරුසය ඔසවා නැත',
            en: 'Maltese Cross Not Raised!',
          },
          message: {
            si: 'කැතෝඩ කිරණ ගමන් මඟ හරහා මෝල්ටීස් කුරුසය තවම ඔසවා නැත.',
            en: 'Raise the Maltese Cross into the beam path to cast a sharp shadow.',
          },
          fixHint: step.assistantHint,
        };
      }
      return null;
    }

    case 'paddle-wheel': {
      if (!params.hvEnabled || params.pressureMmHg > 0.02 || !params.paddleWheelEngaged) {
        return {
          isWrong: true,
          code: 'PADDLE_NOT_ENGAGED',
          title: {
            si: 'වැරදියි! පැඩල් රෝදය සක්‍රීය කර නැත',
            en: 'Paddle Wheel Not Engaged!',
          },
          message: {
            si: 'HV ON කර පීඩනය 0.02 mmHg ට අඩු කර පහළ පුවරුවෙන් "පැඩල් රෝදය" සක්‍රීය කරන්න.',
            en: 'Keep HV ON, pressure ≤ 0.02 mmHg, and turn on "Paddle Wheel" in the dock.',
          },
          fixHint: step.assistantHint,
        };
      }
      return null;
    }

    case 'magnet-deflection': {
      if (!params.hvEnabled || !params.magnetActive) {
        return {
          isWrong: true,
          code: 'MAGNET_NOT_ACTIVE',
          title: {
            si: 'වැරදියි! දණ්ඩ චුම්බකය සක්‍රීය කර නැත',
            en: 'Bar Magnet Not Applied!',
          },
          message: {
            si: 'කදම්බය අපගමනය වන ආකාරය බැලීමට HV ON කර "චුම්බකය" බොත්තම ඔබන්න.',
            en: 'Enable HV and activate the Bar Magnet to observe beam deflection.',
          },
          fixHint: step.assistantHint,
        };
      }
      if (step.quizQuestion && quizSelected === null) {
        return {
          isWrong: true,
          code: 'QUIZ_UNANSWERED',
          title: {
            si: 'සංකල්ප ප්‍රශ්නයට පිළිතුරු දී නැත',
            en: 'Answer the Concept Check Question!',
          },
          message: {
            si: 'ඊළඟ පියවරට යාමට පෙර දකුණු පස ඇති සංකල්ප පරීක්ෂණ ප්‍රශ්නයට නිවැරදි පිළිතුර තෝරන්න.',
            en: 'Select the correct answer in the Concept Check box above before advancing.',
          },
          fixHint: step.assistantHint,
        };
      }
      return null;
    }

    case 'electric-deflection': {
      if (!params.hvEnabled || Math.abs(params.electricVoltageV) < 150) {
        return {
          isWrong: true,
          code: 'EFIELD_TOO_WEAK',
          title: {
            si: 'වැරදියි! විද්‍යුත් ක්ෂේත්‍ර වෝල්ටීයතාව ප්‍රමාණවත් නැත',
            en: 'Electric Plate Voltage Too Low!',
          },
          message: {
            si: `වත්මන් E-Plates වෝල්ටීයතාව ${params.electricVoltageV} V වේ. කැතෝඩ කිරණ පැහැදිලිව අපගමනය වීමට අවම වශයෙන් ±150 V හෝ ඊට වැඩි කරන්න.`,
            en: `Current voltage is ${params.electricVoltageV} V. Set E-Plates to at least ±150 V with HV ON.`,
          },
          fixHint: step.assistantHint,
        };
      }
      return null;
    }

    case 'magnetic-balance': {
      if (!params.hvEnabled || !isBalancedThomson) {
        const directionHint =
          Math.abs(thomsonDeflectionMm) > 1.8
            ? thomsonDeflectionMm > 0
              ? `කදම්බය +${thomsonDeflectionMm.toFixed(1)} mm ඉහළට නැමී ඇත — B-Field වැඩි කරන්න හෝ E-Plates අඩු කරන්න.`
              : `කදම්බය ${thomsonDeflectionMm.toFixed(1)} mm පහළට නැමී ඇත — B-Field අඩු කරන්න හෝ E-Plates වැඩි කරන්න.`
            : 'E-Plates (≥ 40 V) සහ B-Field (≥ 0.3 mT) දෙකම සක්‍රීය කර තුලනය කරන්න.';
        return {
          isWrong: true,
          code: 'THOMSON_UNBALANCED',
          title: {
            si: 'වැරදියි! කදම්බය තවම තුලනය වී නැත (d ≠ 0 mm)',
            en: 'Beam Not Balanced Yet (E ≠ vB)!',
          },
          message: {
            si: directionHint,
            en: `Current deflection d = ${thomsonDeflectionMm.toFixed(1)} mm. Adjust B-Field and E-Plates until d ≈ 0 mm.`,
          },
          fixHint: step.assistantHint,
        };
      }
      return null;
    }

    case 'gas-independence': {
      if (!visitedGasChange || !visitedMetalChange) {
        return {
          isWrong: true,
          code: 'GAS_OR_METAL_NOT_TESTED',
          title: {
            si: 'වැරදියි! වායුව සහ කැතෝඩ ලෝහය දෙකම මාරු කර පරීක්ෂා කරන්න',
            en: 'Change Both Gas & Cathode Metal!',
          },
          message: {
            si: `${visitedGasChange ? '✓ වායුව මාරු කළා.' : '✗ වායුව (Gas) තවම මාරු කර නැත.'} ${visitedMetalChange ? '✓ කැතෝඩ ලෝහය මාරු කළා.' : '✗ කැතෝඩ ලෝහය (Cathode) තවම මාරු කර නැත.'}`,
            en: `${visitedGasChange ? '✓ Gas changed.' : '✗ Change Gas selector.'} ${visitedMetalChange ? '✓ Cathode metal changed.' : '✗ Change Cathode Metal selector.'}`,
          },
          fixHint: step.assistantHint,
        };
      }
      return null;
    }

    case 'canal-rays': {
      if (!params.hvEnabled || params.thomsonMode !== 'canal-rays' || params.gas !== 'hydrogen') {
        return {
          isWrong: true,
          code: 'CANAL_HYDROGEN_MISSING',
          title: {
            si: 'වැරදියි! කැනල් කිරණ ප්‍රකාරය සහ හයිඩ්‍රජන් වායුව තෝරන්න',
            en: 'Switch to Canal Rays & Hydrogen Gas!',
          },
          message: {
            si: 'ප්‍රෝටෝන (H⁺) නිරීක්ෂණයට "කැනල් කිරණ (+)" මාදිලිය සහ "Hydrogen (H₂)" වායුව තෝරන්න.',
            en: 'Select "Canal Rays (+)" mode and set Gas to "Hydrogen (H₂)".',
          },
          fixHint: step.assistantHint,
        };
      }
      if (step.quizQuestion && quizSelected === null) {
        return {
          isWrong: true,
          code: 'QUIZ_UNANSWERED',
          title: {
            si: 'සංකල්ප ප්‍රශ්නයට පිළිතුරු දී නැත',
            en: 'Complete the Concept Question!',
          },
          message: {
            si: 'කැනල් කිරණ පිළිබඳ ප්‍රශ්නයට පිළිතුරු තෝරන්න.',
            en: 'Answer the Canal Rays question before proceeding.',
          },
          fixHint: step.assistantHint,
        };
      }
      return null;
    }

    case 'spray-ionize': {
      if (params.sprayPulse < 1 || !params.xrayActive) {
        return {
          isWrong: true,
          code: 'SPRAY_OR_XRAY_MISSING',
          title: {
            si: 'වැරදියි! තෙල් බිංදු ඉසීම හෝ X-Ray සක්‍රීය කර නැත',
            en: 'Spray Oil & Turn X-Ray ON!',
          },
          message: {
            si: `${params.sprayPulse >= 1 ? '✓ තෙල් බිංදු ඉස ඇත.' : '✗ "තෙල් බිංදු ඉසින්න" බොත්තම ඔබන්න.'} ${params.xrayActive ? '✓ X-Ray ON.' : '✗ "X-Ray" බොත්තම ON කරන්න.'}`,
            en: `${params.sprayPulse >= 1 ? '✓ Oil sprayed.' : '✗ Click "Spray Oil Droplets".'} ${params.xrayActive ? '✓ X-Ray ON.' : '✗ Switch X-Ray ON.'}`,
          },
          fixHint: step.assistantHint,
        };
      }
      return null;
    }

    case 'balance-droplet': {
      if (!isSuspendedMillikan) {
        const isFalling = millikanVelocityMmPerSec < 0;
        const targetText = millikanBalanceV ? ` (~${millikanBalanceV.toFixed(0)} V)` : '';
        return {
          isWrong: true,
          code: 'DROPLET_NOT_BALANCED',
          title: {
            si: 'වැරදියි! තෙල් බිංදුව තවම නිශ්චල නැත',
            en: 'Oil Droplet Not Suspended Yet!',
          },
          message: {
            si: isFalling
              ? `බිංදුව පහළට වැටෙමින් පවතී (v = ${millikanVelocityMmPerSec.toFixed(2)} mm/s). Plate Voltage වැඩි කරන්න${targetText}.`
              : `බිංදුව ඉහළට ගමන් කරයි (v = +${millikanVelocityMmPerSec.toFixed(2)} mm/s). Plate Voltage අඩු කරන්න${targetText}.`,
            en: isFalling
              ? `Droplet is falling (v = ${millikanVelocityMmPerSec.toFixed(2)} mm/s). Increase Plate Voltage${targetText}.`
              : `Droplet is rising (v = +${millikanVelocityMmPerSec.toFixed(2)} mm/s). Decrease Plate Voltage${targetText}.`,
          },
          fixHint: step.assistantHint,
        };
      }
      if (step.quizQuestion && quizSelected === null) {
        return {
          isWrong: true,
          code: 'QUIZ_UNANSWERED',
          title: {
            si: 'සංකල්ප ප්‍රශ්නයට පිළිතුරු දී නැත',
            en: 'Answer the Concept Question!',
          },
          message: {
            si: 'තෙල් බිංදුව නිශ්චල කළ පසු පහළ ප්‍රශ්නයට නිවැරදි පිළිතුර තෝරන්න.',
            en: 'Now select the correct concept answer above.',
          },
          fixHint: step.assistantHint,
        };
      }
      return null;
    }

    case 'rutherford-forward': {
      if (!params.alphaBeamEnabled || params.detectorAngleDeg > 15) {
        return {
          isWrong: true,
          code: 'RUTHERFORD_FORWARD_INVALID',
          title: {
            si: 'වැරදියි! α-කිරණ කදම්බය ON කර කෝණය 0°–15° අතර තබන්න',
            en: 'Set α-Beam ON & Detector Angle ≤ 15°!',
          },
          message: {
            si: `වත්මන් කෝණය ${params.detectorAngleDeg}° වේ. කෙළින්ම ගමන් කරන α-අංශු නිරීක්ෂණයට α-Beam ON කර θ ≤ 15° වෙත සකසන්න.`,
            en: `Current angle is ${params.detectorAngleDeg}°. Turn α-Beam ON and keep θ ≤ 15°.`,
          },
          fixHint: step.assistantHint,
        };
      }
      return null;
    }

    case 'rutherford-backscatter': {
      if (!params.alphaBeamEnabled || params.detectorAngleDeg < 120) {
        return {
          isWrong: true,
          code: 'RUTHERFORD_BACK_INVALID',
          title: {
            si: 'වැරදියි! පසු-ප්‍රකිරණය සඳහා කෝණය ≥ 120° විය යුතුය',
            en: 'Set Detector Angle ≥ 120° for Backscatter!',
          },
          message: {
            si: `වත්මන් කෝණය ${params.detectorAngleDeg}° වේ. ආපසු හැරෙන α-අංශු ගණනය කිරීමට අනාවරක කෝණය 120° හෝ ඊට වැඩි කරන්න.`,
            en: `Current angle is ${params.detectorAngleDeg}°. Rotate Detector Angle to ≥ 120° with α-Beam ON.`,
          },
          fixHint: step.assistantHint,
        };
      }
      if (step.quizQuestion && quizSelected === null) {
        return {
          isWrong: true,
          code: 'QUIZ_UNANSWERED',
          title: {
            si: 'සංකල්ප ප්‍රශ්නයට පිළිතුරු දී නැත',
            en: 'Answer the Concept Question!',
          },
          message: {
            si: 'රදර්ෆර්ඩ් න්‍යෂ්ටික ආකෘති ප්‍රශ්නයට පිළිතුරු තෝරන්න.',
            en: 'Answer the Rutherford nuclear model question before proceeding.',
          },
          fixHint: step.assistantHint,
        };
      }
      return null;
    }

    case 'chem-heat-or-mix': {
      if (!params.chem.burnerOn && !params.chem.reagentAdded) {
        return {
          isWrong: true,
          code: 'NO_HEAT_OR_REAGENT',
          title: {
            si: 'වැරදියි! දාහකය ON කර හෝ ප්‍රතිකාරකය එක් කර නැත',
            en: 'No Heat or Reagent Applied!',
          },
          message: {
            si: 'පරීක්ෂණය ආරම්භ කිරීමට පහළ පුවරුවෙන් "ප්‍රතිකාරක එක් කරන්න" හෝ "දාහකය: ON" ඔබන්න.',
            en: 'Click "Add Reagent / Mix" or turn on the "Burner" in the control dock.',
          },
          fixHint: step.assistantHint,
        };
      }
      return null;
    }

    case 'chem-titrate-endpoint': {
      const targetVol = 25 / Math.max(0.5, params.chem.concentrationM);
      const diff = params.chem.buretteVolumeMl - targetVol;
      if (diff > 1.2) {
        return {
          isWrong: true,
          code: 'TITRATION_OVERSHOOT',
          title: {
            si: 'වැරදියි! අන්ත ලක්ෂ්‍යය ඉක්මවා ඇත (Over-titrated)!',
            en: 'Overshot Endpoint (Over-titrated)!',
          },
          message: {
            si: `ඔබ ${params.chem.buretteVolumeMl.toFixed(1)} mL එක් කර ඇත. නිවැරදි අන්ත ලක්ෂ්‍යය ${targetVol.toFixed(1)} mL වේ! බියුරෙට් පරිමාව ආපසු අඩු කර නිවැරදි ස්ථානයේ නවත්වන්න.`,
            en: `You added ${params.chem.buretteVolumeMl.toFixed(1)} mL, overshooting the ${targetVol.toFixed(1)} mL endpoint! Dial the burette back carefully.`,
          },
          fixHint: step.assistantHint,
        };
      }
      if (diff < -1.2) {
        return {
          isWrong: true,
          code: 'TITRATION_UNDER',
          title: {
            si: 'වැරදියි! අන්ත ලක්ෂ්‍යයට තවම ළඟා වී නැත',
            en: 'Not at Endpoint Yet!',
          },
          message: {
            si: `වත්මන් පරිමාව ${params.chem.buretteVolumeMl.toFixed(1)} mL වේ. නිවැරදි අන්ත ලක්ෂ්‍යය වන ${targetVol.toFixed(1)} mL (±1.2 mL) දක්වා බියුරෙට් ද්‍රාවණය එක් කරන්න.`,
            en: `Current volume is ${params.chem.buretteVolumeMl.toFixed(1)} mL. Add titrant to reach ${targetVol.toFixed(1)} mL (±1.2 mL).`,
          },
          fixHint: step.assistantHint,
        };
      }
      return null;
    }

    case 'chem-adjust-variable': {
      const hasAdjusted =
        chemVariableAdjusted ||
        params.chem.reagentAdded ||
        params.chem.burnerOn ||
        params.chem.pressureKpa >= 160 ||
        params.chem.temperatureC >= 40 ||
        params.chem.appliedVoltageV >= 6 ||
        params.chem.catalyst !== 'none' ||
        params.chem.surfaceArea === 'powder' ||
        params.chem.eqAction !== 'neutral';
      if (!hasAdjusted) {
        return {
          isWrong: true,
          code: 'VARIABLE_NOT_ADJUSTED',
          title: {
            si: 'වැරදියි! පරීක්ෂණ විචල්‍යය තවම වෙනස් කර නැත',
            en: 'Adjust an Experiment Variable First!',
          },
          message: {
            si: 'පහළ පාලන පුවරුවෙන් අදාළ අගය (උෂ්ණත්වය / සාන්ද්‍රණය / පීඩනය / වෝල්ටීයතාව / ප්‍රතිකාරකය) වෙනස් කර ප්‍රතිඵලය නිරීක්ෂණය කරන්න.',
            en: 'Modify a parameter (temperature, concentration, pressure, voltage, catalyst, or reagent) in the control dock below.',
          },
          fixHint: step.assistantHint,
        };
      }
      return null;
    }

    case 'chem-observe-quiz': {
      if (step.quizQuestion && quizSelected === null) {
        return {
          isWrong: true,
          code: 'QUIZ_UNANSWERED',
          title: {
            si: 'පරීක්ෂණ ප්‍රශ්නයට පිළිතුරු දී නැත',
            en: 'Answer the Observation Quiz!',
          },
          message: {
            si: 'නිරීක්ෂණය මත පදනම් වූ සංකල්ප ප්‍රශ්නයට නිවැරදි පිළිතුර තෝරන්න.',
            en: 'Choose the correct answer in the Concept Check box based on your experiment.',
          },
          fixHint: step.assistantHint,
        };
      }
      return null;
    }

    case 'pack-away': {
      if (placedIds.size > 0) {
        return {
          isWrong: true,
          code: 'BENCH_NOT_CLEARED',
          title: {
            si: 'වැරදියි! වැඩ මේසයේ උපකරණ තවම ඉවත් කර නැත',
            en: 'Pack All Equipment Away First!',
          },
          message: {
            si: `වැඩ මේසය මත තවත් උපකරණ ${placedIds.size}ක් ඇත. පරීක්ෂණය අවසන් කිරීමට සියලු උපකරණ ආපසු පෙට්ටියට දමන්න.`,
            en: `${placedIds.size} item(s) still remain on the bench. Return all apparatus to the box before completing.`,
          },
          fixHint: {
            si: 'වම් පස ඇති "සියල්ල ආපසු දමන්න" බොත්තම ඔබන්න.',
            en: 'Click "Return All to Box" inside the left Toolbox panel.',
          },
        };
      }
      return null;
    }

    default:
      return null;
  }
}

export function diagnoseInvalidControlAction(
  actionLabelSi: string,
  actionLabelEn: string,
  isAssembled: boolean,
  params: LabSimulationParams
): MistakeDiagnostic | null {
  if (!isAssembled) {
    return {
      isWrong: true,
      code: 'ACTION_BEFORE_ASSEMBLY',
      title: {
        si: `වැරදියි! පළමුව උපකරණ මේසය මත සවි කරන්න`,
        en: `Wrong Order! Assemble Apparatus First`,
      },
      message: {
        si: `සියලු උපකරණ සවි කිරීමට පෙර "${actionLabelSi}" ක්‍රියාත්මක කළ නොහැක.`,
        en: `You cannot activate "${actionLabelEn}" before placing all required apparatus on the 3D bench.`,
      },
      fixHint: {
        si: 'වම් පස පෙට්ටියෙන් සියලුම උපකරණ මේසය මත තබන්න ("සියල්ල තබන්න").',
        en: 'Click "Place All" in the left Toolbox first.',
      },
    };
  }

  if (
    params.experimentId === 'cathode-tube' &&
    (actionLabelEn === 'Maltese Cross' ||
      actionLabelEn === 'Paddle Wheel' ||
      actionLabelEn === 'Magnet') &&
    (!params.hvEnabled || params.pressureMmHg > 0.05)
  ) {
    return {
      isWrong: true,
      code: 'LOW_VACUUM_NEEDED',
      title: {
        si: 'සැලකිලිමත් වන්න! රික්තය තවම ප්‍රමාණවත් නැත',
        en: 'Warning: Vacuum Too High for Clear Beam!',
      },
      message: {
        si: `${actionLabelSi} හොඳින් නිරීක්ෂණය කිරීමට පළමුව HV ON කර පීඩනය 0.015 mmHg ට අඩු කරන්න (වත්මන්: ${params.pressureMmHg} mmHg).`,
        en: `To observe ${actionLabelEn} clearly, keep HV ON and pump pressure below 0.015 mmHg (current: ${params.pressureMmHg} mmHg).`,
      },
      fixHint: {
        si: 'පාලන පුවරුවේ Pressure ස්ලයිඩරය 0.008 mmHg වෙත අඩු කරන්න.',
        en: 'Lower the Pressure slider toward 0.008 mmHg in the bottom dock.',
      },
    };
  }

  return null;
}

export function parseVoiceLabCommand(rawTranscript: string): VoiceLabCommand | null {
  const t = rawTranscript.trim().toLowerCase();
  if (!t) return null;

  // How-to / read instructions
  if (
    t.includes('කරන විදිය') ||
    t.includes('කරන්නේ කොහොමද') ||
    t.includes('how to') ||
    t.includes('how do i') ||
    t.includes('kohomada') ||
    t.includes('karana widiya') ||
    t.includes('karana vidiya') ||
    t.includes('read step') ||
    t.includes('උපදෙස් කියන්න')
  ) {
    return { type: 'read-howto' };
  }

  // Next step
  if (
    t.includes('ඊළඟ') ||
    t.includes('ilanga') ||
    t.includes('next step') ||
    t === 'next' ||
    t.includes('check step') ||
    t.includes('පරීක්ෂා කරන්න')
  ) {
    return { type: 'next-step' };
  }

  // Previous step
  if (
    t.includes('පෙර පියවර') ||
    t.includes('කලින් පියවර') ||
    t.includes('kalin') ||
    t.includes('previous') ||
    t === 'back'
  ) {
    return { type: 'prev-step' };
  }

  // Place all / assemble
  if (
    t.includes('සියල්ල තබන්න') ||
    t.includes('උපකරණ තබන්න') ||
    t.includes('place all') ||
    t.includes('assemble')
  ) {
    return { type: 'place-all' };
  }

  // Pack away / return all
  if (
    t.includes('ආපසු දමන්න') ||
    t.includes('පෙට්ටියට දමන්න') ||
    t.includes('pack away') ||
    t.includes('return all')
  ) {
    return { type: 'pack-away' };
  }

  // HV ON/OFF
  if (t.includes('hv on') || t.includes('high voltage on') || t.includes('විදුලිය දමන්න')) {
    return { type: 'hv-toggle', enabled: true };
  }
  if (t.includes('hv off') || t.includes('high voltage off') || t.includes('විදුලිය නිවන්න')) {
    return { type: 'hv-toggle', enabled: false };
  }

  // Burner ON/OFF
  if (t.includes('burner on') || t.includes('රත් කරන්න') || t.includes('දාහකය දමන්න')) {
    return { type: 'burner-toggle', enabled: true };
  }
  if (t.includes('burner off') || t.includes('දාහකය නිවන්න')) {
    return { type: 'burner-toggle', enabled: false };
  }

  // Mix / Add Reagent
  if (t.includes('ප්‍රතිකාරක') || t.includes('මිශ්‍ර කරන්න') || t.includes('add reagent') || t.includes('mix')) {
    return { type: 'mix-reagent' };
  }

  // Crookes toggles
  if (t.includes('මෝල්ටීස්') || t.includes('maltese') || t.includes('cross')) {
    return { type: 'toggle-cross' };
  }
  if (t.includes('පැඩල්') || t.includes('paddle')) {
    return { type: 'toggle-paddle' };
  }
  if (t.includes('චුම්බක') || t.includes('magnet')) {
    return { type: 'toggle-magnet' };
  }

  // Darkroom / Light
  if (t.includes('darkroom') || t.includes('dark room') || t.includes('අඳුරු')) {
    return { type: 'darkroom-toggle', enabled: true };
  }
  if (t.includes('daylight') || t.includes('light on') || t.includes('ආලෝකය')) {
    return { type: 'darkroom-toggle', enabled: false };
  }

  // Reset
  if (t.includes('reset') || t.includes('නැවත අරඹන්න')) {
    return { type: 'reset' };
  }

  // Open AI Tutor
  if (t === 'ai' || t.includes('ai tutor') || t.includes('ගුරුවරයා')) {
    return { type: 'open-ai' };
  }

  return { type: 'ask-ai', query: rawTranscript.trim() };
}
