import type {
  ExperimentId,
  FlameCation,
  LabSimulationParams,
  VseprMolecule,
} from '../types/lab';

export interface FlameTestResult {
  colorHex: string;
  wavelengthNm: number;
  label: string;
}

const FLAME_SPECS: Record<FlameCation, FlameTestResult> = {
  'Li+': { colorHex: '#FF2442', wavelengthNm: 670, label: 'Crimson Red' },
  'Na+': { colorHex: '#FFB703', wavelengthNm: 589, label: 'Golden Yellow' },
  'K+': { colorHex: '#C084FC', wavelengthNm: 766, label: 'Lilac / Pale Violet' },
  'Ca2+': { colorHex: '#EA580C', wavelengthNm: 622, label: 'Brick Red' },
  'Ba2+': { colorHex: '#84CC16', wavelengthNm: 524, label: 'Apple Green' },
  'Cu2+': { colorHex: '#10B981', wavelengthNm: 510, label: 'Blue-Green' },
};

export function evaluateFlameTest(cation: FlameCation): FlameTestResult {
  return FLAME_SPECS[cation];
}

export interface VseprSpec {
  formula: VseprMolecule;
  shapeName: string;
  bondAngleDeg: number;
  bondingPairs: number;
  lonePairs: number;
  bondVectors: Array<[number, number, number]>;
  loneVectors: Array<[number, number, number]>;
}

const VSEPR_TABLE: Record<VseprMolecule, VseprSpec> = {
  CH4: {
    formula: 'CH4',
    shapeName: 'Tetrahedral',
    bondAngleDeg: 109.5,
    bondingPairs: 4,
    lonePairs: 0,
    bondVectors: [
      [0, 1, 0],
      [0.943, -0.333, 0],
      [-0.471, -0.333, 0.816],
      [-0.471, -0.333, -0.816],
    ],
    loneVectors: [],
  },
  NH3: {
    formula: 'NH3',
    shapeName: 'Trigonal Pyramidal',
    bondAngleDeg: 107.0,
    bondingPairs: 3,
    lonePairs: 1,
    bondVectors: [
      [0.92, -0.39, 0],
      [-0.46, -0.39, 0.8],
      [-0.46, -0.39, -0.8],
    ],
    loneVectors: [[0, 1, 0]],
  },
  H2O: {
    formula: 'H2O',
    shapeName: 'Bent / V-Shaped',
    bondAngleDeg: 104.5,
    bondingPairs: 2,
    lonePairs: 2,
    bondVectors: [
      [0.79, -0.61, 0],
      [-0.79, -0.61, 0],
    ],
    loneVectors: [
      [0, 0.72, 0.69],
      [0, 0.72, -0.69],
    ],
  },
  BF3: {
    formula: 'BF3',
    shapeName: 'Trigonal Planar',
    bondAngleDeg: 120.0,
    bondingPairs: 3,
    lonePairs: 0,
    bondVectors: [
      [1, 0, 0],
      [-0.5, 0, 0.866],
      [-0.5, 0, -0.866],
    ],
    loneVectors: [],
  },
  SF6: {
    formula: 'SF6',
    shapeName: 'Octahedral',
    bondAngleDeg: 90.0,
    bondingPairs: 6,
    lonePairs: 0,
    bondVectors: [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ],
    loneVectors: [],
  },
};

export function getVseprSpec(mol: VseprMolecule): VseprSpec {
  return VSEPR_TABLE[mol];
}

export interface TitrationResult {
  addedMl: number;
  equivalenceMl: number;
  pH: number;
  atEndpoint: boolean;
  overTitrated: boolean;
  flaskColorHex: string;
}

