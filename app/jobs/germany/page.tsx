import JobList from '@/components/jobs/JobList';
import { Metadata } from 'next';
import { BreadcrumbListSchema } from '@/components/seo/StructuredData';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobmeter.app';

export const metadata: Metadata = {
  title: 'Jobs in Germany - Find Employment Opportunities | JobMeter',
  description: 'Browse latest job openings in Germany. Find full-time, part-time, and remote jobs across all industries. Apply to top German companies today.',
  alternates: {
    canonical: `${siteUrl}/jobs/germany`,
    languages: {
      'de': `${siteUrl}/jobs/germany`,
      'en': `${siteUrl}/jobs/germany`,
    },
  },
};

export default function GermanyJobsPage() {
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Jobs', url: `${siteUrl}/jobs` },
    { name: 'Germany', url: `${siteUrl}/jobs/germany` },
  ];

  return (
    <>
      <BreadcrumbListSchema items={breadcrumbItems} />

      <JobList initialCountry="Germany" />


      {/* SEO Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Finding Jobs in Germany</h2>
      <p className="text-gray-600 mb-4">Germany is Europe's largest economy and one of the world's most significant job markets, with over 45 million employed workers and a persistent structural shortage of skilled professionals across engineering, technology, and healthcare. Germany's <em>Fachkräftemangel</em> — skilled worker shortage — has prompted the government to actively recruit internationally, making it one of the most accessible European countries for skilled migration. JobMeter aggregates <strong>current job vacancies in Germany</strong> from verified employers across all major cities and regions.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Top Industries Hiring in Germany</h3>
      <p className="text-gray-600 mb-4">Engineering and manufacturing are Germany's most iconic industries, anchored by automotive giants BMW, Mercedes-Benz, Volkswagen, and their vast supplier networks, alongside industrial conglomerates like Siemens, Bosch, and Thyssenkrupp. <strong>Engineering jobs in Germany</strong> — mechanical, electrical, software, and civil — are among the most in-demand in Europe. The technology sector is expanding rapidly, particularly in Berlin, which has become one of Europe's top startup ecosystems. Finance and banking are centred in Frankfurt, Europe's second-largest financial centre. Healthcare, pharmaceutical (Bayer, BASF), and research institutions also employ at scale.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Best Cities for Jobs in Germany</h3>
      <p className="text-gray-600 mb-4">Berlin is Germany's capital and its largest startup hub, with a thriving tech scene, creative industries, and a growing number of international company headquarters. <strong>Jobs in Berlin</strong> are particularly abundant in technology, media, e-commerce, and the arts. Munich is Germany's wealthiest city and home to BMW, Allianz, and MAN, along with a strong technology and consulting sector. Frankfurt is the financial capital, home to the ECB, Deutsche Bank, and major global banks' European headquarters. Hamburg is Germany's second-largest city and a hub for media, logistics, and maritime industries. Stuttgart anchors the automotive and engineering heartland.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Working in Germany as an International Professional</h3>
      <p className="text-gray-600 mb-4">Germany introduced the <strong>Skilled Immigration Act (Fachkräfteeinwanderungsgesetz)</strong> to streamline work permits for non-EU nationals. The <strong>EU Blue Card</strong> remains the most popular route for university-educated professionals earning above the salary threshold (€43,800 in most fields, lower for shortage occupations). The <strong>Chancenkarte (Opportunity Card)</strong>, introduced in 2024, allows skilled workers to enter Germany to search for a job without a prior offer. Many <strong>jobs in Germany for English speakers</strong> are available in technology companies, international consultancies, and multinational corporations where English is the working language.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Salary Expectations for Jobs in Germany</h3>
      <p className="text-gray-600 mb-4">Germany's minimum wage is €12.41 per hour. Professional salaries are solid though typically lower than equivalent roles in the UK or USA — offset significantly by Germany's exceptional social benefits, healthcare system, and work-life balance. <strong>Software engineers in Berlin</strong> typically earn €55,000–€90,000. Automotive engineers at OEMs earn €60,000–€95,000. Finance professionals in Frankfurt earn €65,000–€120,000. Doctors and specialists in Germany earn €70,000–€150,000 depending on specialism and seniority.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Popular Job Searches in Germany</h3>
      <p className="text-gray-600 mb-4">Top searches on JobMeter for Germany include: <strong>software engineer jobs in Berlin</strong>, <strong>automotive engineering jobs in Munich</strong>, <strong>finance jobs in Frankfurt</strong>, <strong>jobs in Germany for English speakers</strong>, <strong>EU Blue Card eligible jobs in Germany</strong>, <strong>data science jobs in Hamburg</strong>, <strong>healthcare jobs in Germany for international doctors</strong>, and <strong>remote jobs in Germany</strong>. All listings are verified and updated daily.</p>

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