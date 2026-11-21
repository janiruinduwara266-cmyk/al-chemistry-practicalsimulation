import type { LocalizedText, UnitRoman } from '../types/lab';

export type EquipmentCategory = 'electric' | 'volumetric' | 'thermal-gas' | 'atomic-electro';

export interface SampleChoice {
  id: string;
  label: LocalizedText;
}

export interface LabInstrumentSpec {
  id: string;
  category: EquipmentCategory;
  unitBadges: UnitRoman[];
  isElectric: boolean;
  name: LocalizedText;
  shortName: LocalizedText;
  whatItDoes: LocalizedText;
  howItWorks: LocalizedText;
  examTips: LocalizedText;
  voiceSummary: LocalizedText;
  operateLabel: LocalizedText;
  sliderLabel: LocalizedText;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  sliderDefault: number;
  sliderUnit: string;
  samples: SampleChoice[];
  defaultSample: string;
}

export interface InstrumentRuntimeState {
  active: boolean;
  sliderValue: number;
  sampleId: string;
}

export interface InstrumentTelemetry {
  primaryReading: string;
  secondaryReading: string;
  statusLabel: LocalizedText;
  accentColor: string;
}

export const EQUIPMENT_CATEGORIES: Array<{
  id: EquipmentCategory | 'all';
  label: LocalizedText;
}> = [
  { id: 'all', label: { si: 'සියල්ල (20)', en: 'All Tools (20)' } },
  { id: 'electric', label: { si: 'විදුලි උපකරණ (7)', en: 'Electric & Meters (7)' } },
  { id: 'volumetric', label: { si: 'පරිමාමිතික (4)', en: 'Volumetric (4)' } },
  { id: 'thermal-gas', label: { si: 'තාප හා වායු (5)', en: 'Thermal & Gas (5)' } },
  { id: 'atomic-electro', label: { si: 'පරමාණු හා විද්‍යුත් (4)', en: 'Atomic & Electro (4)' } },
];

