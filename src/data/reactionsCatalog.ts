import type { LocalizedText, UnitRoman } from '../types/lab';
import { REACTIONS_EXTENDED_1 } from './reactionsExtended1';
import { REACTIONS_EXTENDED_2 } from './reactionsExtended2';

export type ReactionCategory = 'inorganic' | 'organic' | 'physical-redox' | 'electro-metals';
export type ReactionCondition = 'room' | 'warm' | 'excess';

export type ReactionVisualEffect =
  | 'precipitate'
  | 'gas-bubbles'
  | 'color-shift'
  | 'silver-mirror'
  | 'brown-ring'
  | 'limewater-milk'
  | 'litmus-blue'
  | 'sodium-flame'
  | 'copper-deposit'
  | 'colloid-turbidity';

export interface SyllabusReactionSpec {
  id: string;
  category: ReactionCategory;
  unitBadges: UnitRoman[];
  title: LocalizedText;
  shortTitle: LocalizedText;
  reagentAId: string;
  reagentBId: string;
  defaultCondition: ReactionCondition;
  equation: string;
  ionicEquation: string;
  deltaHLabel: string;
  initialColorHex: string;
  finalColorHex: string;
  initialOpacity: number;
  finalOpacity: number;
  reagentBColorHex: string;
  effect: ReactionVisualEffect;
  precipitateColorHex?: string;
  gasColorHex?: string;
  gasName?: string;
  tempRiseC: number;
  observation: LocalizedText;
  explanation: LocalizedText;
  examNotes: LocalizedText;
  voiceSummary: LocalizedText;
}

export interface MixableReagent {
  id: string;
  formula: string;
  label: LocalizedText;
  colorHex: string;
}

// Category definitions with live counts are exported below SYLLABUS_REACTIONS.

export const REACTION_CONDITIONS: Array<{ id: ReactionCondition; label: LocalizedText }> = [
  { id: 'room', label: { si: 'කාමර උෂ්ණත්වය (25°C)', en: 'Room Temp (25°C)' } },
  { id: 'warm', label: { si: 'උණුසුම් කිරීම / තාපය', en: 'Warm / Bunsen Heat' } },
  { id: 'excess', label: { si: 'අතිරික්ත ප්‍රතිකාරකය', en: 'Excess Reagent' } },
];

export const MIXABLE_REAGENTS_A: MixableReagent[] = [
  { id: 'cuso4', formula: 'CuSO₄(aq)', label: { si: 'කොපර් සල්ෆේට් (Cu²⁺)', en: 'Copper(II) Sulphate' }, colorHex: '#0284c7' },
  { id: 'fecl3', formula: 'FeCl₃(aq)', label: { si: 'ෆෙරික් ක්ලෝරයිඩ් (Fe³⁺)', en: 'Iron(III) Chloride' }, colorHex: '#d97706' },
  { id: 'agno3', formula: 'AgNO₃(aq)', label: { si: 'සිල්වර් නයිට්‍රේට් (Ag⁺)', en: 'Silver Nitrate' }, colorHex: '#e2e8f0' },
  { id: 'pbno3', formula: 'Pb(NO₃)₂(aq)', label: { si: 'ලෙඩ් නයිට්‍රේට් (Pb²⁺)', en: 'Lead(II) Nitrate' }, colorHex: '#e2e8f0' },
  { id: 'k2cro4', formula: 'K₂CrO₄(aq)', label: { si: 'පොටෑසියම් ක්‍රෝමේට්', en: 'Potassium Chromate' }, colorHex: '#facc15' },
  { id: 'na2co3', formula: 'Na₂CO₃(aq)', label: { si: 'සෝඩියම් කාබනේට්', en: 'Sodium Carbonate' }, colorHex: '#e2e8f0' },
  { id: 'nh4cl', formula: 'NH₄Cl(aq)', label: { si: 'ඇමෝනියම් ක්ලෝරයිඩ්', en: 'Ammonium Chloride' }, colorHex: '#e2e8f0' },
  { id: 'feso4-no3', formula: 'NO₃⁻ + FeSO₄', label: { si: 'නයිට්‍රේට් + FeSO₄', en: 'Nitrate + FeSO₄' }, colorHex: '#bef264' },
  { id: 'br2-water', formula: 'Br₂(aq)', label: { si: 'බ්‍රෝමීන් ජලය', en: 'Bromine Water' }, colorHex: '#ea580c' },
  { id: 'kmno4-alk', formula: 'KMnO₄ / OH⁻', label: { si: 'ක්ෂාරීය KMnO₄', en: 'Alkaline KMnO₄' }, colorHex: '#9333ea' },
  { id: 'tollens', formula: '[Ag(NH₃)₂]⁺', label: { si: 'ටොලන්ස් ප්‍රතිකාරකය', en: 'Tollens Reagent' }, colorHex: '#e2e8f0' },
  { id: 'fehlings', formula: 'Fehling A+B', label: { si: 'ෆේලිං ද්‍රාවණය', en: 'Fehlings Solution' }, colorHex: '#1d4ed8' },
  { id: 'phenol', formula: 'C₆H₅OH', label: { si: 'ෆීනෝල් ද්‍රාවණය', en: 'Aqueous Phenol' }, colorHex: '#f8fafc' },
  { id: 'ethanol', formula: 'CH₃CH₂OH', label: { si: 'එතනෝල් (I₂ + OH⁻)', en: 'Ethanol / Methyl Ketone' }, colorHex: '#fef08a' },
  { id: 'na2s2o3', formula: 'Na₂S₂O₃(aq)', label: { si: 'තයෝසල්ෆේට් (S₂O₃²⁻)', en: 'Sodium Thiosulphate' }, colorHex: '#e2e8f0' },
  { id: 'na-metal', formula: 'Na(s)', label: { si: 'සෝඩියම් ලෝහය (Na)', en: 'Sodium Metal (Na)' }, colorHex: '#cbd5e1' },
  { id: 'ca-metal', formula: 'Ca(s)', label: { si: 'කැල්සියම් ලෝහය (Ca)', en: 'Calcium Metal (Ca)' }, colorHex: '#94a3b8' },
  { id: 'zn-metal', formula: 'Zn(s)', label: { si: 'සින්ක් ලෝහ කැබලි (Zn)', en: 'Zinc Granules (Zn)' }, colorHex: '#94a3b8' },
];

export const MIXABLE_REAGENTS_B: MixableReagent[] = [
  { id: 'nh3-aq', formula: 'NH₃(aq)', label: { si: 'ඇමෝනියා ද්‍රාවණය', en: 'Ammonia (aq)' }, colorHex: '#e0f2fe' },
  { id: 'naoh-aq', formula: 'NaOH(aq)', label: { si: 'සෝඩියම් හයිඩ්‍රොක්සයිඩ්', en: 'Sodium Hydroxide' }, colorHex: '#f1f5f9' },
  { id: 'hcl-dil', formula: 'HCl(aq)', label: { si: 'තනුක HCl අම්ලය', en: 'Dilute HCl' }, colorHex: '#e2e8f0' },
  { id: 'h2so4-dil', formula: 'H₂SO₄(aq)', label: { si: 'තනුක H₂SO₄ අම්ලය', en: 'Dilute H₂SO₄' }, colorHex: '#e2e8f0' },
  { id: 'h2so4-conc', formula: 'conc. H₂SO₄', label: { si: 'සාන්ද්‍ර H₂SO₄ අම්ලය', en: 'Conc. H₂SO₄' }, colorHex: '#fef3c7' },
  { id: 'kscn', formula: 'KSCN(aq)', label: { si: 'පොටෑසියම් තයෝසයනේට්', en: 'Potassium Thiocyanate' }, colorHex: '#e2e8f0' },
  { id: 'nacl', formula: 'NaCl(aq)', label: { si: 'ක්ලෝරයිඩ් (Cl⁻)', en: 'Chloride (Cl⁻)' }, colorHex: '#e2e8f0' },
  { id: 'nabr', formula: 'NaBr(aq)', label: { si: 'බ්‍රෝමයිඩ් (Br⁻)', en: 'Bromide (Br⁻)' }, colorHex: '#fef9c3' },
  { id: 'ki', formula: 'KI(aq)', label: { si: 'අයඩයිඩ් (I⁻)', en: 'Potassium Iodide (I⁻)' }, colorHex: '#fef9c3' },
  { id: 'alkene', formula: 'C₂H₄ / Cyclohexene', label: { si: 'ඇල්කීනයක් (C=C)', en: 'Alkene (C=C)' }, colorHex: '#e2e8f0' },
  { id: 'aldehyde', formula: 'CH₃CHO', label: { si: 'ඇල්ඩිහයිඩය (R-CHO)', en: 'Aldehyde (R-CHO)' }, colorHex: '#e2e8f0' },
  { id: 'fecl3-neutral', formula: 'Neutral FeCl₃', label: { si: 'උදාසීන FeCl₃', en: 'Neutral FeCl₃' }, colorHex: '#f59e0b' },
  { id: 'i2-naoh', formula: 'I₂ / NaOH', label: { si: 'අයඩින් + NaOH', en: 'Iodine + NaOH' }, colorHex: '#92400e' },
  { id: 'water', formula: 'H₂O(l)', label: { si: 'ජලය (Phenolphthalein)', en: 'Water (+ Indicator)' }, colorHex: '#bae6fd' },
  { id: 'cuso4-b', formula: 'CuSO₄(aq)', label: { si: 'කොපර් සල්ෆේට් (Cu²⁺)', en: 'Copper(II) Sulphate' }, colorHex: '#0284c7' },
];

