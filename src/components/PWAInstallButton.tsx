import { Download, RefreshCw, Smartphone } from 'lucide-react';
import { usePWAContext } from '../contexts/PWAContext';
import type { Language } from '../types/lab';

interface PWAInstallButtonProps {
  lang: Language;
  compact?: boolean;
}

export function PWAInstallButton({ lang, compact = false }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, needRefresh, openAppModal } = usePWAContext();

  if (isInstalled && !needRefresh) {
    return null;
  }

  if (needRefresh) {
    return (
      <button
        type="button"
        onClick={openAppModal}
        data-testid="pwa-update-btn"
        className="px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-300/60 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
      >
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span>{lang === 'si' ? 'Update තිබේ!' : 'Update Ready'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openAppModal}
      data-testid="pwa-install-btn"
      className="px-3 py-1.5 rounded-xl liquid-glass-emerald text-[#DCFCE7] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
    >
      {isInstallable ? (
        <Download className="w-3.5 h-3.5 text-[#4ADE80]" />
      ) : (
        <Smartphone className="w-3.5 h-3.5 text-[#4ADE80]" />
      )}
      <span>
        {compact
          ? lang === 'si'
            ? 'Android App'
            : 'Android App'
          : lang === 'si'
            ? 'Android App (10+)'
            : 'Install Android App'}
      </span>
    </button>
  );
}
