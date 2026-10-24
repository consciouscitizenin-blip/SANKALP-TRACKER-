import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_SYLLABUS_TOPICS,
  calculateSyllabusMetrics,
  evaluateWeeklyTargetLock,
  computeGamificationBadges,
  applyExamPreset,
  calculateDailyRadialProgress,
  computeHeatmapIntensity,
  buildStudyHeatmapCalendar,
  computeSmartFocusTopic,
  getFocusAudioTracksByCategory,
  validateWebsiteResourceUrl,
  compileResourceContextPayload,
  getThemeConfig,
  THEMES,
  THEME_LIST,
  runSankalpLocalAIModel,
} from './sscLogic';

test('runSankalpLocalAIModel computes readiness telemetry, bottleneck diagnostics, and actionable suggestions across modes', () => {
  const metrics = calculateSyllabusMetrics(INITIAL_SYLLABUS_TOPICS);

  const balancedReport = runSankalpLocalAIModel({
    topics: INITIAL_SYLLABUS_TOPICS,
    metrics,
    dailyCompletedHours: 3.5,
    dailyGoalHours: 5.0,
    weeklyCompletedHours: 28.5,
    weeklyTargetHours: 35,
    streakDays: 6,
    targetExamDate: '2026-12-15',
    mode: 'balanced',
    simulatedExtraDailyHours: 0,
  });

  assert.equal(balancedReport.mode, 'balanced');
  assert.ok(balancedReport.readinessScore > 0 && balancedReport.readinessScore < 100);
  assert.ok(balancedReport.projectedReadinessScore > balancedReport.readinessScore);
  assert.equal(
    balancedReport.projectedImprovementDelta,
    balancedReport.projectedReadinessScore - balancedReport.readinessScore
  );
  assert.equal(balancedReport.suggestions.length, 3);
  assert.equal(balancedReport.suggestions[0].actionType, 'start_focus_topic');
  assert.equal(balancedReport.suggestions[1].actionType, 'log_pyq_sprint');
  assert.equal(balancedReport.suggestions[2].actionType, 'calibrate_weekly_target');
  assert.ok(balancedReport.bottleneckTopic.id);

  // Verify What-If extra daily hours increases projected improvement delta
  const boostedReport = runSankalpLocalAIModel({
    topics: INITIAL_SYLLABUS_TOPICS,
    metrics,
    dailyCompletedHours: 3.5,
    dailyGoalHours: 5.0,
    weeklyCompletedHours: 28.5,
    weeklyTargetHours: 35,
    streakDays: 6,
    targetExamDate: '2026-12-15',
    mode: 'pyq_intensive',
    simulatedExtraDailyHours: 2.0,
  });

  assert.equal(boostedReport.mode, 'pyq_intensive');
  assert.ok(boostedReport.projectedImprovementDelta > balancedReport.projectedImprovementDelta);
  assert.ok(boostedReport.diagnosticSummary.includes('+2.0h/day'));
});

test('getThemeConfig and THEME_LIST return all 6 mood-based themes and accessibility tokens accurately', () => {
  assert.equal(THEME_LIST.length, 6);

  const midnight = getThemeConfig('midnight');
  const obsidian = getThemeConfig('obsidian');
  const emerald = getThemeConfig('emerald');
  const saffron = getThemeConfig('saffron');
  const amethyst = getThemeConfig('amethyst');
  const coffee = getThemeConfig('coffee');
  const fallback = getThemeConfig('unknown-theme');

  assert.equal(midnight.id, 'midnight');
  assert.equal(midnight.mood, 'Calm & Balanced');
  assert.ok(midnight.contrastRatioLabel.includes('WCAG'));

  assert.equal(obsidian.id, 'obsidian');
  assert.equal(obsidian.mood, 'Zero-Glare Focus');
  assert.equal(obsidian.canvasBg, '#030305');
  assert.equal(obsidian.accentHex, '#FACC15');

  assert.equal(emerald.id, 'emerald');
  assert.equal(emerald.label, 'Forest Zen');
  assert.equal(emerald.mood, 'Stress-Free & Calm');
  assert.equal(emerald.accentHex, '#10B981');

  assert.equal(saffron.id, 'saffron');
  assert.equal(saffron.label, 'Tapasya Dawn');
  assert.equal(saffron.mood, 'Energized Sprint');
  assert.equal(saffron.accentHex, '#F97316');

  assert.equal(amethyst.id, 'amethyst');
  assert.equal(amethyst.label, 'Cosmic Synth');
  assert.equal(amethyst.mood, 'Late-Night Flow');
  assert.equal(amethyst.accentHex, '#38BDF8');

  assert.equal(coffee.id, 'coffee');
  assert.equal(coffee.label, 'Mocha Library');
  assert.equal(coffee.mood, 'Cozy Reading');
  assert.equal(coffee.accentHex, '#FBBF24');

  assert.equal(fallback.id, THEMES.midnight.id);
});

