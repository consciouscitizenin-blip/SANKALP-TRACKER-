export type SubjectId = string;

export type TopicStatus = 'not_started' | 'in_progress' | 'completed';

export interface ExamSubjectDefinition {
  id: SubjectId;
  name: string;
}

export interface SyllabusTopic {
  id: string;
  subjectId: SubjectId;
  subjectName: string;
  tier: string;
  title: string;
  targetHours: number;
  loggedHours: number;
  status: TopicStatus;
  pyqSolved: number;
  lastStudiedDate?: string;
}

export interface ExamProfileConfig {
  id: string;
  examName: string;
  examCategory: string;
  targetPostOrRole: string;
  targetExamDate: string;
  weeklyTargetHours: number;
  dailyGoalHours: number;
  pomodoroFocusMinutes: number;
  pomodoroDeepMinutes: number;
  tiers: string[];
  subjects: ExamSubjectDefinition[];
}

export interface StudySessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  subjectId: SubjectId;
  topicId: string;
  durationHours: number;
  pomodorosCompleted: number;
  notes?: string;
}

export interface BlockedAppItem {
  id: string;
  name: string;
  domain: string;
  category: 'Entertainment' | 'Social Media' | 'Gaming' | 'Streaming';
  blockedDuringFocus: boolean;
  blockedOnWeeklyDeficit: boolean;
  interceptCount: number;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  requirementText: string;
}

export const INITIAL_SYLLABUS_TOPICS: SyllabusTopic[] = [
  // Quantitative Aptitude
  {
    id: 'quant-1',
    subjectId: 'quant',
    subjectName: 'Quantitative Aptitude',
    tier: 'Tier-I & II',
    title: 'Percentage, Ratio & Proportion',
    targetHours: 14,
    loggedHours: 14,
    status: 'completed',
    pyqSolved: 180,
    lastStudiedDate: '2026-10-20',
  },
  {
    id: 'quant-2',
    subjectId: 'quant',
    subjectName: 'Quantitative Aptitude',
    tier: 'Tier-I & II',
    title: 'Profit, Loss, Discount & Simple/Compound Interest',
    targetHours: 16,
    loggedHours: 16,
    status: 'completed',
    pyqSolved: 210,
    lastStudiedDate: '2026-10-21',
  },
  {
    id: 'quant-3',
    subjectId: 'quant',
    subjectName: 'Quantitative Aptitude',
    tier: 'Tier-I & II',
    title: 'Time & Work, Pipes & Cisterns, Time-Speed-Distance',
    targetHours: 18,
    loggedHours: 12.5,
    status: 'in_progress',
    pyqSolved: 145,
    lastStudiedDate: '2026-10-22',
  },
  {
    id: 'quant-4',
    subjectId: 'quant',
    subjectName: 'Quantitative Aptitude',
    tier: 'Tier-I & II',
    title: 'Elementary Algebra & Linear/Quadratic Equations',
    targetHours: 18,
    loggedHours: 9,
    status: 'in_progress',
    pyqSolved: 95,
    lastStudiedDate: '2026-10-23',
  },
  {
    id: 'quant-5',
    subjectId: 'quant',
    subjectName: 'Quantitative Aptitude',
    tier: 'Tier-I & II',
    title: 'Geometry: Triangles, Circles, Chords & Tangents',
    targetHours: 22,
    loggedHours: 6,
    status: 'in_progress',
    pyqSolved: 70,
  },
  {
    id: 'quant-6',
    subjectId: 'quant',
    subjectName: 'Quantitative Aptitude',
    tier: 'Tier-I & II',
    title: 'Mensuration 2D & 3D (Prism, Pyramid, Frustum)',
    targetHours: 20,
    loggedHours: 0,
    status: 'not_started',
    pyqSolved: 0,
  },
  {
    id: 'quant-7',
    subjectId: 'quant',
    subjectName: 'Quantitative Aptitude',
    tier: 'Tier-I & II',
    title: 'Trigonometry, Identities & Heights and Distances',
    targetHours: 16,
    loggedHours: 0,
    status: 'not_started',
    pyqSolved: 0,
  },
  {
    id: 'quant-8',
    subjectId: 'quant',
    subjectName: 'Quantitative Aptitude',
    tier: 'Tier-II Special',
    title: 'Statistics & Probability (Mean, Median, Mode, SD)',
    targetHours: 12,
    loggedHours: 0,
    status: 'not_started',
    pyqSolved: 0,
  },

  // English Language & Comprehension
  {
    id: 'eng-1',
    subjectId: 'english',
    subjectName: 'English Comprehension',
    tier: 'Tier-I & II',
    title: 'Subject-Verb Agreement, Tenses & Conditional Sentences',
    targetHours: 12,
    loggedHours: 12,
    status: 'completed',
    pyqSolved: 240,
    lastStudiedDate: '2026-10-19',
  },
  {
    id: 'eng-2',
    subjectId: 'english',
    subjectName: 'English Comprehension',
    tier: 'Tier-I & II',
    title: 'Active-Passive Voice & Direct-Indirect Narration',
    targetHours: 10,
    loggedHours: 10,
    status: 'completed',
    pyqSolved: 195,
    lastStudiedDate: '2026-10-21',
  },
  {
    id: 'eng-3',
    subjectId: 'english',
    subjectName: 'English Comprehension',
    tier: 'Tier-I & II',
    title: 'Vocabulary: Synonyms, Antonyms, One-Word & Idioms',
    targetHours: 20,
    loggedHours: 14,
    status: 'in_progress',
    pyqSolved: 310,
    lastStudiedDate: '2026-10-23',
  },
  {
    id: 'eng-4',
    subjectId: 'english',
    subjectName: 'English Comprehension',
    tier: 'Tier-I & II',
    title: 'Cloze Test, Sentence Rearrangement (Para Jumbles)',
    targetHours: 15,
    loggedHours: 6,
    status: 'in_progress',
    pyqSolved: 85,
  },
  {
    id: 'eng-5',
    subjectId: 'english',
    subjectName: 'English Comprehension',
    tier: 'Tier-II Special',
    title: 'Editorial & Multi-Paragraph Reading Comprehension',
    targetHours: 14,
    loggedHours: 0,
    status: 'not_started',
    pyqSolved: 0,
  },

  // General Intelligence & Reasoning
  {
    id: 'reas-1',
    subjectId: 'reasoning',
    subjectName: 'General Intelligence & Reasoning',
    tier: 'Tier-I & II',
    title: 'Coding-Decoding, Analogy & Number/Letter Series',
    targetHours: 12,
    loggedHours: 12,
    status: 'completed',
    pyqSolved: 220,
    lastStudiedDate: '2026-10-18',
  },
  {
    id: 'reas-2',
    subjectId: 'reasoning',
    subjectName: 'General Intelligence & Reasoning',
    tier: 'Tier-I & II',
    title: 'Syllogism, Venn Diagrams & Blood Relations',
    targetHours: 10,
    loggedHours: 10,
    status: 'completed',
    pyqSolved: 160,
    lastStudiedDate: '2026-10-20',
  },
  {
    id: 'reas-3',
    subjectId: 'reasoning',
    subjectName: 'General Intelligence & Reasoning',
    tier: 'Tier-I & II',
    title: 'Non-Verbal: Paper Folding, Mirror/Water Images & Cubes',
    targetHours: 10,
    loggedHours: 5.5,
    status: 'in_progress',
    pyqSolved: 90,
  },
  {
    id: 'reas-4',
    subjectId: 'reasoning',
    subjectName: 'General Intelligence & Reasoning',
    tier: 'Tier-II Special',
    title: 'Critical Thinking, Statement-Assumptions & Seating',
    targetHours: 12,
    loggedHours: 0,
    status: 'not_started',
    pyqSolved: 0,
  },

  // General Awareness & Computer Knowledge
  {
    id: 'ga-1',
    subjectId: 'ga',
    subjectName: 'General Awareness',
    tier: 'Tier-I & II',
    title: 'Indian Polity: Constitutional Articles, Amendments & CAG',
    targetHours: 16,
    loggedHours: 16,
    status: 'completed',
    pyqSolved: 260,
    lastStudiedDate: '2026-10-22',
  },
  {
    id: 'ga-2',
    subjectId: 'ga',
    subjectName: 'General Awareness',
    tier: 'Tier-I & II',
    title: 'Ancient, Medieval & Modern Indian National Movement',
    targetHours: 18,
    loggedHours: 11,
    status: 'in_progress',
    pyqSolved: 150,
    lastStudiedDate: '2026-10-23',
  },
  {
    id: 'ga-3',
    subjectId: 'ga',
    subjectName: 'General Awareness',
    tier: 'Tier-I & II',
    title: 'Indian & World Geography, Five-Year Plans & Fiscal Policy',
    targetHours: 16,
    loggedHours: 4,
    status: 'in_progress',
    pyqSolved: 60,
  },
  {
    id: 'ga-4',
    subjectId: 'ga',
    subjectName: 'General Awareness',
    tier: 'Tier-I & II',
    title: 'General Science (Physics, Chemistry, Biology) & Current Affairs',
    targetHours: 20,
    loggedHours: 0,
    status: 'not_started',
    pyqSolved: 0,
  },
  {
    id: 'ga-5',
    subjectId: 'ga',
    subjectName: 'General Awareness',
    tier: 'Tier-II Special',
    title: 'Computer Proficiency: OS, Networking, Cyber Security & MS Office',
    targetHours: 10,
    loggedHours: 0,
    status: 'not_started',
    pyqSolved: 0,
  },
];

export const EXAM_PRESETS: Record<
  string,
  {
    profile: ExamProfileConfig;
    topics: SyllabusTopic[];
  }
