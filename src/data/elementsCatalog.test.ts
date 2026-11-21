import assert from 'node:assert/strict';
import test from 'node:test';
import { ALL_ELEMENTS, getElementByZ } from './elementsCatalog.ts';

test('Periodic table catalog contains all 118 elements with unique atomic numbers 1..118', () => {
  assert.equal(ALL_ELEMENTS.length, 118);
  const seenZ = new Set<number>();
  const seenSym = new Set<string>();

  for (let z = 1; z <= 118; z++) {
    const el = ALL_ELEMENTS[z - 1];
    assert.equal(el.z, z, `Element index ${z - 1} must have z=${z}`);
    assert.ok(!seenZ.has(el.z));
    assert.ok(!seenSym.has(el.symbol));
    seenZ.add(el.z);
    seenSym.add(el.symbol);

    // Verify shell sum equals atomic number Z
    const shellSum = el.shells.reduce((acc, v) => acc + v, 0);
    assert.equal(shellSum, z, `${el.symbol} (Z=${z}) shell sum ${shellSum} must equal ${z}`);

    // Verify non-empty bilingual descriptions & electron configurations
    assert.ok(el.name.si.length > 0 && el.name.en.length > 0);
    assert.ok(el.description.si.length > 10 && el.description.en.length > 10);
    assert.ok(el.fullElectronConfig.includes('1s'));
    assert.ok(el.shortElectronConfig.length > 0);
  }
});

test('Aufbau exception elements Cr, Cu, Pd, Ag, Pt, Au, Gd, Lr match official A/L configs', () => {
  const cr = getElementByZ(24);
  assert.equal(cr.isExceptionConfig, true);
  assert.equal(cr.shortElectronConfig, '[Ar] 3d⁵ 4s¹');
  assert.deepEqual(cr.shells, [2, 8, 13, 1]);

  const cu = getElementByZ(29);
  assert.equal(cu.isExceptionConfig, true);
  assert.equal(cu.shortElectronConfig, '[Ar] 3d¹⁰ 4s¹');
  assert.deepEqual(cu.shells, [2, 8, 18, 1]);

  const pd = getElementByZ(46);
  assert.equal(pd.shortElectronConfig, '[Kr] 4d¹⁰');
  assert.deepEqual(pd.shells, [2, 8, 18, 18]);

  const au = getElementByZ(79);
  assert.equal(au.shortElectronConfig, '[Xe] 4f¹⁴ 5d¹⁰ 6s¹');

  const og = getElementByZ(118);
  assert.equal(og.symbol, 'Og');
  assert.deepEqual(og.shells, [2, 8, 18, 32, 32, 18, 8]);
});
