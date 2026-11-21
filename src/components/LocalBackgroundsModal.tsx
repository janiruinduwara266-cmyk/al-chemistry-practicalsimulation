import { useRef, useState } from 'react';
import { Image as ImageIcon, RotateCcw, Sparkles, Upload, X } from 'lucide-react';
import { useBackgroundAssets } from '../contexts/BackgroundAssetsContext';
import type { BackgroundAssetKey } from '../data/curriculum';
import type { Language } from '../types/lab';
import { BACKGROUND_ASSET_SPECS } from '../utils/localBackgrounds';

interface LocalBackgroundsModalProps {
  lang: Language;
}

export function LocalBackgroundsModal({ lang }: LocalBackgroundsModalProps) {
  const {
    assets,
    customKeys,
    bgModalOpen,
    closeBgModal,
    setCustomBackground,
    resetOneBackground,
    resetAllBackgrounds,
  } = useBackgroundAssets();

  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingKeyRef = useRef<BackgroundAssetKey>('welcomeBackdrop');

  if (!bgModalOpen) return null;

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const key = pendingKeyRef.current;
    await setCustomBackground(key, file);
    setNotice(
      lang === 'si'
        ? `"${file.name}" ඔබගේ උපාංගයේ සාර්ථකව සුරැකුණි (100% Free Offline).`
        : `Saved "${file.name}" locally on your device (100% Free Offline).`
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'si' ? 'පසුබිම් රූප කළමනාකරණය' : 'Background Pictures'}
    >
      <div className="relative w-full max-w-2xl wood-panel rounded-3xl p-5 sm:p-6 text-white max-h-[90vh] overflow-y-auto lab-scroll space-y-4">
        <div className="flex items-start justify-between gap-3 border-b border-white/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl liquid-glass-icon flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-[#7DD3FC]" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-extrabold text-[#FFE5AD]">
                {lang === 'si'
                  ? 'විද්‍යාගාර පසුබිම් රූප (100% Free Offline)'
                  : 'Lab Background Pictures (100% Free Offline)'}
              </h2>
              <p className="text-xs text-[#CBD5E1]">
                {lang === 'si'
                  ? 'Cloud හෝ ගාස්තු කිසිවක් නොමැතිව ඔබගේ දුරකථනයේම සුරැකි පසුබිම් රූප භාවිතා කරන්න හෝ මාරු කරන්න.'
                  : 'All lab backgrounds run 100% free and offline directly from your device without any Cloud subscription.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeBgModal}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl bg-emerald-950/60 border border-emerald-400/40 px-3.5 py-2.5 text-xs text-emerald-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>
            {lang === 'si'
              ? 'සියලුම පසුබිම් රූප 4 ම ස්ථානීයව ඇප් එක සමඟ නොමිලේ (Offline) පූරණය වේ!'
              : 'All 4 background scenes are bundled locally and work 100% free offline!'}
          </span>
        </div>

        {notice && (
          <div className="rounded-xl bg-sky-950/75 border border-sky-400/50 px-3.5 py-2 text-xs text-sky-100">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BACKGROUND_ASSET_SPECS.map((spec) => {
            const isCustom = customKeys.has(spec.key);
            return (
              <div
                key={spec.key}
                className="rounded-2xl bg-[#1A1009] border border-[#8E6234] overflow-hidden flex flex-col"
              >
                <div className="relative h-28 bg-black/60">
                  <img
                    src={assets[spec.key]}
                    alt={spec.label[lang]}
                    decoding="async"
                    className={`w-full h-full ${
                      spec.key === 'assistantAvatar'
                        ? 'object-contain bg-[#2A1D12]'
                        : 'object-cover object-center'
                    }`}
                  />
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isCustom
                        ? 'bg-sky-600/90 text-white'
                        : 'bg-black/75 text-[#FDE68A]'
                    }`}
                  >
                    {isCustom
                      ? lang === 'si'
                        ? 'අභිරුචි (Device)'
                        : 'Custom (Device)'
                      : lang === 'si'
                        ? 'මුල් රූපය (Free)'
                        : 'Built-in (Free)'}
                  </span>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-[#FFF7E6]">{spec.label[lang]}</div>
                    <div className="text-[10px] text-[#CBD5E1] font-mono-tabular truncate mt-0.5">
                      {spec.fileName}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        pendingKeyRef.current = spec.key;
                        fileInputRef.current?.click();
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#0284C7]/85 hover:bg-[#0284C7] text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{lang === 'si' ? 'රූපය මාරු කරන්න' : 'Change Image'}</span>
                    </button>
                    {isCustom && (
                      <button
                        type="button"
                        aria-label={`Reset ${spec.fileName}`}
                        onClick={() => {
                          void resetOneBackground(spec.key).then(() => {
                            setNotice(
                              lang === 'si'
                                ? `"${spec.label.si}" මුල් රූපයට ප්‍රතිස්ථාපනය කරන ලදී.`
                                : `Restored default "${spec.label.en}".`
                            );
                          });
                        }}
                        className="p-1.5 rounded-lg bg-[#3A2415] hover:bg-[#4F321E] border border-[#C89242]/50 text-[#FDE68A] cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {customKeys.size > 0 && (
          <div className="flex justify-end pt-2 border-t border-white/15">
            <button
              type="button"
              onClick={() => {
                void resetAllBackgrounds().then(() => {
                  setNotice(
                    lang === 'si'
                      ? 'සියලුම පසුබිම් මුල් රූප වලට ප්‍රතිස්ථාපනය කරන ලදී.'
                      : 'All backgrounds restored to built-in defaults.'
                  );
                });
              }}
              className="px-3 py-1.5 rounded-xl bg-[#B45309] hover:bg-[#D97706] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'si' ? 'සියල්ල මුල් රූප වලට ගන්න' : 'Restore All Defaults'}</span>
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChosen}
        />
      </div>
    </div>
  );
}
