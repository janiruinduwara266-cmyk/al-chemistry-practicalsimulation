import type { LocalizedText } from '../types/lab';

export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'transition-metal'
  | 'post-transition'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide';

export type ElementBlock = 's' | 'p' | 'd' | 'f';
export type ElementState = 'Gas' | 'Liquid' | 'Solid';

export interface ChemicalElementSpec {
  z: number;
  symbol: string;
  name: LocalizedText;
  mass: string;
  group: number; // 1..18 (f-block uses 3)
  period: number; // 1..7
  gridRow: number; // 1..7 for main, 9 for Lanthanides, 10 for Actinides
  gridCol: number; // 1..18
  block: ElementBlock;
  category: ElementCategory;
  state: ElementState;
  electronegativity: number | null;
  oxidationStates: string;
  shells: number[];
  fullElectronConfig: string;
  shortElectronConfig: string;
  isExceptionConfig: boolean;
  alFocus: boolean;
  description: LocalizedText;
  usesAndLabNotes: LocalizedText;
}

export const ELEMENT_CATEGORY_META: Record<
  ElementCategory,
  { label: LocalizedText; accentHex: string; bgHex: string }
> = {
  'alkali-metal': {
    label: { si: 'ක්ෂාර ලෝහ (Group 1)', en: 'Alkali Metals' },
    accentHex: '#FB7185',
    bgHex: 'rgba(225, 29, 72, 0.28)',
  },
  'alkaline-earth': {
    label: { si: 'ක්ෂාරීය පාංශු ලෝහ (Group 2)', en: 'Alkaline Earth' },
    accentHex: '#FB923C',
    bgHex: 'rgba(234, 88, 12, 0.28)',
  },
  'transition-metal': {
    label: { si: 'ආන්තරික ලෝහ (d-ගොනුව)', en: 'Transition Metals' },
    accentHex: '#38BDF8',
    bgHex: 'rgba(2, 132, 199, 0.26)',
  },
  'post-transition': {
    label: { si: 'පශ්චාත් ආන්තරික ලෝහ', en: 'Post-Transition' },
    accentHex: '#2DD4BF',
    bgHex: 'rgba(13, 148, 136, 0.26)',
  },
  metalloid: {
    label: { si: 'අලෝහමය / උපලෝහ', en: 'Metalloids' },
    accentHex: '#A3E635',
    bgHex: 'rgba(101, 163, 13, 0.26)',
  },
  nonmetal: {
    label: { si: 'අලෝහ', en: 'Reactive Nonmetals' },
    accentHex: '#4ADE80',
    bgHex: 'rgba(22, 163, 74, 0.26)',
  },
  halogen: {
    label: { si: 'හැලජන (Group 17)', en: 'Halogens' },
    accentHex: '#FACC15',
    bgHex: 'rgba(202, 138, 4, 0.28)',
  },
  'noble-gas': {
    label: { si: 'උච්ච වායු (Group 18)', en: 'Noble Gases' },
    accentHex: '#C084FC',
    bgHex: 'rgba(124, 58, 237, 0.28)',
  },
  lanthanide: {
    label: { si: 'ලැන්තනයිඩ (4f)', en: 'Lanthanides' },
    accentHex: '#F472B6',
    bgHex: 'rgba(219, 39, 119, 0.24)',
  },
  actinide: {
    label: { si: 'ඇක්ටිනයිඩ (5f)', en: 'Actinides' },
    accentHex: '#FBBF24',
    bgHex: 'rgba(180, 83, 9, 0.26)',
  },
};

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

function toSup(n: number): string {
  return String(n)
    .split('')
    .map((d) => SUPERSCRIPTS[d] ?? d)
    .join('');
}

const AUFBAU_SUBSHELLS: Array<{ n: number; sub: string; cap: number }> = [
  { n: 1, sub: '1s', cap: 2 },
  { n: 2, sub: '2s', cap: 2 },
  { n: 2, sub: '2p', cap: 6 },
  { n: 3, sub: '3s', cap: 2 },
  { n: 3, sub: '3p', cap: 6 },
  { n: 4, sub: '4s', cap: 2 },
  { n: 3, sub: '3d', cap: 10 },
  { n: 4, sub: '4p', cap: 6 },
  { n: 5, sub: '5s', cap: 2 },
  { n: 4, sub: '4d', cap: 10 },
  { n: 5, sub: '5p', cap: 6 },
  { n: 6, sub: '6s', cap: 2 },
  { n: 4, sub: '4f', cap: 14 },
  { n: 5, sub: '5d', cap: 10 },
  { n: 6, sub: '6p', cap: 6 },
  { n: 7, sub: '7s', cap: 2 },
  { n: 5, sub: '5f', cap: 14 },
  { n: 6, sub: '6d', cap: 10 },
  { n: 7, sub: '7p', cap: 6 },
];

// Official IUPAC/G.C.E. A/L ground-state exception adjustments relative to naive Aufbau
const EXCEPTION_OVERRIDES: Record<number, Record<string, number>> = {
  24: { '4s': 1, '3d': 5 }, // Cr
  29: { '4s': 1, '3d': 10 }, // Cu
  41: { '5s': 1, '4d': 4 }, // Nb
  42: { '5s': 1, '4d': 5 }, // Mo
  44: { '5s': 1, '4d': 7 }, // Ru
  45: { '5s': 1, '4d': 8 }, // Rh
  46: { '5s': 0, '4d': 10 }, // Pd
  47: { '5s': 1, '4d': 10 }, // Ag
  57: { '6s': 2, '4f': 0, '5d': 1 }, // La
  58: { '6s': 2, '4f': 1, '5d': 1 }, // Ce
  64: { '6s': 2, '4f': 7, '5d': 1 }, // Gd
  78: { '6s': 1, '4f': 14, '5d': 9 }, // Pt
  79: { '6s': 1, '4f': 14, '5d': 10 }, // Au
  89: { '7s': 2, '5f': 0, '6d': 1 }, // Ac
  90: { '7s': 2, '5f': 0, '6d': 2 }, // Th
  91: { '7s': 2, '5f': 2, '6d': 1 }, // Pa
  92: { '7s': 2, '5f': 3, '6d': 1 }, // U
  93: { '7s': 2, '5f': 4, '6d': 1 }, // Np
  96: { '7s': 2, '5f': 7, '6d': 1 }, // Cm
  103: { '7s': 2, '5f': 14, '6d': 0, '7p': 1 }, // Lr
};

const NOBLE_CORES = [
  { z: 86, sym: 'Rn' },
  { z: 54, sym: 'Xe' },
  { z: 36, sym: 'Kr' },
  { z: 18, sym: 'Ar' },
  { z: 10, sym: 'Ne' },
  { z: 2, sym: 'He' },
];

// Principal-shell display order inside electron configuration strings
const SHELL_PRINT_ORDER = [
  '1s',
  '2s',
  '2p',
  '3s',
  '3p',
  '3d',
  '4s',
  '4p',
  '4d',
  '4f',
  '5s',
  '5p',
  '5d',
  '5f',
  '6s',
  '6p',
  '6d',
  '7s',
  '7p',
];

function computeElectronData(z: number): {
  shells: number[];
  fullElectronConfig: string;
  shortElectronConfig: string;
  isExceptionConfig: boolean;
} {
  const counts: Record<string, number> = {};
  let rem = z;
  for (const orb of AUFBAU_SUBSHELLS) {
    if (rem <= 0) break;
    const take = Math.min(rem, orb.cap);
    counts[orb.sub] = take;
    rem -= take;
  }

  const exc = EXCEPTION_OVERRIDES[z];
  if (exc) {
    for (const [sub, val] of Object.entries(exc)) {
      if (val === 0) delete counts[sub];
      else counts[sub] = val;
    }
  }

  // Build shell electron totals [n=1, n=2, ...]
  const shellTotals: number[] = [];
  for (const orb of AUFBAU_SUBSHELLS) {
    const c = counts[orb.sub] || 0;
    if (c > 0) {
      shellTotals[orb.n - 1] = (shellTotals[orb.n - 1] || 0) + c;
    }
  }
  const shells = shellTotals.map((v) => v || 0);

  const fullParts: string[] = [];
  for (const sub of SHELL_PRINT_ORDER) {
    const c = counts[sub] || 0;
    if (c > 0) fullParts.push(`${sub}${toSup(c)}`);
  }
  const fullElectronConfig = fullParts.join(' ');

  // Noble gas core shorthand
  const core = NOBLE_CORES.find((c) => z > c.z);
  let shortElectronConfig = fullElectronConfig;
  if (core) {
    const coreCounts: Record<string, number> = {};
    let cRem = core.z;
    for (const orb of AUFBAU_SUBSHELLS) {
      if (cRem <= 0) break;
      const take = Math.min(cRem, orb.cap);
      coreCounts[orb.sub] = take;
      cRem -= take;
    }
    const valenceParts: string[] = [];
    for (const sub of SHELL_PRINT_ORDER) {
      const diff = (counts[sub] || 0) - (coreCounts[sub] || 0);
      if (diff > 0) valenceParts.push(`${sub}${toSup(diff)}`);
    }
    shortElectronConfig = `[${core.sym}] ${valenceParts.join(' ')}`;
  }

  return {
    shells,
    fullElectronConfig,
    shortElectronConfig,
    isExceptionConfig: Boolean(exc),
  };
}

type RawElementTuple = [
  z: number,
  symbol: string,
  nameEn: string,
  nameSi: string,
  mass: string,
  group: number,
  period: number,
  block: ElementBlock,
  category: ElementCategory,
  state: ElementState,
  en: number | null,
  ox: string,
  descSi: string,
  descEn: string,
  usesSi: string,
  usesEn: string,
];

