import React, { useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  FileQuestion,
  FileText,
  Calendar,
  Layers,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  RotateCw,
  Eye,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Flashcard, MCQOption } from '../../types';

type AssistantTab = 'explain' | 'mcq' | 'summarize' | 'flashcards' | 'revision' | 'ask';

export const SmartStudyAssistant: React.FC = () => {
  const { subjects, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<AssistantTab>('explain');

  // Explain concept states
  const [concept, setConcept] = useState('Baddeley working memory model');
  const [conceptContext, setConceptContext] = useState('Cognitive Psychology');
  const [explainResult, setExplainResult] = useState<string | null>(null);

  // MCQ states
  const [mcqTopic, setMcqTopic] = useState('Nucleophilic Addition to Carbonyls');
  const [mcqSubject, setMcqSubject] = useState('Organic Chemistry');
  const [mcqQuestions, setMcqQuestions] = useState<MCQOption[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});

  // Summarize notes states
  const [notesToSummarize, setNotesToSummarize] = useState(
    'Sensory memory holds large amounts of incoming sensory data for milliseconds to seconds. Iconic memory is visual (<1 sec), echoic is auditory (2-4 sec). If attended to, information moves into working memory. Sperling (1960) used partial report paradigm to prove iconic capacity.'
  );
  const [summaryResult, setSummaryResult] = useState<string | null>(null);

  // Flashcards states
  const [flashcardTopic, setFlashcardTopic] = useState('Type I and Type II statistical errors');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: 'fc-1',
      front: 'What is a Type I Error in hypothesis testing?',
      back: 'False Positive: Rejecting the null hypothesis (H₀) when it is actually true. Denoted by alpha (α).',
      hint: 'Think of "crying wolf" when no wolf is there.',
    },
    {
      id: 'fc-2',
      front: 'What is a Type II Error in hypothesis testing?',
      back: 'False Negative: Failing to reject the null hypothesis (H₀) when it is actually false. Denoted by beta (β).',
      hint: 'Failing to detect a real effect.',
    },
  ]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Revision plan states
  const [revSubject, setRevSubject] = useState('Cognitive Psychology');
  const [revExamDate, setRevExamDate] = useState('In 12 days');
  const [revTopics, setRevTopics] = useState(
    'Attention models, Working memory, Consolidation, Schema & Forgetting'
  );
  const [revDailyHours, setRevDailyHours] = useState('1.5 hours/day');
  const [revPlanResult, setRevPlanResult] = useState<string | null>(null);

  // Chat/Ask states
  const [chatQuery, setChatQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([
    {
      role: 'assistant',
      text: "Hi! I'm your HerSpace Smart Study Assistant. Ask me to break down difficult concepts, test your memory, or give gentle study guidance whenever you're ready.",
    },
  ]);

  // Loading & error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;
    setLoading(true);
    setError(null);
    setExplainResult(null);

    try {
      const res = await fetch('/api/study-assistant/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, context: conceptContext }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate explanation');
      setExplainResult(data.explanation);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to study assistant.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMCQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mcqTopic.trim()) return;
    setLoading(true);
    setError(null);
    setSelectedAnswers({});
    setRevealedExplanations({});

    try {
      const res = await fetch('/api/study-assistant/practice-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: mcqTopic, subject: mcqSubject, count: 3 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate questions');
      if (data.questions && Array.isArray(data.questions)) {
        setMcqQuestions(data.questions);
      } else {
        throw new Error('Unexpected question format received');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to generate questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesToSummarize.trim()) return;
    setLoading(true);
    setError(null);
    setSummaryResult(null);

    try {
      const res = await fetch('/api/study-assistant/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesToSummarize }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to summarize notes');
      setSummaryResult(data.summary);
    } catch (err: any) {
      setError(err.message || 'Unable to summarize notes.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFlashcards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashcardTopic.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/study-assistant/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: flashcardTopic, count: 4 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate flashcards');
      if (data.flashcards && Array.isArray(data.flashcards)) {
        setFlashcards(
          data.flashcards.map((f: any, idx: number) => ({
            id: `fc-gen-${idx}`,
            front: f.front,
            back: f.back,
            hint: f.hint,
          }))
        );
        setCurrentCardIndex(0);
        setIsFlipped(false);
        showToast('Flashcards generated! Ready to practice 📇', '📇');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to generate flashcards.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRevisionPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRevPlanResult(null);

    try {
      const res = await fetch('/api/study-assistant/revision-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: revSubject,
          examDate: revExamDate,
          topics: revTopics,
          dailyAvailableHours: revDailyHours,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate revision plan');
      setRevPlanResult(data.plan);
    } catch (err: any) {
      setError(err.message || 'Unable to generate revision plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    const userText = chatQuery.trim();
    setChatQuery('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/study-assistant/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery: userText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get answer');
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.answer || 'No response available.' },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            err.message ||
            'Gemini API key is required on the server to respond to dynamic questions.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Assistant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center text-sm shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              Smart Study Assistant
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium">
                Gemini 3.8 Flash
              </span>
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Personalized tutoring, practice questions, note summaries, and active recall.
            </p>
          </div>
        </div>

        <div className="text-[11px] text-stone-400 flex items-center gap-1">
          <span>AI-generated aid</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-stone-100 dark:border-stone-800">
        {[
          { id: 'explain', label: 'Explain Concept', icon: HelpCircle },
          { id: 'mcq', label: 'Practice MCQs', icon: FileQuestion },
          { id: 'summarize', label: 'Summarize Notes', icon: FileText },
          { id: 'flashcards', label: 'Flashcards', icon: Layers },
          { id: 'revision', label: 'Revision Plan', icon: Calendar },
          { id: 'ask', label: 'Ask Assistant', icon: Send },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as AssistantTab);
                setError(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error notification banner */}
      {error && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Note:</span> {error}
          </div>
        </div>
      )}

      {/* TAB 1: Explain Concept */}
      {activeTab === 'explain' && (
        <div className="space-y-4 text-xs">
          <form onSubmit={handleExplain} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Difficult Concept or Term
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hebbian Learning, Aldol Condensation, P-Value..."
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Subject / Context (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cognitive Psychology, Chemistry II..."
                  value={conceptContext}
                  onChange={(e) => setConceptContext(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Explaining gently...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Explain in Simple Terms
                </>
              )}
            </button>
          </form>

          {explainResult && (
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 text-stone-800 dark:text-stone-200 space-y-2 whitespace-pre-wrap leading-relaxed">
              <div className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5 pb-1 border-b border-purple-200/50 dark:border-purple-900/30">
                <CheckCircle className="w-4 h-4" /> Explanation for &ldquo;{concept}&rdquo;
              </div>
              <div>{explainResult}</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Practice MCQs */}
      {activeTab === 'mcq' && (
        <div className="space-y-4 text-xs">
          <form onSubmit={handleGenerateMCQ} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Topic for Questions
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nucleophilic Addition, Memory Models..."
                  value={mcqTopic}
                  onChange={(e) => setMcqTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chemistry, Psychology..."
                  value={mcqSubject}
                  onChange={(e) => setMcqSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating questions...
                </>
              ) : (
                <>
                  <FileQuestion className="w-3.5 h-3.5" /> Generate 3 Practice MCQs
                </>
              )}
            </button>
          </form>

          {/* Render Questions */}
          {mcqQuestions.length > 0 && (
            <div className="space-y-4 pt-2">
              {mcqQuestions.map((q, idx) => {
                const selected = selectedAnswers[q.id || `q-${idx}`];
                const isRevealed = revealedExplanations[q.id || `q-${idx}`];

                return (
                  <div
                    key={q.id || idx}
                    className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 space-y-3"
                  >
                    <div className="font-medium text-stone-900 dark:text-stone-100 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{q.question}</span>
                    </div>

                    <div className="space-y-1.5 pl-7">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selected === opt;
                        const isCorrectAnswer = opt === q.correctAnswer;

                        return (
                          <div
                            key={optIdx}
                            onClick={() => {
                              setSelectedAnswers((prev) => ({
                                ...prev,
                                [q.id || `q-${idx}`]: opt,
                              }));
                            }}
                            className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                              isChosen
                                ? isRevealed
                                  ? isCorrectAnswer
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200'
                                  : 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 text-purple-900 dark:text-purple-200 font-medium'
                                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-purple-300'
                            }`}
                          >
                            <span>{opt}</span>
                            {isChosen && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pl-7 pt-1 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setRevealedExplanations((prev) => ({
                            ...prev,
                            [q.id || `q-${idx}`]: !prev[q.id || `q-${idx}`],
                          }));
                        }}
                        className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        {isRevealed ? 'Hide Explanation' : 'Check & Reveal Answer'}
                      </button>
                    </div>

                    {isRevealed && (
                      <div className="pl-7 pt-2 text-[11px] text-stone-600 dark:text-stone-300 bg-white/70 dark:bg-stone-800/60 p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                          Correct Answer: {q.correctAnswer}
                        </div>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Summarize Notes */}
      {activeTab === 'summarize' && (
        <div className="space-y-4 text-xs">
          <form onSubmit={handleSummarize} className="space-y-3">
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Paste Your Study Notes or Textbook Paragraph
              </label>
              <textarea
                rows={5}
                required
                value={notesToSummarize}
                onChange={(e) => setNotesToSummarize(e.target.value)}
                placeholder="Paste class notes, slides, or article excerpt..."
                className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 resize-y focus:outline-hidden focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Summarizing...
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" /> Generate Clean Summary & Takeaways
                </>
              )}
            </button>
          </form>

          {summaryResult && (
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
              <div className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5 pb-2 border-b border-purple-200/50 dark:border-purple-900/30 mb-2">
                <CheckCircle className="w-4 h-4" /> Structured Summary
              </div>
              {summaryResult}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Interactive Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="space-y-4 text-xs">
          <form onSubmit={handleGenerateFlashcards} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Topic to generate flashcards for..."
              value={flashcardTopic}
              onChange={(e) => setFlashcardTopic(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-1 shrink-0 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Generate'}
            </button>
          </form>

          {/* 3D Flashcard display */}
          {flashcards.length > 0 && (
            <div className="flex flex-col items-center space-y-4 pt-2">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full max-w-md h-56 rounded-3xl bg-linear-to-br from-purple-50 via-white to-stone-50 dark:from-purple-950/40 dark:via-stone-850 dark:to-stone-850 border-2 border-purple-200/70 dark:border-purple-900/50 shadow-md p-6 flex flex-col justify-between items-center text-center cursor-pointer select-none transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="flex justify-between w-full text-[10px] text-stone-400">
                  <span className="font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    {isFlipped ? 'Answer / Definition' : 'Prompt / Question'}
                  </span>
                  <span>
                    Card {currentCardIndex + 1} of {flashcards.length}
                  </span>
                </div>

                <div className="my-auto px-2">
                  <p className="font-serif text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-100 leading-relaxed">
                    {isFlipped
                      ? flashcards[currentCardIndex].back
                      : flashcards[currentCardIndex].front}
                  </p>
                  {!isFlipped && flashcards[currentCardIndex].hint && (
                    <span className="inline-block mt-3 text-[11px] text-stone-400 italic">
                      💡 Hint: {flashcards[currentCardIndex].hint}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-purple-500 flex items-center gap-1">
                  <RotateCw className="w-3 h-3" /> Tap anywhere to flip
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex(
                      (prev) => (prev - 1 + flashcards.length) % flashcards.length
                    );
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-medium"
                >
                  Previous
                </button>
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium hover:bg-purple-200"
                >
                  Flip
                </button>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-xs"
                >
                  Next Card
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Revision Planner */}
      {activeTab === 'revision' && (
        <div className="space-y-4 text-xs">
          <form onSubmit={handleGenerateRevisionPlan} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={revSubject}
                  onChange={(e) => setRevSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Exam Date / Timeframe
                </label>
                <input
                  type="text"
                  value={revExamDate}
                  onChange={(e) => setRevExamDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Topics to Review
              </label>
              <textarea
                rows={2}
                value={revTopics}
                onChange={(e) => setRevTopics(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Planning revision...
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5" /> Generate Kind Revision Schedule
                </>
              )}
            </button>
          </form>

          {revPlanResult && (
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
              <div className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5 pb-2 border-b border-purple-200/50 dark:border-purple-900/30 mb-2">
                <CheckCircle className="w-4 h-4" /> Recommended Revision Roadmap
              </div>
              {revPlanResult}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Ask Assistant Interactive Chat */}
      {activeTab === 'ask' && (
        <div className="space-y-3 text-xs flex flex-col h-80">
          <div className="flex-1 overflow-y-auto space-y-2 p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200/70 dark:border-stone-800">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                  msg.role === 'user'
                    ? 'ml-auto bg-purple-600 text-white rounded-br-xs'
                    : 'mr-auto bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-bl-xs shadow-2xs'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="p-3 rounded-2xl max-w-[85%] mr-auto bg-white dark:bg-stone-800 text-stone-400 border border-stone-200 dark:border-stone-700 flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask anything about your study topics or exam prep..."
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            />
            <button
              type="submit"
              disabled={loading || !chatQuery.trim()}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