export function computeTitrationState(params: LabSimulationParams): TitrationResult {
  const addedMl = params.chem.buretteVolumeMl;
  // Standard 25.0 mL analyte at 0.10 M neutralized by 0.10 M titrant -> equivalence at 25.0 mL
  const equivalenceMl = Number((25 / Math.max(0.5, params.chem.concentrationM)).toFixed(1));
  const diff = addedMl - equivalenceMl;

  let pH = 7.0;
  if (diff < -0.5) {
    const excessAcid = Math.max(1e-4, (-diff * 0.002) / (25 + addedMl));
    pH = Math.max(1.0, Math.min(6.4, -Math.log10(excessAcid)));
  } else if (diff > 0.5) {
    const excessBase = Math.max(1e-4, (diff * 0.002) / (25 + addedMl));
    pH = Math.min(13.2, Math.max(7.6, 14 + Math.log10(excessBase)));
  } else {
    pH = 7.0 + diff * 1.4;
  }

  const atEndpoint = Math.abs(diff) <= 0.8;
  const overTitrated = diff > 0.8;

  let flaskColorHex = '#E0F2FE'; // clear aqueous
  if (params.experimentId === 'kmno4-redox') {
    if (addedMl < equivalenceMl - 0.6) {
      flaskColorHex = '#E0F2FE'; // MnO4- decolorized by oxalic acid
    } else if (atEndpoint) {
      flaskColorHex = '#F9A8D4'; // pale pink permanent endpoint
    } else {
      flaskColorHex = '#9333EA'; // excess deep purple KMnO4
    }
  } else if (params.chem.indicatorType === 'methyl-orange') {
    if (addedMl < equivalenceMl - 0.6) flaskColorHex = '#EF4444';
    else if (atEndpoint) flaskColorHex = '#F59E0B';
    else flaskColorHex = '#FACC15';
  } else {
    // Phenolphthalein
    if (addedMl < equivalenceMl - 0.6) flaskColorHex = '#E0F2FE';
    else if (atEndpoint) flaskColorHex = '#F9A8D4';
    else flaskColorHex = '#EC4899';
  }

  return {
    addedMl,
    equivalenceMl,
    pH: Number(pH.toFixed(2)),
    atEndpoint,
    overTitrated,
    flaskColorHex,
  };
}

export interface GasLawResult {
  volumeMl: number;
  pvConstant: number;
  diffusionRingRatio: number; // fraction along tube from NH3 end (0..1)
  gasSyringeFraction: number; // 0..1
}

export function computeGasLawState(params: LabSimulationParams): GasLawResult {
  const { pressureKpa, temperatureC } = params.chem;
  const tempK = temperatureC + 273.15;
  // Reference: at 100 kPa and 298.15 K, V = 50 mL
  const volumeMl =
    params.experimentId === 'boyles-law'
      ? Number(((100 * 50) / Math.max(40, pressureKpa)).toFixed(1))
      : params.experimentId === 'charles-law'
        ? Number(((50 * tempK) / 298.15).toFixed(1))
        : 50;

  const pvConstant = Number((pressureKpa * volumeMl).toFixed(0));
  // Graham's Law: rate(NH3)/rate(HCl) = sqrt(36.5/17.0) = 1.465 -> d_NH3 / (d_NH3 + d_HCl) = 1.465 / 2.465 = 0.594
  const diffusionRingRatio = 0.594;
  const gasSyringeFraction = Math.min(1, Math.max(0.15, volumeMl / 110));

  return {
    volumeMl,
    pvConstant,
    diffusionRingRatio,
    gasSyringeFraction,
  };
}

export interface CalorimetryResult {
  deltaTC: number;
  finalTempC: number;
  deltaHKjPerMol: number;
  thermalColorHex: string;
}

export function computeCalorimetryState(params: LabSimulationParams): CalorimetryResult {
  const baseT = 25.0;
  if (!params.chem.reagentAdded && !params.chem.burnerOn) {
    return {
      deltaTC: 0,
      finalTempC: baseT,
      deltaHKjPerMol: 0,
      thermalColorHex: '#38BDF8',
    };
  }

  const concScale = params.chem.concentrationM;
  if (params.experimentId === 'enthalpy-solution') {
    // Endothermic NH4NO3 dissolution cools solution
    const deltaTC = Number((-6.2 * concScale).toFixed(2));
    return {
      deltaTC,
      finalTempC: Number((baseT + deltaTC).toFixed(2)),
      deltaHKjPerMol: 25.7,
      thermalColorHex: '#38BDF8',
    };
  }

  if (params.experimentId === 'alcohol-combustion') {
    const heatBoost = params.chem.burnerOn ? 18.5 : 4.2;
    return {
      deltaTC: Number(heatBoost.toFixed(2)),
      finalTempC: Number((baseT + heatBoost).toFixed(2)),
      deltaHKjPerMol: -1367,
      thermalColorHex: '#F97316',
    };
  }

  // Neutralization (HCl + NaOH -> -57.3 kJ/mol) or Hess's law exothermic
  const deltaTC = Number((6.8 * concScale).toFixed(2));
  return {
    deltaTC,
    finalTempC: Number((baseT + deltaTC).toFixed(2)),
    deltaHKjPerMol: params.experimentId === 'hess-law' ? -145.6 : -57.3,
    thermalColorHex: '#FB7185',
  };
}