test('validateWebsiteResourceUrl and compileResourceContextPayload aggregate PDFs, files, and URLs cleanly', () => {
  const urlCheck = validateWebsiteResourceUrl('pib.gov.in/PressReleasePage');
  assert.equal(urlCheck.valid, true);
  assert.equal(urlCheck.normalizedUrl, 'https://pib.gov.in/PressReleasePage');
  assert.equal(urlCheck.hostname, 'pib.gov.in');

  const badUrl = validateWebsiteResourceUrl('not a url');
  assert.equal(badUrl.valid, false);

  const payload = compileResourceContextPayload(
    [
      {
        id: 'r1',
        type: 'pdf',
        title: 'Mensuration_3D_Formulas.pdf',
        mimeType: 'application/pdf',
        sizeLabel: '240 KB',
        extractedText: 'Frustum of cone volume = (1/3) * pi * h * (R^2 + r^2 + R*r)',
        base64Data: 'JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoK',
        addedAt: '10:30 AM',
      },
      {
        id: 'r2',
        type: 'url',
        title: 'PIB Economic Survey Summary',
        sourceUrl: 'https://pib.gov.in/survey2026',
        sizeLabel: 'Web Article',
        extractedText: 'Fiscal deficit target pegged at 4.5% of GDP.',
        addedAt: '10:32 AM',
      },
    ],
    'Additional note on CAG Article 148'
  );

  assert.equal(payload.inlineParts.length, 1);
  assert.equal(payload.urls.length, 1);
  assert.equal(payload.resourceTitles.length, 2);
  assert.ok(payload.combinedText.includes('Frustum of cone volume'));
  assert.ok(payload.combinedText.includes('Fiscal deficit target'));
  assert.equal(payload.sourceSummary, '1 PDF + 1 Website Link + Lecture Notes');
});

test('getFocusAudioTracksByCategory returns ambient lo-fi playlists and white noise soundscapes', () => {
  const lofiTracks = getFocusAudioTracksByCategory('lofi');
  const noiseTracks = getFocusAudioTracksByCategory('whitenoise');
  assert.equal(lofiTracks.length, 3);
  assert.equal(noiseTracks.length, 3);
  assert.ok(lofiTracks.every((t) => t.category === 'lofi'));
  assert.ok(noiseTracks.every((t) => t.category === 'whitenoise'));
});

test('computeSmartFocusTopic prioritizes highest-deficit uncompleted topic by remaining hours and exam proximity', () => {
  const rec = computeSmartFocusTopic(INITIAL_SYLLABUS_TOPICS, '2026-12-15', '2026-10-23');
  assert.ok(rec);
  assert.notEqual(rec.topic.status, 'completed');
  assert.equal(rec.topic.id, 'quant-6'); // Mensuration 2D & 3D (20h remaining, Tier-I & II)
  assert.equal(rec.remainingTopicHours, 20);
  assert.equal(rec.daysUntilExam, 53);
  assert.equal(rec.urgencyLevel, 'Critical');
  assert.equal(rec.recommendedPomoMode, 'deep50');

  // Verify null when all topics are completed
  const allCompleted = INITIAL_SYLLABUS_TOPICS.map((t) => ({
    ...t,
    loggedHours: t.targetHours,
    status: 'completed' as const,
  }));
  assert.equal(computeSmartFocusTopic(allCompleted, '2026-12-15', '2026-10-23'), null);
});

