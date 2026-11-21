import {
  Atom,
  BookOpen,
  Compass,
  FlaskConical,
  Globe,
  Home,
  Image as ImageIcon,
  LogOut,
  Map as MapIcon,
  Package,
  Smartphone,
  Sparkles,
  UserCheck,
  Volume2,
  VolumeX,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { useBackgroundAssets } from '../contexts/BackgroundAssetsContext';
import { usePWAContext } from '../contexts/PWAContext';
import { SYLLABUS_REACTIONS } from '../data/reactionsCatalog';
import type { Language, ScreenState, StudentProfile, VoiceName } from '../types/lab';

interface SideMenuDrawerProps {
  open: boolean;
  lang: Language;
  currentScreen: ScreenState;
  muted: boolean;
  voiceName: VoiceName;
  studentProfile: StudentProfile | null;
  onClose: () => void;
  onNavigate: (screen: ScreenState) => void;
  onOpenTopics: () => void;
  onChangeLang: (lang: Language) => void;
  onToggleMute: () => void;
  onSwitchAccount: () => void;
}

export function SideMenuDrawer({
  open,
  lang,
  currentScreen,
  muted,
  voiceName,
  studentProfile,
  onClose,
  onNavigate,
  onOpenTopics,
  onChangeLang,
  onToggleMute,
  onSwitchAccount,
}: SideMenuDrawerProps) {
  const { assets, customKeys, openBgModal } = useBackgroundAssets();
  const { appVersion, isInstalled, needRefresh, openAppModal } = usePWAContext();

  if (!open) return null;

  const displayName = studentProfile?.username || studentProfile?.name || '';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/70"
      />

      {/* Slide-in Left Navigation Panel */}
      <aside
        role="dialog"
        aria-label={lang === 'si' ? 'විද්‍යාගාර මෙනුව' : 'Laboratory Navigation Menu'}
        className="relative z-10 w-[310px] max-w-[88vw] h-full wood-panel border-r-2 border-[#C89242] flex flex-col justify-between shadow-2xl overflow-y-auto lab-scroll"
      >
        <div>
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#1B1009] border-b border-[#8E6234] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full liquid-glass-orb bg-[#FBF5EA] border-2 border-[#C89242] flex items-center justify-center shrink-0">
                <Atom className="w-5 h-5 text-[#1D3557]" />
              </div>
              <div>
                <div className="font-display text-sm font-extrabold text-[#FFE5AD] tracking-wide">
                  CHEMLAB LK
                </div>
                <div className="text-[10px] text-[#F5C56B]">
                  {lang === 'si' ? 'A/L රසායන විද්‍යාගාරය' : 'A/L Chemistry 3D Lab'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Menu"
              className="w-8 h-8 rounded-full bg-[#3A2415] hover:bg-[#4F321E] text-[#EADAC2] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Student Profile Card */}
          <div className="mx-3.5 mt-3 p-3 rounded-xl liquid-glass-card flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg liquid-glass-icon flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-[#4ADE80]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#FFF7E6] truncate">
                  {displayName || (lang === 'si' ? 'ආගන්තුක සිසුවා' : 'Student Guest')}
                </div>
                <div className="text-[10px] text-[#CBD5E1] truncate">
                  {studentProfile?.email ||
                    (lang === 'si' ? 'ගිණුම සකසා ගන්න' : 'Sign in to personalize')}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onSwitchAccount();
                onClose();
              }}
              title={lang === 'si' ? 'ගිණුම මාරු කරන්න' : 'Switch Account'}
              aria-label={lang === 'si' ? 'ගිණුම මාරු කරන්න' : 'Switch Account'}
              className="px-2 py-1 rounded-lg bg-[#2A1B10] hover:bg-[#3E2717] border border-[#C89242]/60 text-[10px] font-bold text-[#FFE5AD] flex items-center gap-1 cursor-pointer shrink-0"
            >
              <LogOut className="w-3 h-3" />
              <span>{lang === 'si' ? 'මාරු' : 'Switch'}</span>
            </button>
          </div>

          {/* Primary Navigation Links */}
          <nav className="p-3.5 space-y-2" aria-label="Main Menu">
            <button
              type="button"
              onClick={() => {
                onNavigate('explorer');
                onClose();
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                currentScreen === 'explorer'
                  ? 'bg-[#0D3B46] border-[#38BDF8] text-white'
                  : 'bg-[#1D120B] hover:bg-[#2C1B10] border-[#C89242]/80 text-[#FFF7E6]'
              }`}
            >
              <div className="w-9 h-9 rounded-xl liquid-glass-icon text-[#7DD3FC] flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate">
                  {lang === 'si'
                    ? 'විදුලි හා රසායන උපකරණ 3D'
                    : '3D Electric & Lab Equipment'}
                </div>
                <div className="text-[10px] text-[#7DD3FC] mt-0.5 truncate">
                  {lang === 'si'
                    ? 'විදුලි උපකරණ 7 + වීදුරු භාණ්ඩ 13'
                    : 'All 20 Syllabus Instruments & Voice'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('reactions');
                onClose();
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                currentScreen === 'reactions'
                  ? 'bg-[#14532D] border-[#4ADE80] text-white'
                  : 'bg-[#1D120B] hover:bg-[#2C1B10] border-[#4ADE80]/55 text-[#FFF7E6]'
              }`}
            >
              <div className="w-9 h-9 rounded-xl liquid-glass-emerald text-[#86EFAC] flex items-center justify-center shrink-0">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate">
                  {lang === 'si'
                    ? '3D රසායනික ප්‍රතික්‍රියාගාරය'
                    : '3D Chemical Reactions Lab'}
                </div>
                <div className="text-[10px] text-[#86EFAC] mt-0.5 truncate">
                  {lang === 'si'
                    ? `විෂය ප්‍රතික්‍රියා ${SYLLABUS_REACTIONS.length} + නිදහස් මිශ්‍ර`
                    : `${SYLLABUS_REACTIONS.length} Syllabus Reactions & Custom Mix`}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('elements');
                onClose();
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                currentScreen === 'elements'
                  ? 'bg-[#2E1065] border-[#A78BFA] text-white'
                  : 'bg-[#1D120B] hover:bg-[#2C1B10] border-[#A78BFA]/55 text-[#FFF7E6]'
              }`}
            >
              <div className="w-9 h-9 rounded-xl liquid-glass-violet text-[#DDD6FE] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate">
                  {lang === 'si'
                    ? 'මූලද්‍රව්‍ය 118 හා ඉලෙක්ට්‍රෝන වින්‍යාස'
                    : 'All 118 Elements & Electron Configs'}
                </div>
                <div className="text-[10px] text-[#C4B5FD] mt-0.5 truncate">
                  {lang === 'si'
                    ? 'ආවර්තිතා වගුව + 3D බෝර් පරමාණු'
                    : 'Periodic Table + 3D Bohr Atoms'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('map');
                onClose();
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                currentScreen === 'map'
                  ? 'bg-[#4E2F16] border-[#FCD34D] text-white'
                  : 'bg-[#22150D] hover:bg-[#311E13] border-[#8E6234] text-[#EADAC2]'
              }`}
            >
              <MapIcon className="w-4 h-4 text-[#F5C56B] shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold">
                  {lang === 'si' ? 'ප්‍රායෝගික සිතියම (ඒකක I–X)' : 'Practical Lab Map (Units I–X)'}
                </div>
                <div className="text-[10px] text-[#CBD5E1]">
                  {lang === 'si' ? 'පරීක්ෂණ 40 ක්' : '40 Interactive 3D Practicals'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('prep');
                onClose();
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                currentScreen === 'prep'
                  ? 'bg-[#4E2F16] border-[#FCD34D] text-white'
                  : 'bg-[#22150D] hover:bg-[#311E13] border-[#8E6234] text-[#EADAC2]'
              }`}
            >
              <Package className="w-4 h-4 text-[#FCD34D] shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold">
                  {lang === 'si' ? 'උපකරණ පෙට්ටිය (තෝරන්න)' : 'Apparatus Selection Box'}
                </div>
                <div className="text-[10px] text-[#CBD5E1]">
                  {lang === 'si' ? 'ක්‍රමය · නිරීක්ෂණ · නිගමන' : 'Pick Tools & Study Guide'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('workbench');
                onClose();
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                currentScreen === 'workbench'
                  ? 'bg-[#4E2F16] border-[#FCD34D] text-white'
                  : 'bg-[#22150D] hover:bg-[#311E13] border-[#8E6234] text-[#EADAC2]'
              }`}
            >
              <Wrench className="w-4 h-4 text-[#4ADE80] shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold">
                  {lang === 'si' ? 'සජීවී 3D වැඩ මේසය' : 'Active 3D Workbench'}
                </div>
                <div className="text-[10px] text-[#CBD5E1]">
                  {lang === 'si' ? 'තෝරාගත් පරීක්ෂණයට යන්න' : 'Open Current Practical'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenTopics();
                onClose();
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-[#22150D] hover:bg-[#311E13] border-[#8E6234] text-[#EADAC2] text-left flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#FCD34D] shrink-0" />
              <div className="text-xs font-bold">
                {lang === 'si' ? 'පාඩම් මාතෘකා (1–10)' : 'Select Syllabus Unit (1–10)'}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                openBgModal();
                onClose();
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-[#0E2832] hover:bg-[#143947] border-[#38BDF8]/60 text-[#E0F2FE] text-left flex items-center gap-3 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold">
                  {lang === 'si' ? 'පසුබිම් රූප (100% Free)' : 'Lab Backgrounds (100% Free)'}
                </div>
                <div className="text-[10px] text-[#7DD3FC]">
                  {customKeys.size > 0
                    ? lang === 'si'
                      ? `✓ අභිරුචි රූප ${customKeys.size} ක් සුරැකිණි`
                      : `✓ ${customKeys.size} custom background(s)`
                    : lang === 'si'
                      ? 'නොමිලේ ස්ථානීය පසුබිම් මාරු කරන්න'
                      : 'Customize offline backgrounds'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                openAppModal();
                onClose();
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-[#102A1D] hover:bg-[#163B28] border-[#4ADE80]/60 text-[#DCFCE7] text-left flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#4ADE80] shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold">
                  {lang === 'si'
                    ? 'Android 10+ App සහ Updates'
                    : 'Android 10+ App & Updates'}
                </div>
                <div className="text-[10px] text-[#86EFAC]">
                  {needRefresh
                    ? lang === 'si'
                      ? '● නව Update එකක් සූදානම්!'
                      : '● New Update Ready!'
                    : isInstalled
                      ? `✓ Installed · v${appVersion}`
                      : `v${appVersion} · Android 10+ Install`}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('welcome');
                onClose();
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-[#22150D] hover:bg-[#311E13] border-[#8E6234] text-[#EADAC2] text-left flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4 text-[#F5C56B] shrink-0" />
              <div className="text-xs font-bold">
                {lang === 'si' ? 'මුල් පිටුව' : 'Welcome Screen'}
              </div>
            </button>
          </nav>

          {/* AI Boy Voice & Language Quick Controls (Always Live When Unmuted) */}
          <div className="mx-3.5 mt-1 p-3 rounded-xl bg-[#0C262E] border border-[#287482] space-y-2.5">
            <div className="flex items-center gap-2">
              <img
                src={assets.assistantAvatar}
                alt="AI Voice Coach"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover object-top border border-[#F5C56B]"
              />
              <div>
                <div className="text-[11px] font-bold text-[#7DD3FC]">
                  {lang === 'si' ? 'AI සජීවී හඬ උපදේශක' : 'Live AI Voice Instructor'}
                </div>
                <div className="text-[10px] text-[#CBD5E1]">
                  {lang === 'si' ? 'සෑම විටම සජීවීව ක්‍රියාත්මකයි' : 'Always Live Speaking & Boy Voice'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-[#E2E8F0]">{lang === 'si' ? 'හඬ:' : 'Voice:'}</span>
              <span className="px-2 py-0.5 rounded bg-[#08191F] border border-[#287482] font-bold text-[#FFE5AD]">
                {voiceName} ({lang === 'si' ? 'පිරිමි හඬ' : 'Male Voice'})
              </span>
            </div>

            <button
              type="button"
              onClick={onToggleMute}
              className="w-full py-1.5 px-2 rounded-lg text-[11px] font-bold border bg-[#1B120B] border-[#8E6234] text-[#F5C56B] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>
                {muted
                  ? lang === 'si'
                    ? 'ශබ්දය නිහඬ කර ඇත (Mute)'
                    : 'Sound Muted'
                  : lang === 'si'
                    ? 'සජීවී හඬ ක්‍රියාත්මකයි (ON)'
                    : 'Live Voice Active'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onChangeLang(lang === 'si' ? 'en' : 'si')}
              className="w-full py-1.5 px-3 rounded-lg bg-[#EA580C] hover:bg-[#F97316] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'si' ? 'Switch to English' : 'සිංහල භාෂාවට මාරු වන්න'}</span>
            </button>
          </div>
        </div>

        {/* Footer inside drawer */}
        <div className="p-3.5 border-t border-[#8E6234]/40 text-center text-[10px] text-[#D4BFA2]">
          <div className="flex items-center justify-center gap-1 text-[#F5C56B] font-semibold">
            <BookOpen className="w-3 h-3" />
            <span>Design by Janiru Induwara</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

