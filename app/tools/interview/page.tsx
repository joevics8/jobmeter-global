'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, MessageCircle, FileCheck, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { InterviewPrepService, InterviewSession } from '@/lib/services/interviewPrepService';
import InterviewPrepModal from '@/components/tools/InterviewPrepModal';

export default function InterviewPage() {
  const router = useRouter();
  const [sessionHistory, setSessionHistory] = useState<InterviewSession[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessionHistory();
  }, []);

  const loadSessionHistory = () => {
    try {
      const history = InterviewPrepService.getHistory();
      // Ensure all sessions have a chat array (migration for old sessions)
      const cleanedHistory = history.map(session => ({
        ...session,
        chat: session.chat || [],
      }));
      setSessionHistory(cleanedHistory);
    } catch (error) {
      console.error('Error loading session history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/tools"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Interview Practice</h1>
                <p className="text-sm text-gray-600">
                  Practice interviews with AI-powered questions and feedback
                </p>
              </div>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm flex-shrink-0">1</div>
              <p className="text-sm text-gray-600">Start a new practice session</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm flex-shrink-0">2</div>
              <p className="text-sm text-gray-600">Answer AI-generated interview questions</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm flex-shrink-0">3</div>
              <p className="text-sm text-gray-600">Get instant feedback on your answers</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm flex-shrink-0">4</div>
              <p className="text-sm text-gray-600">Track progress and improve over time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sessionHistory.length > 0 ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Sessions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessionHistory.map((session) => {
                const chat = session.chat || [];
                const totalQuestions = chat.filter(m => m.type === 'question').length;
                const completedAnswers = chat.filter(m => m.type === 'answer').length;
                const progressPercent = totalQuestions > 0 ? (completedAnswers / totalQuestions) * 100 : 0;

                return (
                  <div
                    key={session.id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/tools/interview/${session.id}`)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <MessageCircle size={24} className="text-green-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {session.jobTitle || 'Interview Practice'}
                          </h3>
                          <span className="text-sm text-gray-600">
                            {session.cvUsed ? 'With CV' : 'Job Only'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {completedAnswers}/{totalQuestions}
                        </div>
                        <div className="text-xs text-gray-500">Questions</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{formatDate(session.timestamp)}</span>
                      </div>
                    </div>

                    {session.jobCompany && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Company:</strong> {session.jobCompany}
                      </p>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {session.completed ? 'Completed' : 'In Progress'}
                        </span>
                        <TrendingUp size={16} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Practice Sessions Yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start your first interview practice session to get personalized questions and AI-powered feedback.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
            >
              <Plus size={20} />
              Start Your First Session
            </button>
          </div>
        )}
      </div>

      {/* Interview Prep Modal */}
      <InterviewPrepModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          loadSessionHistory();
        }}
      />

{/* Related Tools */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-t border-gray-200 pt-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'CV Keyword Checker', description: 'Check keyword match between your CV and job descriptions', color: '#10B981', route: '/tools/keyword-checker' },
              { title: 'ATS CV Review', description: 'Optimize your CV for ATS systems before applying', color: '#8B5CF6', route: '/tools/ats-review' },
              { title: 'Career Coach', description: 'Get personalized career guidance and advice', color: '#F59E0B', route: '/tools/career' },
              { title: 'Role Finder', description: 'Discover new career paths based on your skills', color: '#06B6D4', route: '/tools/role-finder' },
              { title: 'Job Scam Detector', description: 'AI-powered analysis to detect fraudulent job postings', color: '#EF4444', route: '/tools/scam-detector' },
            ].map(tool => (
              <a key={tool.title} href={tool.route} className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tool.color + '1A' }}>
                  <span className="text-lg font-bold" style={{ color: tool.color }}>→</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{tool.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{tool.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* SEO Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-t border-gray-200 pt-8 space-y-8">

          {/* Intro */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Interview Practice: Free Mock Interviews with Instant Feedback</h2>
            <p className="text-gray-700 mb-4">
              JobMeter's AI Interview Practice tool gives you a realistic mock interview experience — completely free. Whether you're preparing for a first-round screen, a technical panel, or a final-stage behavioural interview, our AI generates questions tailored to your exact job description and CV, then scores your answers in real time.
            </p>
            <p className="text-gray-700">
              Practice via audio or text, track your progress across sessions, and walk into every interview with the confidence that comes from genuine preparation. No signup required to get started.
            </p>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Add Your Job & CV', desc: 'Paste or select a job description, then upload or skip your CV to personalise the session.' },
                { step: '2', title: 'Start a Practice Session', desc: 'Our AI generates role-specific questions — behavioural, technical, and situational.' },
                { step: '3', title: 'Answer via Audio or Text', desc: 'Respond in your preferred mode. Audio mirrors a real interview; text lets you think carefully.' },
                { step: '4', title: 'Get Instant Feedback', desc: 'Receive a score, model answer, and specific tips to sharpen each response.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">{step}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">{title}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Use AI Interview Practice */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Why Use AI for Interview Practice?</h2>
            <p className="text-gray-700 mb-4">
              Traditional mock interviews require scheduling with a career counsellor or persuading a friend to roleplay a hiring manager. AI interview practice removes every barrier — it's available 24/7, infinitely patient, and gives objective feedback uncoloured by social comfort.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Practice as many times as you need — no booking required',
                'Questions adapt to your specific role, not generic lists',
                'Audio mode simulates a real interview under time pressure',
                'Instant, objective scoring on content, clarity, and structure',
                'Track improvement across sessions over time',
                'Free alternative to paid platforms like Exponent or Huru AI',
              ].map(point => (
                <div key={point} className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  {point}
                </div>
              ))}
            </div>
          </div>

          {/* Question Types */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Interview Question Types You'll Practice</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Behavioural Questions</h3>
                <ul className="space-y-1 text-sm">
                  {[
                    'Tell me about yourself',
                    'Describe a time you handled conflict at work',
                    'What are your greatest strengths and weaknesses?',
                    'Give an example of a goal you achieved under pressure',
                    'Why do you want to leave your current role?',
                  ].map(q => <li key={q} className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">›</span>{q}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Role-Specific & Situational</h3>
                <ul className="space-y-1 text-sm">
                  {[
                    'How would you prioritise competing deadlines?',
                    'Walk me through how you would approach [task]',
                    'What would you do in your first 90 days?',
                    'How do you stay updated in your field?',
                    'Do you have any questions for us?',
                  ].map(q => <li key={q} className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">›</span>{q}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* STAR Method */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Answering with the STAR Method</h2>
            <p className="text-gray-700 mb-4">
              The STAR method is the gold standard for answering behavioural interview questions. Our AI feedback is calibrated to it, so practising here builds the habit automatically.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { letter: 'S', word: 'Situation', desc: 'Set the context — what was the challenge or scenario?' },
                { letter: 'T', word: 'Task', desc: 'What was your specific responsibility in that situation?' },
                { letter: 'A', word: 'Action', desc: 'What did you do? Focus on your individual contribution.' },
                { letter: 'R', word: 'Result', desc: 'What was the outcome? Use numbers or metrics where possible.' },
              ].map(({ letter, word, desc }) => (
                <div key={letter} className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{letter}</div>
                  <div className="font-semibold text-gray-900 text-sm mb-2">{word}</div>
                  <div className="text-xs text-gray-600 leading-snug">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Audio vs Text */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Audio vs Text Mode: Which Should You Choose?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm">🎙</span>
                  Audio Mode
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span>Simulates a real spoken interview</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span>Ideal for phone screens and video interviews</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span>Trains you to think and speak under time pressure</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span>Best for AI video interview practice preparation</li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm">✍</span>
                  Text Mode
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span>Great for structuring and refining your answers</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span>Useful for asynchronous video assessments</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span>Works anywhere, no microphone needed</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span>Ideal for students doing mock interview practice</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tips to Get the Most from AI Interview Practice</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
              {[
                { tip: 'Use a real job description', detail: 'The more specific the JD, the more targeted the questions.' },
                { tip: 'Do multiple sessions', detail: 'Repetition builds genuine recall under pressure — not just recognition.' },
                { tip: 'Review every piece of feedback', detail: 'Don\'t skip the model answers. They show you what "excellent" looks like.' },
                { tip: 'Try both modes', detail: 'If your interview is on video, finish with audio mode to simulate real conditions.' },
                { tip: 'Time yourself', detail: 'Aim for 90–120 seconds per answer — concise, structured, and specific.' },
                { tip: 'Practice the day before', detail: 'One focused session the evening before dramatically reduces anxiety.' },
              ].map(({ tip, detail }) => (
                <div key={tip} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5 flex-shrink-0">→</span>
                  <div><span className="font-medium text-gray-900">{tip}:</span> {detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {[
                { q: 'Is this AI interview practice free?', a: 'Yes. JobMeter\'s interview practice tool is completely free with no subscription required. You can run unlimited practice sessions without signing up.' },
                { q: 'How does AI interview practice work?', a: 'You paste a job description and optionally your CV. The AI generates relevant interview questions, listens to or reads your answers, then provides instant feedback on content, structure, and delivery.' },
                { q: 'Can I practice for any job role?', a: 'Yes. The AI adapts questions to whatever role and industry you specify — from software engineering and finance to marketing, healthcare, and beyond.' },
                { q: 'What is the difference between this and Google Interview Warmup?', a: 'Google Interview Warmup focuses on a narrow set of tech and data roles. JobMeter covers all industries, supports both audio and text modes, and gives personalised feedback based on your actual CV and target job.' },
                { q: 'Is this comparable to Exponent or Huru AI?', a: 'Yes. Like Exponent and Huru AI, JobMeter provides AI-generated interview questions and feedback. Unlike many platforms, core features are free with no paywall blocking access to quality practice.' },
                { q: 'Does the AI give feedback on audio answers?', a: 'Yes. In audio mode, your spoken response is transcribed and analysed. You receive feedback on the content of your answer as well as tips on clarity and structure.' },
                { q: 'Can students use this for mock interview practice?', a: 'Absolutely. The tool is well-suited for students preparing for graduate schemes, internship interviews, or their first job. It is especially useful when career services or practice partners are unavailable.' },
                { q: 'What are AI video interview practice platforms?', a: 'AI video interview practice platforms like JobMeter, Huru AI, and others let you simulate a video interview with AI as the interviewer. They transcribe and evaluate your answers, helping you prepare for asynchronous video assessments used by many employers.' },
                { q: 'What is the best AI for interview preparation?', a: 'The best tool is one you will actually use consistently. JobMeter is free, requires no account, and works for any role globally. For specialised technical prep, tools like Exponent offer additional resources for product management and engineering.' },
                { q: 'How many times should I practice before an interview?', a: 'At minimum, do one full session per interview you have booked. For high-stakes roles, aim for three to five sessions spread over a week, plus a final run-through the evening before.' },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "AI Interview Practice",
              "description": "Free AI-powered mock interview practice tool. Get instant feedback on your answers via audio or text for any job role.",
              "url": "https://jobmeter.com/tools/interview",
              "applicationCategory": "Career",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
      </div>
    </div>
  );
}