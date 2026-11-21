import type { LocalizedText } from '../types/lab';

export const APP_VERSION = '2.4.0';
export const APP_MIN_ANDROID_VERSION = 10;
export const APP_MIN_ANDROID_API = 29;

export interface AppReleaseInfo {
  version: string;
  buildId: string;
  minAndroidVersion: number;
  minAndroidApi: number;
  updatedAt: string;
  releaseNotes: LocalizedText;
}

export function parseAndroidVersionFromUserAgent(ua: string): number | null {
  const match = ua.match(/Android\s+(\d+)(?:\.(\d+))?/i);
  if (!match) return null;
  const major = Number.parseInt(match[1], 10);
  return Number.isFinite(major) ? major : null;
}

export function isAndroidDevice(ua: string): boolean {
  return /Android/i.test(ua);
}

export function isAndroid10OrAboveSupported(ua: string): {
  isAndroid: boolean;
  majorVersion: number | null;
  supported: boolean;
} {
  const android = isAndroidDevice(ua);
  const major = parseAndroidVersionFromUserAgent(ua);
  if (!android) {
    return { isAndroid: false, majorVersion: null, supported: true };
  }
  if (major === null) {
    return { isAndroid: true, majorVersion: null, supported: true };
  }
  return {
    isAndroid: true,
    majorVersion: major,
    supported: major >= APP_MIN_ANDROID_VERSION,
  };
}

export function isNewerBuildAvailable(
  clientBuildId: string | null | undefined,
  serverBuildId: string | null | undefined
): boolean {
  if (!clientBuildId || !serverBuildId) return false;
  return clientBuildId.trim() !== serverBuildId.trim();
}
