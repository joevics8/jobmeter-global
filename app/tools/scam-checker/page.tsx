import React from 'react';
import { theme } from '@/lib/theme';
import ScamCheckerClient from './ScamCheckerClient';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

export const metadata = {
  title: 'Job Scammer Checker — Free Scam Jobs Check Tool',
  description: 'Free scam jobs check tool. Search and report fraudulent companies, recruiters and job postings. Covers Nigeria, Canada, Australia, Dubai, Malaysia and remote jobs.',
};

export default function ScamCheckerPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
      <div className="pt-12 pb-8 px-6" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
        <div className="max-w-4xl mx-auto">
          <a href="/tools" className="text-sm text-white/80 hover:text-white transition-colors self-start inline-block mb-2">← Back to Tools</a>
          <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.light }}>Job Scammer Checker</h1>
          <p className="text-sm mt-1" style={{ color: theme.colors.text.light }}>Free scam jobs check tool — search reported scams or report a suspicious job posting</p>
        </div>
      </div>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: 1, text: 'Search for a company or recruiter name' },
              { step: 2, text: 'View reported scams and warnings' },
              { step: 3, text: 'Check verification status' },
              { step: 4, text: 'Report suspicious companies to warn others' }
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm flex-shrink-0">{step}</div>
                <p className="text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ad 1: Display Top - After How It Works */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <AdUnit slot="4198231153" format="auto" />
      </div>

      <ScamCheckerClient />
      <div className="px-6 py-6 max-w-4xl mx-auto mt-4">
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3">What is a Job Scammer Checker?</h2>
            <p className="text-gray-700 leading-relaxed mb-3">A <strong>job scammer checker</strong> is a free online tool that helps you quickly determine whether a job, recruiter, or WhatsApp offer is a scam — before you share personal data, pay any money, or waste time on fake interviews. Our <strong>scam jobs check</strong> tool scans job texts, emails, WhatsApp messages, and links against known red flags, scammer patterns, and public scam reports so you can decide confidently whether a job is legit.</p>
            <p className="text-gray-700 leading-relaxed">Job scams are rising globally. Scammers increasingly use AI, social media, and messaging apps to target job seekers in Nigeria, Canada, Australia, UAE (Dubai), and Malaysia. Fake jobs can cost you money, personal data, and even expose you to identity theft or criminal activity.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How to Identify Fake Job Offers</h2>
            <p className="text-gray-700 mb-4">Our tool uses a combination of AI pattern recognition, rule-based checks, and public records to analyze job-related content. Here is what a <strong>scam jobs check online</strong> looks for:</p>
            <div className="space-y-4">
              <div className="border-l-4 border-red-400 pl-4"><h3 className="font-semibold text-gray-900 mb-1">Language Red Flags</h3><p className="text-sm text-gray-700">Too-good-to-be-true promises, guaranteed jobs, unrealistic salaries, vague job descriptions full of buzzwords, and poor grammar or spelling errors are all common in scam postings.</p></div>
              <div className="border-l-4 border-orange-400 pl-4"><h3 className="font-semibold text-gray-900 mb-1">Money and Payment Requests</h3><p className="text-sm text-gray-700">Any demand for fees — registration, processing, training, visa, or equipment payments — is a major red flag. Requests to use crypto, gift cards, or payment apps as a condition of hiring are classic signs of a scam.</p></div>
              <div className="border-l-4 border-yellow-400 pl-4"><h3 className="font-semibold text-gray-900 mb-1">Company Legitimacy Checks</h3><p className="text-sm text-gray-700">Does the company have an official website? Does the job appear on a trusted site like LinkedIn or Glassdoor? Is the domain very new or suspiciously similar to a real brand?</p></div>
              <div className="border-l-4 border-blue-400 pl-4"><h3 className="font-semibold text-gray-900 mb-1">Contact and Identity Verification</h3><p className="text-sm text-gray-700">We check whether the recruiter email, phone, or WhatsApp number appears in public scam complaints. Communication restricted entirely to WhatsApp or Telegram with no professional channels is a significant warning sign.</p></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Types of Job Scams We Help Detect</h2>
            <div className="space-y-5">
              <div><h3 className="font-semibold text-gray-900 mb-1">1. Fake Online Jobs List Scams</h3><p className="text-sm text-gray-700">These scams offer remote data entry, typing jobs, survey work, or &quot;secret shopper&quot; roles that either never pay or charge upfront fees.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">2. WhatsApp and SMS Job Scams</h3><p className="text-sm text-gray-700">Scammers send unsolicited <strong>WhatsApp job offers</strong> claiming they found your contact from LinkedIn or job boards. They ask you to join a group where &quot;admins&quot; guide you into tasks involving money transfers.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">3. Impersonation of Real Companies</h3><p className="text-sm text-gray-700">Some fake offers copy the name and logo of real companies but use lookalike domains or free email addresses, setting up <strong>fake job websites</strong> that mimic legitimate career pages.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">4. Check Scams and Overpayment Schemes</h3><p className="text-sm text-gray-700">Scammers send a fake check, ask you to buy equipment, then ask you to send back part of the money. When the check bounces, your own money is gone.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">5. Visa and Relocation Scams</h3><p className="text-sm text-gray-700">International job offers requiring upfront visa, processing, or travel payments are a major red flag. This is especially prevalent in searches for a <strong>job scammer list Dubai</strong> and <strong>job scammer list Malaysia</strong>.</p></div>
            </div>
          </div>

          {/* Ad 2: In-article fluid - After Types of Job Scams */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Country &amp; Region–Specific Job Scammer Lists</h2>
            <p className="text-gray-700 mb-4">Our tool can be combined with local <strong>job scammer list</strong> resources for stronger protection:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { flag: '🇳🇬', title: 'Scam Jobs Check in Nigeria', desc: 'Fake jobs in Nigeria are often sent via SMS and WhatsApp, asking applicants to pay registration fees or attend briefings at suspicious locations.' },
                { flag: '🇨🇦', title: 'Job Scammer List Canada', desc: 'Canadian job seekers can cross-check offers against federal agency guidance. Authorities publish alerts on work-from-home scams and CRA impersonation schemes.' },
                { flag: '🇦🇺', title: 'Job Scammer List Australia', desc: 'Australian regulators warn about employment scams involving visa sponsorship, migration agents, and fake recruitment agencies. Use ACCC Scamwatch alerts.' },
                { flag: '🇲🇾', title: 'Job Scammer List Malaysia (WhatsApp)', desc: 'In Malaysia, scammers coordinate through WhatsApp and Telegram. Scams focus on overseas work, fee-based placement, and visa processing fraud.' },
                { flag: '🇦🇪', title: 'Job Scammer List Dubai', desc: 'Dubai scams often target domestic staff and overseas workers with upfront visa and processing fees. Verify any recruiter against official UAE labour ministry records.' },
                { flag: '🌐', title: 'Job Scammer List Remote', desc: 'Remote scams show unclear company details, fully anonymous employers, communication only through messaging apps, and unrealistic pay for basic tasks.' },
              ].map(item => (
                <div key={item.title} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">{item.flag} {item.title}</h3>
                  <p className="text-sm text-gray-700">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How to Check if a Job is Legit (Step-by-Step)</h2>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Run a scam jobs check online', desc: 'Paste the full job text, email, or WhatsApp message into our checker and review the risk score and red flags.' },
                { step: 2, title: 'Research the company independently', desc: 'Search the company name with &quot;scam&quot; or &quot;fraud&quot;. Verify the job is listed on their official website, LinkedIn, or Glassdoor.' },
                { step: 3, title: 'Verify contact details', desc: 'Compare email domains and phone numbers against those on the official company site. Be suspicious if the recruiter insists on WhatsApp or personal email only.' },
                { step: 4, title: 'Look for common scam signs', desc: 'Watch for requests for upfront payment or sharing ID/bank details early, immediate job offers without formal interviews, vague roles, and pressure to act quickly.' },
                { step: 5, title: 'How to spot fake job postings on Indeed', desc: 'Fake postings on large platforms use very short descriptions, unusually high salaries, and try to move you off-platform to WhatsApp or Telegram quickly.' },
                { step: 6, title: 'When in doubt, walk away', desc: 'Real employers will never punish you for wanting to verify an offer. If multiple red flags appear, do not continue — and report it to protect others.' }
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm flex-shrink-0 mt-0.5">{step}</div>
                  <div><p className="font-semibold text-gray-900">{title}</p><p className="text-sm text-gray-700 mt-0.5">{desc}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Frequently Asked Questions</h2>
            <div className="space-y-5 divide-y divide-gray-100">
              {[
                { q: 'How can I check if a job is legit?', a: 'Search the company name in our database, then research on their official website and LinkedIn to ensure the job is listed there and contact details match. Run a scam jobs check online to flag any patterns.' },
                { q: 'How to check fake jobs?', a: 'Look for requests for money, vague roles, no online presence, or pressure to respond quickly. Run a free scam jobs check here before you reply or send any documents.' },
                { q: 'How do I verify a scammer?', a: 'Search their email, phone, or WhatsApp number along with words like &quot;scam&quot;, &quot;fraud&quot;, or &quot;complaint&quot;. Paste their messages into our job scammer checker to see if the patterns match known scams.' },
                { q: 'Is a WhatsApp job offer a scam?', a: 'Not every WhatsApp job offer is fake, but unsolicited offers, group &quot;tasks&quot; that involve payments, and requests for fees or banking details are major red flags that should be checked immediately.' },
                { q: 'How do you verify if a job offer is real?', a: 'Confirm that the offer comes from an official company domain, that the role exists on the company&apos;s career page, and that the interview process matches the company&apos;s standard procedure.' },
                { q: 'How do you know if a job is scamming you?', a: 'If the job suddenly introduces payment requests, asks you to handle money or crypto for others, or keeps changing conditions after you &quot;accept&quot; the role, it is very likely a scam. Stop and report it.' },
                { q: 'How to catch a job scammer?', a: 'Save all messages, take screenshots of key requests (especially for money or sensitive data), and submit them to our database and to your national cybercrime unit.' },
                { q: 'How to report a job scammer?', a: 'Report the posting on the job platform (Indeed, LinkedIn, local job board), report to your national consumer protection or fraud agency, and submit the details using the form above so other job seekers are warned.' },
              ].map(({ q, a }) => (
                <div key={q} className="pt-4 first:pt-0">
                  <p className="font-semibold text-gray-900 mb-1">{q}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ad 4: Display Bottom - Before JSON-LD */}
        <div className="mt-6">
          <AdUnit slot="9751041788" format="auto" />
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "WebApplication", "name": "Job Scammer Checker",
          "description": "Free scam jobs check tool. Search and report fraudulent companies, recruiters and job postings. Covers Nigeria, Canada, Australia, Dubai, Malaysia and remote jobs.",
          "url": "https://jobmeter.com/tools/scam-checker", "applicationCategory": "Career",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "NGN" },
          "mainEntity": { "@type": "FAQPage", "mainEntity": [
            { "@type": "Question", "name": "How can I check if a job is legit?", "acceptedAnswer": { "@type": "Answer", "text": "Search the company in our database, verify on their official website and LinkedIn, then run a scam jobs check online to flag red flag patterns." } },
            { "@type": "Question", "name": "Is a WhatsApp job offer a scam?", "acceptedAnswer": { "@type": "Answer", "text": "Unsolicited offers, group tasks involving payments, and requests for fees or banking details are major red flags. Always check before responding." } },
            { "@type": "Question", "name": "How to report a job scammer?", "acceptedAnswer": { "@type": "Answer", "text": "Report on the job platform, to your national fraud agency, and submit details using the form on this page to warn other job seekers." } }
          ] }
        }) }} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100" style={{ height: '50px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50px', overflow: 'hidden' }}>
          <AdUnit slot="3349195672" format="auto" style={{ display: 'block', width: '100%', height: '50px', maxHeight: '50px', overflow: 'hidden' }} />
        </div>
      </div>
    </div>
  );
}