> = {
  'ssc-cgl': {
    profile: {
      id: 'ssc-cgl',
      examName: 'SSC CGL Tier-I & II',
      examCategory: 'Central Govt / Staff Selection Commission',
      targetPostOrRole: 'Inspector (Income Tax) / ASO in MEA',
      targetExamDate: '2026-12-15',
      weeklyTargetHours: 35,
      dailyGoalHours: 5,
      pomodoroFocusMinutes: 25,
      pomodoroDeepMinutes: 50,
      tiers: ['Tier-I & II', 'Tier-II Special'],
      subjects: [
        { id: 'quant', name: 'Quantitative Aptitude' },
        { id: 'english', name: 'English Comprehension' },
        { id: 'reasoning', name: 'General Intelligence & Reasoning' },
        { id: 'ga', name: 'General Awareness' },
      ],
    },
    topics: INITIAL_SYLLABUS_TOPICS,
  },
  'upsc-cse': {
    profile: {
      id: 'upsc-cse',
      examName: 'UPSC CSE (IAS / IPS)',
      examCategory: 'Civil Services Examination',
      targetPostOrRole: 'Indian Administrative Service (IAS)',
      targetExamDate: '2027-05-24',
      weeklyTargetHours: 45,
      dailyGoalHours: 6.5,
      pomodoroFocusMinutes: 30,
      pomodoroDeepMinutes: 60,
      tiers: ['Prelims + Mains', 'Mains Answer Writing', 'CSAT Qualifying'],
      subjects: [
        { id: 'gs1', name: 'GS-I: History, Art & Geography' },
        { id: 'gs2', name: 'GS-II: Polity, Governance & IR' },
        { id: 'gs3', name: 'GS-III: Economy, Environment & S&T' },
        { id: 'gs4', name: 'GS-IV: Ethics, Integrity & Optional' },
      ],
    },
    topics: [
      {
        id: 'upsc-1',
        subjectId: 'gs1',
        subjectName: 'GS-I: History, Art & Geography',
        tier: 'Prelims + Mains',
        title: 'Modern Indian History (1757–1947) & Freedom Struggle',
        targetHours: 28,
        loggedHours: 28,
        status: 'completed',
        pyqSolved: 160,
      },
      {
        id: 'upsc-2',
        subjectId: 'gs1',
        subjectName: 'GS-I: History, Art & Geography',
        tier: 'Prelims + Mains',
        title: 'Indian Art, Temple Architecture & Physical Geography',
        targetHours: 24,
        loggedHours: 14,
        status: 'in_progress',
        pyqSolved: 95,
      },
      {
        id: 'upsc-3',
        subjectId: 'gs2',
        subjectName: 'GS-II: Polity, Governance & IR',
        tier: 'Prelims + Mains',
        title: 'Constitutional Framework, Fundamental Rights & Judiciary',
        targetHours: 30,
        loggedHours: 30,
        status: 'completed',
        pyqSolved: 210,
      },
      {
        id: 'upsc-4',
        subjectId: 'gs2',
        subjectName: 'GS-II: Polity, Governance & IR',
        tier: 'Mains Answer Writing',
        title: 'Federalism, Parliamentary Committees & Bilateral Relations',
        targetHours: 22,
        loggedHours: 8,
        status: 'in_progress',
        pyqSolved: 60,
      },
      {
        id: 'upsc-5',
        subjectId: 'gs3',
        subjectName: 'GS-III: Economy, Environment & S&T',
        tier: 'Prelims + Mains',
        title: 'Monetary Policy, Union Budget, Inclusive Growth & Banking',
        targetHours: 26,
        loggedHours: 12,
        status: 'in_progress',
        pyqSolved: 110,
      },
      {
        id: 'upsc-6',
        subjectId: 'gs3',
        subjectName: 'GS-III: Economy, Environment & S&T',
        tier: 'Prelims + Mains',
        title: 'Biodiversity, Climate Conventions (COP) & Internal Security',
        targetHours: 24,
        loggedHours: 0,
        status: 'not_started',
        pyqSolved: 0,
      },
      {
        id: 'upsc-7',
        subjectId: 'gs4',
        subjectName: 'GS-IV: Ethics, Integrity & Optional',
        tier: 'Mains Answer Writing',
        title: 'Ethics Case Studies, Moral Thinkers & Optional Paper-I',
        targetHours: 35,
        loggedHours: 10,
        status: 'in_progress',
        pyqSolved: 45,
      },
    ],
  },
  'ibps-sbi-po': {
    profile: {
      id: 'ibps-sbi-po',
      examName: 'IBPS / SBI PO & RBI Grade B',
      examCategory: 'Banking & Financial Sector',
      targetPostOrRole: 'Probationary Officer (PO) / Central Bank Manager',
      targetExamDate: '2026-11-28',
      weeklyTargetHours: 32,
      dailyGoalHours: 4.5,
      pomodoroFocusMinutes: 25,
      pomodoroDeepMinutes: 45,
      tiers: ['Prelims + Mains', 'Mains High-Level DI & Puzzles'],
      subjects: [
        { id: 'di_quant', name: 'Data Interpretation & Quantitative Aptitude' },
        { id: 'puzzles', name: 'Reasoning Ability & High-Level Puzzles' },
        { id: 'bank_eng', name: 'English Language & Descriptive Essay' },
        { id: 'fin_aware', name: 'Banking, Economy & Financial Awareness' },
      ],
    },
    topics: [
      {
        id: 'bank-1',
        subjectId: 'di_quant',
        subjectName: 'Data Interpretation & Quantitative Aptitude',
        tier: 'Prelims + Mains',
        title: 'Caselet DI, Missing Radar/Pie Charts & Quadratic Equations',
        targetHours: 20,
        loggedHours: 20,
        status: 'completed',
        pyqSolved: 240,
      },
      {
        id: 'bank-2',
        subjectId: 'puzzles',
        subjectName: 'Reasoning Ability & High-Level Puzzles',
        tier: 'Mains High-Level DI & Puzzles',
        title: 'Circular/Linear Seating with Blood Relations & Floor-Flat Puzzles',
        targetHours: 24,
        loggedHours: 15,
        status: 'in_progress',
        pyqSolved: 180,
      },
      {
        id: 'bank-3',
        subjectId: 'bank_eng',
        subjectName: 'English Language & Descriptive Essay',
        tier: 'Prelims + Mains',
        title: 'Financial Editorial Reading Comprehension & Error Detection',
        targetHours: 16,
        loggedHours: 16,
        status: 'completed',
        pyqSolved: 190,
      },
      {
        id: 'bank-4',
        subjectId: 'fin_aware',
        subjectName: 'Banking, Economy & Financial Awareness',
        tier: 'Prelims + Mains',
        title: 'RBI Monetary Policy, Basel-III Norms, NPA & UPI Ecosystem',
        targetHours: 18,
        loggedHours: 6,
        status: 'in_progress',
        pyqSolved: 90,
      },
    ],
  },
  'jee-gate': {
    profile: {
      id: 'jee-gate',
      examName: 'GATE / JEE Engineering',
      examCategory: 'Technical & Engineering Entrance',
      targetPostOrRole: 'PSU Officer / IISc & IIT M.Tech / B.Tech Ranker',
      targetExamDate: '2027-02-07',
      weeklyTargetHours: 40,
      dailyGoalHours: 6,
      pomodoroFocusMinutes: 30,
      pomodoroDeepMinutes: 60,
      tiers: ['Core Concept + Numericals', 'Previous Year Ranker Problems'],
      subjects: [
        { id: 'eng_math', name: 'Engineering Mathematics & General Aptitude' },
        { id: 'core_1', name: 'Core Technical Subject I (Algorithms / Mechanics)' },
        { id: 'core_2', name: 'Core Technical Subject II (Systems / Networks)' },
        { id: 'core_3', name: 'Core Technical Subject III (Theory & Design)' },
      ],
    },
    topics: [
      {
        id: 'tech-1',
        subjectId: 'eng_math',
        subjectName: 'Engineering Mathematics & General Aptitude',
        tier: 'Core Concept + Numericals',
        title: 'Linear Algebra, Eigenvalues, Calculus & Probability Distributions',
        targetHours: 22,
        loggedHours: 22,
        status: 'completed',
        pyqSolved: 215,
      },
      {
        id: 'tech-2',
        subjectId: 'core_1',
        subjectName: 'Core Technical Subject I (Algorithms / Mechanics)',
        tier: 'Core Concept + Numericals',
        title: 'Dynamic Programming, Graph Traversals & Asymptotic Complexity',
        targetHours: 26,
        loggedHours: 16,
        status: 'in_progress',
        pyqSolved: 140,
      },
      {
        id: 'tech-3',
        subjectId: 'core_2',
        subjectName: 'Core Technical Subject II (Systems / Networks)',
        tier: 'Previous Year Ranker Problems',
        title: 'Process Synchronization, Virtual Memory Paging & TCP Congestion',
        targetHours: 24,
        loggedHours: 8,
        status: 'in_progress',
        pyqSolved: 85,
      },
      {
        id: 'tech-4',
        subjectId: 'core_3',
        subjectName: 'Core Technical Subject III (Theory & Design)',
        tier: 'Previous Year Ranker Problems',
        title: 'Normalized Relational Schemas, B+ Trees & Finite Automata',
        targetHours: 20,
        loggedHours: 0,
        status: 'not_started',
        pyqSolved: 0,
      },
    ],
  },
  'cat-mba': {
    profile: {
      id: 'cat-mba',
      examName: 'CAT / XAT Management',
      examCategory: 'Management Entrance (IIMs / XLRI)',
      targetPostOrRole: '99.8+ Percentile IIM Call',
      targetExamDate: '2026-11-29',
      weeklyTargetHours: 30,
      dailyGoalHours: 4.5,
      pomodoroFocusMinutes: 25,
      pomodoroDeepMinutes: 50,
      tiers: ['Sectional Speed Drill', 'CAT 99+ Percentile Advanced'],
      subjects: [
        { id: 'varc', name: 'VARC: Verbal Ability & Reading Comprehension' },
        { id: 'dilr', name: 'DILR: Data Interpretation & Logical Reasoning' },
        { id: 'qa_cat', name: 'QA: Quantitative Aptitude (Higher Math)' },
      ],
    },
    topics: [
      {
        id: 'cat-1',
        subjectId: 'varc',
        subjectName: 'VARC: Verbal Ability & Reading Comprehension',
        tier: 'Sectional Speed Drill',
        title: 'Philosophy & Economics Dense RCs, Para Summary & Odd Sentence',
        targetHours: 20,
        loggedHours: 20,
        status: 'completed',
        pyqSolved: 210,
      },
      {
        id: 'cat-2',
        subjectId: 'dilr',
        subjectName: 'DILR: Data Interpretation & Logical Reasoning',
        tier: 'CAT 99+ Percentile Advanced',
        title: 'Games & Tournaments, Maxima-Minima & Quantitative Reasoning Sets',
        targetHours: 25,
        loggedHours: 14,
        status: 'in_progress',
        pyqSolved: 95,
      },
      {
        id: 'cat-3',
        subjectId: 'qa_cat',
        subjectName: 'QA: Quantitative Aptitude (Higher Math)',
        tier: 'CAT 99+ Percentile Advanced',
        title: 'Number Theory, Functions, Logarithms & Modern Math',
        targetHours: 24,
        loggedHours: 8,
        status: 'in_progress',
        pyqSolved: 110,
      },
    ],
  },
};

