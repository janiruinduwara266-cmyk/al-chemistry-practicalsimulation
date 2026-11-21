import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ASSET_PATHS, type BackgroundAssetKey } from '../data/curriculum';
import {
  clearAllLocalCustomBackgrounds,
  deleteLocalCustomBackground,
  loadLocalCustomBackgroundUrls,
  saveLocalCustomBackground,
} from '../utils/localBackgrounds';

interface BackgroundAssetsContextValue {
  assets: Record<BackgroundAssetKey, string>;
  customKeys: Set<BackgroundAssetKey>;
  bgModalOpen: boolean;
  openBgModal: () => void;
  closeBgModal: () => void;
  setCustomBackground: (key: BackgroundAssetKey, file: File) => Promise<void>;
  resetOneBackground: (key: BackgroundAssetKey) => Promise<void>;
  resetAllBackgrounds: () => Promise<void>;
}

const BackgroundAssetsContext = createContext<BackgroundAssetsContextValue | null>(null);

export function BackgroundAssetsProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Record<BackgroundAssetKey, string>>(() => ({
    ...ASSET_PATHS,
  }));
  const [customKeys, setCustomKeys] = useState<Set<BackgroundAssetKey>>(() => new Set());
  const [bgModalOpen, setBgModalOpen] = useState(false);

  const objectUrlsRef = useRef<string[]>([]);

  const revokeOldObjectUrls = useCallback(() => {
    for (const url of objectUrlsRef.current) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignore revoke errors
      }
    }
    objectUrlsRef.current = [];
  }, []);

  const reloadLocalAssets = useCallback(async () => {
    const customUrls = await loadLocalCustomBackgroundUrls();
    revokeOldObjectUrls();
    const nextList: string[] = [];
    const nextCustom = new Set<BackgroundAssetKey>();
    for (const [k, value] of Object.entries(customUrls)) {
      if (value && value.startsWith('blob:')) {
        nextList.push(value);
        nextCustom.add(k as BackgroundAssetKey);
      }
    }
    objectUrlsRef.current = nextList;
    setCustomKeys(nextCustom);
    setAssets({
      welcomeBackdrop: customUrls.welcomeBackdrop || ASSET_PATHS.welcomeBackdrop,
      islandMap: customUrls.islandMap || ASSET_PATHS.islandMap,
      labRoomBackdrop: customUrls.labRoomBackdrop || ASSET_PATHS.labRoomBackdrop,
      assistantAvatar: customUrls.assistantAvatar || ASSET_PATHS.assistantAvatar,
    });
  }, [revokeOldObjectUrls]);

  useEffect(() => {
    void reloadLocalAssets();
    return () => {
      revokeOldObjectUrls();
    };
  }, [reloadLocalAssets, revokeOldObjectUrls]);

  const setCustomBackground = useCallback(
    async (key: BackgroundAssetKey, file: File) => {
      await saveLocalCustomBackground(key, file);
      await reloadLocalAssets();
    },
    [reloadLocalAssets]
  );

  const resetOneBackground = useCallback(
    async (key: BackgroundAssetKey) => {
      await deleteLocalCustomBackground(key);
      await reloadLocalAssets();
    },
    [reloadLocalAssets]
  );

  const resetAllBackgrounds = useCallback(async () => {
    await clearAllLocalCustomBackgrounds();
    await reloadLocalAssets();
  }, [reloadLocalAssets]);

  return (
    <BackgroundAssetsContext.Provider
      value={{
        assets,
        customKeys,
        bgModalOpen,
        openBgModal: () => setBgModalOpen(true),
        closeBgModal: () => setBgModalOpen(false),
        setCustomBackground,
        resetOneBackground,
        resetAllBackgrounds,
      }}
    >
      {children}
    </BackgroundAssetsContext.Provider>
  );
}

export function useBackgroundAssets() {
  const ctx = useContext(BackgroundAssetsContext);
  if (!ctx) {
    return {
      assets: ASSET_PATHS,
      customKeys: new Set<BackgroundAssetKey>(),
      bgModalOpen: false,
      openBgModal: () => {},
      closeBgModal: () => {},
      setCustomBackground: async () => {},
      resetOneBackground: async () => {},
      resetAllBackgrounds: async () => {},
    };
  }
  return ctx;
}
