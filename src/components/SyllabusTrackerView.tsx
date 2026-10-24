import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Search, PlusCircle, Sliders } from 'lucide-react';
import {
  SyllabusTopic,
  SubjectId,
  TopicStatus,
  SyllabusMetrics,
  ExamProfileConfig,
} from '../utils/sscLogic';

interface SyllabusTrackerViewProps {
  examProfile: ExamProfileConfig;
  topics: SyllabusTopic[];
  metrics: SyllabusMetrics;
  onUpdateTopicStatus: (topicId: string, status: TopicStatus) => void;
  onLogTopicHours: (topicId: string, hoursToAdd: number, pyqToAdd: number) => void;
  onAddCustomTopic: (
    subjectId: SubjectId,
    subjectName: string,
    title: string,
    targetHours: number,
    tier: string
  ) => void;
  onOpenExamCustomizer: () => void;
}

export const SyllabusTrackerView: React.FC<SyllabusTrackerViewProps> = ({
  examProfile,
  topics,
  metrics,
  onUpdateTopicStatus,
  onLogTopicHours,
  onAddCustomTopic,
  onOpenExamCustomizer,
}) => {
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TopicStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New Topic Modal/Form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState<string>(
    examProfile.subjects[0]?.id || 'quant'
  );
  const [newTargetHours, setNewTargetHours] = useState('12');
  const [newTier, setNewTier] = useState<string>(
    examProfile.tiers[0] || 'Stage-I & II'
  );

  const filteredTopics = topics.filter((t) => {
    if (subjectFilter !== 'all' && t.subjectId !== subjectFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (
      searchQuery.trim() &&
      !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const foundSub = examProfile.subjects.find((s) => s.id === newSubjectId);
    const subjectName = foundSub ? foundSub.name : examProfile.subjects[0]?.name || 'General';
    onAddCustomTopic(
      newSubjectId,
      subjectName,
      newTitle.trim(),
      Number(newTargetHours) || 10,
      newTier
    );
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Top Syllabus Completed vs Remaining Summary Bar */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">
                {examProfile.examName} Syllabus Mastery Ledger
              </h2>
              <button
                type="button"
                onClick={onOpenExamCustomizer}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Customize Subjects & Stages</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Track topic-wise completion, hours invested, and remaining syllabus workload across all {examProfile.subjects.length} subjects
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 bg-slate-950 border border-slate-800 rounded-xl px-5 py-3">
            <div>
              <div className="text-xs text-slate-400">Completed</div>
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-400">
                {metrics.completionPercentage}% ({metrics.totalLoggedHours}h)
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Remaining Left</div>
              <div className="text-lg font-bold font-mono tabular-nums text-amber-400">
                {metrics.remainingPercentage}% ({metrics.remainingHours}h)
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Modules Done</div>
              <div className="text-lg font-bold font-mono tabular-nums text-white">
                {metrics.completedTopics} / {metrics.totalTopics}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setSubjectFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                subjectFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Subjects
            </button>
            {examProfile.subjects.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSubjectFilter(sub.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 max-w-[180px] truncate ${
                  subjectFilter === sub.id
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              {(
                [
                  { id: 'all', label: 'All Status' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'in_progress', label: 'In Progress' },
                  { id: 'not_started', label: 'Remaining' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    statusFilter === st.id
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label="Search syllabus topics"
                placeholder="Search topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* High-Density Syllabus Data Table */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-xs text-slate-400">
                <th className="py-3 px-4 font-medium">Topic & Subject</th>
                <th className="py-3 px-4 font-medium">Exam Stage</th>
                <th className="py-3 px-4 font-medium text-right">Logged / Target</th>
                <th className="py-3 px-4 font-medium text-right">PYQs Solved</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {filteredTopics.map((topic) => {
                const pct = Math.min(100, Math.round((topic.loggedHours / topic.targetHours) * 100));
                return (
                  <tr key={topic.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-100">{topic.title}</div>
                      <div className="text-slate-500 mt-0.5">
                        {topic.subjectName} · {pct}% complete
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{topic.tier}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200 whitespace-nowrap">
                      {topic.loggedHours.toFixed(1)}h / {topic.targetHours}h
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-400 whitespace-nowrap">
                      {topic.pyqSolved}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-slate-200">
                        {topic.status === 'completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : topic.status === 'in_progress' ? (
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span>
                          {topic.status === 'completed'
                            ? 'Completed'
                            : topic.status === 'in_progress'
                            ? 'In Progress'
                            : 'Remaining'}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onLogTopicHours(topic.id, 1, 15)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-mono tabular-nums transition-colors"
                        >
                          +1h & 15 PYQ
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateTopicStatus(
                              topic.id,
                              topic.status === 'completed' ? 'in_progress' : 'completed'
                            )
                          }
                          className={`px-2.5 py-1 rounded font-medium transition-colors ${
                            topic.status === 'completed'
                              ? 'bg-slate-800 text-slate-400 hover:text-white'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                          }`}
                        >
                          {topic.status === 'completed' ? 'Reopen' : 'Mark Done'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Custom Syllabus Micro-Topic */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>Add Custom Syllabus Topic for {examProfile.examName}</span>
        </h3>
        <form onSubmit={handleCreateTopic} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Topic Title (e.g. Modern Indian History / Dynamic Programming)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
          />
          <select
            aria-label="Select Subject"
            value={newSubjectId}
            onChange={(e) => setNewSubjectId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
          >
            {examProfile.subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Select Exam Stage"
            value={newTier}
            onChange={(e) => setNewTier(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
          >
            {examProfile.tiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              aria-label="Target Hours"
              min="1"
              max="60"
              value={newTargetHours}
              onChange={(e) => setNewTargetHours(e.target.value)}
              className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-slate-100"
            />
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
            >
              Add Topic
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
