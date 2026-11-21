import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SYLLABUS_REACTIONS,
  evaluateCustomMixture,
} from './reactionsCatalog.ts';

test('Syllabus reactions catalog covers 100+ authentic A/L reactions across all 4 categories', () => {
  assert.ok(SYLLABUS_REACTIONS.length >= 100, `Expected >= 100 reactions, got ${SYLLABUS_REACTIONS.length}`);
  const ids = SYLLABUS_REACTIONS.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, 'All reaction IDs must be unique');
  const categories = new Set(SYLLABUS_REACTIONS.map((r) => r.category));
  assert.deepEqual(
    categories,
    new Set(['inorganic', 'organic', 'physical-redox', 'electro-metals'])
  );
  assert.ok(SYLLABUS_REACTIONS.some((r) => r.id === 'brown-ring'));
  assert.ok(SYLLABUS_REACTIONS.some((r) => r.id === 'aldehyde-tollens'));
  assert.ok(SYLLABUS_REACTIONS.some((r) => r.id === 'pb-ki-golden'));
  assert.ok(SYLLABUS_REACTIONS.some((r) => r.id === 'org-phenol-br2'));
  assert.ok(SYLLABUS_REACTIONS.some((r) => r.id === 'elec-daniell-cell'));
});

test('evaluateCustomMixture distinguishes excess NH3, heating requirements, and non-reactive pairs', () => {
  const cuLimited = evaluateCustomMixture('cuso4', 'nh3-aq', 'room');
  assert.equal(cuLimited.matched, true);
  assert.equal(cuLimited.reaction?.effect, 'precipitate');

  const cuExcess = evaluateCustomMixture('cuso4', 'nh3-aq', 'excess');
  assert.equal(cuExcess.matched, true);
  assert.equal(cuExcess.reaction?.finalColorHex, '#1e3a8a');

  const tollensWarm = evaluateCustomMixture('tollens', 'aldehyde', 'warm');
  assert.equal(tollensWarm.matched, true);
  assert.equal(tollensWarm.reaction?.effect, 'silver-mirror');

  const noRxn = evaluateCustomMixture('agno3', 'hcl-dil', 'room');
  // AgNO3 + HCl actually precipitates AgCl in reality; let's test phenol + nacl which does not react
  const inert = evaluateCustomMixture('phenol', 'nacl', 'room');
  assert.equal(inert.matched, false);
  assert.ok(inert.noReactionReason);
  void noRxn;
});
