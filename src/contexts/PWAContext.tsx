import { createContext, useContext, useState, type ReactNode } from 'react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

type PWAContextValue = ReturnType<typeof usePWAInstall> & {
  isOnline: boolean;
  appModalOpen: boolean;
  openAppModal: () => void;
  closeAppModal: () => void;
};

const PWAContext = createContext<PWAContextValue | null>(null);

export function PWAProvider({ children }: { children: ReactNode }) {
  const pwa = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [appModalOpen, setAppModalOpen] = useState(false);

  return (
    <PWAContext.Provider
      value={{
        ...pwa,
        isOnline,
        appModalOpen,
        openAppModal: () => setAppModalOpen(true),
        closeAppModal: () => setAppModalOpen(false),
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWAContext() {
  const ctx = useContext(PWAContext);
  if (!ctx) {
    throw new Error('usePWAContext must be used inside PWAProvider');
  }
  return ctx;
}
