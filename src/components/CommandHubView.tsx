import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Zap,
  CalendarClock,
  Headphones,
  Volume2,
  Radio,
  Cpu,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import {
  SyllabusMetrics,
  SyllabusTopic,
  BlockedAppItem,
  WeeklyEnforcementState,
  BadgeItem,
  ExamProfileConfig,
  calculateDailyRadialProgress,
  computeSmartFocusTopic,
  FocusAudioCategory,
  FocusAudioTrack,
  FOCUS_AUDIO_TRACKS,
  getFocusAudioTracksByCategory,
  LocalAIModelMode,
  LOCAL_AI_MODES,
  LocalAIPerformanceSuggestion,
  runSankalpLocalAIModel,
} from '../utils/sscLogic';

interface CommandHubViewProps {
  examProfile: ExamProfileConfig;
  metrics: SyllabusMetrics;
  topics: SyllabusTopic[];
  dailyCompletedHours: number;
  weeklyTargetHours: number;
  weeklyCompletedHours: number;
  onUpdateWeeklyTarget: (hours: number) => void;
  strictLockEnabled: boolean;
  onToggleStrictLock: () => void;
  enforcementState: WeeklyEnforcementState;
  blockedApps: BlockedAppItem[];
  onAddBlockedApp: (name: string, domain: string, category: BlockedAppItem['category']) => void;
  onSimulateIntercept: (appId: string) => void;
  onCompletePomodoroSession: (durationHours: number, topicId: string, notes: string) => void;
  streakDays: number;
  xpPoints: number;
  badges: BadgeItem[];
  uiLang: 'en' | 'hi';
}