export interface KineticsResult {
  relativeRate: number;
  timeToCrossSec: number;
  gasYieldMl: number;
  turbidityOpacity: number; // 0..0.95
}

export function computeKineticsState(params: LabSimulationParams): KineticsResult {
  const { concentrationM, temperatureC, catalyst, surfaceArea, reagentAdded } = params.chem;
  if (!reagentAdded) {
    return {
      relativeRate: 0,
      timeToCrossSec: 0,
      gasYieldMl: 0,
      turbidityOpacity: 0.05,
    };
  }

  const tempFactor = Math.pow(2, (temperatureC - 25) / 10);
  const catFactor = catalyst === 'none' ? 1 : catalyst === 'KI' ? 3.2 : 5.5;
  const areaFactor = surfaceArea === 'powder' ? 2.6 : 1.0;
  const relativeRate = Number((concentrationM * tempFactor * catFactor * areaFactor).toFixed(2));
  const timeToCrossSec = Number(Math.max(4, 48 / Math.max(0.25, relativeRate)).toFixed(1));
  const gasYieldMl = Number(Math.min(85, 28 * relativeRate).toFixed(1));
  const turbidityOpacity = Math.min(0.95, 0.25 + relativeRate * 0.22);

  return {
    relativeRate,
    timeToCrossSec,
    gasYieldMl,
    turbidityOpacity,
  };
}

export interface ElectrochemResult {
  cellVoltageV: number;
  platedMassMg: number;
  leftSolutionColorHex: string;
  rightSolutionColorHex: string;
  gasBubbleRate: number;
}

export function computeElectrochemState(params: LabSimulationParams): ElectrochemResult {
  const { electrodePair, appliedVoltageV, concentrationM, reagentAdded } = params.chem;

  if (params.experimentId === 'daniell-cell') {
    // Nernst simplified offset around 1.10 V
    const emf = electrodePair === 'Zn-Cu' ? 1.1 + 0.03 * Math.log10(Math.max(0.1, concentrationM)) : 0.76;
    return {
      cellVoltageV: Number(emf.toFixed(2)),
      platedMassMg: 0,
      leftSolutionColorHex: '#E0F2FE',
      rightSolutionColorHex: '#0284C7',
      gasBubbleRate: 0,
    };
  }

  const activeV = Math.max(0, appliedVoltageV);
  // Faraday mass m = I * t * M / (n*F) scaled to simulated 5-min run
  const currentA = activeV * 0.35 * concentrationM;
  const platedMassMg = Number(((currentA * 300 * 63.55) / (2 * 96485) * 1000).toFixed(1));

  return {
    cellVoltageV: Number(activeV.toFixed(2)),
    platedMassMg,
    leftSolutionColorHex: reagentAdded ? '#0284C7' : '#BAE6FD',
    rightSolutionColorHex: '#0284C7',
    gasBubbleRate: activeV > 1.2 ? Math.min(1, activeV / 9) : 0,
  };
}

export interface ChemistryTelemetry {
  primaryMetricLabel: string;
  primaryMetricValue: string;
  liquidColorHex: string;
  secondaryLiquidHex: string;
  flameColorHex: string;
  precipitateColorHex: string | null;
  gasBubbles: number; // 0..1
  thermometerNorm: number; // 0..1
  syringeFraction: number; // 0..1
  summaryLine: string;
}

