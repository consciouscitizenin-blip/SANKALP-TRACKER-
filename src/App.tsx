import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Calendar,
  Users,
  Cloud,
  Wifi,
  WifiOff,
  Languages,
  LogOut,
  CheckCircle2,
  Sliders,
  Contrast,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  INITIAL_SYLLABUS_TOPICS,
  INITIAL_BLOCKED_APPS,
  EXAM_PRESETS,
  ExamProfileConfig,
  SyllabusTopic,
  BlockedAppItem,
  SubjectId,
  TopicStatus,
  ThemeVariant,
  THEMES,
  THEME_LIST,
  getThemeConfig,
  calculateSyllabusMetrics,
  evaluateWeeklyTargetLock,
  computeGamificationBadges,
  applyExamPreset,
} from './utils/sscLogic';
import {
  initAuth,
  googleSignIn,
  logout,
  syncUserProgressToCloud,
  db,
  doc,
  onSnapshot,
  handleFirestoreError,
  OperationType,
} from './services/firebase';
import { CommandHubView } from './components/CommandHubView';
import { SyllabusTrackerView } from './components/SyllabusTrackerView';
import { AIStudyLabView } from './components/AIStudyLabView';
import { AnalyticsScheduleView } from './components/AnalyticsScheduleView';
import { PeerCommunityView } from './components/PeerCommunityView';
import { PWAInstallButton, OfflineBanner } from './components/PWAElements';
import { ExamCustomizerModal } from './components/ExamCustomizerModal';

type WorkspaceTab = 'command' | 'syllabus' | 'ailab' | 'analytics' | 'community';

