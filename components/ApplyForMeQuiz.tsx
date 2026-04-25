"use client";

import { useState } from 'react';
import { ChevronRight, ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────
type Option = {
  label: string;
  score: number; // 0 = not a fit, 1 = maybe, 2 = strong fit
};

type Question = {
  id: number;
  text: string;
  sub?: string;
  options: Option[];
};

type ResultTier = 'strong' | 'likely' | 'maybe';

// ── Questions ────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "How many jobs do you actually apply to per month?",
    sub: "Be honest — this helps us tell you if we can help.",
    options: [
      { label: "0 – 2", score: 2 },
      { label: "3 – 5", score: 2 },
      { label: "6 – 10", score: 1 },
      { label: "More than 10", score: 0 },
    ],
  },
  {
    id: 2,
    text: "Do you tailor your CV for each job you apply to?",
    options: [
      { label: "Never — same CV everywhere", score: 2 },
      { label: "Sometimes, when I remember", score: 2 },
      { label: "Usually, but it takes forever", score: 1 },
      { label: "Always, every single application", score: 0 },
    ],
  },
  {
    id: 3,
    text: "When do you usually find time to apply for jobs?",
    options: [
      { label: "Weekends only", score: 2 },
      { label: "Late at night after work", score: 2 },
      { label: "Whenever I remember during the day", score: 1 },
      { label: "I have a proper schedule for it", score: 0 },
    ],
  },
  {
    id: 4,
    text: "How would you describe your current job search?",
    options: [
      { label: "I keep meaning to start seriously", score: 2 },
      { label: "Active but inconsistent", score: 2 },
      { label: "I apply here and there", score: 1 },
      { label: "Very structured — I track everything", score: 0 },
    ],
  },
  {
    id: 5,
    text: "Have you ever missed a job deadline because you ran out of time?",
    options: [
      { label: "Yes, more times than I can count", score: 2 },
      { label: "Yes, a few times", score: 2 },
      { label: "Once or twice", score: 1 },
      { label: "Never — I'm always on top of deadlines", score: 0 },
    ],
  },
];

// ── Result copy based on total score ────────────────────────
function getResult(score: number): {
  tier: ResultTier;
  headline: string;
  body: string;
  ctaLabel: string;
} {
  // Max score = 10 (5 questions × 2)
  if (score >= 8) {
    return {
      tier: 'strong',
      headline: "Apply for Me was built for you.",
      body: "You're exactly who we had in mind — busy, serious about moving up, but running out of time before you even start. We handle the applying. You handle the interviews.",
      ctaLabel: "Get started — ₦5,000/mo",
    };
  }
  if (score >= 5) {
    return {
      tier: 'likely',
      headline: "You'd get a lot out of this.",
      body: "Your job search is there — but it's not consistent enough to break through. Having someone apply on your behalf every single month changes that. No more gaps, no more missed deadlines.",
      ctaLabel: "See how it works",
    };
  }
  return {
    tier: 'maybe',
    headline: "You might not need this yet.",
    body: "It sounds like you've got a decent handle on your job search. But if that ever changes — or if you want to dramatically increase your volume — Apply for Me is here.",
    ctaLabel: "Learn more anyway",
  };
}

// ── Progress bar ─────────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 flex-shrink-0">{current}/{total}</span>
    </div>
  );
}

