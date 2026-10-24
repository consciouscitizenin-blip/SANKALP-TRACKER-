import React, { useState, useMemo } from 'react';
import { Calendar, Bell, CheckCircle2, Clock, Plus, RefreshCw, AlertCircle, Flame, BookOpen, Layers } from 'lucide-react';
import {
  SyllabusMetrics,
  buildStudyHeatmapCalendar,
  CalendarHeatmapDay,
  HeatmapIntensityLevel,
} from '../utils/sscLogic';
import { getAccessToken } from '../services/firebase';

interface CalendarEventItem {
  id: string;
  summary: string;
  start: string;
  type: 'Exam Deadline' | 'Study Block' | 'Mock Test';
  syncedWithGoogle: boolean;
}

interface AnalyticsScheduleViewProps {
  metrics: SyllabusMetrics;
  weeklyTargetHours: number;
  weeklyCompletedHours: number;
  dailyCompletedHours?: number;
  dailyGoalHours?: number;
  isSignedInWithGoogle: boolean;
  onRequestGoogleSignIn: () => void;
}

const WEEKLY_DAILY_TREND = [
  { day: 'Mon', hours: 5.5, target: 5.0 },
  { day: 'Tue', hours: 6.0, target: 5.0 },
  { day: 'Wed', hours: 4.5, target: 5.0 },
  { day: 'Thu', hours: 6.5, target: 5.0 },
  { day: 'Fri', hours: 5.0, target: 5.0 },
  { day: 'Sat', hours: 4.0, target: 5.0 },
  { day: 'Sun', hours: 3.0, target: 5.0 },
];

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getIntensityCellClasses(intensity: HeatmapIntensityLevel, isSelected: boolean): string {
  const base =
    'relative rounded-lg p-2.5 text-left transition-all border flex flex-col justify-between min-h-[68px] cursor-pointer ';
  const ring = isSelected
    ? 'ring-2 ring-amber-400 border-amber-400 shadow-lg shadow-amber-500/10 '
    : 'hover:border-slate-600 ';

  switch (intensity) {
    case 0:
      return base + ring + 'bg-slate-950/90 border-slate-800/80 text-slate-500';
    case 1:
      return base + ring + 'bg-emerald-950/50 border-emerald-800/50 text-emerald-200';
    case 2:
      return base + ring + 'bg-emerald-900/55 border-emerald-600/50 text-emerald-100';
    case 3:
      return base + ring + 'bg-amber-500/20 border-amber-500/50 text-amber-100';
    case 4:
      return base + ring + 'bg-amber-500/35 border-amber-400 text-white';
  }
}

function getIntensityLabel(intensity: HeatmapIntensityLevel): string {
  switch (intensity) {
    case 0:
      return 'Rest / 0h';
    case 1:
      return 'Light (0.5–2h)';
    case 2:
      return 'Steady (2.5–4h)';
    case 3:
      return 'Goal Met (4.5–6h)';
    case 4:
      return 'Peak Tapasya (6.5h+)';
  }
}

