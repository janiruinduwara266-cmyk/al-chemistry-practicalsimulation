import { Compass, X } from 'lucide-react';
import { AL_CHEMISTRY_TOPICS } from '../data/curriculum';
import type { Language, UnitRoman } from '../types/lab';

interface TopicsModalProps {
  open: boolean;
  lang: Language;
  activeUnitRoman: UnitRoman;
  onClose: () => void;
  onSelectUnit: (unit: UnitRoman) => void;
}

export function TopicsModal({
  open,
  lang,
  activeUnitRoman,
  onClose,
  onSelectUnit,
}: TopicsModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'si' ? 'මාතෘකා තෝරන්න' : 'Select Topics'}
    >
      <div className="relative w-full max-w-4xl parchment-panel rounded-2xl p-6 sm:p-8 text-[#2B1B12] max-h-[90vh] overflow-y-auto lab-scroll">
        {/* Decorative Brass Corner Pins */}
        <span className="absolute top-3 left-3 w-4 h-4 rounded-full bg-gradient-to-br from-[#FDE68A] to-[#B45309] border border-[#78350F]" />
        <span className="hidden sm:block absolute bottom-3 left-3 w-4 h-4 rounded-full bg-gradient-to-br from-[#FDE68A] to-[#B45309] border border-[#78350F]" />
        <span className="hidden sm:block absolute bottom-3 right-3 w-4 h-4 rounded-full bg-gradient-to-br from-[#FDE68A] to-[#B45309] border border-[#78350F]" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Topics"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#7F1D1D] text-white flex items-center justify-center hover:bg-[#991B1B] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-3 mb-2">
          <Compass className="w-6 h-6 text-[#991B1B]" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#7F1D1D]">
            {lang === 'si' ? 'මාතෘකා තෝරන්න' : 'Select Chemistry Unit'}
          </h2>
        </div>

        <p className="text-center text-xs sm:text-sm text-[#5C4430] mb-6">
          {lang === 'si'
            ? 'උසස් පෙළ රසායන විද්‍යාව සියලුම පාඩම් 10 (ප්‍රායෝගික පරීක්ෂණ 01–40) — කැමති ඒකකයක් තෝරන්න'
            : 'Complete G.C.E. A/L Chemistry Syllabus — All 10 Units & 40 Interactive Practicals Unlocked'}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {AL_CHEMISTRY_TOPICS.map((topic) => {
            const isCurrent = topic.roman === activeUnitRoman;
            return (
              <div
                key={topic.roman}
                className={`relative rounded-xl p-3.5 flex flex-col items-center text-center justify-between border-2 transition-shadow ${
                  isCurrent
                    ? 'bg-white border-[#7F1D1D] shadow-lg ring-2 ring-[#F59E0B]/40'
                    : 'bg-[#FFFDF7] border-[#C9B796] hover:border-[#7F1D1D] shadow-sm'
                }`}
              >
                <span
                  className={`self-start text-[11px] font-bold px-1.5 py-0.5 rounded ${
                    isCurrent ? 'bg-[#7F1D1D] text-white' : 'bg-[#8E6234] text-white'
                  }`}
                >
                  {topic.roman}
                </span>

                <div className="my-2">
                  <div className="text-xs sm:text-sm font-bold leading-snug text-[#2B1B12]">
                    {topic.title[lang]}
                  </div>
                  <div className="text-[11px] font-mono-tabular text-[#7C6855] mt-1">
                    {topic.numberRange}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectUnit(topic.roman);
                    onClose();
                  }}
                  className={`w-full py-1.5 px-2 rounded-md text-[11px] font-bold cursor-pointer whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'bg-[#7F1D1D] hover:bg-[#991B1B] text-white'
                      : 'bg-[#D97706] hover:bg-[#B45309] text-white'
                  }`}
                >
                  {isCurrent
                    ? lang === 'si'
                      ? 'දැනට මෙහි'
                      : 'YOU ARE HERE'
                    : lang === 'si'
                      ? 'පිවිසෙන්න →'
                      : 'ENTER →'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
