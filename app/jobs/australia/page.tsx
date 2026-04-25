import JobList from '@/components/jobs/JobList';
import { Metadata } from 'next';
import { BreadcrumbListSchema } from '@/components/seo/StructuredData';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobmeter.app';

export const metadata: Metadata = {
  title: 'Jobs in Australia - Find Employment Opportunities | JobMeter',
  description: 'Browse latest job openings in Australia. Find full-time, part-time, and remote jobs across all industries. Apply to top Australian companies today.',
  alternates: {
    canonical: `${siteUrl}/jobs/australia`,
    languages: {
      'en-AU': `${siteUrl}/jobs/australia`,
      'en': `${siteUrl}/jobs/australia`,
    },
  },
};

export default function AustraliaJobsPage() {
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Jobs', url: `${siteUrl}/jobs` },
    { name: 'Australia', url: `${siteUrl}/jobs/australia` },
  ];

  return (
    <>
      <BreadcrumbListSchema items={breadcrumbItems} />

      <JobList initialCountry="Australia" />

      {/* SEO Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Finding Jobs in Australia</h2>
      <p className="text-gray-600 mb-4">Australia's economy is one of the most resilient in the developed world, having recorded nearly three decades of uninterrupted growth before the pandemic and bouncing back strongly since. With a population of 27 million and persistent skills shortages across healthcare, technology, trades, and engineering, Australia actively recruits both domestic and international talent. JobMeter aggregates <strong>current job vacancies in Australia</strong> from verified employers across all states and territories, updated throughout the day.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Top Industries Hiring in Australia</h3>
      <p className="text-gray-600 mb-4">Mining and resources remain the backbone of the Australian economy, with Western Australia's Pilbara region generating massive demand for <strong>FIFO (fly-in fly-out) mining jobs</strong>, engineers, and site operations staff. Healthcare is the largest services employer, with demand for nurses, GPs, specialists, and aged care workers at record levels. Technology is the fastest-growing sector by hiring volume, particularly in Sydney and Melbourne's CBD tech corridors. Construction, education, finance, and renewable energy — driven by Australia's ambitious clean energy transition — are all actively hiring at scale.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Best Cities for Jobs in Australia</h3>
      <p className="text-gray-600 mb-4">Sydney is Australia's financial capital and its largest city, home to the ASX, the big four banks' headquarters, and a thriving technology and media sector. <strong>Jobs in Sydney</strong> span finance, tech, healthcare, media, and professional services. Melbourne is Australia's cultural capital and its most diversified economy — strong in healthcare, finance, education, and manufacturing. Brisbane is a rapidly growing market, buoyed by infrastructure investment ahead of the 2032 Olympics. Perth is the gateway to the mining industry and offers some of the highest wages in the country for technical roles. Adelaide has become a significant centre for defence contracting and space industry jobs.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Australian Work Visas and Skilled Migration</h3>
      <p className="text-gray-600 mb-4">Australia operates a points-based skilled migration system through the <strong>SkillSelect</strong> platform. The <strong>Skilled Independent Visa (subclass 189)</strong> does not require employer sponsorship, while the <strong>Skilled Nominated Visa (subclass 190)</strong> requires state or territory nomination. Employer-sponsored pathways include the <strong>Temporary Skill Shortage Visa (subclass 482)</strong> and the <strong>Employer Nomination Scheme (subclass 186)</strong> for permanent residence. The Skills in Demand Visa replacing the TSS from late 2024 streamlines pathways for critical sectors. Many listings on JobMeter note whether sponsorship is available.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Salary Expectations for Jobs in Australia</h3>
      <p className="text-gray-600 mb-4">Australia has one of the world's highest minimum wages — AUD 23.23 per hour as of 2024. Professional salaries are correspondingly strong. <strong>Software engineers in Sydney or Melbourne</strong> typically earn AUD 100,000–160,000. Registered nurses earn AUD 65,000–90,000, with specialist and regional loadings adding substantially more. Mining engineers and site managers in Western Australia often earn AUD 150,000–200,000 including FIFO allowances. Finance professionals at the major banks earn AUD 80,000–150,000 depending on seniority and function.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Popular Job Searches in Australia</h3>
      <p className="text-gray-600 mb-4">Top searches on JobMeter for Australia include: <strong>software developer jobs in Sydney</strong>, <strong>nursing jobs in Australia for overseas nurses</strong>, <strong>FIFO mining jobs in Western Australia</strong>, <strong>finance jobs in Melbourne</strong>, <strong>construction jobs in Brisbane</strong>, <strong>defence industry jobs in Adelaide</strong>, <strong>remote jobs in Australia</strong>, and <strong>jobs in Australia with visa sponsorship</strong>. All listings are verified and updated daily.</p>

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