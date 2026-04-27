import JobList from '@/components/jobs/JobList';
import { Metadata } from 'next';
import { BreadcrumbListSchema } from '@/components/seo/StructuredData';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.global.jobmeter.app';

export const metadata: Metadata = {
  title: 'Jobs in Canada - Find Employment Opportunities | JobMeter',
  description: 'Browse latest job openings in Canada. Find full-time, part-time, and remote jobs across all industries. Apply to top Canadian companies today.',
  alternates: {
    canonical: `${siteUrl}/jobs/canada`,
    languages: {
      'en-CA': `${siteUrl}/jobs/canada`,
      'en': `${siteUrl}/jobs/canada`,
    },
  },
};

export default function CanadaJobsPage() {
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Jobs', url: `${siteUrl}/jobs` },
    { name: 'Canada', url: `${siteUrl}/jobs/canada` },
  ];

  return (
    <>
      <BreadcrumbListSchema items={breadcrumbItems} />

      <JobList initialCountry="Canada" />

      {/* SEO Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Finding Jobs in Canada</h2>
      <p className="text-gray-600 mb-4">Canada is one of the most welcoming countries in the world for skilled workers, combining strong employment demand with well-structured immigration pathways. With a population of 40 million and an economy driven by technology, natural resources, financial services, and healthcare, Canada's job market offers opportunities at every level. JobMeter aggregates <strong>current job vacancies in Canada</strong> from verified employers across all provinces and territories, updated multiple times daily.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Top Industries Hiring in Canada</h3>
      <p className="text-gray-600 mb-4">Technology is the fastest-growing sector, centred in Toronto's MaRS Discovery District, Vancouver's growing tech corridor, and Montreal's AI research ecosystem — home to institutions like Mila and several major AI labs. Healthcare is Canada's single largest employer, with persistent shortages driving demand for <strong>nurses, physicians, and allied health professionals</strong> across all provinces. Natural resources — oil and gas in Alberta, mining in Ontario and British Columbia, and forestry in British Columbia — remain foundational to the economy. Financial services, construction, and the public sector are also consistently active hiring markets.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Best Cities for Jobs in Canada</h3>
      <p className="text-gray-600 mb-4">Toronto is Canada's financial and technology capital, home to the Big Five banks, the TSX, and a world-class startup scene. <strong>Jobs in Toronto</strong> span every industry, making it the most active single market in the country. Vancouver is a hub for technology, film production, and natural resources, with a particularly strong gaming and software sector. Calgary is the centre of the Canadian oil and gas industry and is diversifying aggressively into tech. Ottawa, the national capital, offers the highest concentration of government and federal public service jobs. Montreal is Canada's second-largest city and a global leader in AI, aerospace, and video game development.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Immigration and Work Permits in Canada</h3>
      <p className="text-gray-600 mb-4">Canada offers multiple pathways for international workers, making it the top destination for skilled immigrants globally. The <strong>Express Entry system</strong> manages applications for permanent residence across the Federal Skilled Worker Program, Federal Skilled Trades Program, and Canadian Experience Class. The <strong>Provincial Nominee Program (PNP)</strong> allows provinces to directly nominate workers in high-demand occupations. Temporary Foreign Worker Programs and International Mobility Programs provide pathways for those seeking <strong>work permit jobs in Canada</strong>. Many Canadian employers on JobMeter indicate whether they support LMIA or work permit applications.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Salary Expectations for Jobs in Canada</h3>
      <p className="text-gray-600 mb-4">Canadian salaries are competitive by global standards. <strong>Software engineers in Toronto</strong> typically earn CAD 90,000–140,000. Registered nurses earn CAD 65,000–95,000 depending on province and specialisation, with significant travel nurse premiums available. Financial analysts at major banks start at CAD 55,000–75,000, while senior roles command CAD 120,000–180,000. Alberta's oil and gas sector pays among the highest wages in the country for technical roles. The federal minimum wage is CAD 17.30/hour, with provincial variations.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Popular Job Searches in Canada</h3>
      <p className="text-gray-600 mb-4">Top searches on JobMeter for Canada include: <strong>software engineer jobs in Toronto</strong>, <strong>nursing jobs in Canada for internationally trained nurses</strong>, <strong>oil and gas jobs in Calgary</strong>, <strong>government jobs in Ottawa</strong>, <strong>data scientist jobs in Vancouver</strong>, <strong>AI research jobs in Montreal</strong>, <strong>remote jobs in Canada</strong>, and <strong>jobs in Canada with work permit support</strong>. All listings are verified and updated daily.</p>

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