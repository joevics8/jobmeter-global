import React from 'react';
import { theme } from '@/lib/theme';
import { GraduationCap, Briefcase, Wifi, Award, Home, Globe, Rocket, ClipboardList } from 'lucide-react';
import { GraduateTraineeFinderClient } from './GraduateTraineeFinderClient';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

export default function GraduateTraineeFinderPage() {
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
            <GraduationCap size={32} />
            <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.light }}>
              Graduate & Trainee Jobs
            </h1>
          </div>
          <p className="text-sm" style={{ color: theme.colors.text.light }}>
            Find graduate programs, trainee positions, and entry-level opportunities for fresh graduates
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">1</div>
              <p className="text-sm text-gray-600">Search by job title, skill, or company</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">2</div>
              <p className="text-sm text-gray-600">Filter by sector and location</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">3</div>
              <p className="text-sm text-gray-600">Find graduate programs and trainee roles</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">4</div>
              <p className="text-sm text-gray-600">Apply to kickstart your career</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 max-w-7xl mx-auto">
        <GraduateTraineeFinderClient />

        <AdUnit slot="4198231153" format="auto" />

        {/* ── Related Tools ── */}
        <div className="mt-12 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Explore More Job Finder Tools</h2>
          <p className="text-sm text-gray-500 mb-6">Other free tools to help you find the right opportunity faster</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { title: 'Remote Jobs',              description: 'Find remote job opportunities in Nigeria and worldwide',           icon: Wifi,          color: '#06B6D4', route: '/tools/remote-jobs-finder' },
              { title: 'Internship Finder',         description: 'Find internship opportunities to kickstart your career',           icon: Briefcase,     color: '#2563EB', route: '/tools/internship-finder' },
              { title: 'NYSC Jobs',                description: 'Find job opportunities for NYSC corpers',                          icon: Award,         color: '#10B981', route: '/tools/nysc-finder' },
              { title: 'Jobs with Accommodation',  description: 'Find jobs that offer accommodation benefits',                      icon: Home,          color: '#14B8A6', route: '/tools/accommodation-finder' },
              { title: 'Jobs with Visa Sponsorship',description: 'Find jobs that offer visa sponsorship and work permits',          icon: Globe,         color: '#3B82F6', route: '/tools/visa-finder' },
              { title: 'Entry Level Jobs',         description: 'Find entry-level jobs for beginners starting their career',         icon: Rocket,        color: '#6366F1', route: '/tools/entry-level-finder' },
              { title: 'Quiz Platform',            description: 'Practice aptitude tests and theory questions',                     icon: ClipboardList, color: '#F59E0B', route: '/tools/quiz' },
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

        {/* ── SEO Content ── */}
        <div className="mt-8 bg-white rounded-2xl p-6 md:p-10" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
          <article className="prose prose-gray max-w-none">

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Graduate Trainee Jobs 2026: Find Graduate Trainee Programs, Management Trainee Opportunities, and Tech Traineeships in Nigeria and Worldwide
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Graduate trainee jobs are the most structured and rewarding entry point into a professional career for recent university graduates. Whether you hold a bachelor's or master's degree with little or no work experience, a graduate trainee program gives you hands-on exposure, mentorship from senior professionals, and a clear progression path into permanent employment. The Graduate & Trainee Jobs Finder on Jobmeter aggregates verified graduate trainee programs, management trainee opportunities, technical traineeships, and specialist rotational programs across Nigeria and globally — helping fresh graduates land roles at top employers in 2026 faster than any generic job board.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">What Are Graduate Trainee Jobs and How Do They Work?</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Graduate trainee jobs — also called graduate trainee programs, traineeships, or graduate training schemes — are structured entry-level roles specifically designed for recent graduates with limited professional experience. They typically last between 12 and 24 months and rotate participants through multiple departments, giving broad exposure to the business before placing them in a specialized permanent role.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              A management trainee program, for example, might rotate you through operations, marketing, finance, and human resources before placing you in a supervisory or team lead position. A software engineer traineeship or IT trainee program might cycle you through backend development, QA, DevOps, and product management. This breadth of exposure is what makes graduate trainee programs uniquely valuable compared to standard entry-level jobs — you get paid to learn the full business before specializing.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Top companies running graduate trainee programs in Nigeria and globally include Deloitte, Shell, Google, Unilever, Nestle, Pepsi, MTN, Zenith Bank, Access Bank, First Bank, Dangote Group, and Chevron. Salaries for Nigerian graduate trainee jobs typically range from ₦2.5 million to ₦6 million annually at top firms, while international programs at multinationals offer $40,000–$70,000 USD depending on location and sector.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Top Industries Offering Graduate Trainee Programs in 2026</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Graduate trainee opportunities exist across virtually every sector, but demand is especially high in technology, finance, engineering, and management. Here is a breakdown of the most active industries and roles:
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full text-sm text-gray-700 border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Industry</th>
                    <th className="text-left px-4 py-3 font-semibold">Example Roles</th>
                    <th className="text-left px-4 py-3 font-semibold">Starting Salary Range</th>
                    <th className="text-left px-4 py-3 font-semibold">Key Employers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Technology',    'Software engineer traineeship, IT trainee program, web development traineeship, cybersecurity trainee, trainee Python jobs',       '₦3M–₦6M / $50K–$70K', 'Google, Microsoft, Andela, Interswitch'],
                    ['Finance & Banking', 'Finance traineeships, accounting traineeship, credit analyst trainee, banking graduate trainee',                              '₦2.5M–₦5M / $45K–$65K', 'Deloitte, Zenith Bank, GTBank, KPMG'],
                    ['Engineering',   'Graduate trainee engineer, mechanical engineer trainee, electrical engineer trainee, diesel mechanic training jobs',               '₦2.5M–₦5M / $40K–$60K', 'Shell, Dangote, Siemens, Chevron'],
                    ['Management',    'Management trainee program, trainee project manager, business administration traineeship, operations trainee',                    '₦2.5M–₦5M / $45K–$55K', 'Unilever, Nestle, Pepsi, MTN'],
                    ['Healthcare',    'Nurse training jobs, phlebotomy training jobs, laboratory trainee, hospital management trainee',                                  '₦1.5M–₦3M / $35K–$50K', 'LUTH, UCH, Eko Hospital, clinics'],
                    ['Construction',  'Construction traineeship, site engineer trainee, welding training jobs, quantity surveying trainee',                              '₦2M–₦4M / $38K–$52K', 'Julius Berger, CCECC, Costain'],
                    ['Sales & Marketing', 'Trainee sales executive, marketing trainee, digital marketing traineeship, brand management trainee',                         '₦1.8M–₦3.5M / $35K–$50K', 'Nestle, PZ Cussons, Guinness'],
                    ['Legal & HR',    'Legal traineeship, in-house legal trainee, HR management trainee, recruitment trainee',                                           '₦2M–₦4M / $40K–$55K', 'Law firms, Deloitte, KPMG'],
                  ].map(([industry, roles, salary, employers]) => (
                    <tr key={industry} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{industry}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{roles}</td>
                      <td className="px-4 py-3 text-gray-600">{salary}</td>
                      <td className="px-4 py-3 text-gray-600">{employers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Best Graduate Trainee Programs in Nigeria 2026</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Nigeria's most competitive graduate trainee programs attract thousands of applicants each cycle. These are the most sought-after programs currently active on the Graduate & Trainee Jobs Finder:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
              <li><strong>Deloitte Trainee Program:</strong> One of the most competitive in Nigeria, the Deloitte graduate trainee program recruits top graduates for audit, tax, consulting, and advisory rotations. Expect rigorous aptitude tests, case study interviews, and assessment centres. Salaries are among the highest in the Big Four category.</li>
              <li><strong>Shell Traineeship:</strong> Shell's graduate trainee program in Nigeria covers engineering, geoscience, finance, and commercial roles. The Shell traineeship is highly structured with international rotation possibilities and strong mentorship from Shell's global talent network.</li>
              <li><strong>MTN Management Trainee Program:</strong> MTN Nigeria's Future Leaders program recruits STEM and business graduates for rotations in technology, finance, marketing, and operations across their nationwide network.</li>
              <li><strong>Dangote Group Graduate Trainee:</strong> One of Nigeria's largest employers, Dangote runs a well-regarded graduate trainee program across manufacturing, logistics, finance, and engineering sectors.</li>
              <li><strong>Unilever Future Leaders Program:</strong> Unilever's graduate management trainee offers international rotations, fast-tracked leadership development, and exposure to one of the world's largest FMCG companies. Strong focus on sales, marketing, and supply chain.</li>
              <li><strong>Access Bank / Zenith Bank Management Trainee:</strong> Nigeria's top banks run highly competitive management trainee programs for business, economics, and STEM graduates — leading directly to assistant banking officer roles.</li>
              <li><strong>Google Traineeship (EMEA):</strong> Google's associate programs and traineeships in the EMEA region cover software engineering, product management, data analytics, and sales — with strong visa sponsorship options for Nigerian candidates selected.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Tech Graduate Trainee Jobs: Software, Data, and Cybersecurity Traineeships</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Technology traineeships represent the fastest-growing segment of the graduate trainee jobs market in 2026. Digital transformation across Nigerian banking, telecommunications, e-commerce, and fintech is driving unprecedented demand for software engineer trainees, IT trainee program participants, and data analyst trainees. Key tech trainee roles available on the finder include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
              <li><strong>Software Engineer Traineeship / Software Development Traineeship:</strong> Entry-level software roles at Nigerian tech firms (Andela, Paystack, Flutterwave, Konga) and multinationals, with structured learning in languages like Python, Java, JavaScript, and Go.</li>
              <li><strong>Trainee Python Jobs / Python Traineeship:</strong> High-demand roles in data engineering, backend development, and automation. Python is the most requested language across Nigerian tech trainee programs in 2026.</li>
              <li><strong>Web Development Traineeship / Frontend Traineeship:</strong> Covers HTML, CSS, React, and Vue.js within structured rotation programs at digital agencies, e-commerce companies, and tech startups.</li>
              <li><strong>Cybersecurity Trainee:</strong> Growing rapidly as Nigerian banks and telcos invest in security infrastructure. Trainee cybersecurity roles often include certifications like CompTIA Security+ as part of the program.</li>
              <li><strong>IT Trainee Program:</strong> Broad technology roles covering networking, systems administration, cloud computing, and helpdesk — ideal for Computer Science and Engineering graduates.</li>
              <li><strong>Traineeship Data Analyst / Trainee Data Scientist:</strong> Entry-level data roles at banks, telcos, and FMCG companies, focusing on SQL, Excel, Power BI, Tableau, and Python analytics stacks.</li>
              <li><strong>Trainee Scrum Master / Scrum Master Traineeship:</strong> Agile-focused roles at software firms and enterprise IT departments, often paired with PSM or CSM certification support.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">How to Apply for Graduate Trainee Jobs in 2026</h3>
            <p className="text-gray-600 leading-relaxed mb-3">
              The application process for graduate trainee programs is more structured than standard job applications. Here's exactly how to approach it:
            </p>
            <ol className="list-decimal pl-6 space-y-3 text-gray-600 mb-6">
              <li><strong>Search and Set Alerts Early:</strong> Graduate trainee programs open on fixed cycles — often January–March and July–September. Use the Graduate & Trainee Jobs Finder on Jobmeter and set real-time alerts for "graduate trainee jobs," "management trainee program," and sector-specific terms like "IT trainee program" or "finance traineeships" so you're notified the moment applications open.</li>
              <li><strong>Tailor Your CV to Each Program:</strong> Include keywords specific to the program — "management trainee," "trainee sales," "frontend traineeship," or "project manager trainee jobs." Highlight academic achievements, extracurricular leadership, and any prior internship experience. ATS systems at Deloitte, Shell, and MTN scan for these terms explicitly.</li>
              <li><strong>Prepare for Aptitude Tests:</strong> Almost all competitive graduate trainee programs require online aptitude tests covering numerical reasoning, verbal reasoning, logical reasoning, and sometimes coding or case analysis. Practice on platforms offering SHL-style tests, and study company-specific formats (L&T graduate engineer trainee, Reliance industries, and Dangote all have published test patterns).</li>
              <li><strong>Master the Assessment Centre:</strong> Top programs like Deloitte trainee program and Shell traineeship use assessment centres with group exercises, presentations, and competency-based interviews. Research the company thoroughly and prepare STAR-method examples for competency questions.</li>
              <li><strong>Prepare a Strong Personal Statement:</strong> For management trainee program applications, write clearly about why you want that specific industry, what rotation interests you most, and your long-term career goals. Generic statements are instantly filtered out by experienced recruiters.</li>
              <li><strong>Apply to Multiple Programs Simultaneously:</strong> The best strategy is to apply to 5–10 programs in your target sector at the same time. Use the Jobmeter finder's saved jobs feature to track all applications in one dashboard.</li>
            </ol>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Skills That Make You Stand Out in Graduate Trainee Applications</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Employers running graduate trainee programs are not necessarily looking for candidates who already know everything — they are looking for candidates with the right foundation to grow rapidly. These are the skills that consistently differentiate successful applicants:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
              <li><strong>Technical Skills by Sector:</strong> For tech trainee roles (trainee Python jobs, IT trainee program, software development traineeship) — demonstrate hands-on coding projects, GitHub contributions, or completed certifications. For finance traineeships — Excel proficiency, financial modelling basics, and accounting software familiarity. For engineering graduate trainee — AutoCAD, project scheduling tools, and hands-on lab work.</li>
              <li><strong>Analytical Thinking:</strong> All management trainee programs and finance traineeships weight analytical ability heavily. Practice numerical reasoning tests and data interpretation exercises consistently in the weeks before applications open.</li>
              <li><strong>Communication and Presentation:</strong> Assessed rigorously in assessment centres. Build confidence with public speaking, whether through campus presentations, debate societies, or volunteer facilitation roles.</li>
              <li><strong>Leadership and Initiative:</strong> Evidence of leading projects, teams, or organizations — even informally — is highly valued. Student union roles, startup projects, community development work, and sports captaincy all count.</li>
              <li><strong>Adaptability and Learning Agility:</strong> Rotational programs by definition require you to perform well in unfamiliar environments quickly. Demonstrate this through diverse academic projects, cross-functional internship experiences, or self-directed skill acquisition.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Graduate Trainee Salaries and Benefits in Nigeria 2026</h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full text-sm text-gray-700 border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Program Type</th>
                    <th className="text-left px-4 py-3 font-semibold">Nigeria (Annual)</th>
                    <th className="text-left px-4 py-3 font-semibold">International (Annual)</th>
                    <th className="text-left px-4 py-3 font-semibold">Key Benefits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Big 4 / Consulting (Deloitte, KPMG)', '₦3.5M–₦6M',   '$50K–$75K', 'Mentorship, certifications, global network'],
                    ['Oil & Gas (Shell, Chevron)',           '₦4M–₦8M',    '$55K–$80K', 'Housing allowance, rotation, pension'],
                    ['Banking (Zenith, Access, GTB)',         '₦2.5M–₦5M',  '$40K–$65K', 'HMO, loans, fast promotion track'],
                    ['FMCG (Unilever, Nestle, Pepsi)',        '₦2.5M–₦5M',  '$45K–$60K', 'International rotations, brand exposure'],
                    ['Telecom (MTN, Airtel)',                '₦3M–₦5.5M',  '$45K–$65K', 'Phone/data allowance, tech training'],
                    ['Tech (Andela, Paystack, Flutterwave)',  '₦3M–₦7M',    '$50K–$80K', 'Remote work options, equity, certifications'],
                    ['Engineering / Construction',           '₦2M–₦4.5M',  '$40K–$55K', 'Site allowances, PPE, project experience'],
                  ].map(([program, nigeria, intl, benefits]) => (
                    <tr key={program} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{program}</td>
                      <td className="px-4 py-3 text-gray-600">{nigeria}</td>
                      <td className="px-4 py-3 text-gray-600">{intl}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{benefits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              <p className="text-gray-600 leading-relaxed mb-6">
              Beyond base salary, the most valuable aspect of graduate trainee programs is the long-term return: 70% of trainees in top Nigerian programs secure permanent roles with accelerated progression tracks. Many advance to analyst, assistant manager, or junior manager level within 2–3 years of completing their traineeship — a trajectory that would typically take 5–7 years through standard entry-level hiring.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Career Progression After a Graduate Trainee Program</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Completing a graduate trainee program is one of the fastest career accelerators available to Nigerian graduates. The structured mentorship, broad departmental exposure, and employer investment in your development set you up for faster advancement than peers who enter via standard entry-level routes.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              A typical progression after a management trainee program might look like: Graduate Trainee → Analyst/Officer (Year 1) → Senior Analyst/Senior Officer (Year 2–3) → Team Lead/Manager (Year 4–5). For technical programs like software engineer traineeship or IT trainee program, the path often runs: Trainee Engineer → Junior Developer → Mid-Level Engineer → Senior Engineer within 3–4 years. Those who begin as a trainee project manager frequently advance to full Project Manager certification (PMP or PRINCE2) and independent project leadership within 3 years of graduation.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Real Experiences from Graduate Trainees</h3>
            <div className="space-y-4 mb-8">
              <blockquote className="border-l-4 border-orange-500 pl-4 py-1 bg-orange-50 rounded-r-xl">
                <p className="text-gray-700 italic">"I applied to the Deloitte trainee program through Jobmeter and got in. The aptitude test practice resources on the platform made a real difference — I was better prepared than most people in the assessment centre."</p>
                <cite className="text-sm text-gray-500 mt-1 block">— Chisom, Audit Trainee, Deloitte Lagos</cite>
              </blockquote>
              <blockquote className="border-l-4 border-blue-500 pl-4 py-1 bg-blue-50 rounded-r-xl">
                <p className="text-gray-700 italic">"Found a Python traineeship at a fintech startup through the graduate finder. Three months in, I'm building real production features — not just running tests. The structured mentorship is exactly what I needed."</p>
                <cite className="text-sm text-gray-500 mt-1 block">— Femi, Software Development Trainee, Lagos Fintech Startup</cite>
              </blockquote>
              <blockquote className="border-l-4 border-green-500 pl-4 py-1 bg-green-50 rounded-r-xl">
                <p className="text-gray-700 italic">"The Shell traineeship alert came through on Jobmeter the day applications opened. I was one of the first to apply and got called for the test within a week. I start my engineering rotation next month."</p>
                <cite className="text-sm text-gray-500 mt-1 block">— Tunde, Graduate Trainee Engineer, Shell Nigeria</cite>
              </blockquote>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Frequently Asked Questions About Graduate Trainee Jobs</h3>
            <div className="space-y-5 mb-8">
              {[
                { q: 'What is a graduate trainee program?', a: 'A graduate trainee program is a structured 12–24 month entry-level role for recent degree holders. It typically includes rotations across multiple departments, structured training, and mentorship — designed to build broad professional skills and identify future leaders within the organization. Top Nigerian programs include Deloitte, Shell, MTN, Zenith Bank, and Unilever.' },
                { q: 'What salary can I expect from a management trainee program in Nigeria?', a: 'Salaries vary by sector. Big 4 and oil & gas programs (Deloitte, Shell, Chevron) offer ₦3.5M–₦8M annually. Banking programs (Access, Zenith, GTBank) pay ₦2.5M–₦5M. Tech traineeships (Andela, Paystack) offer ₦3M–₦7M. International programs at multinationals like Unilever or Google pay $45,000–$75,000 USD annually.' },
                { q: 'Are there graduate trainee jobs in tech?', a: 'Yes — software engineer traineeship, IT trainee program, cybersecurity trainee, Python traineeship, web development traineeship, and data analyst traineeship roles are all actively listed. Tech trainee jobs are the fastest-growing category on the Graduate & Trainee Jobs Finder in 2026.' },
                { q: 'How competitive is the Deloitte trainee program?', a: 'Highly competitive — Deloitte Nigeria receives thousands of applications per cycle. The process includes online aptitude tests (numerical and verbal reasoning), a video interview, a case study, and an assessment centre. Strong academics (minimum second class upper), leadership experience, and aptitude test preparation are essential differentiators.' },
                { q: 'What is the difference between a graduate trainee program and an internship?', a: 'An internship is typically shorter (3–6 months), often unpaid or modestly compensated, and may not lead to permanent employment. A graduate trainee program is a paid, structured 12–24 month commitment with a clear career progression path, mentorship, rotational exposure, and a strong expectation of conversion to a permanent role on completion.' },
                { q: 'Do companies like Shell and Google offer graduate traineeships in Nigeria?', a: 'Yes — Shell traineeship Nigeria is one of the most sought-after engineering and commercial programs in the country. Google runs associate and traineeship programs through its EMEA operations that are accessible to Nigerian candidates, particularly in software engineering and data roles.' },
                { q: 'What skills do I need for trainee coding jobs or software development traineeships?', a: 'Basic programming proficiency in Python, Java, or JavaScript is the most common requirement. Problem-solving ability, understanding of data structures, version control (Git), and a portfolio of personal or academic projects significantly strengthen applications. No prior industry experience is typically required for entry-level software engineer traineeship roles.' },
                { q: 'Are there graduate trainee programs for mature applicants or career changers?', a: 'Many programs welcome mature age traineeship applicants, particularly in sectors like healthcare, finance, legal, and HR. Career changers with transferable skills (project management, data analysis, sales) are often valued for their broader life experience. Some programs explicitly have no upper age limit for applications.' },
                { q: 'How do I find the latest graduate trainee program openings?', a: 'Use the Graduate & Trainee Jobs Finder on Jobmeter and set real-time alerts for "graduate trainee jobs," "management trainee program," and your target sector keywords. Applications for the most competitive programs (Deloitte, Shell, MTN, Unilever) open and close quickly — daily alerts ensure you never miss a cycle.' },
                { q: 'What happens after you complete a graduate trainee program?', a: 'Most trainees are offered permanent positions at the end of the program — typically at analyst, officer, or junior manager level. Career acceleration is significantly faster post-traineeship: most program alumni reach team lead or manager level within 3–5 years, compared to 6–8 years for standard entry-level hires.' },
              ].map(({ q, a }) => (
                <div key={q} className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{q}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>

          </article>
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
                "name": "Graduate & Trainee Jobs Finder — Find Graduate Trainee Programs, Management Trainee Jobs & Tech Traineeships 2026",
                "description": "Discover graduate trainee jobs, management trainee programs, software engineer traineeships, IT trainee programs, finance traineeships, and the best graduate training schemes in Nigeria and worldwide on Jobmeter.",
                "url": "https://jobmeter.app/tools/graduate-trainee-finder",
                "inLanguage": "en",
                "dateModified": new Date().toISOString().split('T')[0],
                "breadcrumb": {
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home",  "item": "https://jobmeter.app" },
                    { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://jobmeter.app/tools" },
                    { "@type": "ListItem", "position": 3, "name": "Graduate & Trainee Jobs Finder", "item": "https://jobmeter.app/tools/graduate-trainee-finder" },
                  ]
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Graduate & Trainee Jobs Finder",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "description": "AI-powered job finder tool for discovering graduate trainee jobs, management trainee programs, software engineer traineeships, IT trainee programs, finance and accounting traineeships, and the best graduate training schemes in Nigeria and worldwide.",
                "url": "https://jobmeter.app/tools/graduate-trainee-finder",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "NGN",
                  "description": "Free to use for all graduate job seekers."
                },
                "featureList": [
                  "Real-time graduate trainee job listings",
                  "Management trainee program filter",
                  "Tech traineeship filter (software, IT, cybersecurity, data)",
                  "Finance and banking trainee filter",
                  "Engineering graduate trainee filter",
                  "Lagos, Abuja, Port Harcourt, and remote filters",
                  "Aptitude test preparation resources",
                  "Application deadline alerts for top programs"
                ],
                "keywords": "graduate trainee jobs, management trainee program, software engineer traineeship, IT trainee program, finance traineeships, Deloitte trainee program, Shell traineeship, Python traineeship, web development traineeship, graduate trainee engineer"
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  { "@type": "Question", "name": "What is a graduate trainee program?", "acceptedAnswer": { "@type": "Answer", "text": "A graduate trainee program is a structured 12–24 month entry-level role for recent degree holders, including rotations across departments, mentorship, and a clear path to permanent employment. Top Nigerian programs include Deloitte, Shell, MTN, Zenith Bank, and Unilever." } },
                  { "@type": "Question", "name": "What salary can I expect from a management trainee program in Nigeria?", "acceptedAnswer": { "@type": "Answer", "text": "Salaries range from ₦2.5M–₦8M annually in Nigeria depending on sector: Big 4 and oil & gas (₦3.5M–₦8M), banking (₦2.5M–₦5M), tech (₦3M–₦7M). International programs pay $45,000–$75,000 USD annually." } },
                  { "@type": "Question", "name": "Are there graduate trainee jobs in tech?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — software engineer traineeship, IT trainee program, Python traineeship, web development traineeship, cybersecurity trainee, and data analyst traineeship roles are all actively listed on the Graduate & Trainee Jobs Finder on Jobmeter." } },
                  { "@type": "Question", "name": "How competitive is the Deloitte trainee program?", "acceptedAnswer": { "@type": "Answer", "text": "Highly competitive — Deloitte Nigeria receives thousands of applications per cycle. The selection process includes online aptitude tests, a video interview, a case study, and an assessment centre. Strong academics (minimum 2:1), leadership evidence, and thorough aptitude test preparation are essential." } },
                  { "@type": "Question", "name": "How do I find the latest graduate trainee program openings?", "acceptedAnswer": { "@type": "Answer", "text": "Use the Graduate & Trainee Jobs Finder on Jobmeter and set real-time alerts for graduate trainee jobs, management trainee program, and your target sector. Programs from Deloitte, Shell, MTN, and Unilever open and close quickly — daily alerts ensure you never miss an application window." } },
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "Related Job Finder Tools on Jobmeter",
                "description": "Other free job finder tools available on jobmeter.app",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Remote Jobs Finder",           "url": "https://jobmeter.app/tools/remote-jobs-finder" },
                  { "@type": "ListItem", "position": 2, "name": "Internship Finder",             "url": "https://jobmeter.app/tools/internship-finder" },
                  { "@type": "ListItem", "position": 3, "name": "NYSC Jobs Finder",              "url": "https://jobmeter.app/tools/nysc-finder" },
                  { "@type": "ListItem", "position": 4, "name": "Jobs with Visa Sponsorship",    "url": "https://jobmeter.app/tools/visa-finder" },
                  { "@type": "ListItem", "position": 5, "name": "Entry Level Jobs Finder",       "url": "https://jobmeter.app/tools/entry-level-finder" },
                ]
              }
            ])
          }}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100" style={{ height: '50px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50px', overflow: 'hidden' }}>
          <AdUnit slot="3349195672" format="auto" style={{ display: 'block', width: '100%', height: '50px', maxHeight: '50px', overflow: 'hidden' }} />
        </div>
      </div>
    </div>
  );
}