export const SYLLABUS_REACTIONS: SyllabusReactionSpec[] = [
  {
    id: 'cu-naoh-nh3',
    category: 'inorganic',
    unitBadges: ['VI'],
    title: {
      si: 'Cu²⁺(aq) + NH₃(aq) සංකීර්ණ සෑදීම',
      en: 'Cu²⁺(aq) + NH₃(aq) Precipitate & Deep-Blue Complex',
    },
    shortTitle: { si: 'Cu²⁺ + NH₃ (තද නිල්)', en: 'Cu²⁺ + NH₃ Complex' },
    reagentAId: 'cuso4',
    reagentBId: 'nh3-aq',
    defaultCondition: 'excess',
    equation: '[Cu(H₂O)₆]²⁺(aq) + 4NH₃(aq) ⇌ [Cu(NH₃)₄(H₂O)₂]²⁺(aq) + 4H₂O(l)',
    ionicEquation: 'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓ (pale blue) → [Cu(NH₃)₄]²⁺ (royal blue)',
    deltaHLabel: 'Ligand Exchange',
    initialColorHex: '#38bdf8',
    finalColorHex: '#1e3a8a',
    initialOpacity: 0.72,
    finalOpacity: 0.9,
    reagentBColorHex: '#e0f2fe',
    effect: 'color-shift',
    precipitateColorHex: '#60a5fa',
    tempRiseC: 2,
    observation: {
      si: 'පළමුව ලා නිල් Cu(OH)₂ අවක්ෂේපය සෑදී, අතිරික්ත NH₃ සමඟ දිය වී තද රාජකීය නිල් [Cu(NH₃)₄]²⁺ ද්‍රාවණයක් ලබා දෙයි.',
      en: 'A pale blue Cu(OH)₂ precipitate forms initially, then dissolves in excess NH₃ to give an intense deep royal-blue [Cu(NH₃)₄(H₂O)₂]²⁺ complex.',
    },
    explanation: {
      si: 'NH₃ අණු H₂O ලිගන්ඩ වලට වඩා ප්‍රබල ලිගන්ඩ වන බැවින් d-කාක්ෂික විභේදනය (Δo) වැඩි වී තද නිල් වර්ණය දිස්වේ.',
      en: 'Stronger NH₃ ligands substitute H₂O around Cu²⁺, shifting d-d electronic absorption and creating the deep royal-blue complex.',
    },
    examNotes: {
      si: 'A/L අකාබනික විශ්ලේෂණයේදී Cu²⁺ හඳුනාගැනීමේ ප්‍රධානම පරීක්ෂාවයි. NaOH සමඟ අවක්ෂේපය දිය නොවේ!',
      en: 'Key d-block identification test: Cu(OH)₂ dissolves in excess NH₃, whereas it stays insoluble in excess NaOH.',
    },
    voiceSummary: {
      si: 'කොපර් අයන ද්‍රාවණයට අතිරික්ත ඇමෝනියා එකතු කළ විට ලා නිල් අවක්ෂේපය දිය වී තද නිල් ටෙට්‍රාඇමීන්කොපර් සංකීර්ණය සෑදේ.',
      en: 'Adding excess ammonia to copper(II) sulphate converts the pale blue precipitate into a deep royal-blue tetraamminecopper(II) complex.',
    },
  },
  {
    id: 'fe-scn',
    category: 'inorganic',
    unitBadges: ['VI', 'IX'],
    title: {
      si: 'Fe³⁺ + SCN⁻ රුධිර රතු සංකීර්ණය',
      en: 'Fe³⁺(aq) + SCN⁻(aq) Blood-Red Equilibrium Complex',
    },
    shortTitle: { si: 'Fe³⁺ + KSCN (රුධිර රතු)', en: 'Fe³⁺ + KSCN' },
    reagentAId: 'fecl3',
    reagentBId: 'kscn',
    defaultCondition: 'room',
    equation: '[Fe(H₂O)₆]³⁺(aq) + SCN⁻(aq) ⇌ [Fe(H₂O)₅(SCN)]²⁺(aq) + H₂O(l)',
    ionicEquation: 'Fe³⁺(aq) + SCN⁻(aq) ⇌ [Fe(SCN)]²⁺(aq)',
    deltaHLabel: 'ΔH < 0 (Exothermic)',
    initialColorHex: '#f59e0b',
    finalColorHex: '#991b1b',
    initialOpacity: 0.72,
    finalOpacity: 0.94,
    reagentBColorHex: '#e2e8f0',
    effect: 'color-shift',
    tempRiseC: 1,
    observation: {
      si: 'ලා කහ-දුඹුරු Fe³⁺ ද්‍රාවණය ක්ෂණිකව තද රුධිර රතු (Blood-Red) පැහැයට හැරේ.',
      en: 'The pale amber Fe³⁺ solution turns deep blood-red immediately upon adding KSCN(aq).',
    },
    explanation: {
      si: 'තයෝසයනේට් (SCN⁻) ලිගන්ඩය Fe³⁺ හි H₂O අණුවක් ප්‍රතිස්ථාපනය කර අධික වර්ණ තීව්‍රතාවයකින් යුත් සංකීර්ණයක් සාදයි.',
      en: 'Thiocyanate replaces a coordinated water ligand, producing [Fe(H₂O)₅(SCN)]²⁺ with an intense ligand-to-metal charge-transfer band.',
    },
    examNotes: {
      si: 'Fe²⁺ අයන SCN⁻ සමඟ මෙම රුධිර රතු වර්ණය නොදෙයි. සමතුලිතතා නියම පරීක්ෂාවේදීද බහුලව යෙදේ.',
      en: 'Distinguishes Fe³⁺ from Fe²⁺ cleanly and serves as a classic Le Chatelier equilibrium system in Unit IX.',
    },
    voiceSummary: {
      si: 'ෆෙරික් අයන සමඟ පොටෑසියම් තයෝසයනේට් ප්‍රතික්‍රියා කළ විට තද රුධිර රතු පැහැති සංකීර්ණ අයනය සෑදේ.',
      en: 'Iron(III) ions react with potassium thiocyanate to form the striking blood-red penta-aqua thiocyanatoiron(III) complex.',
    },
  },
  {
    id: 'cl-agno3',
    category: 'inorganic',
    unitBadges: ['VI'],
    title: {
      si: 'Cl⁻ + AgNO₃ සුදු අවක්ෂේප පරීක්ෂාව',
      en: 'Chloride (Cl⁻) + AgNO₃(aq) White Curdy Precipitate',
    },
    shortTitle: { si: 'Cl⁻ + Ag⁺ (සුදු AgCl↓)', en: 'Cl⁻ + AgNO₃' },
    reagentAId: 'agno3',
    reagentBId: 'nacl',
    defaultCondition: 'room',
    equation: 'AgNO₃(aq) + NaCl(aq) → AgCl(s)↓ + NaNO₃(aq)',
    ionicEquation: 'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)↓ (soluble in dil. NH₃)',
    deltaHLabel: 'ΔH = −65.5 kJ mol⁻¹',
    initialColorHex: '#e2e8f0',
    finalColorHex: '#f8fafc',
    initialOpacity: 0.52,
    finalOpacity: 0.9,
    reagentBColorHex: '#e2e8f0',
    effect: 'precipitate',
    precipitateColorHex: '#ffffff',
    tempRiseC: 2,
    observation: {
      si: 'ඝන සුදු පැහැති කැටිති (White curdy) AgCl අවක්ෂේපය ක්ෂණිකව සෑදේ. තනුක NH₃ හි සම්පූර්ණයෙන් දිය වේ.',
      en: 'A dense white curdy precipitate of AgCl forms immediately and dissolves completely in dilute NH₃(aq).',
    },
    explanation: {
      si: 'AgCl හි ද්‍රාව්‍යතා ගුණිතය (Ksp = 1.8×10⁻¹⁰) ඉක්මවූ වහාම අවක්ෂේප වේ. NH₃ එක් කළ විට [Ag(NH₃)₂]⁺ සංකීර්ණය සාදා දිය වේ.',
      en: 'Low Ksp precipitates white AgCl; dilute ammonia forms the soluble linear complex ion [Ag(NH₃)₂]⁺.',
    },
    examNotes: {
      si: 'හැලයිඩ වෙන්කර හඳුනාගැනීම: AgCl තනුක NH₃ හි දියවේ; AgBr සාන්ද්‍ර NH₃ හි පමණක් දියවේ; AgI කිසිවක දිය නොවේ.',
      en: 'Remember solubility order in NH₃: AgCl (dilute NH₃) > AgBr (conc. NH₃ only) > AgI (insoluble).',
    },
    voiceSummary: {
      si: 'සිල්වර් නයිට්‍රේට් සමඟ ක්ලෝරයිඩ් අයන සුදු පැහැති AgCl අවක්ෂේපය සාදන අතර එය තනුක ඇමෝනියා වල දිය වේ.',
      en: 'Silver nitrate reacts with chloride ions to produce a white curdy AgCl precipitate that dissolves readily in dilute ammonia.',
    },
  },
  {
    id: 'br-agno3',
    category: 'inorganic',
    unitBadges: ['VI'],
    title: {
      si: 'Br⁻ + AgNO₃ ක්‍රීම් අවක්ෂේප පරීක්ෂාව',
      en: 'Bromide (Br⁻) + AgNO₃(aq) Cream Precipitate',
    },
    shortTitle: { si: 'Br⁻ + Ag⁺ (ක්‍රීම් AgBr↓)', en: 'Br⁻ + AgNO₃' },
    reagentAId: 'agno3',
    reagentBId: 'nabr',
    defaultCondition: 'room',
    equation: 'AgNO₃(aq) + NaBr(aq) → AgBr(s)↓ + NaNO₃(aq)',
    ionicEquation: 'Ag⁺(aq) + Br⁻(aq) → AgBr(s)↓ (soluble in conc. NH₃)',
    deltaHLabel: 'Ksp = 5.0×10⁻¹³',
    initialColorHex: '#e2e8f0',
    finalColorHex: '#fef3c7',
    initialOpacity: 0.52,
    finalOpacity: 0.9,
    reagentBColorHex: '#fef9c3',
    effect: 'precipitate',
    precipitateColorHex: '#fde68a',
    tempRiseC: 2,
    observation: {
      si: 'ලා කහ/ක්‍රීම් පැහැති (Cream) AgBr අවක්ෂේපය සෑදේ. සාන්ද්‍ර NH₃ හි පමණක් දිය වේ.',
      en: 'A cream-colored precipitate of AgBr forms; sparingly soluble in dilute NH₃ but dissolves in concentrated NH₃.',
    },
    explanation: {
      si: 'AgBr හි Ksp අගය AgCl ට වඩා අඩු බැවින් එය දිය කිරීමට වැඩි NH₃ සාන්ද්‍රණයක් අවශ්‍ය වේ.',
      en: 'Because AgBr has a smaller Ksp than AgCl, concentrated NH₃ is required to shift equilibrium toward [Ag(NH₃)₂]⁺.',
    },
    examNotes: {
      si: 'AgNO₃ පරීක්ෂාවට පෙර තනුක HNO₃ එක් කරන්නේ CO₃²⁻ වැනි අනෙකුත් අයන බාධා වැළැක්වීමටය.',
      en: 'Always acidify first with dilute HNO₃ before adding AgNO₃ to prevent Ag₂CO₃ interference.',
    },
    voiceSummary: {
      si: 'බ්‍රෝමයිඩ් අයන සිල්වර් නයිට්‍රේට් සමඟ ක්‍රීම් පැහැති AgBr අවක්ෂේපය ලබා දෙන අතර එය සාන්ද්‍ර ඇමෝනියා වල දිය වේ.',
      en: 'Bromide ions form a cream AgBr precipitate with silver nitrate, dissolving only when concentrated ammonia is added.',
    },
  },
  {
    id: 'i-agno3',
    category: 'inorganic',
    unitBadges: ['VI'],
    title: {
      si: 'I⁻ + AgNO₃ කහ අවක්ෂේප පරීක්ෂාව',
      en: 'Iodide (I⁻) + AgNO₃(aq) Pale Yellow Precipitate',
    },
    shortTitle: { si: 'I⁻ + Ag⁺ (කහ AgI↓)', en: 'I⁻ + AgNO₃' },
    reagentAId: 'agno3',
    reagentBId: 'ki',
    defaultCondition: 'room',
    equation: 'AgNO₃(aq) + KI(aq) → AgI(s)↓ + KNO₃(aq)',
    ionicEquation: 'Ag⁺(aq) + I⁻(aq) → AgI(s)↓ (insoluble in conc. NH₃)',
    deltaHLabel: 'Ksp = 8.3×10⁻¹⁷',
    initialColorHex: '#e2e8f0',
    finalColorHex: '#fef08a',
    initialOpacity: 0.52,
    finalOpacity: 0.92,
    reagentBColorHex: '#fef9c3',
    effect: 'precipitate',
    precipitateColorHex: '#facc15',
    tempRiseC: 2,
    observation: {
      si: 'ලා කහ පැහැති (Pale Yellow) AgI අවක්ෂේපය සෑදෙන අතර එය සාන්ද්‍ර NH₃ හි පවා දිය නොවේ.',
      en: 'A bright pale-yellow AgI precipitate forms immediately and remains completely insoluble even in concentrated NH₃.',
    },
    explanation: {
      si: 'AgI හි ඉතාම කුඩා Ksp අගය (8.3×10⁻¹⁷) සහ සහසංයුජ ලක්ෂණය නිසා NH₃ සමඟ සංකීර්ණ වී දිය නොවේ.',
      en: 'Extremely small Ksp and stronger covalent character prevent AgI from dissolving in concentrated aqueous ammonia.',
    },
    examNotes: {
      si: 'කහ අවක්ෂේපය සාන්ද්‍ර NH₃ වලද දිය නොවීම අයඩයිඩ් (I⁻) ස්ථිර කිරීමේ ලක්ෂණයයි.',
      en: 'Insolubility in concentrated ammonia confirms iodide (I⁻) definitively.',
    },
    voiceSummary: {
      si: 'අයඩයිඩ් අයන සමඟ කහ පැහැති AgI අවක්ෂේපය සෑදෙන අතර එය සාන්ද්‍ර ඇමෝනියා වලවත් දිය නොවේ.',
      en: 'Iodide ions yield a yellow AgI precipitate that stays completely insoluble even in concentrated ammonia.',
    },
  },
  {
    id: 'brown-ring',
    category: 'inorganic',
    unitBadges: ['VI'],
    title: {
      si: 'නයිට්‍රේට් (NO₃⁻) දුඹුරු වළලු පරීක්ෂාව',
      en: 'Nitrate (NO₃⁻) Brown Ring Confirmatory Test',
    },
    shortTitle: { si: 'NO₃⁻ දුඹුරු වළල්ල', en: 'Brown Ring Test' },
    reagentAId: 'feso4-no3',
    reagentBId: 'h2so4-conc',
    defaultCondition: 'room',
    equation: 'NO₃⁻ + 3Fe²⁺ + 4H⁺ → NO + 3Fe³⁺ + 2H₂O ; [Fe(H₂O)₆]²⁺ + NO → [Fe(H₂O)₅NO]²⁺',
    ionicEquation: '[Fe(H₂O)₅(NO)]²⁺ (Brown Ring at Acid/Aqueous Junction)',
    deltaHLabel: 'Interface Complex',
    initialColorHex: '#d9f99d',
    finalColorHex: '#bef264',
    initialOpacity: 0.72,
    finalOpacity: 0.78,
    reagentBColorHex: '#fef3c7',
    effect: 'brown-ring',
    tempRiseC: 4,
    observation: {
      si: 'පහළ සාන්ද්‍ර H₂SO₄ ස්තරය සහ ඉහළ ජලීය ස්තරය හමුවන ස්ථානයේ පැහැදිලි දුඹුරු වළල්ලක් (Brown Ring) දිස්වේ.',
      en: 'A crisp dark-brown ring of [Fe(H₂O)₅(NO)]²⁺ forms precisely at the boundary between dense conc. H₂SO₄ below and aqueous layer above.',
    },
    explanation: {
      si: 'සාන්ද්‍ර H₂SO₄ නලයේ බිත්තිය දිගේ සෙමින් වත් කළ විට NO₃⁻ අයන Fe²⁺ මගින් NO බවට ඔක්සිහරණය වී නයිට්‍රොසිල් යකඩ(II) සංකීර්ණ වළල්ල සාදයි.',
      en: 'Conc. H₂SO₄ sinks below the FeSO₄/NO₃⁻ layer; Fe²⁺ reduces NO₃⁻ to NO gas, which coordinates to remaining Fe²⁺ at the cool interface.',
    },
    examNotes: {
      si: 'නලය සෙලවීමෙන් හෝ රත් කිරීමෙන් දුඹුරු වළල්ල කැඩී අතුරුදහන් වේ! අලුතින් සෑදූ FeSO₄ භාවිතා කළ යුතුය.',
      en: 'Must pour conc. H₂SO₄ carefully down the inclined tube wall without shaking, using freshly prepared FeSO₄.',
    },
    voiceSummary: {
      si: 'නයිට්‍රේට් සහ නැවුම් FeSO₄ ද්‍රාවණයට සාන්ද්‍ර සල්ෆියුරික් අම්ලය බිත්තිය දිගේ එක් කළ විට ස්තර අතර දුඹුරු වළල්ල දිස්වේ.',
      en: 'Carefully layering concentrated sulphuric acid beneath nitrate and iron(II) sulphate produces the classic brown ring at the interface.',
    },
  },
  {
    id: 'co3-hcl',
    category: 'inorganic',
    unitBadges: ['VI'],
    title: {
      si: 'කාබනේට් (CO₃²⁻) + HCl → CO₂ හා හුණු දියර',
      en: 'Carbonate (CO₃²⁻) + Dilute HCl & Limewater Test',
    },
    shortTitle: { si: 'CO₃²⁻ + HCl (CO₂↑ කිරි)', en: 'CO₃²⁻ + HCl' },
    reagentAId: 'na2co3',
    reagentBId: 'hcl-dil',
    defaultCondition: 'room',
    equation: 'Na₂CO₃(aq) + 2HCl(aq) → 2NaCl(aq) + H₂O(l) + CO₂(g)↑',
    ionicEquation: 'CO₂(g) + Ca(OH)₂(aq) → CaCO₃(s)↓ (Milky White) + H₂O(l)',
    deltaHLabel: 'Gas Effervescence',
    initialColorHex: '#e2e8f0',
    finalColorHex: '#e2e8f0',
    initialOpacity: 0.55,
    finalOpacity: 0.55,
    reagentBColorHex: '#e2e8f0',
    effect: 'limewater-milk',
    gasColorHex: '#f8fafc',
    gasName: 'CO₂',
    tempRiseC: 3,
    observation: {
      si: 'වේගවත් CO₂ වායු බුබුළු පිටවී, පසෙක ඇති පැහැදිලි හුණු දියර (Ca(OH)₂) කිරි පැහැයට හැරේ!',
      en: 'Brisk effervescence of colorless CO₂ gas evolves and turns the connected clear limewater tube milky white.',
    },
    explanation: {
      si: 'CO₂ වායුව කැල්සියම් හයිඩ්‍රොක්සයිඩ් සමඟ ප්‍රතික්‍රියා කර අද්‍රාව්‍ය සුදු CaCO₃ සාදයි. අතිරික්ත CO₂ මගින් Ca(HCO₃)₂ සාදා නැවත පැහැදිලි වේ.',
      en: 'CO₂ precipitates insoluble white CaCO₃ in limewater; prolonged excess CO₂ converts it into soluble Ca(HCO₃)₂.',
    },
    examNotes: {
      si: 'CO₃²⁻ සහ SO₃²⁻ වෙන්කර ගැනීමට K₂Cr₂O₇/H⁺ භාවිතා කරයි (SO₂ කොළ පැහැය දෙයි; CO₂ නොදෙයි).',
      en: 'Both CO₂ and SO₂ turn limewater milky, so confirm absence of SO₂ using acidified K₂Cr₂O₇ paper.',
    },
    voiceSummary: {
      si: 'සෝඩියම් කාබනේට් වලට තනුක හයිඩ්‍රොක්ලෝරික් අම්ලය එක් කළ විට පිටවන කාබන් ඩයොක්සයිඩ් වායුව හුණු දියර කිරි පැහැ කරයි.',
      en: 'Adding dilute hydrochloric acid to sodium carbonate releases carbon dioxide bubbles that turn limewater milky white.',
    },
  },
  {
    id: 'nh4-naoh',
    category: 'inorganic',
    unitBadges: ['VI'],
    title: {
      si: 'ඇමෝනියම් (NH₄⁺) + NaOH + උණුසුම් කිරීම',
      en: 'Ammonium (NH₄⁺) + NaOH → NH₃ Gas & Litmus Test',
    },
    shortTitle: { si: 'NH₄⁺ + NaOH (NH₃↑)', en: 'NH₄⁺ + NaOH' },
    reagentAId: 'nh4cl',
    reagentBId: 'naoh-aq',
    defaultCondition: 'warm',
    equation: 'NH₄Cl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l) + NH₃(g)↑',
    ionicEquation: 'NH₄⁺(aq) + OH⁻(aq) → NH₃(g)↑ + H₂O(l)',
    deltaHLabel: 'Warm Required',
    initialColorHex: '#e2e8f0',
    finalColorHex: '#e0f2fe',
    initialOpacity: 0.55,
    finalOpacity: 0.6,
    reagentBColorHex: '#f1f5f9',
    effect: 'litmus-blue',
    gasColorHex: '#bae6fd',
    gasName: 'NH₃',
    tempRiseC: 35,
    observation: {
      si: 'තීව්‍ර ගන්ධයකින් යුත් NH₃ වායුව පිටවී නල මුව අසල ඇති තෙත් රතු ලිට්මස් කඩදාසිය නිල් පැහැයට හැරේ.',
      en: 'Pungent alkaline NH₃ gas evolves on warming and turns the moist red litmus strip at the mouth blue.',
    },
    explanation: {
      si: 'NH₄⁺ දුර්වල අම්ලය OH⁻ මගින් විප්‍රෝටෝනීකරණය වී NH₃ වායුව නිදහස් වන අතර එය ජලයේ දිය වී OH⁻ සාදයි.',
      en: 'Hydroxide deprotonates NH₄⁺ on warming to release gaseous ammonia, the only common alkaline gas in A/L analysis.',
    },
    examNotes: {
      si: 'සාන්ද්‍ර HCl ගැල්වූ වීදුරු කූරක් ළං කළ විට ඝන සුදු NH₄Cl දුමාරයක්ද සෑදේ.',
      en: 'Also forms dense white NH₄Cl fumes when exposed to a glass rod dipped in concentrated HCl.',
    },
    voiceSummary: {
      si: 'ඇමෝනියම් ලවණය සෝඩියම් හයිඩ්‍රොක්සයිඩ් සමඟ උණුසුම් කළ විට පිටවන ඇමෝනියා වායුව තෙත් රතු ලිට්මස් නිල් කරයි.',
      en: 'Warming an ammonium salt with sodium hydroxide releases ammonia gas, turning moist red litmus paper blue.',
    },
  },
  {
    id: 'alkene-br2',
    category: 'organic',
    unitBadges: ['VII'],
    title: {
      si: 'ඇල්කීනය (C=C) + බ්‍රෝමීන් ජලය (Br₂/H₂O)',
      en: 'Alkene (C=C) + Bromine Water Electrophilic Addition',
    },
    shortTitle: { si: 'C=C + Br₂ (වර්ණ විහරණය)', en: 'Alkene + Br₂(aq)' },
    reagentAId: 'br2-water',
    reagentBId: 'alkene',
    defaultCondition: 'room',
    equation: 'CH₂=CH₂ + Br₂(aq) → BrCH₂–CH₂Br (1,2-dibromoethane) + HOCH₂CH₂Br',
    ionicEquation: 'π-Bond Electrophilic Addition (Orange-Brown → Colorless)',
    deltaHLabel: 'ΔH = −110 kJ mol⁻¹',
    initialColorHex: '#ea580c',
    finalColorHex: '#e2e8f0',
    initialOpacity: 0.86,
    finalOpacity: 0.52,
    reagentBColorHex: '#e2e8f0',
    effect: 'color-shift',
    tempRiseC: 4,
    observation: {
      si: 'තැඹිලි-දුඹුරු බ්‍රෝමීන් ජලයේ වර්ණය ක්ෂණිකව නැති වී අවර්ණ ද්‍රාවණයක් බවට පත් වේ.',
      en: 'The orange-brown bromine water is rapidly decolorized to a clear colorless solution at room temperature.',
    },
    explanation: {
      si: 'ඇල්කීනයේ C=C ද්විත්ව බන්ධනයේ π ඉලෙක්ට්‍රෝන මතට Br₂ ඉලෙක්ට්‍රොෆිලික ආකලන ප්‍රතික්‍රියාව සිදු වේ (අඳුරේදී පවා සිදු වේ).',
      en: 'Electrophilic addition across the C=C π-bond consumes aqueous Br₂ without needing UV light (unlike alkanes).',
    },
    examNotes: {
      si: 'ඇල්කේන සමඟ අඳුරේදී ප්‍රතික්‍රියා නොවන බැවින් අසංතෘප්තතාව (C=C / C≡C) පරීක්ෂාවට යොදාගනී.',
      en: 'Classic unsaturation test: decolorizes instantly in the dark, distinguishing alkenes from alkanes.',
    },
    voiceSummary: {
      si: 'ඇල්කීනයකට බ්‍රෝමීන් ජලය එක් කළ විට ඉලෙක්ට්‍රොෆිලික ආකලනය නිසා තැඹිලි දුඹුරු වර්ණය ඉක්මනින් අවර්ණ වේ.',
      en: 'Adding bromine water to an alkene rapidly decolorizes the orange-brown solution via electrophilic addition.',
    },
  },
  {
    id: 'alkene-kmno4',
    category: 'organic',
    unitBadges: ['VII'],
    title: {
      si: 'ඇල්කීනය + බේයර් ප්‍රතිකාරකය (KMnO₄/OH⁻)',
      en: 'Alkene + Cold Alkaline KMnO₄ (Baeyer Test)',
    },
    shortTitle: { si: 'C=C + KMnO₄ (MnO₂↓)', en: 'Baeyer Test' },
    reagentAId: 'kmno4-alk',
    reagentBId: 'alkene',
    defaultCondition: 'room',
    equation: '3CH₂=CH₂ + 2KMnO₄ + 4H₂O → 3HOCH₂–CH₂OH + 2MnO₂(s)↓ + 2KOH',
    ionicEquation: 'Purple MnO₄⁻ → Brown MnO₂↓ + Diol',
    deltaHLabel: 'Syn-Dihydroxylation',
    initialColorHex: '#9333ea',
    finalColorHex: '#78350f',
    initialOpacity: 0.88,
    finalOpacity: 0.86,
    reagentBColorHex: '#e2e8f0',
    effect: 'precipitate',
    precipitateColorHex: '#78350f',
    tempRiseC: 3,
    observation: {
      si: 'තද දම් පැහැ KMnO₄ වර්ණය නැති වී තද දුඹුරු MnO₂ අවක්ෂේපයක් සෑදේ.',
      en: 'The deep purple KMnO₄ color discharges rapidly, depositing a dark-brown MnO₂ precipitate.',
    },
    explanation: {
      si: 'සීතල තනුක ක්ෂාරීය KMnO₄ මගින් ඇල්කීනය 1,2-ඩයෝලයක් (Glycol) බවට ඔක්සිකරණය කර Mn(VII) → Mn(IV) බවට ඔක්සිහරණය වේ.',
      en: 'Cold alkaline permanganate oxidizes the alkene to a vicinal diol while MnO₄⁻ reduces to insoluble brown MnO₂.',
    },
    examNotes: {
      si: 'ආම්ලික KMnO₄ සමඟ නම් අවර්ණ Mn²⁺ ද්‍රාවණයක් ලැබේ; ක්ෂාරීය මාධ්‍යයේදී දුඹුරු MnO₂ අවක්ෂේපය ලැබේ.',
      en: 'Note medium difference: alkaline KMnO₄ gives brown MnO₂↓, whereas acidic KMnO₄ gives pale/colorless Mn²⁺(aq).',
    },
    voiceSummary: {
      si: 'ඇල්කීනය බේයර් ප්‍රතිකාරකය සමඟ ප්‍රතික්‍රියා කළ විට දම් පැහැය නැති වී දුඹුරු MnO₂ අවක්ෂේපය සෑදේ.',
      en: 'In Baeyers test, purple alkaline potassium permanganate decolorizes and deposits brown manganese dioxide precipitate.',
    },
  },
  {
    id: 'aldehyde-tollens',
    category: 'organic',
    unitBadges: ['VII'],
    title: {
      si: 'ඇල්ඩිහයිඩය + ටොලන්ස් ප්‍රතිකාරකය (රිදී කැඩපත)',
      en: 'Aldehyde + Tollens Reagent (Silver Mirror Test)',
    },
    shortTitle: { si: 'R-CHO + Tollens (රිදී කැඩපත)', en: 'Silver Mirror Test' },
    reagentAId: 'tollens',
    reagentBId: 'aldehyde',
    defaultCondition: 'warm',
    equation: 'CH₃CHO + 2[Ag(NH₃)₂]⁺ + 3OH⁻ → CH₃COO⁻ + 2Ag(s)↓ + 4NH₃ + 2H₂O',
    ionicEquation: 'Ag⁺ → Ag⁰(s) Metallic Mirror Coating',
    deltaHLabel: 'Warm Bath ~60°C',
    initialColorHex: '#e2e8f0',
    finalColorHex: '#cbd5e1',
    initialOpacity: 0.55,
    finalOpacity: 0.9,
    reagentBColorHex: '#e2e8f0',
    effect: 'silver-mirror',
    tempRiseC: 35,
    observation: {
      si: 'උණු ජල තාපකයේ රත් කළ විට වීදුරු බඳුනේ ඇතුළත බිත්තිය මත දිලිසෙන ලෝහමය රිදී කැඩපතක් (Silver Mirror) තැන්පත් වේ!',
      en: 'On gentle warming, a gleaming metallic silver mirror coats the inner glass wall of the reaction vessel.',
    },
    explanation: {
      si: 'ඇල්ඩිහයිඩ මෘදු ඔක්සිකාරකයක් වන [Ag(NH₃)₂]⁺ සමඟ කාබොක්සිලේට් අයනය බවට ඔක්සිකරණය වී Ag⁺ අයන Ag⁰ ලෝහයට ඔක්සිහරණය වේ.',
      en: 'Aldehydes reduce diamminesilver(I) ions to metallic silver while oxidizing to carboxylate; ketones do not react.',
    },
    examNotes: {
      si: 'ඇල්ඩිහයිඩ (R-CHO) සහ කීටෝන (R-CO-R) වෙන්කර හඳුනාගැනීමේ ප්‍රධානම විභාග පරීක්ෂාවයි.',
      en: 'Classic test distinguishing aldehydes (positive silver mirror) from ketones (negative).',
    },
    voiceSummary: {
      si: 'ඇල්ඩිහයිඩයක් ටොලන්ස් ප්‍රතිකාරකය සමඟ උණුසුම් කළ විට වීදුරු බිත්තිය මත දිලිසෙන රිදී කැඩපතක් සෑදේ.',
      en: 'Warming an aldehyde with Tollens reagent reduces silver ions into a bright metallic silver mirror on the glass.',
    },
  },
  {
    id: 'aldehyde-fehling',
    category: 'organic',
    unitBadges: ['VII'],
    title: {
      si: 'ඇල්ඩිහයිඩය + ෆේලිං ද්‍රාවණය (ගඩොල් රතු)',
      en: 'Aldehyde + Fehling Solution (Brick-Red Cu₂O)',
    },
    shortTitle: { si: 'R-CHO + Fehling (Cu₂O↓)', en: 'Fehlings Test' },
    reagentAId: 'fehlings',
    reagentBId: 'aldehyde',
    defaultCondition: 'warm',
    equation: 'RCHO + 2Cu²⁺ + 5OH⁻ → RCOO⁻ + Cu₂O(s)↓ + 3H₂O',
    ionicEquation: 'Deep Blue Cu²⁺ → Brick-Red Cu₂O(s)↓',
    deltaHLabel: 'Warm Bath ~70°C',
    initialColorHex: '#1d4ed8',
    finalColorHex: '#9a3412',
    initialOpacity: 0.85,
    finalOpacity: 0.92,
    reagentBColorHex: '#e2e8f0',
    effect: 'precipitate',
    precipitateColorHex: '#dc2626',
    tempRiseC: 40,
    observation: {
      si: 'තද නිල් පැහැති ෆේලිං ද්‍රාවණය ගඩොල් රතු (Brick-Red) Cu₂O අවක්ෂේපයක් සාදමින් වෙනස් වේ.',
      en: 'The deep blue Fehling complex fades and deposits a dense brick-red Cu₂O precipitate on heating.',
    },
    explanation: {
      si: 'ඇල්ඩිහයිඩය Cu(II) සංකීර්ණය Cu(I) ඔක්සයිඩය (Cu₂O) දක්වා ඔක්සිහරණය කරයි.',
      en: 'Aliphatic aldehydes reduce Cu²⁺ tartrate complex to insoluble red copper(I) oxide, Cu₂O.',
    },
    examNotes: {
      si: 'ඇලිෆැටික ඇල්ඩිහයිඩ ෆේලිං පරීක්ෂාව දෙන නමුත් ඇරෝමැටික බෙන්සැල්ඩිහයිඩ් ඉතා සෙමින් හෝ ප්‍රතික්‍රියා නොදක්වයි.',
      en: 'Aliphatic aldehydes give a clear brick-red precipitate; benzaldehyde does not react appreciably with Fehlings.',
    },
    voiceSummary: {
      si: 'ඇල්ඩිහයිඩයක් ෆේලිං ද්‍රාවණය සමඟ රත් කළ විට ගඩොල් රතු පැහැති කොපර් ඔක්සයිඩ් අවක්ෂේපය ලැබේ.',
      en: 'Heating an aliphatic aldehyde with Fehlings solution produces a brick-red copper(I) oxide precipitate.',
    },
  },
  {
    id: 'iodoform-test',
    category: 'organic',
    unitBadges: ['VII'],
    title: {
      si: 'එතනෝල් / මෙතිල් කීටෝන අයඩෆෝම් පරීක්ෂාව',
      en: 'Ethanol / CH₃CO– Group + I₂/NaOH (Iodoform Test)',
    },
    shortTitle: { si: 'Iodoform (කහ CHI₃↓)', en: 'Iodoform Test' },
    reagentAId: 'ethanol',
    reagentBId: 'i2-naoh',
    defaultCondition: 'warm',
    equation: 'CH₃CH₂OH + 4I₂ + 6NaOH → CHI₃(s)↓ + HCOONa + 5NaI + 5H₂O',
    ionicEquation: 'CH₃CO– / CH₃CH(OH)– + I₂/OH⁻ → CHI₃(s)↓ (Yellow Crystals)',
    deltaHLabel: 'Warm ~50°C',
    initialColorHex: '#fef08a',
    finalColorHex: '#fef08a',
    initialOpacity: 0.65,
    finalOpacity: 0.92,
    reagentBColorHex: '#92400e',
    effect: 'precipitate',
    precipitateColorHex: '#eab308',
    tempRiseC: 25,
    observation: {
      si: 'විශේෂ විෂබීජ නාශක ගන්ධයකින් යුත් ලා කහ පැහැති අයඩෆෝම් (CHI₃) ස්ඵටික අවක්ෂේපය සෑදේ.',
      en: 'A bright pale-yellow crystalline precipitate of triiodomethane (CHI₃) with an antiseptic odor separates out.',
    },
    explanation: {
      si: 'CH₃CO– හෝ CH₃CH(OH)– කාණ්ඩය අඩංගු සංයෝග ක්ෂාරීය I₂ මගින් ඔක්සිකරණය වී CHI₃ අවක්ෂේපය ලබා දෙයි.',
      en: 'The methyl group adjacent to C=O or CH(OH) undergoes exhaustive α-iodination and haloform cleavage into yellow CHI₃.',
    },
    examNotes: {
      si: 'එතනෝල්, ප්‍රොපනෝන් (Acetone) සහ එතනැල් (Acetaldehyde) ධන අයඩෆෝම් පරීක්ෂාව ලබා දේ; මෙතනෝල් නොදේ.',
      en: 'Ethanol is the only primary alcohol giving a positive iodoform test; methanol does not.',
    },
    voiceSummary: {
      si: 'එතනෝල් අයඩින් සහ සෝඩියම් හයිඩ්‍රොක්සයිඩ් සමඟ උණුසුම් කළ විට කහ පැහැති අයඩෆෝම් අවක්ෂේපය සෑදේ.',
      en: 'Warming ethanol with iodine and sodium hydroxide produces pale-yellow iodoform crystals.',
    },
  },
  {
    id: 'phenol-fecl3',
    category: 'organic',
    unitBadges: ['VII'],
    title: {
      si: 'ෆීනෝල් (C₆H₅OH) + උදාසීන FeCl₃ පරීක්ෂාව',
      en: 'Phenol + Neutral FeCl₃(aq) Violet Complex Test',
    },
    shortTitle: { si: 'ෆීනෝල් + FeCl₃ (දම් පැහැය)', en: 'Phenol + FeCl₃' },
    reagentAId: 'phenol',
    reagentBId: 'fecl3-neutral',
    defaultCondition: 'room',
    equation: '6C₆H₅OH + FeCl₃(aq) → H₃[Fe(OC₆H₅)₆](aq) + 3HCl(aq)',
    ionicEquation: 'Fe³⁺ + 6C₆H₅OH → [Fe(OC₆H₅)₆]³⁻ (Intense Violet) + 6H⁺',
    deltaHLabel: 'Phenoxide Coordination',
    initialColorHex: '#f8fafc',
    finalColorHex: '#7e22ce',
    initialOpacity: 0.56,
    finalOpacity: 0.9,
    reagentBColorHex: '#f59e0b',
    effect: 'color-shift',
    tempRiseC: 1,
    observation: {
      si: 'අවර්ණ ෆීනෝල් ද්‍රාවණයට උදාසීන FeCl₃ බිංදු කිහිපයක් එක් කළ වහාම තද දම් (Violet) වර්ණයක් දිස්වේ.',
      en: 'Adding neutral FeCl₃ immediately produces a rich intense violet coloration.',
    },
    explanation: {
      si: 'ෆීනොක්සයිඩ් (C₆H₅O⁻) අයන Fe³⁺ සමඟ සංගත වී ආරෝපණ හුවමාරු සංකීර්ණයක් සෑදීමෙන් දම් පැහැය ඇති වේ.',
      en: 'Phenoxide oxygens coordinate to Fe³⁺, generating a violet charge-transfer coordination complex.',
    },
    examNotes: {
      si: 'ඇල්කොහොල (එතනෝල්) සහ කාබොක්සිලික් අම්ල උදාසීන FeCl₃ සමඟ මෙම දම් පැහැය නොදෙයි.',
      en: 'Distinguishes phenols directly from aliphatic alcohols like ethanol.',
    },
    voiceSummary: {
      si: 'ෆීනෝල් ද්‍රාවණය උදාසීන ෆෙරික් ක්ලෝරයිඩ් සමඟ තද දම් පැහැති සංකීර්ණයක් සාදයි.',
      en: 'Aqueous phenol forms an intense violet complex immediately upon adding neutral iron(III) chloride.',
    },
  },
  {
    id: 'pb-ki-golden',
    category: 'physical-redox',
    unitBadges: ['III', 'VI'],
    title: {
      si: 'Pb(NO₃)₂ + KI රන්වන් වැස්ස (Golden Rain)',
      en: 'Pb(NO₃)₂ + KI Golden Yellow PbI₂ Precipitation',
    },
    shortTitle: { si: 'Pb²⁺ + KI (රන්වන් PbI₂↓)', en: 'Pb²⁺ + KI Golden' },
    reagentAId: 'pbno3',
    reagentBId: 'ki',
    defaultCondition: 'room',
    equation: 'Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s)↓ + 2KNO₃(aq)',
    ionicEquation: 'Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s)↓ (Golden Yellow Flakes)',
    deltaHLabel: 'Ksp = 9.8×10⁻⁹',
    initialColorHex: '#e2e8f0',
    finalColorHex: '#fef08a',
    initialOpacity: 0.52,
    finalOpacity: 0.9,
    reagentBColorHex: '#fef9c3',
    effect: 'precipitate',
    precipitateColorHex: '#facc15',
    tempRiseC: 2,
    observation: {
      si: 'ද්‍රාවණ දෙක මිශ්‍ර කළ වහාම දිලිසෙන රන්වන් කහ පැහැති PbI₂ අවක්ෂේප ස්ඵටික පතුලට බැස යයි!',
      en: 'Instant dazzling golden-yellow PbI₂ flakes crystallize throughout the flask and settle toward the base.',
    },
    explanation: {
      si: 'Pb²⁺ සහ I⁻ අතර ද්විත්ව විස්ථාපන ප්‍රතික්‍රියාවෙන් අඩු ද්‍රාව්‍යතාවක් ඇති PbI₂ සෑදේ (උණු ජලයේ දිය වී සිසිල් කළ විට රන්වන් ස්ඵටික වැස්සක් සේ බැස යයි).',
      en: 'Double-displacement exceeds PbI₂ Ksp; recrystallizing from hot water produces shimmering golden spangles.',
    },
    examNotes: {
      si: 'අයඩයිඩ් හඳුනාගැනීමට සහ ස්ටොයිකියෝමිතික අවක්ෂේප ගණනය කිරීම් සඳහා වැදගත් වේ.',
      en: 'Classic stoichiometry & solubility-product demonstration in A/L Chemistry.',
    },
    voiceSummary: {
      si: 'ලෙඩ් නයිට්‍රේට් සහ පොටෑසියම් අයඩයිඩ් මිශ්‍ර කළ විට දිලිසෙන රන්වන් කහ පැහැති ලෙඩ් අයඩයිඩ් අවක්ෂේපය සෑදේ.',
      en: 'Mixing lead(II) nitrate and potassium iodide yields brilliant golden-yellow crystals of lead(II) iodide.',
    },
  },
  {
    id: 'chromate-acid',
    category: 'physical-redox',
    unitBadges: ['VI', 'IX'],
    title: {
      si: 'ක්‍රෝමේට් ↔ ඩයික්‍රෝමේට් සමතුලිතතාව',
      en: 'Chromate (Yellow) ⇌ Dichromate (Orange) Equilibrium',
    },
    shortTitle: { si: 'CrO₄²⁻ ↔ Cr₂O₇²⁻ (කහ→තැඹිලි)', en: 'CrO₄²⁻ ↔ Cr₂O₇²⁻' },
    reagentAId: 'k2cro4',
    reagentBId: 'h2so4-dil',
    defaultCondition: 'room',
    equation: '2CrO₄²⁻(aq) + 2H⁺(aq) ⇌ Cr₂O₇²⁻(aq) + H₂O(l)',
    ionicEquation: 'Yellow CrO₄²⁻ + Acid → Orange Cr₂O₇²⁻ (Reversed by OH⁻)',
    deltaHLabel: 'pH-Driven Equilibrium',
    initialColorHex: '#facc15',
    finalColorHex: '#ea580c',
    initialOpacity: 0.85,
    finalOpacity: 0.9,
    reagentBColorHex: '#e2e8f0',
    effect: 'color-shift',
    tempRiseC: 2,
    observation: {
      si: 'තනුක H₂SO₄ අම්ලය එක් කළ විට දීප්තිමත් කහ CrO₄²⁻ ද්‍රාවණය තද තැඹිලි Cr₂O₇²⁻ පැහැයට මාරු වේ.',
      en: 'Bright yellow chromate shifts cleanly to vivid orange dichromate upon acidification with dilute H₂SO₄.',
    },
    explanation: {
      si: 'ලේ ෂැටලියේ නියමය අනුව H⁺ සාන්ද්‍රණය වැඩි කිරීමේදී ඉදිරි ප්‍රතික්‍රියාව වේගවත් වී තැඹිලි ඩයික්‍රෝමේට් අයන සෑදේ.',
      en: 'Adding H⁺ pushes the equilibrium forward toward Cr₂O₇²⁻; adding OH⁻ neutralizes H⁺ and restores yellow CrO₄²⁻.',
    },
    examNotes: {
      si: 'වැදගත්: Cr(VI) හි ඔක්සිකරණ අංකය (+6) දෙපසම නොවෙනස්ව පවතී — මෙය රෙඩොක්ස් ප්‍රතික්‍රියාවක් නොවේ!',
      en: 'Crucial exam point: oxidation state of Cr stays +6 on both sides, so this is an acid-base condensation equilibrium, not redox.',
    },
    voiceSummary: {
      si: 'කහ පැහැති ක්‍රෝමේට් ද්‍රාවණයට අම්ල එක් කළ විට ලේ ෂැටලියේ නියමය අනුව තැඹිලි පැහැති ඩයික්‍රෝමේට් බවට හැරේ.',
      en: 'Acidifying yellow potassium chromate shifts equilibrium forward, turning the solution bright orange dichromate.',
    },
  },
  {
    id: 'thiosulphate-acid',
    category: 'physical-redox',
    unitBadges: ['VIII'],
    title: {
      si: 'Na₂S₂O₃ + HCl සල්ෆර් අවක්ෂේප චාලකය',
      en: 'Na₂S₂O₃ + HCl Colloidal Sulphur Kinetics',
    },
    shortTitle: { si: 'S₂O₃²⁻ + HCl (සල්ෆර් වලා)', en: 'Thiosulphate + HCl' },
    reagentAId: 'na2s2o3',
    reagentBId: 'hcl-dil',
    defaultCondition: 'room',
    equation: 'Na₂S₂O₃(aq) + 2HCl(aq) → 2NaCl(aq) + H₂O(l) + SO₂(g)↑ + S(s)↓',
    ionicEquation: 'S₂O₃²⁻(aq) + 2H⁺(aq) → S(colloid)↓ + SO₂(g)↑ + H₂O(l)',
    deltaHLabel: 'Disproportionation',
    initialColorHex: '#e2e8f0',
    finalColorHex: '#fef08a',
    initialOpacity: 0.45,
    finalOpacity: 0.96,
    reagentBColorHex: '#e2e8f0',
    effect: 'colloid-turbidity',
    precipitateColorHex: '#fef08a',
    gasColorHex: '#e2e8f0',
    gasName: 'SO₂',
    tempRiseC: 2,
    observation: {
      si: 'පැහැදිලි ද්‍රාවණය ක්‍රමයෙන් ඝන ලා කහ පැහැති කොලොයිඩ සල්ෆර් අවක්ෂේපයකින් අඳුරු (Turbid) වේ.',
      en: 'The clear solution turns progressively opaque pale-yellow as colloidal sulphur forms, obscuring the cross underneath.',
    },
    explanation: {
      si: 'තයෝසල්ෆේට් (+2) ආම්ලික මාධ්‍යයේදී සල්ෆර් (0) සහ SO₂ (+4) බවට අසමමුහුර්තකරණය (Disproportionation) වේ.',
      en: 'Acid-catalyzed disproportionation produces fine suspended sulphur particles at a rate proportional to temperature and [S₂O₃²⁻].',
    },
    examNotes: {
      si: 'ප්‍රතික්‍රියා ශීඝ්‍රතාව (1/t) සාන්ද්‍රණය හා උෂ්ණත්වය මත රඳා පවතින ආකාරය පෙන්වන ප්‍රධාන Unit VIII ප්‍රායෝගිකයයි.',
      en: 'Rate = 1/time taken to obscure the black cross beneath the conical flask.',
    },
    voiceSummary: {
      si: 'සෝඩියම් තයෝසල්ෆේට් අම්ලය සමඟ ප්‍රතික්‍රියා කළ විට කොලොයිඩ සල්ෆර් සෑදී ද්‍රාවණය කහ පැහැයෙන් අපැහැදිලි වේ.',
      en: 'Sodium thiosulphate reacts with dilute hydrochloric acid to form cloudy pale-yellow colloidal sulphur.',
    },
  },
  {
    id: 'na-water',
    category: 'electro-metals',
    unitBadges: ['VI'],
    title: {
      si: 'සෝඩියම් (Na) + සීතල ජලය (ක්ෂාරීය H₂↑)',
      en: 'Sodium Metal (Na) + Cold Water (Flame & H₂↑)',
    },
    shortTitle: { si: 'Na(s) + H₂O (දැල්ල + H₂↑)', en: 'Na + Water' },
    reagentAId: 'na-metal',
    reagentBId: 'water',
    defaultCondition: 'room',
    equation: '2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂(g)↑',
    ionicEquation: '2Na(s) + 2H₂O(l) → 2Na⁺ + 2OH⁻(alkaline pink) + H₂↑',
    deltaHLabel: 'ΔH = −368 kJ mol⁻¹',
    initialColorHex: '#bae6fd',
    finalColorHex: '#f472b6',
    initialOpacity: 0.68,
    finalOpacity: 0.82,
    reagentBColorHex: '#bae6fd',
    effect: 'sodium-flame',
    gasColorHex: '#f8fafc',
    gasName: 'H₂',
    tempRiseC: 28,
    observation: {
      si: 'සෝඩියම් කැබැල්ල රිදී ගෝලයක් සේ දිය වී ජලය මත වේගයෙන් චලනය වෙමින් H₂ වායුව සහ රන්වන් කහ දැල්ලක් නිකුත් කරයි. ද්‍රාවණය රෝස පැහැ (NaOH) වේ!',
      en: 'Sodium melts into a silvery sphere, darts across the water fizzing H₂ gas with a golden-yellow flame, turning phenolphthalein pink!',
    },
    explanation: {
      si: 'ප්‍රබල තාපදායක ප්‍රතික්‍රියාව නිසා Na දිය වී H₂ වායුව දැල්වේ. සෑදෙන NaOH ප්‍රබල ක්ෂාරයකි.',
      en: 'Rapid electron loss from Group 1 Na releases enough heat to melt the metal and ignite evolving H₂; OH⁻ turns indicator pink.',
    },
    examNotes: {
      si: 'Group 1 ප්‍රතික්‍රියාශීලීතාව පහළට වැඩි වේ: Li < Na < K (K දම් පැහැ දැල්ලක් දෙයි).',
      en: 'Reactivity increases down Group 1 as first ionization energy decreases: Li < Na < K.',
    },
    voiceSummary: {
      si: 'සෝඩියම් ජලය මත දිය වී වේගයෙන් හයිඩ්‍රජන් වායුව සහ රන්වන් දැල්ල පිට කරමින් රෝස පැහැති ක්ෂාරීය ද්‍රාවණයක් සාදයි.',
      en: 'Sodium melts on cold water, fizzes vigorously releasing hydrogen with a golden flame, and turns the solution pink.',
    },
  },
  {
    id: 'ca-water',
    category: 'electro-metals',
    unitBadges: ['VI'],
    title: {
      si: 'කැල්සියම් (Ca) + ජලය (Ca(OH)₂ අවක්ෂේපය)',
      en: 'Calcium Metal (Ca) + Water (Steady H₂ & Milky Ca(OH)₂)',
    },
    shortTitle: { si: 'Ca(s) + H₂O (H₂↑ + සුදු)', en: 'Ca + Water' },
    reagentAId: 'ca-metal',
    reagentBId: 'water',
    defaultCondition: 'room',
    equation: 'Ca(s) + 2H₂O(l) → Ca(OH)₂(aq/s)↓ + H₂(g)↑',
    ionicEquation: 'Ca(s) + 2H₂O(l) → Ca²⁺ + 2OH⁻ + H₂(g)↑',
    deltaHLabel: 'ΔH < 0 (Exothermic)',
    initialColorHex: '#bae6fd',
    finalColorHex: '#f1f5f9',
    initialOpacity: 0.68,
    finalOpacity: 0.9,
    reagentBColorHex: '#bae6fd',
    effect: 'gas-bubbles',
    precipitateColorHex: '#ffffff',
    gasColorHex: '#f8fafc',
    gasName: 'H₂',
    tempRiseC: 15,
    observation: {
      si: 'කැල්සියම් ජලයේ ගිලී ක්‍රමවත්ව H₂ බුබුළු පිට කරන අතර සුදු පැහැ Ca(OH)₂ අවක්ෂේපයක් සාදා ද්‍රාවණය කිරි පැහැ කරයි.',
      en: 'Calcium sinks and steadily evolves H₂ bubbles while forming sparingly soluble white Ca(OH)₂ turbidity.',
    },
    explanation: {
      si: 'Group 2 හි Ca ජලය සමඟ Mg වලට වඩා වේගවත් නමුත් Na තරම් ප්‍රචණ්ඩ නොවේ.',
      en: 'Ca(OH)₂ has limited solubility in water, producing milky white suspension alongside steady H₂ evolution.',
    },
    examNotes: {
      si: 'Mg සීතල ජලය සමඟ ඉතා සෙමින් ප්‍රතික්‍රියා කරන නමුත් හුමාලය (Steam) සමඟ දීප්තිමත් සුදු MgO සාදයි.',
      en: 'Group 2 hydroxides increase in solubility down the group: Mg(OH)₂ < Ca(OH)₂ < Ba(OH)₂.',
    },
    voiceSummary: {
      si: 'කැල්සියම් ජලයේ ගිලී හයිඩ්‍රජන් වායු බුබුළු පිට කරමින් සුදු පැහැති කැල්සියම් හයිඩ්‍රොක්සයිඩ් සාදයි.',
      en: 'Calcium sinks in water, releasing steady hydrogen gas bubbles and turning the water milky with calcium hydroxide.',
    },
  },
  {
    id: 'zn-cuso4',
    category: 'electro-metals',
    unitBadges: ['V', 'X'],
    title: {
      si: 'සින්ක් (Zn) + CuSO₄(aq) ලෝහ විස්ථාපනය',
      en: 'Zinc + CuSO₄(aq) Exothermic Metal Displacement',
    },
    shortTitle: { si: 'Zn + CuSO₄ (Cu⁰↓ + ΔT)', en: 'Zn + CuSO₄' },
    reagentAId: 'zn-metal',
    reagentBId: 'cuso4-b',
    defaultCondition: 'room',
    equation: 'Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)↓',
    ionicEquation: 'Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)↓  (E°cell = +1.10 V)',
    deltaHLabel: 'ΔH = −217 kJ mol⁻¹',
    initialColorHex: '#0284c7',
    finalColorHex: '#bae6fd',
    initialOpacity: 0.85,
    finalOpacity: 0.45,
    reagentBColorHex: '#0284c7',
    effect: 'copper-deposit',
    precipitateColorHex: '#b45309',
    tempRiseC: 18,
    observation: {
      si: 'නිල් පැහැ CuSO₄ ද්‍රාවණය අවර්ණ වන අතර, රතු-දුඹුරු Cu ලෝහය තැන්පත් වී උෂ්ණත්වය ඉහළ යයි.',
      en: 'Blue Cu²⁺ color fades steadily as reddish-brown metallic copper deposits and temperature rises significantly.',
    },
    explanation: {
      si: 'E°(Zn²⁺/Zn) = −0.76 V සහ E°(Cu²⁺/Cu) = +0.34 V බැවින් Zn මගින් Cu²⁺ ස්වයංසිද්ධව විස්ථාපනය කරයි.',
      en: 'Because zinc has a more negative standard electrode potential than copper, Zn reduces Cu²⁺ exothermically.',
    },
    examNotes: {
      si: 'Unit V තාප රසායනයේදී ΔH විස්ථාපනය මැනීමට සහ Unit X ඩැනියෙල් කෝෂය තේරුම් ගැනීමට මෙම ප්‍රතික්‍රියාව පදනම වේ.',
      en: 'Foundation reaction for both Unit V calorimetry (ΔH displacement) and Unit X Daniell cell (E° = +1.10 V).',
    },
    voiceSummary: {
      si: 'සින්ක් කැබලි කොපර් සල්ෆේට් වලට දැමූ විට නිල් වර්ණය අඩු වී රතු දුඹුරු තඹ ලෝහය තැන්පත් වෙමින් තාපය පිට වේ.',
      en: 'Zinc displaces copper from blue copper(II) sulphate, fading the blue color while depositing reddish-brown copper and releasing heat.',
    },
  },
  ...REACTIONS_EXTENDED_1,
  ...REACTIONS_EXTENDED_2,
];