export const EQUIPMENT_CATALOG: LabInstrumentSpec[] = [
  // ================= ELECTRIC & ELECTRONIC LAB INSTRUMENTS (7) =================
  {
    id: 'hv-induction-coil',
    category: 'electric',
    unitBadges: ['I'],
    isElectric: true,
    name: {
      si: 'අධි වෝල්ටීයතා ප්‍රේරණ දඟරය (Ruhmkorff Coil)',
      en: 'High-Voltage Induction Coil (2–20 kV)',
    },
    shortName: { si: 'HV ප්‍රේරණ දඟරය', en: 'HV Induction Coil' },
    whatItDoes: {
      si: 'අඩු DC වෝල්ටීයතාවක් 2,000 V සිට 20,000 V දක්වා අධි වෝල්ටීයතාවකට පරිවර්තනය කර කැතෝඩ කිරණ හා කැනල් කිරණ නළ ක්‍රියාත්මක කරයි.',
      en: 'Steps up a low DC supply into 2–20 kV pulses across spark electrodes to power Crookes & Thomson discharge tubes.',
    },
    howItWorks: {
      si: 'ප්‍රාථමික දඟරයේ ධාරාව වේගයෙන් බිඳ දැමීමෙන් ද්විතීයික දඟරයේ විශාල විද්‍යුත් ගාමක බලයක් ප්‍රේරණය වී ඉලෙක්ට්‍රෝඩ අතර විද්‍යුත් පුළිඟු හෝ වායු විසර්ජනය ඇති වේ.',
      en: 'A vibrating interrupter rapidly breaks primary current, inducing high EMF in thousands of secondary turns to strike an arc or drive cathode rays.',
    },
    examTips: {
      si: 'අධි වෝල්ටීයතාව + අඩු පීඩනය (< 0.01 mmHg) යන දෙකම කැතෝඩ කිරණ සෑදීමට අත්‍යවශ්‍ය වේ.',
      en: 'Both high potential difference (kV) and low gas pressure (< 0.01 mmHg) are needed to observe cathode rays.',
    },
    voiceSummary: {
      si: 'මෙය අධි වෝල්ටීයතා ප්‍රේරණ දඟරයයි. කැතෝඩ කිරණ නළය තුළ වායු විසර්ජනය ඇති කිරීමට කිලෝවෝල්ට් දෙක සිට විස්ස දක්වා අධි වෝල්ටීයතාවක් මෙමගින් සපයයි.',
      en: 'This is the High-Voltage Induction Coil. It steps up low voltage to 2 through 20 kilovolts to power gas discharge and cathode ray tubes.',
    },
    operateLabel: { si: 'HV ස්විචය', en: 'HV Power' },
    sliderLabel: { si: 'වෝල්ටීයතාව', en: 'Output Voltage' },
    sliderMin: 2,
    sliderMax: 20,
    sliderStep: 1,
    sliderDefault: 12,
    sliderUnit: 'kV',
    samples: [
      { id: 'air', label: { si: 'වාතය (Air)', en: 'Air Gap' } },
      { id: 'neon', label: { si: 'නියෝන් (Ne)', en: 'Neon Load' } },
      { id: 'h2', label: { si: 'හයිඩ්‍රජන් (H₂)', en: 'H₂ Load' } },
    ],
    defaultSample: 'air',
  },
  {
    id: 'vacuum-pump-gauge',
    category: 'electric',
    unitBadges: ['I', 'IV'],
    isElectric: true,
    name: {
      si: 'විදුලි රික්ත පොම්පය හා පීඩන මානය',
      en: 'Rotary Vacuum Pump & Pressure Gauge',
    },
    shortName: { si: 'විදුලි රික්ත පොම්පය', en: 'Electric Vacuum Pump' },
    whatItDoes: {
      si: 'වීදුරු නළ තුළ ඇති වාතය පොම්ප කර ඉවත් කර පීඩනය 760 mmHg සිට 0.001 mmHg දක්වා අඩු කරයි.',
      en: 'Motor-driven rotary vane pump evacuates gas chambers from 760 mmHg down to high vacuum (0.001 mmHg).',
    },
    howItWorks: {
      si: 'විදුලි මෝටරයෙන් කැරකෙන භ්‍රමකය නළයේ වායු අණු ඉවතට තල්ලු කරන අතර, පීඩන මානයේ කටුව නළයේ පීඩනය සජීවීව පෙන්වයි.',
      en: 'The motor spins the flywheel vane rotor to exhaust gas molecules while the Bourdon dial gauge tracks internal pressure.',
    },
    examTips: {
      si: 'සාමාන්‍ය පීඩනයේදී (760 mmHg) වාතය විදුලිය සන්නයනය නොකරයි. ~1 mmHg දී striations ද, < 0.01 mmHg දී ZnS ප්‍රතිදීප්තිය ද දිස්වේ.',
      en: 'Air insulates at 760 mmHg; discharge striations appear near 1 mmHg and cathode ray green glow appears below 0.01 mmHg.',
    },
    voiceSummary: {
      si: 'මෙය විදුලි රික්ත පොම්පය හා පීඩන මානයයි. විසර්ජන නළයේ වායු පීඩනය 760 mmHg සිට 0.001 mmHg දක්වා අඩු කිරීමට මෙය භාවිතා කරයි.',
      en: 'This is the Electric Rotary Vacuum Pump and Pressure Gauge, used to evacuate glass discharge tubes down below 0.01 millimeters of mercury.',
    },
    operateLabel: { si: 'පොම්ප මෝටරය', en: 'Pump Motor' },
    sliderLabel: { si: 'රික්ත පියවර', en: 'Evacuation Stage' },
    sliderMin: 0,
    sliderMax: 7,
    sliderStep: 1,
    sliderDefault: 4,
    sliderUnit: 'stage',
    samples: [
      { id: 'crookes', label: { si: 'ක්‍රක්ස් නළය', en: 'Crookes Load' } },
      { id: 'manometer', label: { si: 'මැනෝමීටරය', en: 'Gas Chamber' } },
    ],
    defaultSample: 'crookes',
  },
  {
    id: 'dc-ammeter-voltmeter',
    category: 'electric',
    unitBadges: ['II', 'X'],
    isElectric: true,
    name: {
      si: 'විචල්‍ය DC සැපයුම, ඇමීටරය හා වෝල්ට්මීටරය',
      en: 'Variable DC Supply, Ammeter & Voltmeter',
    },
    shortName: { si: 'DC සැපයුම හා ඇමීටරය', en: 'DC Pack & Ammeter' },
    whatItDoes: {
      si: 'විද්‍යුත් විච්ඡේදනය (Electrolysis) සහ ෆැරඩේ නියම පරීක්ෂණ සඳහා නියත DC ධාරාවක් සපයා ධාරාව (A) හා වෝල්ටීයතාව (V) මනියි.',
      en: 'Provides regulated 1–12 V DC for electrolysis and Faraday electroplating while measuring circuit current (A).',
    },
    howItWorks: {
      si: 'ඇමීටරය ශ්‍රේණිගතව ද, වෝල්ට්මීටරය සමාන්තරගතව ද සවි වේ. වෝල්ටීයතාව වැඩි කරන විට ඉලෙක්ට්‍රෝඩ මත වායු බුබුළු හා තැන්පත් වීම වේගවත් වේ.',
      en: 'Ammeter connects in series and voltmeter in parallel; increasing voltage increases current I and deposited mass m = ZIt.',
    },
    examTips: {
      si: 'ෆැරඩේ නියමය: Q = I × t සහ 1 F = 96,485 C mol⁻¹. ජලීය CuSO₄ විද්‍යුත් විච්ඡේදනයේදී කැතෝඩය මත තඹ (Cu) තැන්පත් වේ.',
      en: 'Faraday law: Q = I·t with 1 F = 96,485 C/mol; copper deposits on the negative cathode in CuSO₄ electrolysis.',
    },
    voiceSummary: {
      si: 'මෙය විචල්‍ය DC බල සැපයුම, ඇමීටරය සහ වෝල්ට්මීටරයයි. විද්‍යුත් විච්ඡේදන පරීක්ෂණවලදී ධාරාව හා වෝල්ටීයතාව මැනීමට මෙය අත්‍යවශ්‍ය වේ.',
      en: 'This is the Variable DC Power Supply with Ammeter and Voltmeter, used to drive and measure current during electrolysis and Faraday plating.',
    },
    operateLabel: { si: 'DC ස්විචය', en: 'DC Output' },
    sliderLabel: { si: 'DC වෝල්ටීයතාව', en: 'Applied Voltage' },
    sliderMin: 1,
    sliderMax: 12,
    sliderStep: 0.5,
    sliderDefault: 6,
    sliderUnit: 'V',
    samples: [
      { id: 'cuso4', label: { si: 'CuSO₄(aq)', en: 'CuSO₄(aq)' } },
      { id: 'nacl', label: { si: 'සාන්ද්‍ර NaCl(aq)', en: 'Brine NaCl' } },
      { id: 'h2so4', label: { si: 'තනුක H₂SO₄', en: 'Dilute H₂SO₄' } },
    ],
    defaultSample: 'cuso4',
  },
  {
    id: 'digital-ph-meter',
    category: 'electric',
    unitBadges: ['III', 'IX'],
    isElectric: true,
    name: {
      si: 'ඩිජිටල් pH මානය හා වීදුරු ඉලෙක්ට්‍රෝඩය',
      en: 'Digital pH Meter & Glass Electrode',
    },
    shortName: { si: 'ඩිජිටල් pH මානය', en: 'Digital pH Meter' },
    whatItDoes: {
      si: 'ද්‍රාවණයක H⁺(aq) අයන සාන්ද්‍රණය අනුව pH අගය 0.00 සිට 14.00 දක්වා ඉහළ නිරවද්‍යතාවයකින් මනියි.',
      en: 'Measures solution acidity/alkalinity from pH 0.00 to 14.00 via voltage across a H⁺-sensitive glass membrane.',
    },
    howItWorks: {
      si: 'ඉලෙක්ට්‍රෝඩය ද්‍රාවණයේ ගිල්වූ විට ඇතිවන විභව අන්තරය (59.2 mV per pH at 25°C) මීටරය මගින් pH අගය බවට පරිවර්තනය කරයි.',
      en: 'The probe develops a Nernstian EMF proportional to pH = -log₁₀[H⁺] and displays the calibrated readout digitally.',
    },
    examTips: {
      si: '0.1 M HCl හි pH = 1.00 වන අතර, 0.1 M CH₃COOH (Ka = 1.8×10⁻⁵) හි pH ≈ 2.87 කි. 0.1 M NaOH හි pH = 13.00 වේ.',
      en: '0.1 M HCl gives pH 1.00, whereas weak 0.1 M CH₃COOH (Ka = 1.8×10⁻⁵) reads ~2.87 and 0.1 M NaOH reads 13.00.',
    },
    voiceSummary: {
      si: 'මෙය ඩිජිටල් pH මානයයි. විවිධ අම්ල, භෂ්ම හා බෆර ද්‍රාවණවල pH අගය ඉතා නිවැරදිව මැනීමට වීදුරු ඉලෙක්ට්‍රෝඩය ද්‍රාවණය තුළ ගිල්වනු ලැබේ.',
      en: 'This is the Digital pH Meter. Dipping its glass electrode measures hydrogen ion activity accurately across strong acids, weak acids, buffers, and bases.',
    },
    operateLabel: { si: 'ඉලෙක්ට්‍රෝඩය ගිල්වන්න', en: 'Dip Probe' },
    sliderLabel: { si: 'උෂ්ණත්ව වන්දි', en: 'Temperature' },
    sliderMin: 20,
    sliderMax: 50,
    sliderStep: 5,
    sliderDefault: 25,
    sliderUnit: '°C',
    samples: [
      { id: 'hcl', label: { si: '0.1 M HCl', en: '0.1 M HCl' } },
      { id: 'ethanoic', label: { si: '0.1 M CH₃COOH', en: '0.1 M Acetic' } },
      { id: 'water', label: { si: 'ආස්‍රැත ජලය', en: 'Pure Water' } },
      { id: 'nh3', label: { si: '0.1 M NH₃(aq)', en: '0.1 M NH₃' } },
      { id: 'naoh', label: { si: '0.1 M NaOH', en: '0.1 M NaOH' } },
    ],
    defaultSample: 'hcl',
  },
  {
    id: 'conductivity-tester',
    category: 'electric',
    unitBadges: ['II', 'X'],
    isElectric: true,
    name: {
      si: 'විද්‍යුත් සන්නායකතා මානය හා දර්ශක බල්බය',
      en: 'Electrical Conductivity Meter & Lamp',
    },
    shortName: { si: 'සන්නායකතා උපකරණය', en: 'Conductivity Tester' },
    whatItDoes: {
      si: 'අයනික, ධ්‍රැවීය හා නිර්ධ්‍රැවීය ද්‍රාවණවල නිදහස් අයන පැවතීම පරීක්ෂා කර සන්නායකතාවය (mS/cm) හා බල්බ දීප්තිය පෙන්වයි.',
      en: 'Tests free mobile ions in electrolytes versus covalent non-electrolytes by measuring conductance and filament lamp glow.',
    },
    howItWorks: {
      si: 'නිෂ්ක්‍රීය ග්‍රැෆයිට් ඉලෙක්ට්‍රෝඩ දෙක හරහා විභවයක් යෙදූ විට ජලීය NaCl වැනි ප්‍රබල විද්‍යුත් විච්ඡේද්‍යවල බල්බය දීප්තිමත්ව දැල්වේ.',
      en: 'Applying voltage across graphite electrodes drives mobile ions; strong electrolytes glow brightly while hexane conducts zero current.',
    },
    examTips: {
      si: 'ඝන NaCl හි අයන චලනය විය නොහැකි නිසා සන්නයනය නොකරයි; නමුත් ජලීය හෝ විලීන NaCl ප්‍රබලව සන්නයනය කරයි.',
      en: 'Solid NaCl has locked ions and does not conduct; molten or aqueous NaCl conducts strongly via mobile Na⁺ and Cl⁻.',
    },
    voiceSummary: {
      si: 'මෙය විද්‍යුත් සන්නායකතා පරීක්ෂකයයි. ද්‍රාවණයක නිදහස් අයන ඇත්නම් බල්බය දැල්වෙන අතර හෙක්සේන් වැනි නිර්ධ්‍රැවීය ද්‍රවවල බල්බය නොදැල්වේ.',
      en: 'This is the Conductivity Tester. Mobile ions in aqueous salts light up the filament lamp brightly, while covalent non-polar liquids do not.',
    },
    operateLabel: { si: 'පරිපථය ON', en: 'Circuit Power' },
    sliderLabel: { si: 'සාන්ද්‍රණය', en: 'Concentration' },
    sliderMin: 0.1,
    sliderMax: 2.0,
    sliderStep: 0.1,
    sliderDefault: 1.0,
    sliderUnit: 'M',
    samples: [
      { id: 'nacl-aq', label: { si: 'NaCl(aq) ප්‍රබල', en: 'NaCl(aq) Strong' } },
      { id: 'hc2h3o2', label: { si: 'CH₃COOH දුර්වල', en: 'Acetic Weak' } },
      { id: 'ethanol', label: { si: 'එතනෝල්', en: 'Ethanol' } },
      { id: 'hexane', label: { si: 'හෙක්සේන්', en: 'Hexane' } },
    ],
    defaultSample: 'nacl-aq',
  },
  {
    id: 'analytical-balance',
    category: 'electric',
    unitBadges: ['III', 'V', 'VIII'],
    isElectric: true,
    name: {
      si: 'විද්‍යුත් විශ්ලේෂණ තුලාව (Analytical Balance 0.0001 g)',
      en: 'Digital Analytical Balance (0.0001 g)',
    },
    shortName: { si: 'විද්‍යුත් තුලාව', en: 'Analytical Balance' },
    whatItDoes: {
      si: 'ප්‍රමිති ද්‍රාවණ පිළියෙළ කිරීමේදී හා ස්ඵටික ජලය මැනීමේදී ග්‍රෑම් 0.0001 දක්වා ඉහළ නිරවද්‍යතාවයෙන් ස්කන්ධය මනියි.',
      en: 'Weighs solid reagents and crucibles to 0.1 mg precision for preparing standard solutions and gravimetric analysis.',
    },
    howItWorks: {
      si: 'වායු ධාරා වැළැක්වීමට වීදුරු ආවරණයක් (Draft Shield) ඇත. TARE බොත්තමෙන් බඳුනේ ස්කන්ධය ශුන්‍ය කර රසායනික ද්‍රව්‍යයේ ස්කන්ධය පමණක් මනී.',
      en: 'Glass draft shield blocks air currents; electro-magnetic force restoration reads the exact sample mass on the LCD after Tare.',
    },
    examTips: {
      si: '0.1000 M Na₂CO₃ 250 cm³ සෑදීමට අවශ්‍ය ස්කන්ධය = 0.1 × 0.25 × 106 = 2.6500 g.',
      en: 'To prepare 250 cm³ of 0.1000 M Na₂CO₃ (M=106), weigh 2.6500 g precisely on an analytical balance.',
    },
    voiceSummary: {
      si: 'මෙය 0.0001 ග්‍රෑම් නිරවද්‍යතාවයෙන් යුත් විද්‍යුත් විශ්ලේෂණ තුලාවයි. ප්‍රමිති ද්‍රාවණ සෑදීමට නිවැරදි ස්කන්ධ කිරා ගැනීමට මෙය භාවිතා කරයි.',
      en: 'This is the Digital Analytical Balance, accurate to 0.0001 grams, essential for weighing primary standards and gravimetric samples.',
    },
    operateLabel: { si: 'TARE / කිරන්න', en: 'Weigh / Tare' },
    sliderLabel: { si: 'නියැදි ප්‍රමාණය', en: 'Sample Portions' },
    sliderMin: 1,
    sliderMax: 5,
    sliderStep: 1,
    sliderDefault: 2,
    sliderUnit: '×',
    samples: [
      { id: 'na2co3', label: { si: 'Na₂CO₃ (ප්‍රමිති)', en: 'Na₂CO₃ Standard' } },
      { id: 'cuso4-5h2o', label: { si: 'CuSO₄·5H₂O', en: 'CuSO₄·5H₂O' } },
      { id: 'k2cr2o7', label: { si: 'K₂Cr₂O₇', en: 'K₂Cr₂O₇' } },
    ],
    defaultSample: 'na2co3',
  },
  {
    id: 'magnetic-stirrer-hotplate',
    category: 'electric',
    unitBadges: ['III', 'VII', 'VIII'],
    isElectric: true,
    name: {
      si: 'චුම්බක මන්ථකය සහ විදුලි තාප තහඩුව',
      en: 'Magnetic Stirrer & Electric Hotplate',
    },
    shortName: { si: 'චුම්බක මන්ථකය', en: 'Magnetic Stirrer' },
    whatItDoes: {
      si: 'ද්‍රාවණ එකාකාරව කලවම් කිරීමට (PTFE චුම්බක කූර මගින්) සහ ගිනි දැල්ලකින් තොරව ආරක්ෂිතව රත් කිරීමට භාවිතා කරයි.',
      en: 'Spins a PTFE magnetic stir bar silently inside flasks while providing controlled flameless electrical heating.',
    },
    howItWorks: {
      si: 'තහඩුව යට ඇති මෝටරයෙන් කැරකෙන චුම්බකය ප්ලාස්කුව තුළ ඇති සුදු චුම්බක කූර කරකවන අතර තාපන දඟරය උෂ්ණත්වය පාලනය කරයි.',
      en: 'A rotating magnet beneath the ceramic plate spins the internal stir bar; resistive heater coils warm organic/redox mixtures safely.',
    },
    examTips: {
      si: 'දහනය වන කාබනික ද්‍රාවක (එතනෝල්, ඊතර්) රත් කිරීමේදී බන්සන් දැල්ල වෙනුවට විදුලි තාප තහඩුව හෝ ජල තාපකය භාවිතා කළ යුතුය.',
      en: 'Flammable organic solvents must be warmed on an electric hotplate or water bath rather than an open Bunsen flame.',
    },
    voiceSummary: {
      si: 'මෙය චුම්බක මන්ථකය සහ විදුලි තාප තහඩුවයි. කාබනික ද්‍රාවණ හා අනුමාපන මිශ්‍රණ ආරක්ෂිතව රත් කරමින් කලවම් කිරීමට මෙය යොදා ගනී.',
      en: 'This is the Magnetic Stirrer and Electric Hotplate, used to stir solutions smoothly with a PTFE stir bar and heat without an open flame.',
    },
    operateLabel: { si: 'මන්ථකය හා තාපය', en: 'Stir & Heat' },
    sliderLabel: { si: 'භ්‍රමණ වේගය / තාපය', en: 'Stir Speed & Temp' },
    sliderMin: 25,
    sliderMax: 95,
    sliderStep: 5,
    sliderDefault: 60,
    sliderUnit: '°C',
    samples: [
      { id: 'oxalic', label: { si: 'H₂C₂O₄ (60°C)', en: 'Oxalic 60°C' } },
      { id: 'ester', label: { si: 'එස්ටර මිශ්‍රණය', en: 'Ester Reflux' } },
    ],
    defaultSample: 'oxalic',
  },

  // ================= VOLUMETRIC GLASSWARE (4) =================
  {
    id: 'burette-stand',
    category: 'volumetric',
    unitBadges: ['III'],
    isElectric: false,
    name: {
      si: 'බියුරෙට්ටුව (50.0 mL) හා රිටෝට් ආධාරකය',
      en: '50.0 mL Glass Burette & Retort Stand',
    },
    shortName: { si: 'බියුරෙට්ටුව', en: '50 mL Burette' },
    whatItDoes: {
      si: 'අනුමාපනයේදී ප්‍රමිති ද්‍රාවණය 0.05 cm³ නිරවද්‍යතාවයෙන් බිංදුවෙන් බිංදුව කේතු ප්ලාස්කුවට එක් කරයි.',
      en: 'Delivers variable titrant volumes accurately to ±0.05 mL during acid-base and redox titrations.',
    },
    howItWorks: {
      si: 'කරාමය (Stopcock) විවෘත කළ විට අනුමාපකය ගලා යයි. අවර්ණ ද්‍රාවණවල පහළ මාවකය (Lower meniscus) ඇස් මට්ටමින් කියවිය යුතුය.',
      en: 'Opening the PTFE stopcock drips titrant; read the bottom meniscus at eye level (top meniscus for dark purple KMnO₄).',
    },
    examTips: {
      si: 'බියුරෙට්ටුව අවසන් වරට සේදිය යුත්තේ එයට පුරවන ද්‍රාවණයෙන්ම මිස ආස්‍රැත ජලයෙන් නොවේ (නැතිනම් ද්‍රාවණය තනුක වේ).',
      en: 'Always rinse the burette last with the titrant solution itself—not distilled water—to avoid dilution error.',
    },
    voiceSummary: {
      si: 'මෙය මිලිලීටර් 50 බියුරෙට්ටුවයි. අනුමාපනයකදී සමතුල්‍යතා අන්ත ලක්ෂ්‍යය තෙක් ප්‍රමිති ද්‍රාවණය නිවැරදිව බිංදු කිරීමට මෙය භාවිතා කරයි.',
      en: 'This is the 50 milliliter Glass Burette mounted on a retort stand, used to dispense titrant drop by drop down to the equivalence endpoint.',
    },
    operateLabel: { si: 'කරාමය අරින්න', en: 'Open Stopcock' },
    sliderLabel: { si: 'මුදාහැරි පරිමාව', en: 'Volume Added' },
    sliderMin: 0,
    sliderMax: 50,
    sliderStep: 0.5,
    sliderDefault: 25,
    sliderUnit: 'mL',
    samples: [
      { id: 'naoh', label: { si: 'NaOH + ෆීනෝල්', en: 'NaOH / Pink' } },
      { id: 'kmno4', label: { si: 'KMnO₄ (දම්)', en: 'KMnO₄ Purple' } },
    ],
    defaultSample: 'naoh',
  },
  {
    id: 'pipette-filler',
    category: 'volumetric',
    unitBadges: ['III'],
    isElectric: false,
    name: {
      si: 'පරිමාමිතික පිපෙට්ටුව (25.0 mL) හා රබර් බල්බය',
      en: '25.0 mL Volumetric Pipette & Safety Filler',
    },
    shortName: { si: 'පිපෙට්ටුව (25 mL)', en: '25 mL Pipette' },
    whatItDoes: {
      si: 'නිශ්චිත ස්ථිර පරිමාවක් (25.00 cm³) මැන කේතු ප්ලාස්කුවට මාරු කිරීමට භාවිතා කරයි.',
      en: 'Transfers a fixed single volume (25.00 mL ± 0.03 mL) of analyte solution cleanly into a conical flask.',
    },
    howItWorks: {
      si: 'ආරක්ෂිත පිපෙට් බල්බයෙන් ද්‍රාවණය සලකුණු ඉර තෙක් ඇද ගෙන, පසුව ගුරුත්වයෙන් ප්ලාස්කුවට බැස යාමට ඉඩ හරී (අවසන් බිංදුව පිඹ ඉවත් නොකළ යුතුය).',
      en: 'Draw liquid with the safety filler bulb to the etched ring mark, then drain vertically—leave the tiny tip drop inside as calibrated.',
    },
    examTips: {
      si: 'පිපෙට්ටුව තුළ ඉතිරි වන අවසාන කුඩා බිංදුව පිඹ ඉවත් නොකරන්න; එය ක්‍රමාංකනයේදී ගණනය කර ඇත.',
      en: 'Never blow out the final residual drop at the pipette tip; volumetric pipettes are calibrated "to deliver" (TD).',
    },
    voiceSummary: {
      si: 'මෙය මිලිලීටර් 25 පරිමාමිතික පිපෙට්ටුවයි. නිවැරදි සලකුණු ඉර තෙක් ද්‍රාවණය ගෙන කේතු ප්ලාස්කුවට මාරු කිරීමට රබර් බල්බය යොදා ගනී.',
      en: 'This is the 25 milliliter Volumetric Pipette with safety filler bulb, calibrated to deliver an exact fixed volume to the meniscus ring.',
    },
    operateLabel: { si: 'ද්‍රාවණය අදින්න/දමන්න', en: 'Draw / Dispense' },
    sliderLabel: { si: 'පිපෙට් මට්ටම', en: 'Fill Level' },
    sliderMin: 0,
    sliderMax: 25,
    sliderStep: 1,
    sliderDefault: 25,
    sliderUnit: 'mL',
    samples: [
      { id: 'hcl', label: { si: 'HCl (අවර්ණ)', en: 'HCl Clear' } },
      { id: 'cuso4', label: { si: 'CuSO₄ (නිල්)', en: 'CuSO₄ Blue' } },
    ],
    defaultSample: 'cuso4',
  },
  {
    id: 'volumetric-flask',
    category: 'volumetric',
    unitBadges: ['III'],
    isElectric: false,
    name: {
      si: 'ප්‍රමිති පරිමාමිතික ප්ලාස්කුව (250 mL)',
      en: '250 mL Standard Volumetric Flask',
    },
    shortName: { si: 'පරිමාමිතික ප්ලාස්කුව', en: 'Volumetric Flask' },
    whatItDoes: {
      si: 'දන්නා නිවැරදි සාන්ද්‍රණයකින් යුත් ප්‍රමිති ද්‍රාවණ (Standard Solutions) පිළියෙළ කිරීමට භාවිතා කරයි.',
      en: 'Prepares primary standard solutions of exact molar concentration up to a single calibration ring at 25°C.',
    },
    howItWorks: {
      si: 'කිරාගත් ඝන ද්‍රව්‍යය දියකර ප්ලාස්කුවට දමා, ආස්‍රැත ජලයෙන් කැටයම් ඉර තෙක් පුරවා ඇබය ගසා උඩු යටිකුරු කරමින් හොඳින් කලවම් කරයි.',
      en: 'Dissolve weighed solute, transfer rinsings via funnel, top up dropwise to the etched mark, stopper, and invert 10× to homogenize.',
    },
    examTips: {
      si: 'උණුසුම් ද්‍රාවණ පරිමාමිතික ප්ලාස්කුවේදී ක්‍රමාංකනය නොකළ යුතුය — කාමර උෂ්ණත්වයට (25°C) සිසිල් වූ පසු ජලය එක් කරන්න.',
      en: 'Always cool solutions to 25°C before making up to the calibration mark because glass and water expand when warm.',
    },
    voiceSummary: {
      si: 'මෙය මිලිලීටර් 250 පරිමාමිතික ප්ලාස්කුවයි. නිශ්චිත මවුලිකතාවයකින් යුත් ප්‍රමිති ද්‍රාවණ පිළියෙළ කිරීමට මෙහි ගෙලෙහි ඇති ක්‍රමාංකන ඉර භාවිතා කෙරේ.',
      en: 'This is the 250 milliliter Volumetric Flask. Dissolve the weighed solid first, then add distilled water to the etched neck mark at room temperature.',
    },
    operateLabel: { si: 'කලවම් කරන්න', en: 'Mix / Top Up' },
    sliderLabel: { si: 'ද්‍රාවණ පරිමාව', en: 'Fill Volume' },
    sliderMin: 50,
    sliderMax: 250,
    sliderStep: 10,
    sliderDefault: 250,
    sliderUnit: 'mL',
    samples: [
      { id: 'kmno4', label: { si: 'KMnO₄ ප්‍රමිති', en: 'KMnO₄ Std' } },
      { id: 'dichromate', label: { si: 'K₂Cr₂O₇ තැඹිලි', en: 'K₂Cr₂O₇ Orange' } },
    ],
    defaultSample: 'dichromate',
  },
  {
    id: 'conical-flask-dropper',
    category: 'volumetric',
    unitBadges: ['III', 'VI'],
    isElectric: false,
    name: {
      si: 'කේතු ප්ලාස්කුව හා දර්ශක බිංදු නළය',
      en: 'Conical Titration Flask & Indicator Dropper',
    },
    shortName: { si: 'කේතු ප්ලාස්කුව', en: 'Conical Flask' },
    whatItDoes: {
      si: 'අනුමාපනයේදී ද්‍රාවණ ඉවතට විසිරී නොයන සේ පහසුවෙන් සෙලවීමට (Swirling) ඉඩ සලසයි.',
      en: 'Sloped walls prevent splashing during vigorous swirling while monitoring acid-base indicator color endpoints.',
    },
    howItWorks: {
      si: 'අවශ්‍ය දර්ශකය (ෆීනෝල්ප්තැලීන් හෝ මෙතිල් ඔරේන්ජ්) බිංදු 2–3 ක් එක් කර සුදු පසුබිමක් මත තබා වර්ණ විපර්යාසය නිරීක්ෂණය කරයි.',
      en: 'Add 2–3 drops of Phenolphthalein or Methyl Orange and swirl over a white tile to catch the sharp endpoint color.',
    },
    examTips: {
      si: 'ෆීනෝල්ප්තැලීන් (pH 8.3–10) ප්‍රබල භෂ්ම අනුමාපන සඳහා ද, මෙතිල් ඔරේන්ජ් (pH 3.1–4.4) දුර්වල භෂ්ම–ප්‍රබල අම්ල සඳහා ද සුදුසුය.',
      en: 'Phenolphthalein (pH 8.3–10) suits weak acid–strong base; Methyl Orange (pH 3.1–4.4) suits strong acid–weak base.',
    },
    voiceSummary: {
      si: 'මෙය කේතු ප්ලාස්කුව සහ දර්ශක බිංදු නළයයි. අනුමාපනයේදී ද්‍රාවණ ඉසිරී නොයා කලවම් කර වර්ණ වෙනස බැලීමට මෙහි ඇල බිත්ති උපකාරී වේ.',
      en: 'This is the Conical Flask and Indicator Dropper. Its tapered walls prevent splashing when swirling during titration endpoint checks.',
    },
    operateLabel: { si: 'සොලවා කලවම් කරන්න', en: 'Swirl Flask' },
    sliderLabel: { si: 'ද්‍රාවණ pH', en: 'Solution pH' },
    sliderMin: 1,
    sliderMax: 13,
    sliderStep: 0.5,
    sliderDefault: 8.5,
    sliderUnit: 'pH',
    samples: [
      { id: 'phenol', label: { si: 'ෆීනෝල්ප්තැලීන්', en: 'Phenolphthalein' } },
      { id: 'methyl', label: { si: 'මෙතිල් ඔරේන්ජ්', en: 'Methyl Orange' } },
    ],
    defaultSample: 'phenol',
  },

  // ================= THERMAL, GAS & ORGANIC RIGS (5) =================
  {
    id: 'bunsen-burner',
    category: 'thermal-gas',
    unitBadges: ['II', 'III', 'VI'],
    isElectric: false,
    name: {
      si: 'බන්සන් දාහකය හා නයික්‍රෝම් කම්බිය',
      en: 'Bunsen Burner & Flame Test Loop',
    },
    shortName: { si: 'බන්සන් දාහකය', en: 'Bunsen Burner' },
    whatItDoes: {
      si: 'පාලනය කළ හැකි තාප දැල්ලක් සපයමින් පහන් දැල් පරීක්ෂාව (Li⁺, Na⁺, K⁺, Cu²⁺) හා ස්ඵටික ජලය ඉවත් කිරීම සිදු කරයි.',
      en: 'Produces either a luminous yellow safety flame or a hot blue roaring flame for cation flame tests and crucible heating.',
    },
    howItWorks: {
      si: 'වායු සිදුර (Air collar) විවෘත කළ විට සම්පූර්ණ දහනය සිදුවී අධි-උෂ්ණත්ව නිල් දැල්ල ලැබේ; වැසූ විට කහ දුම් දැල්ල ලැබේ.',
      en: 'Opening the air collar mixes O₂ for complete combustion and a hot blue flame; closing it produces a visible yellow safety flame.',
    },
    examTips: {
      si: 'නයික්‍රෝම්/Pt කම්බිය සෑම පරීක්ෂණයකටම පෙර සාන්ද්‍ර HCl වලින් පිරිසිදු කර දැල්ලේ රත් කළ යුතුය (කම්බිය වාෂ්පශීලී ලෝහ ක්ලෝරයිඩ සාදයි).',
      en: 'Clean the nichrome loop in conc. HCl before each test; metal chlorides vaporize easily in the blue flame.',
    },
    voiceSummary: {
      si: 'මෙය බන්සන් දාහකයයි. වායු කොලරය විවෘත කිරීමෙන් ඉහළ උෂ්ණත්ව නිල් දැල්ල ලබාගෙන ලෝහ කැටායන පහන් දැල් පරීක්ෂාව සිදු කළ හැකිය.',
      en: 'This is the Bunsen Burner. Opening the air collar switches from a luminous yellow flame to a hot blue flame for metal cation emission tests.',
    },
    operateLabel: { si: 'දාහකය දල්වන්න', en: 'Ignite Flame' },
    sliderLabel: { si: 'වායු කොලරය', en: 'Air Collar Open' },
    sliderMin: 0,
    sliderMax: 100,
    sliderStep: 10,
    sliderDefault: 80,
    sliderUnit: '%',
    samples: [
      { id: 'Na+', label: { si: 'Na⁺ (කහ)', en: 'Na⁺ Gold' } },
      { id: 'K+', label: { si: 'K⁺ (ලිලැක්)', en: 'K⁺ Lilac' } },
      { id: 'Cu2+', label: { si: 'Cu²⁺ (නිල්-කොළ)', en: 'Cu²⁺ Green' } },
      { id: 'Li+', label: { si: 'Li⁺ (රතු)', en: 'Li⁺ Crimson' } },
    ],
    defaultSample: 'Cu2+',
  },
  {
    id: 'coffee-cup-calorimeter',
    category: 'thermal-gas',
    unitBadges: ['V'],
    isElectric: false,
    name: {
      si: 'තාප පරිවාරක කැලරිමීටරය හා උෂ්ණත්වමානය',
      en: 'Insulated Calorimeter & 0.1°C Thermometer',
    },
    shortName: { si: 'කැලරිමීටරය', en: 'Calorimeter' },
    whatItDoes: {
      si: 'උදාසීනීකරණ, ද්‍රාවණ හා විස්ථාපන ප්‍රතික්‍රියාවල උෂ්ණත්ව වෙනස (ΔT) මැන එන්තැල්පි වෙනස (ΔH) ගණනය කිරීමට යොදා ගනී.',
      en: 'Measures ΔT inside an insulated vessel to calculate enthalpy changes ΔH = -mcΔT / n at constant pressure.',
    },
    howItWorks: {
      si: 'පොලිස්ටයරින් පරිවාරකය පිටතට තාප හානිය අවම කරයි. මන්ථකයෙන් ද්‍රාවණය කලවම් කරමින් උපරිම/අවම උෂ්ණත්වය මනී.',
      en: 'Foam insulation traps reaction heat while the wire stirrer keeps temperature uniform across the 0.1°C thermometer bulb.',
    },
    examTips: {
      si: 'තාපදායක ප්‍රතික්‍රියාවකදී (NaOH + HCl) ΔT ධන වන අතර ΔH සෘණ වේ (-57.3 kJ mol⁻¹). තාප අවශෝෂක NH₄NO₃ දියවීමේදී ΔT සෘණ වේ.',
      en: 'Exothermic reactions raise temperature (ΔH < 0, e.g. -57.3 kJ/mol); endothermic NH₄NO₃ dissolution cools the water (ΔH > 0).',
    },
    voiceSummary: {
      si: 'මෙය තාප පරිවාරක කැලරිමීටරයයි. අම්ල-භෂ්ම උදාසීනීකරණයේදී පිටවන හෝ අවශෝෂණය වන තාපය ΔT මගින් මැනීමට මෙය යොදා ගනී.',
      en: 'This is the Insulated Calorimeter and Thermometer, used in Unit 5 Energetics to measure temperature change and calculate enthalpy change delta H.',
    },
    operateLabel: { si: 'මන්ථනය / මිශ්‍ර කරන්න', en: 'Mix & Stir' },
    sliderLabel: { si: 'සාන්ද්‍රණය', en: 'Reactant Molarity' },
    sliderMin: 0.5,
    sliderMax: 2.0,
    sliderStep: 0.25,
    sliderDefault: 1.0,
    sliderUnit: 'M',
    samples: [
      { id: 'exo', label: { si: 'තාපදායක (HCl+NaOH)', en: 'Exothermic' } },
      { id: 'endo', label: { si: 'තාපඅවශෝෂක (NH₄NO₃)', en: 'Endothermic' } },
    ],
    defaultSample: 'exo',
  },
  {
    id: 'gas-syringe',
    category: 'thermal-gas',
    unitBadges: ['III', 'IV', 'VIII'],
    isElectric: false,
    name: {
      si: 'ක්‍රමාංකිත වීදුරු වායු සිරින්ජය (100 mL)',
      en: '100 mL Ground-Glass Gas Syringe',
    },
    shortName: { si: 'වායු සිරින්ජය', en: 'Gas Syringe' },
    whatItDoes: {
      si: 'ප්‍රතික්‍රියාවකින් නිපදවෙන වායු පරිමාව (H₂, CO₂, O₂) මැනීමට සහ බොයිල්/චාල්ස් වායු නියම පරීක්ෂා කිරීමට භාවිතා කරයි.',
      en: 'Collects evolved gases without water-solubility errors and measures pressure-volume compression (Boyle) or rate.',
    },
    howItWorks: {
      si: 'ඝර්ෂණය අවම වීදුරු පිස්ටනය වායු පීඩනය අනුව ඉදිරියට හෝ පසුපසට චලනය වෙමින් සෘජුවම mL පරිමාව පෙන්වයි.',
      en: 'Precision-ground low-friction glass barrel moves smoothly with gas moles or applied external pressure.',
    },
    examTips: {
      si: 'CO₂ හෝ NH₃ වැනි ජලයේ ද්‍රාව්‍ය වායු එකතු කිරීමේදී ජලය මතින් එකතු කිරීම වෙනුවට වියළි වායු සිරින්ජය ඉතා සුදුසුය.',
      en: 'For water-soluble gases like CO₂ or SO₂, a dry gas syringe gives far better molar accuracy than displacement over water.',
    },
    voiceSummary: {
      si: 'මෙය ක්‍රමාංකිත වීදුරු වායු සිරින්ජයයි. ප්‍රතික්‍රියා වේගය හා බොයිල් නියමය පරීක්ෂා කිරීමේදී වායු පරිමාව මැනීමට මෙය ඉතා නිවැරදියි.',
      en: 'This is the 100 milliliter Glass Gas Syringe, ideal for measuring gas evolution rates and demonstrating Boyle law compression.',
    },
    operateLabel: { si: 'පිස්ටන් පරීක්ෂාව', en: 'Run Gas Pulse' },
    sliderLabel: { si: 'බාහිර පීඩනය', en: 'Pressure' },
    sliderMin: 60,
    sliderMax: 240,
    sliderStep: 10,
    sliderDefault: 100,
    sliderUnit: 'kPa',
    samples: [
      { id: 'boyle', label: { si: 'බොයිල් නියමය (PV)', en: 'Boyle PV' } },
      { id: 'h2-rate', label: { si: 'Mg + HCl (H₂)', en: 'H₂ Evolution' } },
    ],
    defaultSample: 'boyle',
  },
  {
    id: 'liebig-condenser',
    category: 'thermal-gas',
    unitBadges: ['VII'],
    isElectric: false,
    name: {
      si: 'ලීබිග් සංඝනීකාරකය (Reflux & Distillation)',
      en: 'Liebig Water Condenser',
    },
    shortName: { si: 'ලීබිග් සංඝනීකාරකය', en: 'Liebig Condenser' },
    whatItDoes: {
      si: 'කාබනික සංස්ලේෂණයේදී (එස්ටරීකරණය, ඇල්ඩිහයිඩ ඔක්සිකරණය) වාෂ්පශීලී ප්‍රතික්‍රියක සිසිල් කර ද්‍රව බවට පත් කරයි.',
      en: 'Circulates cold counter-current water in an outer glass jacket to condense volatile organic vapors during reflux or distillation.',
    },
    howItWorks: {
      si: 'සිසිල් ජලය සෑම විටම පහළ කෙළවරින් ඇතුළු කර ඉහළ කෙළවරින් පිටතට යවයි (Counter-current cooling) — එමගින් ජැකට්ටුව පුරා ජලය පිරේ.',
      en: 'Cold water always enters at the lowest port and exits at the top so the outer jacket stays completely filled without air pockets.',
    },
    examTips: {
      si: 'විභාග ප්‍රශ්නය: ප්‍රතිවාහ (Reflux) පද්ධතියක ඉහළ කෙළවර කිසි විටෙකත් ඇබයකින් වසා නොතැබිය යුතුය (පීඩනය වැඩි වී පිපිරිය හැක!).',
      en: 'Exam point: Never stopper the top of a reflux condenser—keeping it open prevents dangerous pressure buildup.',
    },
    voiceSummary: {
      si: 'මෙය ලීබිග් සංඝනීකාරකයයි. කාබනික රසායනයේදී ප්‍රතිවාහ හා ආසවන පරීක්ෂණවලදී සිසිල් ජලය පහළින් ඇතුළු කර ඉහළින් පිට කෙරේ.',
      en: 'This is the Liebig Water Condenser for Unit 7 Organic Chemistry. Always feed cooling water in from the lower port and out from the top.',
    },
    operateLabel: { si: 'ජල සංසරණය', en: 'Water Cooling' },
    sliderLabel: { si: 'තාපන වේගය', en: 'Vapor Rate' },
    sliderMin: 40,
    sliderMax: 100,
    sliderStep: 10,
    sliderDefault: 75,
    sliderUnit: '°C',
    samples: [
      { id: 'ester', label: { si: 'එතිල් ඇසිටේට්', en: 'Ethyl Acetate' } },
      { id: 'ethanol', label: { si: 'එතනෝල් ආසවනය', en: 'Ethanol Distill' } },
    ],
    defaultSample: 'ester',
  },
  {
    id: 'kipps-apparatus',
    category: 'thermal-gas',
    unitBadges: ['IV', 'VI'],
    isElectric: false,
    name: {
      si: 'කිප්ගේ උපකරණය (Kipp’s Gas Generator)',
      en: "Kipp's Apparatus (On-Demand Gas)",
    },
    shortName: { si: 'කිප්ගේ උපකරණය', en: "Kipp's Apparatus" },
    whatItDoes: {
      si: 'ගුණාත්මක විශ්ලේෂණයේදී අවශ්‍ය වූ විටෙක H₂S, CO₂ හෝ H₂ වායු අඛණ්ඩව නිපදවා කරාමයෙන් පාලනය කරයි.',
      en: 'Generates H₂S (from FeS + HCl) or CO₂ (from CaCO₃ + HCl) on demand and automatically halts when the stopcock closes.',
    },
    howItWorks: {
      si: 'කරාමය වැසූ විට මැද ගෝලයේ එකතු වන වායු පීඩනය අම්ලය ඉහළ ගෝලයට තල්ලු කරන බැවින් ඝන කැබලි සමඟ ප්‍රතික්‍රියාව නවතී.',
      en: 'Closing the delivery tap builds gas pressure in the middle bulb, pushing acid back up into the top reservoir away from solid lumps.',
    },
    examTips: {
      si: 'FeS + 2HCl → FeCl₂ + H₂S(g) (II හා IV කාණ්ඩ කැටායන සල්ෆයිඩ අවක්ෂේපණ පරීක්ෂාව සඳහා).',
      en: 'Used classically to deliver H₂S(g) for qualitative sulfide precipitation of Group II and IV cations.',
    },
    voiceSummary: {
      si: 'මෙය කිප්ගේ උපකරණයයි. අවශ්‍ය වූ විට H₂S හෝ CO₂ වායුව නිපදවා, කරාමය වැසූ විට වායු පීඩනයෙන් ප්‍රතික්‍රියාව ස්වයංක්‍රීයව නතර කරයි.',
      en: "This is Kipp's Apparatus. When the tap closes, gas pressure pushes acid away from the solid lumps to pause gas generation automatically.",
    },
    operateLabel: { si: 'වායු කරාමය', en: 'Gas Valve' },
    sliderLabel: { si: 'අම්ල සාන්ද්‍රණය', en: 'HCl Strength' },
    sliderMin: 1,
    sliderMax: 4,
    sliderStep: 0.5,
    sliderDefault: 2,
    sliderUnit: 'M',
    samples: [
      { id: 'co2', label: { si: 'CaCO₃ → CO₂', en: 'CaCO₃ → CO₂' } },
      { id: 'h2s', label: { si: 'FeS → H₂S', en: 'FeS → H₂S' } },
    ],
    defaultSample: 'h2s',
  },

  // ================= ATOMIC, ELECTROCHEM & SEPARATION (4) =================
  {
    id: 'crookes-tube',
    category: 'atomic-electro',
    unitBadges: ['I'],
    isElectric: true,
    name: {
      si: 'ක්‍රක්ස් කැතෝඩ කිරණ නළය (ZnS ප්‍රතිදීප්ත තිරය)',
      en: 'Crookes Discharge Tube & ZnS Screen',
    },
    shortName: { si: 'ක්‍රක්ස් නළය', en: 'Crookes Tube' },
    whatItDoes: {
      si: 'අඩු පීඩනය හා අධි වෝල්ටීයතාව යටතේ කැතෝඩ කිරණ නිපදවා සරල රේඛීය ගමන (මෝල්ටීස් කුරුසය) හා ප්‍රතිදීප්තිය පෙන්වයි.',
      en: 'Demonstrates cathode ray electron emission, straight-line Maltese cross shadow projection, and green ZnS fluorescence.',
    },
    howItWorks: {
      si: 'ඉලෙක්ට්‍රෝන කැතෝඩයේ සිට ඇනෝඩය පසුකර ZnS ආලේපිත වීදුරු අග්‍රයේ ගැටී කොළ පැහැති ප්‍රතිදීප්තියක් ඇති කරයි.',
      en: 'Accelerated electrons travel straight down the evacuated borosilicate tube to strike the ZnS end screen.',
    },
    examTips: {
      si: 'කැතෝඩ කිරණවල e/m අගය නළයේ වායුව හෝ කැතෝඩ ලෝහය මත රඳා නොපවතී.',
      en: 'Cathode ray e/m = 1.7588 × 10¹¹ C kg⁻¹ is independent of residual gas and electrode metal.',
    },
    voiceSummary: {
      si: 'මෙය ක්‍රක්ස් කැතෝඩ කිරණ නළයයි. නළයේ පීඩනය අඩු කර අධි වෝල්ටීයතාව ලබා දුන් විට කොළ පැහැති ZnS ප්‍රතිදීප්තිය දිස්වේ.',
      en: 'This is the Crookes Discharge Tube. At high voltage and low pressure, electrons strike the zinc sulfide screen to emit vivid green fluorescence.',
    },
    operateLabel: { si: 'කිරණ කදම්බය', en: 'Beam Power' },
    sliderLabel: { si: 'නළ පීඩනය', en: 'Vacuum Level' },
    sliderMin: 1,
    sliderMax: 100,
    sliderStep: 5,
    sliderDefault: 95,
    sliderUnit: '% vac',
    samples: [
      { id: 'cross', label: { si: 'මෝල්ටීස් කුරුසය', en: 'Maltese Cross' } },
      { id: 'open', label: { si: 'නිදහස් කදම්බය', en: 'Open Beam' } },
    ],
    defaultSample: 'cross',
  },
  {
    id: 'daniell-galvanic-cell',
    category: 'atomic-electro',
    unitBadges: ['X'],
    isElectric: true,
    name: {
      si: 'ඩැනියෙල් ගැල්වානික කෝෂය හා KCl ලවණ පාලම',
      en: 'Daniell Galvanic Cell & KCl Salt Bridge',
    },
    shortName: { si: 'ඩැනියෙල් කෝෂය', en: 'Daniell Cell' },
    whatItDoes: {
      si: 'ස්වයංසිද්ධ රෙඩොක්ස් ප්‍රතික්‍රියාවකින් රසායනික ශක්තිය විද්‍යුත් ශක්තිය බවට පරිවර්තනය කර +1.10 V විභවයක් නිපදවයි.',
      en: 'Converts chemical energy into +1.10 V electrical energy using Zn/Zn²⁺ anode, Cu/Cu²⁺ cathode, and a KCl salt bridge.',
    },
    howItWorks: {
      si: 'Zn ඇනෝඩයේ ඔක්සිකරණයෙන් ලැබෙන ඉලෙක්ට්‍රෝන බාහිර පරිපථය හරහා Cu කැතෝඩයට ගමන් කරන අතර ලවණ පාලම අයන තුලිතතාව රකී.',
      en: 'Electrons flow externally from Zn anode to Cu cathode while K⁺ and Cl⁻ ions migrate through the salt bridge to maintain neutrality.',
    },
    examTips: {
      si: 'සම්මත කෝෂ අංකනය: Zn(s) | Zn²⁺(aq, 1 M) || Cu²⁺(aq, 1 M) | Cu(s), E°cell = +0.34 - (-0.76) = +1.10 V.',
      en: 'Cell notation puts Anode (oxidation) on the left and Cathode (reduction) on the right: E°cell = +1.10 V.',
    },
    voiceSummary: {
      si: 'මෙය ඩැනියෙල් ගැල්වානික කෝෂයයි. සින්ක් ඇනෝඩයේ සිට තඹ කැතෝඩයට ඉලෙක්ට්‍රෝන ගමන් කිරීමෙන් වෝල්ට් 1.10 ක විද්‍යුත් විභවයක් ජනනය වේ.',
      en: 'This is the Daniell Galvanic Cell. Spontaneous redox reaction between zinc and copper generates a standard cell potential of 1.10 volts.',
    },
    operateLabel: { si: 'ලවණ පාලම සවිකරන්න', en: 'Connect Cell' },
    sliderLabel: { si: 'Cu²⁺ සාන්ද්‍රණය', en: '[Cu²⁺] Molarity' },
    sliderMin: 0.1,
    sliderMax: 2.0,
    sliderStep: 0.1,
    sliderDefault: 1.0,
    sliderUnit: 'M',
    samples: [
      { id: 'zn-cu', label: { si: 'Zn | Cu (+1.10V)', en: 'Zn | Cu (+1.10V)' } },
      { id: 'fe-cu', label: { si: 'Fe | Cu (+0.78V)', en: 'Fe | Cu (+0.78V)' } },
    ],
    defaultSample: 'zn-cu',
  },
  {
    id: 'separating-funnel',
    category: 'atomic-electro',
    unitBadges: ['VII'],
    isElectric: false,
    name: {
      si: 'බෙදුම් පුනීලය (Solvent Extraction)',
      en: 'Glass Separating Funnel',
    },
    shortName: { si: 'බෙදුම් පුනීලය', en: 'Separating Funnel' },
    whatItDoes: {
      si: 'එකිනෙකට මිශ්‍ර නොවන (Immiscible) කාබනික හා ජලීය ස්ථර ඝනත්වය අනුව වෙන් කිරීමට භාවිතා කරයි.',
      en: 'Separates immiscible organic and aqueous liquid layers cleanly according to density differences.',
    },
    howItWorks: {
      si: 'සොලවා තැබූ පසු ඝනත්වය වැඩි ස්ථරය පහළින් රැඳේ. පහළ කරාමය විවෘත කර පහළ ස්ථරය බීකරයකට වෙන් කර ගනී.',
      en: 'After shaking and venting gas, allow layers to settle; drain the denser bottom phase slowly through the lower tap.',
    },
    examTips: {
      si: 'ඊතර්/හෙක්සේන් (ρ ≈ 0.7 g/cm³) ජලයට උඩින් පාවෙන අතර, ක්ලෝරෝෆෝම් CHCl₃ (ρ = 1.49 g/cm³) ජලයට යටින් පහළ ස්ථරය සාදයි.',
      en: 'Ether or hexane floats above water (upper layer), whereas denser CHCl₃ or CCl₄ sinks as the lower layer.',
    },
    voiceSummary: {
      si: 'මෙය බෙදුම් පුනීලයයි. කාබනික රසායනයේදී එකිනෙකට දිය නොවන ජලීය හා කාබනික ද්‍රාවක ස්ථර වෙන් කිරීමට මෙය භාවිතා කෙරේ.',
      en: 'This is the Separating Funnel, used in organic solvent extraction to drain denser immiscible liquid layers cleanly.',
    },
    operateLabel: { si: 'පහළ කරාමය', en: 'Drain Tap' },
    sliderLabel: { si: 'වෙන් කිරීම', en: 'Layer Separation' },
    sliderMin: 0,
    sliderMax: 100,
    sliderStep: 10,
    sliderDefault: 50,
    sliderUnit: '%',
    samples: [
      { id: 'ether', label: { si: 'ඊතර් (ඉහළ) + ජලය', en: 'Ether + Water' } },
      { id: 'chcl3', label: { si: 'CHCl₃ (පහළ) + ජලය', en: 'CHCl₃ + Water' } },
    ],
    defaultSample: 'chcl3',
  },
  {
    id: 'horseshoe-magnet',
    category: 'atomic-electro',
    unitBadges: ['I'],
    isElectric: false,
    name: {
      si: 'ලාඩම් චුම්බකය (Lorentz Beam Deflection)',
      en: 'Horseshoe Deflection Magnet (N–S)',
    },
    shortName: { si: 'ලාඩම් චුම්බකය', en: 'Horseshoe Magnet' },
    whatItDoes: {
      si: 'කැතෝඩ කිරණ (ඉලෙක්ට්‍රෝන) මත ලොරෙන්ට්ස් බලය යොදා ඒවා සෘණ ආරෝපිත අංශු බව තහවුරු කරයි.',
      en: 'Applies a perpendicular magnetic field across discharge tubes to deflect cathode rays and identify particle charge polarity.',
    },
    howItWorks: {
      si: 'N සහ S ධ්‍රැව මාරු කිරීමෙන් කදම්බය ඉහළට හෝ පහළට නැමෙන දිශාව ප්‍රතිවිරුද්ධ වේ (ෆ්ලෙමින්ගේ වමත් නියමය).',
      en: 'Flipping N/S pole orientation reverses the Lorentz force vector F = q(v × B) acting on moving electrons.',
    },
    examTips: {
      si: 'විද්‍යුත් හා චුම්බක ක්ෂේත්‍ර දෙකම සමානව විරුද්ධ දිශාවට යෙදූ විට eE = evB නිසා කදම්බය නොනැමී කෙළින්ම ගමන් කරයි.',
      en: 'When magnetic deflection exactly balances electric deflection (eE = evB), the beam flies undeflected with velocity v = E/B.',
    },
    voiceSummary: {
      si: 'මෙය ලාඩම් චුම්බකයයි. කැතෝඩ කිරණ චුම්බක ක්ෂේත්‍රයේදී නැමෙන දිශාව පරීක්ෂා කර ඉලෙක්ට්‍රෝනයේ සෘණ ආරෝපණය තහවුරු කිරීමට මෙය යොදා ගනී.',
      en: 'This is the Horseshoe Deflection Magnet. Bringing it near cathode rays bends the beam according to Fleming left-hand rule.',
    },
    operateLabel: { si: 'චුම්බකය ළං කරන්න', en: 'Engage Magnet' },
    sliderLabel: { si: 'ක්ෂේත්‍ර ප්‍රබලතාව', en: 'B-Field Strength' },
    sliderMin: 1,
    sliderMax: 5,
    sliderStep: 0.5,
    sliderDefault: 3,
    sliderUnit: 'mT',
    samples: [
      { id: 'n-up', label: { si: 'N ධ්‍රැවය ඉහළ', en: 'North Up (+)' } },
      { id: 's-up', label: { si: 'S ධ්‍රැවය ඉහළ', en: 'South Up (-)' } },
    ],
    defaultSample: 'n-up',
  },
];

