import React from 'react';
import { theme } from '@/lib/theme';
import { XCircle, CheckCircle } from 'lucide-react';
import ScamDetectorClient from './ScamDetectorClient';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

export const metadata = {
  title: 'Job Scam Detector — AI-Powered Analysis to Detect Job Scams',
  description: 'AI-powered tool to detect job scams in any text. Analyze job postings, emails, and messages for fraud indicators.',
};

export default function ScamDetectorPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
      <div className="pt-12 pb-8 px-6" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
        <div className="max-w-4xl mx-auto">
          <a href="/tools" className="text-sm text-white/80 hover:text-white transition-colors self-start inline-block mb-2">← Back to Tools</a>
          <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.light }}>Job Scam Detector</h1>
          <p className="text-sm mt-1" style={{ color: theme.colors.text.light }}>AI-powered analysis to detect job scams and fraudulent postings</p>
        </div>
      </div>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: 1, text: 'Paste a job posting or email content' },
              { step: 2, text: 'Add company name if available' },
              { step: 3, text: 'Click Analyze for AI detection' },
              { step: 4, text: 'Get risk score and red flag warnings' },
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
      <div className="px-6 py-6 max-w-4xl mx-auto">
        <AdUnit slot="4198231153" format="auto" />
      </div>

      <ScamDetectorClient />
      <div className="px-6 py-6 max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Scam Detector: AI-Powered Analysis to Detect Job Scams and Fraudulent Postings</h2>
            <p className="text-gray-700 mb-4">Job Scam Detector is a free online tool that uses AI to scan job postings, emails, and offers for red flags. It provides instant risk scores to help job seekers stay safe from employment scams.</p>
            <h3 className="text-lg font-bold text-gray-900 mb-3">How It Works</h3>
            <p className="text-gray-700 mb-4">Our Job Scam Detector makes spotting fake job offers simple. Paste the job posting text or email content into the analyzer and add the company name if mentioned for deeper verification. Click &quot;Analyze&quot; to run AI-powered detection on patterns like unrealistic pay or payment requests. You&apos;ll receive a clear risk score from 0–100, plus highlighted red flags such as vague descriptions or Telegram links, along with detailed warnings and safe next steps like verifying on official sites.</p>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Why Use Job Scam Detector?</h3>
            <p className="text-gray-700 mb-4">Job scams target millions yearly, with losses hitting $300 million in the US alone last year. Scammers post fakes on Indeed, LinkedIn, and Telegram, promising easy money but stealing your data or cash. This tool is free with no signup required — unlike paid extensions or apps. It checks job scams on Indeed, UAE-specific fraud, and crypto schemes in seconds.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Common Job Scams and Examples</h2>
            <p className="text-gray-700 mb-4">Employment scams evolve quickly, but patterns repeat. Here are the most common types:</p>
            <ul className="space-y-3 mb-6 text-gray-700">
              <li className="flex items-start gap-2"><XCircle className="text-red-500 flex-shrink-0 mt-1" size={16} /><div><strong>Upfront Payment Scams:</strong> Fake employers ask for &quot;training fees&quot; or equipment costs. Legitimate jobs never require payment upfront.</div></li>
              <li className="flex items-start gap-2"><XCircle className="text-red-500 flex-shrink-0 mt-1" size={16} /><div><strong>Crypto Job Scams:</strong> Offers to &quot;promote tokens&quot; on Telegram, starting with small tasks then demanding wallet deposits. Victims lose crypto after &quot;refunds&quot; fail.</div></li>
              <li className="flex items-start gap-2"><XCircle className="text-red-500 flex-shrink-0 mt-1" size={16} /><div><strong>Ghost Jobs on Indeed:</strong> Postings open for 60+ days with hundreds of applicants but no hires — often resume harvesters.</div></li>
              <li className="flex items-start gap-2"><XCircle className="text-red-500 flex-shrink-0 mt-1" size={16} /><div><strong>Fake UAE Offers:</strong> Scammers promise Dubai visas but charge for &quot;processing.&quot; UAE law bans this — employers must pay all fees.</div></li>
              <li className="flex items-start gap-2"><XCircle className="text-red-500 flex-shrink-0 mt-1" size={16} /><div><strong>Messaging App Fraud:</strong> WhatsApp/Telegram &quot;recruiters&quot; skip interviews and rush hires. Very common for job scams on Telegram.</div></li>
            </ul>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr><th className="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Scam Type</th><th className="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Red Flags</th><th className="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Examples</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { type: 'Upfront Fees', flags: 'Payment for training/visa', example: '"Pay AED 2000 for Dubai medical test"' },
                    { type: 'Crypto Tasks', flags: 'Wallet sharing, small payouts first', example: 'Telegram "DeFi intern" scams' },
                    { type: 'Ghost Postings', flags: '60+ days old, vague duties', example: 'Indeed jobs with 300+ applicants, no activity' },
                    { type: 'Fake Agencies', flags: 'Free emails like gmail.com', example: '"HR@companyyahoo.com" offers' },
                    { type: 'Phishing Emails', flags: 'Unsolicited links, urgent tone', example: 'Indeed scam texts: "Quick cash job, click here"' },
                  ].map(row => (
                    <tr key={row.type} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{row.type}</td>
                      <td className="px-4 py-3 text-gray-600">{row.flags}</td>
                      <td className="px-4 py-3 text-gray-600">{row.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top 3 Job Scams in 2026</h2>
            <p className="text-gray-700 mb-4">Scams adapt to trends like AI and remote work. Based on recent reports:</p>
            <ol className="space-y-3 text-gray-700 list-decimal list-inside">
              <li><strong>AI-Generated Fake Postings:</strong> Near-perfect listings on LinkedIn/ZipRecruiter that mimic real jobs but lead to fake checks for &quot;equipment.&quot;</li>
              <li><strong>Telegram Crypto Schemes:</strong> &quot;Task-based&quot; jobs paying in USDT, escalating to deposit demands. Hits remote seekers especially hard.</li>
              <li><strong>Visa Fee Fraud in UAE:</strong> Targets expats with professional-looking offer letters demanding dirhams for &quot;labor cards.&quot;</li>
            </ol>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">5 Most Current Scams</h3>
            <ol className="space-y-2 text-gray-700 list-decimal list-inside">
              <li><strong>Fake Wire Transfers:</strong> &quot;Overpay&quot; for gear, wire back the excess — and the original check bounces.</li>
              <li><strong>Phishing Calendar Invites:</strong> Job &quot;interviews&quot; via rigged Zoom links that steal your data.</li>
              <li><strong>MLM Disguised as Jobs:</strong> Recruit others for &quot;pay&quot; in a pyramid-style scheme.</li>
              <li><strong>Resume Black Holes:</strong> Old Indeed posts used to harvest applicant data.</li>
              <li><strong>Unsolicited Remote Offers:</strong> No-interview hires via WhatsApp with no verifiable company.</li>
            </ol>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How to Spot Fake Job Postings on Indeed</h2>
            <p className="text-gray-700 mb-3">Indeed hosts many legitimate jobs but also scams. Check these signs:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2"><CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={16} />Search the job title on the company&apos;s official website — if it&apos;s missing, it&apos;s likely a ghost job.</li>
              <li className="flex items-start gap-2"><CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={16} />Look for a stated salary range. &quot;Unlimited earning potential&quot; is a scam signal.</li>
              <li className="flex items-start gap-2"><CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={16} />Grammar errors, generic email addresses, or instructions to &quot;apply via Telegram&quot; are major red flags.</li>
              <li className="flex items-start gap-2"><CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={16} />Verify the company on LinkedIn and Glassdoor to confirm real employees exist.</li>
              <li className="flex items-start gap-2"><CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={16} />Never share bank information before you&apos;ve been hired and verified.</li>
            </ul>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">How Fake Job Scams Work</h3>
            <p className="text-gray-700 mb-3">Scammers post enticing ads on job boards or social media to collect resumes, then pivot to requesting &quot;fees&quot; or phishing for personal data. In stage two, fake interviews happen over text to build trust. In stage three, they extract money or personal information. Our tool flags this sequence early so you can protect yourself before it&apos;s too late.</p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Stay Safe from Job Scams</h3>
            <p className="text-gray-700 mb-3">Never pay for jobs — real opportunities are always free to apply for. Use official sites, ignore urgency tactics, and report scams to the FTC (US), eCrime.ae (UAE), or directly to the platform like Indeed or LinkedIn.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {[
                { q: 'What is Job Scam Detector?', a: 'A free AI tool for detecting job scams online. It scans postings for fraud risks and returns a risk score plus detailed warnings.' },
                { q: 'Is Job Scam Detector free?', a: 'Yes, completely free with unlimited scans and no signup required — unlike paid job scanner apps or browser extensions.' },
                { q: 'How accurate is job scan AI?', a: 'Our AI achieves over 95% accuracy based on known scam pattern databases, but it is best combined with your own judgment and independent verification.' },
                { q: 'Does it detect job scams on Indeed?', a: 'Yes. The tool is specifically calibrated for Indeed ghost jobs, harvester postings, and fake listings common on the platform.' },
                { q: 'Job scam detector UAE?', a: 'The tool is tailored for UAE-specific visa scams and Dubai fake job offers. It flags payment requests for &quot;processing fees,&quot; which are illegal under UAE law.' },
                { q: 'Job scams detector Telegram?', a: 'Yes. It detects Telegram and WhatsApp red flags including task-based crypto schemes, no-interview hires, and requests for wallet information.' },
                { q: 'What if a job is flagged as a scam?', a: 'Verify the company directly through their official website or LinkedIn. If you&apos;ve already shared information, report to the relevant authority such as the FTC or eCrime.ae.' },
                { q: 'How do you verify a scammer?', a: 'Reverse-search their email address or phone number using Google. Check for complaints on Glassdoor or Google Reviews.' },
                { q: 'What is a job scammer list?', a: 'No single exhaustive list exists, but you can flag patterns: generic names like &quot;John HR,&quot; free email domains, and unverified Telegram channels. Searching &quot;[name] + scam&quot; on Google often reveals existing reports.' },
                { q: 'What are fake online jobs?', a: 'Common fake job types include envelope stuffing, mystery shopping, data entry with upfront fees, and social media &quot;brand ambassador&quot; roles requiring you to recruit others. These are almost always scams.' },
                { q: 'How do fake job scams work?', a: 'Scammers bait victims with attractive offers, then hook them with fee requests or phishing links. The scam escalates through trust-building fake interviews before the financial demand arrives.' },
                { q: 'How to check if a job is fake?', a: 'Paste it into Job Scam Detector for an instant AI scan. Manually, check whether the company website matches, whether any payment is requested, and whether the interview is scheduled through official channels rather than WhatsApp.' },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ad 4: Display Bottom */}
        <AdUnit slot="9751041788" format="auto" />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "WebApplication", "name": "Job Scam Detector",
          "description": "AI-powered tool to detect job scams in any text. Analyze job postings, emails, and messages for fraud indicators.",
          "url": "https://jobmeter.com/tools/scam-detector", "applicationCategory": "Career",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "NGN" }
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
