import { useEffect, useState } from 'react';
import { AdventureMap } from './components/AdventureMap';
import { AndroidAppModal } from './components/AndroidAppModal';
import { ApparatusSelectionPage } from './components/ApparatusSelectionPage';
import { ElementsExplorer } from './components/ElementsExplorer';
import { EquipmentExplorer } from './components/EquipmentExplorer';
import { LabWorkbench } from './components/LabWorkbench';
import { LocalBackgroundsModal } from './components/LocalBackgroundsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ReactionsLab } from './components/ReactionsLab';
import { SideMenuDrawer } from './components/SideMenuDrawer';
import { SignInScreen } from './components/SignInScreen';
import { TopicsModal } from './components/TopicsModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { BackgroundAssetsProvider } from './contexts/BackgroundAssetsContext';
import { PWAProvider } from './contexts/PWAContext';
import { getUnitForExperiment } from './data/curriculum';
import { soundFX } from './utils/soundEffects';
import type {
  ExperimentId,
  Language,
  ScreenState,
  StudentProfile,
  UnitRoman,
  VoiceName,
} from './types/lab';

const STORAGE_KEY_COMPLETED = 'chemlab_lk_completed_u1_v1';
const STORAGE_KEY_PROFILE = 'chemlab_lk_student_profile_v1';

function loadSavedProfile(): StudentProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StudentProfile>;
    if (parsed && typeof parsed.name === 'string' && parsed.name.trim()) {
      return {
        name: parsed.name,
        age: Number(parsed.age) || 17,
        email: String(parsed.email || ''),
        username: String(parsed.username || parsed.name),
        createdAt: String(parsed.createdAt || new Date().toISOString()),
      };
    }
  } catch {
    // Ignore storage read failure
  }
  return null;
}

