import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  APP_MIN_ANDROID_API,
  APP_MIN_ANDROID_VERSION,
  APP_VERSION,
  isAndroid10OrAboveSupported,
  isNewerBuildAvailable,
  parseAndroidVersionFromUserAgent,
} from './appRelease';

test('Android 10+ minimum target and User-Agent detection work accurately', () => {
  assert.equal(APP_MIN_ANDROID_VERSION, 10);
  assert.equal(APP_MIN_ANDROID_API, 29);
  assert.ok(APP_VERSION.length > 0);

  assert.equal(
    parseAndroidVersionFromUserAgent(
      'Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile'
    ),
    10
  );
  assert.equal(
    parseAndroidVersionFromUserAgent(
      'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36'
    ),
    14
  );
  assert.equal(
    parseAndroidVersionFromUserAgent('Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0'),
    null
  );

  const a10 = isAndroid10OrAboveSupported('Mozilla/5.0 (Linux; Android 10; SM-A505F)');
  assert.equal(a10.isAndroid, true);
  assert.equal(a10.majorVersion, 10);
  assert.equal(a10.supported, true);

  const a14 = isAndroid10OrAboveSupported('Mozilla/5.0 (Linux; Android 14; Pixel 8)');
  assert.equal(a14.supported, true);

  const a9 = isAndroid10OrAboveSupported('Mozilla/5.0 (Linux; Android 9; Redmi Note 7)');
  assert.equal(a9.isAndroid, true);
  assert.equal(a9.majorVersion, 9);
  assert.equal(a9.supported, false);
});

test('isNewerBuildAvailable detects live server build changes', () => {
  assert.equal(isNewerBuildAvailable('2.4.0-202611200800', '2.4.0-202611200800'), false);
  assert.equal(isNewerBuildAvailable('2.4.0-202611200800', '2.4.0-202611200915'), true);
  assert.equal(isNewerBuildAvailable(null, '2.4.0-202611200915'), false);
});

test('PWA and Android WebAPK icon assets exist in public/', () => {
  const requiredAssets = [
    'icon.svg',
    'icon-maskable.svg',
    'apple-touch-icon.png',
    'pwa-192x192.png',
    'pwa-512x512.png',
    'pwa-maskable-512x512.png',
  ];
  for (const fileName of requiredAssets) {
    const p = path.join(process.cwd(), 'public', fileName);
    assert.ok(fs.existsSync(p), `Missing PWA icon asset: ${p}`);
    assert.ok(fs.statSync(p).size > 1000, `Asset looks empty: ${p}`);
  }
});