const THEME_SWATCH_CLASSES: Record<ThemeVariant, string> = {
  midnight: 'bg-[#F59E0B]',
  obsidian: 'bg-[#FACC15]',
  emerald: 'bg-[#10B981]',
  saffron: 'bg-[#F97316]',
  amethyst: 'bg-[#38BDF8]',
  coffee: 'bg-[#FBBF24]',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('command');
  const [uiLang, setUiLang] = useState<'en' | 'hi'>('en');
  const [simulateOffline, setSimulateOffline] = useState<boolean>(false);
  const [customizerOpen, setCustomizerOpen] = useState<boolean>(false);
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>(() => {
    try {
      const saved = localStorage.getItem('sankalp_theme_v1');
      if (saved && saved in THEMES) return saved as ThemeVariant;
    } catch {
      // ignore
    }
    return 'midnight';
  });

  // Customizable Exam Profile State
  const [examProfile, setExamProfile] = useState<ExamProfileConfig>(() => {
    try {
      const saved = localStorage.getItem('sankalp_exam_profile_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return EXAM_PRESETS['ssc-cgl'].profile;
  });

  // Core Preparation Syllabus State with LocalStorage Offline Persistence
  const [topics, setTopics] = useState<SyllabusTopic[]>(() => {
    try {
      const saved = localStorage.getItem('sankalp_topics_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SYLLABUS_TOPICS;
  });

  const [weeklyTargetHours, setWeeklyTargetHours] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sankalp_weekly_target');
      if (saved) return Number(saved) || 35;
    } catch {
      // ignore
    }
    return 35;
  });

  const [weeklyCompletedHours, setWeeklyCompletedHours] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sankalp_weekly_completed');
      if (saved) return Number(saved) || 29.5;
    } catch {
      // ignore
    }
    return 29.5;
  });

  const [dailyCompletedHours, setDailyCompletedHours] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sankalp_daily_completed');
      if (saved) return Number(saved) || 3.0;
    } catch {
      // ignore
    }
    return 3.0;
  });

  const [strictLockEnabled, setStrictLockEnabled] = useState<boolean>(true);
  const [streakDays, setStreakDays] = useState<number>(11);
  const [xpPoints, setXpPoints] = useState<number>(2640);
  const [blockedApps, setBlockedApps] = useState<BlockedAppItem[]>(INITIAL_BLOCKED_APPS);

  // Auth & Cloud Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cloudSyncedAt, setCloudSyncedAt] = useState<string | null>(null);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);

  // Save to LocalStorage for seamless offline mode & theme persistence
  useEffect(() => {
    try {
      localStorage.setItem('sankalp_exam_profile_v1', JSON.stringify(examProfile));
      localStorage.setItem('sankalp_topics_v1', JSON.stringify(topics));
      localStorage.setItem('sankalp_weekly_target', String(weeklyTargetHours));
      localStorage.setItem('sankalp_weekly_completed', String(weeklyCompletedHours));
      localStorage.setItem('sankalp_daily_completed', String(dailyCompletedHours));
      localStorage.setItem('sankalp_theme_v1', themeVariant);
    } catch {
      // ignore storage errors
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeVariant);
    }
  }, [examProfile, topics, weeklyTargetHours, weeklyCompletedHours, dailyCompletedHours, themeVariant]);

  const activeThemeConfig = getThemeConfig(themeVariant);

  const metrics = calculateSyllabusMetrics(topics, examProfile.subjects);
  const enforcementState = evaluateWeeklyTargetLock(
    weeklyCompletedHours,
    weeklyTargetHours,
    strictLockEnabled
  );
  const badges = computeGamificationBadges(
    xpPoints,
    streakDays,
    metrics.completedTopics,
    weeklyCompletedHours,
    weeklyTargetHours
  );

  // Initialize Firebase Auth & Cloud Sync Listener
  useEffect(() => {
    const unsubAuth = initAuth(
      (user) => {
        setCurrentUser(user);
        setAuthErrorMsg(null);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const path = `user_progress/${currentUser.uid}`;
    const unsubDoc = onSnapshot(
      doc(db, 'user_progress', currentUser.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (typeof data.weeklyTargetHours === 'number') {
            setWeeklyTargetHours(data.weeklyTargetHours);
          }
          if (typeof data.weeklyCompletedHours === 'number') {
            setWeeklyCompletedHours(data.weeklyCompletedHours);
          }
          if (typeof data.streakDays === 'number') {
            setStreakDays(data.streakDays);
          }
          if (typeof data.xpPoints === 'number') {
            setXpPoints(data.xpPoints);
          }
          if (typeof data.strictLockEnabled === 'boolean') {
            setStrictLockEnabled(data.strictLockEnabled);
          }
          setCloudSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, path);
      }
    );
    return () => unsubDoc();
  }, [currentUser]);

  const triggerCloudBackup = useCallback(
    async (
      nextWeeklyCompleted = weeklyCompletedHours,
      nextWeeklyTarget = weeklyTargetHours,
      nextXp = xpPoints,
      nextStreak = streakDays,
      nextStrict = strictLockEnabled
    ) => {
      if (!currentUser || simulateOffline) return;
      await syncUserProgressToCloud({
        user: currentUser,
        targetExamDate: examProfile.targetExamDate,
        weeklyTargetHours: nextWeeklyTarget,
        weeklyCompletedHours: nextWeeklyCompleted,
        streakDays: nextStreak,
        xpPoints: nextXp,
        completedTopicsCount: metrics.completedTopics,
        strictLockEnabled: nextStrict,
        syllabusPercent: metrics.completionPercentage,
        targetTier: `${examProfile.examName} - ${examProfile.targetPostOrRole}`.slice(0, 40),
      });
      setCloudSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    },
    [
      currentUser,
      simulateOffline,
      weeklyCompletedHours,
      weeklyTargetHours,
      xpPoints,
      streakDays,
      strictLockEnabled,
      metrics.completedTopics,
      metrics.completionPercentage,
      examProfile.targetExamDate,
      examProfile.examName,
      examProfile.targetPostOrRole,
    ]
  );

  const handleGoogleSignIn = async () => {
    setAuthErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result?.user) {
        setCurrentUser(result.user);
        await syncUserProgressToCloud({
          user: result.user,
          targetExamDate: examProfile.targetExamDate,
          weeklyTargetHours,
          weeklyCompletedHours,
          streakDays,
          xpPoints,
          completedTopicsCount: metrics.completedTopics,
          strictLockEnabled,
          syllabusPercent: metrics.completionPercentage,
          targetTier: `${examProfile.examName} - ${examProfile.targetPostOrRole}`.slice(0, 40),
        });
        setCloudSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err: any) {
      setAuthErrorMsg(err?.message || 'Sign-in popup was closed or blocked.');
    }
  };

  const handleSelectExamPreset = (presetId: string) => {
    const applied = applyExamPreset(presetId);
    setExamProfile(applied.profile);
    setTopics(applied.topics);
    setWeeklyTargetHours(applied.profile.weeklyTargetHours);
    triggerCloudBackup(
      weeklyCompletedHours,
      applied.profile.weeklyTargetHours,
      xpPoints,
      streakDays,
      strictLockEnabled
    );
  };

  const handleSaveCustomExamProfile = (
    updatedProfile: ExamProfileConfig,
    newGeneratedTopics?: SyllabusTopic[]
  ) => {
    setExamProfile(updatedProfile);
    setWeeklyTargetHours(updatedProfile.weeklyTargetHours);
    if (newGeneratedTopics && newGeneratedTopics.length > 0) {
      setTopics(newGeneratedTopics);
    }
    triggerCloudBackup(
      weeklyCompletedHours,
      updatedProfile.weeklyTargetHours,
      xpPoints,
      streakDays,
      strictLockEnabled
    );
  };

  const handleCompletePomodoroSession = (durationHours: number, topicId: string, notes: string) => {
    const nextWeekly = Number((weeklyCompletedHours + durationHours).toFixed(1));
    const nextXp = xpPoints + Math.round(durationHours * 160);
    setWeeklyCompletedHours(nextWeekly);
    setDailyCompletedHours((prev) => Number((prev + durationHours).toFixed(1)));
    setXpPoints(nextXp);

    const pyqMatch = (notes || '').match(/\+?(\d+)\s*PYQ/i);
    const pyqAdded = pyqMatch ? parseInt(pyqMatch[1], 10) : Math.round(durationHours * 15);

    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        const newLogged = Number((t.loggedHours + durationHours).toFixed(1));
        const newStatus: TopicStatus =
          newLogged >= t.targetHours ? 'completed' : 'in_progress';
        return {
          ...t,
          loggedHours: newLogged,
          pyqSolved: (t.pyqSolved || 0) + pyqAdded,
          status: newStatus,
          lastStudiedDate: new Date().toISOString().slice(0, 10),
        };
      })
    );

    triggerCloudBackup(nextWeekly, weeklyTargetHours, nextXp, streakDays, strictLockEnabled);
  };

  const handleUpdateTopicStatus = (topicId: string, status: TopicStatus) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        return {
          ...t,
          status,
          loggedHours: status === 'completed' ? t.targetHours : t.loggedHours,
        };
      })
    );
    const nextXp = status === 'completed' ? xpPoints + 120 : xpPoints;
    setXpPoints(nextXp);
    triggerCloudBackup(weeklyCompletedHours, weeklyTargetHours, nextXp, streakDays, strictLockEnabled);
  };

  const handleLogTopicHours = (topicId: string, hoursToAdd: number, pyqToAdd: number) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        const updatedHours = Number((t.loggedHours + hoursToAdd).toFixed(1));
        const updatedStatus: TopicStatus =
          updatedHours >= t.targetHours ? 'completed' : 'in_progress';
        return {
          ...t,
          loggedHours: updatedHours,
          pyqSolved: t.pyqSolved + pyqToAdd,
          status: updatedStatus,
        };
      })
    );
    const nextWeekly = Number((weeklyCompletedHours + hoursToAdd).toFixed(1));
    const nextXp = xpPoints + 100;
    setWeeklyCompletedHours(nextWeekly);
    setDailyCompletedHours((prev) => Number((prev + hoursToAdd).toFixed(1)));
    setXpPoints(nextXp);
    triggerCloudBackup(nextWeekly, weeklyTargetHours, nextXp, streakDays, strictLockEnabled);
  };

  const handleAddCustomTopic = (
    subjectId: SubjectId,
    subjectName: string,
    title: string,
    targetHours: number,
    tier: string
  ) => {
    const newTopic: SyllabusTopic = {
      id: `${subjectId}-${Date.now()}`,
      subjectId,
      subjectName,
      tier,
      title,
      targetHours,
      loggedHours: 0,
      status: 'not_started',
      pyqSolved: 0,
    };
    setTopics((prev) => [newTopic, ...prev]);
  };

  const handleAddBlockedApp = (
    name: string,
    domain: string,
    category: BlockedAppItem['category']
  ) => {
    const item: BlockedAppItem = {
      id: `blk-${Date.now()}`,
      name,
      domain,
      category,
      blockedDuringFocus: true,
      blockedOnWeeklyDeficit: true,
      interceptCount: 0,
    };
    setBlockedApps((prev) => [item, ...prev]);
  };

  const handleSimulateIntercept = (appId: string) => {
    setBlockedApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, interceptCount: a.interceptCount + 1 } : a))
    );
  };

  return (
    <div
      data-theme={themeVariant}
      data-testid="app-theme-root"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col transition-colors duration-150"
    >
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950">
        {/* Zone 1: Brand Title, single text element */}
        <a
          href="#command"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('command');
          }}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 font-display"
        >
          Sankalp Exam Command
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav aria-label="Primary Workspace Navigation" className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a
            href="#command"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('command');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'command' ? 'text-white border-b-2 border-amber-500' : ''
            }`}
          >
            Command Hub
          </a>
          <a
            href="#syllabus"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('syllabus');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'syllabus' ? 'text-white border-b-2 border-amber-500' : ''
            }`}
          >
            Syllabus Ledger
          </a>
          <a
            href="#ailab"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('ailab');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'ailab' ? 'text-white border-b-2 border-amber-500' : ''
            }`}
          >
            AI Quiz Lab
          </a>
          <a
            href="#analytics"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('analytics');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'analytics' ? 'text-white border-b-2 border-amber-500' : ''
            }`}
          >
            Calendar & Analytics
          </a>
          <a
            href="#community"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('community');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'community' ? 'text-white border-b-2 border-amber-500' : ''
            }`}
          >
            Peer Community
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action (Sign in with Google / Cloud Sync) */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <button
              type="button"
              onClick={() => triggerCloudBackup()}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Sync Cloud Backup
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </header>

      {/* Desktop Workspace Shell: Sidebar + Contextual Toolbar + Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1440px] w-full mx-auto">
        {/* Left Sidebar Navigation (250px on Desktop) */}
        <aside className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950 p-4 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            {/* Active Exam Switcher & Customizer Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400">Active Target Exam</span>
                <button
                  type="button"
                  onClick={() => setCustomizerOpen(true)}
                  className="text-xs text-slate-300 hover:text-white underline"
                >
                  Customize
                </button>
              </div>
              <div className="text-xs font-bold text-white truncate" data-testid="active-exam-name">
                {examProfile.examName}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {examProfile.targetPostOrRole}
              </div>
              <button
                type="button"
                onClick={() => setCustomizerOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
              >
                <Sliders className="w-3.5 h-3.5 shrink-0" />
                <span>Switch / Customize Exam</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="px-3 py-1 text-xs font-semibold text-slate-400">
                {uiLang === 'hi' ? 'अध्ययन कार्यक्षेत्र' : 'Preparation Modules'}
              </div>
              {(
                [
                  { id: 'command', label: uiLang === 'hi' ? 'कमांड हब और पोमोडोरो' : 'Command Hub & Blocker', icon: LayoutDashboard },
                  { id: 'syllabus', label: uiLang === 'hi' ? 'सिलेबस ट्रैकर (पूर्ण/शेष)' : 'Syllabus Completed / Left', icon: BookOpen },
                  { id: 'ailab', label: uiLang === 'hi' ? 'एआई क्विज़ और अनुवाद' : 'AI Quiz & Note Translator', icon: Sparkles },
                  { id: 'analytics', label: uiLang === 'hi' ? 'कैलेंडर और एनालिटिक्स' : 'Calendar & Analytics', icon: Calendar },
                  { id: 'community', label: uiLang === 'hi' ? 'लीडरबोर्ड और अध्ययन समूह' : 'Leaderboards & Groups', icon: Users },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mood-Adaptive Theme Studio (6 Moods) — Placed above the fold in sidebar */}
            <div
              data-testid="theme-toggle-group"
              className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2"
            >
              <div className="flex items-center justify-between text-xs px-0.5">
                <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
                  <Contrast className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Mood Themes</span>
                </span>
                <span
                  data-testid="active-theme-contrast-label"
                  className="text-[10px] font-mono tabular-nums text-amber-400"
                >
                  {activeThemeConfig.contrastRatioLabel.split(' ')[1]}
                </span>
              </div>

              <div
                data-testid="active-theme-mood-banner"
                className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px]"
              >
                <span className="text-slate-400 truncate">
                  Mood: <strong className="text-white">{activeThemeConfig.mood}</strong>
                </span>
                <span className="font-mono text-[10px] text-amber-400 shrink-0">
                  {activeThemeConfig.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
                {THEME_LIST.map((theme) => {
                  const isSelected = themeVariant === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      data-testid={`theme-btn-${theme.id}`}
                      aria-pressed={isSelected}
                      title={`${theme.label} — ${theme.mood} (${theme.subtitle})`}
                      onClick={() => setThemeVariant(theme.id)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-semibold'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-xs shrink-0 border ${
                          isSelected ? 'border-slate-950/60' : 'border-white/25'
                        } ${THEME_SWATCH_CLASSES[theme.id]}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] leading-tight truncate">
                          {theme.label}
                        </span>
                        <span
                          className={`block text-[9px] leading-tight truncate ${
                            isSelected ? 'text-slate-950/80 font-medium' : 'text-slate-400'
                          }`}
                        >
                          {theme.mood}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cloud Sync, Offline Mode Toggle, Language Switch & PWA Install */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cloud Sync</span>
                </span>
                <span className="font-mono tabular-nums text-slate-300">
                  {currentUser ? cloudSyncedAt || 'Live' : 'Local Mode'}
                </span>
              </div>
              {currentUser && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-300 truncate max-w-[140px]">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    aria-label="Sign out"
                    className="text-slate-400 hover:text-rose-400 p-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setUiLang((prev) => (prev === 'en' ? 'hi' : 'en'))}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 transition-colors whitespace-nowrap"
              >
                <span className="flex items-center gap-2 shrink-0">
                  <Languages className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>UI Language</span>
                </span>
                <span className="font-mono shrink-0">{uiLang === 'en' ? 'EN / HI' : 'HI / EN'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSimulateOffline((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 transition-colors whitespace-nowrap"
              >
                <span className="flex items-center gap-2">
                  {simulateOffline ? (
                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>Offline Access Mode</span>
                </span>
                <span className="font-mono">{simulateOffline ? 'OFFLINE' : 'ONLINE'}</span>
              </button>

              <PWAInstallButton />
            </div>
          </div>
        </aside>

        {/* Main Workspace Viewport */}
        <main className="flex-1 p-6 overflow-y-auto">
          {authErrorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
              <span>{authErrorMsg}</span>
              <button
                type="button"
                onClick={() => setAuthErrorMsg(null)}
                className="text-amber-400 hover:underline ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Contextual Workspace Breadcrumb & Status Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs text-slate-400">
                Active Exam Profile: <strong className="text-amber-400">{examProfile.examName}</strong> · Target Role: {examProfile.targetPostOrRole} · Exam Date: {examProfile.targetExamDate}
              </div>
              <h1 className="text-2xl font-bold text-white mt-0.5 font-display">
                {activeTab === 'command' && (uiLang === 'hi' ? 'कमांड सेंटर और फोकस ब्लॉकर' : `${examProfile.examName} Command Center & Focus Shield`)}
                {activeTab === 'syllabus' && (uiLang === 'hi' ? 'पाठ्यक्रम प्रगति ट्रैकर' : `${examProfile.examName} Syllabus Completed vs Left`)}
                {activeTab === 'ailab' && (uiLang === 'hi' ? 'एआई मॉक टेस्ट और क्षेत्रीय भाषा अनुवादक' : 'AI Mock Quiz Generator & Multi-Language Note Studio')}
                {activeTab === 'analytics' && (uiLang === 'hi' ? 'प्रगति एनालिटिक्स और गूगल कैलेंडर सिंक' : 'Progress Analytics & Google Calendar Scheduler')}
                {activeTab === 'community' && (uiLang === 'hi' ? 'अखिल भारतीय लीडरबोर्ड और अध्ययन समूह' : 'Peer Comparison Leaderboard & Study Groups')}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                data-testid="header-mood-cycle-btn"
                onClick={() => {
                  const currentIndex = THEME_LIST.findIndex((t) => t.id === themeVariant);
                  const nextTheme = THEME_LIST[(currentIndex + 1) % THEME_LIST.length];
                  setThemeVariant(nextTheme.id);
                }}
                title="Click to cycle through study mood themes"
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span
                  className={`w-2.5 h-2.5 rounded-xs shrink-0 border border-white/25 ${THEME_SWATCH_CLASSES[themeVariant]}`}
                />
                <span>
                  Mood: <strong className="text-amber-400">{activeThemeConfig.label}</strong> ({activeThemeConfig.mood})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCustomizerOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Sliders className="w-3.5 h-3.5 shrink-0" />
                <span>Customize Exam & Syllabus</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-lg whitespace-nowrap shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono tabular-nums">
                  Syllabus: {metrics.completionPercentage}% Done · {metrics.remainingPercentage}% Left
                </span>
              </div>
            </div>
          </div>

          {activeTab === 'command' && (
            <CommandHubView
              examProfile={examProfile}
              metrics={metrics}
              topics={topics}
              dailyCompletedHours={dailyCompletedHours}
              weeklyTargetHours={weeklyTargetHours}
              weeklyCompletedHours={weeklyCompletedHours}
              onUpdateWeeklyTarget={(hrs) => {
                setWeeklyTargetHours(hrs);
                triggerCloudBackup(weeklyCompletedHours, hrs, xpPoints, streakDays, strictLockEnabled);
              }}
              strictLockEnabled={strictLockEnabled}
              onToggleStrictLock={() => {
                const next = !strictLockEnabled;
                setStrictLockEnabled(next);
                triggerCloudBackup(weeklyCompletedHours, weeklyTargetHours, xpPoints, streakDays, next);
              }}
              enforcementState={enforcementState}
              blockedApps={blockedApps}
              onAddBlockedApp={handleAddBlockedApp}
              onSimulateIntercept={handleSimulateIntercept}
              onCompletePomodoroSession={handleCompletePomodoroSession}
              streakDays={streakDays}
              xpPoints={xpPoints}
              badges={badges}
              uiLang={uiLang}
            />
          )}

          {activeTab === 'syllabus' && (
            <SyllabusTrackerView
              examProfile={examProfile}
              topics={topics}
              metrics={metrics}
              onUpdateTopicStatus={handleUpdateTopicStatus}
              onLogTopicHours={handleLogTopicHours}
              onAddCustomTopic={handleAddCustomTopic}
              onOpenExamCustomizer={() => setCustomizerOpen(true)}
            />
          )}

          {activeTab === 'ailab' && (
            <AIStudyLabView
              onEarnQuizXP={(earned) => {
                const nextXp = xpPoints + earned;
                setXpPoints(nextXp);
                triggerCloudBackup(weeklyCompletedHours, weeklyTargetHours, nextXp, streakDays, strictLockEnabled);
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsScheduleView
              metrics={metrics}
              weeklyTargetHours={weeklyTargetHours}
              weeklyCompletedHours={weeklyCompletedHours}
              dailyCompletedHours={dailyCompletedHours}
              dailyGoalHours={examProfile.dailyGoalHours}
              isSignedInWithGoogle={Boolean(currentUser)}
              onRequestGoogleSignIn={handleGoogleSignIn}
            />
          )}

          {activeTab === 'community' && (
            <PeerCommunityView
              currentUser={currentUser}
              userXp={xpPoints}
              userStreak={streakDays}
              userWeeklyHours={weeklyCompletedHours}
              userSyllabusPct={metrics.completionPercentage}
              onRequestSignIn={handleGoogleSignIn}
            />
          )}
        </main>
      </div>

      <ExamCustomizerModal
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        currentProfile={examProfile}
        onSelectPreset={handleSelectExamPreset}
        onSaveCustomProfile={handleSaveCustomExamProfile}
        activeTheme={themeVariant}
        onChangeTheme={setThemeVariant}
      />

      <OfflineBanner simulateOffline={simulateOffline} />
    </div>
  );
}
