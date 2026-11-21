import assert from 'node:assert/strict';
import test from 'node:test';
import { EXPERIMENTS } from '../data/curriculum';
import type { LabSimulationParams } from '../types/lab';
import {
  diagnoseInvalidControlAction,
  diagnoseStepMistake,
  parseVoiceLabCommand,
} from './practicalValidation';

function makeParams(overrides: Partial<LabSimulationParams> = {}): LabSimulationParams {
  return {
    experimentId: 'cathode-tube',
    hvEnabled: true,
    voltageKv: 12,
    pressureMmHg: 760,
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
    ...overrides,
  };
}

test('diagnoseStepMistake detects missing apparatus during assembly', () => {
  const exp = EXPERIMENTS['cathode-tube'];
  const step = exp.steps[0];
  const req = exp.equipment.map((e) => e.id);
  const res = diagnoseStepMistake({
    step,
    placedIds: new Set([req[0]]),
    requiredIds: req,
    params: makeParams(),
    isBalancedThomson: false,
    isSuspendedMillikan: false,
    quizSelected: null,
    visitedGasChange: false,
    visitedMetalChange: false,
    chemVariableAdjusted: false,
  });
  assert.ok(res?.isWrong);
  assert.equal(res?.code, 'INCOMPLETE_ASSEMBLY');
});

test('diagnoseStepMistake detects wrong quiz option immediately', () => {
  const exp = EXPERIMENTS['cathode-tube'];
  const magnetStep = exp.steps.find((s) => s.validationType === 'magnet-deflection')!;
  const wrongIdx = magnetStep.quizQuestion!.correctIndex === 0 ? 1 : 0;
  const res = diagnoseStepMistake({
    step: magnetStep,
    placedIds: new Set(exp.equipment.map((e) => e.id)),
    requiredIds: exp.equipment.map((e) => e.id),
    params: makeParams({ hvEnabled: true, magnetActive: true }),
    isBalancedThomson: false,
    isSuspendedMillikan: false,
    quizSelected: wrongIdx,
    visitedGasChange: false,
    visitedMetalChange: false,
    chemVariableAdjusted: false,
  });
  assert.ok(res?.isWrong);
  assert.equal(res?.code, 'WRONG_QUIZ_OPTION');
});

test('diagnoseStepMistake detects titration overshoot and under-titration', () => {
  const exp = EXPERIMENTS['acid-base-titration'];
  const titrateStep = exp.steps.find((s) => s.validationType === 'chem-titrate-endpoint')!;
  const req = exp.equipment.map((e) => e.id);

  const overshoot = diagnoseStepMistake({
    step: titrateStep,
    placedIds: new Set(req),
    requiredIds: req,
    params: makeParams({
      experimentId: 'acid-base-titration',
      chem: { ...makeParams().chem, concentrationM: 1.0, buretteVolumeMl: 31.0 },
    }),
    isBalancedThomson: false,
    isSuspendedMillikan: false,
    quizSelected: null,
    visitedGasChange: false,
    visitedMetalChange: false,
    chemVariableAdjusted: true,
  });
  assert.equal(overshoot?.code, 'TITRATION_OVERSHOOT');

  const exact = diagnoseStepMistake({
    step: titrateStep,
    placedIds: new Set(req),
    requiredIds: req,
    params: makeParams({
      experimentId: 'acid-base-titration',
      chem: { ...makeParams().chem, concentrationM: 1.0, buretteVolumeMl: 25.0 },
    }),
    isBalancedThomson: false,
    isSuspendedMillikan: false,
    quizSelected: null,
    visitedGasChange: false,
    visitedMetalChange: false,
    chemVariableAdjusted: true,
  });
  assert.equal(exact, null);
});

test('diagnoseInvalidControlAction warns when activating controls before assembling', () => {
  const res = diagnoseInvalidControlAction('HV සැපයුම', 'HV Supply', false, makeParams());
  assert.equal(res?.code, 'ACTION_BEFORE_ASSEMBLY');
});

test('parseVoiceLabCommand handles Sinhala, Singlish, and English voice commands', () => {
  assert.deepEqual(parseVoiceLabCommand('මේ පියවර කරන විදිය කියන්න'), { type: 'read-howto' });
  assert.deepEqual(parseVoiceLabCommand('ඊළඟ පියවර'), { type: 'next-step' });
  assert.deepEqual(parseVoiceLabCommand('place all equipment'), { type: 'place-all' });
  assert.deepEqual(parseVoiceLabCommand('hv on'), { type: 'hv-toggle', enabled: true });
  assert.deepEqual(parseVoiceLabCommand('darkroom'), { type: 'darkroom-toggle', enabled: true });
  assert.deepEqual(parseVoiceLabCommand('මෙහි පීඩනය කුමක්ද?'), {
    type: 'ask-ai',
    query: 'මෙහි පීඩනය කුමක්ද?',
  });
});