const countByCat = (cat: ReactionCategory) =>
  SYLLABUS_REACTIONS.filter((r) => r.category === cat).length;

export const REACTION_CATEGORIES: Array<{ id: ReactionCategory | 'all'; label: LocalizedText }> = [
  {
    id: 'all',
    label: {
      si: `සියල්ල (${SYLLABUS_REACTIONS.length})`,
      en: `All (${SYLLABUS_REACTIONS.length})`,
    },
  },
  {
    id: 'inorganic',
    label: {
      si: `අකාබනික (${countByCat('inorganic')})`,
      en: `Inorganic (${countByCat('inorganic')})`,
    },
  },
  {
    id: 'organic',
    label: {
      si: `කාබනික (${countByCat('organic')})`,
      en: `Organic (${countByCat('organic')})`,
    },
  },
  {
    id: 'physical-redox',
    label: {
      si: `රෙඩොක්ස්/චාලක (${countByCat('physical-redox')})`,
      en: `Redox/Kinetics (${countByCat('physical-redox')})`,
    },
  },
  {
    id: 'electro-metals',
    label: {
      si: `ලෝහ/විද්‍යුත් (${countByCat('electro-metals')})`,
      en: `Metals (${countByCat('electro-metals')})`,
    },
  },
];

// Additional custom-mix pairs beyond the featured preset cards
const EXTRA_CUSTOM_REACTIONS: Record<string, SyllabusReactionSpec> = {
  'cuso4|naoh-aq': {
    id: 'custom-cu-naoh',
    category: 'inorganic',
    unitBadges: ['VI'],
    title: { si: 'Cu²⁺ + NaOH(aq) ලා නිල් අවක්ෂේපය', en: 'Cu²⁺ + NaOH(aq) Pale Blue Precipitate' },
    shortTitle: { si: 'Cu²⁺ + NaOH', en: 'Cu²⁺ + NaOH' },
    reagentAId: 'cuso4',
    reagentBId: 'naoh-aq',
    defaultCondition: 'room',
    equation: 'CuSO₄(aq) + 2NaOH(aq) → Cu(OH)₂(s)↓ + Na₂SO₄(aq)',
    ionicEquation: 'Cu²⁺(aq) + 2OH⁻(aq) → Cu(OH)₂(s)↓ (Insoluble in excess NaOH)',
    deltaHLabel: 'Precipitation',
    initialColorHex: '#38bdf8',
    finalColorHex: '#60a5fa',
    initialOpacity: 0.72,
    finalOpacity: 0.9,
    reagentBColorHex: '#f1f5f9',
    effect: 'precipitate',
    precipitateColorHex: '#38bdf8',
    tempRiseC: 2,
    observation: {
      si: 'ජෙලිමය ලා නිල් Cu(OH)₂ අවක්ෂේපය සෑදෙන අතර අතිරික්ත NaOH වලදී දිය නොවේ.',
      en: 'A gelatinous pale-blue Cu(OH)₂ precipitate forms and does NOT dissolve in excess NaOH.',
    },
    explanation: {
      si: 'Cu(OH)₂ ඇම්ෆොටෙරික් නොවන බැවින් අතිරික්ත OH⁻ සමඟ දිය නොවේ.',
      en: 'Unlike Al(OH)₃ or Zn(OH)₂, Cu(OH)₂ is not amphoteric so excess NaOH does not redissolve it.',
    },
    examNotes: {
      si: 'Cu(OH)₂ උණුසුම් කළ විට කළු පැහැ CuO අවක්ෂේපය බවට විජලනය වේ.',
      en: 'Heating Cu(OH)₂ dehydrates it into black CuO precipitate.',
    },
    voiceSummary: {
      si: 'කොපර් සල්ෆේට් වලට සෝඩියම් හයිඩ්‍රොක්සයිඩ් එක් කළ විට ලා නිල් Cu(OH)₂ අවක්ෂේපය සෑදේ.',
      en: 'Copper(II) sulphate forms an insoluble pale-blue Cu(OH)₂ precipitate with sodium hydroxide.',
    },
  },
  'fecl3|naoh-aq': {
    id: 'custom-fe3-naoh',
    category: 'inorganic',
    unitBadges: ['VI'],
    title: { si: 'Fe³⁺ + NaOH(aq) මලකඩ දුඹුරු අවක්ෂේපය', en: 'Fe³⁺ + NaOH(aq) Reddish-Brown Precipitate' },
    shortTitle: { si: 'Fe³⁺ + NaOH', en: 'Fe³⁺ + NaOH' },
    reagentAId: 'fecl3',
    reagentBId: 'naoh-aq',
    defaultCondition: 'room',
    equation: 'FeCl₃(aq) + 3NaOH(aq) → Fe(OH)₃(s)↓ + 3NaCl(aq)',
    ionicEquation: 'Fe³⁺(aq) + 3OH⁻(aq) → Fe(OH)₃(s)↓ (Reddish-Brown)',
    deltaHLabel: 'Ksp = 2.8×10⁻³⁹',
    initialColorHex: '#f59e0b',
    finalColorHex: '#b45309',
    initialOpacity: 0.72,
    finalOpacity: 0.92,
    reagentBColorHex: '#f1f5f9',
    effect: 'precipitate',
    precipitateColorHex: '#9a3412',
    tempRiseC: 2,
    observation: {
      si: 'රතු-දුඹුරු (Reddish-Brown) Fe(OH)₃ අවක්ෂේපය ක්ෂණිකව සෑදේ.',
      en: 'A gelatinous reddish-brown (rust-colored) Fe(OH)₃ precipitate forms immediately.',
    },
    explanation: {
      si: 'Fe(OH)₃ හි අතිශයින් කුඩා Ksp අගය නිසා ක්ෂාර හමුවේ ඉක්මනින් අවක්ෂේප වේ.',
      en: 'Very low solubility product causes rapid precipitation of hydrated iron(III) hydroxide.',
    },
    examNotes: {
      si: 'Fe²⁺ සමඟ කොළ-අළු Fe(OH)₂ ලැබෙන අතර එය වාතයේදී දුඹුරු වේ; Fe³⁺ ආරම්භයේදීම රතු-දුඹුරු වේ.',
      en: 'Fe²⁺ gives dirty green Fe(OH)₂, whereas Fe³⁺ gives immediate rust-brown Fe(OH)₃.',
    },
    voiceSummary: {
      si: 'ෆෙරික් අයන සෝඩියම් හයිඩ්‍රොක්සයිඩ් සමඟ රතු දුඹුරු පැහැති Fe(OH)₃ අවක්ෂේපය ලබා දේ.',
      en: 'Iron(III) chloride reacts with sodium hydroxide to produce a reddish-brown Fe(OH)₃ precipitate.',
    },
  },
  'fecl3|nh3-aq': {
    id: 'custom-fe3-nh3',
    category: 'inorganic',
    unitBadges: ['VI'],
    title: { si: 'Fe³⁺ + NH₃(aq) රතු-දුඹුරු අවක්ෂේපය', en: 'Fe³⁺ + NH₃(aq) Reddish-Brown Precipitate' },
    shortTitle: { si: 'Fe³⁺ + NH₃', en: 'Fe³⁺ + NH₃' },
    reagentAId: 'fecl3',
    reagentBId: 'nh3-aq',
    defaultCondition: 'room',
    equation: 'Fe³⁺(aq) + 3NH₃(aq) + 3H₂O(l) → Fe(OH)₃(s)↓ + 3NH₄⁺(aq)',
    ionicEquation: 'Fe³⁺(aq) + 3OH⁻(aq) → Fe(OH)₃(s)↓',
    deltaHLabel: 'Insoluble in excess NH₃',
    initialColorHex: '#f59e0b',
    finalColorHex: '#b45309',
    initialOpacity: 0.72,
    finalOpacity: 0.92,
    reagentBColorHex: '#e0f2fe',
    effect: 'precipitate',
    precipitateColorHex: '#9a3412',
    tempRiseC: 2,
    observation: {
      si: 'රතු-දුඹුරු Fe(OH)₃ අවක්ෂේපය සෑදෙන අතර අතිරික්ත NH₃ වල දිය නොවේ.',
      en: 'Reddish-brown Fe(OH)₃ precipitates and remains insoluble in excess aqueous ammonia.',
    },
    explanation: {
      si: 'Fe³⁺ ඇමෝනියා සමඟ ද්‍රාව්‍ය ඇමීන් සංකීර්ණ සාදන්නේ නැත.',
      en: 'Fe³⁺ does not undergo ammine ligand substitution in aqueous NH₃, unlike Cu²⁺ or Ni²⁺.',
    },
    examNotes: {
      si: 'Cu²⁺ සහ Fe³⁺ අතිරික්ත NH₃ මගින් පහසුවෙන් වෙන්කර ගත හැක.',
      en: 'Clearly separates Cu²⁺ (soluble deep blue) from Fe³⁺ (insoluble brown).',
    },
    voiceSummary: {
      si: 'ෆෙරික් අයන ඇමෝනියා සමඟද රතු දුඹුරු අවක්ෂේපය සාදන අතර අතිරික්ත ඇමෝනියා වල දිය නොවේ.',
      en: 'With aqueous ammonia, iron(III) forms an insoluble reddish-brown hydroxide precipitate.',
    },
  },
};

