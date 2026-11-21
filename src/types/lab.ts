export type Language = 'si' | 'en';

export type ScreenState =
  | 'signin'
  | 'welcome'
  | 'map'
  | 'prep'
  | 'workbench'
  | 'explorer'
  | 'reactions'
  | 'elements';

export type VoiceName = 'Puck';

export interface StudentProfile {
  name: string;
  age: number;
  email: string;
  username: string;
  createdAt: string;
}

export type UnitRoman = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII' | 'IX' | 'X';

export type Unit1ExperimentId =
  | 'cathode-tube'
  | 'thomson-canal'
  | 'millikan'
  | 'rutherford';

export type Unit2ExperimentId =
  | 'flame-test'
  | 'liquid-polarity'
  | 'intermolecular-bp'
  | 'vsepr-shapes';

export type Unit3ExperimentId =
  | 'acid-base-titration'
  | 'kmno4-redox'
  | 'hydrated-salt'
  | 'mg-hcl-stoich';

export type Unit4ExperimentId =
  | 'boyles-law'
  | 'charles-law'
  | 'graham-diffusion'
  | 'molar-volume';

export type Unit5ExperimentId =
  | 'calorimetry-neutralization'
  | 'enthalpy-solution'
  | 'hess-law'
  | 'alcohol-combustion';

export type Unit6ExperimentId =
  | 'group12-water'
  | 'halide-silver'
  | 'dblock-complexes'
  | 'brown-ring-nitrate';

export type Unit7ExperimentId =
  | 'unsaturation-baeyer'
  | 'aldehyde-tollens'
  | 'esterification-reflux'
  | 'lucas-iodoform';

export type Unit8ExperimentId =
  | 'thiosulphate-cross'
  | 'iodine-clock'
  | 'peroxide-catalyst'
  | 'marble-rate';

export type Unit9ExperimentId =
  | 'chromate-dichromate'
  | 'fe-scn-equilibrium'
  | 'no2-n2o4-temp'
  | 'ester-equilibrium';

export type Unit10ExperimentId =
  | 'daniell-cell'
  | 'cuso4-electrolysis'
  | 'faraday-plating'
  | 'iron-corrosion';

export type ExperimentId =
  | Unit1ExperimentId
  | Unit2ExperimentId
  | Unit3ExperimentId
  | Unit4ExperimentId
  | Unit5ExperimentId
  | Unit6ExperimentId
  | Unit7ExperimentId
  | Unit8ExperimentId
  | Unit9ExperimentId
  | Unit10ExperimentId;

export type BenchApparatusKind =
  | 'crookes'
  | 'thomson'
  | 'millikan'
  | 'rutherford'
  | 'flame-burner'
  | 'conductivity-bath'
  | 'vsepr-3d'
  | 'titration-burette'
  | 'gas-law-rig'
  | 'calorimeter-rig'
  | 'test-tube-rack'
  | 'kinetics-flask'
  | 'electrochem-cell';

export type GasType = 'air' | 'neon' | 'hydrogen' | 'argon';

export type CathodeMetal = 'copper' | 'aluminum' | 'platinum';

export type FoilMaterial = 'gold' | 'aluminum';

export type CameraPreset = 'overview' | 'front' | 'closeup' | 'top';

export type FlameCation = 'Li+' | 'Na+' | 'K+' | 'Ca2+' | 'Ba2+' | 'Cu2+';
export type LiquidSample = 'nacl-aq' | 'ethanol' | 'hexane' | 'hc2h3o2';
export type VseprMolecule = 'CH4' | 'NH3' | 'H2O' | 'BF3' | 'SF6';
export type HalideSample = 'Cl-' | 'Br-' | 'I-';
export type TransitionMetalIon = 'Cu2+' | 'Fe2+' | 'Fe3+' | 'Cr3+' | 'Co2+';
export type OrganicSample = 'alkene' | 'alkane' | 'aldehyde' | 'ketone';
export type CatalystChoice = 'none' | 'MnO2' | 'KI';
export type EquilibriumShift = 'neutral' | 'add-acid' | 'add-base' | 'heat' | 'cool';
export type ElectrodePair = 'Zn-Cu' | 'Pt-Pt' | 'Cu-Cu' | 'Fe-Zn';

export interface LocalizedText {
  si: string;
  en: string;
}

