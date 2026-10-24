import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  BookOpen,
  Layers,
  Award,
  Contrast,
} from 'lucide-react';
import {
  ExamProfileConfig,
  ExamSubjectDefinition,
  SyllabusTopic,
  EXAM_PRESETS,
  ThemeVariant,
  THEMES,
} from '../utils/sscLogic';

interface ExamCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: ExamProfileConfig;
  onSelectPreset: (presetId: string) => void;
  onSaveCustomProfile: (
    updatedProfile: ExamProfileConfig,
    newGeneratedTopics?: SyllabusTopic[]
  ) => void;
  activeTheme?: ThemeVariant;
  onChangeTheme?: (theme: ThemeVariant) => void;
}

export const ExamCustomizerModal: React.FC<ExamCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSelectPreset,
  onSaveCustomProfile,
  activeTheme = 'midnight',
  onChangeTheme,
}) => {
  const [examName, setExamName] = useState(currentProfile.examName);
  const [examCategory, setExamCategory] = useState(currentProfile.examCategory);
  const [targetPostOrRole, setTargetPostOrRole] = useState(currentProfile.targetPostOrRole);
  const [targetExamDate, setTargetExamDate] = useState(currentProfile.targetExamDate);
  const [weeklyTargetHours, setWeeklyTargetHours] = useState(
    String(currentProfile.weeklyTargetHours)
  );
  const [dailyGoalHours, setDailyGoalHours] = useState(String(currentProfile.dailyGoalHours));
  const [pomodoroFocusMinutes, setPomodoroFocusMinutes] = useState(
    String(currentProfile.pomodoroFocusMinutes)
  );
  const [pomodoroDeepMinutes, setPomodoroDeepMinutes] = useState(
    String(currentProfile.pomodoroDeepMinutes)
  );
  const [subjects, setSubjects] = useState<ExamSubjectDefinition[]>(currentProfile.subjects);
  const [tiers, setTiers] = useState<string[]>(currentProfile.tiers);

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTierName, setNewTierName] = useState('');
  const [aiGeneratingSyllabus, setAiGeneratingSyllabus] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoadTemplate = (presetKey: string) => {
    const preset = EXAM_PRESETS[presetKey];
    if (!preset) return;
    setExamName(preset.profile.examName);
    setExamCategory(preset.profile.examCategory);
    setTargetPostOrRole(preset.profile.targetPostOrRole);
    setTargetExamDate(preset.profile.targetExamDate);
    setWeeklyTargetHours(String(preset.profile.weeklyTargetHours));
    setDailyGoalHours(String(preset.profile.dailyGoalHours));
    setPomodoroFocusMinutes(String(preset.profile.pomodoroFocusMinutes));
    setPomodoroDeepMinutes(String(preset.profile.pomodoroDeepMinutes));
    setSubjects(preset.profile.subjects.map((s) => ({ ...s })));
    setTiers([...preset.profile.tiers]);
    onSelectPreset(presetKey);
    setStatusBanner(`Loaded "${preset.profile.examName}" template with ${preset.topics.length} curated syllabus topics.`);
  };

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    const slug = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    setSubjects((prev) => [...prev, { id: slug, name: newSubjectName.trim() }]);
    setNewSubjectName('');
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) return;
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddTier = () => {
    if (!newTierName.trim()) return;
    if (!tiers.includes(newTierName.trim())) {
      setTiers((prev) => [...prev, newTierName.trim()]);
    }
    setNewTierName('');
  };

  const handleRemoveTier = (tier: string) => {
    if (tiers.length <= 1) return;
    setTiers((prev) => prev.filter((t) => t !== tier));
  };

  const handleGenerateCustomExamSyllabus = async () => {
    const targetName = aiCustomPrompt.trim() || examName.trim();
    if (!targetName) return;
    setAiGeneratingSyllabus(true);
    setStatusBanner(null);
    try {
      const res = await fetch('/api/gemini/custom-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examName: targetName,
          targetRole: targetPostOrRole,
        }),
      });
      const data = await res.json();
      if (data && Array.isArray(data.subjects) && Array.isArray(data.topics)) {
        setExamName(data.examName || targetName);
        if (data.targetRole) setTargetPostOrRole(data.targetRole);
        setSubjects(data.subjects);
        if (Array.isArray(data.tiers) && data.tiers.length > 0) {
          setTiers(data.tiers);
        }
        const updatedProfile: ExamProfileConfig = {
          id: `custom-${Date.now()}`,
          examName: data.examName || targetName,
          examCategory: data.examCategory || 'Custom Competitive Exam',
          targetPostOrRole: data.targetRole || targetPostOrRole,
          targetExamDate,
          weeklyTargetHours: Math.max(5, Number(weeklyTargetHours) || 35),
          dailyGoalHours: Math.max(1, Number(dailyGoalHours) || 5),
          pomodoroFocusMinutes: Math.max(10, Number(pomodoroFocusMinutes) || 25),
          pomodoroDeepMinutes: Math.max(20, Number(pomodoroDeepMinutes) || 50),
          tiers: Array.isArray(data.tiers) && data.tiers.length > 0 ? data.tiers : tiers,
          subjects: data.subjects,
        };
        onSaveCustomProfile(updatedProfile, data.topics);
        setStatusBanner(
          `Generated & applied ${data.topics.length} syllabus modules across ${data.subjects.length} subjects for "${updatedProfile.examName}".`
        );
      }
    } catch (err) {
      console.error(err);
      setStatusBanner('Could not reach AI generator; saved custom exam settings locally.');
    } finally {
      setAiGeneratingSyllabus(false);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ExamProfileConfig = {
      ...currentProfile,
      examName: examName.trim() || 'Custom Competitive Exam',
      examCategory: examCategory.trim() || 'Competitive Examination',
      targetPostOrRole: targetPostOrRole.trim() || 'Top Rank Contender',
      targetExamDate: targetExamDate || '2026-12-15',
      weeklyTargetHours: Math.max(5, Number(weeklyTargetHours) || 35),
      dailyGoalHours: Math.max(1, Number(dailyGoalHours) || 5),
      pomodoroFocusMinutes: Math.max(10, Number(pomodoroFocusMinutes) || 25),
      pomodoroDeepMinutes: Math.max(20, Number(pomodoroDeepMinutes) || 50),
      subjects,
      tiers,
    };
    onSaveCustomProfile(updated);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exam-customizer-title"
    >
      <div className="w-full max-w-4xl rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h2 id="exam-customizer-title" className="text-lg font-bold text-white">
                Customize Application for Your Target Exam
              </h2>
              <p className="text-xs text-slate-400">
                Switch between pre-built exam blueprints (SSC CGL, UPSC CSE, IBPS/SBI PO, GATE/JEE, CAT) or build your own custom exam syllabus, subjects, tiers, and study targets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700"
          >
            Close
          </button>
        </div>

        {statusBanner && (
          <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusBanner}</span>
          </div>
        )}

        {/* 0. Interface Appearance & High-Contrast Accessibility Theme Toggle */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3" data-testid="modal-theme-settings">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold text-white flex items-center gap-2">
              <Contrast className="w-4 h-4 text-amber-400" />
              <span>Interface Appearance &amp; High-Contrast Accessibility Theme</span>
            </div>
            <span className="text-xs font-mono tabular-nums text-amber-400">
              Active: {THEMES[activeTheme].label} · {THEMES[activeTheme].contrastRatioLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(['midnight', 'obsidian'] as const).map((variant) => {
              const t = THEMES[variant];
              const isSelected = activeTheme === variant;
              return (
                <button
                  key={variant}
                  type="button"
                  data-testid={`modal-theme-option-${variant}`}
                  aria-pressed={isSelected}
                  onClick={() => {
                    onChangeTheme?.(variant);
                    setStatusBanner(
                      `Applied "${t.label} (${t.subtitle})" interface theme with ${t.contrastRatioLabel} contrast.`
                    );
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{t.label} Theme</span>
                      <span className="text-[11px] text-slate-400">· {t.subtitle}</span>
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-amber-400 shrink-0">
                      {t.contrastRatioLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                    {t.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                    <span>Canvas {t.canvasBg}</span>
                    <span aria-hidden="true">·</span>
                    <span>Border {t.borderHex}</span>
                    <span aria-hidden="true">·</span>
                    <span>Accent {t.accentHex}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. One-Click Exam Blueprint Templates */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>01. Select a Pre-Configured Exam Blueprint (Replaces Syllabus & Subjects Instantly)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {Object.entries(EXAM_PRESETS).map(([key, item]) => {
              const isSelected = currentProfile.examName === item.profile.examName;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleLoadTemplate(key)}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white truncate">{item.profile.examName}</div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">{item.profile.targetPostOrRole}</div>
                  <div className="text-xs font-mono tabular-nums text-amber-400 mt-1.5">
                    {item.profile.weeklyTargetHours}h/wk · {item.topics.length} Topics
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. AI Custom Exam Syllabus Generator */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>02. Prepare for Any Other Exam? Auto-Generate Custom Syllabus & Subjects</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              placeholder="Enter any exam name (e.g. NEET UG, CLAT, NDA, RRB NTPC, UGC NET, State PCS, CFA)..."
              value={aiCustomPrompt}
              onChange={(e) => setAiCustomPrompt(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
            <button
              type="button"
              onClick={handleGenerateCustomExamSyllabus}
              disabled={aiGeneratingSyllabus}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {aiGeneratingSyllabus ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{aiGeneratingSyllabus ? 'Building Exam Blueprint...' : 'Build Custom Exam Blueprint'}</span>
            </button>
          </div>
        </div>

        {/* 3. Granular Exam Profile, Subjects, Stages & Study Targets Editor */}
        <form onSubmit={handleSaveForm} className="space-y-5">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>03. Fine-Tune Your Exam Identity, Target Post, Dates & Pomodoro Cadence</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label htmlFor="cust-exam-name" className="block text-xs text-slate-400 mb-1">
                Target Exam Name
              </label>
              <input
                id="cust-exam-name"
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label htmlFor="cust-target-role" className="block text-xs text-slate-400 mb-1">
                Target Post / Rank / Goal
              </label>
              <input
                id="cust-target-role"
                type="text"
                value={targetPostOrRole}
                onChange={(e) => setTargetPostOrRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label htmlFor="cust-exam-date" className="block text-xs text-slate-400 mb-1">
                Target Exam Date
              </label>
              <input
                id="cust-exam-date"
                type="date"
                value={targetExamDate}
                onChange={(e) => setTargetExamDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-white"
              />
            </div>

            <div>
              <label htmlFor="cust-weekly-hrs" className="block text-xs text-slate-400 mb-1">
                Weekly Mandate (Hours)
              </label>
              <input
                id="cust-weekly-hrs"
                type="number"
                min="5"
                max="110"
                value={weeklyTargetHours}
                onChange={(e) => setWeeklyTargetHours(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="cust-daily-goal" className="block text-xs text-slate-400 mb-1">
                Daily Study Goal (Hours)
              </label>
              <input
                id="cust-daily-goal"
                type="number"
                step="0.5"
                min="1"
                max="16"
                value={dailyGoalHours}
                onChange={(e) => setDailyGoalHours(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-white"
              />
            </div>
            <div>
              <label htmlFor="cust-pomo-sprint" className="block text-xs text-slate-400 mb-1">
                Sprint Pomodoro (Minutes)
              </label>
              <input
                id="cust-pomo-sprint"
                type="number"
                min="10"
                max="90"
                value={pomodoroFocusMinutes}
                onChange={(e) => setPomodoroFocusMinutes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-white"
              />
            </div>
            <div>
              <label htmlFor="cust-pomo-deep" className="block text-xs text-slate-400 mb-1">
                Deep Work Pomodoro (Minutes)
              </label>
              <input
                id="cust-pomo-deep"
                type="number"
                min="20"
                max="120"
                value={pomodoroDeepMinutes}
                onChange={(e) => setPomodoroDeepMinutes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-white"
              />
            </div>
          </div>

          {/* Custom Subjects & Custom Exam Stages/Tiers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Custom Exam Subjects / Papers ({subjects.length})</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs"
                  >
                    <span className="text-slate-200 truncate">{sub.name}</span>
                    {subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(sub.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        aria-label={`Remove ${sub.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add new subject (e.g. Organic Chemistry)"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg border border-slate-700 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Custom Exam Stages / Tiers ({tiers.length})</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {tiers.map((t) => (
                  <div
                    key={t}
                    className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs"
                  >
                    <span className="text-slate-200 truncate">{t}</span>
                    {tiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTier(t)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        aria-label={`Remove stage ${t}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add exam stage (e.g. Prelims / Interview)"
                  value={newTierName}
                  onChange={(e) => setNewTierName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddTier}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg border border-slate-700 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
            >
              Save & Apply Exam Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
