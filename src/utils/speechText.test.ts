import test from 'node:test';
import assert from 'node:assert/strict';
import { FIXED_MALE_VOICE, FIXED_VOICE_LABEL, prepareTextForSpeech } from './speechText.ts';

test('FIXED_MALE_VOICE locks narration exclusively to Puck male voice', () => {
  assert.equal(FIXED_MALE_VOICE, 'Puck');
  assert.ok(FIXED_VOICE_LABEL.si.includes('Puck'));
  assert.ok(FIXED_VOICE_LABEL.en.includes('Puck'));
});

test('prepareTextForSpeech normalizes Sinhala chemistry text, formulas, arrows, and units cleanly', () => {
  const siInput = 'ChemLab LK A/L 3D: H₂SO₄ + Cu²⁺ → CuSO₄↓ · ΔH = -285 kJ mol⁻¹ (25 °C)';
  const out = prepareTextForSpeech(siInput, 'si');

  assert.ok(out.includes('කෙම් ලැබ් එල් කේ'));
  assert.ok(out.includes('උසස් පෙළ'));
  assert.ok(out.includes('ත්‍රිමාණ'));
  assert.ok(out.includes('බවට පත්වේ'));
  assert.ok(out.includes('අවක්ෂේපය සෑදේ'));
  assert.ok(out.includes('එන්තැල්පි වෙනස'));
  assert.ok(out.includes('සෙල්සියස් අංශක'));
  assert.ok(out.includes('කිලෝජූල් මවුලයට'));
  assert.ok(!/[₂₄²⁺↓→]/.test(out));
});

test('prepareTextForSpeech preserves Sinhala ZWJ joiners and handles English chemistry symbols', () => {
  const enOut = prepareTextForSpeech('N₂ + 3H₂ ⇌ 2NH₃ (ΔH < 0 at 450 °C)', 'en');
  assert.ok(enOut.includes('in equilibrium with'));
  assert.ok(enOut.includes('enthalpy change'));
  assert.ok(enOut.includes('degrees Celsius'));

  const zwjSample = 'ශ්‍රී ලංකා';
  assert.equal(prepareTextForSpeech(zwjSample, 'si'), zwjSample);
});
