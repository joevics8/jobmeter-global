import { theme } from '@/lib/theme';
import { Home, Briefcase, Globe, GraduationCap, Award, Rocket, ClipboardList, Wifi } from 'lucide-react';
import { AccommodationFinderClient } from './AccommodationFinderClient';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

export default function AccommodationFinderPage() {
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
            <Home size={32} />
            <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.light }}>
              Jobs with Accommodation
            </h1>
          </div>
          <p className="text-sm" style={{ color: theme.colors.text.light }}>
            Find jobs that offer accommodation benefits
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm flex-shrink-0">1</div>
              <p className="text-sm text-gray-600">Search by job title, skill, or company</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm flex-shrink-0">2</div>
              <p className="text-sm text-gray-600">Filter by sector and location</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm flex-shrink-0">3</div>
              <p className="text-sm text-gray-600">Find jobs with housing benefits</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm flex-shrink-0">4</div>
              <p className="text-sm text-gray-600">Apply and save on commute</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ad 1: Display Top - After How It Works */}
      <div className="px-4 md:px-6 py-6 max-w-7xl mx-auto">
        <AdUnit slot="4198231153" format="auto" />
      </div>

      <div className="px-4 md:px-6 py-6 max-w-7xl mx-auto">
        {/* Client Island */}
        <AccommodationFinderClient />

        {/* ── Related Tools ── */}
        <div className="mt-12 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Explore More Job Finder Tools</h2>
          <p className="text-sm text-gray-500 mb-6">Other free tools to help you find the right opportunity faster</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { title: 'Remote Jobs',             description: 'Find remote job opportunities in Nigeria and worldwide',           icon: Wifi,          color: '#06B6D4', route: '/tools/remote-jobs-finder' },
              { title: 'Internship Finder',        description: 'Find internship opportunities to kickstart your career',           icon: Briefcase,     color: '#2563EB', route: '/tools/internship-finder' },
              { title: 'NYSC Jobs',               description: 'Find job opportunities for NYSC corpers',                          icon: Award,         color: '#10B981', route: '/tools/nysc-finder' },
              { title: 'Jobs with Visa Sponsorship', description: 'Find jobs that offer visa sponsorship and work permits',         icon: Globe,         color: '#3B82F6', route: '/tools/visa-finder' },
              { title: 'Graduate & Trainee Jobs', description: 'Find graduate programs and trainee positions for fresh graduates',  icon: GraduationCap, color: '#2563EB', route: '/tools/graduate-trainee-finder' },
              { title: 'Entry Level Jobs',        description: 'Find entry-level jobs for beginners starting their career',         icon: Rocket,        color: '#6366F1', route: '/tools/entry-level-finder' },
              { title: 'Quiz Platform',           description: 'Practice aptitude tests and theory questions',                     icon: ClipboardList, color: '#F59E0B', route: '/tools/quiz' },
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
              Jobs with Accommodation Finder: Discover Jobs That Provide Housing, Jobs with Room and Board, and Jobs Abroad with Accommodation in 2026
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Searching for jobs with accommodation can completely transform your financial situation and career trajectory — especially if you&apos;re relocating, starting fresh, or simply want to eliminate housing costs. The Jobs with Accommodation Finder is the most comprehensive tool for discovering jobs that provide housing, jobs with housing included, jobs that offer housing benefits, and jobs that pay to relocate and provide housing. Whether you&apos;re looking for warehouse jobs near me, care homes jobs, seasonal roles abroad, or housing management positions, this platform connects you with verified listings that match your skills and location — including Lagos, Abuja, Port Harcourt, and opportunities worldwide.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Why Jobs with Housing Included Are Worth Pursuing in 2026</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The cost of renting in Nigerian cities and globally has risen sharply. For many professionals and entry-level workers, jobs with accommodation represent a strategic financial advantage — enabling you to save 30–50% of your income that would otherwise go to rent, utilities, and commuting. Beyond the savings, these roles offer stability, especially for those relocating to a new city or country where housing markets are unfamiliar.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Jobs that provide housing for employees are common in sectors like warehousing and logistics, healthcare and care homes, hospitality, property management, seasonal tourism, and international placements. Both experienced professionals and no-experience seekers can access them — from entry-level warehouse jobs with dorm accommodation to senior house manager jobs with private quarters included.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              The Jobs with Accommodation Finder aggregates all of these listings into one searchable platform, with real-time filters for sector, location, experience level, and whether housing is fully free or subsidized. It&apos;s the most targeted internship and jobs-with-housing search engine for Nigerian and global candidates in 2026.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Top Industries Offering Jobs with Accommodation</h3>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Warehouse and Logistics Jobs with Housing</h4>
            <p className="text-gray-600 leading-relaxed mb-4">
              Warehouse jobs and warehouse jobs near me consistently rank among the highest-searched roles for jobs with room and board. Employers such as Amazon, DHL, and major Nigerian logistics firms provide shared dormitory-style housing near facilities for warehouse manager positions and entry-level picking, packing, and sorting roles. Benefits often include free utilities and staff transport. Salaries start around ₦80,000–₦150,000/month locally or $15–25/hour USD for international warehouse work positions.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              No experience? Target warehouse jobs near me that include on-the-job training programs — many of these roles are specifically designed for first-time workers and include accommodation as an incentive. Warehouse work in logistics hubs is one of the fastest entry points into the formal job market for anyone searching &quot;jobs with housing included no experience.&quot;
            </p>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Care Homes Jobs and Senior Living Opportunities</h4>
            <p className="text-gray-600 leading-relaxed mb-4">
              Care homes jobs near me and care homes near me with vacancies are among the most reliable sources for live-in employment. Roles covering caregiving, nursing support, care home cleaning jobs, and home support worker jobs frequently include private or shared on-site rooms in retirement homes and senior living facilities. Organizations like Anchor Care Homes advertise Anchor Care Homes jobs with full room-and-board packages, meals, and utility coverage.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Senior home care jobs and retirement home jobs near me suit compassionate and patient individuals. They are particularly accessible for candidates with minimal formal experience — care at home jobs and senior living jobs near me frequently list &quot;no prior care experience required&quot; alongside their housing benefits. Expected compensation ranges from £11–£16/hour in the UK or equivalent international rates, plus the value of free accommodation.
            </p>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Hospitality, Coffee Shops, and Food Service</h4>
            <p className="text-gray-600 leading-relaxed mb-4">
              Coffee shops hiring near me and coffee shop jobs near me see significant seasonal surges in search volume. Operators like Waffle House are known for offering housing stipends for staff working remote or high-demand shifts — Waffle House jobs and Waffle House hiring listings remain perennially popular for this reason. Hotel housekeeping jobs, house keeping jobs, and house keeper jobs in resort properties frequently bundle room-and-board with their employment packages, especially for candidates willing to relocate to tourist destinations.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Apartments hiring near me in property services also represent an overlooked niche — property companies recruit live-in concierge, maintenance, and management staff with free units included as part of their compensation.
            </p>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Real Estate, Housing Management, and Property Jobs</h4>
            <p className="text-gray-600 leading-relaxed mb-4">
              Real estate hiring and real estate job listings in property management are a strong source of jobs that supply housing. Roles such as house manager, resident assistant jobs near me, housing officer jobs, and in-house counsel jobs for property firms often include free or heavily subsidized accommodation as a core benefit — the logic being that managers who live on-site provide better oversight.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Specialized housing organization roles include housing authority jobs, NYCHA jobs, HUD jobs, social housing jobs, and affordable housing jobs. UK-focused listings frequently include Anchor Housing jobs, Sanctuary Housing jobs, and Housing 21 jobs — all of which historically offer staff accommodation in select roles. For property-adjacent professionals, new homes sales jobs and housing specialist positions with live-in perks are also surfaced by this tool.
            </p>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Seasonal Jobs and International Opportunities with Accommodation</h4>
            <p className="text-gray-600 leading-relaxed mb-4">
              Seasonal jobs with housing spike in demand during tourism seasons, agricultural harvests, and festival periods. Jobs abroad with accommodation are particularly appealing for adventurous candidates — programs covering au pair placements, English teaching abroad, cruise ship work, and Workaway-style farm stays combine travel with free housing and often meals.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Other niche categories include house painting vacancies, home renovation jobs, greenhouse jobs, green house jobs, and even creative positions like publishing house jobs, Royal Opera House jobs, and Biltmore House jobs. The Jobs with Accommodation Finder surfaces these niche listings alongside mainstream roles, ensuring nothing is missed.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Jobs with Accommodation by Category — Quick Reference</h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full text-sm text-gray-700 border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-teal-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Sector</th>
                    <th className="text-left px-4 py-3 font-semibold">Example Roles</th>
                    <th className="text-left px-4 py-3 font-semibold">Accommodation Type</th>
                    <th className="text-left px-4 py-3 font-semibold">Experience Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Warehouse & Logistics',   'Warehouse jobs, warehouse manager, warehouse work',              'Shared dormitory, free utilities',  'None to low'],
                    ['Care & Healthcare',        'Care homes jobs, senior home care jobs, home support worker',   'On-site private/shared room, meals', 'None to mid'],
                    ['Hospitality',             'Coffee shop jobs, housekeeping jobs, house keeper jobs',         'Staff accommodation, hostel room',  'None to low'],
                    ['Property Management',     'House manager, resident assistant, housing officer jobs',        'Live-in apartment or unit',         'Mid to senior'],
                    ['Housing Organisations',   'Housing authority jobs, social housing jobs, NYCHA jobs',        'Staff housing near site',           'Mid level'],
                    ['Seasonal & International','Seasonal jobs with housing, jobs abroad with accommodation',     'Varies — dorm, host family, cabin',  'None required'],
                    ['Real Estate',             'Real estate hiring, new homes sales jobs, housing specialist',   'Live-in property or allowance',     'Mid to senior'],
                    ['Domestic & Home Services','Home cleaning jobs, home sitter jobs, private home help jobs',   'Live-in private room',              'None to low'],
                  ].map(([sector, roles, accommodation, experience]) => (
                    <tr key={sector} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{sector}</td>
                      <td className="px-4 py-3 text-gray-600">{roles}</td>
                      <td className="px-4 py-3 text-gray-600">{accommodation}</td>
                      <td className="px-4 py-3 text-gray-600">{experience}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">How the Jobs with Accommodation Finder Works</h3>
            <p className="text-gray-600 leading-relaxed mb-3">Using the tool is straightforward and takes under two minutes to get your first results:</p>
            <ol className="list-decimal pl-6 space-y-3 text-gray-600 mb-6">
              <li><strong>Search by Keyword:</strong> Enter terms like &quot;jobs with housing,&quot; &quot;jobs that provide housing for employees,&quot; &quot;warehouse jobs near me,&quot; or &quot;care homes job vacancies near me&quot; to surface targeted results.</li>
              <li><strong>Apply Filters:</strong> Narrow down by sector (Healthcare, Logistics, Hospitality), location (Lagos, Abuja, Remote), or experience level (&quot;jobs with housing included no experience&quot; mode for beginners).</li>
              <li><strong>Review Listings:</strong> Each result shows salary, housing benefit type (free vs. subsidized), accommodation details, and direct apply links — no guessing involved.</li>
              <li><strong>Save and Apply:</strong> Bookmark your favorites and apply directly. Set alerts for new &quot;jobs that offer housing&quot; listings in your target sector so you&apos;re always first to apply.</li>
              <li><strong>Track Progress:</strong> Monitor all applications in your dashboard, from cleaning company hiring near me submissions to housing association jobs you&apos;ve shortlisted.</li>
            </ol>
            <p className="text-gray-600 leading-relaxed mb-6">
              The platform is powered by real-time data and covers a wide range of roles — from home cleaning jobs near me, house cleaning jobs, and home sitter jobs near me to private home help jobs and in-house legal jobs. For Lagos users specifically, the tool surfaces hyper-local listings alongside international opportunities for full coverage.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Financial Benefits of Jobs That Provide Housing</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The financial case for jobs with accommodation is compelling, especially in 2026 as rental markets tighten globally. Consider the math: the average one-bedroom apartment in Lagos costs ₦600,000–₦1,500,000/year. A job with housing included effectively adds that entire amount back to your annual earnings — making a lower base salary role with housing potentially more lucrative than a higher-paying role without it.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
              <li><strong>Zero Rent Costs:</strong> Jobs that supply housing eliminate your single largest living expense.</li>
              <li><strong>Reduced Commuting:</strong> On-site staff housing cuts transport costs and commute time significantly.</li>
              <li><strong>Faster Savings Growth:</strong> With rent covered, every paycheck goes directly to savings, debt payoff, or investment — especially valuable for jobs that pay to relocate and provide housing internationally.</li>
              <li><strong>Easier Relocation:</strong> Jobs abroad with accommodation handle the hardest part of moving — finding somewhere to live — before you even arrive.</li>
              <li><strong>Lower Cost of Living Overall:</strong> Many care homes jobs, warehouse work roles, and seasonal jobs with housing also include meals and utilities — further compounding the financial advantage.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Real-World Examples of Jobs with Housing Included</h3>
            <div className="space-y-4 mb-8">
              <blockquote className="border-l-4 border-teal-500 pl-4 py-1 bg-teal-50 rounded-r-xl">
                <p className="text-gray-700 italic">&quot;Found a warehouse job near me that included free accommodation and transport. I saved ₦800,000 in rent in my first year — it completely changed my financial situation.&quot;</p>
                <cite className="text-sm text-gray-500 mt-1 block">— Emeka, Warehouse Operative, Lagos</cite>
              </blockquote>
              <blockquote className="border-l-4 border-blue-500 pl-4 py-1 bg-blue-50 rounded-r-xl">
                <p className="text-gray-700 italic">&quot;I searched &apos;care homes jobs near me with housing&apos; and found a live-in caregiver role in the UK within two weeks. The room and board package made it worth relocating from Nigeria.&quot;</p>
                <cite className="text-sm text-gray-500 mt-1 block">— Blessing, Live-in Caregiver, UK</cite>
              </blockquote>
              <blockquote className="border-l-4 border-purple-500 pl-4 py-1 bg-purple-50 rounded-r-xl">
                <p className="text-gray-700 italic">&quot;Got a seasonal job with housing in a resort — six months of free accommodation plus salary. I came back with more savings than I&apos;d managed in three years of renting.&quot;</p>
                <cite className="text-sm text-gray-500 mt-1 block">— Adaeze, Seasonal Resort Worker, Portugal</cite>
              </blockquote>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Tips for Landing Jobs with Accommodation</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
              <li><strong>Tailor Your Resume:</strong> Include keywords like &quot;jobs that provide housing,&quot; &quot;live-in role,&quot; and &quot;accommodation included&quot; in your profile so employers searching for flexible candidates find you first.</li>
              <li><strong>Apply Early:</strong> Seasonal jobs with housing and jobs abroad with accommodation fill quickly — set real-time alerts and apply the day listings go live.</li>
              <li><strong>Highlight Reliability:</strong> Employers offering housing want dependable staff who will commit. Emphasize stability and long-term interest in your cover letters for house manager jobs near me, care homes jobs, or warehouse work.</li>
              <li><strong>Check Visa Requirements:</strong> For jobs abroad with accommodation, confirm eligibility before applying. Many international roles require specific work permits — the platform flags visa sponsorship availability where relevant.</li>
              <li><strong>Network for Niche Roles:</strong> In-house lawyer jobs, in-house legal jobs, and housing association jobs are often filled via referral. Connect with professionals in those industries on LinkedIn while using the finder for broad coverage.</li>
              <li><strong>Consider Location Flexibility:</strong> The best jobs with housing included are often in non-central locations — logistics hubs, care facilities, or rural resorts. Being open to &quot;warehouse jobs near me&quot; outside major cities significantly expands your options.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Jobs with Accommodation in Nigeria — Local Opportunities</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Within Nigeria, jobs with accommodation span sectors including logistics warehouses in Lagos and Ogun State, care and home support roles in Abuja and Port Harcourt, domestic staffing (private home help jobs, home sitter jobs near me) for high-net-worth households, and property management roles in gated estates. Many hospitality businesses — hotels, resorts, and serviced apartments — also provide staff housing.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              The Jobs with Accommodation Finder specifically surfaces these local Nigerian listings alongside international roles, making it the only platform you need whether you&apos;re searching for jobs with housing included locally or planning to relocate abroad with accommodation provided.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Frequently Asked Questions About Jobs with Accommodation</h3>
            <div className="space-y-5 mb-8">
              {[
                { q: 'What are jobs with accommodation?', a: 'Jobs with accommodation are roles where the employer provides free or subsidized housing as part of the compensation package. This includes jobs with housing included, jobs with room and board, live-in care roles, seasonal positions, and jobs that pay to relocate and provide housing.' },
                { q: 'Are there jobs with housing included with no experience required?', a: 'Yes — many warehouse jobs near me, care homes jobs, housekeeping roles, and domestic service positions (house cleaning jobs, home sitter jobs) are explicitly listed as jobs with housing included no experience. These are ideal for first-time workers.' },
                { q: 'What seasonal jobs provide accommodation?', a: 'Seasonal jobs with housing are common in tourism resorts, agricultural farms, national parks, ski lodges, and cruise ships. Many also include meals. Search "seasonal jobs with housing" in the finder for current openings.' },
                { q: 'How do I find jobs abroad with accommodation?', a: 'Use the "International" filter in the Jobs with Accommodation Finder to surface jobs abroad with accommodation across the UK, Europe, Canada, Australia, and beyond. Programs include au pair placements, resort work, care home recruitment, and teaching roles.' },
                { q: 'Do care homes jobs near me typically include housing?', a: 'Yes — many care homes near me with vacancies offer on-site accommodation, particularly for live-in caregivers, support workers, and maintenance staff. Anchor Care Homes jobs, Sanctuary Housing jobs, and retirement home jobs near me are known for this.' },
                { q: 'Can I find warehouse jobs with housing near me?', a: 'Absolutely. Warehouse jobs near me in logistics hubs — particularly near ports, industrial zones, and distribution centres — frequently include dormitory-style housing as a recruitment incentive, especially for shift workers and relocating candidates.' },
                { q: 'What real estate jobs include accommodation?', a: 'House manager jobs, resident assistant jobs near me, housing officer jobs, and live-in property concierge roles all typically include free or heavily discounted accommodation. Housing association jobs, NYCHA jobs, and HUD jobs also offer staff housing in certain roles.' },
                { q: 'How do housing manager jobs work?', a: 'Housing manager and house manager jobs involve overseeing residential properties, facilities, or estates. These roles almost always include a live-in component with private accommodation provided, making them one of the most financially advantageous jobs that supply housing.' },
                { q: 'Are there jobs with accommodation for domestic workers?', a: 'Yes — private home help jobs, home sitter jobs near me, live-in housekeeper positions, and home cleaning jobs near me are frequently listed with accommodation provided, particularly in high-net-worth households in Lagos, Abuja, and internationally.' },
                { q: 'What are the best websites to find jobs with housing included?', a: 'The Jobs with Accommodation Finder is the most targeted tool for this search — combining real-time listings, verified accommodation details, and sector/location filters that generic job boards like Indeed or LinkedIn don\'t offer for this specific benefit category.' },
              ].map(({ q, a }) => (
                <div key={q} className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{q}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>

          </article>
        </div>

        {/* ── Schema Markup ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": "Jobs with Accommodation Finder — Find Jobs That Provide Housing, Care Homes Jobs & Warehouse Jobs with Housing 2026",
                "description": "Discover jobs with accommodation, jobs with housing included, care homes jobs near me, warehouse jobs near me, seasonal jobs with housing, and jobs abroad with accommodation. The best tool for finding jobs that provide housing in Nigeria and worldwide.",
                "url": "https://remote.jobmeter.app/tools/accommodation-finder",
                "inLanguage": "en",
                "dateModified": new Date().toISOString().split('T')[0],
                "breadcrumb": {
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home",  "item": "https://remote.jobmeter.app" },
                    { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://remote.jobmeter.app/tools" },
                    { "@type": "ListItem", "position": 3, "name": "Jobs with Accommodation Finder", "item": "https://remote.jobmeter.app/tools/accommodation-finder" },
                  ]
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Jobs with Accommodation Finder",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "description": "AI-powered job finder tool for discovering jobs with accommodation, jobs with housing included, care homes jobs, warehouse jobs, seasonal jobs with housing, jobs abroad with accommodation, and jobs that provide housing for employees in Nigeria and worldwide.",
                "url": "https://remote.jobmeter.app/tools/accommodation-finder",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "NGN",
                  "description": "Free to use for all job seekers."
                },
                "featureList": [
                  "Real-time jobs with accommodation listings",
                  "Care homes jobs near me filter",
                  "Warehouse jobs with housing filter",
                  "Seasonal jobs with housing filter",
                  "Jobs abroad with accommodation filter",
                  "No-experience jobs with housing filter",
                  "Housing type detail (free vs subsidized) per listing",
                  "Nigeria-specific and international coverage"
                ],
                "keywords": "jobs with accommodation, jobs with housing included, care homes jobs near me, warehouse jobs near me, seasonal jobs with housing, jobs abroad with accommodation, jobs that provide housing, jobs with room and board"
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  { "@type": "Question", "name": "What are jobs with accommodation?", "acceptedAnswer": { "@type": "Answer", "text": "Jobs with accommodation are roles where the employer provides free or subsidized housing as part of the compensation package, including jobs with housing included, live-in care roles, warehouse jobs with dormitory housing, and jobs that pay to relocate and provide housing." } },
                  { "@type": "Question", "name": "Are there jobs with housing included with no experience?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — warehouse jobs near me, care homes jobs, housekeeping roles, and domestic service positions frequently list 'no experience required' alongside their housing inclusion. These are ideal entry points for first-time workers." } },
                  { "@type": "Question", "name": "How do I find jobs abroad with accommodation?", "acceptedAnswer": { "@type": "Answer", "text": "Use the International filter in the Jobs with Accommodation Finder to surface jobs abroad with accommodation across the UK, Europe, Canada, and Australia, including au pair placements, resort work, care home roles, and teaching positions." } },
                  { "@type": "Question", "name": "Do care homes jobs near me include housing?", "acceptedAnswer": { "@type": "Answer", "text": "Many care homes near me with vacancies offer on-site accommodation for live-in caregivers and support workers. Anchor Care Homes jobs and retirement home jobs near me are well known for room-and-board packages." } },
                  { "@type": "Question", "name": "What seasonal jobs provide accommodation?", "acceptedAnswer": { "@type": "Answer", "text": "Seasonal jobs with housing are common in tourism resorts, farms, national parks, ski lodges, and cruise ships. Many include meals. Use the seasonal filter in Jobs with Accommodation Finder to see current openings." } },
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "Related Job Finder Tools",
                "description": "Other free job finder tools on the platform",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Remote Jobs Finder",         "url": "https://remote.jobmeter.app/tools/remote-jobs-finder" },
                  { "@type": "ListItem", "position": 2, "name": "Internship Finder",           "url": "https://remote.jobmeter.app/tools/internship-finder" },
                  { "@type": "ListItem", "position": 3, "name": "NYSC Jobs Finder",            "url": "https://remote.jobmeter.app/tools/nysc-finder" },
                  { "@type": "ListItem", "position": 4, "name": "Jobs with Visa Sponsorship",  "url": "https://remote.jobmeter.app/tools/visa-finder" },
                  { "@type": "ListItem", "position": 5, "name": "Entry Level Jobs Finder",     "url": "https://remote.jobmeter.app/tools/entry-level-finder" },
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