export const INITIAL_BLOCKED_APPS: BlockedAppItem[] = [
  {
    id: 'blk-1',
    name: 'Netflix & Prime Video',
    domain: 'netflix.com / primevideo.com',
    category: 'Streaming',
    blockedDuringFocus: true,
    blockedOnWeeklyDeficit: true,
    interceptCount: 14,
  },
  {
    id: 'blk-2',
    name: 'Instagram Reels & Shorts',
    domain: 'instagram.com / youtube.com/shorts',
    category: 'Social Media',
    blockedDuringFocus: true,
    blockedOnWeeklyDeficit: true,
    interceptCount: 29,
  },
  {
    id: 'blk-3',
    name: 'Steam & BGMI Gaming Hub',
    domain: 'store.steampowered.com',
    category: 'Gaming',
    blockedDuringFocus: true,
    blockedOnWeeklyDeficit: true,
    interceptCount: 8,
  },
  {
    id: 'blk-4',
    name: 'X (Twitter) & Reddit Feeds',
    domain: 'x.com / reddit.com',
    category: 'Entertainment',
    blockedDuringFocus: true,
    blockedOnWeeklyDeficit: true,
    interceptCount: 19,
  },
];

export interface SyllabusMetrics {
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  completionPercentage: number;
  remainingPercentage: number;
  totalTargetHours: number;
  totalLoggedHours: number;
  remainingHours: number;
  subjectStats: Record<
    string,
    {
      subjectName: string;
      totalTopics: number;
      completedTopics: number;
      loggedHours: number;
      targetHours: number;
      percentHours: number;
    }
  >;
}

export function calculateSyllabusMetrics(
  topics: SyllabusTopic[],
  customSubjects?: ExamSubjectDefinition[]
): SyllabusMetrics {
  const totalTopics = topics.length;
  const completedTopics = topics.filter((t) => t.status === 'completed').length;
  const inProgressTopics = topics.filter((t) => t.status === 'in_progress').length;
  const notStartedTopics = topics.filter((t) => t.status === 'not_started').length;

  const totalTargetHours = topics.reduce((acc, t) => acc + t.targetHours, 0);
  const totalLoggedHours = topics.reduce((acc, t) => acc + Math.min(t.loggedHours, t.targetHours), 0);
  const remainingHours = Math.max(0, Number((totalTargetHours - totalLoggedHours).toFixed(1)));

  const completionPercentage =
    totalTargetHours > 0 ? Math.min(100, Math.round((totalLoggedHours / totalTargetHours) * 100)) : 0;
  const remainingPercentage = Math.max(0, 100 - completionPercentage);

  // Discover subjects dynamically from customSubjects + topics
  const subjectMap = new Map<string, string>();
  if (customSubjects && customSubjects.length > 0) {
    for (const s of customSubjects) {
      subjectMap.set(s.id, s.name);
    }
  }
  for (const t of topics) {
    if (!subjectMap.has(t.subjectId)) {
      subjectMap.set(t.subjectId, t.subjectName);
    }
  }

  const subjectStats: SyllabusMetrics['subjectStats'] = {};
  for (const [sid, sName] of subjectMap.entries()) {
    const subTopics = topics.filter((t) => t.subjectId === sid);
    const sTarget = subTopics.reduce((acc, t) => acc + t.targetHours, 0);
    const sLogged = subTopics.reduce((acc, t) => acc + Math.min(t.loggedHours, t.targetHours), 0);
    subjectStats[sid] = {
      subjectName: sName,
      totalTopics: subTopics.length,
      completedTopics: subTopics.filter((t) => t.status === 'completed').length,
      loggedHours: Number(sLogged.toFixed(1)),
      targetHours: sTarget,
      percentHours: sTarget > 0 ? Math.min(100, Math.round((sLogged / sTarget) * 100)) : 0,
    };
  }

  return {
    totalTopics,
    completedTopics,
    inProgressTopics,
    notStartedTopics,
    completionPercentage,
    remainingPercentage,
    totalTargetHours,
    totalLoggedHours: Number(totalLoggedHours.toFixed(1)),
    remainingHours,
    subjectStats,
  };
}

export function applyExamPreset(presetId: string): {
  profile: ExamProfileConfig;
  topics: SyllabusTopic[];
} {
  const found = EXAM_PRESETS[presetId] || EXAM_PRESETS['ssc-cgl'];
  return {
    profile: {
      ...found.profile,
      tiers: [...found.profile.tiers],
      subjects: found.profile.subjects.map((s) => ({ ...s })),
    },
    topics: found.topics.map((t) => ({ ...t })),
  };
}

export interface WeeklyEnforcementState {
  isDeficit: boolean;
  deficitHours: number;
  progressPercent: number;
  entertainmentBlocked: boolean;
  statusMessage: string;
}

export function evaluateWeeklyTargetLock(
  weeklyCompletedHours: number,
  weeklyTargetHours: number,
  strictEnforcementEnabled: boolean
): WeeklyEnforcementState {
  const safeTarget = Math.max(1, weeklyTargetHours);
  const safeCompleted = Math.max(0, weeklyCompletedHours);
  const deficitHours = Math.max(0, Number((safeTarget - safeCompleted).toFixed(1)));
  const isDeficit = deficitHours > 0;
  const progressPercent = Math.min(100, Math.round((safeCompleted / safeTarget) * 100));
  const entertainmentBlocked = strictEnforcementEnabled && isDeficit;

  const statusMessage = entertainmentBlocked
    ? `Entertainment Lockdown Active: Complete ${deficitHours}h more to unlock entertainment apps.`
    : isDeficit
    ? `${deficitHours}h remaining to reach your ${safeTarget}h weekly mandate.`
    : `Weekly target of ${safeTarget}h completed! Entertainment quarantine lifted.`;

  return {
    isDeficit,
    deficitHours,
    progressPercent,
    entertainmentBlocked,
    statusMessage,
  };
}

export function computeGamificationBadges(
  xpPoints: number,
  streakDays: number,
  completedTopics: number,
  weeklyHours: number,
  weeklyTargetHours = 35
): BadgeItem[] {
  return [
    {
      id: 'badge-streak-7',
      title: '7-Day Tapasya Streak',
      description: 'Maintain 7 consecutive days of focused exam study.',
      unlocked: streakDays >= 7,
      requirementText: `${Math.min(streakDays, 7)}/7 Days`,
    },
    {
      id: 'badge-topics-5',
      title: 'Syllabus Foundation Vanguard',
      description: 'Master at least 5 high-weightage syllabus modules for your target exam.',
      unlocked: completedTopics >= 5,
      requirementText: `${Math.min(completedTopics, 5)}/5 Topics`,
    },
    {
      id: 'badge-weekly-target',
      title: `${weeklyTargetHours}-Hour Weekly Mandate`,
      description: `Complete ${weeklyTargetHours}+ study hours in a single week to lift entertainment lock.`,
      unlocked: weeklyHours >= weeklyTargetHours,
      requirementText: `${Math.min(weeklyHours, weeklyTargetHours).toFixed(1)}/${weeklyTargetHours.toFixed(1)} Hrs`,
    },
    {
      id: 'badge-xp-2500',
      title: 'Top Ranker Contender',
      description: 'Accumulate 2,500+ XP through Pomodoro sessions and AI mock drills.',
      unlocked: xpPoints >= 2500,
      requirementText: `${Math.min(xpPoints, 2500)}/2500 XP`,
    },
  ];
}

export interface DailyRadialMetrics {
  dailyCompletedHours: number;
  dailyGoalHours: number;
  percentage: number;
  remainingDailyHours: number;
  isGoalMet: boolean;
  radius: number;
  circumference: number;
  strokeDashoffset: number;
}

export function calculateDailyRadialProgress(
  dailyCompletedHours: number,
  dailyGoalHours: number,
  radius = 52
): DailyRadialMetrics {
  const safeGoal = Math.max(0.5, Number(dailyGoalHours) || 5);
  const safeCompleted = Math.max(0, Number(dailyCompletedHours) || 0);
  const rawPct = (safeCompleted / safeGoal) * 100;
  const clampedPct = Math.min(100, Math.max(0, Math.round(rawPct)));
  const remainingDailyHours = Math.max(0, Number((safeGoal - safeCompleted).toFixed(1)));
  const circumference = Number((2 * Math.PI * radius).toFixed(2));
  const strokeDashoffset = Number(
    (circumference - (clampedPct / 100) * circumference).toFixed(2)
  );

  return {
    dailyCompletedHours: Number(safeCompleted.toFixed(1)),
    dailyGoalHours: Number(safeGoal.toFixed(1)),
    percentage: clampedPct,
    remainingDailyHours,
    isGoalMet: safeCompleted >= safeGoal,
    radius,
    circumference,
    strokeDashoffset,
  };
}

export type HeatmapIntensityLevel = 0 | 1 | 2 | 3 | 4;

export interface HourlyStudySegment {
  id: string;
  timeSlot: string;
  subjectName: string;
  topicTitle: string;
  durationHours: number;
  sessionType: 'Deep Work' | 'PYQ Drill' | 'Mock Analysis' | 'Concept Revision';
  pyqCount: number;
}

export interface CalendarHeatmapDay {
  date: string; // YYYY-MM-DD
  labelShort: string; // e.g. Oct 23
  dayOfMonth: number;
  weekdayShort: string; // Mon..Sun
  totalHours: number;
  goalHours: number;
  intensity: HeatmapIntensityLevel;
  streakActive: boolean;
  pomodoroCount: number;
  hourlyBreakdown: HourlyStudySegment[];
}

export function computeHeatmapIntensity(totalHours: number): HeatmapIntensityLevel {
  const hrs = Number(totalHours) || 0;
  if (hrs <= 0) return 0;
  if (hrs < 2.5) return 1;
  if (hrs < 4.5) return 2;
  if (hrs < 6.5) return 3;
  return 4;
}

