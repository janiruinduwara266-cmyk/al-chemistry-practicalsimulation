import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AL_CHEMISTRY_TOPICS,
  EXPERIMENT_ORDER,
  EXPERIMENTS,
  UNIT_EXPERIMENTS,
  evaluateStepCompletion,
  getExperimentsForUnit,
  getUnitForExperiment,
} from './curriculum';
import type { LabSimulationParams } from '../types/lab';

const PARAMS: LabSimulationParams = {
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
};

test('Unit 1 curriculum covers 4 early experiments and excludes Hydrogen Spectrum experiment', () => {
  assert.deepEqual(EXPERIMENT_ORDER, [
    'cathode-tube',
    'thomson-canal',
    'millikan',
    'rutherford',
  ]);
  EXPERIMENT_ORDER.forEach((id) => {
    const exp = EXPERIMENTS[id];
    assert.equal(exp.unitRoman, 'I');
    assert.ok(!exp.shortTitle.en.toLowerCase().includes('spectrum'));
    assert.ok(exp.equipment.length >= 4);
    assert.ok(exp.steps.length >= 3);
  });
});

test('All 10 A/L Chemistry units are unlocked with 40 practical experiments total', () => {
  assert.equal(AL_CHEMISTRY_TOPICS.length, 10);
  assert.ok(AL_CHEMISTRY_TOPICS.every((t) => t.active));

  const allIds = Object.keys(EXPERIMENTS);
  assert.equal(allIds.length, 40);

  for (const topic of AL_CHEMISTRY_TOPICS) {
    const unitExps = getExperimentsForUnit(topic.roman);
    assert.equal(unitExps.length, 4, `Unit ${topic.roman} should have 4 stations`);
    for (const id of unitExps) {
      assert.equal(getUnitForExperiment(id), topic.roman);
      assert.equal(UNIT_EXPERIMENTS[topic.roman].includes(id), true);
      assert.ok(EXPERIMENTS[id].steps.length >= 3);
    }
  }
});

test('step completion validates Unit I and Units II-X chemistry practicals accurately', () => {
  const exp = EXPERIMENTS['cathode-tube'];
  const required = exp.equipment.map((e) => e.id);
  const partial = new Set(['hv-coil', 'crookes-tube']);

  assert.equal(
    evaluateStepCompletion(exp.steps[0], partial, required, PARAMS, false, false, false, false, false),
    false
  );
  assert.equal(
    evaluateStepCompletion(
      exp.steps[0],
      new Set(required),
      required,
      PARAMS,
      false,
      false,
      false,
      false,
      false
    ),
    true
  );

  // Step 2 requires hvEnabled and pressure <= 0.015
  assert.equal(
    evaluateStepCompletion(exp.steps[1], new Set(required), required, PARAMS, false, false, false, false, false),
    false
  );
  assert.equal(
    evaluateStepCompletion(
      exp.steps[1],
      new Set(required),
      required,
      { ...PARAMS, pressureMmHg: 0.008 },
      false,
      false,
      false,
      false,
      false
    ),
    true
  );

  // Unit III Titration endpoint validation
  const titr = EXPERIMENTS['acid-base-titration'];
  const titrReq = titr.equipment.map((e) => e.id);
  assert.equal(
    evaluateStepCompletion(
      titr.steps[1],
      new Set(titrReq),
      titrReq,
      { ...PARAMS, experimentId: 'acid-base-titration' },
      false,
      false,
      false,
      false,
      false
    ),
    false
  );
  assert.equal(
    evaluateStepCompletion(
      titr.steps[1],
      new Set(titrReq),
      titrReq,
      {
        ...PARAMS,
        experimentId: 'acid-base-titration',
        chem: { ...PARAMS.chem, buretteVolumeMl: 25.0 },
      },
      false,
      false,
      false,
      false,
      false
    ),
    true
  );

  // Every experiment must end with a pack-away step
  for (const id of Object.keys(EXPERIMENTS) as Array<keyof typeof EXPERIMENTS>) {
    const lastStep = EXPERIMENTS[id].steps[EXPERIMENTS[id].steps.length - 1];
    assert.equal(lastStep.validationType, 'pack-away', `${id} should end with pack-away`);
  }

  const packStep = exp.steps[exp.steps.length - 1];
  assert.equal(
    evaluateStepCompletion(packStep, new Set(required), required, PARAMS, false, false, false, false, false),
    false
  );
  assert.equal(
    evaluateStepCompletion(packStep, new Set(), required, PARAMS, false, false, false, false, false),
    true
  );
});
