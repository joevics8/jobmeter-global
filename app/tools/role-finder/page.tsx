import React from 'react';
import { theme } from '@/lib/theme';
import RoleFinderClient from './RoleFinderClient';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

export const metadata = {
  title: 'Alternative Role Finder — Discover Jobs Based on Your Skills',
  description: 'Free AI-powered career path finder. Discover jobs based on your skills, explore alternative career paths, get skill gap analysis and certification tips.',
};

export default function RoleFinderPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
      <div className="pt-12 pb-8 px-6" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
        <div className="flex flex-col gap-2 max-w-4xl mx-auto">
          <a href="/tools" className="text-sm text-white/80 hover:text-white transition-colors self-start">← Back to Tools</a>
          <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.light }}>Alternative Role Finder</h1>
          <p className="text-sm" style={{ color: theme.colors.text.light }}>Discover jobs based on your skills — find alternative career paths and what career suits you</p>
        </div>
      </div>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: '1', p: 'Select your skills and tools' },
              { n: '2', p: 'Add your years of experience' },
              { n: '3', p: 'Click Find Roles to get recommendations' },
              { n: '4', p: 'Explore matching roles and skill gaps' },
            ].map(({ n, p }) => (
              <div key={n} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">{n}</div>
                <p className="text-sm text-gray-600">{p}</p>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* Ad 1: Display Top - After How It Works */}
        <div className="px-6 py-6 max-w-4xl mx-auto">
          <AdUnit slot="4198231153" format="auto" />
        </div>

        <RoleFinderClient />

      <div className="px-6 py-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Alternative Role Finder: Discover Jobs Based on Your Skills</h2>
            <div className="text-gray-700 space-y-3 text-sm leading-relaxed">
              <p>The <strong>Alternative Role Finder</strong> is a free AI career finder that matches your skills, tools, and experience to new career paths worldwide. Whether you&apos;re asking <em>&quot;what jobs match my skills,&quot;</em> exploring <em>career change ideas</em>, or trying to figure out <em>what career suits me</em> — this tool gives you personalized, data-driven answers in under five minutes.</p>
              <p>Unlike a basic career aptitude test or career path quiz, our AI cross-references your input against real hiring trends across tech, finance, marketing, engineering, healthcare, and more. It then delivers 8–12 role recommendations complete with match scores, skill gap analysis, and certification tips — helping you find the right career faster than any manual search.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How to Find Jobs Related to Your Skills (Step-by-Step)</h2>
            <div className="text-gray-700 space-y-4 text-sm leading-relaxed">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <div><strong>Select your skills</strong> — choose from categories like Technical, Digital, Data, or Soft Skills. You can also type custom skills (e.g., &quot;Figma design,&quot; &quot;cold calling,&quot; &quot;Agile delivery&quot;).</div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <div><strong>Add tools and software</strong> — optional, but adding tools like Excel, Node.js, HubSpot, or Salesforce refines your matches significantly.</div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <div><strong>Set years of experience</strong> — from entry level to 10+ years. This calibrates whether results skew junior, mid, or senior.</div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                <div><strong>Click &quot;Find Alternative Roles&quot;</strong> — the AI returns your matched roles with percentage fit, skills to develop, and recommended certifications from platforms like Coursera, Google, and Cisco.</div>
              </div>
              <p className="text-gray-500 italic">This process outperforms tools like CareerOneStop Skills Matcher by adding skill gap detail and certification guidance alongside the role list.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Alternative Career Paths for Popular Professions</h2>
            <div className="text-gray-700 space-y-3 text-sm leading-relaxed">
              <p>One of the most common questions job seekers ask is: <em>&quot;What career fits my skills if I want to change direction?&quot;</em> Our career recommendation tool surfaces surprising — and highly relevant — pivots across professions:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {[
                  { from: 'Engineers', to: 'Remote Software Developer, Cybersecurity Analyst, Renewable Energy Tech, Technical Project Manager' },
                  { from: 'Marketers', to: 'Digital Strategist, Content Director, CRM Manager, B2B Sales Lead, Brand Consultant' },
                  { from: 'Teachers', to: 'Instructional Designer, EdTech Specialist, Corporate Trainer, Curriculum Developer' },
                  { from: 'Accountants', to: 'Financial Data Analyst, Fintech Auditor, Business Intelligence Analyst, Tax Consultant' },
                  { from: 'Customer Service', to: 'UX Researcher, Account Manager, Community Manager, Success Operations Lead' },
                  { from: 'Admins', to: 'Operations Coordinator, Executive Assistant, Project Coordinator, Workflow Automation Specialist' },
                ].map(item => (
                  <div key={item.from} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="font-semibold text-gray-800 text-xs mb-1">{item.from} →</p>
                    <p className="text-gray-600 text-xs">{item.to}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2">These <strong>best careers to switch to</strong> are based on transferable skill overlap — the same analytical reasoning an engineer uses maps directly onto data science; the persuasion skills a marketer builds translate cleanly into relationship management or sales.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Jobs Based on Your Skills: Real Examples</h2>
            <div className="text-gray-700 space-y-3 text-sm leading-relaxed">
              <p>Still wondering <em>&quot;what jobs am I qualified for based on my resume?&quot;</em> Here&apos;s how real skill combinations map to concrete roles:</p>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-xs border-collapse">
                  <thead><tr className="bg-gray-100"><th className="text-left p-3 font-semibold text-gray-700 border border-gray-200">Your Skills</th><th className="text-left p-3 font-semibold text-gray-700 border border-gray-200">Matched Roles</th><th className="text-left p-3 font-semibold text-gray-700 border border-gray-200">Suggested Cert</th></tr></thead>
                  <tbody>
                    {[
                      { skills: 'Python, Data Analysis, SQL — 5 yrs', roles: 'Senior Data Scientist, BI Analyst, ML Engineer', cert: 'Google Data Analytics, AWS ML' },
                      { skills: 'Excel, Communication — 2 yrs', roles: 'Data Analyst, Operations Coordinator, Sales Analyst', cert: 'Microsoft Excel Expert, SQL Basics' },
                      { skills: 'Digital Marketing, Copywriting — 3 yrs', roles: 'Content Strategist, SEO Manager, Social Media Director', cert: 'HubSpot Content, Google Ads' },
                      { skills: 'JavaScript, React — 4 yrs', roles: 'Frontend Engineer, Full-Stack Dev, UI Engineer', cert: 'AWS Cloud Practitioner, Meta Frontend' },
                      { skills: 'Leadership, Project Management — 7 yrs', roles: 'Program Manager, Operations Director, Agile Coach', cert: 'PMP, PRINCE2, CSM' },
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 border border-gray-200 text-gray-700">{row.skills}</td>
                        <td className="p-3 border border-gray-200 text-gray-700">{row.roles}</td>
                        <td className="p-3 border border-gray-200 text-gray-600">{row.cert}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2">Input your own <strong>list of skills for job application</strong> to get a personalised version of this table — with match percentages and the exact gaps to close.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">High-Demand Skills Across Global Job Markets</h2>
            <div className="text-gray-700 space-y-3 text-sm leading-relaxed">
              <p>Our <strong>skills to career matching</strong> engine is trained on global hiring data. These skill categories currently unlock the widest range of roles:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                {[
                  { cat: 'Technical', skills: 'Python, SQL, JavaScript, React, AWS' },
                  { cat: 'Data & Analytics', skills: 'Power BI, Tableau, Excel, R, Machine Learning' },
                  { cat: 'Digital & Marketing', skills: 'SEO, Content, Paid Ads, Email, CRM' },
                  { cat: 'Soft Skills', skills: 'Leadership, Communication, Problem Solving, Agile' },
                ].map(item => (
                  <div key={item.cat} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="font-semibold text-gray-800 text-xs mb-1">{item.cat}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.skills}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2">Regardless of your background, combining one technical skill with one soft skill (e.g., SQL + Communication) significantly expands the number of roles you qualify for — a pattern our <strong>career finder</strong> is specifically designed to surface.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Frequently Asked Questions</h2>
            <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
              {[
                { q: 'What is an alternative role finder?', a: 'A tool that finds &quot;alternative career paths based on skills&quot; — matching your existing profile to new jobs outside your current field, with skill gap analysis and upskilling guidance.' },
                { q: 'How does this AI career finder work for &quot;jobs based on my skills&quot;?', a: 'The AI cross-references your selected skills, tools, and experience level against real hiring data, then returns 8–12 role matches with percentage fit, missing skills, and recommended certifications.' },
                { q: 'Is this career path finder free?', a: 'Yes — fully free, no CV upload required. Just select your skills and click Find Roles.' },
                { q: 'What career suits me based on my skills?', a: 'That depends on your unique combination of inputs. Excel users frequently match to analyst roles; coders to development and DevOps; marketers to content strategy and growth. The tool shows exact percentage fits for each suggestion.' },
                { q: 'Can it help with career change ideas for engineers or marketers?', a: 'Yes. Engineers can discover paths in software, cybersecurity, or renewables. Marketers often find strong matches in digital strategy, content, or B2B sales — all surfaced from the same skill inputs.' },
                { q: 'What job should I do with no degree?', a: 'The tool matches based on skills, not credentials. Web development, digital marketing, data analysis, and customer success are all strong no-degree paths that our career finder surfaces regularly.' },
                { q: 'How is this different from a career aptitude test?', a: 'Career aptitude tests assess personality types. Our tool maps concrete, marketable skills to real open roles — giving you a list of jobs you can actually apply for today, not just a personality archetype.' },
                { q: 'What are some &quot;jobs based on my skills&quot; examples?', a: 'Data skills → Data Analyst, BI Analyst; Marketing skills → Social Media Manager, Content Strategist; Engineering + Leadership → Technical Project Manager, Solutions Architect.' },
              ].map((faq, i) => (
                <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <p className="font-semibold text-gray-900 mb-1">{faq.q}</p>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ad 4: Display Bottom */}
        <AdUnit slot="9751041788" format="auto" />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
          { "@context": "https://schema.org", "@type": "WebApplication", "name": "Alternative Role Finder", "description": "Free AI-powered career path finder. Discover jobs based on your skills, explore alternative career paths, get skill gap analysis and certification tips.", "url": "https://jobmeter.com/tools/role-finder", "applicationCategory": "CareerApplication", "operatingSystem": "Web", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }, "featureList": ["Jobs based on my skills matching", "Alternative career paths discovery", "Skill gap analysis", "Certification recommendations", "AI career finder", "Career change ideas"] },
          { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            { "@type": "Question", "name": "What jobs match my skills?", "acceptedAnswer": { "@type": "Answer", "text": "Our AI career finder cross-references your skills and experience against global hiring data to return 8-12 matched roles with percentage fit scores, skill gaps, and certification tips." } },
            { "@type": "Question", "name": "What career suits me based on my skills?", "acceptedAnswer": { "@type": "Answer", "text": "Select your skills in the Alternative Role Finder tool. The AI analyzes your unique combination and returns the best-fitting career paths, including alternative careers you may not have considered." } },
            { "@type": "Question", "name": "Is this AI career finder free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, the Alternative Role Finder is completely free. No CV upload or account required. Simply select your skills and click Find Alternative Roles." } },
            { "@type": "Question", "name": "How do I find jobs related to my skills without a degree?", "acceptedAnswer": { "@type": "Answer", "text": "The tool matches purely on skills, not qualifications. Common no-degree paths it surfaces include web development, digital marketing, data analysis, customer success, and UX research." } }
          ] },
          { "@context": "https://schema.org", "@type": "HowTo", "name": "How to Find Jobs Based on My Skills", "description": "Use the Alternative Role Finder to discover alternative career paths that match your skills and experience.", "step": [
            { "@type": "HowToStep", "name": "Select your skills", "text": "Choose from skill categories or add custom skills like Python, SEO, or Leadership." },
            { "@type": "HowToStep", "name": "Add tools and software", "text": "Optionally add tools like Excel, Figma, or Salesforce to refine matches." },
            { "@type": "HowToStep", "name": "Set years of experience", "text": "Select your experience level to calibrate seniority of recommendations." },
            { "@type": "HowToStep", "name": "Find Alternative Roles", "text": "Click the button to get 8-12 personalized role matches with skill gaps and certifications." }
          ] }
        ]) }} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100" style={{ height: '50px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50px', overflow: 'hidden' }}>
          <AdUnit slot="3349195672" format="auto" style={{ display: 'block', width: '100%', height: '50px', maxHeight: '50px', overflow: 'hidden' }} />
        </div>
      </div>
    </div>
  );
}