const HEATMAP_BASE_DAYS: Array<{
  date: string;
  labelShort: string;
  dayOfMonth: number;
  weekdayShort: string;
  totalHours: number;
  streakActive: boolean;
  segments: Omit<HourlyStudySegment, 'id'>[];
}> = [
  {
    date: '2026-09-28',
    labelShort: 'Sep 28',
    dayOfMonth: 28,
    weekdayShort: 'Mon',
    totalHours: 4.5,
    streakActive: false,
    segments: [
      { timeSlot: '06:30 – 08:30', subjectName: 'Quantitative Aptitude', topicTitle: 'Percentage & Ratio Foundations', durationHours: 2.0, sessionType: 'Concept Revision', pyqCount: 35 },
      { timeSlot: '10:00 – 11:30', subjectName: 'English Comprehension', topicTitle: 'Subject-Verb Agreement Rules', durationHours: 1.5, sessionType: 'PYQ Drill', pyqCount: 50 },
      { timeSlot: '19:00 – 20:00', subjectName: 'General Awareness', topicTitle: 'Polity: Fundamental Rights Articles 12-35', durationHours: 1.0, sessionType: 'Concept Revision', pyqCount: 30 },
    ],
  },
  {
    date: '2026-09-29',
    labelShort: 'Sep 29',
    dayOfMonth: 29,
    weekdayShort: 'Tue',
    totalHours: 5.5,
    streakActive: false,
    segments: [
      { timeSlot: '06:00 – 08:30', subjectName: 'Quantitative Aptitude', topicTitle: 'Profit, Loss & Successive Discounts', durationHours: 2.5, sessionType: 'Deep Work', pyqCount: 48 },
      { timeSlot: '14:00 – 16:00', subjectName: 'General Intelligence & Reasoning', topicTitle: 'Coding-Decoding & Number Series', durationHours: 2.0, sessionType: 'PYQ Drill', pyqCount: 65 },
      { timeSlot: '20:00 – 21:00', subjectName: 'English Comprehension', topicTitle: 'BlackBook One-Word Substitutions', durationHours: 1.0, sessionType: 'Concept Revision', pyqCount: 40 },
    ],
  },
  {
    date: '2026-09-30',
    labelShort: 'Sep 30',
    dayOfMonth: 30,
    weekdayShort: 'Wed',
    totalHours: 3.0,
    streakActive: false,
    segments: [
      { timeSlot: '07:00 – 09:00', subjectName: 'General Awareness', topicTitle: 'Modern History: 1857 Revolt & INC Sessions', durationHours: 2.0, sessionType: 'Concept Revision', pyqCount: 45 },
      { timeSlot: '18:30 – 19:30', subjectName: 'Quantitative Aptitude', topicTitle: 'SI & CI Installment Problems', durationHours: 1.0, sessionType: 'PYQ Drill', pyqCount: 22 },
    ],
  },
  {
    date: '2026-10-01',
    labelShort: 'Oct 1',
    dayOfMonth: 1,
    weekdayShort: 'Thu',
    totalHours: 6.5,
    streakActive: false,
    segments: [
      { timeSlot: '06:00 – 09:00', subjectName: 'Quantitative Aptitude', topicTitle: 'Time & Work + Pipes & Cisterns Marathon', durationHours: 3.0, sessionType: 'Deep Work', pyqCount: 70 },
      { timeSlot: '11:30 – 13:30', subjectName: 'English Comprehension', topicTitle: 'Active-Passive & Direct-Indirect Narration', durationHours: 2.0, sessionType: 'PYQ Drill', pyqCount: 80 },
      { timeSlot: '17:30 – 19:00', subjectName: 'General Intelligence & Reasoning', topicTitle: 'Syllogism & Venn Diagrams', durationHours: 1.5, sessionType: 'Mock Analysis', pyqCount: 45 },
    ],
  },
  {
    date: '2026-10-02',
    labelShort: 'Oct 2',
    dayOfMonth: 2,
    weekdayShort: 'Fri',
    totalHours: 2.0,
    streakActive: false,
    segments: [
      { timeSlot: '08:00 – 10:00', subjectName: 'General Awareness', topicTitle: 'Gandhian Era & National Movement Revision', durationHours: 2.0, sessionType: 'Concept Revision', pyqCount: 55 },
    ],
  },
  {
    date: '2026-10-03',
    labelShort: 'Oct 3',
    dayOfMonth: 3,
    weekdayShort: 'Sat',
    totalHours: 7.0,
    streakActive: false,
    segments: [
      { timeSlot: '06:30 – 09:30', subjectName: 'Quantitative Aptitude', topicTitle: 'Full Tier-II Arithmetic Sectional Mock & Review', durationHours: 3.0, sessionType: 'Mock Analysis', pyqCount: 90 },
      { timeSlot: '12:00 – 14:30', subjectName: 'English Comprehension', topicTitle: 'Editorial Reading & Cloze Test Passages', durationHours: 2.5, sessionType: 'Deep Work', pyqCount: 60 },
      { timeSlot: '18:00 – 19:30', subjectName: 'General Awareness', topicTitle: 'Indian Economy: RBI Monetary Policy & Inflation', durationHours: 1.5, sessionType: 'Concept Revision', pyqCount: 35 },
    ],
  },
  {
    date: '2026-10-04',
    labelShort: 'Oct 4',
    dayOfMonth: 4,
    weekdayShort: 'Sun',
    totalHours: 0,
    streakActive: false,
    segments: [],
  },
  {
    date: '2026-10-05',
    labelShort: 'Oct 5',
    dayOfMonth: 5,
    weekdayShort: 'Mon',
    totalHours: 5.0,
    streakActive: false,
    segments: [
      { timeSlot: '06:30 – 09:00', subjectName: 'Quantitative Aptitude', topicTitle: 'Time, Speed, Distance & Relative Motion', durationHours: 2.5, sessionType: 'Deep Work', pyqCount: 52 },
      { timeSlot: '14:00 – 15:30', subjectName: 'General Intelligence & Reasoning', topicTitle: 'Blood Relations & Direction Sense', durationHours: 1.5, sessionType: 'PYQ Drill', pyqCount: 48 },
      { timeSlot: '20:00 – 21:00', subjectName: 'English Comprehension', topicTitle: 'Synonyms, Antonyms & Idioms Set #4', durationHours: 1.0, sessionType: 'Concept Revision', pyqCount: 45 },
    ],
  },
  {
    date: '2026-10-06',
    labelShort: 'Oct 6',
    dayOfMonth: 6,
    weekdayShort: 'Tue',
    totalHours: 4.0,
    streakActive: false,
    segments: [
      { timeSlot: '07:00 – 09:30', subjectName: 'Quantitative Aptitude', topicTitle: 'Boat & Stream + Circular Track Races', durationHours: 2.5, sessionType: 'PYQ Drill', pyqCount: 44 },
      { timeSlot: '19:00 – 20:30', subjectName: 'General Awareness', topicTitle: 'Geography: Himalayan River Systems & Passes', durationHours: 1.5, sessionType: 'Concept Revision', pyqCount: 38 },
    ],
  },
  {
    date: '2026-10-07',
    labelShort: 'Oct 7',
    dayOfMonth: 7,
    weekdayShort: 'Wed',
    totalHours: 5.5,
    streakActive: false,
    segments: [
      { timeSlot: '06:00 – 08:30', subjectName: 'Quantitative Aptitude', topicTitle: 'Algebraic Identities & Surds', durationHours: 2.5, sessionType: 'Deep Work', pyqCount: 58 },
      { timeSlot: '11:00 – 13:00', subjectName: 'English Comprehension', topicTitle: 'Para Jumbles (PQRS) & Sentence Connectors', durationHours: 2.0, sessionType: 'PYQ Drill', pyqCount: 50 },
      { timeSlot: '18:00 – 19:00', subjectName: 'General Intelligence & Reasoning', topicTitle: 'Non-Verbal: Mirror & Paper Folding', durationHours: 1.0, sessionType: 'PYQ Drill', pyqCount: 40 },
    ],
  },
  {
    date: '2026-10-08',
    labelShort: 'Oct 8',
    dayOfMonth: 8,
    weekdayShort: 'Thu',
    totalHours: 6.0,
    streakActive: false,
    segments: [
      { timeSlot: '06:30 – 09:30', subjectName: 'Quantitative Aptitude', topicTitle: 'Geometry: Triangle Centers (Incenter, Circumcenter)', durationHours: 3.0, sessionType: 'Deep Work', pyqCount: 62 },
      { timeSlot: '15:00 – 17:00', subjectName: 'General Awareness', topicTitle: 'Physics & Chemistry Everyday Science PYQs', durationHours: 2.0, sessionType: 'PYQ Drill', pyqCount: 75 },
      { timeSlot: '20:30 – 21:30', subjectName: 'English Comprehension', topicTitle: 'Error Spotting Tier-II Mixed Set', durationHours: 1.0, sessionType: 'PYQ Drill', pyqCount: 35 },
    ],
  },
  {
    date: '2026-10-09',
    labelShort: 'Oct 9',
    dayOfMonth: 9,
    weekdayShort: 'Fri',
    totalHours: 3.5,
    streakActive: false,
    segments: [
      { timeSlot: '07:00 – 09:00', subjectName: 'Quantitative Aptitude', topicTitle: 'Similarity & Congruence of Triangles', durationHours: 2.0, sessionType: 'Concept Revision', pyqCount: 36 },
      { timeSlot: '18:30 – 20:00', subjectName: 'English Comprehension', topicTitle: 'Reading Comprehension: Economics Passages', durationHours: 1.5, sessionType: 'Deep Work', pyqCount: 25 },
    ],
  },
  {
    date: '2026-10-10',
    labelShort: 'Oct 10',
    dayOfMonth: 10,
    weekdayShort: 'Sat',
    totalHours: 6.5,
    streakActive: false,
    segments: [
      { timeSlot: '07:00 – 10:00', subjectName: 'Quantitative Aptitude', topicTitle: 'All-India Tier-I Full Mock Test #11 + Error Log', durationHours: 3.0, sessionType: 'Mock Analysis', pyqCount: 100 },
      { timeSlot: '13:30 – 15:30', subjectName: 'General Intelligence & Reasoning', topicTitle: 'Missing Number Matrix & Seating Arrangement', durationHours: 2.0, sessionType: 'PYQ Drill', pyqCount: 55 },
      { timeSlot: '19:00 – 20:30', subjectName: 'General Awareness', topicTitle: 'Current Affairs: Sports, Awards & Appointments', durationHours: 1.5, sessionType: 'Concept Revision', pyqCount: 40 },
    ],
  },
  {
    date: '2026-10-11',
    labelShort: 'Oct 11',
    dayOfMonth: 11,
    weekdayShort: 'Sun',
    totalHours: 0,
    streakActive: false,
    segments: [],
  },
  {
    date: '2026-10-12',
    labelShort: 'Oct 12',
    dayOfMonth: 12,
    weekdayShort: 'Mon',
    totalHours: 1.5,
    streakActive: false,
    segments: [
      { timeSlot: '19:30 – 21:00', subjectName: 'English Comprehension', topicTitle: 'Light Vocabulary & Phrasal Verbs Recap', durationHours: 1.5, sessionType: 'Concept Revision', pyqCount: 35 },
    ],
  },
  // 11-Day Active Streak starts Oct 13 -> Oct 23
  {
    date: '2026-10-13',
    labelShort: 'Oct 13',
    dayOfMonth: 13,
    weekdayShort: 'Tue',
    totalHours: 5.0,
    streakActive: true,
    segments: [
      { timeSlot: '06:00 – 08:30', subjectName: 'Quantitative Aptitude', topicTitle: 'Circle Chords, Tangents & Secant Theorems', durationHours: 2.5, sessionType: 'Deep Work', pyqCount: 54 },
      { timeSlot: '14:00 – 15:30', subjectName: 'English Comprehension', topicTitle: 'Cloze Test High-Frequency Collocations', durationHours: 1.5, sessionType: 'PYQ Drill', pyqCount: 40 },
      { timeSlot: '20:00 – 21:00', subjectName: 'General Awareness', topicTitle: 'Parliamentary Committees & Constitutional Bodies', durationHours: 1.0, sessionType: 'Concept Revision', pyqCount: 30 },
    ],
  },
  {
    date: '2026-10-14',
    labelShort: 'Oct 14',
    dayOfMonth: 14,
    weekdayShort: 'Wed',
    totalHours: 5.5,
    streakActive: true,
    segments: [
      { timeSlot: '06:15 – 08:45', subjectName: 'Quantitative Aptitude', topicTitle: 'Cyclic Quadrilaterals & Tangents PYQ Sprint', durationHours: 2.5, sessionType: 'PYQ Drill', pyqCount: 64 },
      { timeSlot: '11:30 – 13:30', subjectName: 'General Intelligence & Reasoning', topicTitle: 'Cube, Dice & Embedded Figures', durationHours: 2.0, sessionType: 'PYQ Drill', pyqCount: 70 },
      { timeSlot: '19:00 – 20:00', subjectName: 'General Awareness', topicTitle: 'Biology: Human Digestive & Circulatory System', durationHours: 1.0, sessionType: 'Concept Revision', pyqCount: 35 },
    ],
  },
  {
    date: '2026-10-15',
    labelShort: 'Oct 15',
    dayOfMonth: 15,
    weekdayShort: 'Thu',
    totalHours: 4.5,
    streakActive: true,
    segments: [
      { timeSlot: '06:30 – 09:00', subjectName: 'Quantitative Aptitude', topicTitle: 'Linear & Quadratic Equations Roots Analysis', durationHours: 2.5, sessionType: 'Deep Work', pyqCount: 48 },
      { timeSlot: '17:30 – 19:30', subjectName: 'English Comprehension', topicTitle: 'Direct-Indirect Narration Tier-II Drill', durationHours: 2.0, sessionType: 'PYQ Drill', pyqCount: 75 },
    ],
  },
  {
    date: '2026-10-16',
    labelShort: 'Oct 16',
    dayOfMonth: 16,
    weekdayShort: 'Fri',
    totalHours: 6.5,
    streakActive: true,
    segments: [
      { timeSlot: '06:00 – 09:00', subjectName: 'Quantitative Aptitude', topicTitle: 'Algebra Degree Symmetry & Value Putting', durationHours: 3.0, sessionType: 'Deep Work', pyqCount: 68 },
      { timeSlot: '12:00 – 14:00', subjectName: 'General Awareness', topicTitle: 'Five-Year Plans, NITI Aayog & Fiscal Deficit', durationHours: 2.0, sessionType: 'Concept Revision', pyqCount: 50 },
      { timeSlot: '18:30 – 20:00', subjectName: 'General Intelligence & Reasoning', topicTitle: 'Statement-Conclusion & Critical Reasoning', durationHours: 1.5, sessionType: 'Mock Analysis', pyqCount: 36 },
    ],
  },
  {
    date: '2026-10-17',
    labelShort: 'Oct 17',
    dayOfMonth: 17,
    weekdayShort: 'Sat',
    totalHours: 7.5,
    streakActive: true,
    segments: [
      { timeSlot: '06:00 – 09:30', subjectName: 'Quantitative Aptitude', topicTitle: 'SSC CGL Tier-II Full Paper-I Simulation #12', durationHours: 3.5, sessionType: 'Mock Analysis', pyqCount: 110 },
      { timeSlot: '11:30 – 14:00', subjectName: 'English Comprehension', topicTitle: 'Mock Paper-I English Error & RC Deep Audit', durationHours: 2.5, sessionType: 'Mock Analysis', pyqCount: 65 },
      { timeSlot: '17:30 – 19:00', subjectName: 'General Awareness', topicTitle: 'Static GK: Classical Dances, Festivals & Temples', durationHours: 1.5, sessionType: 'Concept Revision', pyqCount: 50 },
    ],
  },
  {
    date: '2026-10-18',
    labelShort: 'Oct 18',
    dayOfMonth: 18,
    weekdayShort: 'Sun',
    totalHours: 3.5,
    streakActive: true,
    segments: [
      { timeSlot: '08:00 – 10:00', subjectName: 'General Intelligence & Reasoning', topicTitle: 'Coding-Decoding & Number Series Final Mastery', durationHours: 2.0, sessionType: 'PYQ Drill', pyqCount: 60 },
      { timeSlot: '18:00 – 19:30', subjectName: 'English Comprehension', topicTitle: 'Weekly Vocabulary Revision & Bookmark Drill', durationHours: 1.5, sessionType: 'Concept Revision', pyqCount: 50 },
    ],
  },
  {
    date: '2026-10-19',
    labelShort: 'Oct 19',
    dayOfMonth: 19,
    weekdayShort: 'Mon',
    totalHours: 5.5,
    streakActive: true,
    segments: [
      { timeSlot: '06:00 – 08:30', subjectName: 'Quantitative Aptitude', topicTitle: 'Percentage & Mixture Alligation Advanced Tier-II', durationHours: 2.5, sessionType: 'Deep Work', pyqCount: 55 },
      { timeSlot: '13:30 – 15:30', subjectName: 'English Comprehension', topicTitle: 'Subject-Verb Agreement & Conditional Sentences', durationHours: 2.0, sessionType: 'PYQ Drill', pyqCount: 70 },
      { timeSlot: '19:30 – 20:30', subjectName: 'General Awareness', topicTitle: 'Constitutional Amendments 42nd, 44th, 73rd & 74th', durationHours: 1.0, sessionType: 'Concept Revision', pyqCount: 32 },
    ],
  },
  {
    date: '2026-10-20',
    labelShort: 'Oct 20',
    dayOfMonth: 20,
    weekdayShort: 'Tue',
    totalHours: 6.0,
    streakActive: true,
    segments: [
      { timeSlot: '06:00 – 09:00', subjectName: 'Quantitative Aptitude', topicTitle: 'Ratio, Proportion & Partnership Completion', durationHours: 3.0, sessionType: 'Deep Work', pyqCount: 65 },
      { timeSlot: '14:00 – 16:00', subjectName: 'General Intelligence & Reasoning', topicTitle: 'Syllogism, Venn Diagrams & Blood Relations', durationHours: 2.0, sessionType: 'PYQ Drill', pyqCount: 60 },
      { timeSlot: '20:00 – 21:00', subjectName: 'General Awareness', topicTitle: 'Delhi Sultanate & Mughal Administration Notes', durationHours: 1.0, sessionType: 'Concept Revision', pyqCount: 28 },
    ],
  },
  {
    date: '2026-10-21',
    labelShort: 'Oct 21',
    dayOfMonth: 21,
    weekdayShort: 'Wed',
    totalHours: 4.5,
    streakActive: true,
    segments: [
      { timeSlot: '06:30 – 09:00', subjectName: 'Quantitative Aptitude', topicTitle: 'Profit, Loss & Compound Interest Final Drill', durationHours: 2.5, sessionType: 'PYQ Drill', pyqCount: 58 },
      { timeSlot: '18:00 – 20:00', subjectName: 'English Comprehension', topicTitle: 'Active-Passive & Voice Transformation Mastery', durationHours: 2.0, sessionType: 'PYQ Drill', pyqCount: 72 },
    ],
  },
  {
    date: '2026-10-22',
    labelShort: 'Oct 22',
    dayOfMonth: 22,
    weekdayShort: 'Thu',
    totalHours: 6.5,
    streakActive: true,
    segments: [
      { timeSlot: '06:00 – 09:00', subjectName: 'Quantitative Aptitude', topicTitle: 'Time-Speed-Distance & Relative Speed Problems', durationHours: 3.0, sessionType: 'Deep Work', pyqCount: 64 },
      { timeSlot: '12:00 – 14:00', subjectName: 'General Awareness', topicTitle: 'Union Budget 2026 & Economic Survey Highlights', durationHours: 2.0, sessionType: 'Concept Revision', pyqCount: 45 },
      { timeSlot: '18:30 – 20:00', subjectName: 'English Comprehension', topicTitle: 'Cloze Test & Para Jumbles Timed Set', durationHours: 1.5, sessionType: 'Mock Analysis', pyqCount: 42 },
    ],
  },
  {
    date: '2026-10-23',
    labelShort: 'Oct 23',
    dayOfMonth: 23,
    weekdayShort: 'Fri',
    totalHours: 3.0,
    streakActive: true,
    segments: [
      { timeSlot: '06:30 – 08:30', subjectName: 'Quantitative Aptitude', topicTitle: 'Elementary Algebra & Quadratic Equations', durationHours: 2.0, sessionType: 'Deep Work', pyqCount: 45 },
      { timeSlot: '10:00 – 11:00', subjectName: 'English Comprehension', topicTitle: 'Vocabulary: Synonyms, Antonyms & Idioms', durationHours: 1.0, sessionType: 'PYQ Drill', pyqCount: 35 },
    ],
  },
  {
    date: '2026-10-24',
    labelShort: 'Oct 24',
    dayOfMonth: 24,
    weekdayShort: 'Sat',
    totalHours: 4.0,
    streakActive: true,
    segments: [
      { timeSlot: '06:30 – 09:00', subjectName: 'Quantitative Aptitude', topicTitle: 'Geometry: Chords & Tangents Deep Work', durationHours: 2.5, sessionType: 'Deep Work', pyqCount: 50 },
      { timeSlot: '16:00 – 17:30', subjectName: 'General Intelligence & Reasoning', topicTitle: 'Analytical Puzzles & Matrix Coding', durationHours: 1.5, sessionType: 'PYQ Drill', pyqCount: 42 },
    ],
  },
  {
    date: '2026-10-25',
    labelShort: 'Oct 25',
    dayOfMonth: 25,
    weekdayShort: 'Sun',
    totalHours: 5.0,
    streakActive: true,
    segments: [
      { timeSlot: '07:00 – 10:00', subjectName: 'Quantitative Aptitude', topicTitle: 'All-India Live Mock Test #13 & Quant Solutions', durationHours: 3.0, sessionType: 'Mock Analysis', pyqCount: 100 },
      { timeSlot: '17:00 – 19:00', subjectName: 'General Awareness', topicTitle: 'Current Affairs October Digest & Science Revision', durationHours: 2.0, sessionType: 'Concept Revision', pyqCount: 60 },
    ],
  },
];

