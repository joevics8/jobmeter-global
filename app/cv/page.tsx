"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, FileText, Trash2, ArrowLeft, ChevronDown, Search, FileCheck, Briefcase, MessageCircle, GraduationCap, Brain, Shield, Calculator, CheckCircle, XCircle } from 'lucide-react';
import { theme } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import CreateCVModal from '@/components/cv/CreateCVModal';
import CreateCoverLetterModal from '@/components/cv/CreateCoverLetterModal';
import Link from 'next/link';

interface CVDocument {
  id: string;
  name: string;
  type: 'cv' | 'cover-letter';
  template_id: string;
  structured_data: any;
  content: string;
  created_at: string;
  createdAt?: string;
  updated_at: string;
}

export default function CVListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<CVDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cv' | 'cover-letter'>('cv');
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [coverLetterModalOpen, setCoverLetterModalOpen] = useState(false);
  const [seoExpanded, setSeoExpanded] = useState(false);

  // Read tab from URL parameter on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'cv' || tabParam === 'cover-letter') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadDocuments();
  }, [activeTab]);

  const loadDocuments = () => {
    try {
      setLoading(true);
      const existingDocs = localStorage.getItem('cv_documents');
      if (existingDocs) {
        const docs = JSON.parse(existingDocs);
        const filtered = docs.filter((doc: any) => doc.type === activeTab);
        setDocuments(filtered);
      } else {
        setDocuments([]);
      }
    } catch (error: any) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const existingDocs = localStorage.getItem('cv_documents');
      if (existingDocs) {
        const docs = JSON.parse(existingDocs);
        const filtered = docs.filter((doc: any) => doc.id !== id);
        localStorage.setItem('cv_documents', JSON.stringify(filtered));
        loadDocuments();
      }
    } catch (error: any) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleCVComplete = (cvId: string) => {
    loadDocuments();
    router.push(`/cv/view/${cvId}`);
  };

  const handleCoverLetterComplete = (coverLetterId: string) => {
    loadDocuments();
    router.push(`/cv/view/${coverLetterId}`);
  };

  const filteredDocuments = documents.filter(doc => doc.type === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/jobs" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CV &amp; Cover Letters</h1>
                <p className="text-sm text-gray-600">Build professional CVs and cover letters with AI</p>
              </div>
            </div>
            <Button
              onClick={() => activeTab === 'cv' ? setCvModalOpen(true) : setCoverLetterModalOpen(true)}
              className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 text-sm"
            >
              <Plus size={16} className="mr-1" />
              Create {activeTab === 'cv' ? 'CV' : 'Cover Letter'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2">
        <button
          onClick={() => setActiveTab('cv')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'cv'
              ? 'border-b-2 text-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          style={{
            borderBottomColor: activeTab === 'cv' ? theme.colors.primary.DEFAULT : 'transparent',
            color: activeTab === 'cv' ? theme.colors.primary.DEFAULT : undefined,
          }}
        >
          CVs
        </button>
        <button
          onClick={() => setActiveTab('cover-letter')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'cover-letter'
              ? 'border-b-2 text-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          style={{
            borderBottomColor: activeTab === 'cover-letter' ? theme.colors.primary.DEFAULT : 'transparent',
            color: activeTab === 'cover-letter' ? theme.colors.primary.DEFAULT : undefined,
          }}
        >
          Cover Letters
        </button>
      </div>
    </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {activeTab === 'cv' ? 'CVs' : 'cover letters'} yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first {activeTab === 'cv' ? 'CV' : 'cover letter'} to get started
            </p>
            <p className="text-sm text-gray-500">Use the button in the header to create your first document</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc, index) => (
              <React.Fragment key={doc.id}>
              <div
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer"
                onClick={() => router.push(`/cv/view/${doc.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{doc.name}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(doc.createdAt || doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doc.id);
                    }}
                    className="p-1 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>

              </React.Fragment>
            ))}
          </div>
        )}


        {/* Desktop Create Button */}
        <div className="hidden sm:block mt-6">
          <Button
            onClick={() => activeTab === 'cv' ? setCvModalOpen(true) : setCoverLetterModalOpen(true)}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Plus size={16} className="mr-2" />
            Create {activeTab === 'cv' ? 'CV' : 'Cover Letter'}
          </Button>
        </div>
      </div>

      {/* Modals */}
      <CreateCVModal
        isOpen={cvModalOpen}
        onClose={() => setCvModalOpen(false)}
        onComplete={handleCVComplete}
      />
      <CreateCoverLetterModal
        isOpen={coverLetterModalOpen}
        onClose={() => setCoverLetterModalOpen(false)}
        onComplete={handleCoverLetterComplete}
      />

      {/* Related Tools */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="border-t border-gray-200 pt-8 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Related Tools</h2>
          <p className="text-gray-600 mb-6">More AI-powered tools to strengthen your job search and career growth.</p>

          {/* CV Tools */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} style={{ color: '#2563EB' }} />
              <h3 className="text-base font-semibold text-gray-900">CV Tools</h3>
              <span className="text-sm text-gray-500">– Optimize your CV</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/tools/keyword-checker" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ECFDF5' }}>
                  <Search size={18} style={{ color: '#10B981' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors text-sm">CV Keyword Checker</p>
                  <p className="text-xs text-gray-500">Check keyword match between your CV and job descriptions</p>
                </div>
              </Link>
              <Link href="/tools/ats-review" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F5F3FF' }}>
                  <FileCheck size={18} style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors text-sm">ATS CV Review</p>
                  <p className="text-xs text-gray-500">Optimize your CV for ATS systems and job matching</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Career Tools */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={18} style={{ color: '#F59E0B' }} />
              <h3 className="text-base font-semibold text-gray-900">Career Tools</h3>
              <span className="text-sm text-gray-500">– Advance your career</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/tools/interview" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F5F3FF' }}>
                  <MessageCircle size={18} style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors text-sm">Interview Practice</p>
                  <p className="text-xs text-gray-500">Practice with personalized questions based on job descriptions</p>
                </div>
              </Link>
              <Link href="/tools/career" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFFBEB' }}>
                  <GraduationCap size={18} style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors text-sm">Career Coach</p>
                  <p className="text-xs text-gray-500">Get personalized career guidance and advice</p>
                </div>
              </Link>
              <Link href="/tools/role-finder" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ECFEFF' }}>
                  <Search size={18} style={{ color: '#06B6D4' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors text-sm">Role Finder</p>
                  <p className="text-xs text-gray-500">Discover new career paths based on your skills</p>
                </div>
              </Link>
              <Link href="/tools/quiz" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF2F8' }}>
                  <Brain size={18} style={{ color: '#EC4899' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors text-sm">Company Quiz</p>
                  <p className="text-xs text-gray-500">Practice aptitude tests from top companies</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Safety Tools */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={18} style={{ color: '#EF4444' }} />
              <h3 className="text-base font-semibold text-gray-900">Safety Tools</h3>
              <span className="text-sm text-gray-500">– Stay safe from job scams</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/tools/scam-detector" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF2F2' }}>
                  <Shield size={18} style={{ color: '#EF4444' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors text-sm">Job Description Analyzer</p>
                  <p className="text-xs text-gray-500">AI-powered analysis to detect job scams in any text</p>
                </div>
              </Link>
              <Link href="/tools/scam-checker" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF2F2' }}>
                  <Shield size={18} style={{ color: '#DC2626' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors text-sm">Job Scam Checker</p>
                  <p className="text-xs text-gray-500">Search and report fraudulent companies and recruiters</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Salary Tools */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calculator size={18} style={{ color: '#3B82F6' }} />
              <h3 className="text-base font-semibold text-gray-900">Salary Tools</h3>
              <span className="text-sm text-gray-500">– Calculate and compare salaries</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/tools/paye-calculator" className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
                  <Calculator size={18} style={{ color: '#3B82F6' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">PAYE Calculator</p>
                  <p className="text-xs text-gray-500">Calculate net salary with 2026 tax rates</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="border-t border-gray-200 pt-8 space-y-10 text-gray-700">

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Free AI CV Maker, Resume Builder &amp; Cover Letter Generator</h2>
            <p className="text-gray-600">
              Create professional, ATS-optimized CVs, resumes, and cover letters in minutes with our free AI-powered builder. No sign-up required, no watermarks, unlimited downloads — the ultimate free online CV maker for job seekers worldwide.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">What is an AI CV Maker?</h3>
            <p className="mb-3">
              An AI CV maker is an intelligent online tool that uses artificial intelligence to help you write, format, and optimize your CV or resume. Unlike blank templates, our AI resume builder analyzes your input — work history, skills, and target role — and generates compelling bullet points, tailored summaries, and keyword-optimized content that passes Applicant Tracking Systems (ATS) and impresses hiring managers.
            </p>
            <p>
              Our free CV creator supports all global formats: UK/EU CVs, US resumes, curriculum vitae formats for academic roles, and cover letters — all from a single platform with no paywalls.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Key Features of Our Free Resume Builder</h3>
            <ul className="space-y-3">
              {[
                { title: 'AI-Powered Content Generation', desc: 'Input your experience and our AI rewrites bullet points for maximum impact — e.g., turning "Managed team" into "Led 10-person cross-functional team to deliver 20% efficiency improvement ahead of schedule."' },
                { title: 'ATS-Optimized Templates', desc: '50+ professional templates designed to pass ATS screening used by top employers on Indeed, LinkedIn, and beyond — outperforming design-only tools like Canva that fail ATS parsing.' },
                { title: 'Unlimited Free Downloads', desc: 'Export your CV or resume as PDF, DOCX, or TXT with no watermarks, no subscriptions, and no hidden limits — unlike competitors with restricted free tiers.' },
                { title: 'Cover Letter Builder', desc: 'Auto-generate personalized, role-specific cover letters that complement your resume — the free alternative to ChatGPT cover letter prompting, with structured formatting built in.' },
                { title: 'Mobile-Friendly CV Editor', desc: 'Build and edit your CV on any device — our CV maker app experience works seamlessly on desktop, tablet, and smartphone.' },
                { title: 'Industry-Specific Optimization', desc: 'Tailored suggestions for IT, nursing, sales, marketing, finance, engineering, and more — with role-specific keywords baked into every template.' },
              ].map(({ title, desc }, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-gray-900">{title}:</strong> {desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">How to Build Your CV or Resume in 3 Steps</h3>
            <ol className="space-y-3 list-none">
              {[
                { n: '1', t: 'Choose your document type', d: 'Select CV, resume, or cover letter. Pick from 50+ professional templates — modern, executive, creative, or simple formats.' },
                { n: '2', t: 'Enter your details', d: 'Add your work experience, education, skills, and achievements. Our AI suggests improvements and generates ATS keywords from your target job description.' },
                { n: '3', t: 'Generate, preview &amp; download', d: 'Preview your completed document, make edits, then export as PDF or DOCX — free, with no watermark, ready to submit.' },
              ].map(({ n, t, d }) => (
                <li key={n} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0 mt-0.5">{n}</div>
                  <div><strong className="text-gray-900" dangerouslySetInnerHTML={{ __html: t }} /> — <span dangerouslySetInnerHTML={{ __html: d }} /></div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">How Our Tool Compares to Top CV Builders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-semibold text-gray-900 border-b border-gray-200">Feature</th>
                    <th className="text-left p-3 font-semibold text-green-700 border-b border-gray-200">Our CV Maker</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-gray-200">Teal</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-gray-200">Rezi</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-gray-200">Canva</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-gray-200">Kickresume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { f: 'Unlimited Free Downloads', our: '✓', teal: '✓', rezi: '✗ (3 max)', canva: 'Limited', kick: 'Students only' },
                    { f: 'AI Content Suggestions', our: 'Advanced', teal: 'Basic', rezi: 'Strong ATS', canva: 'None', kick: 'Basic AI' },
                    { f: 'ATS-Friendly', our: '100%', teal: 'Yes', rezi: 'Excellent', canva: 'Poor', kick: 'Good' },
                    { f: 'Cover Letter Included', our: 'Free', teal: 'Yes', rezi: 'Paid', canva: 'Manual', kick: 'Paid' },
                    { f: 'Watermark-Free', our: 'Always', teal: 'Yes', rezi: 'Free tier', canva: 'No', kick: 'Free tier' },
                  ].map(({ f, our, teal, rezi, canva, kick }) => (
                    <tr key={f} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{f}</td>
                      <td className="p-3 text-green-700 font-medium">{our}</td>
                      <td className="p-3 text-gray-600">{teal}</td>
                      <td className="p-3 text-gray-600">{rezi}</td>
                      <td className="p-3 text-gray-600">{canva}</td>
                      <td className="p-3 text-gray-600">{kick}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Why Professional CVs and Cover Letters Matter</h3>
            <p className="mb-3">
              Recruiters spend an average of 6–7 seconds scanning a CV before deciding whether to proceed. In a competitive global job market where hundreds of applicants compete for each role, a professionally crafted CV and cover letter are your first — and often only — chance to make an impression.
            </p>
            <p className="mb-3">
              Over 99% of large employers use ATS to filter applications before a human reads them. Without ATS-optimized formatting and the right keywords, your CV is rejected automatically — regardless of your qualifications. Our free AI CV maker ensures your documents are built to pass every ATS gate while remaining compelling to human recruiters.
            </p>
            <p>
              Cover letters remain equally important. A well-written cover letter demonstrates communication skills, genuine interest in the role, and the ability to articulate your value — giving context to your CV that bullet points alone cannot convey.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Resume &amp; CV Writing Best Practices</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                <h4 className="font-semibold text-green-900 mb-3">✓ Do This</h4>
                <ul className="text-sm text-green-800 space-y-2">
                  {[
                    'Tailor your CV to every job — mirror keywords from the job description',
                    'Quantify achievements: "Increased revenue by 30%" beats "Improved sales"',
                    'Use standard headings: Work Experience, Education, Skills',
                    'Keep it concise: 1–2 pages for most roles; 3 max for senior positions',
                    'Use action verbs: Led, Delivered, Developed, Managed, Achieved',
                    'Save as text-based PDF or DOCX for ATS compatibility',
                  ].map((s, i) => <li key={i} className="flex items-start gap-2"><span className="mt-0.5">✓</span>{s}</li>)}
                </ul>
              </div>
              <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                <h4 className="font-semibold text-red-900 mb-3">✗ Avoid This</h4>
                <ul className="text-sm text-red-800 space-y-2">
                  {[
                    'Generic CVs sent to every job without customization',
                    'Tables, columns, or graphics that break ATS parsing',
                    'Headers and footers — ATS cannot read them',
                    'Unprofessional email addresses or irrelevant personal info',
                    'Listing duties instead of achievements',
                    'Overused buzzwords: "results-driven," "passionate," "self-starter"',
                  ].map((s, i) => <li key={i} className="flex items-start gap-2"><span className="mt-0.5">✗</span>{s}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Resume Examples by Industry</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-semibold text-gray-900 border-b border-gray-200">Industry</th>
                    <th className="text-left p-3 font-semibold text-gray-900 border-b border-gray-200">Example Bullet Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { ind: 'Sales', ex: 'Exceeded quarterly revenue targets by 120%, generating $500K in new business through strategic prospecting and consultative selling.' },
                    { ind: 'IT / Engineering', ex: 'Developed Python-based automation scripts reducing manual processing time by 40%, saving 15 hours per week across the team.' },
                    { ind: 'Nursing / Healthcare', ex: 'Managed patient care for 50+ cases daily, implementing evidence-based protocols that improved recovery outcomes by 15%.' },
                    { ind: 'Marketing', ex: 'Led SEO and content strategy that grew organic traffic by 200% in 12 months, contributing to a 35% increase in qualified leads.' },
                    { ind: 'Finance', ex: 'Prepared monthly financial reports for a $10M portfolio, identifying cost-saving opportunities worth $250K annually.' },
                    { ind: 'Project Management', ex: 'Delivered 12 cross-functional projects on time and within budget using Agile methodology, managing stakeholders across 4 departments.' },
                  ].map(({ ind, ex }) => (
                    <tr key={ind} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900 whitespace-nowrap">{ind}</td>
                      <td className="p-3 text-gray-600 italic">&ldquo;{ex}&rdquo;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">How to Write an Effective Cover Letter</h3>
            <p className="mb-3">A great cover letter should be concise (3–4 paragraphs), personalized, and directly tied to the job description. Follow this structure:</p>
            <ol className="space-y-3 list-none">
              {[
                { n: '1', t: 'Opening hook', d: 'State the role, where you found it, and one compelling reason you\'re the ideal candidate. Avoid generic openers like "I am writing to apply for..."' },
                { n: '2', t: 'Your value proposition', d: 'Highlight 2–3 specific achievements that directly match the job requirements. Use numbers where possible.' },
                { n: '3', t: 'Company fit', d: 'Show you\'ve researched the company — mention their mission, recent work, or specific team. Explain why this role and company align with your goals.' },
                { n: '4', t: 'Call to action', d: 'Close confidently: express enthusiasm for a conversation, thank the reader, and include your contact details.' },
              ].map(({ n, t, d }) => (
                <li key={n} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0 mt-0.5">{n}</div>
                  <div><strong className="text-gray-900">{t}:</strong> {d}</div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {[
                { q: 'Is this CV maker really free?', a: 'Yes — unlimited access to our free online CV generator with no hidden fees, no subscription, and no watermarks. Download your CV or resume as PDF or DOCX instantly.' },
                { q: 'Does the CV builder work with ATS systems?', a: 'All our templates are built for ATS compatibility — they use clean, single-column layouts, standard headings, and readable fonts that parse correctly on Taleo, Workday, iCIMS, Greenhouse, and all major ATS platforms.' },
                { q: 'Can I create a cover letter too?', a: 'Yes — our free cover letter maker is fully integrated. Generate a personalized, role-specific cover letter that matches your CV in style and content, in the same platform.' },
                { q: 'What formats can I download?', a: 'Export your CV or resume as PDF (recommended for most applications) or DOCX. Both formats are ATS-compatible when created through our builder.' },
                { q: 'Does it work for UK, EU, and US formats?', a: 'Yes — we support UK/EU CVs (typically 2 pages, includes personal profile), US resumes (1–2 pages, no photo), academic curriculum vitae, and international formats.' },
                { q: 'Is there an AI cover letter generator?', a: 'Yes — our AI cover letter generator creates tailored letters based on your CV and the job description, providing a free alternative to manually prompting ChatGPT for cover letters.' },
                { q: 'How is this different from Canva resume templates?', a: 'Canva templates are designed for aesthetics but frequently fail ATS parsing due to multi-column layouts and image-heavy designs. Our templates are ATS-first — professionally designed and fully machine-readable.' },
                { q: 'Can I edit my CV after downloading?', a: 'Yes — your documents are saved to your account. Return any time to update, re-download, or create new versions tailored to different job applications.' },
              ].map(({ q, a }, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                  <p className="font-semibold text-gray-900 mb-2 text-sm">{q}</p>
                  <p className="text-gray-600 text-sm">{a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Schemas */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Free AI CV Maker, Resume Builder & Cover Letter Generator",
          "description": "Free AI-powered CV maker and resume builder. Create ATS-optimized CVs, resumes, and cover letters in minutes with no sign-up required. Unlimited free downloads, no watermarks.",
          "url": "https://jobmeter.com/cv",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "All",
          "browserRequirements": "Requires JavaScript",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "featureList": [
            "AI-powered CV and resume writing",
            "ATS-optimized templates",
            "Unlimited free PDF and DOCX downloads",
            "Cover letter generator",
            "Keyword optimization",
            "Industry-specific examples",
            "Mobile-friendly editor"
          ],
          "creator": { "@type": "Organization", "name": "JobMeter", "url": "https://jobmeter.com" }
        })}} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "Is this CV maker really free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — unlimited access with no hidden fees, no subscription, and no watermarks. Download your CV or resume as PDF or DOCX instantly." } },
            { "@type": "Question", "name": "Does the CV builder work with ATS systems?", "acceptedAnswer": { "@type": "Answer", "text": "All templates are ATS-compatible — clean single-column layouts, standard headings, and readable fonts that parse correctly on Taleo, Workday, iCIMS, Greenhouse, and all major ATS platforms." } },
            { "@type": "Question", "name": "Can I create a cover letter too?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — our free cover letter maker is fully integrated. Generate a personalized, role-specific cover letter that matches your CV in style and content." } },
            { "@type": "Question", "name": "Does it work for UK, EU, and US formats?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — we support UK/EU CVs, US resumes, academic curriculum vitae, and international formats." } },
            { "@type": "Question", "name": "How is this different from Canva resume templates?", "acceptedAnswer": { "@type": "Answer", "text": "Canva templates frequently fail ATS parsing due to multi-column layouts and image-heavy designs. Our templates are ATS-first — professionally designed and fully machine-readable." } }
          ]
        })}} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Create a Free CV or Resume Online",
          "description": "Build a professional, ATS-optimized CV or resume in minutes using our free AI CV maker.",
          "totalTime": "PT10M",
          "tool": [{ "@type": "HowToTool", "name": "Free AI CV Maker & Resume Builder" }],
          "step": [
            { "@type": "HowToStep", "name": "Choose your document type", "text": "Select CV, resume, or cover letter and pick from 50+ professional ATS-optimized templates." },
            { "@type": "HowToStep", "name": "Enter your details", "text": "Add your work experience, education, skills, and achievements. AI suggests improvements and keywords." },
            { "@type": "HowToStep", "name": "Generate, preview & download", "text": "Preview your completed document, make edits, then export as PDF or DOCX — free, with no watermark." }
          ]
        })}} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://jobmeter.com" },
            { "@type": "ListItem", "position": 2, "name": "CV & Cover Letters", "item": "https://jobmeter.com/cv" }
          ]
        })}} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AI CV Maker & Resume Builder",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web, Mobile",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "2400" }
        })}} />

      </div>
    </div>
  );
}