export default function App() {
  const autostartParam =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('autostart')
      : null;
  const autostart = autostartParam === '1';

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() =>
    loadSavedProfile()
  );

  const [screen, setScreen] = useState<ScreenState>(() => {
    if (autostartParam === 'explorer') return 'explorer';
    if (autostartParam === 'reactions') return 'reactions';
    if (autostartParam === 'elements') return 'elements';
    if (autostartParam === 'prep') return 'prep';
    if (autostartParam === 'signin') return 'signin';
    if (autostartParam === 'map') return 'map';
    if (autostartParam === 'welcome') return 'welcome';
    if (autostart) return 'workbench';
    return loadSavedProfile() ? 'welcome' : 'signin';
  });

  const [lang, setLang] = useState<Language>('si');
  const [activeUnitRoman, setActiveUnitRoman] = useState<UnitRoman>('I');
  const [activeExperiment, setActiveExperiment] = useState<ExperimentId>('cathode-tube');
  const [prepSelections, setPrepSelections] = useState<Record<string, string[]>>({});
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [tourSeen, setTourSeen] = useState(false);
  const voiceName: VoiceName = 'Puck';

  const [completedIds, setCompletedIds] = useState<Set<ExperimentId>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_COMPLETED);
      if (raw) {
        return new Set(JSON.parse(raw) as ExperimentId[]);
      }
    } catch {
      // Ignore storage read failure
    }
    return new Set();
  });

  useEffect(() => {
    soundFX.muted = muted;
  }, [muted]);

  const handleCompleteSignIn = (profile: StudentProfile) => {
    setStudentProfile(profile);
    try {
      window.localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch {
      // Ignore storage write failure
    }
    setScreen('welcome');
  };

  const handleMarkCompleted = (id: ExperimentId) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        window.localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(Array.from(next)));
      } catch {
        // Ignore storage write failure
      }
      return next;
    });
  };

  // Picking a station on AdventureMap enters the dedicated Apparatus Box Selection page ('prep')
  const handleSelectExperimentFromMap = (id: ExperimentId) => {
    setActiveUnitRoman(getUnitForExperiment(id));
    setActiveExperiment(id);
    setScreen('prep');
  };

  // Switching experiment inside LabWorkbench
  const handleSwitchExperimentInWorkbench = (id: ExperimentId) => {
    setActiveUnitRoman(getUnitForExperiment(id));
    setActiveExperiment(id);
    setScreen('workbench');
  };

  const handleEnterWorkbenchFromPrep = (selectedIds: string[]) => {
    setPrepSelections((prev) => ({
      ...prev,
      [activeExperiment]: selectedIds,
    }));
    setTourSeen(true);
    setScreen('workbench');
  };

  return (
    <PWAProvider>
      <BackgroundAssetsProvider>
        <main className="w-full min-h-screen">
      {screen === 'signin' && (
        <SignInScreen
          lang={lang}
          muted={muted}
          voiceName={voiceName}
          existingProfile={studentProfile}
          onChangeLang={setLang}
          onToggleMute={() => setMuted((m) => !m)}
          onCompleteSignIn={handleCompleteSignIn}
        />
      )}

      {screen === 'welcome' && (
        <WelcomeScreen
          lang={lang}
          muted={muted}
          voiceName={voiceName}
          studentProfile={studentProfile}
          onChangeLang={setLang}
          onToggleMute={() => setMuted((m) => !m)}
          onEnterLab={() => setScreen('map')}
          onOpenExplorer={() => setScreen('explorer')}
          onOpenReactions={() => setScreen('reactions')}
          onOpenElements={() => setScreen('elements')}
          onOpenSideMenu={() => setSideMenuOpen(true)}
          onSwitchAccount={() => setScreen('signin')}
        />
      )}

      {screen === 'map' && (
        <AdventureMap
          lang={lang}
          activeUnitRoman={activeUnitRoman}
          completedIds={completedIds}
          muted={muted}
          voiceName={voiceName}
          studentProfile={studentProfile}
          onToggleMute={() => setMuted((m) => !m)}
          onChangeLang={setLang}
          onSelectExperiment={handleSelectExperimentFromMap}
          onOpenTopics={() => setTopicsOpen(true)}
          onOpenExplorer={() => setScreen('explorer')}
          onOpenReactions={() => setScreen('reactions')}
          onOpenElements={() => setScreen('elements')}
          onOpenSideMenu={() => setSideMenuOpen(true)}
          onBackWelcome={() => setScreen('welcome')}
        />
      )}

      {screen === 'prep' && (
        <ApparatusSelectionPage
          lang={lang}
          experimentId={activeExperiment}
          initialSelectedIds={prepSelections[activeExperiment] || []}
          muted={muted}
          voiceName={voiceName}
          studentProfile={studentProfile}
          onChangeLang={setLang}
          onToggleMute={() => setMuted((m) => !m)}
          onOpenSideMenu={() => setSideMenuOpen(true)}
          onOpenTopics={() => setTopicsOpen(true)}
          onBackToMap={() => setScreen('map')}
          onEnterWorkbench={handleEnterWorkbenchFromPrep}
        />
      )}

      {screen === 'workbench' && (
        <LabWorkbench
          lang={lang}
          experimentId={activeExperiment}
          initialPlacedIds={prepSelections[activeExperiment] || []}
          muted={muted}
          skipInitialTour={autostart || tourSeen}
          voiceName={voiceName}
          studentProfile={studentProfile}
          onChangeLang={setLang}
          onToggleMute={() => setMuted((m) => !m)}
          onSelectExperiment={handleSwitchExperimentInWorkbench}
          onOpenTopics={() => {
            setTourSeen(true);
            setTopicsOpen(true);
          }}
          onOpenSideMenu={() => setSideMenuOpen(true)}
          onBackToPrep={() => {
            setTourSeen(true);
            setScreen('prep');
          }}
          onBackToMap={() => {
            setTourSeen(true);
            setScreen('map');
          }}
          onMarkCompleted={handleMarkCompleted}
        />
      )}

      {screen === 'explorer' && (
        <EquipmentExplorer
          lang={lang}
          muted={muted}
          voiceName={voiceName}
          studentProfile={studentProfile}
          onChangeLang={setLang}
          onToggleMute={() => setMuted((m) => !m)}
          onOpenSideMenu={() => setSideMenuOpen(true)}
          onOpenTopics={() => setTopicsOpen(true)}
          onBackToMap={() => setScreen('map')}
        />
      )}

      {screen === 'reactions' && (
        <ReactionsLab
          lang={lang}
          muted={muted}
          voiceName={voiceName}
          studentProfile={studentProfile}
          onChangeLang={setLang}
          onToggleMute={() => setMuted((m) => !m)}
          onOpenSideMenu={() => setSideMenuOpen(true)}
          onOpenTopics={() => setTopicsOpen(true)}
          onOpenExplorer={() => setScreen('explorer')}
          onBackToMap={() => setScreen('map')}
        />
      )}

      {screen === 'elements' && (
        <ElementsExplorer
          lang={lang}
          muted={muted}
          voiceName={voiceName}
          studentProfile={studentProfile}
          onChangeLang={setLang}
          onToggleMute={() => setMuted((m) => !m)}
          onOpenSideMenu={() => setSideMenuOpen(true)}
          onOpenTopics={() => setTopicsOpen(true)}
          onBackToMap={() => setScreen('map')}
        />
      )}

      <SideMenuDrawer
        open={sideMenuOpen}
        lang={lang}
        currentScreen={screen}
        muted={muted}
        voiceName={voiceName}
        studentProfile={studentProfile}
        onClose={() => setSideMenuOpen(false)}
        onNavigate={(target) => {
          if (target === 'workbench') setTourSeen(true);
          setScreen(target);
        }}
        onOpenTopics={() => setTopicsOpen(true)}
        onChangeLang={setLang}
        onToggleMute={() => setMuted((m) => !m)}
        onSwitchAccount={() => setScreen('signin')}
      />

      <TopicsModal
        open={topicsOpen}
        lang={lang}
        activeUnitRoman={activeUnitRoman}
        onClose={() => setTopicsOpen(false)}
        onSelectUnit={(unit) => {
          setActiveUnitRoman(unit);
          setScreen('map');
        }}
      />

      <LocalBackgroundsModal lang={lang} />
      <AndroidAppModal lang={lang} />
      <OfflineIndicator lang={lang} />
    </main>
    </BackgroundAssetsProvider>
    </PWAProvider>
  );
}

