import JobList from '@/components/jobs/JobList';
import { Metadata } from 'next';
import { BreadcrumbListSchema } from '@/components/seo/StructuredData';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobmeter.app';

export const metadata: Metadata = {
  title: 'Jobs in France - Find Employment Opportunities | JobMeter',
  description: 'Browse latest job openings in France. Find full-time, part-time, and remote jobs across all industries. Apply to top French companies today.',
  alternates: {
    canonical: `${siteUrl}/jobs/france`,
    languages: {
      'fr': `${siteUrl}/jobs/france`,
      'en': `${siteUrl}/jobs/france`,
    },
  },
};

export default function FranceJobsPage() {
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Jobs', url: `${siteUrl}/jobs` },
    { name: 'France', url: `${siteUrl}/jobs/france` },
  ];

  return (
    <>
      <BreadcrumbListSchema items={breadcrumbItems} />

      <JobList initialCountry="France" />

      {/* SEO Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Finding Jobs in France</h2>
      <p className="text-gray-600 mb-4">France is the seventh-largest economy in the world and one of Europe's most important job markets, with over 28 million employed workers. Home to some of the world's most recognised luxury brands, aerospace companies, financial institutions, and a rapidly growing technology sector, France offers diverse professional opportunities across every discipline. JobMeter aggregates <strong>current job vacancies in France</strong> from verified employers across all major regions, updated daily.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Top Industries Hiring in France</h3>
      <p className="text-gray-600 mb-4">Luxury and consumer goods is one of France's most globally significant sectors — LVMH, Kering, L'Oréal, and Hermès collectively employ hundreds of thousands and hire continuously in marketing, supply chain, retail, and creative roles. Aerospace and defence is concentrated in Toulouse, home to Airbus, and generates thousands of <strong>engineering jobs in France</strong> annually. Technology is rapidly expanding, with Paris's Station F tech campus and La Défense business district hosting major European tech operations. Financial services, healthcare, and France's extensive public sector also represent major employers.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Best Cities for Jobs in France</h3>
      <p className="text-gray-600 mb-4">Paris is by far the dominant employment centre, accounting for roughly 25% of all French GDP and housing the headquarters of nearly every major French corporation. <strong>Jobs in Paris</strong> span every industry, from luxury goods and finance to technology, media, and international organisations like UNESCO and the OECD. Lyon is France's second city for business, with strong pharmaceutical, biotech, and logistics sectors. Toulouse is the European aerospace capital, home to Airbus's global headquarters and an extensive supplier network. Bordeaux and Nantes are fast-growing cities with emerging tech and digital sectors.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Working in France as an International Professional</h3>
      <p className="text-gray-600 mb-4">EU and EEA nationals have full rights to work in France without a visa. Non-EU professionals require a work permit, typically tied to an employer sponsorship. The <strong>Talent Passport (Passeport Talent)</strong> is France's premier skilled worker visa, covering highly qualified employees, researchers, company founders, and internationally recognised experts. Many multinational companies in Paris hire English-speaking professionals for roles that do not require French, particularly in technology, consulting, and finance. Learning French significantly expands your opportunities across the broader French job market.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Salary Expectations for Jobs in France</h3>
      <p className="text-gray-600 mb-4">France's minimum wage (SMIC) is €11.65 per hour. Professional salaries vary by sector and city. <strong>Software engineers in Paris</strong> typically earn €50,000–€80,000. Finance professionals at major Parisian banks earn €60,000–€120,000. Aerospace engineers in Toulouse earn €45,000–€80,000. Marketing managers at luxury groups earn €55,000–€90,000. France's social benefits — including healthcare, pension contributions, and generous leave entitlements — add significant value beyond base salary.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Popular Job Searches in France</h3>
      <p className="text-gray-600 mb-4">Top searches on JobMeter for France include: <strong>software engineer jobs in Paris</strong>, <strong>aerospace engineering jobs in Toulouse</strong>, <strong>finance jobs in Paris</strong>, <strong>jobs in France for English speakers</strong>, <strong>luxury brand jobs in Paris</strong>, <strong>data scientist jobs in Lyon</strong>, <strong>Talent Passport eligible jobs in France</strong>, and <strong>remote jobs in France</strong>. All listings are verified and updated daily.</p>

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