export function buildStudyHeatmapCalendar(
  dailyGoalHours = 5,
  todayOverrideHours?: number
): CalendarHeatmapDay[] {
  const safeGoal = Math.max(1, Number(dailyGoalHours) || 5);

  return HEATMAP_BASE_DAYS.map((item) => {
    const isToday = item.date === '2026-10-23';
    const effectiveTotal =
      isToday && typeof todayOverrideHours === 'number' && !Number.isNaN(todayOverrideHours)
        ? Math.max(0, Number(todayOverrideHours.toFixed(1)))
        : item.totalHours;

    let segments: HourlyStudySegment[] = item.segments.map((seg, idx) => ({
      ...seg,
      id: `${item.date}-seg-${idx + 1}`,
    }));

    if (isToday && typeof todayOverrideHours === 'number' && effectiveTotal !== item.totalHours) {
      const delta = Number((effectiveTotal - item.totalHours).toFixed(1));
      if (delta > 0) {
        segments = [
          ...segments,
          {
            id: `${item.date}-seg-extra`,
            timeSlot: '14:00 – ' + (delta >= 2 ? '16:00' : '15:30'),
            subjectName: 'Quantitative Aptitude',
            topicTitle: 'Logged Focus Session & Topic PYQ Drill',
            durationHours: delta,
            sessionType: 'Deep Work',
            pyqCount: Math.round(delta * 25),
          },
        ];
      }
    }

    const intensity = computeHeatmapIntensity(effectiveTotal);
    const pomodoroCount = Math.max(0, Math.round(effectiveTotal * 1.2));

    return {
      date: item.date,
      labelShort: item.labelShort,
      dayOfMonth: item.dayOfMonth,
      weekdayShort: item.weekdayShort,
      totalHours: effectiveTotal,
      goalHours: safeGoal,
      intensity,
      streakActive: item.streakActive && effectiveTotal > 0,
      pomodoroCount,
      hourlyBreakdown: segments,
    };
  });
}

