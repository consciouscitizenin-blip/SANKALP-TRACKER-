import React, { useState, useMemo } from 'react';
import {
  FileText,
  Sparkles,
  Languages,
  CheckCircle2,
  XCircle,
  Upload,
  Download,
  RefreshCw,
  Globe,
  FileUp,
  Trash2,
  Link2,
  FileCheck2,
  Layers,
} from 'lucide-react';
import {
  UploadedStudyResource,
  UploadedResourceType,
  validateWebsiteResourceUrl,
  compileResourceContextPayload,
} from '../utils/sscLogic';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface OfflineMaterial {
  id: string;
  title: string;
  subject: string;
  content: string;
  savedAt: string;
}

interface AIStudyLabViewProps {
  onEarnQuizXP: (xp: number) => void;
}

const SAMPLE_SSC_RESOURCE = `Indian Polity - Comptroller and Auditor General of India (CAG):
Article 148 provides for an independent office of the CAG. He is the head of the Indian Audit and Accounts Department and guardian of the public purse. Appointed by the President of India by warrant under his hand and seal, the CAG holds office for a period of 6 years or up to the age of 65 years, whichever is earlier.
Quantitative Shortcut - Efficiency & Time:
If A is k% more efficient than B, then ratio of work done by A and B in the same time is (100+k):100, and ratio of time taken by A and B to finish a task alone is 100:(100+k).`;

const INITIAL_UPLOADED_RESOURCES: UploadedStudyResource[] = [
  {
    id: 'res-init-pdf',
    type: 'pdf',
    title: 'SSC_CGL_Tier2_Mensuration_3D_Formulas.pdf',
    mimeType: 'application/pdf',
    sizeLabel: '420 KB · PDF',
    extractedText:
      'Mensuration 3D Tier-II Revision Sheet: Volume of Frustum of Cone = (1/3) * pi * h * (R^2 + r^2 + R*r). Curved Surface Area = pi * l * (R + r) where l = sqrt(h^2 + (R - r)^2). Prism Volume = Base Area * Height.',
    addedAt: 'Today, 09:15 AM',
  },
];

const INITIAL_MOCK_QUESTIONS: QuizQuestion[] = [
  {
    id: 'init-q1',
    question: 'Which Article of the Indian Constitution provides for an independent office of the Comptroller and Auditor General (CAG) of India?',
    options: ['Article 148', 'Article 110', 'Article 280', 'Article 315'],
    correctIndex: 0,
    explanation: 'Article 148 of the Indian Constitution establishes the independent office of the CAG, guardian of the public purse.',
  },
  {
    id: 'init-q2',
    question: 'If Candidate A is 25% more efficient than Candidate B, and together they finish a module in 20 days, how many days will A alone take to complete the task?',
    options: ['36 days', '45 days', '32 days', '40 days'],
    correctIndex: 0,
    explanation: 'Efficiency ratio A:B = 125:100 = 5:4. Total work = (5 + 4) * 20 = 180 units. Time taken by A alone = 180 / 5 = 36 days.',
  },
  {
    id: 'init-q3',
    question: 'What is the tenure of the Comptroller and Auditor General (CAG) of India as prescribed in the Constitution?',
    options: [
      '6 years or up to 65 years of age, whichever is earlier',
      '5 years or up to 62 years of age, whichever is earlier',
      '6 years or up to 62 years of age, whichever is earlier',
      '5 years or up to 65 years of age, whichever is earlier',
    ],
    correctIndex: 0,
    explanation: 'The CAG holds office for a period of 6 years or up to the age of 65 years, whichever is earlier.',
  },
];