const RAW_ELEMENTS: RawElementTuple[] = [
  [1, 'H', 'Hydrogen', 'හයිඩ්‍රජන්', '1.008', 1, 1, 's', 'nonmetal', 'Gas', 2.20, '-1, +1',
    'විශ්වයේ බහුලතම සරලතම මූලද්‍රව්‍යයයි; ප්‍රෝටෝන 1ක් හා ඉලෙක්ට්‍රෝන 1ක් ඇත. H₂ ද්වි-පරමාණුක අණුවක් ලෙස පවතී.',
    'Simplest and most abundant element in the universe with 1 proton and 1 electron; exists as diatomic H₂ gas.',
    'ඇමෝනියා (Haber), හයිඩ්‍රජන් ඉන්ධන කෝෂ, සහ අම්ල-ලෝහ ප්‍රතික්‍රියා (pH සම්මතය).',
    'Used in Haber ammonia synthesis, hydrogenation, fuel cells, and standard hydrogen electrode (0.00 V).'],
  [2, 'He', 'Helium', 'හීලියම්', '4.0026', 18, 1, 's', 'noble-gas', 'Gas', null, '0',
    'සම්පූර්ණ 1s² කවචයක් සහිත ස්ථායී උච්ච වායුවකි; ප්‍රතික්‍රියාශීලී නොවේ.',
    'Monatomic noble gas with a filled 1s² valence shell; chemically inert and very low boiling point (4.2 K).',
    'MRI අධිසන්නායක සිසිලනය, බැලූන් සහ විසර්ජන නළ වල නිෂ්ක්‍රීය වායුව.',
    'Cryogenic coolant for MRI magnets, carrier gas in chromatography, and discharge tubes.'],
  [3, 'Li', 'Lithium', 'ලිතියම්', '6.94', 1, 2, 's', 'alkali-metal', 'Solid', 0.98, '+1',
    'සැහැල්ලුම ඝන ලෝහයයි. ජලය සමඟ H₂ පිටකරමින් ප්‍රතික්‍රියා කරයි; පහන් දැල්ලට තද රතු (Crimson) වර්ණයක් දෙයි.',
    'Lightest solid metal (Group 1). Reacts with water liberating H₂ and gives a crimson flame test.',
    'Li-ion බැටරි, LiAlH₄ කාබනික ඔක්සිහාරකය, සහ Li₂CO₃ (p-ගොනු සංසන්දන).',
    'Lithium-ion batteries, LiAlH₄ reducing reagent in Unit VII organic synthesis, crimson flame test.'],
  [4, 'Be', 'Beryllium', 'බෙරිලියම්', '9.0122', 2, 2, 's', 'alkaline-earth', 'Solid', 1.57, '+2',
    '2 වන කාණ්ඩයේ පළමු මූලද්‍රව්‍යයයි; ඉහළ ආරෝපණ ඝනත්වය නිසා සහසංයුජ සංයෝග සාදයි (Al සමඟ විකර්ණ සම්බන්ධය).',
    'First Group 2 element; high charge density gives covalent character (BeCl₂) and diagonal similarity to Aluminium.',
    'X-කිරණ කවුළු, අභ්‍යවකාශ මිශ්‍ර ලෝහ සහ Be(OH)₂ ඇම්ෆොටෙරික් ගුණ.',
    'X-ray tube windows, aerospace alloys; Be(OH)₂ shows amphoteric behaviour unlike Mg(OH)₂.'],
  [5, 'B', 'Boron', 'බෝරෝන්', '10.81', 13, 2, 'p', 'metalloid', 'Solid', 2.04, '+3',
    'තද උපලෝහයකි; BF₃ වැනි ඉලෙක්ට්‍රෝන-ඌන ත්‍රිකෝණාකාර සමතල අණු සාදයි.',
    'Hard metalloid forming electron-deficient trigonal planar compounds like BF₃ (sp² hybridized).',
    'බෝරෝසිලිකේට් වීදුරු (Pyrex) සහ NaBH₄ කාබනික ඔක්සිහාරකය.',
    'Borosilicate laboratory glassware and NaBH₄ mild reducing agent for carbonyls.'],
  [6, 'C', 'Carbon', 'කාබන්', '12.011', 14, 2, 'p', 'nonmetal', 'Solid', 2.55, '-4 to +4',
    'දාම සෑදීමේ (Catenation) හැකියාව ඇති කාබනික රසායනයේ පදනමයි; දියමන්ති (sp³) හා ග්‍රැෆයිට් (sp²) ලෙස බහුරූපතා දක්වයි.',
    'Backbone of all organic chemistry via catenation; forms diamond (sp³) and conducting graphite (sp²) allotropes.',
    'කාබනික අණු, බහුඅවයව, CO₂/CO සමතුලිතතා සහ ග්‍රැෆයිට් ඉලෙක්ට්‍රෝඩ.',
    'All organic compounds, polymers, fuels, inert graphite electrodes, and ¹²C atomic mass standard.'],
  [7, 'N', 'Nitrogen', 'නයිට්‍රජන්', '14.007', 15, 2, 'p', 'nonmetal', 'Gas', 3.04, '-3 to +5',
    'වායුගෝලයෙන් 78% කි; N≡N ත්‍රිත්ව බන්ධනය (945 kJ/mol) නිසා කාමර උෂ්ණත්වයේදී අක්‍රීය වේ.',
    'Makes up 78% of air; strong N≡N triple bond (945 kJ/mol) makes N₂ unreactive until high temperature/catalyst.',
    'ඇමෝනියා (NH₃), නයිට්‍රික් අම්ලය (HNO₃), ඇමීන හා ඩයසෝනියම් ලවණ.',
    'Haber process NH₃, Ostwald HNO₃ fertilizers, amines, amino acids, and NO₂/N₂O₄ equilibrium.'],
  [8, 'O', 'Oxygen', 'ඔක්සිජන්', '15.999', 16, 2, 'p', 'nonmetal', 'Gas', 3.44, '-2, -1',
    'ප්‍රබල විද්‍යුත් ඍණ අලෝහයකි; H₂O අණුවල හයිඩ්‍රජන් බන්ධන සාදයි. O₂ අනුචුම්බක (Paramagnetic) වේ.',
    'Highly electronegative nonmetal supporting combustion and hydrogen bonding; paramagnetic O₂ and O₃ ozone.',
    'දහන විශ්ලේෂණය, ඔක්සිකරණ-ඔක්සිහරණ, H₂O₂ සහ කාබනික ක්‍රියාකාරී කාණ්ඩ.',
    'Combustion calorimetry, H₂O₂ kinetics, alcohols/carbonyls, and oxide acid-base trends across Period 3.'],
  [9, 'F', 'Fluorine', 'ෆ්ලෝරීන්', '18.998', 17, 2, 'p', 'halogen', 'Gas', 3.98, '-1',
    'විද්‍යුත් ඍණතාවය උපරිම (3.98) සහ ප්‍රබලතම ඔක්සිකාරක හැලජනයයි; සෑමවිටම −1 ඔක්සිකරණ අවස්ථාව පෙන්වයි.',
    'Most electronegative element (3.98) and strongest oxidizing halogen; pale yellow reactive F₂ gas.',
    'PTFE (Teflon), HF වීදුරු කැටයම්, සහ SF₆ අෂ්ටතලීය VSEPR අණුව.',
    'PTFE polymers, fluoridation, and octahedral SF₆ benchmark in VSEPR molecular geometry.'],
  [10, 'Ne', 'Neon', 'නියෝන්', '20.180', 18, 2, 'p', 'noble-gas', 'Gas', null, '0',
    'සම්පූර්ණ අෂ්ටකයක් (2s² 2p⁶) ඇති උච්ච වායුවකි; විසර්ජන නළ තුළ දීප්තිමත් තැඹිලි-රතු ආලෝකයක් නිකුත් කරයි.',
    'Inert noble gas with full octet (2s² 2p⁶); glows vivid orange-red in Crookes discharge tubes.',
    'නියෝන් විදුලි පහන්, හීලියම්-නියෝන් ලේසර් සහ අධි වෝල්ටීයතා දර්ශක.',
    'Neon discharge signs, gas-discharge spectroscopy, and He-Ne lasers.'],
  [11, 'Na', 'Sodium', 'සෝඩියම්', '22.990', 1, 3, 's', 'alkali-metal', 'Solid', 0.93, '+1',
    'මෘදු රිදී පැහැති ක්ෂාර ලෝහයකි; ජලය මත පාවෙමින් NaOH + H₂ සාදයි. දැල්ල රන්වන් කහ (Golden Yellow) වේ.',
    'Soft reactive alkali metal; melts on water liberating H₂ and NaOH. Produces intense golden-yellow 589 nm flame.',
    'NaOH, Na₂CO₃, NaCl, NaBH₄ සහ භූමිතෙල් යට ගබඩා කිරීම.',
    'NaOH standard alkali, brine electrolysis, Na₂CO₃ primary standard, and sodium-vapour lamps.'],
  [12, 'Mg', 'Magnesium', 'මැග්නීසියම්', '24.305', 2, 3, 's', 'alkaline-earth', 'Solid', 1.31, '+2',
    'දීප්තිමත් සුදු දැල්ලකින් දැවී MgO සාදයි; හුමාලය හා අම්ල සමඟ H₂ නිපදවයි.',
    'Burns with blinding white light to MgO; reacts slowly with cold water, rapidly with steam and dilute acids.',
    'ග්‍රිග්නාඩ් ප්‍රතිකාරක (RMgX), MgSO₄·7H₂O සහ ස්ටොයිකියොමිතිය.',
    'Grignard reagents (R-MgBr) in organic carbon-chain synthesis, Mg + HCl molar gas experiments.'],
  [13, 'Al', 'Aluminium', 'ඇලුමිනියම්', '26.982', 13, 3, 'p', 'post-transition', 'Solid', 1.61, '+3',
    'ඇම්ෆොටෙරික් (අම්ල හා ක්ෂාර දෙකම සමඟ ප්‍රතික්‍රියා කරන) සැහැල්ලු ලෝහයකි; Al₂O₃ ස්ථරයෙන් ආරක්ෂා වේ.',
    'Lightweight amphoteric metal protected by tough Al₂O₃ layer; dissolves in both HCl and warm NaOH liberating H₂.',
    'AlCl₃ ෆ්‍රීඩල්-ක්‍රාෆ්ට්ස් උත්ප්‍රේරකය සහ තර්මයිට් ප්‍රතික්‍රියාව.',
    'Anhydrous AlCl₃ Friedel-Crafts catalyst, amphoteric Al(OH)₃ test, and electrolytic extraction.'],
  [14, 'Si', 'Silicon', 'සිලිකන්', '28.085', 14, 3, 'p', 'metalloid', 'Solid', 1.90, '-4, +4',
    'දියමන්ති වැනි යෝධ සහසංයුජ දැලිසක් සාදන අර්ධ සන්නායක උපලෝහයකි; SiO₂ ආම්ලික ඔක්සයිඩයකි.',
    'Semiconductor metalloid with giant covalent lattice; forms high-melting acidic SiO₂ and volatile tetrahedral SiCl₄.',
    'පරිගණක චිප්ස්, සිලිකේට්, සිලිකොන්ස් සහ SiCl₄ ජලවිච්ඡේදනය.',
    'Microchips, solar cells, SiO₂ quartz glass, and Period 3 chloride hydrolysis comparison.'],
  [15, 'P', 'Phosphorus', 'පොස්පරස්', '30.974', 15, 3, 'p', 'nonmetal', 'Solid', 2.19, '-3, +3, +5',
    'සුදු P₄ (චතුස්තලීය, අධි ප්‍රතික්‍රියාශීලී) හා රතු P ලෙස පවතී; PCl₃ හා PCl₅ සාදයි.',
    'Exists as reactive tetrahedral P₄ (white) and polymeric red phosphorus; expands octet to PCl₅.',
    'PCl₅ / PCl₃ ඇල්කොහොල හා කාබොක්සිලික් අම්ල හඳුනාගැනීමේ ප්‍රතිකාරක.',
    'PCl₅ test for -OH groups (steamy HCl fumes), P₄O₁₀ drying agent, and ATP/fertilizers.'],
  [16, 'S', 'Sulfur', 'සල්ෆර්', '32.06', 16, 3, 'p', 'nonmetal', 'Solid', 2.58, '-2, +4, +6',
    'S₈ ඔටුන්නු හැඩැති අණු සාදන කහ පැහැති අලෝහයකි; නැවුම් කළු-කහ අවක්ෂේප තයෝසල්ෆේට් චාලකයේදී දිස්වේ.',
    'Yellow solid forming puckered S₈ rings; central to Contact Process H₂SO₄ and thiosulphate kinetics.',
    'සාන්ද්‍ර H₂SO₄ නිෂ්පාදනය, Na₂S₂O₃ අයඩොමිතික අනුමාපන හා රබර් වල්කනයිස් කිරීම.',
    'Contact process (V₂O₅ catalyst), S₂O₃²⁻/H⁺ turbidity kinetics, vulcanizing rubber.'],
  [17, 'Cl', 'Chlorine', 'ක්ලෝරීන්', '35.45', 17, 3, 'p', 'halogen', 'Gas', 3.16, '-1, +1, +3, +5, +7',
    'කොළ-කහ විෂ සහිත Cl₂ වායුවකි; ප්‍රබල විරංජන කාරකයක් හා ඔක්සිකාරකයකි.',
    'Greenish-yellow oxidizing gas; disproportionates in cold/hot NaOH and precipitates white AgCl with Ag⁺.',
    'ජල පිරිපහදුව, PVC, විරංජන කුඩු (NaOCl), සහ Cl⁻ / AgNO₃ පරීක්ෂාව.',
    'Water disinfection, Cl₂/NaOH disproportionation (ClO⁻ vs ClO₃⁻), and silver halide tests.'],
  [18, 'Ar', 'Argon', 'ආගන්', '39.948', 18, 3, 'p', 'noble-gas', 'Gas', null, '0',
    'වායුගෝලයේ තෙවන බහුලතම වායුව (0.93%) වන නිෂ්ක්‍රීය උච්ච වායුවකි.',
    'Third most abundant atmospheric gas (0.93%); inert shielding gas with full 3p⁶ valence subshell.',
    'විදුලි බුබුළු, TIG වෑල්ඩින් සහ වායු-විසර්ජන නළ.',
    'Inert atmosphere for reactive chemistry, incandescent bulbs, and argon plasma tubes.'],
  [19, 'K', 'Potassium', 'පොටෑසියම්', '39.098', 1, 4, 's', 'alkali-metal', 'Solid', 0.82, '+1',
    'සෝඩියම්ට වඩා ප්‍රතික්‍රියාශීලී ක්ෂාර ලෝහයකි; ජලය සමඟ ලිලැක් (Lilac) දැල්ලක් සමඟ ප්‍රතික්‍රියා කරයි.',
    'More reactive than Na; ignites on water with a lilac/violet flame (observed through cobalt-blue glass).',
    'KMnO₄, K₂Cr₂O₇, KSCN, KI සහ KOH පොදු රසායනාගාර ප්‍රතිකාරක.',
    'Key counter-ion in KMnO₄, K₂Cr₂O₇, KI, and KSCN reagents; essential plant macronutrient.'],
  [20, 'Ca', 'Calcium', 'කැල්සියම්', '40.078', 2, 4, 's', 'alkaline-earth', 'Solid', 1.00, '+2',
    'සීතල ජලය සමඟ H₂ හා කිරි පැහැ Ca(OH)₂ සාදයි; දැල්ලට ගඩොල් රතු (Brick-Red) වර්ණයක් දෙයි.',
    'Reacts steadily with cold water forming cloudy Ca(OH)₂ and H₂; gives a characteristic brick-red flame.',
    'හුණු දියර [Ca(OH)₂] CO₂ පරීක්ෂාව, CaCO₃ කිරිගරුඬ චාලකය, සහ ජිප්සම්.',
    'Limewater CO₂ test, CaCO₃ + HCl surface-area kinetics, and Group 2 thermal stability trends.'],
  [21, 'Sc', 'Scandium', 'ස්කැන්ඩියම්', '44.956', 3, 4, 'd', 'transition-metal', 'Solid', 1.36, '+3',
    'පළමු d-ගොනු මූලද්‍රව්‍යය (3d¹ 4s²) වුවද ස්ථායී අයනය Sc³⁺ (3d⁰) බැවින් අවර්ණ සංයෝග සාදයි — සම්මත ආන්තරික ලෝහ ගුණ නොපෙන්වයි.',
    'First 3d element ([Ar] 3d¹ 4s²); only forms colourless Sc³⁺ (d⁰) so technically lacks incomplete d-subshell ions.',
    'සැහැල්ලු ගුවන් යානා Al-Sc මිශ්‍ර ලෝහ සහ d-ගොනු විභේදන උදාහරණ.',
    'Aerospace Al-Sc alloys and textbook Unit VI contrast explaining why Sc³⁺/Zn²⁺ ions are colourless.'],
  [22, 'Ti', 'Titanium', 'ටයිටේනියම්', '47.867', 4, 4, 'd', 'transition-metal', 'Solid', 1.54, '+2, +3, +4',
    'ඉහළ ශක්ති-බර අනුපාතයක් ඇති විඛාදන ප්‍රතිරෝධී ලෝහයකි; Ti³⁺ (d¹) දම් පැහැති සංකීර්ණ සාදයි.',
    'Strong corrosion-resistant 3d metal; Ti³⁺ (3d¹) forms purple aqueous complexes while TiO₂ is bright white.',
    'සීග්ලර්-නැටා (TiCl₄) පොලිමරීකරණ උත්ප්‍රේරකය සහ වෛද්‍ය බද්ධ කිරීම්.',
    'Ziegler-Natta TiCl₄ alkene polymerization catalyst, aerospace frames, and TiO₂ pigment.'],
  [23, 'V', 'Vanadium', 'වැනේඩියම්', '50.942', 5, 4, 'd', 'transition-metal', 'Solid', 1.63, '+2, +3, +4, +5',
    '+2 (දම්), +3 (කොළ), +4 (නිල්), +5 (කහ) ලෙස විවිධ වර්ණවත් ඔක්සිකරණ අවස්ථා 4 ක් පෙන්වයි.',
    'Showcases four vivid aqueous oxidation states: VO₂⁺ (yellow, +5), VO²⁺ (blue, +4), V³⁺ (green, +3), V²⁺ (violet, +2).',
    'ස්පර්ශ ක්‍රියාවලියේදී SO₂ → SO₃ ඔක්සිකරණය සඳහා V₂O₅ උත්ප්‍රේරකය.',
    'V₂O₅ heterogeneous catalyst in the Contact Process and redox cascade with zinc in acid.'],
  [24, 'Cr', 'Chromium', 'ක්‍රෝමියම්', '51.996', 6, 4, 'd', 'transition-metal', 'Solid', 1.66, '+2, +3, +6',
    'අර්ධ පිරුණු 3d⁵ ස්ථායීතාවය නිසා 4s¹ 3d⁵ වින්‍යාසය දරයි; Cr₂O₇²⁻ (තැඹිලි) හා CrO₄²⁻ (කහ) අතර pH සමතුලිතතාව සාදයි.',
    'Anomalous [Ar] 3d⁵ 4s¹ half-filled stability; forms orange Cr₂O₇²⁻ oxidant and yellow CrO₄²⁻ pH equilibrium.',
    'ඇල්කොහොල ඔක්සිකරණය (K₂Cr₂O₇/H⁺), මල නොබැඳෙන වානේ සහ ක්‍රෝම් ආලේපනය.',
    'Acidified dichromate oxidation of alcohols, CrO₄²⁻/Cr₂O₇²⁻ equilibrium, and stainless steel.'],
  [25, 'Mn', 'Manganese', 'මැන්ගනීස්', '54.938', 7, 4, 'd', 'transition-metal', 'Solid', 1.55, '+2, +4, +7',
    '+2 සිට +7 දක්වා පුළුල් ඔක්සිකරණ අවස්ථා දරයි; MnO₄⁻ තද දම් පැහැති ප්‍රබල ඔක්සිකාරකයකි.',
    'Exhibits highest common 3d oxidation state (+7 in purple MnO₄⁻); Mn²⁺ (d⁵) is very pale pink.',
    'KMnO₄ ස්වයං-දර්ශක රෙඩොක්ස් අනුමාපන, බේයර් පරීක්ෂාව සහ MnO₂ උත්ප්‍රේරකය.',
    'KMnO₄ redox titrations (self-indicating), Baeyer alkene test, and MnO₂ H₂O₂ decomposition catalyst.'],
  [26, 'Fe', 'Iron', 'යකඩ', '55.845', 8, 4, 'd', 'transition-metal', 'Solid', 1.83, '+2, +3',
    'අත්‍යවශ්‍ය ආන්තරික ලෝහයකි; Fe²⁺ (ලා කොළ) හා Fe³⁺ (කහ-දුඹුරු) සාදයි. හේබර් ක්‍රියාවලියේ උත්ප්‍රේරකය වේ.',
    'Forms pale green Fe²⁺ and amber Fe³⁺ ions; forms blood-red [Fe(SCN)]²⁺ and acts as Haber catalyst.',
    'හේබර් NH₃ නිෂ්පාදනය, දුඹුරු වළලු NO₃⁻ පරීක්ෂාව, සහ හීමොග්ලොබින්.',
    'Haber process catalyst, brown-ring nitrate test, Fe³⁺/SCN⁻ equilibrium, and haemoglobin oxygen transport.'],
  [27, 'Co', 'Cobalt', 'කොබෝල්ට්', '58.933', 9, 4, 'd', 'transition-metal', 'Solid', 1.88, '+2, +3',
    '[Co(H₂O)₆]²⁺ (රෝස) සහ [CoCl₄]²⁻ (තද නිල්) අතර උෂ්ණත්ව/සාන්ද්‍රණ වර්ණ සංකීර්ණ සමතුලිතතා සාදයි.',
    'Forms pink octahedral [Co(H₂O)₆]²⁺ and deep-blue tetrahedral [CoCl₄]²⁻ thermochromic equilibrium.',
    'කොබෝල්ට් ක්ලෝරයිඩ් තෙතමන පරීක්ෂාව, Co²⁺ දැල්ල නැරඹුම් වීදුරු සහ විටමින් B₁₂.',
    'Thermochromic/halide Le Chatelier demos, cobalt-blue flame filter glass, and LiCoO₂ cathodes.'],
  [28, 'Ni', 'Nickel', 'නිකල්', '58.693', 10, 4, 'd', 'transition-metal', 'Solid', 1.91, '+2',
    'දීප්තිමත් කොළ [Ni(H₂O)₆]²⁺ සාදයි; ඇල්කීන හයිඩ්‍රජනීකරණයේදී (150 °C) ප්‍රධාන උත්ප්‍රේරකය ලෙස ක්‍රියා කරයි.',
    'Corrosion-resistant metal forming green [Ni(H₂O)₆]²⁺ and violet [Ni(NH₃)₆]²⁺ complexes.',
    'ඇල්කීන හයිඩ්‍රජනීකරණ උත්ප්‍රේරකය, DMG රෝස අවක්ෂේපය සහ මල නොබැඳෙන වානේ.',
    'Catalytic hydrogenation of alkenes/oils, scarlet Ni(DMG)₂ analytical test, and Ni-MH batteries.'],
  [29, 'Cu', 'Copper', 'තඹ (කොපර්)', '63.546', 11, 4, 'd', 'transition-metal', 'Solid', 1.90, '+1, +2',
    'සම්පූර්ණ 3d¹⁰ උප-කවච ස්ථායීතාවය නිසා [Ar] 3d¹⁰ 4s¹ වින්‍යාසය දරයි; Cu²⁺ නිල් ද්‍රාවණ හා Cu₂O රතු අවක්ෂේප සාදයි.',
    'Anomalous [Ar] 3d¹⁰ 4s¹ configuration; blue [Cu(H₂O)₆]²⁺ forms deep-blue [Cu(NH₃)₄]²⁺ with excess NH₃.',
    'ඩැනියෙල් කෝෂය, ෆේලිං/බෙනඩික්ට් පරීක්ෂාව, විද්‍යුත් රැහැන් සහ CuSO₄ විද්‍යුත් විච්ඡේදනය.',
    'Daniell galvanic cell cathode, CuSO₄ electrolysis, Fehling aldehyde test, and electrical wiring.'],
  [30, 'Zn', 'Zinc', 'සින්ක්', '65.38', 12, 4, 'd', 'transition-metal', 'Solid', 1.65, '+2',
    'Zn හි හා Zn²⁺ (3d¹⁰) හි සම්පූර්ණ d-කවච නිසා අවර්ණ සංයෝග සාදයි; ඇම්ෆොටෙරික් Zn(OH)₂ අතිරික්ත NaOH/NH₃ දෙකේම දිය වේ.',
    'Filled 3d¹⁰ subshell in both atom and Zn²⁺ gives white/colourless compounds; Zn(OH)₂ dissolves in excess NaOH & NH₃.',
    'ඩැනියෙල් කෝෂ ඇනෝඩය, යකඩ ගැල්වනයිස් කිරීම සහ ZnS ප්‍රතිදීප්ත තිරය.',
    'Daniell cell anode, sacrificial galvanizing of iron, and ZnS fluorescent screens in Unit I tubes.'],
  [31, 'Ga', 'Gallium', 'ගැලියම්', '69.723', 13, 4, 'p', 'post-transition', 'Solid', 1.81, '+3',
    'අතේ තැබූ විට දියවන (29.8 °C) දුර්ලභ අඩු ද්‍රවාංක ලෝහයකි; GaAs අර්ධ සන්නායක සඳහා වැදගත් වේ.',
    'Post-transition metal melting at just 29.8 °C (melts in your hand); crucial for GaAs LEDs and semiconductors.',
    'නිල්/සුදු LED බල්බ, අධිවේගී ට්‍රාන්සිස්ටර සහ සූර්ය කෝෂ.',
    'GaN/GaAs optoelectronic LEDs, RF transistors, and gallium liquid thermometers.'],
  [32, 'Ge', 'Germanium', 'ජර්මේනියම්', '72.630', 14, 4, 'p', 'metalloid', 'Solid', 2.01, '+2, +4',
    'මෙන්ඩලීව් විසින් "Eka-silicon" ලෙස අනාවැකි කියන ලද අර්ධ සන්නායක උපලෝහයකි.',
    'Classic metalloid predicted by Mendeleev as eka-silicon; brittle grey semiconductor with diamond lattice.',
    'ප්‍රකාශ තන්තු (Fiber optics), අධෝරක්ත කාච සහ ට්‍රාන්සිස්ටර.',
    'Optical fiber cores, infrared thermal lenses, and high-speed SiGe electronics.'],
  [33, 'As', 'Arsenic', 'ආසනික්', '74.922', 15, 4, 'p', 'metalloid', 'Solid', 2.18, '-3, +3, +5',
    'p-ගොනු උපලෝහයකි; කහ හා අළු බහුරූපතා පෙන්වන අතර As₂O₃ ප්‍රසිද්ධ විෂ සංයෝගයකි.',
    'Toxic p-block metalloid; shares group trends with nitrogen/phosphorus and forms GaAs semiconductors.',
    'GaAs චිප්ස්, ලේසර් ඩයෝඩ සහ ඊයම් බැටරි මිශ්‍ර ලෝහ.',
    'Gallium arsenide semiconductor doping and specialized glass/lead-alloy hardening.'],
  [34, 'Se', 'Selenium', 'සෙලේනියම්', '78.971', 16, 4, 'p', 'nonmetal', 'Solid', 2.55, '-2, +4, +6',
    'ආලෝකය වැටුණු විට විද්‍යුත් සන්නායකතාව වැඩිවන (Photoconductive) අලෝහයකි.',
    'Photoconductive chalcogen nonmetal; electrical conductivity jumps dramatically under illumination.',
    'ප්‍රකාශ කෝෂ, ලේසර් මුද්‍රණ යන්ත්‍ර සහ ප්‍රතිඔක්සිකාරක එන්සයිම.',
    'Photoreceptors, solar cells, glass decolorizing, and essential trace selenoproteins.'],
  [35, 'Br', 'Bromine', 'බ්‍රෝමීන්', '79.904', 17, 4, 'p', 'halogen', 'Liquid', 2.96, '-1, +1, +5',
    'කාමර උෂ්ණත්වයේදී ද්‍රවයක් ලෙස පවතින එකම අලෝහයයි; තද රතු-දුඹුරු දුම් පිටකරන අතර C=C අසන්තෘප්තතාව පරීක්ෂා කිරීමට යොදාගනී.',
    'Only nonmetallic liquid at 25 °C; dark reddish-brown volatile liquid whose water decolourizes rapidly with alkenes.',
    'ඇල්කීන හා ෆීනෝල් පරීක්ෂාව (Br₂ ජලය), AgBr ඡායාරූප පටල.',
    'Alkene C=C decolourization test, phenol 2,4,6-tribromophenol white precipitate, and cream AgBr precipitate.'],
  [36, 'Kr', 'Krypton', 'ක්‍රිප්ටන්', '83.798', 18, 4, 'p', 'noble-gas', 'Gas', 3.00, '0, +2',
    'අධි දීප්ති ෆ්ලෑෂ් ලාම්පු සඳහා භාවිතා කරන උච්ච වායුවකි; KrF₂ වැනි දුර්ලභ ෆ්ලෝරයිඩ සාදයි.',
    'Heavy noble gas producing crisp white glow in flashlamps; can form unstable KrF₂ under extreme conditions.',
    'අධිවේගී ඡායාරූප ෆ්ලෑෂ්, UV ලේසර් සහ විද්‍යුත් පහන්.',
    'High-speed flash lamps, excimer lasers, and precision wavelength standards.'],
  [37, 'Rb', 'Rubidium', 'රුබීඩියම්', '85.468', 1, 5, 's', 'alkali-metal', 'Solid', 0.82, '+1',
    'අතිශය ප්‍රතික්‍රියාශීලී මෘදු ක්ෂාර ලෝහයකි; ජලය සමඟ පුපුරන සුළු ලෙස ප්‍රතික්‍රියා කර දම්-රතු දැල්ලක් දෙයි.',
    'Very soft silvery alkali metal melting at 39 °C; explodes violently with water and burns violet-red.',
    'පරමාණුක ඔරලෝසු, GPS සමමුහුර්තකරණය සහ බෝස්-අයින්ස්ටයින් සංඝනීකරණ.',
    'Atomic frequency standards (GPS clocks), vacuum getter tubes, and laser-cooling physics.'],
  [38, 'Sr', 'Strontium', 'ස්ට්‍රොන්ෂියම්', '87.62', 2, 5, 's', 'alkaline-earth', 'Solid', 0.95, '+2',
    'Group 2 හි සාමාජිකයෙකි; සිසිල් ජලය සමඟ H₂ සාදන අතර ගිනිකෙළි වලට දීප්තිමත් රතු (Crimson) වර්ණයක් දෙයි.',
    'Alkaline-earth metal reacting briskly with cold water; its salts produce brilliant crimson red fireworks.',
    'ගිනිකෙළි වර්ණක, ප්‍රතිදීප්ත ෆොස්ෆර සහ SrCO₃ තාප වියෝජන ප්‍රවණතා.',
    'Crimson pyrotechnics, glow-in-the-dark SrAl₂O₄ phosphors, and Group 2 carbonate thermal stability trends.'],
  [39, 'Y', 'Yttrium', 'යිට්‍රියම්', '88.906', 3, 5, 'd', 'transition-metal', 'Solid', 1.22, '+3',
    '4d ආන්තරික ලෝහයකි; YBa₂Cu₃O₇ අධිසන්නායක සහ YAG ලේසර් නිපදවීමට වැදගත් වේ.',
    'Silvery 4d transition metal forming stable colourless Y³⁺; key in YBCO high-Tc superconductors and YAG lasers.',
    'YAG ලේසර්, සුදු LED ෆොස්ෆර සහ අධිසන්නායක.',
    'Nd:YAG lasers, white LED phosphors, and YBCO ceramic superconductors.'],
  [40, 'Zr', 'Zirconium', 'සර්කෝනියම්', '91.224', 4, 5, 'd', 'transition-metal', 'Solid', 1.33, '+4',
    'විඛාදනයට හා නියුට්‍රෝන අවශෝෂණයට අතිශය ප්‍රතිරෝධී ලෝහයකි.',
    'Corrosion-resistant refractory 4d metal with very low thermal-neutron capture cross section.',
    'න්‍යෂ්ටික ප්‍රතික්‍රියාකාරක ආවරණ, ZrO₂ සෙරමික් පිහි සහ කෘත්‍රිම මැණික්.',
    'Nuclear fuel cladding, zirconia ceramics, and cubic zirconia synthetic gems.'],
  [41, 'Nb', 'Niobium', 'නියෝබියම්', '92.906', 5, 5, 'd', 'transition-metal', 'Solid', 1.60, '+5',
    '[Kr] 4d⁴ 5s¹ වින්‍යාසය දරන 4d ලෝහයකි; අධිසන්නායක චුම්බක සෑදීමට යොදාගනී.',
    'Exhibits anomalous [Kr] 4d⁴ 5s¹ ground configuration; ductile superconductor used in particle accelerator magnets.',
    'MRI හා LHC අධිසන්නායක රැහැන් සහ අධි-ශක්ති වානේ.',
    'NbTi superconducting MRI magnets, LHC cavities, and jet-engine superalloys.'],
  [42, 'Mo', 'Molybdenum', 'මොලිබ්ඩිනම්', '95.95', 6, 5, 'd', 'transition-metal', 'Solid', 2.16, '+4, +6',
    '4d⁵ 5s¹ අර්ධ පිරුණු වින්‍යාසය ඇති ඉතා ඉහළ ද්‍රවාංකයක් (2623 °C) ඇති ලෝහයකි; නයිට්‍රජනේස් එන්සයිමයේ ඇත.',
    'Half-filled [Kr] 4d⁵ 5s¹ exception; high-melting metal essential in biological nitrogenase enzymes.',
    'වානේ දැඩි කිරීම, PO₄³⁻ ඇමෝනියම් මොලිබ්ඩේට් පරීක්ෂාව.',
    'Ammonium molybdate test for phosphate ions, high-strength steel, and MoS₂ lubricant.'],
  [43, 'Tc', 'Technetium', 'ටෙක්නීෂියම්', '98', 7, 5, 'd', 'transition-metal', 'Solid', 1.90, '+4, +7',
    'කෘත්‍රිමව සාදන ලද පළමු විකිරණශීලී මූලද්‍රව්‍යයයි (ස්ථායී සමස්ථානික නැත).',
    'Lightest element with no stable isotopes; first synthetically produced element in nuclear reactors.',
    '⁹⁹ᵐTc වෛද්‍ය ප්‍රතිබිම්බකරණ (SPECT) ස්කෑන්.',
    'Medical diagnostic nuclear imaging (Tc-99m radiopharmaceuticals).'],
  [44, 'Ru', 'Ruthenium', 'රුතේනියම්', '101.07', 8, 5, 'd', 'transition-metal', 'Solid', 2.20, '+3, +4, +8',
    '4d⁷ 5s¹ වින්‍යාසය දරන ප්ලැටිනම් කාණ්ඩයේ උත්ප්‍රේරක ලෝහයකි.',
    'Platinum-group metal ([Kr] 4d⁷ 5s¹); forms RuO₄ and Nobel-winning Grubbs alkene metathesis catalysts.',
    'සූර්ය කෝෂ ඩයි, හාඩ් ඩිස්ක් ආලේපන සහ කාබනික උත්ප්‍රේරක.',
    'Grubbs metathesis catalysts, dye-sensitized solar cells, and wear-resistant electrical contacts.'],
  [45, 'Rh', 'Rhodium', 'රෝඩියම්', '102.91', 9, 5, 'd', 'transition-metal', 'Solid', 2.28, '+3',
    'අතිශය දිලිසෙන වටිනා ලෝහයකි (4d⁸ 5s¹); මෝටර් රථ උත්ප්‍රේරක පරිවර්තක වල NOx ඉවත් කරයි.',
    'Silvery corrosion-proof metal ([Kr] 4d⁸ 5s¹); vital three-way catalytic converter metal reducing NOx.',
    'ත්‍රි-මාර්ග උත්ප්‍රේරක පරිවර්තක, විල්කින්සන් උත්ප්‍රේරකය සහ සුදු රත්‍රන් ආලේපනය.',
    'Automotive catalytic converters, Wilkinson hydrogenation catalyst, and reflective mirrors.'],
  [46, 'Pd', 'Palladium', 'පැලේඩියම්', '106.42', 10, 5, 'd', 'transition-metal', 'Solid', 2.20, '+2, +4',
    'සුවිශේෂී [Kr] 4d¹⁰ 5s⁰ වින්‍යාසය දරන එකම මූලද්‍රව්‍යයයි; තම පරිමාව මෙන් 900 ගුණයක් H₂ අවශෝෂණය කරයි.',
    'Unique [Kr] 4d¹⁰ ground state (zero 5s electrons); absorbs 900× its volume of hydrogen gas.',
    'Lindlar උත්ප්‍රේරකය (ඇල්කයින → සිස්-ඇල්කීන), Suzuki coupling සහ උත්ප්‍රේරක.',
    'Pd/BaSO₄ Lindlar catalyst, Pd/C hydrogenation, Suzuki-Miyaura cross-coupling, catalytic converters.'],
  [47, 'Ag', 'Silver', 'රිදී (සිල්වර්)', '107.87', 11, 5, 'd', 'transition-metal', 'Solid', 1.93, '+1',
    '[Kr] 4d¹⁰ 5s¹ වින්‍යාසය ඇති විද්‍යුත් හා තාප සන්නායකතාවයෙන් ඉහළම ලෝහයයි; ටොලන්ස් පරීක්ෂාවේදී රිදී කැඩපත සාදයි.',
    'Highest electrical & thermal conductivity of all elements ([Kr] 4d¹⁰ 5s¹); forms Ag⁺ halides and Tollens silver mirror.',
    'AgNO₃ හැලයිඩ පරීක්ෂාව, ටොලන්ස් ඇල්ඩිහයිඩ පරීක්ෂාව සහ සූර්ය පැනල.',
    'Tollens reagent [Ag(NH₃)₂]⁺ aldehyde mirror test, halide precipitation tests, and photovoltaic contacts.'],
  [48, 'Cd', 'Cadmium', 'කැඩ්මියම්', '112.41', 12, 5, 'd', 'transition-metal', 'Solid', 1.69, '+2',
    'මෘදු නිල්-සුදු ලෝහයකි; CdS දීප්තිමත් කහ වර්ණකයක් සාදන අතර Ni-Cd බැටරි වල යෙදේ.',
    'Soft 4d¹⁰ post-transition-like metal; Cd²⁺ forms yellow CdS precipitate and is used in CdTe solar panels.',
    'CdTe සූර්ය කෝෂ, න්‍යෂ්ටික පාලක දඬු සහ Ni-Cd බැටරි.',
    'Neutron-absorbing control rods, CdTe thin-film solar cells, and yellow CdS pigments.'],
  [49, 'In', 'Indium', 'ඉන්ඩියම්', '114.82', 13, 5, 'p', 'post-transition', 'Solid', 1.78, '+3',
    'නැවූ විට "හඬක්" නඟන මෘදු රිදී ලෝහයකි; ITO ස්පර්ශ තිර (Touchscreen) වල ප්‍රධාන වේ.',
    'Very soft metal that emits a metallic cry when bent; Indium Tin Oxide (ITO) powers touchscreens.',
    'LCD/OLED ස්පර්ශ තිර (ITO) සහ අඩු උෂ්ණත්ව පෑස්සුම්.',
    'Transparent conductive ITO coatings in smartphones, flat-panel displays, and InGaN LEDs.'],
  [50, 'Sn', 'Tin', 'ටින්', '118.71', 14, 5, 'p', 'post-transition', 'Solid', 1.96, '+2, +4',
    'Sn²⁺ (ප්‍රබල ඔක්සිහාරකය) හා Sn⁴⁺ අවස්ථා පෙන්වයි; කාබනික රසායනයේ නයිට්‍රොබෙන්සීන් ඇනිලීන් බවට ඔක්සිහරණය කරයි.',
    'Group 14 metal showing +2/+4 states (inert pair effect); Sn/conc. HCl reduces nitrobenzene to phenylamine.',
    'Sn/HCl නයිට්‍රොබෙන්සීන් ඔක්සිහරණය, ලෝකඩ (Cu+Sn) සහ පෑස්සුම් ලෝහ.',
    'Sn/HCl reduction of Ar-NO₂ to Ar-NH₂ in Unit VII organic chemistry, bronze alloys, and tinplate.'],
  [51, 'Sb', 'Antimony', 'ඇන්ටිමනි', '121.76', 15, 5, 'p', 'metalloid', 'Solid', 2.05, '-3, +3, +5',
    'දිලිසෙන අළු උපලෝහයකි; ගිනි ප්‍රතිරෝධක හා ඊයම්-අම්ල බැටරි තහඩු ශක්තිමත් කිරීමට යොදාගනී.',
    'Lustrous grey metalloid; alloys with lead to harden car-battery grids and produces flame retardants.',
    'Sb₂O₃ ගිනි නිවන ආලේපන, ඊයම් බැටරි සහ අර්ධ සන්නායක.',
    'Lead-acid battery plate hardening, Sb₂O₃ flame retardants, and infrared detectors.'],
  [52, 'Te', 'Tellurium', 'ටෙලූරියම්', '127.60', 16, 5, 'p', 'metalloid', 'Solid', 2.10, '-2, +4, +6',
    'රසායනිකව සෙලේනියම්ට සමාන දුර්ලභ උපලෝහයකි; CdTe සූර්ය පැනල සඳහා වැදගත් වේ.',
    'Rare silvery metalloid used in thermoelectric coolers, rewritable optical discs, and CdTe solar cells.',
    'තාප-විද්‍යුත් සිසිලන සහ CdTe සූර්ය පැනල.',
    'CdTe solar modules, Bi₂Te₃ Peltier thermoelectric devices, and metallurgy.'],
  [53, 'I', 'Iodine', 'අයඩීන්', '126.90', 17, 5, 'p', 'halogen', 'Solid', 2.66, '-1, +1, +5, +7',
    'දිලිසෙන කළු-දම් ඝනයකි; රත් කළ විට දම් පැහැ වාෂ්ප ලෙස ඌර්ධවපාතනය (Sublimation) වේ. පිෂ්ඨය සමඟ තද නිල් පැහැයක් දෙයි.',
    'Lustrous violet-black solid that sublimes to violet vapour; gives deep blue-black complex with starch.',
    'I₂/S₂O₃²⁻ අනුමාපන, I₂/NaOH අයඩොෆෝම් (CHI₃ කහ අවක්ෂේපය), සහ තයිරොයිඩ් හෝමෝන.',
    'Iodometric titrations with S₂O₃²⁻, CHI₃ yellow iodoform test (methyl ketones/ethanol), and yellow AgI↓.'],
  [54, 'Xe', 'Xenon', 'සෙනෝන්', '131.29', 18, 5, 'p', 'noble-gas', 'Gas', 2.60, '0, +2, +4, +6',
    'පළමු උච්ච වායු සංයෝග (XePtF₆, XeF₂, XeF₄) සෑදූ බර උච්ච වායුවයි; XeF₄ සමචතුරස්‍ර සමතල හැඩැතිය.',
    'First noble gas induced to form stable compounds (XeF₂, square-planar XeF₄, XeO₃); used in ion thrusters.',
    'අභ්‍යවකාශ අයන එන්ජින්, නිර්වින්දනය හා VSEPR XeF₄/XeF₂ අණු.',
    'Spacecraft Hall-effect ion thrusters, high-intensity arc lamps, and expanded-octet VSEPR examples.'],
  [55, 'Cs', 'Cesium', 'සීසියම්', '132.91', 1, 6, 's', 'alkali-metal', 'Solid', 0.79, '+1',
    'රන්වන් පැහැති අතිශය ප්‍රතික්‍රියාශීලී ක්ෂාර ලෝහයකි (28.5 °C දී දියවේ); SI තත්පරය අර්ථ දැක්වීමට ¹³³Cs යොදාගනී.',
    'Pale gold alkali metal melting at 28.5 °C; hyperfine transition of ¹³³Cs defines the SI second.',
    'පරමාණුක ඔරලෝසු (SI Second) සහ ප්‍රකාශ විද්‍යුත් කෝෂ.',
    'Primary cesium atomic clocks defining the SI second and photoelectric vacuum cathodes.'],
  [56, 'Ba', 'Barium', 'බේරියම්', '137.33', 2, 6, 's', 'alkaline-earth', 'Solid', 0.89, '+2',
    'ඇපල් කොළ (Apple Green) දැල්ලක් දෙන Group 2 ලෝහයකි; Ba²⁺ අයන SO₄²⁻ සමඟ සුදු අද්‍රාව්‍ය BaSO₄ අවක්ෂේපය සාදයි.',
    'Heavy Group 2 metal producing apple-green flames; BaCl₂ is the classic reagent detecting SO₄²⁻ via white BaSO₄↓.',
    'SO₄²⁻ අයන හඳුනාගැනීම (BaCl₂ + HCl) සහ X-කිරණ බේරියම් ආහාර.',
    'Sulfate ion qualitative test (acidified BaCl₂ → white BaSO₄↓) and medical GI X-ray contrast.'],
  [57, 'La', 'Lanthanum', 'ලැන්තනම්', '138.91', 3, 6, 'f', 'lanthanide', 'Solid', 1.10, '+3',
    'ලැන්තනයිඩ ශ්‍රේණියේ ආරම්භක මූලද්‍රව්‍යයයි ([Xe] 5d¹ 6s²); කැමරා කාච වල වර්තනාංකය වැඩි කිරීමට යොදාගනී.',
    'Prototype of the lanthanide series ([Xe] 5d¹ 6s²); boosts refractive index in high-grade camera lenses.',
    'La₂O₃ ප්‍රකාශ කාච, NiMH බැටරි සහ ඛනිජ තෙල් විඛණ්ඩන උත්ප්‍රේරක.',
    'High-index camera optics, NiMH hybrid vehicle batteries, and FCC petroleum catalysts.'],
  [58, 'Ce', 'Cerium', 'සීරියම්', '140.12', 3, 6, 'f', 'lanthanide', 'Solid', 1.12, '+3, +4',
    'බහුලතම ලැන්තනයිඩයයි; Ce⁴⁺ ප්‍රබල එක්-ඉලෙක්ට්‍රෝන ඔක්සිකාරකයක් ලෙස අනුමාපන වල යෙදේ.',
    'Most abundant rare-earth metal; forms both Ce³⁺ and oxidizing yellow Ce⁴⁺ ions used in cerimetry.',
    'ලයිටර් ගින්දර ගල් (Ferrocerium), Ce⁴⁺ අනුමාපන සහ වීදුරු ඔප දැමීම.',
    'Lighter flints (sparking ferrocerium), Ce(SO₄)₂ redox titrant, and catalytic converter O₂ storage.'],
  [59, 'Pr', 'Praseodymium', 'ප්‍රසියෝඩිමියම්', '140.91', 3, 6, 'f', 'lanthanide', 'Solid', 1.13, '+3',
    'වීදුරු පෑස්සුම්කරුවන්ගේ ආරක්ෂිත කණ්ණාඩි සහ ප්‍රබල Nd-Fe-B චුම්බක නිපදවීමට යොදාගනී.',
    'Lanthanide forming yellow-green salts; blocks intense sodium yellow glare in glassblower goggles.',
    'ආරක්ෂිත කහ-කොළ වීදුරු සහ ගුවන් යානා එන්ජින් මිශ්‍ර ලෝහ.',
    'Didymium safety goggles for glassblowing and high-strength magnet alloying.'],
  [60, 'Nd', 'Neodymium', 'නියෝඩිමියම්', '144.24', 3, 6, 'f', 'lanthanide', 'Solid', 1.14, '+3',
    'ලෝකයේ ප්‍රබලතම ස්ථිර චුම්බක (Nd₂Fe₁₄B) හා Nd:YAG ලේසර් සෑදීමට යොදාගනී.',
    'Forms the world’s strongest permanent magnets (Nd₂Fe₁₄B) and violet-pink glass filters.',
    'හෙඩ්ෆෝන්, EV මෝටර් චුම්බක සහ Nd:YAG ලේසර්.',
    'EV traction motors, wind turbine generators, speakers, and solid-state Nd:YAG lasers.'],
  [61, 'Pm', 'Promethium', 'ප්‍රොමීතියම්', '145', 3, 6, 'f', 'lanthanide', 'Solid', 1.13, '+3',
    'ලැන්තනයිඩ අතර ඇති එකම විකිරණශීලී (ස්ථායී සමස්ථානික නොමැති) මූලද්‍රව්‍යයයි.',
    'Only radioactive lanthanide with no stable isotopes; glows pale blue in nuclear micro-batteries.',
    'විශේෂිත කුඩා න්‍යෂ්ටික බැටරි සහ ඝනකම මැනීමේ මිනුම්.',
    'Miniature beta-voltaic nuclear batteries for pacemakers and thickness gauges.'],
  [62, 'Sm', 'Samarium', 'සැමේරියම්', '150.36', 3, 6, 'f', 'lanthanide', 'Solid', 1.17, '+2, +3',
    'ඉහළ උෂ්ණත්ව වලදී පවා චුම්බකත්වය රඳවාගන්නා SmCo₅ චුම්බක සාදයි.',
    'Forms SmCo₅ magnets resistant to demagnetization at elevated temperatures; SmI₂ is a mild one-electron reductant.',
    'අධි-උෂ්ණත්ව චුම්බක, SmI₂ කාබනික ඔක්සිහාරකය සහ පිළිකා විකිරණ ප්‍රතිකාර.',
    'Sm-Co high-temperature magnets and Kagan’s SmI₂ single-electron reducing reagent.'],
  [63, 'Eu', 'Europium', 'යුරෝපියම්', '151.96', 3, 6, 'f', 'lanthanide', 'Solid', 1.20, '+2, +3',
    'ලැන්තනයිඩ අතරින් වඩාත්ම ප්‍රතික්‍රියාශීලී මූලද්‍රව්‍යයයි; Eu³⁺ රතු හා Eu²⁺ නිල් ප්‍රතිදීප්ත ආලෝක නිකුත් කරයි.',
    'Most reactive lanthanide; emits sharp red (Eu³⁺) and blue (Eu²⁺) luminescence in banknotes and LEDs.',
    'යුරෝ මුදල් නෝට්ටු ව්‍යාජ විරෝධී ෆොස්ෆර සහ LED තිර.',
    'Anti-counterfeit UV phosphors on currency notes and colour display phosphors.'],
  [64, 'Gd', 'Gadolinium', 'ගැඩොලිනියම්', '157.25', 3, 6, 'f', 'lanthanide', 'Solid', 1.20, '+3',
    'අර්ධ පිරුණු 4f⁷ ස්ථායීතාව නිසා [Xe] 4f⁷ 5d¹ 6s² වින්‍යාසය හා යුගල නොවූ ඉලෙක්ට්‍රෝන 7ක් ඇත; අධික අනුචුම්බක ගුණ පෙන්වයි.',
    'Half-filled [Xe] 4f⁷ 5d¹ 6s² shell gives 7 unpaired electrons—highest spin paramagnetism for MRI contrast.',
    'MRI ස්කෑන් ප්‍රතිවිරුද්ධ කාරක (Contrast Agents) සහ චුම්බක සිසිලනය.',
    'Gd³⁺ chelate MRI contrast agents and magnetic refrigeration prototypes.'],
  [65, 'Tb', 'Terbium', 'ටර්බියම්', '158.93', 3, 6, 'f', 'lanthanide', 'Solid', 1.20, '+3',
    'UV ආලෝකය යටතේ දීප්තිමත් කොළ (Emerald Green) ප්‍රතිදීප්තියක් නිකුත් කරන දුර්ලභ පෘථිවි ලෝහයකි.',
    'Silvery rare-earth metal emitting vivid emerald-green fluorescence under UV excitation.',
    'කොළ LED ෆොස්ෆර, සොනාර් පද්ධති සහ මුදල් නෝට්ටු සලකුණු.',
    'Green phosphors in solid-state lighting, Terfenol-D magnetostrictive actuators.'],
  [66, 'Dy', 'Dysprosium', 'ඩිස්ප්‍රෝසියම්', '162.50', 3, 6, 'f', 'lanthanide', 'Solid', 1.22, '+3',
    'ඉතා ඉහළ චුම්බක සංවේදීතාවක් ඇත; විදුලි වාහන චුම්බක තාපයට ඔරොත්තු දීමට එක් කරයි.',
    'Possesses extremely high magnetic strength; added to Nd-Fe-B magnets for high-temp EV motors.',
    'සුළං ටර්බයින ජනක, EV මෝටර සහ න්‍යෂ්ටික පාලක දඬු.',
    'High-coercivity electric-vehicle magnets and compact metal-halide stadium lamps.'],
  [67, 'Ho', 'Holmium', 'හෝල්මියම්', '164.93', 3, 6, 'f', 'lanthanide', 'Solid', 1.23, '+3',
    'ස්වභාවිකව හමුවන ඕනෑම මූලද්‍රව්‍යයකට වඩා ඉහළම චුම්බක ඝූර්ණය (Magnetic moment) දරයි.',
    'Has the highest magnetic moment of any naturally occurring element; focuses intense magnetic flux.',
    'වෛද්‍ය Ho:YAG ලේසර් සහ අධි-ක්ෂේත්‍ර චුම්බක කෙළවර.',
    'Magnetic pole pieces for ultra-high fields and surgical Ho:YAG lasers.'],
  [68, 'Er', 'Erbium', 'අර්බියම්', '167.26', 3, 6, 'f', 'lanthanide', 'Solid', 1.24, '+3',
    'ලෝක අන්තර්ජාල ප්‍රකාශ තන්තු (Optical Fiber Amplifiers) වල සංඥා විස්තාරණය කිරීමට අත්‍යවශ්‍ය වේ.',
    'Pink-ion lanthanide essential for Erbium-Doped Fiber Amplifiers (EDFAs) powering global internet cables.',
    'ප්‍රකාශ තන්තු විස්තාරක (EDFA) සහ රෝස පැහැ කලා වීදුරු.',
    'Subsea optical fiber amplifiers and cosmetic/dental Er:YAG lasers.'],
  [69, 'Tm', 'Thulium', 'තූලියම්', '168.93', 3, 6, 'f', 'lanthanide', 'Solid', 1.25, '+3',
    'දුර්ලභ පෘථිවි ලෝහ අතරින් දුර්ලභම එකකි; අතේ ගෙන යා හැකි X-කිරණ ප්‍රභව වල භාවිතා වේ.',
    'Least abundant non-radioactive rare earth; ¹⁷⁰Tm acts as a compact portable X-ray radiation source.',
    'අතේ ගෙන යා හැකි X-කිරණ උපකරණ සහ අධි-උෂ්ණත්ව අධිසන්නායක.',
    'Portable medical/industrial X-ray sources and surgical thulium fiber lasers.'],
  [70, 'Yb', 'Ytterbium', 'යිටර්බියම්', '173.05', 3, 6, 'f', 'lanthanide', 'Solid', 1.10, '+2, +3',
    'සම්පූර්ණ 4f¹⁴ 6s² කවචයක් ඇති ලැන්තනයිඩයකි; අධි-නිරවද්‍ය ප්‍රකාශ පරමාණුක ඔරලෝසු වල භාවිතා වේ.',
    'Closed 4f¹⁴ 6s² shell metal powering ultra-precise optical lattice atomic clocks and fiber lasers.',
    'ප්‍රකාශ පරමාණුක ඔරලෝසු සහ Yb-fiber කාර්මික ලේසර්.',
    'Optical lattice clocks, ytterbium fiber lasers, and portable stress gauges.'],
  [71, 'Lu', 'Lutetium', 'ලුටේෂියම්', '174.97', 3, 6, 'd', 'lanthanide', 'Solid', 1.27, '+3',
    'ලැන්තනයිඩ සංකෝචනය (Lanthanide Contraction) හේතුවෙන් කුඩාම හා ඝනම ලැන්තනයිඩ ලෝහයයි.',
    'Smallest and densest lanthanide due to cumulative lanthanide contraction; 4f¹⁴ 5d¹ 6s².',
    'PET ස්කෑන් අනාවරක (LSO) සහ ඛනිජ තෙල් පිරිපහදු උත්ප්‍රේරක.',
    'LSO scintillators inside medical PET scanners and radiocarbon-ageing/petrochemical catalysts.'],
  [72, 'Hf', 'Hafnium', 'හැෆ්නියම්', '178.49', 4, 6, 'd', 'transition-metal', 'Solid', 1.30, '+4',
    'ලැන්තනයිඩ සංකෝචනය නිසා Zr හා සමාන අරයකින් යුක්තයි; නවීන CPU චිප්ස් වල high-k dielectric ලෙස යෙදේ.',
    'Chemically nearly identical to Zr because of lanthanide contraction; crucial high-k gate oxide in modern CPUs.',
    'පරිගණක ප්‍රොසෙසර (HfO₂), ප්ලාස්මා කැපුම් ඉලෙක්ට්‍රෝඩ සහ න්‍යෂ්ටික සබ්මැරීන්.',
    'HfO₂ high-k transistor dielectrics in modern silicon chips and nuclear control rods.'],
  [73, 'Ta', 'Tantalum', 'ටැන්ටලම්', '180.95', 5, 6, 'd', 'transition-metal', 'Solid', 1.50, '+5',
    'අම්ල හා ශරීර තරල මගින් විඛාදනය නොවන අතිශය ප්‍රතිරෝධී ලෝහයකි (ද්‍රවාංකය 3017 °C).',
    'Virtually immune to chemical attack by acids below 150 °C; high capacitance density for micro-electronics.',
    'ස්මාර්ට්ෆෝන් ධාරිත්‍රක (Capacitors), ශල්‍ය උපකරණ සහ තුර්බයින් තල.',
    'Miniature tantalum capacitors in electronics and biocompatible surgical implants.'],
  [74, 'W', 'Tungsten', 'ටංස්ටන්', '183.84', 6, 6, 'd', 'transition-metal', 'Solid', 2.36, '+4, +6',
    'සියලුම ලෝහ අතරින් ඉහළම ද්‍රවාංකය (3422 °C) හිමි මූලද්‍රව්‍යයයි; X-කිරණ නළ ඇනෝඩ හා සූත්‍රිකා සෑදීමට යෙදේ.',
    'Highest melting point of all pure metals (3422 °C); ideal for X-ray targets, filament bulbs, and WC tools.',
    'X-කිරණ නළ ඉලක්ක, බල්බ සූත්‍රිකා සහ ටංස්ටන් කාබයිඩ් කැපුම්.',
    'X-ray tube anodes, incandescent filaments, TIG electrodes, and tungsten carbide drills.'],
  [75, 'Re', 'Rhenium', 'රීනියම්', '186.21', 7, 6, 'd', 'transition-metal', 'Solid', 1.90, '+4, +7',
    'අතිශය දුර්ලභ ඉහළ ද්‍රවාංක (3186 °C) ලෝහයකි; ජෙට් එන්ජින් ටර්බයින් තල ශක්තිමත් කිරීමට යෙදේ.',
    'Ultra-rare refractory metal improving creep resistance of single-crystal jet-engine turbine blades.',
    'ජෙට් එන්ජින් සුපිරි මිශ්‍ර ලෝහ සහ අධි-ඔක්ටේන් පෙට්‍රල් උත්ප්‍රේරක.',
    'Jet engine turbine blades and Pt-Re reforming catalysts for high-octane fuel.'],
  [76, 'Os', 'Osmium', 'ඔස්මියම්', '190.23', 8, 6, 'd', 'transition-metal', 'Solid', 2.20, '+4, +8',
    'ස්වභාවයේ හමුවන ඝනත්වය උපරිම මූලද්‍රව්‍යයයි (22.59 g cm⁻³); OsO₄ ඇල්කීන සින්-ඩයිහයිඩ්‍රොක්සිලීකරණයට යෙදේ.',
    'Densest naturally occurring element (22.59 g/cm³); forms volatile OsO₄ used for alkene syn-dihydroxylation.',
    'උල්පත් පෑන් තුඩු, ඉලෙක්ට්‍රෝන අන්වීක්ෂ වර්ණක (OsO₄) සහ කාබනික සංස්ලේෂණ.',
    'OsO₄ syn-dihydroxylation of alkenes, electron-microscopy staining, and wear-proof nib tips.'],
  [77, 'Ir', 'Iridium', 'ඉරිඩියම්', '192.22', 9, 6, 'd', 'transition-metal', 'Solid', 2.20, '+3, +4',
    'විඛාදනයට වඩාත්ම ප්‍රතිරෝධී ලෝහයයි; ඩයිනෝසෝර වඳවීම පෙන්වන K-Pg පස් ස්ථරයේ බහුලව හමුවේ.',
    'Most corrosion-resistant metal known; asteroid-rich K-Pg boundary layer marker and spark-plug tips.',
    'ඉරිඩියම් ස්පාක් ප්ලග්, OLED ද්‍රව්‍ය සහ සම්මත මීටර් දණ්ඩ.',
    'Long-life spark plugs, OLED phosphorescent emitters, and standard Pt-Ir prototypes.'],
  [78, 'Pt', 'Platinum', 'ප්ලැටිනම්', '195.08', 10, 6, 'd', 'transition-metal', 'Solid', 2.28, '+2, +4',
    '[Xe] 4f¹⁴ 5d⁹ 6s¹ වින්‍යාසය ඇති නිෂ්ක්‍රීය උත්ප්‍රේරක ලෝහයකි; සම්මත හයිඩ්‍රජන් ඉලෙක්ට්‍රෝඩය (SHE) සඳහා අත්‍යවශ්‍ය වේ.',
    'Precious catalytic metal ([Xe] 4f¹⁴ 5d⁹ 6s¹); inert electrode in SHE (E° = 0.00 V) and cisplatin chemotherapy.',
    'SHE ඉලෙක්ට්‍රෝඩ, ඔස්ට්වෝල්ඩ් HNO₃ උත්ප්‍රේරක, ඉන්ධන කෝෂ සහ Cisplatin.',
    'Standard Hydrogen Electrode (SHE), fuel-cell electrocatalysts, Ostwald HNO₃ gauze, and cisplatin.'],
  [79, 'Au', 'Gold', 'රන් (ගෝල්ඩ්)', '196.97', 11, 6, 'd', 'transition-metal', 'Solid', 2.54, '+1, +3',
    '[Xe] 4f¹⁴ 5d¹⁰ 6s¹ සාපේක්ෂතාවාදී ආචරණ නිසා කහ පැහැයෙන් දිලිසේ; රදර්ෆර්ඩ් α-විසිරුම් පරීක්ෂාවේදී ඉතා තුනී පත්‍ර ලෙස තැලිය හැක.',
    'Malleable noble metal ([Xe] 4f¹⁴ 5d¹⁰ 6s¹); hammered to ~400 nm foil for Rutherford α-scattering.',
    'රදර්ෆර්ඩ් රන් පත්‍ර පරීක්ෂාව, මයික්‍රොචිප් රැහැන් සහ රාජාම්ලයේ (Aqua Regia) දියවීම.',
    'Rutherford gold foil experiment, corrosion-free microchip bonding, dissolves only in aqua regia.'],
  [80, 'Hg', 'Mercury', 'රසදිය (මර්කරි)', '200.59', 12, 6, 'd', 'transition-metal', 'Liquid', 2.00, '+1, +2',
    'සාමාන්‍ය උෂ්ණත්වයේදී ද්‍රවයක් ලෙස පවතින එකම ලෝහයයි; 760 mmHg වායුගෝලීය පීඩන බැරෝමීටර සඳහා පදනමයි.',
    'Only metallic element that is liquid at room temperature; basis of the 760 mmHg torr/barometer pressure scale.',
    'මිනුම් බැරෝමීටර (760 mmHg), උෂ්ණත්වමාන සහ රසදිය සංගුණක.',
    'Torricelli mercury barometer (760 mmHg), laboratory thermometers, and fluorescent vapour lamps.'],
  [81, 'Tl', 'Thallium', 'තැලියම්', '204.38', 13, 6, 'p', 'post-transition', 'Solid', 1.62, '+1, +3',
    'නිෂ්ක්‍රීය යුගල ආචරණය (Inert Pair Effect) නිසා +1 ඔක්සිකරණ අවස්ථාව +3 ට වඩා ස්ථායී වේ.',
    'Demonstrates the inert pair effect starkly: Tl⁺ (6s²) is much more stable than oxidizing Tl³⁺.',
    'අධෝරක්ත ද්‍රව්‍ය, හෘද ස්කෑන් (²⁰¹Tl) සහ අඩු උෂ්ණත්ව මිශ්‍ර ලෝහ.',
    '²⁰¹Tl cardiac stress imaging and infrared optical crystals (TlBr/TlI).'],
  [82, 'Pb', 'Lead', 'ඊයම් (ලෙඩ්)', '207.2', 14, 6, 'p', 'post-transition', 'Solid', 2.33, '+2, +4',
    'නිෂ්ක්‍රීය යුගල ආචරණය නිසා Pb²⁺ ස්ථායී වේ; PbI₂ රන්වන් කහ අවක්ෂේපය (Golden Rain) හා විකිරණ ආවරණ සාදයි.',
    'Dense malleable metal where Pb²⁺ dominates (+2 > +4); forms iconic yellow PbI₂ and white hot-soluble PbCl₂.',
    'ඊයම්-අම්ල කාර් බැටරි, විකිරණ ආවරණ (Unit I α-ප්‍රභව ආවරණය) සහ PbI₂ පරීක්ෂාව.',
    'Lead-acid storage batteries, radiation shielding, and golden PbI₂ precipitation in qualitative analysis.'],
  [83, 'Bi', 'Bismuth', 'බිස්මත්', '208.98', 15, 6, 'p', 'post-transition', 'Solid', 2.02, '+3, +5',
    'දේදුනු ඔක්සයිඩ් ස්ථර හා පඩිපෙළ ස්ඵටික සාදන, බර ලෝහ අතරින් විෂ රහිතම මූලද්‍රව්‍යයකි.',
    'Diamagnetic metal forming iridescent hopper crystals; unusually low toxicity despite being next to lead.',
    'විෂ රහිත පෑස්සුම්, ඖෂධ (Bismuth subsalicylate) සහ ගිනි ස්ප්‍රින්ක්ලර්.',
    'Lead-free solders, Pepto-Bismol pharmaceuticals, and low-melting fire sprinkler fusible alloys.'],
  [84, 'Po', 'Polonium', 'පොලෝනියම්', '209', 16, 6, 'p', 'post-transition', 'Solid', 2.00, '+2, +4',
    'මාරි සහ පියරේ කියුරි විසින් 1898 දී සොයාගත් අධි විකිරණශීලී α-විකිරණ ප්‍රභවයකි.',
    'Intensely radioactive α-emitter discovered by Marie & Pierre Curie in 1898; used in unit-cell α sources.',
    'ස්ථිතික විදුලිය ඉවත් කිරීමේ බුරුසු සහ අභ්‍යවකාශ තාප ප්‍රභව.',
    'Industrial anti-static ionizing brushes and early alpha-particle physics experiments.'],
  [85, 'At', 'Astatine', 'ඇස්ටටීන්', '210', 17, 6, 'p', 'halogen', 'Solid', 2.20, '-1, +1',
    'පෘථිවි කබොලේ හමුවන දුර්ලභම ස්වභාවික මූලද්‍රව්‍යය වන විකිරණශීලී හැලජනයකි.',
    'Rarest naturally occurring element in Earth’s crust; short-lived radioactive halogen heavier than iodine.',
    '²¹¹At ඉලක්කගත ඇල්ෆා පිළිකා ප්‍රතිකාර පර්යේෂණ.',
    'Targeted alpha-particle cancer immunotherapy research (²¹¹At).'],
  [86, 'Rn', 'Radon', 'රේඩෝන්', '222', 18, 6, 'p', 'noble-gas', 'Gas', 2.20, '0, +2',
    'යුරේනියම් හා රේඩියම් ක්ෂය වීමෙන් සෑදෙන බර විකිරණශීලී උච්ච වායුවකි.',
    'Dense colourless radioactive noble gas formed from radium α-decay inside granitic soils.',
    'භූගර්භ විද්‍යාත්මක අධ්‍යයන සහ ගෘහස්ථ විකිරණ ආරක්ෂණ මැනීම.',
    'Indoor radon radiation monitoring and geological fault-tracing sensors.'],
  [87, 'Fr', 'Francium', 'ෆ්‍රැන්සියම්', '223', 1, 7, 's', 'alkali-metal', 'Solid', 0.70, '+1',
    'අතිශයින් අස්ථායී විකිරණශීලී ක්ෂාර ලෝහයකි (අර්ධ ආයු කාලය මිනිත්තු 22 කි).',
    'Heaviest alkali metal with half-life of only 22 minutes; lowest predicted ionization energy.',
    'පරමාණුක ව්‍යුහ මූලික භෞතික විද්‍යා පරීක්ෂණ.',
    'Fundamental atomic parity-violation spectroscopy experiments in particle accelerators.'],
  [88, 'Ra', 'Radium', 'රේඩියම්', '226', 2, 7, 's', 'alkaline-earth', 'Solid', 0.90, '+2',
    'රදර්ෆර්ඩ්ගේ රන් පත්‍ර පරීක්ෂාව සඳහා α-අංශු ප්‍රභවය ලෙස භාවිතා කළ දිලිසෙන විකිරණශීලී ලෝහයයි.',
    'Luminescent radioactive Group 2 metal isolated by Marie Curie; historic α-source for Rutherford’s gold foil lab.',
    'ඓතිහාසික රදර්ෆර්ඩ් α-ප්‍රභවය සහ ²²³Ra අස්ථි පිළිකා ප්‍රතිකාර.',
    'Historic Rutherford α-beam source and modern ²²³Ra targeted bone-metastasis radiotherapy.'],
  [89, 'Ac', 'Actinium', 'ඇක්ටිනියම්', '227', 3, 7, 'f', 'actinide', 'Solid', 1.10, '+3',
    'ඇක්ටිනයිඩ ශ්‍රේණියේ ආරම්භක මූලද්‍රව්‍යයයි ([Rn] 6d¹ 7s²); අඳුරේ නිල් පැහැයෙන් දිලිසේ.',
    'Prototype actinide ([Rn] 6d¹ 7s²) glowing pale blue in darkness from intense Cherenkov/air ionization.',
    '²²⁵Ac පිළිකා ප්‍රතිකාර සහ අභ්‍යවකාශ නියුට්‍රෝන ප්‍රභව.',
    '²²⁵Ac targeted alpha therapy (TAT) and beryllium-actinium neutron sources.'],
  [90, 'Th', 'Thorium', 'තෝරියම්', '232.04', 3, 7, 'f', 'actinide', 'Solid', 1.30, '+4',
    '[Rn] 6d² 7s² වින්‍යාසය ඇති ස්වභාවිකව බහුල විකිරණශීලී ඇක්ටිනයිඩයකි.',
    'Weakly radioactive actinide ([Rn] 6d² 7s²); fertile fuel for molten-salt thorium reactors.',
    'තෝරියම් න්‍යෂ්ටික ප්‍රතික්‍රියාකාරක, TIG ඉලෙක්ට්‍රෝඩ සහ ලන්තෑරුම් මැන්ටල්.',
    'Clean thorium molten-salt reactor fuel cycles and thoriated tungsten arc electrodes.'],
  [91, 'Pa', 'Protactinium', 'ප්‍රොටැක්ටිනියම්', '231.04', 3, 7, 'f', 'actinide', 'Solid', 1.50, '+5',
    'යුරේනියම් හා තෝරියම් අතර ඇති දුර්ලභ විකිරණශීලී ඇක්ටිනයිඩයකි ([Rn] 5f² 6d¹ 7s²).',
    'Dense, scarce radioactive actinide forming +4 and +5 aqueous species.',
    'සාගර අවසාදිත කාලනිර්ණය (Pa/Th dating).',
    'Paleoceanographic ²³¹Pa/²³⁰Th radiometric dating of deep-sea sediments.'],
  [92, 'U', 'Uranium', 'යුරේනියම්', '238.03', 3, 7, 'f', 'actinide', 'Solid', 1.38, '+4, +6',
    '²³⁵U න්‍යෂ්ටික විඛණ්ඩන ඉන්ධනය ලෙස ලෝක ප්‍රසිද්ධය; UO₂²⁺ කහ පැහැ ප්‍රතිදීප්තියක් දෙයි.',
    'Dense actinide ([Rn] 5f³ 6d¹ 7s²); ²³⁵U sustains nuclear fission and uranyl salts fluoresce bright yellow-green.',
    'න්‍යෂ්ටික බලාගාර ඉන්ධන, භූ විද්‍යාත්මක U-Pb කාලනිර්ණය.',
    'Nuclear fission power fuel, U-Pb geochronology dating Earth’s oldest rocks, and fluorescent glass.'],
  [93, 'Np', 'Neptunium', 'නෙප්ටූනියම්', '237', 3, 7, 'f', 'actinide', 'Solid', 1.36, '+3 to +7',
    'පළමු පාර-යුරේනික් (Transuranic) මූලද්‍රව්‍යයයි; ප්ලූටෝනියම්-238 නිපදවීමට යොදාගනී.',
    'First synthetic transuranic actinide ([Rn] 5f⁴ 6d¹ 7s²); precursor to space-probe ²³⁸Pu.',
    '²³⁸Pu අභ්‍යවකාශ බැටරි නිෂ්පාදනය සහ නියුට්‍රෝන අනාවරක.',
    'Target isotope for synthesizing ²³⁸Pu radioisotope thermoelectric generators (RTGs).'],
  [94, 'Pu', 'Plutonium', 'ප්ලූටෝනියම්', '244', 3, 7, 'f', 'actinide', 'Solid', 1.28, '+3 to +6',
    '²³⁸Pu වොයේජර් සහ මාර්ස් රෝවර් (Curiosity/Perseverance) යානා වල විදුලි බලය සපයයි.',
    'Complex metallic actinide; ²³⁸Pu powers deep-space probes (Voyager, Mars rovers) for decades.',
    'අභ්‍යවකාශ RTG විදුලි ජනක සහ ²³⁹Pu න්‍යෂ්ටික ඉන්ධන.',
    'RTG nuclear batteries on Voyager & Mars rovers and MOX reactor fuel.'],
  [95, 'Am', 'Americium', 'ඇමරිසියම්', '243', 3, 7, 'f', 'actinide', 'Solid', 1.30, '+3',
    'නිවෙස්වල ඇති දුම් අනාවරක (Smoke Detectors) තුළ ²⁴¹Am α-විකිරණ ප්‍රභවය ලෙස භාවිතා වේ.',
    'Synthetic actinide; ²⁴¹Am serves as the ionization source inside household smoke detectors.',
    'ගෘහස්ථ දුම් අනාවරක (Smoke Detectors) සහ ඝනකම මාන.',
    'Household ionization smoke alarms and industrial gamma/neutron gauges.'],
  [96, 'Cm', 'Curium', 'කියුරියම්', '247', 3, 7, 'f', 'actinide', 'Solid', 1.30, '+3',
    'මාරි සහ පියරේ කියුරි නමින් නම් කළ 5f⁷ 6d¹ 7s² මූලද්‍රව්‍යයයි; මාර්ස් රෝවරයේ APXS පරීක්ෂකයේ යෙදේ.',
    'Named after Marie & Pierre Curie ([Rn] 5f⁷ 6d¹ 7s²); powers Mars rover rock-composition X-ray spectrometers.',
    'අඟහරු රෝවර් පාෂාණ විශ්ලේෂක (APXS) සහ අභ්‍යවකාශ තාප ප්‍රභව.',
    'Alpha Particle X-Ray Spectrometers (APXS) aboard Mars rovers analyzing Martian rocks.'],
  [97, 'Bk', 'Berkelium', 'බර්කේලියම්', '247', 3, 7, 'f', 'actinide', 'Solid', 1.30, '+3, +4',
    'බර්ක්ලි විද්‍යාගාරයේදී සොයාගත් විකිරණශීලී ඇක්ටිනයිඩයකි; Tennessine (Z=117) සෑදීමට ඉලක්කය විය.',
    'Transuranic actinide synthesized at UC Berkeley; served as target material to discover Tennessine (Z=117).',
    'අති-බර මූලද්‍රව්‍ය සංස්ලේෂණ පර්යේෂණ.',
    'Accelerator target for creating superheavy element 117 (Tennessine).'],
  [98, 'Cf', 'Californium', 'කැලිෆෝනියම්', '251', 3, 7, 'f', 'actinide', 'Solid', 1.30, '+3',
    '²⁵²Cf ප්‍රබල නියුට්‍රෝන විමෝචකයකි; න්‍යෂ්ටික ප්‍රතික්‍රියාකාරක ආරම්භ කිරීමට යොදාගනී.',
    'Intense neutron emitter (²⁵²Cf); used to start up nuclear reactors and scan airline luggage/coal.',
    'න්‍යෂ්ටික ප්‍රතික්‍රියාකාරක ආරම්භක සහ ඛනිජ විශ්ලේෂණ ස්කෑනර.',
    'Reactor startup neutron sources, Prompt Gamma Neutron Activation oil-well logging.'],
  [99, 'Es', 'Einsteinium', 'අයින්ස්ටයිනියම්', '252', 3, 7, 'f', 'actinide', 'Solid', 1.30, '+3',
    'ඇල්බට් අයින්ස්ටයින් ගෞරවයෙන් නම් කළ දුර්ලභ සංස්ලේෂිත ඇක්ටිනයිඩයකි.',
    'Named after Albert Einstein; glows blue from intense self-irradiation and aided Mendelevium discovery.',
    'මූලික අධි-බර මූලද්‍රව්‍ය රසායන පර්යේෂණ.',
    'Fundamental f-element coordination chemistry and calibration of superheavy synthesis.'],
  [100, 'Fm', 'Fermium', 'ෆර්මියම්', '257', 3, 7, 'f', 'actinide', 'Solid', 1.30, '+3',
    'එන්රිකෝ ෆර්මි නමින් නම් කළ 100 වන මූලද්‍රව්‍යයයි; නියුට්‍රෝන ග්‍රහණයෙන් සෑදිය හැකි අවසන් මූලද්‍රව්‍යයයි.',
    'Element 100 named after Enrico Fermi; heaviest element reachable solely by neutron bombardment.',
    'න්‍යෂ්ටික භෞතික විද්‍යා පර්යේෂණ.',
    'Heavy-element nuclear fission and radiochemistry studies.'],
  [101, 'Md', 'Mendelevium', 'මෙන්ඩලීවියම්', '258', 3, 7, 'f', 'actinide', 'Solid', 1.30, '+2, +3',
    'ආවර්තිතා වගුවේ නිර්මාතෘ දිමිත්‍රි මෙන්ඩලීව් නමින් නම් කළ 101 වන මූලද්‍රව්‍යයයි.',
    'Named after Dmitri Mendeleev, creator of the Periodic Table; synthesized atom-by-atom from Es.',
    'පරමාණු-එකින්-එක රසායන විද්‍යා පර්යේෂණ.',
    'Atom-at-a-time radiochemical studies confirming late-actinide +2/+3 redox behaviour.'],
  [102, 'No', 'Nobelium', 'නොබේලියම්', '259', 3, 7, 'f', 'actinide', 'Solid', 1.30, '+2, +3',
    'ඇල්ෆ්‍රඩ් නොබෙල් නමින් නම් කළ 5f¹⁴ 7s² මූලද්‍රව්‍යයයි; ද්‍රාවණයේදී No²⁺ අවස්ථාව ස්ථායී වේ.',
    'Closed 5f¹⁴ 7s² shell actinide named after Alfred Nobel; unusually prefers +2 oxidation state in solution.',
    'සාපේක්ෂතාවාදී f-කවච රසායන අධ්‍යයන.',
    'Confirms relativistic stabilization of 5f¹⁴ making +2 state dominant in solution.'],
  [103, 'Lr', 'Lawrencium', 'ලෝරන්සියම්', '266', 3, 7, 'd', 'actinide', 'Solid', 1.30, '+3',
    'ඇක්ටිනයිඩ ශ්‍රේණියේ අවසන් මූලද්‍රව්‍යයයි ([Rn] 5f¹⁴ 7s² 7p¹); සාපේක්ෂතාවාදී ආචරණ නිසා 7p¹ ඉලෙක්ට්‍රෝනය දරයි.',
    'Final actinide; relativistic effects stabilize 7p¹ over 6d¹, giving [Rn] 5f¹⁴ 7s² 7p¹.',
    'සාපේක්ෂතාවාදී ක්වොන්ටම් රසායන පරීක්ෂණ.',
    'Single-atom ionization-potential studies confirming relativistic p-orbital ground state.'],
  [104, 'Rf', 'Rutherfordium', 'රදර්ෆර්ඩියම්', '267', 4, 7, 'd', 'transition-metal', 'Solid', null, '+4',
    'න්‍යෂ්ටිය සොයාගත් අර්නස්ට් රදර්ෆර්ඩ් ගෞරවයෙන් නම් කළ පළමු ට්‍රාන්ස්ඇක්ටිනයිඩ (6d²) මූලද්‍රව්‍යයයි.',
    'First transactinide (superheavy) element named after Ernest Rutherford; behaves as heavier homolog of Hf.',
    'සුපිරි බර මූලද්‍රව්‍ය ආවර්තිතා ප්‍රවණතා පරීක්ෂණ.',
    'Gas-phase chloride studies comparing RfCl₄ volatility with ZrCl₄ and HfCl₄.'],
  [105, 'Db', 'Dubnium', 'ඩුබ්නියම්', '268', 5, 7, 'd', 'transition-metal', 'Solid', null, '+5',
    'රුසියාවේ ඩුබ්නා න්‍යෂ්ටික පර්යේෂණාගාරය නමින් නම් කළ Group 5 සුපිරි බර මූලද්‍රව්‍යයකි.',
    'Named after Dubna (JINR); Group 5 superheavy metal showing niobium/tantalum-like +5 halide chemistry.',
    'සුපිරි බර මූලද්‍රව්‍ය න්‍යෂ්ටික විද්‍යාව.',
    'Liquid-extraction and halide volatility experiments on relativistic Group 5 trends.'],
  [106, 'Sg', 'Seaborgium', 'සීබෝගියම්', '269', 6, 7, 'd', 'transition-metal', 'Solid', null, '+6',
    'ග්ලෙන් සීබෝග් නමින් නම් කළ Group 6 මූලද්‍රව්‍යයයි; Sg(CO)₆ වැනි කාබොනිල් සංකීර්ණ සාදයි.',
    'Named after Glenn T. Seaborg; forms volatile hexacarbonyl Sg(CO)₆ just like Mo and W.',
    'Group 6 සුපිරි බර මූලද්‍රව්‍ය සංසන්දන.',
    'Synthesis of Sg(CO)₆ confirming Group 6 transition-metal classification.'],
  [107, 'Bh', 'Bohrium', 'බෝරියම්', '270', 7, 7, 'd', 'transition-metal', 'Solid', null, '+7',
    'නීල්ස් බෝර් නමින් නම් කළ Group 7 මූලද්‍රව්‍යයයි; BhO₃Cl සාදන බව තහවුරු කර ඇත.',
    'Named after Niels Bohr; forms volatile BhO₃Cl mirroring Mn and Re in Group 7.',
    'බෝර් ආකෘති හා Group 7 රසායන පරීක්ෂණ.',
    'Gas thermochromatography confirming Group 7 oxychloride BhO₃Cl behaviour.'],
  [108, 'Hs', 'Hassium', 'හැසියම්', '277', 8, 7, 'd', 'transition-metal', 'Solid', null, '+8',
    'ජර්මනියේ හෙසේ (Hesse/GSI) නමින් නම් කළ Group 8 මූලද්‍රව්‍යයයි; HsO₄ වාෂ්පශීලී ටෙට්‍රොක්සයිඩය සාදයි.',
    'Named after Hesse (GSI Darmstadt); forms volatile tetroxide HsO₄ analogous to OsO₄.',
    'සුපිරි බර ඔක්සයිඩ රසායන පර්යේෂණ.',
    'Cryo-thermochromatography proving formation of tetrahedral HsO₄.'],
  [109, 'Mt', 'Meitnerium', 'මයිට්නේරියම්', '278', 9, 7, 'd', 'transition-metal', 'Solid', null, '+3',
    'න්‍යෂ්ටික විඛණ්ඩනය පැහැදිලි කළ ලීස් මයිට්නර් (Lise Meitner) ගෞරවයෙන් නම් කළ මූලද්‍රව්‍යයයි.',
    'Named after nuclear fission pioneer Lise Meitner; Group 9 superheavy transition element.',
    'න්‍යෂ්ටික භෞතික විද්‍යා පර්යේෂණ.',
    'Heavy-ion fusion synthesis research at GSI/RIKEN.'],
  [110, 'Ds', 'Darmstadtium', 'ඩාම්ස්ටැටියම්', '281', 10, 7, 'd', 'transition-metal', 'Solid', null, '+2, +4',
    'ඩාම්ස්ටැට් GSI ආයතනය නමින් නම් කළ ප්ලැටිනම්ට පහළින් ඇති Group 10 මූලද්‍රව්‍යයයි.',
    'Named after Darmstadt, Germany; Group 10 homolog of platinum with millisecond half-life isotopes.',
    'න්‍යෂ්ටික ත්වරණකාරක පර්යේෂණ.',
    'Heavy-ion collision synthesis probing nuclear shell stability.'],
  [111, 'Rg', 'Roentgenium', 'රොන්ට්ගනියම්', '282', 11, 7, 'd', 'transition-metal', 'Solid', null, '+3',
    'X-කිරණ සොයාගත් විල්හෙල්ම් රොන්ට්ගන් නමින් නම් කළ Group 11 රන්-පවුලේ මූලද්‍රව්‍යයයි.',
    'Named after X-ray discoverer Wilhelm Röntgen; relativistic Group 11 homolog of gold.',
    'X-කිරණ ඉතිහාසය හා සුපිරි බර මූලද්‍රව්‍ය.',
    'Produced via cold fusion of ²⁰⁹Bi and ⁶⁴Ni in particle accelerators.'],
  [112, 'Cn', 'Copernicium', 'කොපර්නිකියම්', '285', 12, 7, 'd', 'transition-metal', 'Liquid', null, '+2',
    'නිකලස් කොපර්නිකස් නමින් නම් කළ Group 12 මූලද්‍රව්‍යයයි; සාපේක්ෂතාවාදී ආචරණ නිසා වාෂ්පශීලී ද්‍රව/වායුමය ගුණ පෙන්වයි.',
    'Named after Nicolaus Copernicus; relativistic 7s² stabilization makes it remarkably volatile like noble/Hg.',
    'සාපේක්ෂතාවාදී රසායන ගුණ පරීක්ෂණ.',
    'Gold-surface adsorption experiments comparing Copernicium volatility with Hg and Rn.'],
  [113, 'Nh', 'Nihonium', 'නිහෝනියම්', '286', 13, 7, 'p', 'post-transition', 'Solid', null, '+1',
    'ආසියාවේ (ජපානය - RIKEN) ප්‍රථම වරට සොයාගත් සුපිරි බර Group 13 මූලද්‍රව්‍යයයි.',
    'First superheavy element discovered in Asia (RIKEN, Japan); Group 13 7p¹ post-transition element.',
    'ආසියානු න්‍යෂ්ටික විද්‍යා ජයග්‍රහණ.',
    'Cold fusion synthesis at RIKEN Linear Accelerator (²⁰⁹Bi + ⁷⁰Zn).'],
  [114, 'Fl', 'Flerovium', 'ෆ්ලෙරෝවියම්', '289', 14, 7, 'p', 'post-transition', 'Solid', null, '+2',
    'ජෝර්ජි ෆ්ලෙරොව් නමින් නම් කළ Group 14 (7p²) මූලද්‍රව්‍යයයි; "ස්ථායීතා දූපත" ආසන්නයේ පිහිටයි.',
    'Named after Georgy Flerov; near the theoretical "island of nuclear stability" (Z=114).',
    'න්‍යෂ්ටික ස්ථායීතා දූපත් පර්යේෂණ.',
    'Gas-phase adsorption tests probing quasi-noble-gas relativistic 7p₁/₂ closure.'],
  [115, 'Mc', 'Moscovium', 'මොස්කෝවියම්', '290', 15, 7, 'p', 'post-transition', 'Solid', null, '+1, +3',
    'මොස්කව් කලාපය නමින් නම් කළ Group 15 (7p³) සුපිරි බර මූලද්‍රව්‍යයයි.',
    'Named after the Moscow region (Dubna JINR + LLNL); Group 15 heaviest pnictogen.',
    'සුපිරි බර න්‍යෂ්ටික සංස්ලේෂණ.',
    'Alpha-decay chain precursor producing Nihonium isotopes in heavy-ion beams.'],
  [116, 'Lv', 'Livermorium', 'ලිවර්මෝරියම්', '293', 16, 7, 'p', 'post-transition', 'Solid', null, '+2',
    'ලෝරන්ස් ලිවර්මෝර් විද්‍යාගාරය නමින් නම් කළ Group 16 (7p⁴) සුපිරි බර මූලද්‍රව්‍යයයි.',
    'Named after Lawrence Livermore National Laboratory; heaviest Group 16 chalcogen.',
    'න්‍යෂ්ටික ව්‍යුහ පර්යේෂණ.',
    'Synthesized by bombarding curium-248 with calcium-48 ions.'],
  [117, 'Ts', 'Tennessine', 'ටෙනසීන්', '294', 17, 7, 'p', 'halogen', 'Solid', null, '-1, +1, +3',
    'ටෙනසි ප්‍රාන්තය නමින් නම් කළ 7p⁵ හැලජන පවුලේ බරම මූලද්‍රව්‍යයයි (අර්ධ-ලෝහ ගුණ පුරෝකථනය කෙරේ).',
    'Named after Tennessee (Oak Ridge/Vanderbilt); heaviest Group 17 element predicted to show metalloid character.',
    'අවසාන කාණ්ඩ 17 ආවර්තිතා ප්‍රවණතා.',
    'Synthesized from ²⁴⁹Bk + ⁴⁸Ca collisions in 2010.'],
  [118, 'Og', 'Oganesson', 'ඔගනෙසොන්', '294', 18, 7, 'p', 'noble-gas', 'Solid', null, '0, +2',
    'යූරි ඔගනෙසියන් නමින් නම් කළ 118 වන (7p⁶) ආවර්තිතා වගුවේ අවසාන මූලද්‍රව්‍යයයි; ඉහළ ධ්‍රැවීකරණය නිසා ඝනයක් ලෙස අපේක්ෂා කෙරේ.',
    'Heaviest known element (Z=118, 7p⁶), named after Yuri Oganessian; predicted solid at 25 °C despite Group 18.',
    'ආවර්තිතා වගුවේ 7 වන ආවර්තය සම්පූර්ණ කිරීම.',
    'Completes Period 7 of the modern Periodic Table; probes extreme relativistic shell structure.'],
];

