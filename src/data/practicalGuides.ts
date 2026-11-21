import { EXPERIMENTS } from './curriculum';
import type { ExperimentId, LocalizedText } from '../types/lab';

export interface PracticalGuide {
  procedure: LocalizedText[];
  observations: LocalizedText[];
  conclusions: LocalizedText[];
}

type CompactGuide = {
  procSi: string[];
  procEn: string[];
  obsSi: string[];
  obsEn: string[];
  concSi: string[];
  concEn: string[];
};

const COMPACT_GUIDES: Partial<Record<ExperimentId, CompactGuide>> = {
  'cathode-tube': {
    procSi: [
      'ප්‍රේරණ දඟරය, ක්‍රක්ස් නළය, රික්ත පොම්පය, මෝල්ටීස් කුරුසය හා චුම්බකය වැඩ මේසයේ සවි කරන්න.',
      'HV සැපයුම ON කර පීඩනය 760 mmHg සිට 0.005 mmHg දක්වා අඩු කරන්න.',
      'මෝල්ටීස් කුරුසය ඉහළට ඔසවා සහ මයිකා පැඩල් රෝදය ක්‍රියාත්මක කර නිරීක්ෂණය කරන්න.',
      'නළය අසලට ලාඩම් චුම්බකය ළං කර කදම්බයේ අපගමනය පරීක්ෂා කරන්න.',
    ],
    procEn: [
      'Assemble the induction coil, Crookes tube, vacuum pump, Maltese cross, and horseshoe magnet on the bench.',
      'Switch High Voltage ON and pump internal pressure down from 760 mmHg below 0.01 mmHg.',
      'Raise the Maltese Cross into the beam path and engage the mica paddle wheel.',
      'Bring the horseshoe magnet close to the tube to inspect magnetic deflection.',
    ],
    obsSi: [
      'පීඩනය 0.01 mmHg ට අඩු වූ විට ZnS තිරය කොළ පැහැයෙන් ප්‍රතිදීප්ත වේ.',
      'මෝල්ටීස් කුරුසය ඉදිරියේ ZnS තිරයේ තියුණු කුරුස සෙවනැල්ලක් වැටේ.',
      'සැහැල්ලු පැඩල් රෝදය ඇනෝඩය දෙසට භ්‍රමණය වෙමින් ගමන් කරයි.',
      'චුම්බක ක්ෂේත්‍රයේදී කදම්බය ධන ආරෝපණ වලට ප්‍රතිවිරුද්ධ දිශාවට අපගමනය වේ.',
    ],
    obsEn: [
      'Below 0.01 mmHg, the ZnS screen glows vivid green from cathode ray impact.',
      'Raising the Maltese Cross projects a sharp cross shadow on the end screen.',
      'The light mica paddle wheel rotates and rolls away from the cathode toward the anode.',
      'The beam bends smoothly under a magnetic field according to Fleming’s left-hand rule.',
    ],
    concSi: [
      'කැතෝඩ කිරණ සරල රේඛීයව ගමන් කරයි.',
      'කැතෝඩ කිරණ වලට ස්කන්ධයක් සහ ගම්‍යතාවයක් ඇති අංශුමය ස්වභාවයක් පවතී.',
      'කැතෝඩ කිරණ සෘණ ආරෝපිත අංශු (ඉලෙක්ට්‍රෝන) වලින් සමන්විත වේ.',
    ],
    concEn: [
      'Cathode rays travel in straight lines from the cathode.',
      'Cathode rays carry mass and momentum capable of doing mechanical work.',
      'Cathode rays consist of negatively charged particles (electrons) present in all matter.',
    ],
  },
  'thomson-canal': {
    procSi: [
      'තොම්සන් e/m නළය, විද්‍යුත් තහඩු, හෙල්ම්හෝල්ට්ස් දඟර හා වායු සිලින්ඩර සවි කරන්න.',
      'HV ON කර විද්‍යුත් ක්ෂේත්‍රය (+200 V) යොදා කදම්බයේ අපගමනය මනින්න.',
      'විද්‍යුත් හා චුම්බක ක්ෂේත්‍ර සමතුලිත කර කදම්බය ශුන්‍ය ස්ථානයට ගෙන එන්න.',
      'නළයේ වායුව (Air, H₂, He) සහ කැතෝඩ ලෝහය මාරු කර, Canal Rays ආකාරයද පරීක්ෂා කරන්න.',
    ],
    procEn: [
      'Place Thomson e/m tube, electrostatic plates, Helmholtz coils, and gas cylinders.',
      'Turn HV ON, apply electrostatic deflection voltage, and observe upward/downward beam shift.',
      'Adjust magnetic field B until electric and magnetic forces balance (deflection = 0 mm).',
      'Vary fill gas & cathode metal, then switch to Canal Rays mode with Hydrogen.',
    ],
    obsSi: [
      'විද්‍යුත් ක්ෂේත්‍රයේදී කැතෝඩ කිරණ ධන (+) තහඩුව දෙසට ආකර්ෂණය වේ.',
      'F_E = F_B විට කදම්බය නැවත මැද (0 mm) ස්ථානයට පැමිණේ (v = E/B).',
      'වායුව හෝ කැතෝඩ ලෝහය මාරු කළද ඉලෙක්ට්‍රෝනයේ e/m = 1.76×10¹¹ C kg⁻¹ නොවෙනස්ව පවතී.',
      'Canal Rays ආකාරයේදී හයිඩ්‍රජන් වායුව සඳහා උපරිම e/m ඇති ධන කිරණ (ප්‍රෝටෝන H⁺) දිස්වේ.',
    ],
    obsEn: [
      'Cathode rays deflect toward the positively charged plate.',
      'At balanced fields (qE = qvB), the beam returns cleanly to 0.0 mm center.',
      'e/m for cathode rays stays constant at 1.76×10¹¹ C kg⁻¹ regardless of gas or cathode metal.',
      'In Canal Ray mode, positive rays travel backward through cathode holes; Hydrogen gives largest e/m (protons).',
    ],
    concSi: [
      'ඉලෙක්ට්‍රෝනය සියලුම පරමාණු වල පොදු මූලික අංශුවකි (e/m = 1.76×10¹¹ C kg⁻¹).',
      'ධන කිරණ වල e/m අගය නළයේ වායුව මත රඳා පවතින අතර H⁺ (ප්‍රෝටෝනය) සැහැල්ලුම ධන අංශුවයි.',
    ],
    concEn: [
      'Electrons are universal subatomic constituents of all matter (e/m = 1.76×10¹¹ C kg⁻¹).',
      'Positive (canal) ray e/m depends on the gas; Hydrogen yields the lightest positive particle — the proton.',
    ],
  },
  'millikan': {
    procSi: [
      'මිලිකන් කුටීරය, ස්ප්‍රේ බල්බය, X-කිරණ නළය හා ක්ෂුද්‍ර අන්වීක්ෂය සවි කරන්න.',
      'තෙල් බිඳිති ඉස (Spray Oil Mist) X-කිරණ ON කර බිඳිති ආරෝපණය කරන්න.',
      'වෝල්ටීයතාවය සීරුමාරු කර විශාලන අන්වීක්ෂයේ තෙල් බිඳිත්ත නිශ්චලව රඳවන්න (v = 0.00 mm/s).',
    ],
    procEn: [
      'Set up Millikan brass chamber, oil atomizer, X-ray ionizer, and microscope.',
      'Spray oil mist and activate X-rays briefly to ionize air and charge oil droplets.',
      'Tune plate voltage carefully until downward gravity balances upward electric force (v = 0.00 mm/s).',
    ],
    obsSi: [
      'විද්‍යුත් ක්ෂේත්‍රය නොමැති විට ගුරුත්වය නිසා තෙල් බිඳිති පහළට වැටේ.',
      'නිවැරදි සමතුලිත වෝල්ටීයතාවයේදී (mg = qE) බිඳිත්ත නිශ්චලව එල්ලී පවතී.',
      'සියලුම බිඳිති වල ආරෝපණ q = n·e ලෙස 1.602×10⁻¹⁹ C හි පූර්ණ සංඛ්‍යා ගුණාකාර වේ.',
    ],
    obsEn: [
      'With voltage off, droplets fall steadily under gravity.',
      'At balance voltage (mg = qV/d), the target droplet hovers motionless in the eyepiece.',
      'Measured charges q are always integer multiples of e = 1.602×10⁻¹⁹ C.',
    ],
    concSi: [
      'විද්‍යුත් ආරෝපණය ක්වොන්ටීකරණය වී ඇති අතර මූලික ආරෝපණය e = 1.602×10⁻¹⁹ C වේ.',
      'තොම්සන්ගේ e/m අගය සමඟ ඉලෙක්ට්‍රෝනයේ ස්කන්ධය m_e = 9.109×10⁻³¹ kg ලෙස ගණනය කෙරිණි.',
    ],
    concEn: [
      'Electric charge is quantized in units of e = 1.602×10⁻¹⁹ C.',
      'Combining e with Thomson’s e/m gives electron mass m_e = 9.109×10⁻³¹ kg.',
    ],
  },
  'rutherford': {
    procSi: [
      'α-ප්‍රභවය, තුනී රන් පත්‍රය, ZnS වළල්ල සහ චල අන්වීක්ෂය සවි කරන්න.',
      'α-කදම්බය ON කර අනාවරක කෝණය 0° හි තබා ආලෝක පුපුරු නිරීක්ෂණය කරන්න.',
      'අනාවරකය 120°–180° දක්වා කරකවා පසුපසට විසිරෙන α-අංශු පරීක්ෂා කරන්න.',
    ],
    procEn: [
      'Assemble the α-source, ultra-thin gold foil, 360° ZnS ring, and travelling microscope.',
      'Switch the α-beam ON and inspect scintillations straight ahead at 0°–15°.',
      'Sweep the detector angle past 120° toward 180° to detect rare backscattered α-particles.',
    ],
    obsSi: [
      'α-අංශු වලින් 99.9% කට වැඩි ප්‍රමාණයක් කිසිදු අපගමනයකින් තොරව කෙළින්ම ගමන් කරයි.',
      'සුළු කොටසක් කුඩා කෝණ වලින් විසිරී යයි.',
      'අංශු ~20,000 කින් 1 ක් පමණ 90° ට වඩා වැඩි කෝණයකින් (150°–180°) ආපසු හැරී එයි.',
    ],
    obsEn: [
      'Over 99.9% of α-particles pass straight through the gold foil undeflected.',
      'A small fraction deflects through small angles.',
      'Roughly 1 in 20,000 rebounds violently at angles greater than 90°.',
    ],
    concSi: [
      'පරමාණුවේ පරිමාවෙන් වැඩි කොටස හිස් අවකාශයකි.',
      'පරමාණුවේ මුළු ධන ආරෝපණය හා ස්කන්ධය ඉතා කුඩා, ඝන කේන්ද්‍රීය න්‍යෂ්ටියක පවතී.',
    ],
    concEn: [
      'Most of the atom’s volume is empty space.',
      'Nearly all mass and positive charge sit inside a tiny, ultra-dense central nucleus.',
    ],
  },
};