export interface SmartFocusRecommendation {
  topic: SyllabusTopic;
  remainingTopicHours: number;
  daysUntilExam: number;
  urgencyLevel: 'Critical' | 'High Priority' | 'Steady Pace';
  urgencyScore: number;
  recommendedDailyAllocationHours: number;
  recommendedPomoMode: 'focus25' | 'deep50';
  rationale: string;
}

export function computeSmartFocusTopic(
  topics: SyllabusTopic[],
  targetExamDate: string,
  currentDateStr = '2026-10-23'
): SmartFocusRecommendation | null {
  const candidates = topics.filter(
    (t) => t.status !== 'completed' && Number((t.targetHours - t.loggedHours).toFixed(1)) > 0
  );
  if (candidates.length === 0) {
    return null;
  }

  const nowMs = new Date(`${currentDateStr}T00:00:00Z`).getTime();
  const examMs = new Date(`${targetExamDate}T00:00:00Z`).getTime();
  const rawDays = Number.isNaN(examMs)
    ? 45
    : Math.ceil((examMs - nowMs) / (1000 * 60 * 60 * 24));
  const daysUntilExam = Math.max(1, rawDays);

  // Proximity multiplier increases urgency as the exam date approaches
  const proximityMultiplier = 1 + Math.min(2.0, 45 / daysUntilExam);

  const scored = candidates.map((topic) => {
    const remainingTopicHours = Math.max(
      0.5,
      Number((topic.targetHours - topic.loggedHours).toFixed(1))
    );
    const tierWeight =
      topic.tier.includes('Tier-I') || topic.tier.includes('Prelims') ? 1.2 : 1.05;
    const unstartedHeavyWeight =
      topic.loggedHours === 0 && remainingTopicHours >= 16 ? 1.15 : 1.0;

    const urgencyScore = Number(
      (remainingTopicHours * tierWeight * unstartedHeavyWeight * proximityMultiplier).toFixed(1)
    );

    return {
      topic,
      remainingTopicHours,
      urgencyScore,
    };
  });

  scored.sort((a, b) => {
    if (b.urgencyScore !== a.urgencyScore) {
      return b.urgencyScore - a.urgencyScore;
    }
    return b.remainingTopicHours - a.remainingTopicHours;
  });

  const best = scored[0];
  const urgencyLevel: SmartFocusRecommendation['urgencyLevel'] =
    daysUntilExam <= 30 || best.remainingTopicHours >= 16
      ? 'Critical'
      : daysUntilExam <= 60 || best.remainingTopicHours >= 10
      ? 'High Priority'
      : 'Steady Pace';

  const recommendedPomoMode: 'focus25' | 'deep50' =
    best.remainingTopicHours >= 4 ? 'deep50' : 'focus25';

  const recommendedDailyAllocationHours = Number(
    Math.min(3.5, Math.max(0.8, best.remainingTopicHours / Math.min(daysUntilExam, 14))).toFixed(1)
  );

  const rationale = `${best.remainingTopicHours}h remaining with ${daysUntilExam}d until exam — highest uncompleted ${best.topic.tier} backlog (${recommendedDailyAllocationHours}h/day recommended).`;

  return {
    topic: best.topic,
    remainingTopicHours: best.remainingTopicHours,
    daysUntilExam,
    urgencyLevel,
    urgencyScore: best.urgencyScore,
    recommendedDailyAllocationHours,
    recommendedPomoMode,
    rationale,
  };
}

export type FocusAudioCategory = 'lofi' | 'whitenoise';

export interface FocusAudioTrack {
  id: string;
  title: string;
  subtitle: string;
  category: FocusAudioCategory;
  bpmOrFreq: string;
  recommendedFor: string;
  synthProfile:
    | 'warm-lofi-pad'
    | 'rain-vinyl-lofi'
    | 'binaural-alpha'
    | 'deep-brown-noise'
    | 'pure-white-noise'
    | 'library-pink-rain';
}

export const FOCUS_AUDIO_TRACKS: FocusAudioTrack[] = [
  {
    id: 'lofi-late-night',
    title: 'Late Night Library Lo-Fi',
    subtitle: 'Warm electric Rhodes chords & vinyl crackle',
    category: 'lofi',
    bpmOrFreq: '72 BPM · Warm Pad',
    recommendedFor: 'Quantitative Aptitude & PYQ Drills',
    synthProfile: 'warm-lofi-pad',
  },
  {
    id: 'lofi-monsoon-vinyl',
    title: 'Monsoon Study Room Beats',
    subtitle: 'Mellow tape-saturated keys & soft rain texture',
    category: 'lofi',
    bpmOrFreq: '68 BPM · Tape Lo-Fi',
    recommendedFor: 'Reading Comprehension & Editorial Notes',
    synthProfile: 'rain-vinyl-lofi',
  },
  {
    id: 'lofi-alpha-synth',
    title: '40Hz Alpha Wave Lo-Fi Synth',
    subtitle: 'Binaural harmonic drone for sustained recall',
    category: 'lofi',
    bpmOrFreq: '432 Hz · Binaural',
    recommendedFor: 'General Awareness & Polity Memorization',
    synthProfile: 'binaural-alpha',
  },
  {
    id: 'noise-deep-brown',
    title: 'Deep Brown Focus Noise',
    subtitle: 'Low-frequency acoustic masking for zero distraction',
    category: 'whitenoise',
    bpmOrFreq: '180 Hz Low-Pass',
    recommendedFor: '50m Deep Work & Geometry Proofs',
    synthProfile: 'deep-brown-noise',
  },
  {
    id: 'noise-pure-white',
    title: 'Pure White Noise Blocker',
    subtitle: 'Full-spectrum ambient shield against household chatter',
    category: 'whitenoise',
    bpmOrFreq: 'Flat Spectrum',
    recommendedFor: 'Timed Mock Tests & Speed Drills',
    synthProfile: 'pure-white-noise',
  },
  {
    id: 'noise-pink-rain',
    title: 'Soft Pink Rain & Library Hum',
    subtitle: 'Balanced octave-filtered rain & quiet reading hall',
    category: 'whitenoise',
    bpmOrFreq: '-3 dB/Oct Pink',
    recommendedFor: 'Late Evening Revision & Error Logs',
    synthProfile: 'library-pink-rain',
  },
];

export function getFocusAudioTracksByCategory(category: FocusAudioCategory): FocusAudioTrack[] {
  return FOCUS_AUDIO_TRACKS.filter((track) => track.category === category);
}

export type UploadedResourceType = 'pdf' | 'file' | 'url' | 'image';

export interface UploadedStudyResource {
  id: string;
  type: UploadedResourceType;
  title: string;
  sourceUrl?: string;
  mimeType?: string;
  sizeLabel: string;
  extractedText: string;
  base64Data?: string;
  addedAt: string;
}

export function validateWebsiteResourceUrl(rawUrl: string): {
  valid: boolean;
  normalizedUrl: string;
  hostname: string;
  error?: string;
} {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed || trimmed.length < 4) {
    return {
      valid: false,
      normalizedUrl: '',
      hostname: '',
      error: 'Please enter a valid website URL (e.g., https://pib.gov.in or wikipedia.org).',
    };
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return {
        valid: false,
        normalizedUrl: '',
        hostname: '',
        error: 'URL must include a valid domain name (e.g., ncert.nic.in).',
      };
    }
    return {
      valid: true,
      normalizedUrl: parsed.toString(),
      hostname: parsed.hostname.replace(/^www\./i, ''),
    };
  } catch {
    return {
      valid: false,
      normalizedUrl: '',
      hostname: '',
      error: 'Invalid URL format. Please enter a valid web address.',
    };
  }
}

