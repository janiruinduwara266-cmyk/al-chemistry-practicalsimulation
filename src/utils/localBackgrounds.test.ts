import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ASSET_PATHS } from '../data/curriculum';
import { BACKGROUND_ASSET_SPECS } from './localBackgrounds';

test('ASSET_PATHS point to /images/* and exist as non-empty files inside public/images', () => {
  const keys = Object.keys(ASSET_PATHS) as Array<keyof typeof ASSET_PATHS>;
  assert.equal(keys.length, 4);

  for (const key of keys) {
    const webPath = ASSET_PATHS[key];
    assert.ok(
      webPath.startsWith('/images/'),
      `${key} must be served from /images/ for Vite production builds, got ${webPath}`
    );
    const diskPath = path.join(process.cwd(), 'public', webPath.replace(/^\//, ''));
    assert.ok(fs.existsSync(diskPath), `Missing public background image file: ${diskPath}`);
    const stat = fs.statSync(diskPath);
    assert.ok(stat.size > 10_000, `Expected real JPG image size for ${diskPath}, got ${stat.size}`);
  }
});

test('BACKGROUND_ASSET_SPECS cover every built-in ASSET_PATHS key without Cloud dependencies', () => {
  const specKeys = new Set(BACKGROUND_ASSET_SPECS.map((s) => s.key));
  for (const key of Object.keys(ASSET_PATHS)) {
    assert.ok(specKeys.has(key as keyof typeof ASSET_PATHS), `Missing spec for ${key}`);
  }
  for (const spec of BACKGROUND_ASSET_SPECS) {
    assert.ok(spec.fileName.endsWith('.jpg'));
    assert.ok(spec.label.si.length > 0 && spec.label.en.length > 0);
    assert.equal(spec.localUrl, ASSET_PATHS[spec.key]);
  }
});