// ── Result icon ──────────────────────────────────────────────
function ResultIcon({ tier }: { tier: ResultTier }) {
  if (tier === 'strong') return (
    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
      <CheckCircle2 className="w-8 h-8 text-amber-500" />
    </div>
  );
  if (tier === 'likely') return (
    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-5">
      <AlertCircle className="w-8 h-8 text-blue-500" />
    </div>
  );
  return (
    <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-5">
      <XCircle className="w-8 h-8 text-gray-400" />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
type Props = {
  onCTA: () => void;          // called when user clicks the result CTA
  onDismiss?: () => void;     // optional — used in popup to close
  compact?: boolean;          // true = tighter padding for popup use
};

export default function ApplyForMeQuiz({ onCTA, onDismiss, compact = false }: Props) {
  const [step, setStep] = useState<'intro' | number | 'result'>('intro');
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  const currentQ = typeof step === 'number' ? QUESTIONS[step - 1] : null;
  const totalScore = answers.reduce((a, b) => a + b, 0);
  const result = getResult(totalScore);

  const goNext = (score: number) => {
    if (animating) return;
    setAnimating(true);
    const newAnswers = [...answers, score];

    setTimeout(() => {
      setAnswers(newAnswers);
      setSelected(null);
      setAnimating(false);

      if (typeof step === 'number' && step < QUESTIONS.length) {
        setStep(step + 1);
      } else {
        setStep('result');
      }
    }, 180);
  };

  const goBack = () => {
    if (typeof step !== 'number' || step <= 1) return;
    setAnswers(answers.slice(0, -1));
    setSelected(null);
    setStep(step - 1);
  };

  const pad = compact ? 'px-6 py-6' : 'px-8 py-8';
  const headSize = compact ? 'text-base' : 'text-lg';

  // ── Intro ──────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div className={pad}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-700 text-xs font-semibold uppercase tracking-wide">2 min quiz</span>
          </div>
          <h3 className={`font-bold text-gray-900 mb-2 ${compact ? 'text-xl' : 'text-2xl'}`}>
            Is Apply for Me<br />right for you?
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            5 quick questions. We'll tell you honestly whether this makes sense for your situation.
          </p>
        </div>

        <button
          onClick={() => setStep(1)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] text-base"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}
        >
          Take the quiz
          <ChevronRight className="w-4 h-4" />
        </button>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip
          </button>
        )}
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────
  if (step === 'result') {
    return (
      <div className={pad}>
        <ResultIcon tier={result.tier} />

        <div className="text-center mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Your result</p>
          <h3 className={`font-bold text-gray-900 mb-3 ${compact ? 'text-lg' : 'text-xl'}`}>
            {result.headline}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">{result.body}</p>
        </div>

        {/* Score visual */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-5">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-5 h-1.5 rounded-full transition-all"
                style={{
                  background: i < Math.round(totalScore / 2)
                    ? (result.tier === 'strong' ? '#f59e0b' : result.tier === 'likely' ? '#3b82f6' : '#d1d5db')
                    : '#e5e7eb'
                }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {totalScore}/10 match score
          </p>
        </div>

        <button
          onClick={onCTA}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] text-base mb-3"
          style={{
            background: result.tier === 'strong'
              ? 'linear-gradient(135deg, #f59e0b, #f97316)'
              : result.tier === 'likely'
              ? '#1d4ed8'
              : '#374151',
            boxShadow: result.tier === 'strong' ? '0 4px 16px rgba(245,158,11,0.3)' : 'none',
          }}
        >
          {result.ctaLabel}
          <ChevronRight className="w-4 h-4" />
        </button>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Maybe later
          </button>
        )}
      </div>
    );
  }

  // ── Question ───────────────────────────────────────────────
  if (!currentQ) return null;

  return (
    <div className={`${pad} transition-opacity duration-150 ${animating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Nav */}
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={goBack}
          className={`flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors ${step === 1 ? 'invisible' : ''}`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <span className="text-xs text-gray-400">Question {step} of {QUESTIONS.length}</span>
      </div>

      <ProgressBar current={step as number} total={QUESTIONS.length} />

      <h3 className={`font-bold text-gray-900 mb-1.5 ${headSize}`}>{currentQ.text}</h3>
      {currentQ.sub && (
        <p className="text-xs text-gray-400 mb-5">{currentQ.sub}</p>
      )}
      {!currentQ.sub && <div className="mb-5" />}

      <div className="space-y-2.5">
        {currentQ.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => {
              setSelected(i);
              goNext(opt.score);
            }}
            className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
              selected === i
                ? 'bg-amber-50 border-amber-400 text-amber-800'
                : 'bg-white border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