test('buildStudyHeatmapCalendar generates 28 days with accurate intensity and hourly breakdowns', () => {
  assert.equal(computeHeatmapIntensity(0), 0);
  assert.equal(computeHeatmapIntensity(1.5), 1);
  assert.equal(computeHeatmapIntensity(3.5), 2);
  assert.equal(computeHeatmapIntensity(5.0), 3);
  assert.equal(computeHeatmapIntensity(7.0), 4);

  const days = buildStudyHeatmapCalendar(5, 4.5);
  assert.equal(days.length, 28);

  const oct23 = days.find((d) => d.date === '2026-10-23');
  assert.ok(oct23);
  assert.equal(oct23.totalHours, 4.5);
  assert.equal(oct23.intensity, 3);
  assert.equal(oct23.hourlyBreakdown.length, 3);
  const sumHours = oct23.hourlyBreakdown.reduce((acc, s) => acc + s.durationHours, 0);
  assert.equal(Number(sumHours.toFixed(1)), 4.5);
});

test('calculateDailyRadialProgress computes SVG radial stroke-dashoffset and percentage accurately', () => {
  const half = calculateDailyRadialProgress(2.5, 5, 52);
  assert.equal(half.percentage, 50);
  assert.equal(half.remainingDailyHours, 2.5);
  assert.equal(half.isGoalMet, false);
  assert.ok(Math.abs(half.strokeDashoffset - half.circumference / 2) < 0.1);

  const done = calculateDailyRadialProgress(6, 5, 52);
  assert.equal(done.percentage, 100);
  assert.equal(done.remainingDailyHours, 0);
  assert.equal(done.isGoalMet, true);
  assert.equal(done.strokeDashoffset, 0);
});

test('calculateSyllabusMetrics computes completed and remaining syllabus accurately', () => {
  const metrics = calculateSyllabusMetrics(INITIAL_SYLLABUS_TOPICS);
  assert.equal(metrics.totalTopics, 22);
  assert.equal(metrics.completedTopics, 7);
  assert.equal(metrics.completionPercentage + metrics.remainingPercentage, 100);
  assert.ok(metrics.totalLoggedHours > 0);
  assert.ok(metrics.remainingHours > 0);
  assert.equal(metrics.subjectStats.quant.totalTopics, 8);
});

test('applyExamPreset switches exam configuration, subjects, and topics cleanly', () => {
  const upsc = applyExamPreset('upsc-cse');
  assert.equal(upsc.profile.examName, 'UPSC CSE (IAS / IPS)');
  assert.equal(upsc.profile.weeklyTargetHours, 45);
  assert.equal(upsc.profile.subjects.length, 4);
  assert.ok(upsc.topics.length >= 6);

  const metrics = calculateSyllabusMetrics(upsc.topics, upsc.profile.subjects);
  assert.ok(metrics.subjectStats.gs1);
  assert.equal(metrics.subjectStats.gs1.subjectName, 'GS-I: History, Art & Geography');
});

test('evaluateWeeklyTargetLock blocks entertainment apps when weekly target is incomplete', () => {
  const lockedState = evaluateWeeklyTargetLock(28.5, 35, true);
  assert.equal(lockedState.isDeficit, true);
  assert.equal(lockedState.deficitHours, 6.5);
  assert.equal(lockedState.entertainmentBlocked, true);

  const unlockedState = evaluateWeeklyTargetLock(35, 35, true);
  assert.equal(lockedState.isDeficit, true);
  assert.equal(unlockedState.isDeficit, false);
  assert.equal(unlockedState.deficitHours, 0);
  assert.equal(unlockedState.entertainmentBlocked, false);
});

test('computeGamificationBadges unlocks badges when thresholds are met', () => {
  const badges = computeGamificationBadges(2800, 12, 7, 45, 45);
  assert.equal(badges.length, 4);
  assert.equal(badges.every((b) => b.unlocked), true);
});

