import React from 'react';
import { Metadata } from 'next';
import { COMPANIES } from '@/lib/quizCompanies';
import CompanyCard from './CompanyCard';
import { theme } from '@/lib/theme';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

export const metadata: Metadata = {
  title: 'Quiz Platform — Aptitude Test Practice | JobMeter',
  description: 'Practice aptitude tests from top companies worldwide. Timed mock tests for KPMG, Deloitte, PwC, EY, Google, Amazon, Goldman Sachs, and 100+ employers. Free objective MCQ and AI-graded theory essays.',
  keywords: ['aptitude test practice', 'KPMG aptitude test', 'Deloitte recruitment test', 'PwC aptitude test', 'aptitude test Nigeria', 'graduate trainee assessment', 'job aptitude test', 'online aptitude test'],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is an aptitude test for interview?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An aptitude test for interview is a timed, standardized assessment used by employers to measure a candidate's numerical, verbal, logical reasoning, and situational judgment skills. Used by over 90% of top-tier employers including KPMG, Deloitte, PwC, EY, Google, and Amazon during graduate and recruitment screening."
      }
    },
    {
      "@type": "Question",
      "name": "How do I access KPMG aptitude test practice?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Select KPMG from the company list on our Quiz Platform to access 20 multiple-choice questions styled around the KPMG graduate program test, plus 5 AI-graded theory essays. Our KPMG profile covers numerical, verbal, and situational judgment content for global and Nigeria-specific recruitment."
      }
    },
    {
      "@type": "Question",
      "name": "Where can I find Deloitte aptitude test questions and answers PDF?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our platform provides structured Deloitte aptitude test practice equivalent to a Deloitte aptitude test questions and answers PDF, with detailed answer explanations. Premium members can download practice packs for offline use covering all core Deloitte aptitude question types including numerical reasoning, logical puzzles, and data interpretation."
      }
    },
    {
      "@type": "Question",
      "name": "What does PwC aptitude test practice include?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our PwC aptitude test practice includes numerical reasoning, verbal reasoning, and PwC technical assessment essay questions. Answers are AI-graded against clarity, structure, and insight criteria. Practice content mirrors PwC aptitude test questions and answers PDF resources used by candidates globally."
      }
    },
    {
      "@type": "Question",
      "name": "Does the platform cover companies beyond the Big 4?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Beyond KPMG, Deloitte, PwC, and EY, the platform covers 100+ companies including Accenture, Google, Amazon, Goldman Sachs, JP Morgan, Unilever, Nestlé, Siemens, IBM, TCS, Infosys, Shell, and more. Regional coverage includes US federal agencies, UK Civil Service Fast Stream, EPSO for EU institutions, and Nigerian SHL/Dragnet formats."
      }
    },
    {
      "@type": "Question",
      "name": "Why is a password required for theory tests?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The password requirement mirrors the secure, proctored environment of real recruitment theory tests used by firms like Deloitte and PwC. It ensures each theory session is an intentional, focused assessment."
      }
    },
    {
      "@type": "Question",
      "name": "How many questions are in each aptitude test?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Every test on our platform includes 20 objective multiple-choice questions and 5 theory essay questions. Objective tests are timed to match real employer conditions. Essays are AI-graded with immediate, structured feedback."
      }
    },
    {
      "@type": "Question",
      "name": "Is the platform suitable for international candidates?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The platform is built for global use covering candidates in the US, UK, Canada, EU, Nigeria, India, Middle East, and Asia-Pacific. Company-specific content is available for each market including SHL and Dragnet formats for Nigerian recruiters."
      }
    }
  ]
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Quiz Platform — Aptitude Test Practice",
  "description": "Practice aptitude tests from top companies worldwide. Timed mock tests for KPMG, Deloitte, PwC, EY, Google, Amazon, Goldman Sachs, JP Morgan, Accenture, and 100+ other employers. Objective multiple-choice and AI-graded theory essay modes.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free starter access. Premium upgrade available for unlimited tests and downloads."
  },
  "featureList": [
    "20 multiple-choice aptitude questions per test",
    "5 AI-graded essay questions per test",
    "100+ company-specific question banks",
    "Timed mock tests matching real recruitment conditions",
    "Progress tracking and percentile scoring",
    "Global coverage: US, UK, Canada, EU, Nigeria, India"
  ],
  "audience": {
    "@type": "Audience",
    "audienceType": "Graduate trainees, job seekers, recruitment candidates"
  }
};