function buildFallbackGuide(id: ExperimentId): PracticalGuide {
  const exp = EXPERIMENTS[id];
  const procSi = exp.steps
    .filter((s) => s.validationType !== 'pack-away')
    .map((s) => s.instruction.si);
  const procEn = exp.steps
    .filter((s) => s.validationType !== 'pack-away')
    .map((s) => s.instruction.en);

  const observations: LocalizedText[] = [];
  const conclusions: LocalizedText[] = [];

  for (const s of exp.steps) {
    if (s.quizQuestion) {
      const rightOpt = s.quizQuestion.options[s.quizQuestion.correctIndex];
      observations.push({
        si: s.quizQuestion.explanation.si,
        en: s.quizQuestion.explanation.en,
      });
      if (rightOpt) {
        conclusions.push(rightOpt);
      }
    }
  }

  for (const kf of exp.notebookSummary.keyFindings) {
    if (observations.length < 3) {
      observations.push(kf);
    } else {
      conclusions.push(kf);
    }
  }

  if (exp.notebookSummary.equations.length > 0) {
    conclusions.push({
      si: `ප්‍රධාන සමීකරණය: ${exp.notebookSummary.equations[0]}`,
      en: `Key Equation: ${exp.notebookSummary.equations[0]}`,
    });
  }

  const procedure = procSi.map((si, idx) => ({
    si,
    en: procEn[idx] ?? si,
  }));

  return {
    procedure: procedure.length > 0 ? procedure : [{ si: exp.subtitle.si, en: exp.subtitle.en }],
    observations:
      observations.length > 0
        ? observations
        : exp.notebookSummary.keyFindings.slice(0, 2),
    conclusions:
      conclusions.length > 0
        ? conclusions
        : exp.notebookSummary.keyFindings.slice(-2),
  };
}

export const PRACTICAL_GUIDES: Record<ExperimentId, PracticalGuide> = (
  Object.keys(EXPERIMENTS) as ExperimentId[]
).reduce((acc, id) => {
  const c = COMPACT_GUIDES[id];
  if (c) {
    acc[id] = {
      procedure: c.procSi.map((si, i) => ({ si, en: c.procEn[i] ?? si })),
      observations: c.obsSi.map((si, i) => ({ si, en: c.obsEn[i] ?? si })),
      conclusions: c.concSi.map((si, i) => ({ si, en: c.concEn[i] ?? si })),
    };
  } else {
    acc[id] = buildFallbackGuide(id);
  }
  return acc;
}, {} as Record<ExperimentId, PracticalGuide>);

export function getPracticalGuide(id: ExperimentId): PracticalGuide {
  return PRACTICAL_GUIDES[id];
}
