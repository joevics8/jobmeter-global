'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, FileCheck, Clock, TrendingUp, FileText, Search, Briefcase, MessageCircle, GraduationCap, Brain, Shield, Calculator } from 'lucide-react';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import ATSReviewModal from '@/components/tools/ATSReviewModal';
import AuthModal from '@/components/AuthModal';

export default function ATSReviewPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        loadSessionHistory();
      } else {
        setAuthModalOpen(true);
        loadSessionHistory();
      }
    } catch (error) {
      loadSessionHistory();
    } finally {
      setLoading(false);
    }
  };

  const loadSessionHistory = () => {
    try {
      const history = localStorage.getItem('ats_cv_review_history');
      if (history) {
        const sessions = JSON.parse(history);
        setSessionHistory(sessions);
      }
    } catch (error) {
      console.error('Error loading session history:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    // Reload history after modal closes (in case a new review was created)
    setTimeout(() => loadSessionHistory(), 100);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return theme.colors.match.good;
    if (score >= 60) return theme.colors.match.average;
    return theme.colors.match.bad;
  };

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
                <h1 className="text-2xl font-bold text-gray-900">ATS CV Review</h1>
                <p className="text-sm text-gray-600">
                  Check the Suitability of your CV for a Role
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
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
              <p className="text-sm text-gray-600">Upload your CV or paste its content</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm flex-shrink-0">2</div>
              <p className="text-sm text-gray-600">Select a target job description (optional)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm flex-shrink-0">3</div>
              <p className="text-sm text-gray-600">Our AI analyzes your CV for ATS compatibility</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm flex-shrink-0">4</div>
              <p className="text-sm text-gray-600">Receive a detailed score and improvement tips</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sessionHistory.length > 0 ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Reviews</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessionHistory.map((session) => {
                const date = new Date(session.timestamp);
                const scoreColor = getScoreColor(session.overallScore);

                return (
                  <div
                    key={session.id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/tools/ats-review/${session.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <FileCheck size={24} className="text-green-600" />
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {session.cvName}
                            </h3>
                            <span className="text-sm text-gray-600">
                              {session.reviewType === 'cv-job' ? 'Job-Specific Review' : 'General ATS Review'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className="text-3xl font-bold"
                            style={{ color: scoreColor }}
                          >
                            {session.overallScore}%
                          </div>
                          <div className="text-xs text-gray-500">ATS Score</div>
                        </div>
                      </div>
                        {session.jobTitle && (
                          <p className="text-sm text-gray-600 mb-3">
                            <strong>Job:</strong> {session.jobTitle}
                            {session.jobCompany && ` at ${session.jobCompany}`}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{date.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>


                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <FileCheck size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Reviews Yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start your first ATS CV review to optimize your resume for better job matching and ATS compatibility.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
            >
              <Plus size={20} />
              Start Your First Review
            </button>
          </div>
        )}
      </div>

      {/* ATS Review Modal */}
      <ATSReviewModal
        isOpen={showModal}
        onClose={handleModalClose}
      />

      {/* Related Tools */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Related Tools</h2>
          <p className="text-gray-600 mb-6">Explore more tools to supercharge your job search and career growth.</p>

          {/* CV Tools */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={20} style={{ color: '#2563EB' }} />
              <h3 className="text-lg font-semibold text-gray-900">CV Tools</h3>
              <span className="text-sm text-gray-500">– Build and optimize your CV</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/cv" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
                  <FileText size={20} style={{ color: '#2563EB' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Create CV / Cover Letter</p>
                  <p className="text-sm text-gray-500">Build professional CVs and cover letters in minutes</p>
                </div>
              </Link>
              <Link href="/tools/keyword-checker" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ECFDF5' }}>
                  <Search size={20} style={{ color: '#10B981' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">CV Keyword Checker</p>
                  <p className="text-sm text-gray-500">Check keyword match between your CV and job descriptions</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Career Tools */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase size={20} style={{ color: '#F59E0B' }} />
              <h3 className="text-lg font-semibold text-gray-900">Career Tools</h3>
              <span className="text-sm text-gray-500">– Tools to help advance your career</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/tools/interview" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F5F3FF' }}>
                  <MessageCircle size={20} style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Interview Practice</p>
                  <p className="text-sm text-gray-500">Practice with personalized questions based on job descriptions</p>
                </div>
              </Link>
              <Link href="/tools/career" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFFBEB' }}>
                  <GraduationCap size={20} style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">Career Coach</p>
                  <p className="text-sm text-gray-500">Get personalized career guidance and advice</p>
                </div>
              </Link>
              <Link href="/tools/role-finder" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ECFEFF' }}>
                  <Search size={20} style={{ color: '#06B6D4' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">Role Finder</p>
                  <p className="text-sm text-gray-500">Discover new career paths based on your skills</p>
                </div>
              </Link>
              <Link href="/tools/quiz" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF2F8' }}>
                  <Brain size={20} style={{ color: '#EC4899' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">Company Quiz</p>
                  <p className="text-sm text-gray-500">Practice aptitude tests from top companies</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Safety Tools */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={20} style={{ color: '#EF4444' }} />
              <h3 className="text-lg font-semibold text-gray-900">Safety Tools</h3>
              <span className="text-sm text-gray-500">– Stay safe from job scams</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/tools/scam-detector" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF2F2' }}>
                  <Shield size={20} style={{ color: '#EF4444' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">Job Description Analyzer</p>
                  <p className="text-sm text-gray-500">AI-powered analysis to detect job scams in any text</p>
                </div>
              </Link>
              <Link href="/tools/scam-checker" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF2F2' }}>
                  <Shield size={20} style={{ color: '#DC2626' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors">Job Scam Checker</p>
                  <p className="text-sm text-gray-500">Search and report fraudulent companies and recruiters</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Salary Tools */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={20} style={{ color: '#3B82F6' }} />
              <h3 className="text-lg font-semibold text-gray-900">Salary Tools</h3>
              <span className="text-sm text-gray-500">– Calculate and compare salaries</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/tools/paye-calculator" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
                  <Calculator size={20} style={{ color: '#3B82F6' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">PAYE Calculator</p>
                  <p className="text-sm text-gray-500">Calculate net salary with 2026 Nigeria tax rates</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ATS CV Review: Free ATS Resume Checker &amp; Instant Resume Score</h2>
          <p className="text-gray-600 mb-8">
            ATS CV Review is the ultimate free ATS resume checker — scan your CV for applicant tracking system compatibility, get a detailed resume score out of 100, and receive actionable improvements to boost your job application success rate.
          </p>

          <div className="space-y-10 text-gray-700">

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">What is ATS CV Review?</h3>
              <p className="mb-3">
                ATS CV Review is a free online ATS resume checker that analyzes your resume against the applicant tracking systems (ATS) used by employers worldwide — including Taleo, Workday, iCIMS, Greenhouse, and Lever. It checks for formatting issues, ATS keyword matches, structural problems, and overall ATS compatibility to give you a precise resume score from 0 to 100.
              </p>
              <p>
                Unlike basic resume checkers, our AI resume checker simulates real ATS parsing — identifying problems like unreadable fonts, missing sections, and non-compliant layouts that cause 75% of resumes to be rejected automatically before a human ever sees them. Job seekers who fix these issues with an ATS-friendly resume checker see up to 90% higher interview rates.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Why Use a Free ATS Resume Checker?</h3>
              <p className="mb-3">
                Over 99% of Fortune 500 companies use ATS software to screen resumes, filtering out non-compliant applications before any recruiter reads them. A free ATS resume checker like ATS CV Review ensures your resume passes these automated scans by optimizing for job description keywords, proper section headings, and clean, parser-friendly layouts.
              </p>
              <p>
                Without an ATS check, even perfect qualifications get overlooked. Our resume checker free tool delivers instant results — no sign-up, no credit card, 100% free — for check resume for ATS, resume score check free, ATS keyword scanner, and more.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">How ATS Systems Work</h3>
              <p className="mb-3">
                Applicant Tracking Systems parse resumes by extracting structured data into categories like skills, work experience, and education using optical character recognition (OCR) and keyword matching algorithms. They then rank candidates based on their match percentage against the job description — resumes scoring below 70–80% are typically filtered out automatically.
              </p>
              <p>
                Popular ATS platforms include Taleo, Workday, iCIMS, Greenhouse, BambooHR, SAP SuccessFactors, and Lever — each with unique parsing rules our ATS CV checker is built to account for.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Key Features of Our Free ATS Resume Checker</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span><span><strong>Instant Resume Score:</strong> Get a 0–100 score breaking down ATS compatibility, content strength, keyword density, and section completeness.</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span><span><strong>ATS Keyword Scanner:</strong> Identifies missing ATS keywords like "Python," "project management," or role-specific terms extracted from your pasted job description.</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span><span><strong>ATS Compliance Check:</strong> Flags formatting errors — tables, images, headers/footers, fancy fonts, or multi-column layouts — that block ATS parsing.</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span><span><strong>AI Resume Checker:</strong> Provides personalized suggestions for stronger bullet points, action verbs, and quantifiable achievements.</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span><span><strong>Line-by-Line Section Analysis:</strong> Detailed feedback on Skills, Work Experience, Education, and Summary sections — each scored individually.</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span><span><strong>Multi-Format Support:</strong> Upload PDF or DOCX, or paste text directly for instant online ATS resume checker free scans.</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span><span><strong>No Paywall:</strong> Full free ATS checker online — no sign-up, no credit card, unlimited scans.</span></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">How to Use ATS CV Review — Step-by-Step</h3>
              <ol className="space-y-3 list-none">
                {[
                  { step: '1', title: 'Upload Your Resume', desc: 'Drag and drop your CV or resume file (PDF/DOCX) or paste the text directly into the tool.' },
                  { step: '2', title: 'Add a Job Description (Optional)', desc: 'Paste the target job posting for precise ATS keyword matching and resume ATS checker free optimization.' },
                  { step: '3', title: 'Run the ATS Scan', desc: 'Click to start — results are delivered in seconds via our AI-powered ATS score checker.' },
                  { step: '4', title: 'Review Your ATS Report', desc: 'See your overall resume score, section-by-section breakdowns, missing keywords, and fix suggestions.' },
                  { step: '5', title: 'Optimize and Re-Scan', desc: 'Implement the recommended changes and re-upload your updated CV to track your improved ATS score.' },
                ].map(({ step, title, desc }) => (
                  <li key={step} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0 mt-0.5">{step}</div>
                    <div><strong className="text-gray-900">{title}:</strong> <span>{desc}</span></div>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-sm text-gray-500">This complete online ATS resume checker process takes under 60 seconds — ideal for a quick rate my resume check before submitting any application.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">ATS Resume Best Practices</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-900 border-b border-gray-200">Category</th>
                      <th className="text-left p-3 font-semibold text-green-700 border-b border-gray-200">✓ Do</th>
                      <th className="text-left p-3 font-semibold text-red-600 border-b border-gray-200">✗ Don&apos;t</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { cat: 'Formatting', do: 'Standard fonts (Arial, Calibri 10–12pt), bold headings like "Work Experience"', dont: 'Tables, images, headers/footers, color text' },
                      { cat: 'Keywords', do: 'Mirror job description terms naturally (e.g., "SEO optimization", "data analysis")', dont: 'Keyword stuffing or unexpanded acronyms' },
                      { cat: 'Structure', do: 'Chronological order, clear dates (MM/YYYY), bullet points under 2 lines', dont: 'Creative layouts, multi-column formats' },
                      { cat: 'File Type', do: '.docx or text-based PDF', dont: 'Scanned image PDFs or .jpg files' },
                      { cat: 'Content', do: 'Quantify achievements ("Increased sales by 30%", "Managed $2M budget")', dont: 'Generic duty lists without measurable impact' },
                      { cat: 'Length', do: '1–2 pages for most roles; 3 max for senior positions', dont: 'Overlong resumes with filler content' },
                    ].map(({ cat, do: doText, dont }) => (
                      <tr key={cat} className="hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-900">{cat}</td>
                        <td className="p-3 text-gray-700">{doText}</td>
                        <td className="p-3 text-gray-700">{dont}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Common ATS Resume Mistakes to Avoid</h3>
              <ul className="space-y-2">
                {[
                  'Fancy graphics or charts — icons and visuals confuse ATS parsers, dropping your ATS score significantly.',
                  'Non-standard section headings — use "Skills" and "Work Experience," not creative alternatives like "My Superpowers."',
                  'Missing keywords — without job-specific ATS keywords, your resume is filtered out before review.',
                  'Inconsistent date formats — use MM/YYYY consistently; gaps or non-standard formats confuse ATS date parsing.',
                  'Overly long resumes — keep to 1–2 pages; excessive length reduces keyword density scores.',
                  'Headers and footers — most ATS cannot read content placed in document headers or footers.',
                  'Wrong file format — scanned PDFs are images, not readable text, and will fail ATS parsing entirely.',
                  'Unexpanded acronyms — always write out "Search Engine Optimization (SEO)" before using the acronym.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5 flex-shrink-0">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Understanding Your Resume Score</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { range: '0–50', label: 'Weak', desc: 'Major ATS blockers present. Full rewrite recommended.', color: '#EF4444', bg: '#FEF2F2' },
                  { range: '50–75', label: 'Average', desc: 'Passes basic ATS scans but lacks keyword depth.', color: '#F59E0B', bg: '#FFFBEB' },
                  { range: '75–85', label: 'Good', desc: 'Recruiter-ready with minor optimization tweaks.', color: '#10B981', bg: '#ECFDF5' },
                  { range: '85–100', label: 'Excellent', desc: 'Fully optimized for top ATS rankings and recruiter visibility.', color: '#2563EB', bg: '#EFF6FF' },
                ].map(({ range, label, desc, color, bg }) => (
                  <div key={range} className="rounded-xl p-4 border" style={{ backgroundColor: bg, borderColor: color + '33' }}>
                    <div className="text-2xl font-bold mb-1" style={{ color }}>{range}</div>
                    <div className="font-semibold text-gray-900 mb-1">{label}</div>
                    <div className="text-sm text-gray-600">{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h3>
              <div className="space-y-5">
                {[
                  { q: 'What is the best free ATS resume checker?', a: 'ATS CV Review is consistently top-rated for instant, detailed ATS scans with no sign-up required. It covers keyword matching, formatting compliance, section scoring, and AI-powered suggestions in a single free scan.' },
                  { q: 'How do I check my resume for ATS compatibility?', a: 'Upload your PDF or DOCX (or paste plain text) into our free ATS checker online, optionally add the job description, and get your ATS score and fix list in under 60 seconds.' },
                  { q: 'Is there a truly free ATS resume checker?', a: 'Yes — ATS CV Review offers unlimited free ATS resume checker online use. No subscription, no credit card, no hidden limits.' },
                  { q: 'What is a good ATS resume score?', a: 'An ATS score of 80 or above indicates strong ATS compatibility and good recruiter appeal. Aim for 85+ for competitive roles.' },
                  { q: 'Can I use this as a CV ATS checker for UK/EU formats?', a: 'Absolutely. Our tool supports CV review for UK, EU, US, Canadian, Australian, and global resume formats.' },
                  { q: 'How does an AI resume checker work?', a: 'Our AI is trained on millions of resumes and job descriptions. It parses your CV the same way ATS software does, scoring keyword density, formatting, section completeness, and content quality.' },
                  { q: 'What if my ATS score is low?', a: 'Follow the specific fix suggestions in your report, re-upload your updated CV, and track your score improvement. Most users see a 20–30 point score jump after implementing our recommendations.' },
                  { q: 'Does ATS CV Review support all file types?', a: 'We support PDF (text-based), DOCX, and plain text paste. Note: scanned image PDFs cannot be parsed by any ATS tool.' },
                  { q: 'How is ATS CV Review different from Resume Worded or Jobscan?', a: 'ATS CV Review offers a fully free, no-sign-up experience with advanced AI keyword matching, detailed section-level scoring, and job description integration — features typically locked behind paywalls on competitor platforms.' },
                  { q: 'Can I use this tool multiple times?', a: 'Yes — unlimited free scans. We recommend re-scanning every time you update your CV or apply to a new role.' },
                ].map(({ q, a }, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="font-semibold text-gray-900 mb-2">{q}</p>
                    <p className="text-gray-600 text-sm">{a}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* JSON-LD Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "ATS CV Review — Free ATS Resume Checker",
              "description": "Free ATS resume checker that scans your CV for applicant tracking system compatibility. Get an instant resume score out of 100, keyword analysis, formatting checks, and AI-powered suggestions. No sign-up required.",
              "url": "https://jobmeter.com/tools/ats-review",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "All",
              "browserRequirements": "Requires JavaScript",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Instant ATS resume score",
                "ATS keyword scanner",
                "ATS formatting compliance check",
                "AI-powered resume suggestions",
                "Section-by-section scoring",
                "Job description keyword matching",
                "PDF and DOCX support"
              ],
              "creator": {
                "@type": "Organization",
                "name": "JobMeter",
                "url": "https://jobmeter.com"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is the best free ATS resume checker?",
                  "acceptedAnswer": { "@type": "Answer", "text": "ATS CV Review is consistently top-rated for instant, detailed ATS scans with no sign-up required, covering keyword matching, formatting compliance, section scoring, and AI-powered suggestions for free." }
                },
                {
                  "@type": "Question",
                  "name": "How do I check my resume for ATS compatibility?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Upload your PDF or DOCX or paste plain text into our free ATS checker, optionally add the job description, and receive your ATS score and fix recommendations in under 60 seconds." }
                },
                {
                  "@type": "Question",
                  "name": "Is there a truly free ATS resume checker?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Yes — ATS CV Review offers unlimited free ATS resume checker online use with no subscription, no credit card, and no hidden limits." }
                },
                {
                  "@type": "Question",
                  "name": "What is a good ATS resume score?",
                  "acceptedAnswer": { "@type": "Answer", "text": "An ATS score of 80 or above indicates strong ATS compatibility. Aim for 85+ for competitive job applications." }
                },
                {
                  "@type": "Question",
                  "name": "What if my ATS score is low?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Follow the specific fix suggestions in your report, update your CV, and re-scan. Most users see a 20–30 point score improvement after implementing the recommendations." }
                }
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              "name": "How to Check Your Resume for ATS Compatibility",
              "description": "Use our free ATS resume checker to scan your CV and get an instant ATS score with improvement suggestions.",
              "totalTime": "PT1M",
              "supply": [{ "@type": "HowToSupply", "name": "Your resume or CV (PDF, DOCX, or plain text)" }],
              "tool": [{ "@type": "HowToTool", "name": "ATS CV Review — Free ATS Resume Checker" }],
              "step": [
                { "@type": "HowToStep", "name": "Upload Your Resume", "text": "Drag and drop your CV or resume file (PDF/DOCX) or paste the text directly." },
                { "@type": "HowToStep", "name": "Add Job Description", "text": "Optionally paste the target job posting for precise ATS keyword matching." },
                { "@type": "HowToStep", "name": "Run the ATS Scan", "text": "Click to start — your AI-powered ATS score is ready in seconds." },
                { "@type": "HowToStep", "name": "Review Your ATS Report", "text": "See your resume score, missing keywords, formatting issues, and section-level feedback." },
                { "@type": "HowToStep", "name": "Optimize and Re-Scan", "text": "Implement the fix suggestions and re-upload your updated CV to track your improved score." }
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://jobmeter.com" },
                { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://jobmeter.com/tools" },
                { "@type": "ListItem", "position": 3, "name": "ATS CV Review", "item": "https://jobmeter.com/tools/ats-review" }
              ]
            })
          }}
        />
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}