export function compileResourceContextPayload(
  resources: UploadedStudyResource[],
  manualNotes: string
): {
  combinedText: string;
  inlineParts: { mimeType: string; data: string }[];
  urls: string[];
  resourceTitles: string[];
  sourceSummary: string;
} {
  const inlineParts: { mimeType: string; data: string }[] = [];
  const urls: string[] = [];
  const resourceTitles: string[] = [];
  const textBlocks: string[] = [];

  for (const res of resources) {
    resourceTitles.push(res.title);
    if (res.type === 'url' && res.sourceUrl) {
      urls.push(res.sourceUrl);
    }
    if (res.base64Data && res.mimeType) {
      inlineParts.push({
        mimeType: res.mimeType,
        data: res.base64Data,
      });
    }
    if (res.extractedText && res.extractedText.trim()) {
      textBlocks.push(`[Source (${res.type.toUpperCase()}): ${res.title}]\n${res.extractedText.trim()}`);
    }
  }

  if (manualNotes && manualNotes.trim()) {
    textBlocks.push(`[Manual Study Notes]\n${manualNotes.trim()}`);
  }

  const pdfCount = resources.filter((r) => r.type === 'pdf').length;
  const fileCount = resources.filter((r) => r.type === 'file' || r.type === 'image').length;
  const urlCount = resources.filter((r) => r.type === 'url').length;

  const summaryParts: string[] = [];
  if (pdfCount > 0) summaryParts.push(`${pdfCount} PDF${pdfCount > 1 ? 's' : ''}`);
  if (fileCount > 0) summaryParts.push(`${fileCount} File${fileCount > 1 ? 's' : ''}`);
  if (urlCount > 0) summaryParts.push(`${urlCount} Website Link${urlCount > 1 ? 's' : ''}`);
  if (manualNotes && manualNotes.trim()) summaryParts.push('Lecture Notes');

  return {
    combinedText: textBlocks.join('\n\n'),
    inlineParts,
    urls,
    resourceTitles,
    sourceSummary: summaryParts.length > 0 ? summaryParts.join(' + ') : 'No Sources Attached',
  };
}

export type ThemeVariant = 'midnight' | 'obsidian' | 'emerald' | 'saffron' | 'amethyst' | 'coffee';

export interface ThemeConfig {
  id: ThemeVariant;
  label: string;
  mood: string;
  subtitle: string;
  description: string;
  contrastRatioLabel: string;
  canvasBg: string;
  surfaceBg: string;
  elevatedBg: string;
  borderHex: string;
  accentHex: string;
  secondaryTextHex: string;
}

export const THEMES: Record<ThemeVariant, ThemeConfig> = {
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    mood: 'Calm & Balanced',
    subtitle: 'Deep Navy Slate',
    description: 'Balanced cool-slate command deck with refined navy surfaces and warm gold accents.',
    contrastRatioLabel: 'WCAG AA+ (12.4:1)',
    canvasBg: '#080E1E',
    surfaceBg: '#10192D',
    elevatedBg: '#192540',
    borderHex: '#2B3C5E',
    accentHex: '#F59E0B',
    secondaryTextHex: '#CBD5E1',
  },
  obsidian: {
    id: 'obsidian',
    label: 'Obsidian',
    mood: 'Zero-Glare Focus',
    subtitle: 'High-Contrast Carbon',
    description: 'Pitch-black OLED carbon canvas with crisp structural borders and luminous gold/emerald accents for maximum readability.',
    contrastRatioLabel: 'WCAG AAA (18.6:1)',
    canvasBg: '#030305',
    surfaceBg: '#0B0C10',
    elevatedBg: '#141720',
    borderHex: '#434C66',
    accentHex: '#FACC15',
    secondaryTextHex: '#E2E8F0',
  },
  emerald: {
    id: 'emerald',
    label: 'Forest Zen',
    mood: 'Stress-Free & Calm',
    subtitle: 'Botanical Pine',
    description: 'Soothing deep forest pine surfaces with vibrant mint-jade highlights to reduce eye fatigue during long reading marathons.',
    contrastRatioLabel: 'WCAG AAA (14.2:1)',
    canvasBg: '#04130E',
    surfaceBg: '#092018',
    elevatedBg: '#113025',
    borderHex: '#1F4E3D',
    accentHex: '#10B981',
    secondaryTextHex: '#D1FAE5',
  },
  saffron: {
    id: 'saffron',
    label: 'Tapasya Dawn',
    mood: 'Energized Sprint',
    subtitle: 'Warm Gurukul Amber',
    description: 'High-energy warm espresso-maroon canvas paired with radiant saffron-orange accents for intense PYQ and mock test sprints.',
    contrastRatioLabel: 'WCAG AA+ (13.8:1)',
    canvasBg: '#140906',
    surfaceBg: '#21100B',
    elevatedBg: '#311912',
    borderHex: '#542D20',
    accentHex: '#F97316',
    secondaryTextHex: '#FFEDD5',
  },
  amethyst: {
    id: 'amethyst',
    label: 'Cosmic Synth',
    mood: 'Late-Night Flow',
    subtitle: 'Indigo Astral',
    description: 'Immersive deep violet-indigo workspace with electric cyan-blue accents engineered for late-night quantitative problem solving.',
    contrastRatioLabel: 'WCAG AA+ (13.5:1)',
    canvasBg: '#0B0719',
    surfaceBg: '#140E2B',
    elevatedBg: '#201742',
    borderHex: '#3B2C70',
    accentHex: '#38BDF8',
    secondaryTextHex: '#E0E7FF',
  },
  coffee: {
    id: 'coffee',
    label: 'Mocha Library',
    mood: 'Cozy Reading',
    subtitle: 'Roasted Espresso',
    description: 'Warm roasted coffee-bean surfaces with soft caramel-gold highlights that mimic a quiet late-evening library study desk.',
    contrastRatioLabel: 'WCAG AA+ (13.1:1)',
    canvasBg: '#100C08',
    surfaceBg: '#1B150E',
    elevatedBg: '#281F15',
    borderHex: '#463727',
    accentHex: '#FBBF24',
    secondaryTextHex: '#F5F5F4',
  },
};

export const THEME_LIST: ThemeConfig[] = [
  THEMES.midnight,
  THEMES.obsidian,
  THEMES.emerald,
  THEMES.saffron,
  THEMES.amethyst,
  THEMES.coffee,
];

export function getThemeConfig(variant?: string | null): ThemeConfig {
  if (variant && variant in THEMES) {
    return THEMES[variant as ThemeVariant];
  }
  return THEMES.midnight;
}

export type LocalAIModelMode = 'balanced' | 'pyq_intensive' | 'backlog_crush' | 'exam_sprint';

export interface LocalAIPerformanceSuggestion {
  id: string;
  category: 'Bottleneck Focus' | 'PYQ Speed Drill' | 'Pace Calibration' | 'Retention & Revision';
  title: string;
  rationale: string;
  expectedImpactPct: number;
  actionLabel: string;
  actionType: 'start_focus_topic' | 'log_pyq_sprint' | 'calibrate_weekly_target';
  targetTopicId?: string;
  recommendedHours?: number;
  recommendedWeeklyTarget?: number;
  recommendedPomoMode?: 'focus25' | 'deep50';
}

export interface LocalAIPerformanceReport {
  modelVersion: string;
  mode: LocalAIModelMode;
  readinessScore: number;
  projectedReadinessScore: number;
  projectedImprovementDelta: number;
  readinessGrade: 'Elite Ranker Track' | 'Selection Ready' | 'Borderline Contender' | 'Critical Deficit';
  featureScores: {
    syllabusMasteryScore: number;
    pyqDensityScore: number;
    weeklyVelocityScore: number;
    consistencyScore: number;
  };
  pyqPerHourRate: number;
  totalPyqSolved: number;
  weakestSubject: {
    subjectId: string;
    subjectName: string;
    percentHours: number;
    remainingHours: number;
  };
  bottleneckTopic: {
    id: string;
    title: string;
    subjectName: string;
    deficitHours: number;
    pyqSolved: number;
  };
  diagnosticSummary: string;
  suggestions: LocalAIPerformanceSuggestion[];
}

export interface LocalAIModelInput {
  topics: SyllabusTopic[];
  metrics: SyllabusMetrics;
  dailyCompletedHours: number;
  dailyGoalHours: number;
  weeklyCompletedHours: number;
  weeklyTargetHours: number;
  streakDays: number;
  targetExamDate?: string;
  mode?: LocalAIModelMode;
  simulatedExtraDailyHours?: number;
  referenceDateStr?: string;
}

export const LOCAL_AI_MODES: {
  id: LocalAIModelMode;
  label: string;
  shortDesc: string;
  weights: { syllabus: number; pyq: number; velocity: number; consistency: number };
}[] = [
  {
    id: 'balanced',
    label: 'Balanced Ranker',
    shortDesc: 'Equal emphasis on syllabus coverage, PYQ speed, and daily pace',
    weights: { syllabus: 0.35, pyq: 0.3, velocity: 0.2, consistency: 0.15 },
  },
  {
    id: 'pyq_intensive',
    label: 'PYQ Speed & Accuracy',
    shortDesc: 'Prioritizes high-density Previous Year Question solving per hour',
    weights: { syllabus: 0.2, pyq: 0.5, velocity: 0.2, consistency: 0.1 },
  },
  {
    id: 'backlog_crush',
    label: 'Backlog Crusher',
    shortDesc: 'Targets high-deficit uncompleted modules and heavy Tier-I/II topics',
    weights: { syllabus: 0.5, pyq: 0.15, velocity: 0.25, consistency: 0.1 },
  },
  {
    id: 'exam_sprint',
    label: 'Final Exam Sprint',
    shortDesc: 'Maximizes weekly study velocity and rapid revision before exam day',
    weights: { syllabus: 0.3, pyq: 0.3, velocity: 0.3, consistency: 0.1 },
  },
];