function computeGridPosition(z: number, group: number, period: number): { gridRow: number; gridCol: number } {
  if (z >= 57 && z <= 71) {
    return { gridRow: 9, gridCol: z - 57 + 4 }; // Cols 4..18
  }
  if (z >= 89 && z <= 103) {
    return { gridRow: 10, gridCol: z - 89 + 4 }; // Cols 4..18
  }
  return { gridRow: period, gridCol: group };
}

const AL_FOCUS_SET = new Set<number>([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 35, 38, 47, 50, 53, 56, 78, 79, 80, 82, 88, 92,
]);

export const ALL_ELEMENTS: ChemicalElementSpec[] = RAW_ELEMENTS.map(
  ([z, symbol, nameEn, nameSi, mass, group, period, block, category, state, en, ox, descSi, descEn, usesSi, usesEn]) => {
    const elec = computeElectronData(z);
    const { gridRow, gridCol } = computeGridPosition(z, group, period);
    return {
      z,
      symbol,
      name: { si: nameSi, en: nameEn },
      mass,
      group,
      period,
      gridRow,
      gridCol,
      block,
      category,
      state,
      electronegativity: en,
      oxidationStates: ox,
      shells: elec.shells,
      fullElectronConfig: elec.fullElectronConfig,
      shortElectronConfig: elec.shortElectronConfig,
      isExceptionConfig: elec.isExceptionConfig,
      alFocus: AL_FOCUS_SET.has(z),
      description: { si: descSi, en: descEn },
      usesAndLabNotes: { si: usesSi, en: usesEn },
    };
  }
);

export function getElementByZ(z: number): ChemicalElementSpec {
  return ALL_ELEMENTS.find((el) => el.z === z) ?? ALL_ELEMENTS[0];
}
