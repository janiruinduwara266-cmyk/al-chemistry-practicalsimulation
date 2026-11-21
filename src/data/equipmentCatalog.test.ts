import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EQUIPMENT_CATALOG,
  EQUIPMENT_CATEGORIES,
  evaluateInstrumentTelemetry,
} from './equipmentCatalog';

test('Equipment Catalog covers 20 A/L Chemistry instruments including 7 electric devices', () => {
  assert.equal(EQUIPMENT_CATALOG.length, 20);
  assert.equal(EQUIPMENT_CATEGORIES.length, 5);

  const electric = EQUIPMENT_CATALOG.filter((item) => item.category === 'electric');
  assert.equal(electric.length, 7);

  const ids = new Set(EQUIPMENT_CATALOG.map((item) => item.id));
  assert.equal(ids.size, 20);

  for (const item of EQUIPMENT_CATALOG) {
    assert.ok(item.name.si.length > 0 && item.name.en.length > 0);
    assert.ok(item.whatItDoes.si.length > 0 && item.howItWorks.en.length > 0);
    assert.ok(item.voiceSummary.si.length > 0 && item.voiceSummary.en.length > 0);
    assert.ok(item.unitBadges.length >= 1);
  }
});

test('evaluateInstrumentTelemetry produces accurate scientific readings', () => {
  const phHcl = evaluateInstrumentTelemetry('digital-ph-meter', {
    active: true,
    sliderValue: 25,
    sampleId: 'hcl',
  });
  assert.equal(phHcl.primaryReading, 'pH 1.00');

  const daniell = evaluateInstrumentTelemetry('daniell-galvanic-cell', {
    active: true,
    sliderValue: 1.0,
    sampleId: 'zn-cu',
  });
  assert.equal(daniell.primaryReading, '+1.10 V (EMF)');

  const balance = evaluateInstrumentTelemetry('analytical-balance', {
    active: true,
    sliderValue: 1,
    sampleId: 'na2co3',
  });
  assert.equal(balance.primaryReading, '2.6500 g');
});