export default function QuizPage() {
  const companyNodes = COMPANIES.map((company) => (
    <CompanyCard key={company} company={company} />
  ));

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div
          className="pt-12 pb-10 px-6"
          style={{ backgroundColor: theme.colors.primary.DEFAULT }}
        >
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: theme.colors.text.light }}>
              Quiz Platform
            </h1>
            <p className="text-lg" style={{ color: theme.colors.text.light }}>
              Practice aptitude tests from top companies
            </p>
          </div>
        </div>

        {/* ── Main content + Desktop sidebar ───────────────────────────── */}
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6 flex gap-6 items-start">

          {/* ── Left: main content ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0 max-w-4xl">

            {/* How it works */}
            <div className="bg-white rounded-xl p-4 mb-6" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
              <h3 className="font-semibold text-gray-900 mb-3">How it works</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                <div><strong>Objective:</strong> 20 multiple choice</div>
                <div><strong>Theory:</strong> 5 essay, AI graded</div>
                <div><strong>Password:</strong> Required for theory</div>
              </div>
            </div>

            {/* ── Ad 1: After How It Works ── */}
            <div className="mb-6">
              <AdUnit slot="4198231153" format="auto" />
            </div>

            {/* Select Company heading */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Select a Company</h2>
            </div>

            {/* Company Cards Grid — NO ADS IN BETWEEN */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {companyNodes}
            </div>

            {/* ── Ad 2: After Company Cards ── */}
            <div className="mt-8 mb-6">
              <AdUnit slot="9751041788" format="auto" />
            </div>

            <p className="text-xs text-gray-500 text-center mt-2 mb-6">
              <b>Disclaimer:</b> This quiz is for educational purposes only. JobMeter has no affiliation to any company.
            </p>

            {/* Related Tools */}
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

          {/* ── Right: Desktop sidebar ads ──────────────────────────────── */}
          <aside className="hidden lg:flex flex-col gap-6 w-[300px] shrink-0 sticky top-20">
            <AdUnit slot="9751041788" format="auto" style={{ display: 'block', width: '300px', minHeight: '250px' }} />
            <AdUnit slot="4198231153" format="auto" style={{ display: 'block', width: '300px', minHeight: '250px' }} />
          </aside>
        </div>

        {/* ── SEO Content ──────────────────────────────────────────────── */}
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
            <div className="prose prose-sm max-w-none text-gray-600">

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Recruitment Assessment Practice Tests: Ace Aptitude Tests from Top Companies Worldwide
              </h2>
              <p className="mb-6">
                Practice <strong>aptitude tests from top companies</strong> on our Quiz Platform — the global resource for graduate trainees and job seekers preparing for recruitment assessments at the Big 4, Fortune 500s, multinationals, and public agencies across the US, UK, Canada, EU, and beyond. Whether you're sitting a <strong>KPMG graduate trainee aptitude test</strong>, a <strong>Deloitte recruitment test</strong>, or a <strong>PwC technical assessment</strong>, our platform gives you real-exam-style practice that builds speed, accuracy, and confidence.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Why Aptitude Test Practice Matters</h3>
              <p className="mb-4">
                Aptitude tests are now standard in graduate recruitment across virtually every major industry. Leading firms use them to screen thousands of applications quickly, measuring candidates on numerical reasoning, verbal reasoning, logical and inductive reasoning, situational judgment (SJTs), and diagrammatic reasoning.
              </p>
              <p className="mb-6">
                At firms like KPMG, the numerical and verbal sections each contain 24 questions in 20 minutes. At EY, the One Assessment delivers roughly 8 questions in 6 minutes per sub-section. Rejection rates at top firms can reach 50–80% at the screening stage — consistent, targeted <strong>aptitude test practice</strong> is the single most effective way to improve your odds. Users on our platform report doubling their interview invite rate after completing just 10 full mock tests.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">KPMG Aptitude Test Practice</h3>
              <p className="mb-4">
                Prepare for the <strong>KPMG graduate trainee aptitude test past questions</strong> style with our KPMG profile. Tests cover numerical reasoning (graphs, percentages, ratios), verbal reasoning, and situational judgment, formatted to mirror the <strong>KPMG graduate program test</strong> with 24 questions per 20-minute section. Practice <strong>KPMG aptitude test</strong> questions drawn from past-paper style content used in Nigeria, the UK, and globally.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Deloitte Aptitude Test Practice</h3>
              <p className="mb-4">
                Our Deloitte profile covers the full range of <strong>Deloitte aptitude test questions</strong>: numerical reasoning, logical puzzles, data interpretation, and abstract series. Practice mirrors the <strong>Deloitte graduate recruitment test</strong> format used across the US, UK, and EU. Download-ready study content serves as a functional equivalent to sought-after <strong>Deloitte aptitude test questions and answers PDF</strong> packs. Keywords covered: <em>deloitte aptitude questions · deloitte aptitude test questions · deloitte recruitment test · deloitte graduate recruitment test</em>.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">PwC Aptitude Test Practice</h3>
              <p className="mb-4">
                Prepare for the <strong>PwC aptitude test</strong> with numerical reasoning, verbal reasoning, and the firm's distinctive <strong>PwC technical assessment</strong> component. Our platform provides <strong>PwC aptitude test questions and answers</strong> in both timed multiple-choice and AI-graded essay formats. Practice packs mirror the content structure of popular <strong>PwC aptitude test questions and answers PDF</strong> resources. Keywords covered: <em>pwc aptitude test practice · pwc aptitude test questions and answers · pwc aptitude test questions and answers pdf · pwc technical assessment</em>.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">EY, Accenture & Other Top Employers</h3>
              <p className="mb-6">
                Beyond the Big 4, our platform covers 100+ companies including Accenture, Google, Amazon, Goldman Sachs, JP Morgan, Unilever, Nestlé, Siemens, IBM, TCS, Infosys, Wipro, Capgemini, McKinsey, BCG, Bain, Shell, ExxonMobil, HSBC, Barclays, Citibank, Standard Chartered, Lloyds, Nokia, HP, Maersk, and many more. Regional coverage includes US federal agencies, the UK Civil Service Fast Stream, EPSO for EU institutions, Nigerian SHL/Dragnet formats for NNPC and oil &amp; gas firms, and public sector agencies globally.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Global Coverage</h3>
              <p className="mb-6">
                Our platform serves candidates worldwide: the <strong>United States</strong> (Google, Amazon, Goldman Sachs, JP Morgan, US federal agencies), the <strong>United Kingdom</strong> (Big 4, Unilever, Lloyds, UK Civil Service Fast Stream), <strong>Canada</strong> (RBC, TD Bank, Canadian Public Service), the <strong>European Union</strong> (Siemens, Nestlé, EPSO competitions), <strong>Nigeria &amp; West Africa</strong> (KPMG Nigeria, Dangote, NNPC, SHL/Dragnet formats), <strong>India</strong> (TCS, Infosys, campus placement formats), and the <strong>Middle East &amp; Asia-Pacific</strong>.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Preparation Tips for Aptitude Tests</h3>
              <p className="mb-2"><strong>Practice daily.</strong> Dedicate 1–2 hours per day in the two to three weeks before your test.</p>
              <p className="mb-2"><strong>Time yourself from day one.</strong> Working slowly on untimed practice builds false confidence. Practice under real exam pressure from your first session.</p>
              <p className="mb-2"><strong>Review every error.</strong> Use our AI feedback to understand not just the correct answer, but why alternative options are wrong.</p>
              <p className="mb-6"><strong>Simulate full assessments.</strong> Complete both objective and theory sections together to build the stamina needed for a real recruitment day.</p>

            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Anchor Ad (50px) ─────────── */}
      <div className="h-14 lg:hidden"></div>   {/* spacer to prevent content overlap */}

      <div
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100"
        style={{ height: '50px', overflow: 'hidden' }}
      >
        <AdUnit
          slot="3349195672"
          format="auto"
          style={{ 
            display: 'block', 
            width: '100%', 
            height: '50px', 
            maxHeight: '50px' 
          }}
        />
      </div>
    </>
  );
}