import JobList from '@/components/jobs/JobList';
import { Metadata } from 'next';
import { BreadcrumbListSchema } from '@/components/seo/StructuredData';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobmeter.app';

export const metadata: Metadata = {
  title: 'Jobs in New Zealand - Find Employment Opportunities | JobMeter',
  description: 'Browse latest job openings in New Zealand. Find full-time, part-time, and remote jobs across all industries. Apply to top New Zealand companies today.',
  alternates: {
    canonical: `${siteUrl}/jobs/new-zealand`,
    languages: {
      'en-NZ': `${siteUrl}/jobs/new-zealand`,
      'en': `${siteUrl}/jobs/new-zealand`,
    },
  },
};

export default function NewZealandJobsPage() {
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Jobs', url: `${siteUrl}/jobs` },
    { name: 'New Zealand', url: `${siteUrl}/jobs/new-zealand` },
  ];

  return (
    <>
      <BreadcrumbListSchema items={breadcrumbItems} />

      <JobList initialCountry="New Zealand" />

      {/* SEO Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Finding Jobs in New Zealand</h2>
      <p className="text-gray-600 mb-4">New Zealand offers an exceptional quality of life alongside a robust and growing job market. With a population of five million and significant skills shortages across healthcare, construction, engineering, and technology, New Zealand actively recruits internationally and offers transparent pathways for skilled migrants. JobMeter aggregates <strong>current job vacancies in New Zealand</strong> from verified employers across the North and South Islands, updated daily.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Top Industries Hiring in New Zealand</h3>
      <p className="text-gray-600 mb-4">Healthcare is New Zealand's most critical hiring sector, with persistent shortages of nurses, GPs, specialists, and allied health professionals driving active international recruitment. Construction and infrastructure are booming, fuelled by a national housing shortage and significant government infrastructure investment. Technology is growing rapidly, with Auckland and Wellington developing strong startup and scale-up ecosystems. Agriculture, food production, and agritech underpin the export economy. Education, tourism, and the public service are also consistent employers.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Best Cities for Jobs in New Zealand</h3>
      <p className="text-gray-600 mb-4">Auckland is New Zealand's largest city and commercial capital, accounting for around a third of the national workforce. <strong>Jobs in Auckland</strong> are most abundant in technology, finance, professional services, and healthcare. Wellington, the capital, is home to the central government, public service, and a growing technology and creative sector. Christchurch is the South Island's economic hub, with strong construction, engineering, and agricultural sectors. Hamilton and Tauranga are fast-growing cities with increasing employment in logistics, manufacturing, and agribusiness.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">New Zealand Work Visas and Immigration</h3>
      <p className="text-gray-600 mb-4">New Zealand's <strong>Skilled Migrant Category Resident Visa</strong> uses a points-based system for permanent residency. The <strong>Accredited Employer Work Visa (AEWV)</strong> is the primary temporary work visa, requiring a job offer from an Immigration New Zealand-accredited employer. Many healthcare roles qualify for <strong>straight-to-residence</strong> pathways given the severity of shortages. The <strong>Green List</strong> identifies occupations in highest demand, offering faster residency processing. Many listings on JobMeter note whether New Zealand work visa support is available.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Salary Expectations for Jobs in New Zealand</h3>
      <p className="text-gray-600 mb-4">New Zealand's minimum wage is NZD $23.15 per hour. <strong>Software engineers in Auckland</strong> typically earn NZD $90,000–$130,000. Registered nurses earn NZD $58,000–$85,000, with rural and specialist loadings. Construction project managers earn NZD $100,000–$150,000. Finance professionals at major New Zealand banks earn NZD $70,000–$120,000. Salaries are generally lower than Australia but offset by lower living costs outside Auckland and an exceptional natural environment and lifestyle.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Popular Job Searches in New Zealand</h3>
      <p className="text-gray-600 mb-4">Top searches on JobMeter for New Zealand include: <strong>nursing jobs in New Zealand for overseas nurses</strong>, <strong>software developer jobs in Auckland</strong>, <strong>construction jobs in Christchurch</strong>, <strong>government jobs in Wellington</strong>, <strong>agriculture jobs in New Zealand</strong>, <strong>jobs in New Zealand with visa sponsorship</strong>, <strong>remote jobs in New Zealand</strong>, and <strong>healthcare jobs in New Zealand for international applicants</strong>. All listings are verified and updated daily.</p>

        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100" style={{ height: '50px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50px', overflow: 'hidden' }}>
          <AdUnit slot="3349195672" format="auto" style={{ display: 'block', width: '100%', height: '50px', maxHeight: '50px', overflow: 'hidden' }} />
        </div>
      </div>
    </>
  );
}