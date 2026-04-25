"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { quizSupabase } from '@/lib/quizSupabase';
import { theme } from '@/lib/theme';
import { ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import AdUnit from '@/components/ads/AdUnit';

interface ObjectiveQuestion {
  id: string;
  company: string;
  exam_year: number;
  section: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: string;
  explanation: string;
  difficulty: string;
}

export default function ObjectiveQuizClient({ company }: { company: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<ObjectiveQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [expandedExplanations, setExpandedExplanations] = useState<{ [key: string]: boolean }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [useTimer, setUseTimer] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('general');
  const [questionCount, setQuestionCount] = useState(20);
  const [isAnchorClosed, setIsAnchorClosed] = useState(false);
  const ANCHOR_HEIGHT = 100;

  useEffect(() => {
    const sectionParam = searchParams.get('section');
    const countParam = searchParams.get('count');
    if (sectionParam) setSelectedSection(decodeURIComponent(sectionParam));
    if (countParam) setQuestionCount(parseInt(countParam) || 20);
    fetchQuestions();
  }, [company, selectedSection, questionCount]);

  useEffect(() => {
    const timerParam = searchParams.get('timer');
    if (timerParam === '1') {
      setUseTimer(true);
      setTimerStarted(true);
    }
  }, [searchParams]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (useTimer && timerStarted && !showResults) {
      interval = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [useTimer, timerStarted, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchQuestions = async () => {
    try {
      const { data, error } = await quizSupabase
        .from('objective_questions')
        .select('*')
        .ilike('company', company);

      if (error) throw error;

      let filteredQuestions = data || [];

      if (selectedSection && selectedSection !== 'general') {
        filteredQuestions = filteredQuestions.filter(q => q.section === selectedSection);
      } else if (selectedSection === 'general') {
        const sections = [...new Set(filteredQuestions.map(q => q.section).filter(Boolean))];
        const targetCount = questionCount;

        if (sections.length > 0) {
          const basePerSection = Math.floor(targetCount / sections.length);
          const remainder = targetCount % sections.length;
          const distributedQuestions: typeof data = [];

          sections.forEach((section, idx) => {
            const sectionQuestions = filteredQuestions.filter(q => q.section === section);
            const countForThisSection = basePerSection + (idx < remainder ? 1 : 0);
            const shuffled = shuffleArray(sectionQuestions);
            distributedQuestions.push(...shuffled.slice(0, countForThisSection));
          });

          filteredQuestions = shuffleArray(distributedQuestions);
        }
      }

      setQuestions(filteredQuestions.slice(0, questionCount));
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      alert(`Please answer all ${questions.length} questions`);
      return;
    }

    setSubmitting(true);

    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) correct++;
    });

    setScore({ correct, total: questions.length });
    setSubmitting(false);
    setShowResults(true);
  };

  const restartQuiz = () => {
    setAnswers({});
    setShowResults(false);
    setScore({ correct: 0, total: 0 });
    setTimeSpent(0);
    setTimerStarted(false);
    setCurrentIndex(0);
    fetchQuestions();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background.muted }}>
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-2" size={32} style={{ color: theme.colors.primary.DEFAULT }} />
          <p className="text-sm text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
        <div className="px-4 py-3" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
          <div className="max-w-4xl mx-auto">
            <Link href={`/tools/quiz/${company.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-2 text-white/80 hover:text-white text-sm">
              <ArrowLeft size={18} />
              Back
            </Link>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="bg-white rounded-xl p-8 shadow-sm" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
            <p className="text-gray-600">No questions available for this company yet.</p>
          </div>
        </div>
      </div>
    );
  }

  // ====================== RESULTS SCREEN ======================
  if (showResults) {
    const percentage = Math.round((score.correct / score.total) * 100);

    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
        <div className="px-4 py-3" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href={`/tools/quiz/${company.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-2 text-white/80 hover:text-white text-sm">
              <ArrowLeft size={18} />
              Exit
            </Link>
            <span className="text-white text-sm font-medium">Results</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl p-6 text-center mb-6" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3" 
                 style={{ backgroundColor: percentage >= 70 ? '#10B98120' : '#EF444420' }}>
              <span className="text-4xl font-bold" style={{ color: percentage >= 70 ? '#10B981' : '#EF4444' }}>
                {percentage}%
              </span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{score.correct} / {score.total} correct</p>
            {useTimer && <p className="text-gray-500 mt-1">Time spent: {formatTime(timeSpent)}</p>}
          </div>

          {/* Ad between score summary and question review */}
          <div className="mb-6">
            <AdUnit slot="4198231153" format="auto" />
          </div>

          <div className="space-y-4 mb-8">
            {questions.map((q, idx) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correct_answer;

              return (
                <div key={q.id} className="bg-white rounded-xl p-5" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${isCorrect ? 'bg-green-500' : 'bg-red-500'} text-white mt-0.5`}>
                      {isCorrect ? <Check size={14} /> : <X size={14} />}
                    </span>
                    <p className="text-sm font-medium text-gray-900 flex-1">Q{idx + 1}. {q.question_text}</p>
                  </div>

                  <div className="pl-9 space-y-2 text-sm">
                    <p>Your answer: <span className={isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{userAns}</span></p>
                    {!isCorrect && <p>Correct answer: <span className="text-green-600 font-medium">{q.correct_answer}</span></p>}
                    
                    {q.explanation && (
                      <div className="mt-4">
                        <button
                          onClick={() => setExpandedExplanations(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          {expandedExplanations[q.id] ? 'Hide explanation ▲' : 'Show explanation ▼'}
                        </button>
                        {expandedExplanations[q.id] && (
                          <div className="mt-2 bg-gray-50 p-4 rounded-lg text-xs text-gray-600 leading-relaxed">
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ad after question review, before Try Again */}
          <div className="mb-6">
            <AdUnit slot="9751041788" format="auto" />
          </div>

          <button 
            onClick={restartQuiz} 
            className="w-full py-3.5 rounded-xl font-semibold text-white text-sm"
            style={{ backgroundColor: theme.colors.primary.DEFAULT }}
          >
            Try Again
          </button>

          <p className="text-xs text-gray-500 text-center mt-6">
            This quiz is for educational purposes only. JobMeter has no affiliation to {company}.
          </p>
        </div>
      </div>
    );
  }

  // ====================== QUIZ SCREEN ======================
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const isCurrentAnswered = !!answers[currentQuestion?.id];

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
      <div className="px-4 py-3 sticky top-0 z-10" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href={`/tools/quiz/${company.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-2 text-white/80 hover:text-white text-sm">
            <ArrowLeft size={18} />
            Exit
          </Link>
          <span className="text-white text-sm font-medium">{answeredCount}/{questions.length}</span>
          {useTimer && timerStarted && (
            <span className="text-white text-sm font-medium bg-white/20 px-3 py-1 rounded">{formatTime(timeSpent)}</span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-4">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all" 
              style={{ 
                width: `${(answeredCount / questions.length) * 100}%`, 
                backgroundColor: theme.colors.primary.DEFAULT 
              }} 
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 mb-6" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
          <p className="text-base font-medium text-gray-900 mb-4">
            Q{currentIndex + 1}. {currentQuestion.question_text}
          </p>

          <div className="space-y-3">
            {['A', 'B', 'C', 'D', 'E'].map(opt => {
              const key = `option_${opt.toLowerCase()}` as keyof ObjectiveQuestion;
              const text = currentQuestion[key] as string;
              if (!text) return null;

              const isSelected = answers[currentQuestion.id] === opt;

              return (
                <button
                  key={opt}
                  onClick={() => handleAnswerSelect(currentQuestion.id, opt)}
                  className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5 ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {opt}
                  </span>
                  <span className="text-gray-700 leading-snug">{text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mid-quiz ad: show between every 5th question */}
        {(currentIndex + 1) % 5 === 0 && (
          <div className="mb-4">
            <AdUnit slot="4198231153" format="auto" />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 py-3.5 rounded-xl font-medium text-sm disabled:opacity-50 bg-gray-100 text-gray-700"
          >
            Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || answeredCount < questions.length}
              className="flex-1 py-3.5 rounded-xl font-medium text-sm disabled:opacity-50 text-white"
              style={{ backgroundColor: theme.colors.primary.DEFAULT }}
            >
              {submitting ? 'Submitting...' : `Submit Quiz`}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isCurrentAnswered}
              className="flex-1 py-3.5 rounded-xl font-medium text-sm disabled:opacity-50 text-white"
              style={{ backgroundColor: theme.colors.primary.DEFAULT }}
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* Mobile anchor spacer */}
      {!isAnchorClosed && (
        <div className="lg:hidden" style={{ height: `${ANCHOR_HEIGHT}px` }} aria-hidden="true" />
      )}

      {/* Mobile Anchor Ad */}
      {!isAnchorClosed && (
        <div
          id="mobile-anchor-ad"
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          style={{ height: `${ANCHOR_HEIGHT}px` }}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsAnchorClosed(true)}
            className="absolute top-1.5 left-3 z-50 w-7 h-7 flex items-center justify-center bg-white rounded-full shadow text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close bottom advertisement"
          >
            <X size={18} />
          </button>

          {/* Ad Container */}
          <div className="w-full" style={{ height: `${ANCHOR_HEIGHT}px` }}>
            <AdUnit
              slot="3349195672"
              format="auto"
              style={{ display: 'block', width: '100%', height: `${ANCHOR_HEIGHT}px` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}