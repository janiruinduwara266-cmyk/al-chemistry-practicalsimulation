import { RefreshCw, WifiOff } from 'lucide-react';
import { usePWAContext } from '../contexts/PWAContext';
import type { Language } from '../types/lab';

interface OfflineIndicatorProps {
  lang: Language;
}

export function OfflineIndicator({ lang }: OfflineIndicatorProps) {
  const { isOnline, needRefresh, applyUpdate } = usePWAContext();

  return (
    <>
      {!isOnline && (
        <div
          role="status"
          className="fixed bottom-12 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 border border-amber-300/60 px-3 py-1.5 text-xs font-bold text-white shadow-xl"
        >
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>
            {lang === 'si'
              ? 'Offline ප්‍රකාරය — සුරැකි 3D පරීක්ෂණ භාවිතා වේ'
              : 'Offline Mode — Cached 3D labs active'}
          </span>
        </div>
      )}

      {needRefresh && (
        <div
          role="status"
          className="fixed bottom-12 right-4 z-50 flex items-center gap-2.5 rounded-xl bg-emerald-700/95 border border-emerald-300/70 px-3.5 py-2 text-xs font-bold text-white shadow-2xl"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>
            {lang === 'si' ? 'නව App Update එකක් ලැබී ඇත!' : 'New App Update Available!'}
          </span>
          <button
            type="button"
            onClick={() => void applyUpdate()}
            className="px-2.5 py-1 rounded-lg bg-white text-emerald-900 font-extrabold hover:bg-emerald-50 cursor-pointer"
          >
            {lang === 'si' ? 'Update' : 'Reload'}
          </button>
        </div>
      )}
    </>
  );
}