export type EquipmentIconType =
  | 'coil'
  | 'tube'
  | 'pump'
  | 'cross'
  | 'magnet'
  | 'plates'
  | 'coils'
  | 'gas'
  | 'chamber'
  | 'atomizer'
  | 'xray'
  | 'microscope'
  | 'source'
  | 'foil'
  | 'screen'
  | 'burner'
  | 'burette'
  | 'flask'
  | 'calorimeter'
  | 'thermometer'
  | 'battery'
  | 'testtubes'
  | 'syringe'
  | 'molecule';

export interface EquipmentItem {
  id: string;
  slotLabel: LocalizedText;
  name: LocalizedText;
  description: LocalizedText;
  iconType: EquipmentIconType;
  benchSlot: { x: number; z: number };
}

export type StepValidationType =
  | 'assemble'
  | 'evacuate-pressure'
  | 'maltese-shadow'
  | 'paddle-wheel'
  | 'magnet-deflection'
  | 'electric-deflection'
  | 'magnetic-balance'
  | 'gas-independence'
  | 'canal-rays'
  | 'spray-ionize'
  | 'balance-droplet'
  | 'rutherford-forward'
  | 'rutherford-backscatter'
  | 'chem-heat-or-mix'
  | 'chem-titrate-endpoint'
  | 'chem-adjust-variable'
  | 'chem-observe-quiz'
  | 'pack-away';

export interface LabStep {
  id: string;
  title: LocalizedText;
  taskTitle: LocalizedText;
  instruction: LocalizedText;
  whyText: LocalizedText;
  assistantHint: LocalizedText;
  validationType: StepValidationType;
  quizQuestion?: {
    prompt: LocalizedText;
    options: LocalizedText[];
    correctIndex: number;
    explanation: LocalizedText;
  };
}

export interface ChemBenchParams {
  // General reaction & thermal controls
  burnerOn: boolean;
  reagentAdded: boolean;
  stirringOn: boolean;
  temperatureC: number; // 15..95 C
  concentrationM: number; // 0.1..2.0 mol dm^-3
  // Unit II: Structure & Bonding
  flameCation: FlameCation;
  liquidSample: LiquidSample;
  vseprMolecule: VseprMolecule;
  // Unit III: Titration & Stoichiometry
  buretteVolumeMl: number; // 0..50 mL
  indicatorType: 'phenolphthalein' | 'methyl-orange' | 'self-kmno4';
  // Unit IV: Gas Laws
  pressureKpa: number; // 50..300 kPa
  // Unit VI & VII: Qualitative reagents
  halideSample: HalideSample;
  transitionIon: TransitionMetalIon;
  organicSample: OrganicSample;
  // Unit VIII: Kinetics
  catalyst: CatalystChoice;
  surfaceArea: 'lumps' | 'powder';
  // Unit IX: Equilibrium
  eqAction: EquilibriumShift;
  // Unit X: Electrochemistry
  electrodePair: ElectrodePair;
  appliedVoltageV: number; // 0..12 V
}

export interface LabSimulationParams {
  experimentId: ExperimentId;
  // Power & vacuum (Unit I Stations 01 & 02)
  hvEnabled: boolean;
  voltageKv: number; // 1..20 kV
  pressureMmHg: number; // 0.001..760 mmHg (logarithmic slider)
  gas: GasType;
  cathodeMetal: CathodeMetal;
  // Station 01 inserts
  malteseCrossUp: boolean;
  paddleWheelEngaged: boolean;
  magnetActive: boolean;
  magnetPolarity: 1 | -1; // +1 N-up, -1 S-up
  // Station 02 fields & Canal mode
  thomsonMode: 'cathode-rays' | 'canal-rays';
  electricVoltageV: number; // -300..+300 V
  magneticFieldMt: number; // -2.5..+2.5 mT
  // Station 03 Millikan
  dropletChargeN: number; // 1..5 elementary charges
  dropletRadiusUm: number; // 0.8..1.6 um
  millikanVoltageV: number; // 0..1000 V
  xrayActive: boolean;
  sprayPulse: number; // counter incremented when spraying
  // Station 04 Rutherford
  alphaBeamEnabled: boolean;
  detectorAngleDeg: number; // 0..180 deg
  foilMaterial: FoilMaterial;
  foilThicknessNm: number; // 100..600 nm
  // Units II-X unified bench state
  chem: ChemBenchParams;
  // Environment
  darkRoom: boolean;
}
