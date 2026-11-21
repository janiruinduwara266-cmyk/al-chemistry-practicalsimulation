import { useCallback, useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import {
  APP_VERSION,
  isAndroid10OrAboveSupported,
  isNewerBuildAvailable,
  type AppReleaseInfo,
} from '../utils/appRelease';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [androidInfo, setAndroidInfo] = useState<{
    isAndroid: boolean;
    majorVersion: number | null;
    supported: boolean;
  }>({ isAndroid: false, majorVersion: null, supported: true });

  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [serverRelease, setServerRelease] = useState<AppReleaseInfo | null>(null);
  const [serverBuildChanged, setServerBuildChanged] = useState(false);

  const initialBuildIdRef = useRef<string | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const updateSwRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent || '';
    setIsIOS(/iphone|ipad|ipod/i.test(ua));
    setAndroidInfo(isAndroid10OrAboveSupported(ua));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const fetchServerVersion = useCallback(async (): Promise<AppReleaseInfo | null> => {
    try {
      const res = await fetch('/api/app/version', { cache: 'no-store' });
      if (!res.ok) return null;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      const data = (await res.json()) as AppReleaseInfo;
      setServerRelease(data);
      if (!initialBuildIdRef.current) {
        initialBuildIdRef.current = data.buildId;
      } else if (isNewerBuildAvailable(initialBuildIdRef.current, data.buildId)) {
        setServerBuildChanged(true);
      }
      setLastCheckedAt(new Date().toLocaleTimeString());
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    try {
      const updateSW = registerSW({
        immediate: true,
        onOfflineReady() {
          setOfflineReady(true);
        },
        onNeedRefresh() {
          setNeedRefresh(true);
        },
        onRegisteredSW(_swUrl, reg) {
          if (reg) {
            registrationRef.current = reg;
          }
        },
      });
      updateSwRef.current = updateSW;
    } catch {
      // Safe fallback when SW is blocked in strict browser modes
    }

    void fetchServerVersion();
  }, [fetchServerVersion]);

  const checkForUpdates = useCallback(async () => {
    setCheckingUpdate(true);
    try {
      if (registrationRef.current) {
        await registrationRef.current.update();
      }
      await fetchServerVersion();
    } finally {
      setCheckingUpdate(false);
    }
  }, [fetchServerVersion]);

  // Periodically check for updates when app regains focus on mobile/desktop
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdates();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [checkForUpdates]);

  const applyUpdate = useCallback(async () => {
    if (updateSwRef.current) {
      await updateSwRef.current(true);
    }
    if ('caches' in window) {
      try {
        const names = await caches.keys();
        await Promise.all(
          names.filter((n) => !n.includes('google-fonts')).map((n) => caches.delete(n))
        );
      } catch {
        // Ignore cache delete failure
      }
    }
    window.location.reload();
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  return {
    appVersion: APP_VERSION,
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    isAndroid: androidInfo.isAndroid,
    androidMajorVersion: androidInfo.majorVersion,
    isAndroidSupported: androidInfo.supported,
    offlineReady,
    needRefresh: needRefresh || serverBuildChanged,
    checkingUpdate,
    lastCheckedAt,
    serverRelease,
    install,
    checkForUpdates,
    applyUpdate,
  };
}