export const AnalyticsScheduleView: React.FC<AnalyticsScheduleViewProps> = ({
  metrics: _metrics,
  weeklyTargetHours,
  weeklyCompletedHours,
  dailyCompletedHours = 3.0,
  dailyGoalHours = 5.0,
  isSignedInWithGoogle,
  onRequestGoogleSignIn,
}) => {
  const heatmapDays = useMemo(
    () => buildStudyHeatmapCalendar(dailyGoalHours, dailyCompletedHours),
    [dailyGoalHours, dailyCompletedHours]
  );

  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-10-23');

  const selectedDay: CalendarHeatmapDay = useMemo(() => {
    return (
      heatmapDays.find((d) => d.date === selectedDateStr) ||
      heatmapDays.find((d) => d.date === '2026-10-23') ||
      heatmapDays[heatmapDays.length - 1]
    );
  }, [heatmapDays, selectedDateStr]);

  const totalHeatmapHours = useMemo(
    () => Number(heatmapDays.reduce((acc, d) => acc + d.totalHours, 0).toFixed(1)),
    [heatmapDays]
  );

  const activeStudyDaysCount = useMemo(
    () => heatmapDays.filter((d) => d.totalHours > 0).length,
    [heatmapDays]
  );

  const [events, setEvents] = useState<CalendarEventItem[]>([
    {
      id: 'ev-1',
      summary: 'SSC CGL Tier-I All-India Live Mock Test #14',
      start: '2026-10-25T09:00',
      type: 'Mock Test',
      syncedWithGoogle: false,
    },
    {
      id: 'ev-2',
      summary: 'Quantitative Aptitude: Mensuration 3D Frustum & Prism Revision',
      start: '2026-10-24T07:00',
      type: 'Study Block',
      syncedWithGoogle: false,
    },
    {
      id: 'ev-3',
      summary: 'SSC CGL Tier-I Official Examination Window Target',
      start: '2026-12-15T09:00',
      type: 'Exam Deadline',
      syncedWithGoogle: false,
    },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('2026-10-24T18:00');
  const [newType, setNewType] = useState<CalendarEventItem['type']>('Study Block');
  const [confirmSyncEvent, setConfirmSyncEvent] = useState<CalendarEventItem | null>(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // Notification Reminder State
  const [reminderTime, setReminderTime] = useState('06:30');
  const [reminderFrequency, setReminderFrequency] = useState('Daily Morning & Evening');
  const [reminderSaved, setReminderSaved] = useState(false);

  const handleAddScheduleBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item: CalendarEventItem = {
      id: `ev-${Date.now()}`,
      summary: newTitle.trim(),
      start: newStart,
      type: newType,
      syncedWithGoogle: false,
    };
    setEvents((prev) => [item, ...prev]);
    setNewTitle('');
  };

  const handleFetchGoogleCalendarEvents = async () => {
    const token = await getAccessToken();
    if (!token) {
      onRequestGoogleSignIn();
      return;
    }
    setLoadingCalendar(true);
    setSyncStatusMsg(null);
    try {
      const timeMin = new Date().toISOString();
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
          timeMin
        )}&maxResults=5&singleEvents=true&orderBy=startTime`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (Array.isArray(data.items)) {
        const imported: CalendarEventItem[] = data.items.map((it: any) => ({
          id: it.id || `gcal-${Math.random()}`,
          summary: it.summary || 'Google Calendar Event',
          start: (it.start?.dateTime || it.start?.date || '').slice(0, 16),
          type: 'Study Block',
          syncedWithGoogle: true,
        }));
        setEvents((prev) => [...imported, ...prev]);
        setSyncStatusMsg(`Loaded ${imported.length} upcoming events from your Google Calendar.`);
      }
    } catch (err) {
      console.error(err);
      setSyncStatusMsg('Unable to fetch Google Calendar events. Please re-authenticate.');
    } finally {
      setLoadingCalendar(false);
    }
  };

  // Explicit user confirmation dialog required before creating/mutating Google Calendar events
  const executeConfirmedGoogleCalendarSync = async () => {
    if (!confirmSyncEvent) return;
    const targetEvent = confirmSyncEvent;
    setConfirmSyncEvent(null);

    const token = await getAccessToken();
    if (!token) {
      onRequestGoogleSignIn();
      return;
    }

    setLoadingCalendar(true);
    try {
      const startDate = new Date(targetEvent.start);
      const endDate = new Date(startDate.getTime() + 90 * 60 * 1000);
      const res = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: `[SSC CGL] ${targetEvent.summary}`,
            description: `Scheduled via Sankalp SSC CGL Command Center (${targetEvent.type})`,
            start: { dateTime: startDate.toISOString() },
            end: { dateTime: endDate.toISOString() },
          }),
        }
      );
      if (res.ok) {
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === targetEvent.id ? { ...ev, syncedWithGoogle: true } : ev
          )
        );
        setSyncStatusMsg(`Successfully synced "${targetEvent.summary}" to your Google Calendar.`);
      } else {
        setSyncStatusMsg('Google Calendar API returned an error. Check your permissions.');
      }
    } catch (err) {
      console.error(err);
      setSyncStatusMsg('Failed to push event to Google Calendar.');
    } finally {
      setLoadingCalendar(false);
    }
  };

  const handleTriggerBrowserReminder = async () => {
    setReminderSaved(true);
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Visual Calendar Heatmap & Daily Hourly Breakdown */}
      <section
        data-testid="study-calendar-heatmap-section"
        className="bg-slate-900 border border-slate-800 rounded-xl p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">
                01. Study Activity Calendar Heatmap & Streak Intensity
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any date cell in the 4-week preparation matrix to inspect your hourly study breakdown and PYQ output
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono tabular-nums text-slate-300">
              28-Day Volume: <strong className="text-amber-400">{totalHeatmapHours}h</strong> ({activeStudyDaysCount}/28 Active Days)
            </div>
            {/* Intensity Legend */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>Less</span>
              <span className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-800 inline-block" title="0h Rest" />
              <span className="w-3.5 h-3.5 rounded bg-emerald-950/70 border border-emerald-800/60 inline-block" title="1-2h Light" />
              <span className="w-3.5 h-3.5 rounded bg-emerald-800/70 border border-emerald-600/60 inline-block" title="2.5-4h Steady" />
              <span className="w-3.5 h-3.5 rounded bg-amber-500/25 border border-amber-500/60 inline-block" title="4.5-6h Goal Met" />
              <span className="w-3.5 h-3.5 rounded bg-amber-500/45 border border-amber-400 inline-block" title="6.5h+ Peak Tapasya" />
              <span>Peak</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 7-Column Calendar Heatmap Grid */}
          <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {WEEKDAY_HEADERS.map((dayName) => (
                <div
                  key={dayName}
                  className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center py-1"
                >
                  {dayName}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2" data-testid="heatmap-grid">
              {heatmapDays.map((day) => {
                const isSelected = day.date === selectedDay.date;
                const isToday = day.date === '2026-10-23';
                return (
                  <button
                    key={day.date}
                    type="button"
                    data-testid={`heatmap-day-${day.date}`}
                    onClick={() => setSelectedDateStr(day.date)}
                    aria-pressed={isSelected}
                    aria-label={`${day.labelShort}: ${day.totalHours} hours studied`}
                    className={getIntensityCellClasses(day.intensity, isSelected)}
                  >
                    <div className="flex items-center justify-between w-full gap-1">
                      <span className="text-[11px] font-semibold tracking-tight">
                        {day.labelShort}
                      </span>
                      {day.streakActive && (
                        <Flame
                          className="w-3 h-3 text-amber-400 shrink-0"
                          aria-label="Streak day"
                        />
                      )}
                    </div>

                    <div className="mt-2 flex items-baseline justify-between w-full">
                      <span className="text-xs font-bold font-mono tabular-nums">
                        {day.totalHours > 0 ? `${day.totalHours}h` : 'Rest'}
                      </span>
                      {isToday && (
                        <span className="text-[9px] uppercase font-semibold tracking-wider text-amber-300">
                          Today
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Hourly Breakdown Inspector */}
          <div
            data-testid="heatmap-day-breakdown"
            className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[340px]"
          >
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      data-testid="selected-heatmap-date-label"
                      className="text-base font-bold text-white"
                    >
                      {selectedDay.labelShort}, 2026 ({selectedDay.weekdayShort})
                    </span>
                    {selectedDay.streakActive && (
                      <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-2 py-0.5">
                        Streak Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Intensity: <strong className="text-slate-200">{getIntensityLabel(selectedDay.intensity)}</strong> ·{' '}
                    {selectedDay.pomodoroCount} Pomodoro Blocks
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div
                    data-testid="selected-heatmap-total-hours"
                    className="text-xl font-bold font-mono tabular-nums text-amber-400"
                  >
                    {selectedDay.totalHours}h / {selectedDay.goalHours}h
                  </div>
                  <div className="text-[11px] text-slate-400">Daily Target</div>
                </div>
              </div>

              {/* Hourly Breakdown List */}
              <div className="mt-4 space-y-2.5">
                {selectedDay.hourlyBreakdown.length > 0 ? (
                  selectedDay.hourlyBreakdown.map((seg) => {
                    const widthPct = Math.min(
                      100,
                      Math.round((seg.durationHours / Math.max(1, selectedDay.totalHours)) * 100)
                    );
                    return (
                      <div
                        key={seg.id}
                        data-testid="hourly-breakdown-item"
                        className="bg-slate-900/90 border border-slate-800/90 rounded-lg p-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-mono tabular-nums text-amber-300 font-semibold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{seg.timeSlot}</span>
                          </span>
                          <span className="font-mono tabular-nums font-bold text-white">
                            {seg.durationHours}h · {seg.pyqCount} PYQs
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-100">
                          {seg.topicTitle}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-slate-500" />
                            <span>{seg.subjectName}</span>
                          </span>
                          <span className="text-emerald-400 font-medium">{seg.sessionType}</span>
                        </div>

                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    data-testid="hourly-breakdown-empty"
                    className="py-10 px-4 text-center bg-slate-900/40 border border-slate-800/60 rounded-lg space-y-2"
                  >
                    <Layers className="w-6 h-6 text-slate-500 mx-auto" />
                    <div className="text-xs font-semibold text-slate-300">
                      Scheduled Recovery & Rest Day (0h Logged)
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                      No study blocks were logged on {selectedDay.labelShort}. Click any highlighted cell in the calendar heatmap to inspect its hourly session breakdown.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                Total PYQs Solved on {selectedDay.labelShort}:{' '}
                <strong className="text-white font-mono tabular-nums">
                  {selectedDay.hourlyBreakdown.reduce((acc, s) => acc + s.pyqCount, 0)}
                </strong>
              </span>
              <span className="font-mono tabular-nums">
                {selectedDay.totalHours >= selectedDay.goalHours
                  ? 'Daily Target Achieved'
                  : `${Number((selectedDay.goalHours - selectedDay.totalHours).toFixed(1))}h below target`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Second Row: Performance Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                02. Daily Study Velocity & Weekly Target Trend
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Visualizing daily study hours logged against your {weeklyTargetHours}h weekly mandate
              </p>
            </div>
            <div className="text-xs font-mono tabular-nums text-emerald-400">
              {weeklyCompletedHours.toFixed(1)}h / {weeklyTargetHours}h This Week
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-3 items-end h-44 pt-4 px-2 bg-slate-950 border border-slate-800 rounded-xl p-4">
            {WEEKLY_DAILY_TREND.map((item) => {
              const heightPct = Math.min(100, Math.round((item.hours / 8) * 100));
              return (
                <div key={item.day} className="flex flex-col items-center h-full justify-end gap-2">
                  <span className="text-xs font-mono tabular-nums text-slate-300">
                    {item.hours}h
                  </span>
                  <div className="w-full max-w-[32px] bg-slate-800 rounded-t-md h-24 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-amber-500 rounded-t-md"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-400">{item.day}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Customizable Notification Reminders */}
        <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
              <Bell className="w-4 h-4 text-amber-400" />
              <div>
                <h2 className="text-lg font-semibold text-white">
                  03. Customizable Study Reminders
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daily prompts for Pomodoro sessions and weekly target completion
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="reminder-time-input" className="block text-xs font-medium text-slate-300 mb-1">
                  Primary Daily Study Alarm Time
                </label>
                <input
                  id="reminder-time-input"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-white"
                />
              </div>

              <div>
                <label htmlFor="reminder-cadence-select" className="block text-xs font-medium text-slate-300 mb-1">
                  Reminder Cadence & Deficit Alert Rule
                </label>
                <select
                  id="reminder-cadence-select"
                  value={reminderFrequency}
                  onChange={(e) => setReminderFrequency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Daily Morning & Evening">Daily Morning & Evening</option>
                  <option value="Every 3 Hours When Behind Weekly Target">Every 3 Hours When Behind Weekly Target</option>
                  <option value="Strict Tier-II Revision Bell Only">Strict Tier-II Revision Bell Only</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            {reminderSaved ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Reminder scheduled for {reminderTime} ({reminderFrequency})</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Alerts fire if daily study &lt; 5.0 hrs
              </span>
            )}
            <button
              type="button"
              onClick={handleTriggerBrowserReminder}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Save Reminder Rule
            </button>
          </div>
        </section>
      </div>

      {/* Bottom Row: Google Calendar Integration & Exam Deadline Scheduler */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">
                04. Google Calendar Sync & Intelligent Exam Scheduler
              </h2>
              <p className="text-xs text-slate-400">
                Sync upcoming SSC CGL exam dates, mock tests, and availability-based study blocks with Google Calendar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleFetchGoogleCalendarEvents}
              disabled={loadingCalendar}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg border border-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCalendar ? 'animate-spin' : ''}`} />
              <span>{isSignedInWithGoogle ? 'Import Availability from Google Calendar' : 'Connect Google Calendar'}</span>
            </button>
          </div>
        </div>

        {syncStatusMsg && (
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        {/* Add New Study Block / Exam Deadline */}
        <form onSubmit={handleAddScheduleBlock} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Event or Study Block Title (e.g. Tier-II Quant Mock #8)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
          />
          <input
            type="datetime-local"
            aria-label="Event Start Date and Time"
            value={newStart}
            onChange={(e) => setNewStart(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-slate-100"
          />
          <div className="flex gap-2">
            <select
              aria-label="Event Category"
              value={newType}
              onChange={(e) => setNewType(e.target.value as CalendarEventItem['type'])}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-100"
            >
              <option value="Study Block">Study Block</option>
              <option value="Mock Test">Mock Test</option>
              <option value="Exam Deadline">Exam Deadline</option>
            </select>
            <button
              type="submit"
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Scheduled Events List */}
        <div className="space-y-2">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs"
            >
              <div>
                <div className="font-semibold text-white">{ev.summary}</div>
                <div className="text-slate-400 mt-0.5 font-mono tabular-nums">
                  {ev.start.replace('T', ' ')} · {ev.type}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {ev.syncedWithGoogle ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Synced to Google Calendar</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmSyncEvent(ev)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
                  >
                    Push to Google Calendar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mandatory Confirmation Dialog for Mutating Google Calendar Events */}
      {confirmSyncEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-gcal-title"
        >
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 id="confirm-gcal-title" className="text-base font-semibold text-white">
              Confirm Google Calendar Event Creation
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to add <strong>&ldquo;[SSC CGL] {confirmSyncEvent.summary}&rdquo;</strong> scheduled at{' '}
              <span className="font-mono tabular-nums">{confirmSyncEvent.start.replace('T', ' ')}</span> to your primary Google Calendar?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmSyncEvent(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmedGoogleCalendarSync}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg"
              >
                Confirm & Add to Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