export function evaluateChemistryBench(params: LabSimulationParams): ChemistryTelemetry {
  const id: ExperimentId = params.experimentId;
  const c = params.chem;

  // Unit II
  if (id === 'flame-test') {
    const f = evaluateFlameTest(c.flameCation);
    return {
      primaryMetricLabel: 'Emission λ',
      primaryMetricValue: `${f.wavelengthNm} nm (${f.label})`,
      liquidColorHex: '#CBD5E1',
      secondaryLiquidHex: '#CBD5E1',
      flameColorHex: c.burnerOn ? f.colorHex : '#3B82F6',
      precipitateColorHex: null,
      gasBubbles: 0,
      thermometerNorm: c.burnerOn ? 0.85 : 0.2,
      syringeFraction: 0.2,
      summaryLine: `${c.flameCation} flame emission: ${f.label} (${f.wavelengthNm} nm)`,
    };
  }

  if (id === 'liquid-polarity' || id === 'intermolecular-bp') {
    const sampleMap = {
      'nacl-aq': { cond: 'High (Strong Electrolyte)', bp: 103, col: '#BAE6FD', bub: c.burnerOn ? 0.8 : 0.15 },
      ethanol: { cond: 'Non-conductor (H-bonded)', bp: 78, col: '#E0F2FE', bub: c.burnerOn ? 0.95 : 0 },
      hexane: { cond: 'Insulator (London Forces)', bp: 69, col: '#FEF9C3', bub: c.burnerOn ? 1.0 : 0 },
      hc2h3o2: { cond: 'Weak Electrolyte', bp: 118, col: '#DDD6FE', bub: c.burnerOn ? 0.65 : 0.05 },
    }[c.liquidSample];

    return {
      primaryMetricLabel: id === 'liquid-polarity' ? 'Conductivity' : 'Boiling Point',
      primaryMetricValue: id === 'liquid-polarity' ? sampleMap.cond : `${sampleMap.bp} °C`,
      liquidColorHex: sampleMap.col,
      secondaryLiquidHex: sampleMap.col,
      flameColorHex: '#38BDF8',
      precipitateColorHex: null,
      gasBubbles: sampleMap.bub,
      thermometerNorm: sampleMap.bp / 130,
      syringeFraction: 0.3,
      summaryLine: `${c.liquidSample}: ${sampleMap.cond}, bp ${sampleMap.bp} °C`,
    };
  }

  if (id === 'vsepr-shapes') {
    const v = getVseprSpec(c.vseprMolecule);
    return {
      primaryMetricLabel: 'Geometry',
      primaryMetricValue: `${v.shapeName} (${v.bondAngleDeg}°)`,
      liquidColorHex: '#38BDF8',
      secondaryLiquidHex: '#38BDF8',
      flameColorHex: '#38BDF8',
      precipitateColorHex: null,
      gasBubbles: 0,
      thermometerNorm: 0.25,
      syringeFraction: 0.2,
      summaryLine: `${v.formula}: ${v.shapeName}, bond angle ${v.bondAngleDeg}°, LP=${v.lonePairs}`,
    };
  }

  // Unit III
  if (id === 'acid-base-titration' || id === 'kmno4-redox') {
    const t = computeTitrationState(params);
    return {
      primaryMetricLabel: id === 'kmno4-redox' ? 'KMnO₄ Added' : 'Burette / pH',
      primaryMetricValue: `${t.addedMl.toFixed(1)} mL · pH ${t.pH}`,
      liquidColorHex: t.flaskColorHex,
      secondaryLiquidHex: id === 'kmno4-redox' ? '#9333EA' : '#E0F2FE',
      flameColorHex: '#3B82F6',
      precipitateColorHex: null,
      gasBubbles: 0,
      thermometerNorm: 0.3,
      syringeFraction: t.addedMl / 50,
      summaryLine: `Added ${t.addedMl.toFixed(1)} mL (Eq: ${t.equivalenceMl} mL) — ${t.atEndpoint ? 'ENDPOINT' : t.overTitrated ? 'OVERTITRATED' : 'BEFORE ENDPOINT'}`,
    };
  }

  if (id === 'hydrated-salt' || id === 'mg-hcl-stoich') {
    const active = c.reagentAdded || c.burnerOn;
    return {
      primaryMetricLabel: id === 'hydrated-salt' ? 'CuSO₄·5H₂O State' : 'H₂ Gas Collected',
      primaryMetricValue:
        id === 'hydrated-salt'
          ? c.burnerOn
            ? 'Anhydrous White CuSO₄'
            : 'Blue CuSO₄·5H₂O'
          : `${active ? (24 * c.concentrationM).toFixed(1) : '0.0'} mL H₂`,
      liquidColorHex: id === 'hydrated-salt' ? (c.burnerOn ? '#F8FAFC' : '#0284C7') : '#E0F2FE',
      secondaryLiquidHex: '#BAE6FD',
      flameColorHex: '#38BDF8',
      precipitateColorHex: id === 'hydrated-salt' ? (c.burnerOn ? '#F8FAFC' : '#0284C7') : null,
      gasBubbles: active ? 0.78 : 0,
      thermometerNorm: c.burnerOn ? 0.85 : 0.3,
      syringeFraction: active ? Math.min(1, 0.35 * c.concentrationM) : 0.08,
      summaryLine:
        id === 'hydrated-salt'
          ? c.burnerOn
            ? 'CuSO4·5H2O dehydrated to white anhydrous CuSO4'
            : 'Blue hydrated copper(II) sulphate crystals'
          : `Mg + 2HCl -> MgCl2 + H2 (${active ? 'evolving H2 gas' : 'ready'})`,
    };
  }

  // Unit IV
  if (id === 'boyles-law' || id === 'charles-law' || id === 'graham-diffusion' || id === 'molar-volume') {
    const g = computeGasLawState(params);
    return {
      primaryMetricLabel:
        id === 'boyles-law'
          ? 'P × V'
          : id === 'charles-law'
            ? 'V(T)'
            : id === 'graham-diffusion'
              ? 'NH₄Cl Ring'
              : 'Gas Volume',
      primaryMetricValue:
        id === 'graham-diffusion'
          ? '59.4% from NH₃'
          : `${g.volumeMl} mL @ ${c.pressureKpa} kPa / ${c.temperatureC}°C`,
      liquidColorHex: '#94A3B8',
      secondaryLiquidHex: '#CBD5E1',
      flameColorHex: '#38BDF8',
      precipitateColorHex: id === 'graham-diffusion' && c.reagentAdded ? '#FFFFFF' : null,
      gasBubbles: c.reagentAdded ? 0.45 : 0,
      thermometerNorm: Math.min(1, Math.max(0.1, c.temperatureC / 100)),
      syringeFraction: g.gasSyringeFraction,
      summaryLine: `Gas V=${g.volumeMl} mL, P=${c.pressureKpa} kPa, T=${c.temperatureC} °C`,
    };
  }

  // Unit V
  if (
    id === 'calorimetry-neutralization' ||
    id === 'enthalpy-solution' ||
    id === 'hess-law' ||
    id === 'alcohol-combustion'
  ) {
    const cal = computeCalorimetryState(params);
    return {
      primaryMetricLabel: 'ΔT / ΔH',
      primaryMetricValue: `ΔT = ${cal.deltaTC > 0 ? '+' : ''}${cal.deltaTC} °C · ΔH = ${cal.deltaHKjPerMol} kJ/mol`,
      liquidColorHex: cal.thermalColorHex,
      secondaryLiquidHex: '#BAE6FD',
      flameColorHex: '#F97316',
      precipitateColorHex: null,
      gasBubbles: c.stirringOn ? 0.35 : 0,
      thermometerNorm: Math.min(1, Math.max(0.08, cal.finalTempC / 60)),
      syringeFraction: 0.2,
      summaryLine: `Calorimeter T_final=${cal.finalTempC}°C (ΔT=${cal.deltaTC}°C, ΔH=${cal.deltaHKjPerMol} kJ/mol)`,
    };
  }

  // Unit VI
  if (id === 'group12-water' || id === 'halide-silver' || id === 'dblock-complexes' || id === 'brown-ring-nitrate') {
    const halideMap = {
      'Cl-': { ppt: '#F8FAFC', label: 'AgCl White ppt (soluble in dil. NH₃)' },
      'Br-': { ppt: '#FEF3C7', label: 'AgBr Cream ppt (soluble in conc. NH₃)' },
      'I-': { ppt: '#FDE047', label: 'AgI Pale Yellow ppt (insoluble in NH₃)' },
    }[c.halideSample];

    const dBlockMap = {
      'Cu2+': { col: c.reagentAdded ? '#1D4ED8' : '#38BDF8', label: '[Cu(NH₃)₄]²⁺ Deep Royal Blue' },
      'Fe2+': { col: '#4ADE80', label: '[Fe(H₂O)₆]²⁺ Pale Green -> Fe(OH)₂' },
      'Fe3+': { col: '#B45309', label: 'Fe(OH)₃ Reddish-Brown ppt' },
      'Cr3+': { col: '#15803D', label: '[Cr(OH)₆]³⁻ Emerald Green' },
      'Co2+': { col: c.burnerOn ? '#2563EB' : '#F472B6', label: 'Pink [Co(H₂O)₆]²⁺ ⇌ Blue [CoCl₄]²⁻' },
    }[c.transitionIon];

    const col =
      id === 'dblock-complexes'
        ? dBlockMap.col
        : id === 'brown-ring-nitrate'
          ? c.reagentAdded
            ? '#78350F'
            : '#BAE6FD'
          : id === 'group12-water'
            ? c.reagentAdded
              ? '#F472B6'
              : '#E0F2FE'
            : '#E0F2FE';

    return {
      primaryMetricLabel: 'Qualitative Test',
      primaryMetricValue:
        id === 'halide-silver'
          ? halideMap.label
          : id === 'dblock-complexes'
            ? dBlockMap.label
            : id === 'brown-ring-nitrate'
              ? c.reagentAdded
                ? '[Fe(H₂O)₅NO]²⁺ Brown Ring Formed'
                : 'Add Conc. H₂SO₄ carefully'
              : c.reagentAdded
                ? 'H₂ Bubbles + Pink Alkaline Solution'
                : 'Na / Mg in Water',
      liquidColorHex: col,
      secondaryLiquidHex: '#BAE6FD',
      flameColorHex: '#C084FC',
      precipitateColorHex: id === 'halide-silver' && c.reagentAdded ? halideMap.ppt : null,
      gasBubbles: id === 'group12-water' && c.reagentAdded ? 0.85 : 0,
      thermometerNorm: 0.35,
      syringeFraction: 0.25,
      summaryLine:
        id === 'halide-silver'
          ? halideMap.label
          : id === 'dblock-complexes'
            ? dBlockMap.label
            : 'Qualitative inorganic observation ready',
    };
  }

  // Unit VII
  if (id === 'unsaturation-baeyer' || id === 'aldehyde-tollens' || id === 'esterification-reflux' || id === 'lucas-iodoform') {
    const isAlkene = c.organicSample === 'alkene';
    const isAldehyde = c.organicSample === 'aldehyde';
    return {
      primaryMetricLabel: 'Organic Result',
      primaryMetricValue:
        id === 'unsaturation-baeyer'
          ? isAlkene && c.reagentAdded
            ? 'Br₂ / KMnO₄ Decolorized (C=C)'
            : 'No Decolorization (Saturated)'
          : id === 'aldehyde-tollens'
            ? isAldehyde && (c.reagentAdded || c.burnerOn)
              ? 'Silver Mirror (Ag⁰) / Cu₂O Red ppt'
              : 'No Reaction (Ketone)'
            : id === 'esterification-reflux'
              ? c.burnerOn
                ? 'Fruity Ethyl Ethanoate Ester Formed'
                : 'Heat under reflux'
              : c.reagentAdded
                ? 'Yellow Iodoform (CHI₃) Crystals'
                : 'Add I₂ / NaOH',
      liquidColorHex:
        id === 'unsaturation-baeyer'
          ? isAlkene && c.reagentAdded
            ? '#F8FAFC'
            : '#9333EA'
          : id === 'aldehyde-tollens' && isAldehyde && c.reagentAdded
            ? '#CBD5E1'
            : '#FDE047',
      secondaryLiquidHex: '#F97316',
      flameColorHex: '#38BDF8',
      precipitateColorHex:
        id === 'lucas-iodoform' && c.reagentAdded
          ? '#FACC15'
          : id === 'aldehyde-tollens' && isAldehyde && c.reagentAdded
            ? '#E2E8F0'
            : null,
      gasBubbles: c.burnerOn ? 0.6 : 0,
      thermometerNorm: c.burnerOn ? 0.78 : 0.25,
      syringeFraction: 0.2,
      summaryLine: `Organic sample (${c.organicSample}) tested`,
    };
  }

  // Unit VIII
  if (id === 'thiosulphate-cross' || id === 'iodine-clock' || id === 'peroxide-catalyst' || id === 'marble-rate') {
    const k = computeKineticsState(params);
    return {
      primaryMetricLabel: id === 'thiosulphate-cross' ? 'Cross Time' : 'Reaction Rate',
      primaryMetricValue:
        id === 'thiosulphate-cross'
          ? `${k.timeToCrossSec} s (Rate ${k.relativeRate}x)`
          : `${k.gasYieldMl} mL gas · Rate ${k.relativeRate}x`,
      liquidColorHex:
        id === 'iodine-clock' && c.reagentAdded
          ? '#1E1B4B'
          : id === 'thiosulphate-cross' && c.reagentAdded
            ? '#FEF08A'
            : '#E0F2FE',
      secondaryLiquidHex: '#BAE6FD',
      flameColorHex: '#38BDF8',
      precipitateColorHex: id === 'thiosulphate-cross' && c.reagentAdded ? '#FDE047' : null,
      gasBubbles: id === 'peroxide-catalyst' || id === 'marble-rate' ? Math.min(1, k.relativeRate / 5) : 0,
      thermometerNorm: c.temperatureC / 95,
      syringeFraction: Math.min(1, k.gasYieldMl / 90),
      summaryLine: `Kinetics rate=${k.relativeRate}x at ${c.temperatureC}°C, [C]=${c.concentrationM}M, cat=${c.catalyst}`,
    };
  }

  // Unit IX
  if (id === 'chromate-dichromate' || id === 'fe-scn-equilibrium' || id === 'no2-n2o4-temp' || id === 'ester-equilibrium') {
    let eqCol = '#F59E0B';
    let label = 'Equilibrium Mixture';
    if (id === 'chromate-dichromate') {
      eqCol = c.eqAction === 'add-acid' ? '#F97316' : c.eqAction === 'add-base' ? '#FACC15' : '#FB923C';
      label = c.eqAction === 'add-acid' ? 'Cr₂O₇²⁻ (Orange, shifted right)' : c.eqAction === 'add-base' ? 'CrO₄²⁻ (Yellow, shifted left)' : 'CrO₄²⁻ / Cr₂O₇²⁻ Balance';
    } else if (id === 'fe-scn-equilibrium') {
      eqCol = c.eqAction === 'add-acid' ? '#991B1B' : c.eqAction === 'add-base' ? '#FEF08A' : '#DC2626';
      label = '[Fe(SCN)]²⁺ Blood-Red Equilibrium';
    } else if (id === 'no2-n2o4-temp') {
      eqCol = c.eqAction === 'heat' || c.temperatureC > 45 ? '#78350F' : '#FDE68A';
      label = c.temperatureC > 45 ? 'Dark Brown NO₂ (Endothermic Forward)' : 'Pale Yellow N₂O₄ (Cooled)';
    }

    return {
      primaryMetricLabel: 'Le Chatelier Shift',
      primaryMetricValue: label,
      liquidColorHex: eqCol,
      secondaryLiquidHex: '#FACC15',
      flameColorHex: '#38BDF8',
      precipitateColorHex: null,
      gasBubbles: 0.1,
      thermometerNorm: c.temperatureC / 95,
      syringeFraction: 0.3,
      summaryLine: label,
    };
  }

  // Unit X
  const ec = computeElectrochemState(params);
  return {
    primaryMetricLabel: id === 'daniell-cell' ? 'Cell EMF' : 'Current / Plated Cu',
    primaryMetricValue:
      id === 'daniell-cell'
        ? `E°cell = +${ec.cellVoltageV} V`
        : `${ec.cellVoltageV} V · ${ec.platedMassMg} mg Cu`,
    liquidColorHex: ec.leftSolutionColorHex,
    secondaryLiquidHex: ec.rightSolutionColorHex,
    flameColorHex: '#38BDF8',
    precipitateColorHex: id === 'iron-corrosion' && c.reagentAdded ? '#1D4ED8' : null,
    gasBubbles: ec.gasBubbleRate,
    thermometerNorm: 0.3,
    syringeFraction: 0.25,
    summaryLine: `Electrochemistry (${c.electrodePair}): ${ec.cellVoltageV}V, mass=${ec.platedMassMg}mg`,
  };
}
