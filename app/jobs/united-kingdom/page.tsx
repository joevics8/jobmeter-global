import JobList from '@/components/jobs/JobList';
import { Metadata } from 'next';
import { BreadcrumbListSchema } from '@/components/seo/StructuredData';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.global.jobmeter.app';

export const metadata: Metadata = {
  title: 'Jobs in United Kingdom - Find Employment Opportunities | JobMeter',
  description: 'Browse latest job openings in the United Kingdom. Find full-time, part-time, and remote jobs across all industries. Apply to top UK companies today.',
  alternates: {
    canonical: `${siteUrl}/jobs/united-kingdom`,
    languages: {
      'en-GB': `${siteUrl}/jobs/united-kingdom`,
      'en': `${siteUrl}/jobs/united-kingdom`,
    },
  },
};

export default function UKJobsPage() {
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Jobs', url: `${siteUrl}/jobs` },
    { name: 'United Kingdom', url: `${siteUrl}/jobs/united-kingdom` },
  ];

  return (
    <>
      <BreadcrumbListSchema items={breadcrumbItems} />

      <JobList initialCountry="United Kingdom" />

      {/* SEO Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Finding Jobs in the United Kingdom</h2>
      <p className="text-gray-600 mb-4">The United Kingdom is one of Europe's most dynamic job markets, with London ranking among the top three global cities for employment opportunities alongside New York and Singapore. The UK economy spans financial services, creative industries, technology, manufacturing, healthcare, and one of the world's most active startup ecosystems. JobMeter aggregates <strong>current job vacancies in the UK</strong> from verified employers across England, Scotland, Wales, and Northern Ireland, refreshed throughout the day.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Top Industries Hiring in the UK</h3>
      <p className="text-gray-600 mb-4">Financial services remains the UK's most globally significant industry, with London's Square Mile and Canary Wharf hosting major banks, insurers, asset managers, and fintech firms. The NHS is the largest single employer in the country, making <strong>healthcare jobs in the UK</strong> — including nursing, allied health, and medical administration — perennially in demand. The UK technology sector, centred in London's Tech City and expanding into Manchester, Bristol, and Edinburgh, generates tens of thousands of <strong>software developer jobs</strong>, <strong>data engineer roles</strong>, and <strong>cybersecurity positions</strong> annually. Creative industries, legal services, and the public sector round out the major employment categories.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Best Cities for Jobs in the UK</h3>
      <p className="text-gray-600 mb-4">London dominates UK employment, accounting for roughly 20% of all jobs in the country. It leads in finance, law, media, tech, and professional services. Manchester is the UK's second city for employment, with a thriving digital and creative sector, strong retail and logistics base, and growing financial services hub. Birmingham, the UK's second most populous city, is a major manufacturing and professional services centre undergoing significant regeneration. Edinburgh is Scotland's financial capital and a fast-growing tech hub. Bristol leads in aerospace, engineering, and the creative sector. Leeds is one of the UK's most important financial centres outside London.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">UK Visa and Work Authorisation</h3>
      <p className="text-gray-600 mb-4">International candidates searching for <strong>Skilled Worker visa sponsored jobs in the UK</strong> will find opportunities across healthcare, technology, engineering, and finance. The UK Skilled Worker visa replaced the Tier 2 work visa post-Brexit and requires a job offer from an approved sponsor at or above the relevant salary threshold. The <strong>Health and Care Worker visa</strong> provides a fast-track route for medical professionals. Commonwealth nationals and those with British ancestry may have additional rights. Many UK listings on JobMeter indicate sponsorship availability directly in the job details.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Salary Expectations for Jobs in the UK</h3>
      <p className="text-gray-600 mb-4">The UK National Living Wage is £11.44 per hour as of 2024, but professional salaries vary significantly. Graduate roles typically start between £24,000 and £35,000 per year. <strong>Software engineers in London</strong> with three to five years' experience typically earn £65,000–£100,000. Investment banking analysts at bulge-bracket firms start at £60,000–£80,000 before bonuses. NHS nurses earn £28,000–£43,000 depending on band and location, with London weighting adding a supplement. Senior marketing managers at major brands earn £55,000–£90,000. Salaries in London are typically 15–25% higher than equivalent roles elsewhere in the UK.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Remote and Hybrid Jobs in the UK</h3>
      <p className="text-gray-600 mb-4">The UK has one of the highest rates of hybrid working adoption in Europe. <strong>Hybrid jobs in London</strong> typically require two to three days in the office per week, while fully remote roles are common in software development, digital marketing, content, and customer success. Many UK employers now advertise roles as location-flexible, opening positions to candidates across the country. JobMeter's filters allow you to search specifically for remote, hybrid, or on-site roles across any UK region.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Popular Job Searches in the UK</h3>
      <p className="text-gray-600 mb-4">Top searches on JobMeter for the UK include: <strong>software engineer jobs in London</strong>, <strong>NHS nursing jobs 2024</strong>, <strong>graduate jobs in Manchester</strong>, <strong>finance analyst jobs in Edinburgh</strong>, <strong>remote marketing jobs UK</strong>, <strong>data scientist jobs in Bristol</strong>, <strong>project manager jobs in Birmingham</strong>, and <strong>legal jobs in London</strong>. All listings are verified and updated daily.</p>

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