export interface CustomMixEvaluation {
  matched: boolean;
  reaction: SyllabusReactionSpec | null;
  noReactionReason?: LocalizedText;
}

export function evaluateCustomMixture(
  reagentAId: string,
  reagentBId: string,
  condition: ReactionCondition
): CustomMixEvaluation {
  // Exact preset lookup first
  const exactMatch =
    SYLLABUS_REACTIONS.find(
      (r) => r.reagentAId === reagentAId && r.reagentBId === reagentBId
    ) || EXTRA_CUSTOM_REACTIONS[`${reagentAId}|${reagentBId}`];

  if (exactMatch) {
    // Check condition sensitivity for special A/L syllabus reactions
    if (exactMatch.id === 'cu-naoh-nh3' && condition !== 'excess') {
      return {
        matched: true,
        reaction: {
          ...exactMatch,
          finalColorHex: '#60a5fa',
          effect: 'precipitate',
          precipitateColorHex: '#60a5fa',
          observation: {
            si: 'සීමිත NH₃ සමඟ ලා නිල් Cu(OH)₂ අවක්ෂේපය සෑදේ! තද නිල් සංකීර්ණය සෑදීමට "අතිරික්ත ප්‍රතිකාරකය" (Excess) තෝරන්න.',
            en: 'With limited NH₃, only pale-blue Cu(OH)₂ precipitates! Switch Condition to "Excess Reagent" to form deep royal-blue [Cu(NH₃)₄]²⁺.',
          },
        },
      };
    }
    if (
      (exactMatch.id === 'aldehyde-tollens' ||
        exactMatch.id === 'aldehyde-fehling' ||
        exactMatch.id === 'nh4-naoh') &&
      condition === 'room'
    ) {
      return {
        matched: true,
        reaction: {
          ...exactMatch,
          effect: 'color-shift',
          finalColorHex: exactMatch.initialColorHex,
          tempRiseC: 0,
          observation: {
            si: 'කාමර උෂ්ණත්වයේදී මෙම ප්‍රතික්‍රියාව ඉතා සෙමින් සිදුවේ — සම්පූර්ණ නිරීක්ෂණය සඳහා "උණුසුම් කිරීම / තාපය" (Warm) තෝරන්න!',
            en: 'Very slow at room temperature — switch Condition to "Warm / Bunsen Heat" to drive this reaction cleanly!',
          },
        },
      };
    }
    return { matched: true, reaction: exactMatch };
  }

  // Handle HCl + Na2S2O3 with dilute H2SO4 too
  if (reagentAId === 'agno3' && reagentBId === 'hcl-dil') {
    const base = SYLLABUS_REACTIONS.find((r) => r.id === 'cl-agno3')!;
    return { matched: true, reaction: base };
  }
  if (reagentAId === 'na2s2o3' && reagentBId === 'h2so4-dil') {
    const base = SYLLABUS_REACTIONS.find((r) => r.id === 'thiosulphate-acid')!;
    return { matched: true, reaction: base };
  }
  if (reagentAId === 'na2co3' && reagentBId === 'h2so4-dil') {
    const base = SYLLABUS_REACTIONS.find((r) => r.id === 'co3-hcl')!;
    return { matched: true, reaction: base };
  }
  if (reagentAId === 'k2cro4' && reagentBId === 'hcl-dil') {
    const base = SYLLABUS_REACTIONS.find((r) => r.id === 'chromate-acid')!;
    return { matched: true, reaction: base };
  }
  if (reagentAId === 'pbno3' && reagentBId === 'nacl') {
    return {
      matched: true,
      reaction: {
        id: 'custom-pb-cl',
        category: 'inorganic',
        unitBadges: ['VI'],
        title: { si: 'Pb²⁺ + Cl⁻ සුදු PbCl₂ අවක්ෂේපය', en: 'Pb²⁺ + Cl⁻ White PbCl₂ Precipitate' },
        shortTitle: { si: 'Pb²⁺ + Cl⁻', en: 'Pb²⁺ + Cl⁻' },
        reagentAId,
        reagentBId,
        defaultCondition: condition,
        equation: 'Pb(NO₃)₂(aq) + 2NaCl(aq) → PbCl₂(s)↓ + 2NaNO₃(aq)',
        ionicEquation: 'Pb²⁺(aq) + 2Cl⁻(aq) → PbCl₂(s)↓',
        deltaHLabel: 'Soluble in Hot H₂O',
        initialColorHex: '#e2e8f0',
        finalColorHex: '#f8fafc',
        initialOpacity: 0.55,
        finalOpacity: 0.88,
        reagentBColorHex: '#e2e8f0',
        effect: condition === 'warm' ? 'color-shift' : 'precipitate',
        precipitateColorHex: '#ffffff',
        tempRiseC: condition === 'warm' ? 40 : 1,
        observation:
          condition === 'warm'
            ? {
                si: 'PbCl₂ අවක්ෂේපය උණු ජලයේ දිය වී පැහැදිලි ද්‍රාවණයක් ලබා දේ! (AgCl උණු ජලයේ දිය නොවේ).',
                en: 'White PbCl₂ dissolves upon heating! (Unlike AgCl, which stays insoluble in hot water).',
              }
            : {
                si: 'සීතල ද්‍රාවණයේ සුදු පැහැති PbCl₂ අවක්ෂේපය සෑදේ (රත් කළ විට දිය වේ).',
                en: 'White crystalline PbCl₂ precipitates in cold water (redissolves on warming).',
              },
        explanation: {
          si: 'PbCl₂ හි ද්‍රාව්‍යතාව උෂ්ණත්වය සමඟ සැලකිය යුතු ලෙස වැඩි වේ.',
          en: 'Endothermic dissolution allows PbCl₂ to redissolve readily in hot water.',
        },
        examNotes: {
          si: 'PbCl₂ සහ AgCl වෙන්කර ගැනීමට උණු ජලයේ ද්‍රාව්‍යතාව යොදාගනී.',
          en: 'Key distinction: PbCl₂ dissolves in hot water; AgCl does not.',
        },
        voiceSummary: {
          si: 'ලෙඩ් නයිට්‍රේට් ක්ලෝරයිඩ් සමඟ සුදු PbCl₂ අවක්ෂේපය සාදන අතර එය උණු කළ විට දිය වේ.',
          en: 'Lead(II) nitrate forms a white PbCl₂ precipitate that dissolves when heated.',
        },
      },
    };
  }

  return {
    matched: false,
    reaction: null,
    noReactionReason: {
      si: 'තෝරාගත් ප්‍රතිකාරක යුගලය අතර කැපී පෙනෙන රසායනික ප්‍රතික්‍රියාවක් සිදු නොවේ. වලංගු A/L ප්‍රතිකාරක යුගලයක් (උදා: AgNO₃ + KI, CuSO₄ + NH₃, FeCl₃ + KSCN, Br₂ + Alkene) උත්සාහ කරන්න!',
      en: 'No observable visible reaction occurs between these selected reagents under A/L lab conditions. Try a reactive syllabus pair (e.g. AgNO₃ + KI, CuSO₄ + NH₃, FeCl₃ + KSCN, or Br₂ + Alkene).',
    },
  };
}
