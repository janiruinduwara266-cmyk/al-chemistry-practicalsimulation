import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  Loader2,
  RefreshCw,
  Share,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wifi,
  X,
} from 'lucide-react';
import { usePWAContext } from '../contexts/PWAContext';
import type { Language } from '../types/lab';

interface AndroidAppModalProps {
  lang: Language;
}

export function AndroidAppModal({ lang }: AndroidAppModalProps) {
  const {
    appVersion,
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    androidMajorVersion,
    isAndroidSupported,
    offlineReady,
    needRefresh,
    checkingUpdate,
    lastCheckedAt,
    serverRelease,
    appModalOpen,
    closeAppModal,
    install,
    checkForUpdates,
    applyUpdate,
  } = usePWAContext();

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [updateNotice, setUpdateNotice] = useState<string | null>(null);

  if (!appModalOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedUrl(true);
      window.setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleCheckUpdates = async () => {
    setUpdateNotice(null);
    await checkForUpdates();
    setUpdateNotice(
      needRefresh
        ? lang === 'si'
          ? 'නව යාවත්කාලීනයක් සූදානම්! පහත බොත්තම ඔබා දැන්ම යොදන්න.'
          : 'New update is ready! Tap "Install Update Now" below.'
        : lang === 'si'
          ? `ඔබගේ ඇප් එක අලුත්ම අනුවාදයේ (v${serverRelease?.version || appVersion}) පවතී.`
          : `You are running the latest release (v${serverRelease?.version || appVersion}).`
    );
  };

  const handleInstallClick = async () => {
    await install();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'si' ? 'Android 10+ App සහ Updates' : 'Android 10+ App & Updates'}
    >
      <div className="relative w-full max-w-xl wood-panel rounded-3xl p-5 sm:p-6 text-white max-h-[90vh] overflow-y-auto lab-scroll space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/15 pb-3">
          <div className="flex items-center gap-3">
            <img
              src="/pwa-192x192.png"
              alt="ChemLab LK App Icon"
              className="w-12 h-12 rounded-2xl border border-[#F5C56B]/60 shadow-lg shrink-0"
            />
            <div>
              <h2 className="font-display text-base sm:text-lg font-extrabold text-[#FFE5AD]">
                {lang === 'si'
                  ? 'ChemLab LK — Android 10+ App සහ සජීවී Updates'
                  : 'ChemLab LK — Android 10+ App & Live Updates'}
              </h2>
              <p className="text-xs text-[#CBD5E1]">
                {lang === 'si'
                  ? `අනුවාදය v${appVersion} · Android 10 (API 29) හෝ ඊට ඉහළ සියලු දුරකථන සඳහා`
                  : `Version v${appVersion} · Works on all Android 10 (API 29) and higher devices`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAppModal}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compatibility Status Badges */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/75 border border-emerald-400/50 text-[11px] font-bold text-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isAndroid
                ? isAndroidSupported
                  ? `Android ${androidMajorVersion ?? '10+'} ✓`
                  : `Android ${androidMajorVersion} (Needs 10+)`
                : 'Android 10 / 11 / 12 / 13 / 14 / 15 ✓'}
            </span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/75 border border-sky-400/50 text-[11px] font-bold text-sky-200">
            <Wifi className="w-3.5 h-3.5 text-sky-400" />
            <span>
              {offlineReady
                ? lang === 'si'
                  ? 'Offline භාවිතයට සූදානම් ✓'
                  : 'Offline Ready ✓'
                : lang === 'si'
                  ? 'සජීවී Auto-Sync සක්‍රීයයි'
                  : 'Live Auto-Sync Active'}
            </span>
          </span>
        </div>

        {/* Section 1: Android 10+ Installation */}
        <div className="rounded-2xl bg-[#0D2229] border border-[#287482] p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#7DD3FC]">
              <Smartphone className="w-4 h-4" />
              <span>
                {lang === 'si'
                  ? '1. Android 10+ දුරකථනයට Install කරන ආකාරය'
                  : '1. Install on Android 10+ Phone'}
              </span>
            </div>
            {isInstalled && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-600/90 text-[10px] font-bold text-white">
                {lang === 'si' ? '✓ ස්ථාපනය කර ඇත' : '✓ Installed'}
              </span>
            )}
          </div>

          {isInstallable ? (
            <button
              type="button"
              onClick={() => void handleInstallClick()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#059669] hover:from-[#15803D] hover:to-[#047857] text-white text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>
                {lang === 'si'
                  ? 'දැන්ම Android App එක Install කරන්න (1-Tap)'
                  : 'Install ChemLab LK Android App Now (1-Tap)'}
              </span>
            </button>
          ) : isInstalled ? (
            <div className="rounded-xl bg-emerald-950/60 border border-emerald-400/40 px-3 py-2.5 text-xs text-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {lang === 'si'
                  ? 'ඔබ දැනටමත් ChemLab LK ස්ථාපිත App ආකාරයෙන් (Standalone) භාවිතා කරයි.'
                  : 'You are already running ChemLab LK as an installed standalone Android App.'}
              </span>
            </div>
          ) : isIOS ? (
            <div className="rounded-xl bg-black/35 border border-white/15 p-3 text-xs text-[#E2E8F0] space-y-1">
              <div className="font-bold text-[#FDE68A] flex items-center gap-1.5">
                <Share className="w-3.5 h-3.5" />
                <span>iPhone / iPad Safari Install:</span>
              </div>
              <p>
                {lang === 'si'
                  ? 'Safari හි Share (↑) බොත්තම ඔබා "Add to Home Screen" තෝරන්න.'
                  : 'Tap the Safari Share icon, then choose "Add to Home Screen".'}
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-black/35 border border-white/15 p-3 text-xs text-[#E2E8F0] space-y-2">
              <p className="leading-relaxed">
                {lang === 'si'
                  ? 'Android 10+ ඕනෑම දුරකථනයක Google Chrome හරහා පහත Link එක විවෘත කර, Chrome මෙනුවේ (⋮) ඇති "Install app" / "Add to Home screen" තෝරන්න — Play Store නොමැතිව සැබෑ Android App එකක් ලෙස Install වේ!'
                  : 'Open the link below in Google Chrome on any Android 10+ phone, tap the Chrome menu (⋮) → "Install app". Chrome installs it directly onto your Android Home Screen & App Drawer!'}
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  aria-label="App Install URL"
                  className="flex-1 rounded-lg bg-[#08151A] border border-[#287482] px-2.5 py-1.5 text-[11px] font-mono-tabular text-[#BAE6FD]"
                />
                <button
                  type="button"
                  onClick={() => void handleCopyUrl()}
                  className="px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? (lang === 'si' ? 'Copy විය' : 'Copied') : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="rounded-xl bg-amber-950/50 border border-amber-400/35 px-3 py-2 text-[11px] text-[#FDE68A] leading-relaxed">
            {lang === 'si'
              ? '💡 Cloud Billing නොමැතිව 100% නොමිලේ: AI Studio හි "Publish" (Cloud Billing ඉල්ලයි) වෙනුවට ඉහළ ඇති "Share" Link එකෙන් හෝ Cloudflare Pages / Netlify / Vercel හි නොමිලේ host කර Android 10+ වෙත Install කරන්න.'
              : '💡 Zero Cloud Billing: Skip AI Studio "Publish" (which asks for Google Cloud Billing) — use the free "Share" URL or host the built app free on Cloudflare Pages / Netlify / Vercel to install on Android 10+.'}
          </div>
        </div>

        {/* Section 2: Direct Live Updates From Here */}
        <div className="rounded-2xl bg-[#1C120B] border border-[#C89242]/60 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#FFE5AD]">
              <Sparkles className="w-4 h-4 text-[#FBBF24]" />
              <span>
                {lang === 'si'
                  ? '2. මෙතනින්ම සෘජුවම App Updates ලබා දීම (OTA)'
                  : '2. Direct Over-The-Air (OTA) App Updates'}
              </span>
            </div>
            <span className="text-[11px] font-mono-tabular text-[#FCD34D]">
              v{serverRelease?.version || appVersion}
            </span>
          </div>

          <p className="text-xs text-[#E2E8F0] leading-relaxed">
            {lang === 'si'
              ? 'ඔබ මෙම වෙබ් අඩවියේ කුමන වෙනසක් හෝ අලුත් පරීක්ෂණයක් update කළත්, Android 10+ දුරකථනවල Install කර ඇති App වලට නැවත APK file යැවීමකින් තොරව මෙතනින්ම ස්වයංක්‍රීයව Update ලැබේ.'
              : 'Every change deployed here automatically pushes to all installed Android 10+ ChemLab LK apps via Service Worker OTA sync — no manual APK re-installs needed.'}
          </p>

          {serverRelease && (
            <div className="rounded-xl bg-black/35 border border-white/10 px-3 py-2 text-[11px] text-[#CBD5E1] space-y-0.5">
              <div className="font-bold text-[#FDE68A]">
                {lang === 'si' ? 'නවතම නිකුතුව (Build):' : 'Latest Build:'}{' '}
                <span className="font-mono-tabular">{serverRelease.buildId}</span>
              </div>
              <div>{serverRelease.releaseNotes[lang]}</div>
              {lastCheckedAt && (
                <div className="text-[10px] text-[#94A3B8]">
                  {lang === 'si' ? 'අවසන් පරීක්ෂාව:' : 'Last checked:'} {lastCheckedAt}
                </div>
              )}
            </div>
          )}

          {updateNotice && (
            <div className="rounded-xl bg-sky-950/75 border border-sky-400/50 px-3 py-2 text-xs text-sky-100">
              {updateNotice}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={checkingUpdate}
              onClick={() => void handleCheckUpdates()}
              className="flex-1 py-2 px-3 rounded-xl bg-[#2B1B10] hover:bg-[#3B2516] border border-[#C89242] text-[#FFE5AD] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {checkingUpdate ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>
                {lang === 'si' ? 'නව Update පරීක්ෂා කරන්න' : 'Check for Updates'}
              </span>
            </button>

            {needRefresh && (
              <button
                type="button"
                onClick={() => void applyUpdate()}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {lang === 'si' ? 'දැන්ම Update කරන්න' : 'Apply Update Now'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