export const AIStudyLabView: React.FC<AIStudyLabViewProps> = ({ onEarnQuizXP }) => {
  const [uploadedResources, setUploadedResources] = useState<UploadedStudyResource[]>(
    INITIAL_UPLOADED_RESOURCES
  );
  const [resourceText, setResourceText] = useState<string>(SAMPLE_SSC_RESOURCE);
  const [websiteUrlInput, setWebsiteUrlInput] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [fetchingUrl, setFetchingUrl] = useState<boolean>(false);

  const [subject, setSubject] = useState<string>('General Awareness & Quant');
  const [quizDifficulty, setQuizDifficulty] = useState<string>('Tier-II Standard');
  const [quizCount, setQuizCount] = useState<number>(5);
  const [quizLanguage, setQuizLanguage] = useState<string>('English');

  const [questions, setQuestions] = useState<QuizQuestion[]>(INITIAL_MOCK_QUESTIONS);
  const [usedSourcesLabel, setUsedSourcesLabel] = useState<string>(
    'SSC_CGL_Tier2_Mensuration_3D_Formulas.pdf + Lecture Notes'
  );
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);

  // Translation state
  const [targetLang, setTargetLang] = useState<string>('Hindi');
  const [translatedNotes, setTranslatedNotes] = useState<string>('');
  const [keyTerms, setKeyTerms] = useState<{ term: string; translation: string }[]>([]);
  const [loadingTranslate, setLoadingTranslate] = useState<boolean>(false);

  // Offline Saved Study Packs
  const [offlinePacks, setOfflinePacks] = useState<OfflineMaterial[]>(() => {
    try {
      const saved = localStorage.getItem('sankalp_offline_packs');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'pack-1',
        title: 'CAG Article 148 & Efficiency Formulas',
        subject: 'Polity & Quant',
        content: SAMPLE_SSC_RESOURCE,
        savedAt: '2026-10-23',
      },
    ];
  });

  const compiledPayload = useMemo(
    () => compileResourceContextPayload(uploadedResources, resourceText),
    [uploadedResources, resourceText]
  );

  const handleMultiFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file) => {
      const lowerName = file.name.toLowerCase();
      const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
      const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(lowerName);
      const resourceType: UploadedResourceType = isPdf ? 'pdf' : isImage ? 'image' : 'file';
      const kbSize = Math.max(1, Math.round(file.size / 1024));
      const sizeLabel = `${kbSize} KB · ${isPdf ? 'PDF' : isImage ? 'IMAGE' : 'FILE'}`;

      if (isPdf || isImage) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = typeof event.target?.result === 'string' ? event.target.result : '';
          const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
          const newRes: UploadedStudyResource = {
            id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: resourceType,
            title: file.name,
            mimeType: file.type || (isPdf ? 'application/pdf' : 'image/png'),
            sizeLabel,
            extractedText: `Uploaded ${isPdf ? 'PDF Document' : 'Study Diagram'}: ${file.name} (${kbSize} KB). Key exam concepts, formulas, and tables extracted for mock quiz synthesis.`,
            base64Data,
            addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setUploadedResources((prev) => [newRes, ...prev]);
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const textContent = typeof event.target?.result === 'string' ? event.target.result : '';
          const cleanExcerpt = textContent.slice(0, 6000);
          const newRes: UploadedStudyResource = {
            id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: 'file',
            title: file.name,
            mimeType: file.type || 'text/plain',
            sizeLabel,
            extractedText: cleanExcerpt || `Uploaded Study File: ${file.name}`,
            addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setUploadedResources((prev) => [newRes, ...prev]);
        };
        reader.readAsText(file);
      }
    });

    e.target.value = '';
  };

  const handleAttachSamplePdf = () => {
    const samplePdf: UploadedStudyResource = {
      id: `res-pdf-${Date.now()}`,
      type: 'pdf',
      title: 'NCERT_Polity_Constitutional_Bodies_Digest.pdf',
      mimeType: 'application/pdf',
      sizeLabel: '680 KB · PDF',
      extractedText:
        'Constitutional Bodies Digest (PDF): Finance Commission (Article 280), Election Commission (Article 324), UPSC (Article 315), and CAG (Article 148). Includes Tier-II assertion-reason PYQs.',
      addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setUploadedResources((prev) => {
      if (prev.some((r) => r.title === samplePdf.title)) return prev;
      return [samplePdf, ...prev];
    });
  };

  const handleAddWebsiteUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    const check = validateWebsiteResourceUrl(websiteUrlInput);
    if (!check.valid) {
      setUrlError(check.error || 'Invalid website URL.');
      return;
    }

    setFetchingUrl(true);
    try {
      const res = await fetch('/api/resources/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: check.normalizedUrl }),
      });
      const data = await res.json();
      const newUrlRes: UploadedStudyResource = {
        id: `res-url-${Date.now()}`,
        type: 'url',
        title: data.title || `${check.hostname} Study Link`,
        sourceUrl: check.normalizedUrl,
        sizeLabel: `${data.wordCount || 120} words · WEB LINK`,
        extractedText:
          data.extractedText ||
          `Extracted study reference from ${check.normalizedUrl} (${check.hostname}).`,
        addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setUploadedResources((prev) => [newUrlRes, ...prev]);
      setWebsiteUrlInput('');
    } catch {
      const fallbackUrlRes: UploadedStudyResource = {
        id: `res-url-${Date.now()}`,
        type: 'url',
        title: `${check.hostname} Study Reference`,
        sourceUrl: check.normalizedUrl,
        sizeLabel: 'Web Link',
        extractedText: `Web study resource linked from ${check.normalizedUrl}.`,
        addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setUploadedResources((prev) => [fallbackUrlRes, ...prev]);
      setWebsiteUrlInput('');
    } finally {
      setFetchingUrl(false);
    }
  };

  const handleRemoveResource = (id: string) => {
    setUploadedResources((prev) => prev.filter((r) => r.id !== id));
  };

  const handleGenerateQuiz = async () => {
    if (
      uploadedResources.length === 0 &&
      (!resourceText || resourceText.trim().length < 5)
    ) {
      return;
    }
    setLoadingQuiz(true);
    setSubmittedQuiz(false);
    setSelectedAnswers({});
    try {
      const res = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceText: compiledPayload.combinedText,
          inlineParts: compiledPayload.inlineParts,
          urls: compiledPayload.urls,
          resourceTitles: compiledPayload.resourceTitles,
          subject,
          difficulty: quizDifficulty,
          count: quizCount,
          language: quizLanguage,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setUsedSourcesLabel(data.usedSources || compiledPayload.sourceSummary);
      } else {
        setQuestions(INITIAL_MOCK_QUESTIONS);
        setUsedSourcesLabel(compiledPayload.sourceSummary);
      }
    } catch (err) {
      console.error(err);
      setQuestions(INITIAL_MOCK_QUESTIONS);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSubmitQuiz = () => {
    setSubmittedQuiz(true);
    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });
    onEarnQuizXP(correctCount * 50 + 25);
  };

  const handleTranslateNotes = async () => {
    const sourceToTranslate = compiledPayload.combinedText || resourceText;
    if (!sourceToTranslate.trim()) return;
    setLoadingTranslate(true);
    try {
      const res = await fetch('/api/gemini/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceToTranslate,
          targetLanguage: targetLang,
        }),
      });
      const data = await res.json();
      if (data.translatedText) {
        setTranslatedNotes(data.translatedText);
        setKeyTerms(data.keyTerms || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTranslate(false);
    }
  };

  const handleSaveOfflinePack = () => {
    const contentToSave = translatedNotes || compiledPayload.combinedText || resourceText;
    if (!contentToSave.trim()) return;
    const newPack: OfflineMaterial = {
      id: `pack-${Date.now()}`,
      title: `${subject} (${compiledPayload.sourceSummary})`,
      subject,
      content: contentToSave,
      savedAt: new Date().toISOString().slice(0, 10),
    };
    const updated = [newPack, ...offlinePacks];
    setOfflinePacks(updated);
    try {
      localStorage.setItem('sankalp_offline_packs', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const scoreCount = questions.filter((q) => selectedAnswers[q.id] === q.correctIndex).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Multi-Resource Uploader (PDFs, Files, Website Links & Notes) */}
        <section className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                01. Multi-Source Resource &amp; PDF Upload Studio
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload PDFs, study files, website links, or lecture notes to generate custom quizzes &amp; mock tests
              </p>
            </div>
            <span
              data-testid="resource-source-summary"
              className="text-[11px] font-mono tabular-nums bg-slate-950 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-md"
            >
              {compiledPayload.sourceSummary}
            </span>
          </div>

          {/* Upload PDFs / Files Dropzone + Sample PDF Quick Loader */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <label
              data-testid="file-upload-dropzone"
              className="sm:col-span-8 cursor-pointer flex items-center justify-between gap-3 bg-slate-950 hover:bg-slate-900/90 border border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl p-3.5 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                  <FileUp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    Upload PDFs, Docs, Images or Text Files
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Supports .PDF, .TXT, .MD, .CSV, .JSON, .PNG, .JPG
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 text-amber-400 rounded-md border border-slate-700 shrink-0">
                Browse Files
              </span>
              <input
                type="file"
                multiple
                data-testid="resource-file-input"
                accept=".pdf,.txt,.md,.csv,.json,.html,.png,.jpg,.jpeg"
                onChange={handleMultiFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              data-testid="attach-sample-pdf-btn"
              onClick={handleAttachSamplePdf}
              className="sm:col-span-4 flex flex-col items-center justify-center gap-1 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>+ Attach Sample PDF</span>
              <span className="text-[10px] text-slate-400">NCERT Polity Digest</span>
            </button>
          </div>

          {/* Add Website Link / Study URL Extractor */}
          <form onSubmit={handleAddWebsiteUrl} className="space-y-1.5">
            <label htmlFor="website-url-input" className="block text-xs font-medium text-slate-300">
              Add Website Link / Online Article or Notification URL
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="website-url-input"
                  data-testid="resource-url-input"
                  type="text"
                  value={websiteUrlInput}
                  onChange={(e) => {
                    setWebsiteUrlInput(e.target.value);
                    if (urlError) setUrlError(null);
                  }}
                  placeholder="https://pib.gov.in/economic-survey or wikipedia.org/wiki/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                data-testid="add-url-resource-btn"
                disabled={fetchingUrl}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>{fetchingUrl ? 'Extracting...' : 'Add Website Link'}</span>
              </button>
            </div>
            {urlError && (
              <p className="text-[11px] text-rose-400" role="alert">
                {urlError}
              </p>
            )}
          </form>

          {/* Active Uploaded Resources Queue (PDFs, Files, Website Links) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Attached Study Resources ({uploadedResources.length})</span>
              </span>
              {uploadedResources.length > 0 && (
                <span className="text-[11px] text-slate-400">
                  All attached sources feed into Mock Quiz generation
                </span>
              )}
            </div>

            <div
              data-testid="uploaded-resources-list"
              className="space-y-2 max-h-44 overflow-y-auto pr-1"
            >
              {uploadedResources.map((item) => (
                <div
                  key={item.id}
                  data-testid={`uploaded-resource-item-${item.type}`}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded font-mono ${
                          item.type === 'pdf'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : item.type === 'url'
                            ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {item.type.toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold text-white truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono tabular-nums text-slate-400 shrink-0">
                        {item.sizeLabel}
                      </span>
                    </div>
                    {item.sourceUrl && (
                      <div className="text-[11px] text-sky-400 truncate font-mono">
                        {item.sourceUrl}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {item.extractedText}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => handleRemoveResource(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz Configuration Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="quiz-subject-input" className="block text-xs font-medium text-slate-300 mb-1">
                Subject / Topic Focus
              </label>
              <input
                id="quiz-subject-input"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="quiz-lang-select" className="block text-xs font-medium text-slate-300 mb-1">
                Mock Output Language
              </label>
              <select
                id="quiz-lang-select"
                value={quizLanguage}
                onChange={(e) => setQuizLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (Devanagari)</option>
                <option value="Bilingual (English + Hindi)">Bilingual (English + Hindi)</option>
              </select>
            </div>
            <div>
              <label htmlFor="quiz-difficulty-select" className="block text-xs font-medium text-slate-300 mb-1">
                Mock Test Difficulty
              </label>
              <select
                id="quiz-difficulty-select"
                value={quizDifficulty}
                onChange={(e) => setQuizDifficulty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
              >
                <option value="Tier-I Speed Drill">Tier-I Speed Drill</option>
                <option value="Tier-II Standard">Tier-II Standard</option>
                <option value="Ranker Hard">Ranker Hard</option>
              </select>
            </div>
            <div>
              <label htmlFor="quiz-count-select" className="block text-xs font-medium text-slate-300 mb-1">
                Number of Questions
              </label>
              <select
                id="quiz-count-select"
                aria-label="Number of Questions"
                value={quizCount}
                onChange={(e) => setQuizCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-slate-100"
              >
                <option value={4}>4 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={6}>6 Questions</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="resource-textarea" className="block text-xs font-medium text-slate-300 mb-1">
              Additional Pasted Study Material / Lecture Notes
            </label>
            <textarea
              id="resource-textarea"
              rows={4}
              value={resourceText}
              onChange={(e) => setResourceText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-amber-500"
              placeholder="Paste additional lecture notes, formulas, or current affairs excerpts here..."
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              data-testid="generate-quiz-btn"
              onClick={handleGenerateQuiz}
              disabled={loadingQuiz}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {loadingQuiz ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>
                {loadingQuiz
                  ? 'Synthesizing Mock Test...'
                  : 'Generate Quiz & Mock Test from Resources'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleSaveOfflinePack}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save to Offline Vault</span>
            </button>
          </div>

          {/* Multi-Language Automatic Note Translator */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">
                  Multi-Language Dialect &amp; Resource Translator
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <select
                  aria-label="Target Translation Language"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                >
                  <option value="Hindi">Hindi (Devanagari)</option>
                  <option value="Bengali">Bengali (Regional)</option>
                  <option value="Tamil">Tamil (Regional)</option>
                  <option value="Telugu">Telugu (Regional)</option>
                  <option value="Marathi">Marathi (Regional)</option>
                </select>
                <button
                  type="button"
                  onClick={handleTranslateNotes}
                  disabled={loadingTranslate}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 whitespace-nowrap cursor-pointer"
                >
                  {loadingTranslate ? 'Translating...' : 'Translate Resources'}
                </button>
              </div>
            </div>

            {translatedNotes && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2">
                <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed" data-testid="translated-notes-output">
                  {translatedNotes}
                </div>
                {keyTerms.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-3 text-xs text-amber-400">
                    {keyTerms.map((kt, i) => (
                      <span key={i}>
                        <strong>{kt.term}:</strong> {kt.translation}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Right: Interactive Mock Test Runner & Offline Material Vault */}
        <section className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  02. Interactive Mock Test &amp; Quiz Simulator
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synthesized from:{' '}
                  <strong data-testid="quiz-used-sources" className="text-amber-300">
                    {usedSourcesLabel}
                  </strong>
                </p>
              </div>
              {submittedQuiz && questions.length > 0 && (
                <div className="text-sm font-bold font-mono tabular-nums text-emerald-400">
                  Score: {scoreCount}/{questions.length} (+{scoreCount * 50 + 25} XP)
                </div>
              )}
            </div>

            {questions.length === 0 ? (
              <div className="mt-6 bg-slate-950 border border-slate-800 rounded-xl p-8 text-center space-y-3">
                <FileText className="w-8 h-8 text-amber-400 mx-auto" />
                <div className="text-sm font-medium text-white">No Active Mock Quiz Generated Yet</div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Upload a PDF, file, or website link on the left and click <strong>Generate Quiz &amp; Mock Test from Resources</strong>.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-4 max-h-[520px] overflow-y-auto pr-1" data-testid="mock-quiz-questions-list">
                {questions.map((q, qIdx) => (
                  <div key={q.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                    <div className="text-xs font-semibold text-white leading-relaxed">
                      Q{qIdx + 1}. {q.question}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[q.id] === oIdx;
                        const isCorrect = q.correctIndex === oIdx;
                        let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';
                        if (submittedQuiz) {
                          if (isCorrect) {
                            btnStyle = 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'bg-rose-950/50 border-rose-500/60 text-rose-200';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-amber-500/20 border-amber-500 text-amber-200';
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            disabled={submittedQuiz}
                            onClick={() =>
                              setSelectedAnswers((prev) => ({
                                ...prev,
                                [q.id]: oIdx,
                              }))
                            }
                            className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors flex items-center justify-between cursor-pointer ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {submittedQuiz && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            {submittedQuiz && isSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {submittedQuiz && (
                      <div className="text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded border border-slate-800">
                        <strong className="text-amber-400">Solution:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}

                {!submittedQuiz && (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Submit Answers &amp; Evaluate Score
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Offline Study Materials Vault */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-300 mb-2">
              Offline Downloaded Study Vault ({offlinePacks.length} Packs Cached Locally)
            </h3>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {offlinePacks.map((pack) => (
                <div
                  key={pack.id}
                  className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                >
                  <div className="truncate pr-3">
                    <span className="font-medium text-slate-200">{pack.title}</span>
                    <span className="mx-2 text-slate-600">·</span>
                    <span className="text-slate-500">{pack.savedAt}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResourceText(pack.content)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded text-xs shrink-0 cursor-pointer"
                  >
                    Load Pack
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

