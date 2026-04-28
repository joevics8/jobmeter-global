import { theme } from '@/lib/theme';
import { Award, Laptop, Home, Globe, Rocket, GraduationCap, Briefcase } from 'lucide-react';
import { NYSCFinderClient } from './NYSCFinderClient';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

export default function NYSCFinderPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
      {/* Header */}
      <div
        className="pt-12 pb-8 px-6"
        style={{ backgroundColor: theme.colors.primary.DEFAULT }}
      >
        <div className="max-w-7xl mx-auto">
          <a href="/resource" className="text-sm text-white/80 hover:text-white transition-colors self-start inline-block mb-2">
            ← Back to Resources
          </a>
          <div className="flex items-center gap-3 mb-2">
            <Award size={32} />
            <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.light }}>
              NYSC Jobs
            </h1>
          </div>
          <p className="text-sm" style={{ color: theme.colors.text.light }}>
            Find job opportunities for NYSC corpers
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">1</div>
              <p className="text-sm text-gray-600">Search by job title, skill, or company</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">2</div>
              <p className="text-sm text-gray-600">Filter by sector and location</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">3</div>
              <p className="text-sm text-gray-600">Find jobs suitable for corpers</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">4</div>
              <p className="text-sm text-gray-600">Apply and start your service year</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client Island */}
      <NYSCFinderClient />

      <AdUnit slot="4198231153" format="auto" />

      {/* ── Related Tools ── */}
      <div className="px-4 md:px-6 max-w-7xl mx-auto">
        <div className="mt-12 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Explore More Job Finder Tools</h2>
          <p className="text-sm text-gray-500 mb-6">Other free tools to help you find the right opportunity faster</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { title: 'Remote Jobs',               description: 'Find remote job opportunities in Nigeria and worldwide',           icon: Laptop,        color: '#06B6D4', route: '/tools/remote-jobs-finder' },
              { title: 'Internship Finder',          description: 'Find internship opportunities to kickstart your career',           icon: Briefcase,     color: '#2563EB', route: '/tools/internship-finder' },
              { title: 'Jobs with Accommodation',   description: 'Find jobs that offer accommodation benefits',                      icon: Home,          color: '#14B8A6', route: '/tools/accommodation-finder' },
              { title: 'Jobs with Visa Sponsorship', description: 'Find jobs that offer visa sponsorship and work permits',          icon: Globe,         color: '#3B82F6', route: '/tools/visa-finder' },
              { title: 'Graduate & Trainee Jobs',   description: 'Find graduate programs and trainee positions for fresh graduates',  icon: GraduationCap, color: '#2563EB', route: '/tools/graduate-trainee-finder' },
              { title: 'Entry Level Jobs',          description: 'Find entry-level jobs for beginners starting their career',         icon: Rocket,        color: '#6366F1', route: '/tools/entry-level-finder' },
              { title: 'Quiz Platform',             description: 'Practice aptitude tests and theory questions',                     icon: Briefcase,     color: '#F59E0B', route: '/tools/quiz' },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <a
                  key={tool.route}
                  href={tool.route}
                  className="bg-white rounded-2xl p-4 flex flex-col items-start gap-3 hover:shadow-md transition-shadow group"
                  style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tool.color}18` }}>
                    <Icon size={20} style={{ color: tool.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight mb-1">{tool.title}</p>
                    <p className="text-xs text-gray-500 leading-snug">{tool.description}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SEO Content ── */}
      <div className="px-4 md:px-6 max-w-7xl mx-auto">
        <div className="mt-8 bg-white rounded-2xl p-6 md:p-10" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
          <article className="prose prose-gray max-w-none">

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              NYSC Jobs 2026: Find Job Vacancies for Corpers, NYSC PPA Opportunities, Internships, and Post-Service Careers
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Every year, over 350,000 Nigerian graduates mobilized for the National Youth Service Corps face the same urgent question: where do I find legitimate, corper-friendly job opportunities during and after my service year? The NYSC Jobs Finder on Jobmeter is built specifically to answer that question — aggregating verified NYSC job vacancies, PPA placements, internship opportunities, and entry-level positions tailored to corps members across every state in Nigeria. Whether you are in Batch A, Batch B, or Batch C Stream I or II, this platform surfaces real, active opportunities from employers who understand the NYSC calendar, value corper talent, and actively recruit through service year channels.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">What Are NYSC Jobs and Why Do They Matter?</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              NYSC jobs refer to employment and placement opportunities specifically suited for corps members — covering Primary Place of Assignment (PPA) positions, corper-friendly internships, part-time and remote roles compatible with service year commitments, and full-time positions that hire directly from the NYSC talent pool. These roles differ from standard entry-level jobs because they account for the unique constraints of service: state deployment, camp obligations, CDS (Community Development Service) days, and the monthly allawee structure.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              For employers, NYSC recruitment is one of Nigeria's most cost-effective talent acquisition strategies — accessing a pool of fresh, degree-qualified graduates who bring energy, digital skills, and current academic knowledge. For corpers, a strong PPA placement or side role during service year can mean the difference between leaving service with zero professional experience and leaving with a compelling CV, an industry network, and sometimes a confirmed job offer.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              The NYSC Jobs Finder aggregates opportunities across all major categories — NYSC job vacancies in tech, banking, oil and gas, NGOs, education, healthcare, and government — updated daily so corps members in every batch and stream can find current openings without relying on WhatsApp groups or unofficial channels where fake listings are rampant.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">NYSC Job Vacancies by Sector: What's Available in 2026</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The range of genuine NYSC job vacancies in 2026 spans far beyond the cliché of teaching in rural schools. Here is a full breakdown of active sectors and the types of roles available to corps members:
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full text-sm text-gray-700 border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-green-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Sector</th>
                    <th className="text-left px-4 py-3 font-semibold">Example NYSC Roles</th>
                    <th className="text-left px-4 py-3 font-semibold">Monthly Stipend Range</th>
                    <th className="text-left px-4 py-3 font-semibold">Key Employers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Technology',        'NYSC software developer, IT corper, data analyst intern, cybersecurity NYSC role',               '₦70K–₦200K',  'Andela, Flutterwave, Paystack, Interswitch'],
                    ['Banking & Finance', 'NYSC bank teller, customer service corper, credit analyst NYSC, banking NYSC jobs',               '₦50K–₦120K',  'GTBank, Zenith, Access Bank, UBA, First Bank'],
                    ['Oil & Gas',         'NYSC field assistant, engineering corper, HSE NYSC intern, TotalEnergies NYSC',                   '₦80K–₦250K',  'Shell, TotalEnergies, Chevron, NNPC, Seplat'],
                    ['NGOs & Development','NYSC program officer, community dev corper, UNICEF NYSC, NGO internship corper',                  '₦40K–₦100K',  'UNICEF, Save the Children, RED, ActionAid'],
                    ['Education',         'NYSC teacher, school administrator corper, NYSC teaching jobs, lecturer assistant',               '₦33K + allowances', 'State schools, private schools, universities'],
                    ['Healthcare',        'NYSC pharmacist, medical lab corper, hospital admin NYSC, nursing support',                       '₦50K–₦120K',  'LUTH, UCH, federal hospitals, private clinics'],
                    ['Marketing & Sales', 'NYSC sales executive, digital marketing corper, brand promoter NYSC',                             '₦40K–₦100K',  'FMCG firms, agencies, telecoms'],
                    ['Media & Content',   'NYSC content writer, social media corper, journalist intern, PR NYSC',                            '₦40K–₦90K',   'Media houses, PR agencies, brands'],
                  ].map(([sector, roles, stipend, employers]) => (
                    <tr key={sector} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{sector}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{roles}</td>
                      <td className="px-4 py-3 text-gray-600">{stipend}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{employers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">
              Technology roles represent the fastest-growing NYSC job category in 2026, with Nigerian fintech and tech companies actively recruiting corpers as software developers, IT support officers, data analysts, and product interns. Stipends in tech can reach ₦150,000–₦200,000 monthly — significantly above the standard federal allawee — making a tech PPA one of the most financially rewarding placements available. Oil and gas roles in Rivers State, Delta, and Bayelsa also rank highly for corpers willing to take on field-adjacent assignments.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">How to Find Your NYSC PPA: A Practical Guide for Corpers</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Finding the right Primary Place of Assignment is the single most career-defining decision of your service year. A strong PPA placement in a reputable organization can launch your career; a poorly matched placement wastes 11 months of critical early-career time. Here's the practical guide corps members need:
            </p>
            <ol className="list-decimal pl-6 space-y-3 text-gray-600 mb-6">
              <li><strong>Use the NYSC Jobs Finder Before Camp Ends:</strong> The best PPA placements at top companies — banks, tech firms, oil majors — are often arranged before or during camp, not after. Use Jobmeter's NYSC jobs filter to identify organizations in your deployment state that are actively accepting corps members, and reach out before your camp closes.</li>
              <li><strong>Reach Out Directly to Target Companies:</strong> Many top employers (Andela, Interswitch, Shell, GTBank) have dedicated NYSC recruitment processes. Email their HR departments directly with your green card, statement of result, and a tailored one-page CV. Mention your deployment state explicitly. Companies with offices in your state are legally obligated to accept NYSC placements under certain conditions.</li>
              <li><strong>Leverage Your University Network:</strong> Alumni from your institution who completed NYSC in your deployment state are your best source of active PPA leads. WhatsApp alumni groups, LinkedIn connections, and university career offices often have direct employer contacts that are not publicly listed on job boards.</li>
              <li><strong>Use the NYSC CV Bank:</strong> The official NYSC CV bank (accessible through the NYSC portal) is reviewed by registered employers. Keeping your profile updated with current skills, certifications, and SAED training details increases your visibility to employers actively searching for corps members in your state.</li>
              <li><strong>Apply to NYSC-Specific Job Listings on Jobmeter:</strong> Set real-time alerts for "NYSC jobs," "jobs for corpers," and sector-specific terms like "NYSC tech jobs" or "NYSC bank jobs" to receive instant notifications when new placements go live. Many employers post openings for upcoming batches weeks before mobilization.</li>
              <li><strong>Have a Backup Plan:</strong> Always apply to 3–5 PPA options simultaneously. If your first-choice organization cannot formally absorb you, having backup options prevents you from landing a non-professional PPA by default.</li>
            </ol>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">NYSC Internships and Pre-Service Opportunities</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              NYSC internship programs — positions that function as PPA placements with structured training components — are available across multiple sectors and often represent the highest-value service year placements for career development. The best NYSC internship opportunities in 2026 include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
              <li><strong>Tech Internships (Andela, Paystack, Flutterwave, Interswitch):</strong> These fintech and tech giants actively absorb NYSC corpers as software engineering interns, product associates, data analyst interns, and customer success roles. Stipends range from ₦100,000–₦200,000 monthly, and the best performers frequently receive return offers post-POP.</li>
              <li><strong>Banking Internships (GTBank, Access Bank, UBA, Zenith):</strong> Nigeria's top banks run structured NYSC programs that rotate corpers through retail banking, credit, operations, and digital banking units. These placements build the most transferable finance skills and often lead directly to management trainee offers.</li>
              <li><strong>Oil & Gas Internships (Shell, TotalEnergies, Chevron, Seplat):</strong> Engineering, geoscience, HSE, and commercial corpers can access structured placements at oil majors, particularly in Port Harcourt, Warri, and Lagos. These roles pay the highest stipends and carry the strongest brand value on a CV.</li>
              <li><strong>NGO & Development Sector (UNICEF, Save the Children, ActionAid):</strong> International development organizations in Nigeria actively recruit NYSC corpers for program officer, M&E, communications, and administrative roles. Excellent for corpers targeting international careers or development sector paths.</li>
              <li><strong>Pre-NYSC Internships (SIWES):</strong> Final-year students can secure internships via SIWES (Student Industrial Work Experience Scheme) at firms like Exxon, Microsoft, and Google — with some of these converting into PPA placements or direct post-NYSC opportunities.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Remote and Work-From-Home NYSC Jobs for Corpers</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              One of the most significant shifts in the NYSC job landscape post-2020 is the explosion of remote and hybrid roles that corpers can take on alongside or instead of a traditional PPA. The NYSC Jobs Finder on Jobmeter covers hundreds of work-from-home listings compatible with corps member schedules and state deployment constraints.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Popular remote NYSC roles include content writing and copywriting positions, social media management, virtual assistant jobs, remote customer support roles, data entry and analysis positions, online tutoring and e-learning facilitating, and freelance design and development work. For corpers deployed to states where in-person placement opportunities are limited — particularly in rural deployments — remote roles provide a way to build professional experience and supplementary income simultaneously. Many corpers in tech build freelance client bases during their service year that sustain them financially well beyond POP.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">NYSC Jobs by Location: Top States for Corper Placements</h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full text-sm text-gray-700 border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-green-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">State</th>
                    <th className="text-left px-4 py-3 font-semibold">Top Sectors for Corpers</th>
                    <th className="text-left px-4 py-3 font-semibold">Key Employers Active</th>
                    <th className="text-left px-4 py-3 font-semibold">Opportunity Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Lagos',          'Tech, Banking, FMCG, Media, NGOs',           'Andela, GTBank, Unilever, Channels TV',  '🔥 Highest'],
                    ['Abuja (FCT)',    'Government, NGOs, Tech, Finance',             'UNICEF, CBN, MTN, World Bank',           '🔥 Very High'],
                    ['Port Harcourt', 'Oil & Gas, Engineering, Banking',              'Shell, TotalEnergies, Zenith, Seplat',   '🔥 Very High'],
                    ['Kano',          'Manufacturing, FMCG, Banking',                'Dangote, PZ Cussons, Access Bank',       '⚡ High'],
                    ['Ibadan',        'Education, Healthcare, FMCG',                 'UCH, UI, Nestle, Guinness',              '⚡ High'],
                    ['Enugu',         'Banking, Education, Healthcare',              'First Bank, State Hospitals, schools',   '🟡 Moderate'],
                    ['Benin City',    'Banking, Education, Engineering',             'Access Bank, UNIBEN, construction firms','🟡 Moderate'],
                    ['Rural States',  'Education, Healthcare (high need)',           'State secondary schools, health centres','🟢 Available'],
                  ].map(([state, sectors, employers, level]) => (
                    <tr key={state} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{state}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{sectors}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{employers}</td>
                      <td className="px-4 py-3 text-gray-600">{level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Post-NYSC Jobs: Converting Your Service Year into a Career</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The service year is not just about fulfilling a national obligation — it's a 12-month career runway. Corps members who use their service year strategically leave NYSC with a professional edge that dramatically shortens their post-service job search. Here's how to convert your NYSC period into direct employment:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
              <li><strong>Perform at Your PPA Above Expectations:</strong> The single most reliable path to a post-NYSC job offer is outstanding performance at your PPA. Many Nigerian employers — particularly banks, fintech firms, and oil companies — use PPA placements as a year-long interview. Corpers who demonstrate reliability, initiative, and skill are frequently offered permanent roles before POP.</li>
              <li><strong>Build Skills Alongside Your PPA:</strong> Use evenings and weekends during service to acquire certifications that your target industry values — Google certifications for digital marketing, CompTIA for IT, ICAN/ACCA for finance, AWS/Azure for cloud, or a coding bootcamp for tech. These credentials dramatically strengthen post-service applications.</li>
              <li><strong>Network at Every CDS Meeting and State Event:</strong> CDS groups bring together corpers from across industries and institutions. The corper sitting next to you in CDS may have a cousin who is a hiring manager at your target company. Treat every NYSC gathering as a professional networking opportunity.</li>
              <li><strong>Apply Early — Don't Wait for POP:</strong> Start applying for post-service jobs 3–4 months before your POP date. Most competitive graduate trainee programs at banks, FMCG companies, and tech firms open applications annually on fixed schedules. Missing an application window because you waited until your green card arrived can cost you a full year.</li>
              <li><strong>Use Jobmeter's Graduate Trainee and Entry Level Finders:</strong> The Graduate & Trainee Jobs Finder and Entry Level Jobs Finder on Jobmeter are specifically designed for the post-NYSC transition — surfacing management trainee programs, junior roles, and entry-level positions that explicitly welcome fresh NYSC graduates.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Real Stories from NYSC Corpers</h3>
            <div className="space-y-4 mb-8">
              <blockquote className="border-l-4 border-green-500 pl-4 py-1 bg-green-50 rounded-r-xl">
                <p className="text-gray-700 italic">"I found my Paystack PPA through Jobmeter's NYSC jobs finder two weeks before camp ended. I emailed their HR directly with my green card, got an interview in camp, and started my placement on week one after passing out. They offered me a full role before my POP."</p>
                <cite className="text-sm text-gray-500 mt-1 block">— Chidera, NYSC Corper → Junior Product Associate, Paystack Lagos</cite>
              </blockquote>
              <blockquote className="border-l-4 border-blue-500 pl-4 py-1 bg-blue-50 rounded-r-xl">
                <p className="text-gray-700 italic">"I was deployed to Kano and worried there'd be nothing for a computer science graduate. Found a remote data entry role through the NYSC finder that paid ₦80K/month on top of my allawee. Ended service with 11 months of professional experience and a portfolio."</p>
                <cite className="text-sm text-gray-500 mt-1 block">— Emeka, Remote Data Role, deployed to Kano State</cite>
              </blockquote>
              <blockquote className="border-l-4 border-purple-500 pl-4 py-1 bg-purple-50 rounded-r-xl">
                <p className="text-gray-700 italic">"Shell's Port Harcourt placement appeared on the NYSC Jobs Finder for Batch B. Applied immediately, got accepted, and now I have an oil & gas PPA paying ₦180K monthly. The finder is the only place I saw it listed."</p>
                <cite className="text-sm text-gray-500 mt-1 block">— Ngozi, NYSC Engineering Corper, Shell Port Harcourt</cite>
              </blockquote>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Frequently Asked Questions About NYSC Jobs</h3>
            <div className="space-y-5 mb-8">
              {[
                { q: 'What is the best NYSC job portal for corpers in 2026?', a: 'Jobmeter\'s NYSC Jobs Finder is the most comprehensive corper-specific job board, aggregating verified NYSC vacancies daily across all sectors and states. Other useful platforms include Jobberman\'s corper section, MyJobMag, and the official NYSC CV Bank (portal.nysc.org.ng). Always verify listings before submitting documents, as fake "NYSC job portals" are common on social media.' },
                { q: 'How do I find a good PPA (Primary Place of Assignment)?', a: 'Use the NYSC Jobs Finder on Jobmeter to identify employers actively accepting corps members in your deployment state. Apply directly to HR contacts 2–3 weeks before or during camp. Leverage university alumni networks in your state. Maintain an updated profile on the official NYSC CV Bank. Apply to 3–5 options simultaneously to avoid ending up with a default placement.' },
                { q: 'Which sectors offer the best NYSC jobs in terms of pay?', a: 'Oil & gas (₦80K–₦250K), technology/fintech (₦70K–₦200K), and banking (₦50K–₦120K) offer the highest NYSC stipends above the federal allawee. NGO roles offer the best international exposure and career development for corpers targeting development sector careers. Education placements are most widely available but typically rely on the standard allawee only.' },
                { q: 'Can I work a remote job while serving as an NYSC corper?', a: 'Yes — many corpers take on remote work-from-home roles (content writing, virtual assistance, data analysis, social media management, freelance development) alongside their PPA, provided it doesn\'t conflict with CDS obligations and service hour requirements. The NYSC Jobs Finder includes remote-compatible roles specifically listed as corper-friendly.' },
                { q: 'What are NYSC batch dates and how do they affect job applications?', a: 'NYSC mobilizes three batches annually: Batch A (typically January–March mobilization), Batch B (June–August), and Batch C (October–November). Each batch has Stream I and Stream II. Understanding your batch timing helps you align job applications — most major employer NYSC recruitment windows open 4–8 weeks before each batch\'s mobilization date. Set Jobmeter alerts for your batch period.' },
                { q: 'How do I apply for NYSC jobs at companies like Interswitch or Andela?', a: 'Search "NYSC jobs" on Jobmeter to find current openings at Interswitch, Andela, and similar tech companies. For direct applications: email the company\'s HR department with your NYSC green card, statement of result, and a one-page CV tailored to their open role. Mention your deployment state and batch. LinkedIn is also effective for connecting directly with HR managers at target companies during camp.' },
                { q: 'Are there NYSC jobs in Rivers State for oil and gas corpers?', a: 'Yes — Rivers State (Port Harcourt) is Nigeria\'s most active location for oil and gas NYSC placements, with Shell, TotalEnergies, Seplat, First E&P, and numerous oil services companies regularly absorbing engineering, geoscience, HSE, and commercial corpers. Set a location filter for Port Harcourt / Rivers on the NYSC Jobs Finder to surface current openings in this hub.' },
                { q: 'How do I avoid fake NYSC job sites and scams?', a: 'Only use verified platforms: Jobmeter\'s NYSC finder, Jobberman, MyJobMag, and the official NYSC portal (nysc.org.ng). Never pay any fee to secure a PPA or NYSC job placement — legitimate employers never charge corpers for placements. Be cautious of WhatsApp-only job offers, suspiciously high stipend promises, and websites mimicking "nyscjobs.ng" or "nysc job portal" that ask for payment.' },
                { q: 'What skills should I develop during NYSC to improve job prospects?', a: 'The highest-return skills to develop during NYSC service year: coding/programming (Python, JavaScript) for tech roles; data analysis (SQL, Excel, Power BI); digital marketing (Google Analytics, Meta Ads); financial modeling (Excel, accounting software) for finance roles; and communication/presentation skills for management roles. Many free certifications (Google Career Certificates, Coursera, etc.) can be completed evenings and weekends during service.' },
                { q: 'How do I convert my NYSC PPA into a permanent job offer?', a: 'Perform above expectations consistently throughout your placement. Volunteer for projects outside your immediate role. Build genuine relationships with your supervisor and team. Discuss your interest in a permanent role early — around month 6 or 7 — so your supervisor can advocate for you internally. Many Nigerian employers use NYSC placements as extended interviews and have clear pipelines for converting high-performing corpers into permanent staff.' },
              ].map(({ q, a }) => (
                <div key={q} className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{q}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>

          </article>
        </div>
      </div>

      <AdUnit slot="9751041788" format="auto" />

      {/* ── Schema Markup ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "NYSC Jobs Finder — Find Job Vacancies for Corpers, PPA Opportunities & NYSC Internships 2026",
              "description": "Find NYSC jobs, corper job vacancies, PPA placements, NYSC internships, and post-service career opportunities across all sectors and states in Nigeria. The best NYSC job portal for corps members in 2026.",
              "url": "https://remote.jobmeter.app/tools/nysc-finder",
              "inLanguage": "en",
              "dateModified": new Date().toISOString().split('T')[0],
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home",  "item": "https://remote.jobmeter.app" },
                  { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://remote.jobmeter.app/tools" },
                  { "@type": "ListItem", "position": 3, "name": "NYSC Jobs Finder", "item": "https://remote.jobmeter.app/tools/nysc-finder" },
                ]
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "NYSC Jobs Finder",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "description": "The best NYSC job portal for Nigerian corps members — aggregating verified NYSC job vacancies, PPA placements, corper internships, remote roles, and post-service career opportunities across all sectors and states in Nigeria, updated daily.",
              "url": "https://remote.jobmeter.app/tools/nysc-finder",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "NGN",
                "description": "Free to use for all NYSC corps members."
              },
              "featureList": [
                "Real-time NYSC job vacancies updated daily",
                "PPA placement opportunities by state",
                "Remote and work-from-home jobs for corpers",
                "NYSC internships in tech, banking, oil & gas, NGOs",
                "Sector filters: Technology, Finance, Oil & Gas, Healthcare, Education",
                "Location filter by NYSC deployment state",
                "Batch-specific job alerts (A, B, C, Stream I & II)",
                "Direct employer contact support for PPA applications",
                "Post-NYSC graduate trainee and entry level job links",
                "Verified listings — no fake NYSC job portals"
              ],
              "keywords": "NYSC jobs, jobs for corpers, nysc job vacancies, nysc ppa, nysc internship, nysc recruitment, nysc job portal, nysc tech jobs, nysc bank jobs, jobs for nysc corpers 2026"
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                { "@type": "Question", "name": "What is the best NYSC job portal for corpers in 2026?", "acceptedAnswer": { "@type": "Answer", "text": "Jobmeter's NYSC Jobs Finder is the most comprehensive corper-specific job board, aggregating verified NYSC vacancies daily across all sectors and states. Always verify listings before submitting documents — never pay any fee to secure a PPA or placement." } },
                { "@type": "Question", "name": "How do I find a good PPA (Primary Place of Assignment)?", "acceptedAnswer": { "@type": "Answer", "text": "Use Jobmeter's NYSC Jobs Finder to identify employers actively accepting corps members in your deployment state. Apply directly 2–3 weeks before or during camp, leverage alumni networks, maintain an updated NYSC CV Bank profile, and apply to 3–5 options simultaneously." } },
                { "@type": "Question", "name": "Can I work a remote job while serving as an NYSC corper?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — content writing, virtual assistance, data analysis, social media management, and freelance development are all remote-compatible NYSC-friendly roles listed on Jobmeter's NYSC finder, provided they don't conflict with CDS obligations." } },
                { "@type": "Question", "name": "Which sectors offer the best NYSC stipends?", "acceptedAnswer": { "@type": "Answer", "text": "Oil & gas (₦80K–₦250K monthly), technology/fintech (₦70K–₦200K), and banking (₦50K–₦120K) offer the highest NYSC stipends above the federal allawee. Tech roles at firms like Paystack, Andela, and Interswitch are particularly competitive." } },
                { "@type": "Question", "name": "How do I avoid fake NYSC job portals and scams?", "acceptedAnswer": { "@type": "Answer", "text": "Only use verified platforms: Jobmeter's NYSC finder, Jobberman, MyJobMag, and the official NYSC portal (nysc.org.ng). Never pay any fee to secure a PPA — legitimate employers never charge corpers for placements. Avoid WhatsApp-only job offers and sites mimicking established portals." } },
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Related Job Finder Tools on Jobmeter",
              "description": "Other free job finder tools available on remote.jobmeter.app",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Internship Finder",           "url": "https://remote.jobmeter.app/tools/internship-finder" },
                { "@type": "ListItem", "position": 2, "name": "Graduate & Trainee Jobs",     "url": "https://remote.jobmeter.app/tools/graduate-trainee-finder" },
                { "@type": "ListItem", "position": 3, "name": "Entry Level Jobs Finder",     "url": "https://remote.jobmeter.app/tools/entry-level-finder" },
                { "@type": "ListItem", "position": 4, "name": "Remote Jobs Finder",          "url": "https://remote.jobmeter.app/tools/remote-jobs-finder" },
                { "@type": "ListItem", "position": 5, "name": "Jobs with Accommodation",     "url": "https://remote.jobmeter.app/tools/accommodation-finder" },
              ]
            }
          ])
        }}
      />

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100" style={{ height: '50px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50px', overflow: 'hidden' }}>
          <AdUnit slot="3349195672" format="auto" style={{ display: 'block', width: '100%', height: '50px', maxHeight: '50px', overflow: 'hidden' }} />
        </div>
      </div>
    </div>
  );
}
