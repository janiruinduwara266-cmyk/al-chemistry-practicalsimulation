import { ASSET_PATHS, type BackgroundAssetKey } from '../data/curriculum';
import type { LocalizedText } from '../types/lab';

export interface BackgroundAssetSpec {
  key: BackgroundAssetKey;
  fileName: string;
  localUrl: string;
  label: LocalizedText;
}

export const BACKGROUND_ASSET_SPECS: BackgroundAssetSpec[] = [
  {
    key: 'welcomeBackdrop',
    fileName: 'welcome_chem_island.jpg',
    localUrl: ASSET_PATHS.welcomeBackdrop,
    label: {
      si: 'පිළිගැනීමේ සහ Sign-In පසුබිම් රූපය',
      en: 'Welcome & Sign-In Backdrop',
    },
  },
  {
    key: 'islandMap',
    fileName: 'chem_island_map.jpg',
    localUrl: ASSET_PATHS.islandMap,
    label: {
      si: 'විද්‍යාගාර සිතියම් පසුබිම',
      en: 'Adventure Lab Map Backdrop',
    },
  },
  {
    key: 'labRoomBackdrop',
    fileName: 'lab_room_backdrop.jpg',
    localUrl: ASSET_PATHS.labRoomBackdrop,
    label: {
      si: 'රසායනාගාර කාමර පසුබිම',
      en: '3D Chemistry Lab Room Backdrop',
    },
  },
  {
    key: 'assistantAvatar',
    fileName: 'lab_assistant_avatar.jpg',
    localUrl: ASSET_PATHS.assistantAvatar,
    label: {
      si: 'AI ගුරුවරයාගේ රූපය',
      en: 'AI Instructor Avatar',
    },
  },
];

const DB_NAME = 'chemlab_lk_free_backgrounds_v1';
const STORE_NAME = 'custom_assets';

function openBgDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Failed to open local background store'));
  });
}

export async function saveLocalCustomBackground(
  key: BackgroundAssetKey,
  blob: Blob
): Promise<void> {
  const db = await openBgDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(blob, key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error('Failed to save background locally'));
    };
  });
}

export async function deleteLocalCustomBackground(key: BackgroundAssetKey): Promise<void> {
  const db = await openBgDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error('Failed to delete local background'));
    };
  });
}

export async function clearAllLocalCustomBackgrounds(): Promise<void> {
  const db = await openBgDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error('Failed to clear local backgrounds'));
    };
  });
}

export async function loadLocalCustomBackgroundUrls(): Promise<
  Partial<Record<BackgroundAssetKey, string>>
> {
  try {
    const db = await openBgDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const urls: Partial<Record<BackgroundAssetKey, string>> = {};
      let remaining = BACKGROUND_ASSET_SPECS.length;

      for (const spec of BACKGROUND_ASSET_SPECS) {
        const req = store.get(spec.key);
        req.onsuccess = () => {
          const val = req.result;
          if (val instanceof Blob) {
            urls[spec.key] = URL.createObjectURL(val);
          }
          remaining -= 1;
          if (remaining === 0) {
            db.close();
            resolve(urls);
          }
        };
        req.onerror = () => {
          remaining -= 1;
          if (remaining === 0) {
            db.close();
            resolve(urls);
          }
        };
      }
    });
  } catch {
    return {};
  }
}
