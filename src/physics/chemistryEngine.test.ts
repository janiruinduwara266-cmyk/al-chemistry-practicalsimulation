import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCalorimetryState,
  computeElectrochemState,
  computeGasLawState,
  computeKineticsState,
  computeTitrationState,
  evaluateFlameTest,
  getVseprSpec,
} from './chemistryEngine';
import type { LabSimulationParams } from '../types/lab';

function makeChemParams(
  experimentId: LabSimulationParams['experimentId'],
  patch: Partial<LabSimulationParams['chem']> = {}
): LabSimulationParams {
  return {
    experimentId,
    hvEnabled: true,
    voltageKv: 12,
    pressureMmHg: 0.005,
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
    dropletRadiusUm: 1,
    millikanVoltageV: 0,
    xrayActive: false,
    sprayPulse: 0,
    alphaBeamEnabled: false,
    detectorAngleDeg: 0,
    foilMaterial: 'gold',
    foilThicknessNm: 400,
    darkRoom: false,
    chem: {
      burnerOn: false,
      reagentAdded: true,
      stirringOn: true,
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
      appliedVoltageV: 6,
      ...patch,
    },
  };
}

test('Flame test returns authentic golden yellow wavelength for Na+', () => {
  const res = evaluateFlameTest('Na+');
  assert.equal(res.wavelengthNm, 589);
  assert.equal(res.label, 'Golden Yellow');
});

test('VSEPR geometry yields 107 deg for NH3 with 1 lone pair', () => {
  const nh3 = getVseprSpec('NH3');
  assert.equal(nh3.bondAngleDeg, 107);
  assert.equal(nh3.lonePairs, 1);
  assert.equal(nh3.bondVectors.length, 3);
});

test('Acid-base titration reaches stoichiometric endpoint at 25.0 mL', () => {
  const before = computeTitrationState(makeChemParams('acid-base-titration', { buretteVolumeMl: 10 }));
  const atEq = computeTitrationState(makeChemParams('acid-base-titration', { buretteVolumeMl: 25 }));
  assert.equal(before.atEndpoint, false);
  assert.equal(atEq.atEndpoint, true);
  assert.equal(atEq.pH, 7);
});

test('Boyle law halves volume when pressure doubles', () => {
  const p100 = computeGasLawState(makeChemParams('boyles-law', { pressureKpa: 100 }));
  const p200 = computeGasLawState(makeChemParams('boyles-law', { pressureKpa: 200 }));
  assert.equal(p100.volumeMl, 50);
  assert.equal(p200.volumeMl, 25);
});

test('Kinetics doubles reaction rate per 10 C temperature increase', () => {
  const t25 = computeKineticsState(makeChemParams('thiosulphate-cross', { temperatureC: 25 }));
  const t35 = computeKineticsState(makeChemParams('thiosulphate-cross', { temperatureC: 35 }));
  assert.equal(t35.relativeRate, t25.relativeRate * 2);
});

test('Calorimetry detects endothermic cooling for NH4NO3 and exothermic heat for neutralization', () => {
  const endo = computeCalorimetryState(makeChemParams('enthalpy-solution'));
  const exo = computeCalorimetryState(makeChemParams('calorimetry-neutralization'));
  assert.ok(endo.deltaTC < 0);
  assert.ok(exo.deltaTC > 0);
});

test('Daniell cell produces standard ~1.10 V EMF', () => {
  const cell = computeElectrochemState(makeChemParams('daniell-cell', { electrodePair: 'Zn-Cu' }));
  assert.equal(cell.cellVoltageV, 1.1);
});
