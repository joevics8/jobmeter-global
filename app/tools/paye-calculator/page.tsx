import Link from 'next/link';
import { ArrowLeft, Calculator, Info, AlertCircle } from 'lucide-react';
import { theme } from '@/lib/theme';
import PAYECalculatorClient from './PAYECalculatorClient';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

export default function PAYECalculatorPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
      {/* Header */}
      <div
        className="pt-12 pb-8 px-6"
        style={{ backgroundColor: theme.colors.primary.DEFAULT }}
      >
        <div className="max-w-4xl mx-auto">
          <Link href="/tools" className="text-sm text-white/80 hover:text-white transition-colors self-start inline-block mb-2">
            ← Back to Tools
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.light }}>
            Nigerian PAYE Calculator
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.colors.text.light }}>
            Calculate your net salary after tax under the Nigeria Tax Act 2025
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">1</div>
              <p className="text-sm text-gray-600">Enter your basic salary and allowances</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">2</div>
              <p className="text-sm text-gray-600">Add any annual rent expenses</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">3</div>
              <p className="text-sm text-gray-600">Choose pension and NHF options</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">4</div>
              <p className="text-sm text-gray-600">View your calculated net salary instantly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ad 1: Display Top - After How It Works */}
      <div className="px-6 py-6 max-w-4xl mx-auto">
        <AdUnit slot="4198231153" format="auto" />
      </div>

      <div className="px-6 py-6 max-w-4xl mx-auto">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">New Tax Rules Effective 2026</p>
            <p className="text-blue-700">
              This calculator uses the Nigeria Tax Act 2025 rates. Income up to ₦800,000 is now tax-exempt.
              Consolidated Relief Allowance (CRA) has been replaced with Rent Relief.
            </p>
          </div>
        </div>

        {/* Client Island - Calculator */}
        <PAYECalculatorClient />

        {/* Compliance Notice */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Employer Remittance Deadline</p>
              <p className="text-yellow-700">
                Employers must remit PAYE by the 10th of the following month. This calculator provides estimates.
                Consult a tax professional or the FIRS for exact calculations.
              </p>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nigerian PAYE Tax Calculator</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Calculate your net salary with the new 2026 Nigeria Tax Act rates. Includes pension, NHF, and rent relief calculations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                <Calculator className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">2026 Tax Rates</h3>
              <p className="text-sm text-gray-700">New progressive tax bands from 0% to 25%.</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3">
                <span className="text-white text-lg font-bold">₦</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Rent Relief</h3>
              <p className="text-sm text-gray-700">New tax relief up to ₦500,000 for renters.</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                <span className="text-white text-lg font-bold">₦</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">₦800k Exemption</h3>
              <p className="text-sm text-gray-700">Income up to ₦800,000 is now tax-free.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">1</span>
                Nigeria's New Tax System (2025 Act)
              </h3>
              <div className="text-gray-700 space-y-3">
                <p>The Nigeria Tax Act 2025, signed in June 2025 and effective from January 2026, introduced significant changes to personal income tax. The new progressive system provides complete tax exemption for low earners.</p>
                <p>Employees earning up to ₦800,000 annually now pay zero tax. This is a major improvement for minimum wage workers in Nigeria.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm">2</span>
                2026 Tax Bands
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Income Bracket</th>
                      <th className="px-3 py-2 text-left">Tax Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['₦0 - ₦800,000', '0%'],
                      ['₦800,001 - ₦3,000,000', '15%'],
                      ['₦3,000,001 - ₦12,000,000', '18%'],
                      ['₦12,000,001 - ₦25,000,000', '21%'],
                      ['₦25,000,001 - ₦50,000,000', '23%'],
                      ['Above ₦50,000,000', '25%'],
                    ].map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{row[0]}</td>
                        <td className="px-3 py-2 font-medium">{row[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm">3</span>
                Rent Relief Explained
              </h3>
              <div className="text-gray-700 space-y-3">
                <p>The old Consolidated Relief Allowance (CRA) has been replaced with Rent Relief. If you pay rent, you can claim:</p>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-purple-800 font-medium">Lesser of ₦500,000 OR 20% of annual rent paid</p>
                </div>
                <p>You will need proof of tenancy agreement or rent receipts to claim this relief.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-sm">4</span>
                Deductions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-900">Pension</h4>
                  <p className="text-sm text-blue-800">8% of qualifying emoluments</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <h4 className="font-semibold text-green-900">NHF (Optional)</h4>
                  <p className="text-sm text-green-800">2.5% of basic salary</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Nigerian PAYE Calculator 2026: Complete Guide</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Everything you need to know about calculating your monthly PAYE tax under the new Nigeria Tax Act 2025 — including LIRS rules, rent relief, deductions, and worked examples.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What is PAYE in Nigeria?</h3>
              <p className="text-gray-700 mb-3">
                PAYE — Pay As You Earn — is the system by which employers deduct personal income tax directly from employees' salaries each month and remit the amounts to state revenue authorities such as the Lagos Internal Revenue Service (LIRS). Updated for 2026 under the <strong>Nigeria Tax Act 2025</strong>, the system now features a ₦800,000 annual tax-free threshold, progressive rates up to 25%, and a new rent relief deduction replacing the old Consolidated Relief Allowance (CRA).
              </p>
              <p className="text-gray-700">
                The new law simplifies tax deductions significantly. Low earners — those with annual income below ₦800,000 after deductions — pay zero PAYE. Employers must remit deducted taxes to the relevant state IRS by the <strong>10th of the following month</strong>.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How Our Nigeria PAYE Calculator Works</h3>
              <p className="text-gray-700 mb-4">
                Our free monthly PAYE tax calculator for Nigeria automates the entire computation process in line with FIRS (now Nigeria Revenue Service) and LIRS guidelines. Enter your salary components and it instantly outputs your PAYE tax, net take-home pay, and a full deduction breakdown.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Gross Income', desc: 'Basic salary + housing + transport + other allowances' },
                  { label: 'Pension Deduction', desc: '8–18% of qualifying emoluments (basic + housing + transport)' },
                  { label: 'NHF (Optional)', desc: '2.5% of basic salary for National Housing Fund contributors' },
                  { label: 'Rent Relief', desc: 'Lesser of ₦500,000 or 20% of annual rent paid' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-gray-700 mt-4 text-sm">
                The tool annualises your income, subtracts the ₦800,000 threshold plus eligible reliefs, applies the progressive tax bands, then divides by 12 to give your monthly PAYE figure.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Step-by-Step PAYE Calculation Nigeria 2026</h3>
              <p className="text-gray-700 mb-4">Here is how to manually calculate your PAYE — exactly what the calculator does under the hood:</p>
              <div className="space-y-3">
                {[
                  { step: 1, color: 'blue', title: 'Calculate Gross Annual Income', desc: 'Add all monthly salary components and multiply by 12. Include any annual bonuses. Example: ₦250,000/month × 12 + ₦500,000 bonus = ₦3,500,000.' },
                  { step: 2, color: 'green', title: 'Subtract Statutory Deductions', desc: 'Deduct pension (8% of qualifying emoluments), NHF if applicable (2.5% of basic), and rent relief (lesser of ₦500,000 or 20% of annual rent).' },
                  { step: 3, color: 'purple', title: 'Subtract the ₦800,000 Threshold', desc: 'The first ₦800,000 of chargeable income is completely tax-free under the new law. If your chargeable income is below this, you pay zero PAYE.' },
                  { step: 4, color: 'orange', title: 'Apply Progressive Tax Bands', desc: 'Tax only the portion of income falling within each band. E.g., ₦2,200,000 at 15% = ₦330,000. Add up tax across all applicable bands.' },
                  { step: 5, color: 'red', title: 'Divide by 12 for Monthly PAYE', desc: 'Annual tax ÷ 12 = monthly PAYE deduction. E.g., ₦376,800 annual tax = ₦31,400/month deducted by your employer.' },
                ].map(({ step, color, title, desc }) => (
                  <div key={step} className="flex gap-4 items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-${color}-500`}>{step}</div>
                    <div>
                      <p className="font-semibold text-gray-800">{title}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Worked Examples: Nigeria PAYE 2026</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Low Income', salary: '₦80,000/month', annual: '₦960,000', chargeable: '₦160,000', monthlyTax: '₦2,000', net: '₦78,000/month', color: 'green' },
                  { label: 'Mid Income', salary: '₦400,000/month', annual: '₦4.8M', chargeable: '₦3,700,000', monthlyTax: '₦50,000', net: '₦350,000/month', color: 'blue' },
                  { label: 'High Income', salary: '₦1.5M/month', annual: '₦18M', chargeable: '₦17,200,000', monthlyTax: '₦258,750', net: '₦1,241,250/month', color: 'purple' },
                ].map(({ label, salary, annual, chargeable, monthlyTax, net, color }) => (
                  <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4`}>
                    <p className={`font-bold text-${color}-800 mb-2`}>{label}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">Gross</span><span className="font-medium">{salary}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Annual</span><span className="font-medium">{annual}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Chargeable</span><span className="font-medium">{chargeable}</span></div>
                      <div className="flex justify-between border-t border-gray-200 pt-1 mt-1"><span className="text-gray-600">Monthly Tax</span><span className={`font-bold text-${color}-700`}>{monthlyTax}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Take Home</span><span className="font-bold text-green-700">{net}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Key Changes: New Tax Law in Nigeria 2026</h3>
              <p className="text-gray-700 mb-4">
                The Nigeria Tax Act 2025, signed mid-2025 and effective from 1 January 2026, is the most significant overhaul of Nigeria's personal income tax system in years. Here is what changed:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: '🎯', title: 'Higher Tax-Free Threshold', desc: '₦800,000 annual exemption, up from ~₦300,000 under the old CRA system.' },
                  { icon: '🏠', title: 'New Rent Relief', desc: 'Claim 20% of annual rent (capped at ₦500,000) — submit Form A to your employer by 31 January.' },
                  { icon: '📉', title: 'CRA Abolished', desc: 'The old Consolidated Relief Allowance is gone. The system is now simpler and fairer for middle earners.' },
                  { icon: '💰', title: 'Progressive Bands Lowered', desc: 'Mid-income earners face reduced marginal rates compared to the previous regime.' },
                  { icon: '📱', title: 'Digitised Filings', desc: 'FIRS/NRS is pushing digital remittance, with penalties for late submission after the 10th of each month.' },
                  { icon: '✅', title: 'Minimum Wage Exempt', desc: 'Workers earning up to ~₦70,000/month are effectively fully exempt under the new threshold.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {[
                  { q: 'What is the PAYE tax rate in Nigeria in 2026?', a: 'Nigeria uses a progressive system: 0% on the first ₦800,000, then 15%, 18%, 21%, 23%, and 25% on higher brackets. Most employees fall in the 0–18% range.' },
                  { q: 'Who pays zero PAYE under the new law?', a: 'Any employee whose annual chargeable income (after pension, NHF, and rent relief deductions) is ₦800,000 or below pays zero PAYE. This covers most minimum wage earners.' },
                  { q: 'What is LIRS and how does it differ from FIRS?', a: 'LIRS (Lagos Internal Revenue Service) handles PAYE remittances for Lagos-based employees. FIRS (now Nigeria Revenue Service) oversees federal taxes. PAYE is a state-level tax, so Lagos employers remit to LIRS.' },
                  { q: 'How do I claim rent relief under the 2026 rules?', a: 'Submit Form A to your employer before 31 January each year with proof of your tenancy agreement or rent receipts. Your employer will then apply the relief in your monthly PAYE calculation.' },
                  { q: 'Is this calculator accurate for LIRS PAYE?', a: 'Yes. Our tool applies the same progressive bands and relief rules used by LIRS and mirrors the FIRS/NRS framework. For complex situations (multiple income streams, foreign income), consult a tax professional.' },
                  { q: 'When must employers remit PAYE?', a: 'Employers must remit deducted PAYE to the relevant state IRS by the 10th of the following month. Late remittance attracts penalties.' },
                ].map(({ q, a }, i) => (
                  <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <p className="font-semibold text-gray-800 mb-1">{q}</p>
                    <p className="text-sm text-gray-600">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-3">
              <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Disclaimer</p>
                <p>This PAYE calculator is for informational purposes only and provides estimates based on publicly available 2026 Nigeria Tax Act rates. It does not constitute tax advice. For exact calculations, consult a qualified tax professional or your state Internal Revenue Service.</p>
              </div>
            </div>
          </div>

          {/* Other Tools Section */}
          <div className="mt-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Other Career Tools</h2>
              <p className="text-gray-600 mt-1">More free tools to help you navigate your career in Nigeria</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'CV Builder', desc: 'Create a professional CV tailored for Nigerian and international employers in minutes.', icon: '📄', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', route: '/cv' },
                { title: 'ATS CV Review', desc: 'Check if your CV will pass Applicant Tracking Systems used by top Nigerian companies.', icon: '✅', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', route: '/tools/ats-review' },
                { title: 'CV Keyword Checker', desc: 'Match your CV keywords against a job description to improve your chances of getting shortlisted.', icon: '🔍', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', route: '/tools/keyword-checker' },
                { title: 'Interview Practice', desc: 'Practice common Nigerian job interview questions with AI-powered feedback.', icon: '🎙️', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', route: '/tools/interview' },
                { title: 'Career Coach', desc: 'Get personalised career guidance, job search strategies, and advice for the Nigerian market.', icon: '🎓', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', route: '/tools/career' },
                { title: 'Job Scam Checker', desc: 'Protect yourself from fraudulent job offers — search and report scam companies and recruiters.', icon: '🛡️', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', route: '/tools/scam-checker' },
              ].map((tool) => (
                <a key={tool.title} href={tool.route} className="group block rounded-xl p-5 border transition-all hover:shadow-md hover:-translate-y-0.5" style={{ backgroundColor: tool.bg, borderColor: tool.border }}>
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{tool.icon}</span>
                    <div>
                      <h3 className="font-bold group-hover:underline" style={{ color: tool.color }}>{tool.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{tool.desc}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Ad 4: Display Bottom */}
          <AdUnit slot="9751041788" format="auto" />

          {/* JSON-LD Schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "Nigerian PAYE Calculator",
                "description": "Free online PAYE tax calculator for Nigeria. Calculate net salary with 2026 tax rates, pension, NHF, and rent relief.",
                "url": "https://jobmeter.com/tools/paye-calculator",
                "applicationCategory": "Finance",
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "NGN" }
              })
            }}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100" style={{ height: '50px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50px', overflow: 'hidden' }}>
          <AdUnit slot="3349195672" format="auto" style={{ display: 'block', width: '100%', height: '50px', maxHeight: '50px', overflow: 'hidden' }} />
        </div>
      </div>
    </div>
  );
}