export const CommandHubView: React.FC<CommandHubViewProps> = ({
  examProfile,
  metrics,
  topics,
  dailyCompletedHours,
  weeklyTargetHours,
  weeklyCompletedHours,
  onUpdateWeeklyTarget,
  strictLockEnabled,
  onToggleStrictLock,
  enforcementState,
  blockedApps,
  onAddBlockedApp,
  onSimulateIntercept,
  onCompletePomodoroSession,
  streakDays,
  xpPoints,
  badges,
  uiLang,
}) => {
  const dailyRadial = calculateDailyRadialProgress(
    dailyCompletedHours,
    examProfile.dailyGoalHours || 5,
    46
  );

  const smartFocus = useMemo(
    () => computeSmartFocusTopic(topics, examProfile.targetExamDate),
    [topics, examProfile.targetExamDate]
  );

  // Pomodoro Timer State
  const [pomoMode, setPomoMode] = useState<'focus25' | 'deep50' | 'break10'>('deep50');
  const sprintMins = examProfile.pomodoroFocusMinutes || 25;
  const deepMins = examProfile.pomodoroDeepMinutes || 50;
  const modeSeconds =
    pomoMode === 'focus25' ? sprintMins * 60 : pomoMode === 'deep50' ? deepMins * 60 : 10 * 60;
  const [secondsLeft, setSecondsLeft] = useState<number>(modeSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(topics[0]?.id || 'quant-1');
  const [sessionNote, setSessionNote] = useState<string>('');
  const [interceptBanner, setInterceptBanner] = useState<string | null>(null);

  // Focus Audio State (Ambient Lo-Fi Playlists & White Noise Soundscapes)
  const [audioCategory, setAudioCategory] = useState<FocusAudioCategory>('lofi');
  const [activeTrackId, setActiveTrackId] = useState<string>('lofi-late-night');
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioVolume, setAudioVolume] = useState<number>(65);
  const [autoPlayWithPomo, setAutoPlayWithPomo] = useState<boolean>(true);

  const categoryTracks = useMemo(
    () => getFocusAudioTracksByCategory(audioCategory),
    [audioCategory]
  );

  const activeTrack: FocusAudioTrack = useMemo(
    () =>
      FOCUS_AUDIO_TRACKS.find((t) => t.id === activeTrackId) ||
      categoryTracks[0] ||
      FOCUS_AUDIO_TRACKS[0],
    [activeTrackId, categoryTracks]
  );

  // Web Audio API Synthesizer Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const stopWebAudioEngine = useCallback(() => {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {
        // ignore close error
      }
      audioCtxRef.current = null;
      masterGainRef.current = null;
    }
  }, []);

  const startWebAudioEngine = useCallback(
    (track: FocusAudioTrack, volPct: number) => {
      stopWebAudioEngine();
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const masterGain = ctx.createGain();
        masterGain.gain.value = Math.max(0.01, Math.min(1, volPct / 100)) * 0.18;
        masterGain.connect(ctx.destination);

        // Create subtle filtered noise bed (vinyl texture or white/brown/pink noise)
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (track.synthProfile === 'deep-brown-noise') {
            output[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = output[i];
            output[i] *= 3.0;
          } else {
            output[i] = white * (track.category === 'lofi' ? 0.15 : 0.65);
          }
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value =
          track.synthProfile === 'deep-brown-noise'
            ? 240
            : track.synthProfile === 'library-pink-rain'
            ? 650
            : track.synthProfile === 'pure-white-noise'
            ? 1800
            : 420;

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start(0);

        // If Lo-Fi category, layer warm detuned sine/triangle chord oscillators
        if (track.category === 'lofi') {
          const chordFreqs =
            track.synthProfile === 'warm-lofi-pad'
              ? [220, 261.63, 329.63, 392.0] // Am7 warm Rhodes pad
              : track.synthProfile === 'rain-vinyl-lofi'
              ? [196.0, 246.94, 293.66, 349.23] // Gmaj7/F tape chord
              : [216.0, 256.0, 324.0]; // 432Hz harmonic alpha drone

          chordFreqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.value = freq;
            oscGain.gain.value = 0.16 / chordFreqs.length;
            osc.connect(oscGain);
            oscGain.connect(masterGain);
            osc.start(0);
          });
        }

        audioCtxRef.current = ctx;
        masterGainRef.current = masterGain;
      } catch {
        // Web Audio may be blocked in headless or restricted environments; UI state still updates cleanly
      }
    },
    [stopWebAudioEngine]
  );

  useEffect(() => {
    if (isAudioPlaying) {
      startWebAudioEngine(activeTrack, audioVolume);
    } else {
      stopWebAudioEngine();
    }
    return () => {
      stopWebAudioEngine();
    };
  }, [isAudioPlaying, activeTrack, startWebAudioEngine, stopWebAudioEngine]);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = Math.max(0.01, Math.min(1, audioVolume / 100)) * 0.18;
    }
  }, [audioVolume]);

  const handleSelectAudioCategory = (cat: FocusAudioCategory) => {
    setAudioCategory(cat);
    const tracks = getFocusAudioTracksByCategory(cat);
    if (tracks.length > 0) {
      setActiveTrackId(tracks[0].id);
    }
  };

  // Add Blocked App Form
  const [newAppName, setNewAppName] = useState('');
  const [newAppDomain, setNewAppDomain] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<BlockedAppItem['category']>('Entertainment');

  // Quick Manual Study Log Form
  const [quickHours, setQuickHours] = useState<string>('1.5');

  // Sankalp On-Device Local AI Performance Model State
  const [localAIMode, setLocalAIMode] = useState<LocalAIModelMode>('balanced');
  const [simulatedExtraHours, setSimulatedExtraHours] = useState<number>(1.0);
  const [appliedSuggestionFeedback, setAppliedSuggestionFeedback] = useState<string | null>(null);

  const localAIReport = useMemo(
    () =>
      runSankalpLocalAIModel({
        topics,
        metrics,
        dailyCompletedHours,
        dailyGoalHours: examProfile.dailyGoalHours || 5,
        weeklyCompletedHours,
        weeklyTargetHours,
        streakDays,
        targetExamDate: examProfile.targetExamDate,
        mode: localAIMode,
        simulatedExtraDailyHours: simulatedExtraHours,
      }),
    [
      topics,
      metrics,
      dailyCompletedHours,
      examProfile.dailyGoalHours,
      examProfile.targetExamDate,
      weeklyCompletedHours,
      weeklyTargetHours,
      streakDays,
      localAIMode,
      simulatedExtraHours,
    ]
  );

  const handleApplyLocalAISuggestion = (sug: LocalAIPerformanceSuggestion) => {
    if (sug.actionType === 'start_focus_topic' && sug.targetTopicId) {
      const targetTopic = topics.find((t) => t.id === sug.targetTopicId);
      const targetMode = sug.recommendedPomoMode || 'deep50';
      const targetSecs = targetMode === 'deep50' ? deepMins * 60 : sprintMins * 60;
      setSelectedTopicId(sug.targetTopicId);
      setPomoMode(targetMode);
      setSecondsLeft(targetSecs);
      setSessionNote(`Local AI Focus Prescription: ${targetTopic?.title || sug.title}`);
      setIsRunning(true);
      if (autoPlayWithPomo) {
        setIsAudioPlaying(true);
      }
      setAppliedSuggestionFeedback(
        `Applied to Focus Timer: Started ${targetMode === 'deep50' ? `${deepMins}m` : `${sprintMins}m`} session on "${targetTopic?.title || sug.title}".`
      );
    } else if (sug.actionType === 'log_pyq_sprint' && sug.targetTopicId) {
      const targetTopic = topics.find((t) => t.id === sug.targetTopicId);
      const hrs = sug.recommendedHours || 1.0;
      setSelectedTopicId(sug.targetTopicId);
      onCompletePomodoroSession(
        hrs,
        sug.targetTopicId,
        `Local AI Timed PYQ Speed Drill (+25 PYQs) on ${targetTopic?.title || 'Target Module'}`
      );
      setAppliedSuggestionFeedback(
        `Logged +${hrs.toFixed(1)}h Timed PYQ Drill (+25 PYQs) for "${targetTopic?.title || sug.title}". Readiness telemetry updated!`
      );
    } else if (sug.actionType === 'calibrate_weekly_target' && sug.recommendedWeeklyTarget) {
      onUpdateWeeklyTarget(sug.recommendedWeeklyTarget);
      setAppliedSuggestionFeedback(
        `Calibrated Weekly Mandate to ${sug.recommendedWeeklyTarget}h/wk based on Local AI trajectory.`
      );
    }
  };

  // AI Schedule Adjustment Advisor
  const [scheduleAdvice, setScheduleAdvice] = useState<{
    summary: string;
    adjustments: { slot: string; subject: string; action: string }[];
  } | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    setSecondsLeft(modeSeconds);
    setIsRunning(false);
  }, [sprintMins, deepMins]);

  const handleSwitchPomoMode = (nextMode: 'focus25' | 'deep50' | 'break10') => {
    setPomoMode(nextMode);
    const nextSecs =
      nextMode === 'focus25' ? sprintMins * 60 : nextMode === 'deep50' ? deepMins * 60 : 10 * 60;
    setSecondsLeft(nextSecs);
    setIsRunning(false);
  };

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          const hoursEarned = pomoMode === 'deep50' ? 0.85 : pomoMode === 'focus25' ? 0.45 : 0;
          if (hoursEarned > 0) {
            onCompletePomodoroSession(hoursEarned, selectedTopicId, sessionNote || 'Completed Pomodoro focus block');
          }
          return modeSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, modeSeconds, onCompletePomodoroSession, pomoMode, selectedTopicId, sessionNote]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStartSmartFocusPomodoro = () => {
    if (!smartFocus) return;
    const targetMode = smartFocus.recommendedPomoMode;
    const targetSecs = targetMode === 'deep50' ? deepMins * 60 : sprintMins * 60;
    setSelectedTopicId(smartFocus.topic.id);
    setPomoMode(targetMode);
    setSecondsLeft(targetSecs);
    setSessionNote(`Smart Focus Block: ${smartFocus.topic.title}`);
    setIsRunning(true);
    if (autoPlayWithPomo) {
      setIsAudioPlaying(true);
    }
  };

  const handleLogQuickSession = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(quickHours);
    if (isNaN(parsed) || parsed <= 0 || parsed > 16) return;
    onCompletePomodoroSession(parsed, selectedTopicId, sessionNote || 'Logged focused study session');
    setSessionNote('');
  };

  const handleAddBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppDomain.trim()) return;
    onAddBlockedApp(newAppName.trim(), newAppDomain.trim(), newAppCategory);
    setNewAppName('');
    setNewAppDomain('');
  };

  const handleTestEntertainmentAccess = (app: BlockedAppItem) => {
    if (enforcementState.entertainmentBlocked || isRunning) {
      onSimulateIntercept(app.id);
      setInterceptBanner(
        isRunning
          ? `Blocked "${app.name}" (${app.domain}): Active Pomodoro Focus Shield is running.`
          : `Blocked "${app.name}" (${app.domain}): Weekly Target incomplete (${enforcementState.deficitHours}h deficit remaining). Finish your weekly target to unlock entertainment apps!`
      );
    } else {
      setInterceptBanner(`"${app.name}" is currently accessible because your weekly study target is fulfilled.`);
    }
  };

  const fetchScheduleSuggestions = async () => {
    setLoadingAdvice(true);
    try {
      const res = await fetch('/api/gemini/schedule-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectBreakdown: metrics.subjectStats,
          weeklyHours: weeklyCompletedHours,
          weeklyTarget: weeklyTargetHours,
          completedTopics: metrics.completedTopics,
          totalTopics: metrics.totalTopics,
        }),
      });
      const data = await res.json();
      if (data && data.summary) {
        setScheduleAdvice(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdvice(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top 4-KPI Strip */}
      <section aria-label="Preparation Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">
            {uiLang === 'hi' ? 'पाठ्यक्रम पूर्ण बनाम शेष' : 'Syllabus Completed vs Left'}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-white" data-testid="kpi-syllabus-completed">
              {metrics.completionPercentage}% Done
            </span>
            <span className="text-xs font-mono tabular-nums text-amber-400">
              {metrics.remainingPercentage}% Left
            </span>
          </div>
          <div className="mt-3 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-transform duration-200 origin-left"
              style={{ width: `${metrics.completionPercentage}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono tabular-nums">
            {metrics.completedTopics}/{metrics.totalTopics} Modules · {metrics.totalLoggedHours}h / {metrics.totalTargetHours}h
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">
            {uiLang === 'hi' ? 'साप्ताहिक अध्ययन लक्ष्य' : 'Weekly Study Mandate'}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-white" data-testid="kpi-weekly-hours">
              {weeklyCompletedHours.toFixed(1)}h / {weeklyTargetHours}h
            </span>
            <span className={`text-xs font-mono tabular-nums ${enforcementState.isDeficit ? 'text-amber-400' : 'text-emerald-400'}`}>
              {enforcementState.isDeficit ? `${enforcementState.deficitHours}h Deficit` : 'Target Met'}
            </span>
          </div>
          <div className="mt-3 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-transform duration-200 origin-left ${enforcementState.isDeficit ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${enforcementState.progressPercent}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {enforcementState.entertainmentBlocked ? 'Entertainment Apps Locked' : 'Entertainment Unlocked'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">
            {uiLang === 'hi' ? 'दैनिक स्ट्रीक और एक्सपी' : 'Daily Study Streak & XP'}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-400" data-testid="kpi-streak">
              {streakDays} Days
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-300">
              {xpPoints.toLocaleString()} XP
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 truncate">
            Goal: <strong className="text-slate-200">{examProfile.targetPostOrRole}</strong>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
            {badges.filter((b) => b.unlocked).length}/{badges.length} Mastery Badges Earned
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">
            {uiLang === 'hi' ? 'डिस्ट्रैक्शन शील्ड स्थिति' : 'Distraction Blocker Status'}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-bold text-white flex items-center gap-2">
              {enforcementState.entertainmentBlocked || isRunning ? (
                <>
                  <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Quarantine Active</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Standby Shield</span>
                </>
              )}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 font-mono tabular-nums">
            {blockedApps.length} Apps Monitored · {blockedApps.reduce((a, b) => a + b.interceptCount, 0)} Intercepts
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Auto-locks if weekly target &lt; {weeklyTargetHours}h
          </div>
        </div>
      </section>

      {/* Main 2-Column Split: Pomodoro & Quick Session Logger vs Weekly Target Entertainment Blocker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Pomodoro Timer & Study Hour Logger */}
        <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  01. Pomodoro Focus & Study Session Logger
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synchronizes study hours directly with your {examProfile.examName} syllabus topics
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSwitchPomoMode('focus25')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    pomoMode === 'focus25' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sprintMins}m Sprint
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchPomoMode('deep50')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    pomoMode === 'deep50' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {deepMins}m Deep Work
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchPomoMode('break10')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    pomoMode === 'break10' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  10m Rest
                </button>
              </div>
            </div>

            {/* Hardware-inspired Timer Readout + Daily Goal SVG Radial Progress Chart */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              <div className="md:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400">
                    {isRunning
                      ? 'Focus Shield Engaged — All Distractions Blocked'
                      : `Ready to Start ${examProfile.examName} Study Block`}
                  </div>
                  <div
                    className="text-4xl sm:text-5xl font-bold font-mono tabular-nums tracking-tight text-white mt-1.5"
                    data-testid="pomodoro-clock"
                  >
                    {formatTimer(secondsLeft)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
                    Reward: +{pomoMode === 'deep50' ? '150 XP' : pomoMode === 'focus25' ? '75 XP' : '0 XP'} on completion
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRunning((prev) => !prev)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0"
                  >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isRunning ? 'Pause Timer' : 'Start Focus Timer'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRunning(false);
                      setSecondsLeft(modeSeconds);
                    }}
                    aria-label="Reset Pomodoro Timer"
                    className="p-2 text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SVG Radial Progress Chart: Daily Study Hour Goal vs Actual Progress */}
              <div
                className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-4"
                data-testid="daily-radial-progress-card"
              >
                <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                  <svg
                    className="w-28 h-28 -rotate-90"
                    viewBox="0 0 112 112"
                    role="img"
                    aria-label={`Daily study goal progress: ${dailyRadial.dailyCompletedHours} of ${dailyRadial.dailyGoalHours} hours (${dailyRadial.percentage}%)`}
                  >
                    {/* Background Track Circle */}
                    <circle
                      cx="56"
                      cy="56"
                      r={dailyRadial.radius}
                      fill="none"
                      stroke="#1E293B"
                      strokeWidth="10"
                    />
                    {/* Dynamic Progress Arc Path */}
                    <circle
                      cx="56"
                      cy="56"
                      r={dailyRadial.radius}
                      fill="none"
                      stroke={dailyRadial.isGoalMet ? '#10B981' : '#F59E0B'}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={dailyRadial.circumference}
                      strokeDashoffset={dailyRadial.strokeDashoffset}
                      data-testid="daily-radial-arc"
                      style={{ transition: 'stroke-dashoffset 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span
                      className="text-lg font-bold font-mono tabular-nums text-white"
                      data-testid="daily-radial-percent"
                    >
                      {dailyRadial.percentage}%
                    </span>
                    <span
                      className="text-[11px] font-mono tabular-nums text-slate-400"
                      data-testid="daily-radial-hours"
                    >
                      {dailyRadial.dailyCompletedHours}h/{dailyRadial.dailyGoalHours}h
                    </span>
                  </div>
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="text-xs font-semibold text-white">
                    {uiLang === 'hi' ? 'दैनिक लक्ष्य प्रगति' : 'Daily Goal Progress'}
                  </div>
                  <div className="text-xs font-mono tabular-nums text-amber-400">
                    {dailyRadial.dailyCompletedHours}h logged today
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">
                    {dailyRadial.isGoalMet
                      ? `Daily ${dailyRadial.dailyGoalHours}h goal achieved!`
                      : `${dailyRadial.remainingDailyHours}h left to reach today's ${dailyRadial.dailyGoalHours}h target.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Smart Focus Engine: Automatic High-Priority Uncompleted Topic Recommendation */}
            {smartFocus && (
              <div
                data-testid="smart-focus-card"
                className="mt-4 bg-slate-950 border border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Smart Focus Recommendation</span>
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-rose-300 bg-rose-950/60 border border-rose-800/60 rounded px-2 py-0.5">
                      {smartFocus.urgencyLevel}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono tabular-nums text-slate-400">
                      <CalendarClock className="w-3 h-3 text-slate-500" />
                      <span>{smartFocus.daysUntilExam}d to Exam</span>
                    </span>
                  </div>

                  <div
                    data-testid="smart-focus-topic-title"
                    className="text-sm font-semibold text-white truncate"
                  >
                    [{smartFocus.topic.subjectName}] {smartFocus.topic.title}
                  </div>

                  <p className="text-xs text-slate-400 leading-snug">
                    {smartFocus.rationale}
                  </p>
                </div>

                <button
                  type="button"
                  data-testid="start-smart-focus-btn"
                  onClick={handleStartSmartFocusPomodoro}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {isRunning && selectedTopicId === smartFocus.topic.id
                      ? 'Smart Focus Running'
                      : `Start ${smartFocus.recommendedPomoMode === 'deep50' ? `${deepMins}m` : `${sprintMins}m`} Pomodoro`}
                  </span>
                </button>
              </div>
            )}

            {/* Active Topic Selector & Manual Study Hours Log */}
            <form onSubmit={handleLogQuickSession} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="active-topic-select" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target {examProfile.examName} Syllabus Topic
                  </label>
                  <select
                    id="active-topic-select"
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.subjectName}] {t.title} ({t.loggedHours}h/{t.targetHours}h)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="quick-hours-input" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Log Study Hours
                  </label>
                  <input
                    id="quick-hours-input"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="16"
                    value={quickHours}
                    onChange={(e) => setQuickHours(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex-1">
                  <label htmlFor="session-note-input" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Session Milestone / PYQ Count Note
                  </label>
                  <input
                    id="session-note-input"
                    type="text"
                    placeholder="e.g. Solved 45 Kiran PYQs on Geometry Circle Chords"
                    value={sessionNote}
                    onChange={(e) => setSessionNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Log Study Hours
                </button>
              </div>
            </form>

            {/* Focus Audio Deck: Ambient Lo-Fi Playlists & White Noise Soundscapes */}
            <div
              data-testid="focus-audio-section"
              className="mt-5 pt-5 border-t border-slate-800 space-y-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-semibold text-white">
                      Focus Audio · Deep Work Soundscapes
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Toggle ambient lo-fi study playlists or acoustic white/brown noise during Pomodoro blocks
                    </p>
                  </div>
                </div>

                {/* Category Switcher: Lo-Fi Playlists vs White Noise */}
                <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    data-testid="focus-audio-tab-lofi"
                    onClick={() => handleSelectAudioCategory('lofi')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      audioCategory === 'lofi'
                        ? 'bg-amber-500 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Ambient Lo-Fi Playlists
                  </button>
                  <button
                    type="button"
                    data-testid="focus-audio-tab-whitenoise"
                    onClick={() => handleSelectAudioCategory('whitenoise')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      audioCategory === 'whitenoise'
                        ? 'bg-amber-500 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    White &amp; Brown Noise
                  </button>
                </div>
              </div>

              {/* Track Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {categoryTracks.map((track) => {
                  const isSelected = track.id === activeTrack.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      data-testid={`focus-audio-track-${track.id}`}
                      onClick={() => {
                        setActiveTrackId(track.id);
                        setIsAudioPlaying(true);
                      }}
                      aria-pressed={isSelected}
                      className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-950 border-amber-500/60 ring-1 ring-amber-400/50 text-white'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xs font-semibold text-white truncate">
                            {track.title}
                          </span>
                          {isSelected && isAudioPlaying && (
                            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {track.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono tabular-nums pt-1 border-t border-slate-800/80">
                        <span className="text-amber-400">{track.bpmOrFreq}</span>
                        <span className="text-slate-500">
                          {isSelected && isAudioPlaying ? 'Playing' : 'Select'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Audio Transport Bar: Play/Pause, Active Track Info, Volume & Auto-Sync */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    data-testid="focus-audio-play-toggle"
                    onClick={() => setIsAudioPlaying((prev) => !prev)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isAudioPlaying
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}
                  >
                    {isAudioPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause Audio</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Audio</span>
                      </>
                    )}
                  </button>

                  <div className="min-w-0">
                    <div
                      data-testid="focus-audio-active-label"
                      className="text-xs font-semibold text-white truncate"
                    >
                      {activeTrack.title}{' '}
                      <span className="text-slate-400 font-normal">
                        ({isAudioPlaying ? 'Streaming Synth' : 'Standby'})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Best for: {activeTrack.recommendedFor}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="range"
                      aria-label="Focus Audio Volume"
                      data-testid="focus-audio-volume"
                      min="0"
                      max="100"
                      value={audioVolume}
                      onChange={(e) => setAudioVolume(Number(e.target.value))}
                      className="w-20 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono tabular-nums text-slate-300 w-8">
                      {audioVolume}%
                    </span>
                  </div>

                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoPlayWithPomo}
                      onChange={(e) => setAutoPlayWithPomo(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Auto-start with Pomodoro</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Subject-wise Syllabus Completion vs Left Bars */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-300 mb-3">
              Subject-Wise Syllabus Completed vs Remaining Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(metrics.subjectStats).map(([sid, stat]) => (
                <div key={sid} className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200 truncate">{stat.subjectName}</span>
                    <span className="font-mono tabular-nums text-slate-400">
                      {stat.percentHours}% ({stat.loggedHours}h/{stat.targetHours}h)
                    </span>
                  </div>
                  <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${stat.percentHours}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Strict Distraction Blocker & Weekly Target Entertainment Lockdown */}
        <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  02. Entertainment Lockdown & Focus Blocker
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automatically blocks entertainment apps if weekly study target is unfinished
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleStrictLock}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                  strictLockEnabled
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {strictLockEnabled ? 'Strict Lock: ON' : 'Strict Lock: OFF'}
              </button>
            </div>

            {/* Weekly Target Enforcement Callout */}
            <div
              className={`mt-4 rounded-xl p-4 border ${
                enforcementState.entertainmentBlocked
                  ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                  : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
              }`}
              data-testid="entertainment-lock-banner"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {enforcementState.entertainmentBlocked ? (
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span>{enforcementState.statusMessage}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
                <label htmlFor="weekly-target-input" className="text-xs text-slate-300">
                  Weekly Target Mandate (Hours):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="weekly-target-input"
                    type="number"
                    min="5"
                    max="100"
                    value={weeklyTargetHours}
                    onChange={(e) => onUpdateWeeklyTarget(Number(e.target.value) || 35)}
                    className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono tabular-nums text-white"
                  />
                  <span className="text-xs font-mono tabular-nums text-slate-400">hrs/wk</span>
                </div>
              </div>
            </div>

            {interceptBanner && (
              <div
                role="alert"
                className="mt-3 p-3 rounded-lg bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{interceptBanner}</span>
              </div>
            )}

            {/* Blocked Entertainment Apps List */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>Quarantined Entertainment & Social Apps</span>
                <span>Status / Test Lock</span>
              </div>
              {blockedApps.map((app) => {
                const isBlockedNow = enforcementState.entertainmentBlocked || isRunning;
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-200 truncate">{app.name}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {app.domain} · {app.category} · {app.interceptCount} blocks
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestEntertainmentAccess(app)}
                      className={`px-2.5 py-1 text-xs font-mono tabular-nums rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                        isBlockedNow
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                    >
                      {isBlockedNow ? 'BLOCKED (Test)' : 'UNLOCKED'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Custom Distraction Domain */}
          <form onSubmit={handleAddBlockSubmit} className="mt-5 pt-4 border-t border-slate-800">
            <div className="text-xs font-medium text-slate-300 mb-2">
              Add App or Website to Entertainment Quarantine
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                aria-label="App or Site Name"
                placeholder="App Name (e.g. YouTube)"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
              />
              <input
                type="text"
                aria-label="App Domain"
                placeholder="Domain (youtube.com)"
                value={newAppDomain}
                onChange={(e) => setNewAppDomain(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
              />
              <div className="flex gap-2">
                <select
                  aria-label="Distraction Category"
                  value={newAppCategory}
                  onChange={(e) => setNewAppCategory(e.target.value as BlockedAppItem['category'])}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                >
                  <option value="Entertainment">Entertainment</option>
                  <option value="Social Media">Social</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Streaming">Streaming</option>
                </select>
                <button
                  type="submit"
                  aria-label="Add Blocked App"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg border border-slate-700 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>

      {/* Bottom Row: Gamified Badges & AI Smart Schedule Adjustment Advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">03. Gamified Mastery Badges & Rewards</h2>
              <p className="text-xs text-slate-400">Unlock badges through daily consistency and topic mastery</p>
            </div>
            <span className="text-xs font-mono tabular-nums text-amber-400">{xpPoints} Total XP</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-3.5 rounded-lg border ${
                  b.unlocked
                    ? 'bg-slate-950 border-amber-500/40 text-slate-100'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white">{b.title}</span>
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${b.unlocked ? 'text-emerald-400' : 'text-slate-600'}`}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{b.description}</p>
                <div className="mt-2 text-xs font-mono tabular-nums text-amber-400">
                  Progress: {b.requirementText} · {b.unlocked ? 'Unlocked' : 'Locked'}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          data-testid="sankalp-local-ai-coach"
          className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between"
        >
          <div>
            {/* Header & Cloud Timetable Fallback Trigger */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
                  <h2 className="text-base font-semibold text-white">
                    04. Sankalp Local AI Performance Coach
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {localAIReport.modelVersion} · Zero-latency on-device diagnostics &amp; adaptive prescriptions
                </p>
              </div>

              <button
                type="button"
                onClick={fetchScheduleSuggestions}
                disabled={loadingAdvice}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-950 text-slate-200 hover:text-white border border-slate-700 hover:border-amber-500/50 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {loadingAdvice ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{loadingAdvice ? 'Syncing...' : 'AI Timetable Slots'}</span>
              </button>
            </div>

            {/* Optimization Profile Selector (4 Local AI Weight Modes) */}
            <div className="mb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 mb-1.5">
                <span>Select On-Device Optimization Profile</span>
                <span className="font-mono tabular-nums text-amber-400">
                  {LOCAL_AI_MODES.find((m) => m.id === localAIMode)?.label} ·{' '}
                  {LOCAL_AI_MODES.find((m) => m.id === localAIMode)?.shortDesc}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
                {LOCAL_AI_MODES.map((m) => {
                  const active = m.id === localAIMode;
                  const compactLabel =
                    m.id === 'balanced'
                      ? 'Balanced'
                      : m.id === 'pyq_intensive'
                      ? 'PYQ Velocity'
                      : m.id === 'backlog_crush'
                      ? 'Backlog Crush'
                      : 'Exam Sprint';
                  return (
                    <button
                      key={m.id}
                      type="button"
                      data-testid={`local-ai-mode-${m.id}`}
                      onClick={() => setLocalAIMode(m.id)}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-center whitespace-nowrap cursor-pointer ${
                        active
                          ? 'bg-amber-500 text-slate-950 font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {compactLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Readiness Score vs Projected 14-Day Score Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-[11px] text-slate-400">Current Exam Readiness</div>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <span
                    data-testid="local-ai-readiness-score"
                    className="text-2xl font-bold font-mono tabular-nums text-white"
                  >
                    {localAIReport.readinessScore}%
                  </span>
                </div>
                <div className="text-[10px] text-amber-400 font-medium mt-0.5">
                  {localAIReport.readinessGrade}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-[11px] text-slate-400">14-Day Projected Readiness</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span
                    data-testid="local-ai-projected-score"
                    className="text-2xl font-bold font-mono tabular-nums text-emerald-400"
                  >
                    {localAIReport.projectedReadinessScore}%
                  </span>
                  <span className="text-xs font-mono tabular-nums text-emerald-300 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />+{localAIReport.projectedImprovementDelta}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
                  With Local AI Prescriptions
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <label htmlFor="local-ai-booster-slider">What-If Extra Study</label>
                  <span
                    data-testid="local-ai-booster-value"
                    className="font-mono tabular-nums text-amber-400 font-semibold"
                  >
                    +{simulatedExtraHours.toFixed(1)}h/day
                  </span>
                </div>
                <input
                  id="local-ai-booster-slider"
                  data-testid="local-ai-booster-slider"
                  type="range"
                  min="0"
                  max="3"
                  step="0.5"
                  value={simulatedExtraHours}
                  onChange={(e) => setSimulatedExtraHours( parseFloat(e.target.value) )}
                  className="mt-2 w-full accent-amber-500 cursor-pointer"
                />
                <div className="text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
                  +{Math.round(simulatedExtraHours * 14)}h over next 14 days
                </div>
              </div>
            </div>

            {/* 4 On-Device Telemetry Sub-Scores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Syllabus</span>
                  <span className="font-mono tabular-nums text-white font-semibold">
                    {localAIReport.featureScores.syllabusMasteryScore}%
                  </span>
                </div>
                <div className="mt-1.5 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${localAIReport.featureScores.syllabusMasteryScore}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">PYQ Speed</span>
                  <span className="font-mono tabular-nums text-white font-semibold">
                    {localAIReport.pyqPerHourRate}/hr
                  </span>
                </div>
                <div className="mt-1.5 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${localAIReport.featureScores.pyqDensityScore}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Weekly Pace</span>
                  <span className="font-mono tabular-nums text-white font-semibold">
                    {localAIReport.featureScores.weeklyVelocityScore}%
                  </span>
                </div>
                <div className="mt-1.5 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${localAIReport.featureScores.weeklyVelocityScore}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Consistency</span>
                  <span className="font-mono tabular-nums text-white font-semibold">
                    {streakDays}d ({localAIReport.featureScores.consistencyScore}%)
                  </span>
                </div>
                <div className="mt-1.5 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${localAIReport.featureScores.consistencyScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Diagnostic Summary */}
            <p
              data-testid="local-ai-diagnostic-summary"
              className="text-xs text-slate-200 bg-slate-950 border border-slate-800 p-3 rounded-lg leading-relaxed mb-3"
            >
              {localAIReport.diagnosticSummary}
            </p>

            {/* Feedback Banner when User Applies a Suggestion */}
            {appliedSuggestionFeedback && (
              <div
                data-testid="local-ai-applied-feedback"
                className="mb-3 px-3.5 py-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{appliedSuggestionFeedback}</span>
                </div>
              </div>
            )}

            {/* Customized Actionable Suggestions List */}
            <div className="space-y-2.5">
              {localAIReport.suggestions.map((sug) => (
                <div
                  key={sug.id}
                  data-testid={`local-ai-suggestion-${sug.actionType}`}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg p-3.5 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-mono tabular-nums text-amber-400">
                        {sug.category} · +{sug.expectedImpactPct}% Readiness Gain
                      </div>
                      <h3 className="text-xs font-semibold text-white mt-0.5">{sug.title}</h3>
                    </div>

                    <button
                      type="button"
                      data-testid={`local-ai-apply-${sug.actionType}`}
                      onClick={() => handleApplyLocalAISuggestion(sug)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>{sug.actionLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{sug.rationale}</p>
                </div>
              ))}
            </div>

            {/* Optional Cloud Timetable Slots Output if requested */}
            {scheduleAdvice && (
              <div className="space-y-2 mt-4 pt-3 border-t border-slate-800">
                <div className="text-xs font-semibold text-amber-400">
                  Recommended Daily Time-Slot Schedule
                </div>
                {scheduleAdvice.adjustments.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-amber-400 font-mono tabular-nums">
                        {item.slot}
                      </span>
                      <span className="mx-2 text-slate-600">·</span>
                      <span className="font-medium text-white">{item.subject}</span>
                      <p className="text-slate-400 mt-0.5">{item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