export function runSankalpLocalAIModel(input: LocalAIModelInput): LocalAIPerformanceReport {
  const mode: LocalAIModelMode = input.mode || 'balanced';
  const modeConfig = LOCAL_AI_MODES.find((m) => m.id === mode) || LOCAL_AI_MODES[0];
  const extraDaily = Math.max(0, Math.min(6, Number(input.simulatedExtraDailyHours || 0)));

  const safeTopics = input.topics.length > 0 ? input.topics : INITIAL_SYLLABUS_TOPICS;
  const totalLogged = Math.max(1, input.metrics.totalLoggedHours);
  const totalPyqSolved = safeTopics.reduce((sum, t) => sum + (t.pyqSolved || 0), 0);
  const pyqPerHourRate = Number((totalPyqSolved / totalLogged).toFixed(1));

  // 1. Compute 4 normalized feature scores (0 - 100)
  const syllabusMasteryScore = Math.min(
    100,
    Math.round(
      input.metrics.completionPercentage * 0.65 +
        (input.metrics.completedTopics / Math.max(1, input.metrics.totalTopics)) * 100 * 0.35
    )
  );

  // Benchmark: 11 PYQs per study hour = 100% density score
  const pyqDensityScore = Math.min(100, Math.round((pyqPerHourRate / 11) * 100));

  // Weekly & Daily Velocity score
  const weeklyRatio = input.weeklyCompletedHours / Math.max(1, input.weeklyTargetHours);
  const dailyRatio = input.dailyCompletedHours / Math.max(1, input.dailyGoalHours || 5);
  const weeklyVelocityScore = Math.min(
    100,
    Math.round((Math.min(1.15, weeklyRatio) * 0.65 + Math.min(1.15, dailyRatio) * 0.35) * 100)
  );

  // Streak consistency score (14-day streak = 100%)
  const consistencyScore = Math.min(100, Math.round((Math.min(14, Math.max(0, input.streakDays)) / 14) * 100));

  // Weighted Readiness Score
  const rawReadiness =
    syllabusMasteryScore * modeConfig.weights.syllabus +
    pyqDensityScore * modeConfig.weights.pyq +
    weeklyVelocityScore * modeConfig.weights.velocity +
    consistencyScore * modeConfig.weights.consistency;

  const readinessScore = Math.max(8, Math.min(99, Math.round(rawReadiness)));

  // Identify weakest subject
  const subjectEntries = Object.entries(input.metrics.subjectStats);
  let weakestSubject = {
    subjectId: 'quant',
    subjectName: 'Quantitative Aptitude',
    percentHours: 0,
    remainingHours: 0,
  };

  if (subjectEntries.length > 0) {
    const sortedSubjects = [...subjectEntries].sort((a, b) => {
      if (a[1].percentHours !== b[1].percentHours) {
        return a[1].percentHours - b[1].percentHours;
      }
      const remA = a[1].targetHours - a[1].loggedHours;
      const remB = b[1].targetHours - b[1].loggedHours;
      return remB - remA;
    });
    const [sid, sstat] = sortedSubjects[0];
    weakestSubject = {
      subjectId: sid,
      subjectName: sstat.subjectName,
      percentHours: sstat.percentHours,
      remainingHours: Math.max(0, Number((sstat.targetHours - sstat.loggedHours).toFixed(1))),
    };
  }

  // Identify #1 bottleneck topic based on active mode
  const uncompleted = safeTopics.filter((t) => t.status !== 'completed' && t.targetHours > t.loggedHours);
  const candidatePool = uncompleted.length > 0 ? uncompleted : safeTopics;

  const scoredCandidates = candidatePool.map((t) => {
    const deficitHours = Math.max(0, Number((t.targetHours - t.loggedHours).toFixed(1)));
    const topicPyqRate = t.loggedHours > 0 ? t.pyqSolved / t.loggedHours : 0;
    const tierStr = t.tier || 'Tier-I';
    const tierMultiplier = tierStr.includes('II') || tierStr.includes('Mains') ? 1.3 : 1.0;

    let priorityScore = deficitHours * tierMultiplier;
    if (mode === 'pyq_intensive') {
      priorityScore = (15 - Math.min(15, topicPyqRate)) * 2.2 + deficitHours * 0.6;
    } else if (mode === 'backlog_crush') {
      priorityScore = deficitHours * 1.8 * tierMultiplier;
    } else if (mode === 'exam_sprint') {
      priorityScore = deficitHours * 1.2 + (t.status === 'in_progress' ? 8 : 0);
    }

    return {
      topic: t,
      deficitHours,
      topicPyqRate,
      priorityScore,
    };
  });

  scoredCandidates.sort((a, b) => b.priorityScore - a.priorityScore);
  const topBottleneck = scoredCandidates[0];

  // Low PYQ density topic for targeted PYQ drill suggestion
  const lowPyqCandidates = [...candidatePool].sort((a, b) => {
    const rateA = a.loggedHours > 0 ? a.pyqSolved / a.loggedHours : 0;
    const rateB = b.loggedHours > 0 ? b.pyqSolved / b.loggedHours : 0;
    if (rateA !== rateB) return rateA - rateB;
    return b.targetHours - a.targetHours;
  });
  const pyqTargetTopic =
    lowPyqCandidates.find((t) => t.id !== topBottleneck.topic.id) || topBottleneck.topic;

  // Projected 14-day score improvement calculation
  const baseSuggestedGain = mode === 'exam_sprint' ? 6 : mode === 'pyq_intensive' ? 5 : 4;
  const extraHoursOver14Days = extraDaily * 14;
  const syllabusBoostPct =
    (extraHoursOver14Days / Math.max(20, input.metrics.totalTargetHours)) * 100 * 0.7;
  const velocityBoostPct = extraDaily * 3.2;

  const projectedImprovementDelta = Math.max(
    3,
    Math.min(
      100 - readinessScore,
      Math.round(baseSuggestedGain + syllabusBoostPct + velocityBoostPct)
    )
  );
  const projectedReadinessScore = Math.min(99, readinessScore + projectedImprovementDelta);

  const readinessGrade: LocalAIPerformanceReport['readinessGrade'] =
    readinessScore >= 82
      ? 'Elite Ranker Track'
      : readinessScore >= 65
      ? 'Selection Ready'
      : readinessScore >= 45
      ? 'Borderline Contender'
      : 'Critical Deficit';

  const weeklyDeficit = Math.max(
    0,
    Number((input.weeklyTargetHours - input.weeklyCompletedHours).toFixed(1))
  );
  const calibratedWeeklyTarget =
    weeklyDeficit > 0
      ? Math.min(84, Math.round(input.weeklyTargetHours + Math.max(2, extraDaily * 7)))
      : Math.min(84, Math.round(input.weeklyTargetHours + 3));

  const suggestions: LocalAIPerformanceSuggestion[] = [
    {
      id: `ai-sug-bottleneck-${topBottleneck.topic.id}`,
      category: 'Bottleneck Focus',
      title: `Prioritize ${topBottleneck.topic.title} (${topBottleneck.topic.subjectName})`,
      rationale: `Local AI detected a ${topBottleneck.deficitHours}h syllabus deficit in ${topBottleneck.topic.title} (${topBottleneck.topic.tier || 'Tier-I & II'}). Deploying a 50-min deep work block here yields the highest marginal rank gain.`,
      expectedImpactPct: Math.max(3, Math.round(projectedImprovementDelta * 0.45)),
      actionLabel: 'Focus Now (50m Deep Block)',
      actionType: 'start_focus_topic',
      targetTopicId: topBottleneck.topic.id,
      recommendedPomoMode: 'deep50',
    },
    {
      id: `ai-sug-pyq-${pyqTargetTopic.id}`,
      category: 'PYQ Speed Drill',
      title: `Boost PYQ Density on ${pyqTargetTopic.title}`,
      rationale: `Current solve velocity is ${pyqPerHourRate} PYQs/hr (${pyqTargetTopic.pyqSolved} solved in this module). Logging a timed 1.0h high-speed PYQ drill (+25 questions) will sharpen accuracy under exam pressure.`,
      expectedImpactPct: Math.max(2, Math.round(projectedImprovementDelta * 0.3)),
      actionLabel: 'Log +1.0h Timed PYQ Drill',
      actionType: 'log_pyq_sprint',
      targetTopicId: pyqTargetTopic.id,
      recommendedHours: 1.0,
    },
    {
      id: `ai-sug-pace-${mode}`,
      category: 'Pace Calibration',
      title:
        weeklyDeficit > 0
          ? `Close ${weeklyDeficit}h Weekly Deficit & Calibrate Target to ${calibratedWeeklyTarget}h/wk`
          : `Scale Weekly Mandate to ${calibratedWeeklyTarget}h/wk for Rank Acceleration`,
      rationale:
        extraDaily > 0
          ? `Adding +${extraDaily.toFixed(1)}h/day adds ${(extraDaily * 14).toFixed(0)}h over the next 14 days, cutting ${weakestSubject.subjectName} backlog (${weakestSubject.remainingHours}h left) by ${Math.min(100, Math.round(((extraDaily * 14) / Math.max(1, weakestSubject.remainingHours)) * 100))}%.`
          : `${weakestSubject.subjectName} lags at ${weakestSubject.percentHours}% completion (${weakestSubject.remainingHours}h remaining). Calibrating your weekly mandate locks in consistent daily velocity.`,
      expectedImpactPct: Math.max(2, Math.round(projectedImprovementDelta * 0.25)),
      actionLabel: `Set ${calibratedWeeklyTarget}h/wk Target`,
      actionType: 'calibrate_weekly_target',
      recommendedWeeklyTarget: calibratedWeeklyTarget,
    },
  ];

  const diagnosticSummary = `On-device inference (${modeConfig.label} profile) evaluated ${input.metrics.totalLoggedHours}h logged across ${safeTopics.length} modules (${pyqPerHourRate} PYQs/hr). Weakest domain: ${weakestSubject.subjectName} (${weakestSubject.percentHours}% done, ${weakestSubject.remainingHours}h left). Following the 3 prescriptions below${extraDaily > 0 ? ` with +${extraDaily.toFixed(1)}h/day extra study` : ''} projects a +${projectedImprovementDelta}% readiness lift (${readinessScore}% → ${projectedReadinessScore}%) in 14 days.`;

  return {
    modelVersion: 'Sankalp-LocalNet v2.4 (On-Device)',
    mode,
    readinessScore,
    projectedReadinessScore,
    projectedImprovementDelta,
    readinessGrade,
    featureScores: {
      syllabusMasteryScore,
      pyqDensityScore,
      weeklyVelocityScore,
      consistencyScore,
    },
    pyqPerHourRate,
    totalPyqSolved,
    weakestSubject,
    bottleneckTopic: {
      id: topBottleneck.topic.id,
      title: topBottleneck.topic.title,
      subjectName: topBottleneck.topic.subjectName,
      deficitHours: topBottleneck.deficitHours,
      pyqSolved: topBottleneck.topic.pyqSolved,
    },
    diagnosticSummary,
    suggestions,
  };
}