const VACUUM_STAGES = [760, 40, 10, 1.5, 0.2, 0.05, 0.008, 0.002];

export function evaluateInstrumentTelemetry(
  id: string,
  state: InstrumentRuntimeState
): InstrumentTelemetry {
  const { active, sliderValue, sampleId } = state;

  switch (id) {
    case 'hv-induction-coil':
      return {
        primaryReading: active ? `${sliderValue.toFixed(0)} kV DC` : '0.0 kV (STANDBY)',
        secondaryReading: active ? `Spark Arc: ${sampleId.toUpperCase()}` : 'Interrupter OFF',
        statusLabel: active
          ? { si: 'අධි වෝල්ටීයතා පුළිඟු සක්‍රීයයි', en: 'HV Spark Discharge Active' }
          : { si: 'බල සැපයුම අක්‍රීයයි', en: 'HV Coil Standby' },
        accentColor: active ? '#38BDF8' : '#94A3B8',
      };

    case 'vacuum-pump-gauge': {
      const idx = Math.max(0, Math.min(VACUUM_STAGES.length - 1, Math.round(sliderValue)));
      const pVal = active ? VACUUM_STAGES[idx] : 760;
      return {
        primaryReading: `${pVal} mmHg`,
        secondaryReading:
          pVal <= 0.015
            ? 'Crookes Dark Space (Cathode Rays!)'
            : pVal <= 10
              ? 'Gas Discharge Striations'
              : 'Atmospheric Insulator',
        statusLabel: active
          ? { si: 'රික්ත පොම්පය ක්‍රියාත්මකයි', en: 'Rotary Pump Evacuating' }
          : { si: 'වායුගෝලීය පීඩනය', en: 'Pump Stopped (760 mmHg)' },
        accentColor: pVal <= 0.015 ? '#4ADE80' : '#FBBF24',
      };
    }

    case 'dc-ammeter-voltmeter': {
      const condFactor = sampleId === 'cuso4' ? 0.34 : sampleId === 'nacl' ? 0.42 : 0.38;
      const currentA = active ? sliderValue * condFactor : 0;
      return {
        primaryReading: `${active ? sliderValue.toFixed(1) : '0.0'} V · ${currentA.toFixed(2)} A`,
        secondaryReading: `Electrolysis (${sampleId.toUpperCase()})`,
        statusLabel: active
          ? { si: 'විද්‍යුත් විච්ඡේදනය සිදුවේ', en: 'Electrolysis Current Flowing' }
          : { si: 'පරිපථය විවෘතයි', en: 'Circuit Switch OFF' },
        accentColor: active ? '#4ADE80' : '#94A3B8',
      };
    }

    case 'digital-ph-meter': {
      const basePh =
        sampleId === 'hcl'
          ? 1.0
          : sampleId === 'ethanoic'
            ? 2.87
            : sampleId === 'water'
              ? 7.0
              : sampleId === 'nh3'
                ? 11.12
                : 13.0;
      const tempShift = (sliderValue - 25) * -0.008;
      const ph = Math.max(0, Math.min(14, basePh + tempShift));
      const color = ph < 4 ? '#F87171' : ph < 6.5 ? '#FB923C' : ph < 7.6 ? '#4ADE80' : '#A78BFA';
      return {
        primaryReading: active ? `pH ${ph.toFixed(2)}` : 'pH --.--',
        secondaryReading: `Temp: ${sliderValue}°C · [H⁺] = ${(10 ** -ph).toExponential(1)} M`,
        statusLabel: active
          ? { si: 'වීදුරු ඉලෙක්ට්‍රෝඩය ගිල්වා ඇත', en: 'Glass Electrode Measuring' }
          : { si: 'ඉලෙක්ට්‍රෝඩය ඉහළට ඔසවා ඇත', en: 'Probe Raised / Standby' },
        accentColor: active ? color : '#94A3B8',
      };
    }

    case 'conductivity-tester': {
      const baseMs =
        sampleId === 'nacl-aq' ? 92 : sampleId === 'hc2h3o2' ? 8.5 : sampleId === 'ethanol' ? 0.3 : 0;
      const reading = active ? baseMs * sliderValue : 0;
      return {
        primaryReading: `${reading.toFixed(1)} mS/cm`,
        secondaryReading:
          reading > 30
            ? 'Bright Filament Glow (Strong Electrolyte)'
            : reading > 1
              ? 'Dim Filament Glow (Weak Electrolyte)'
              : 'Lamp OFF (Non-Electrolyte)',
        statusLabel: active
          ? { si: 'සන්නායකතාව මැනෙමින් පවතී', en: 'Conductivity Circuit Live' }
          : { si: 'විදුලිය විසන්ධි කර ඇත', en: 'Power OFF' },
        accentColor: reading > 30 ? '#FACC15' : reading > 1 ? '#FB923C' : '#94A3B8',
      };
    }

    case 'analytical-balance': {
      const unitMass = sampleId === 'na2co3' ? 2.65 : sampleId === 'cuso4-5h2o' ? 6.242 : 4.903;
      const mass = active ? unitMass * sliderValue : 0;
      return {
        primaryReading: `${mass.toFixed(4)} g`,
        secondaryReading: active ? `Draft Shield Closed · ${sampleId.toUpperCase()}` : 'Tare Ready (0.0000 g)',
        statusLabel: active
          ? { si: 'ස්කන්ධය ස්ථායීව මනින ලදී', en: 'Mass Stabilized (0.1 mg)' }
          : { si: '0.0000 g (TARE)', en: 'Tared at Zero' },
        accentColor: active ? '#4ADE80' : '#38BDF8',
      };
    }

    case 'magnetic-stirrer-hotplate':
      return {
        primaryReading: active ? `${sliderValue}°C · ${Math.round(sliderValue * 9)} RPM` : '25°C · 0 RPM',
        secondaryReading: active ? 'PTFE Stir Bar Spinning' : 'Hotplate Ambient',
        statusLabel: active
          ? { si: 'මන්ථකය හා තාපකය ක්‍රියාත්මකයි', en: 'Stirring & Heating Active' }
          : { si: 'අක්‍රීය අවස්ථාව', en: 'Stirrer OFF' },
        accentColor: active ? '#FB923C' : '#94A3B8',
      };

    case 'burette-stand': {
      const endpointReached = sliderValue >= 25;
      return {
        primaryReading: `${sliderValue.toFixed(1)} mL dispensed`,
        secondaryReading:
          sampleId === 'kmno4'
            ? endpointReached
              ? 'Persistent Pale Pink Endpoint!'
              : 'Decolorizing in Oxalic Acid'
            : endpointReached
              ? 'Phenolphthalein Pink Endpoint!'
              : 'Colorless Acid Solution',
        statusLabel: active
          ? { si: 'කරාමය විවෘතයි — බිංදු වැටේ', en: 'Stopcock Open — Titrating' }
          : { si: 'පාඨාංකය කියවන්න', en: 'Meniscus Ready to Read' },
        accentColor: endpointReached ? '#F472B6' : '#38BDF8',
      };
    }

    case 'pipette-filler':
      return {
        primaryReading: `${sliderValue.toFixed(1)} / 25.0 mL`,
        secondaryReading: sliderValue === 25 ? 'Lower Meniscus at Ring Mark' : 'Drawing / Draining Volume',
        statusLabel: active
          ? { si: 'ද්‍රාවණය මාරු කෙරේ', en: 'Delivering to Conical Flask' }
          : { si: 'පිපෙට්ටුව සූදානම්', en: 'Pipette Charged' },
        accentColor: '#38BDF8',
      };

    case 'volumetric-flask':
      return {
        primaryReading: `${sliderValue} / 250 mL`,
        secondaryReading: sliderValue === 250 ? 'At Etched Meniscus Ring (25°C)' : 'Diluting to Mark',
        statusLabel: active
          ? { si: 'සමජාතීයව කලවම් කෙරේ', en: 'Inverting & Mixing Standard' }
          : { si: 'ප්‍රමිති ද්‍රාවණය', en: 'Standard Solution Vessel' },
        accentColor: sampleId === 'kmno4' ? '#C084FC' : '#FB923C',
      };

    case 'conical-flask-dropper': {
      const ph = sliderValue;
      const colorName =
        sampleId === 'phenol'
          ? ph >= 8.3
            ? 'Pink / Magenta (Basic)'
            : 'Colorless (Acid/Neutral)'
          : ph >= 4.4
            ? 'Yellow (Basic)'
            : ph >= 3.1
              ? 'Orange (Endpoint)'
              : 'Red (Acidic)';
      return {
        primaryReading: `pH ${ph.toFixed(1)}`,
        secondaryReading: colorName,
        statusLabel: active
          ? { si: 'ප්ලාස්කුව කලවම් කෙරේ', en: 'Swirling Indicator Solution' }
          : { si: 'වර්ණ නිරීක්ෂණය', en: 'Indicator Hue Ready' },
        accentColor: sampleId === 'phenol' ? (ph >= 8.3 ? '#F472B6' : '#E2E8F0') : ph >= 4.4 ? '#FACC15' : '#FB7185',
      };
    }

    case 'bunsen-burner': {
      const flameTemp = active ? Math.round(450 + sliderValue * 9.5) : 25;
      return {
        primaryReading: active ? `${flameTemp}°C · ${sampleId}` : 'Burner OFF (25°C)',
        secondaryReading:
          sliderValue >= 50 ? 'Non-Luminous Roaring Blue Zone' : 'Luminous Yellow Safety Flame',
        statusLabel: active
          ? { si: 'පහන් දැල්ල දැල්වේ', en: 'Cation Emission Flame Lit' }
          : { si: 'ගෑස් කරාමය වසා ඇත', en: 'Gas Supply Closed' },
        accentColor: sampleId === 'Cu2+' ? '#34D399' : sampleId === 'K+' ? '#C084FC' : '#FACC15',
      };
    }

    case 'coffee-cup-calorimeter': {
      const deltaT = (sampleId === 'exo' ? +13.6 : -6.8) * sliderValue * (active ? 1 : 0);
      const temp = 25 + deltaT;
      return {
        primaryReading: `${temp.toFixed(1)}°C (ΔT = ${deltaT >= 0 ? '+' : ''}${deltaT.toFixed(1)}°C)`,
        secondaryReading:
          sampleId === 'exo' ? 'ΔH < 0 (Exothermic Neutralization)' : 'ΔH > 0 (Endothermic Dissolution)',
        statusLabel: active
          ? { si: 'මන්ථකයෙන් තාපය මැනේ', en: 'Stirring & Tracking ΔT' }
          : { si: 'ආරම්භක 25.0°C', en: 'Thermal Baseline 25.0°C' },
        accentColor: deltaT > 0 ? '#F87171' : deltaT < 0 ? '#38BDF8' : '#E2E8F0',
      };
    }

    case 'gas-syringe': {
      const vol = sampleId === 'boyle' ? Math.round(5000 / Math.max(40, sliderValue)) : Math.min(95, Math.round(sliderValue * 0.42));
      return {
        primaryReading: `${vol} mL · ${sliderValue} kPa`,
        secondaryReading: sampleId === 'boyle' ? `PV = ${(vol * sliderValue).toFixed(0)} mL·kPa` : 'Gas Collection Mode',
        statusLabel: active
          ? { si: 'පිස්ටනය චලනය වේ', en: 'Plunger Responding Live' }
          : { si: 'වායු පරිමා කියවීම', en: 'Syringe Scale Ready' },
        accentColor: '#38BDF8',
      };
    }

    case 'liebig-condenser':
      return {
        primaryReading: active ? `Vapor ${sliderValue}°C → Cold Distillate` : 'Cooling Standby',
        secondaryReading: active ? 'Water IN (bottom) → OUT (top)' : 'Turn on Water Flow',
        statusLabel: active
          ? { si: 'වාෂ්ප සංඝනීභවනය වේ', en: 'Reflux / Condensation Active' }
          : { si: 'සංඝනීකාරකය සූදානම්', en: 'Condenser Idle' },
        accentColor: active ? '#38BDF8' : '#94A3B8',
      };

    case 'kipps-apparatus':
      return {
        primaryReading: active ? `${sampleId.toUpperCase()} Gas Flowing (${sliderValue} M HCl)` : 'Valve Closed (Equilibrium Hold)',
        secondaryReading: active ? 'Acid Contacts Solid Lumps' : 'Gas Pressure Pushes Acid Up',
        statusLabel: active
          ? { si: 'වායු බුබුළු නිකුත් වේ', en: 'Continuous Gas Generation' }
          : { si: 'ස්වයංක්‍රීය නැවතුම් අවස්ථාව', en: 'Self-Paused Pressure Hold' },
        accentColor: active ? '#4ADE80' : '#FBBF24',
      };

    case 'crookes-tube':
      return {
        primaryReading: active ? `Vacuum ${sliderValue}% · ZnS Glow` : 'Discharge Tube OFF',
        secondaryReading: sampleId === 'cross' ? 'Sharp Maltese Cross Shadow' : 'Straight Cathode Beam',
        statusLabel: active
          ? { si: 'ZnS කොළ ප්‍රතිදීප්තිය දිස්වේ', en: 'Cathode Ray Fluorescence Active' }
          : { si: 'නළය අක්‍රීයයි', en: 'Tube Unpowered' },
        accentColor: active ? '#4ADE80' : '#94A3B8',
      };

    case 'daniell-galvanic-cell': {
      const baseE = sampleId === 'zn-cu' ? 1.10 : 0.78;
      const nernst = baseE + 0.0296 * Math.log10(Math.max(0.1, sliderValue));
      return {
        primaryReading: active ? `+${nernst.toFixed(2)} V (EMF)` : '0.00 V (Bridge Removed)',
        secondaryReading: 'Zn(s)|Zn²⁺ || Cu²⁺|Cu(s) · KCl Bridge',
        statusLabel: active
          ? { si: 'ස්වයංසිද්ධ විභවය ජනනය වේ', en: 'Galvanic EMF Active' }
          : { si: 'ලවණ පාලම විසන්ධියි', en: 'Open Cell Circuit' },
        accentColor: active ? '#4ADE80' : '#94A3B8',
      };
    }

    case 'separating-funnel':
      return {
        primaryReading:
          sampleId === 'chcl3' ? 'Lower Layer: CHCl₃ (1.49 g/cm³)' : 'Upper Layer: Ether (0.71 g/cm³)',
        secondaryReading: `Drained: ${sliderValue}%`,
        statusLabel: active
          ? { si: 'පහළ ස්ථරය වෙන් කෙරේ', en: 'Draining Bottom Phase' }
          : { si: 'නොමිශ්‍ර ස්ථර දෙකක්', en: 'Two Immiscible Layers' },
        accentColor: '#38BDF8',
      };

    case 'horseshoe-magnet':
      return {
        primaryReading: active
          ? `${sliderValue.toFixed(1)} mT (${sampleId === 'n-up' ? 'Deflect Down' : 'Deflect Up'})`
          : 'Magnet Parked Away',
        secondaryReading: 'Lorentz Force: F = q(v × B)',
        statusLabel: active
          ? { si: 'කැතෝඩ කිරණ අපගමනය වේ', en: 'Beam Deflecting in B-Field' }
          : { si: 'සෘජු කදම්බය', en: 'Undeflected Path' },
        accentColor: active ? '#F87171' : '#94A3B8',
      };

    default:
      return {
        primaryReading: 'Ready',
        secondaryReading: id,
        statusLabel: { si: 'සූදානම්', en: 'Ready' },
        accentColor: '#38BDF8',
      };
  }
}
