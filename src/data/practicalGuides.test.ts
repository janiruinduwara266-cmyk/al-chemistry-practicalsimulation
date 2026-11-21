import assert from 'node:assert/strict';
import test from 'node:test';
import { EXPERIMENTS } from './curriculum.ts';
import { PRACTICAL_GUIDES, getPracticalGuide } from './practicalGuides.ts';
import type { ExperimentId } from '../types/lab.ts';

test('PRACTICAL_GUIDES covers all 40 syllabus experiments with bilingual procedure, observations, and conclusions', () => {
  const allIds = Object.keys(EXPERIMENTS) as ExperimentId[];
  assert.equal(allIds.length, 40);

  for (const id of allIds) {
    const guide = getPracticalGuide(id);
    assert.ok(guide, `Missing guide for ${id}`);
    assert.ok(guide.procedure.length >= 2, `Expected >= 2 procedure steps for ${id}`);
    assert.ok(guide.observations.length >= 1, `Expected >= 1 observation for ${id}`);
    assert.ok(guide.conclusions.length >= 1, `Expected >= 1 conclusion for ${id}`);

    for (const item of [...guide.procedure, ...guide.observations, ...guide.conclusions]) {
      assert.ok(item.si.trim().length > 3, `Missing Sinhala text in ${id}`);
      assert.ok(item.en.trim().length > 3, `Missing English text in ${id}`);
    }
  }
  assert.equal(Object.keys(PRACTICAL_GUIDES).length, 40);
});
