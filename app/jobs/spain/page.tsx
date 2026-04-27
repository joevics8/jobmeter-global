import JobList from '@/components/jobs/JobList';
import { Metadata } from 'next';
import { BreadcrumbListSchema } from '@/components/seo/StructuredData';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.global.jobmeter.app';

export const metadata: Metadata = {
  title: 'Jobs in Spain - Find Employment Opportunities | JobMeter',
  description: 'Browse latest job openings in Spain. Find full-time, part-time, and remote jobs across all industries. Apply to top Spanish companies today.',
  alternates: {
    canonical: `${siteUrl}/jobs/spain`,
    languages: {
      'es': `${siteUrl}/jobs/spain`,
      'en': `${siteUrl}/jobs/spain`,
    },
  },
};

export default function SpainJobsPage() {
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Jobs', url: `${siteUrl}/jobs` },
    { name: 'Spain', url: `${siteUrl}/jobs/spain` },
  ];

  return (
    <>
      <BreadcrumbListSchema items={breadcrumbItems} />

      <JobList initialCountry="Spain" />


      {/* SEO Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Finding Jobs in Spain</h2>
      <p className="text-gray-600 mb-4">Spain is the fourth-largest economy in the eurozone and a diverse job market with opportunities spanning traditional industries like tourism and agriculture alongside fast-growing sectors in technology, renewable energy, and digital services. With over 21 million employed workers and a significant concentration of international companies establishing European operations in Barcelona and Madrid, Spain offers compelling career opportunities for both local and international professionals. JobMeter aggregates <strong>current job vacancies in Spain</strong> from verified employers across all regions, updated daily.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Top Industries Hiring in Spain</h3>
      <p className="text-gray-600 mb-4">Tourism and hospitality remain Spain's most iconic industries — the country welcomes 85 million visitors annually, making it one of the world's top tourist destinations and creating massive demand for hospitality, events, and travel management professionals. Renewable energy is Spain's fastest-growing sector, with Iberdrola, Acciona, and Repsol driving enormous investment in wind, solar, and green hydrogen and creating thousands of <strong>engineering and sustainability jobs in Spain</strong>. Technology is growing rapidly in Barcelona and Madrid, with a vibrant startup scene and major tech companies establishing southern European hubs. Financial services, retail, and healthcare are also consistent employers.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Best Cities for Jobs in Spain</h3>
      <p className="text-gray-600 mb-4">Madrid is Spain's capital and largest employment centre, home to the headquarters of Santander, BBVA, Telefónica, Inditex, and Repsol, alongside a growing technology corridor. <strong>Jobs in Madrid</strong> span finance, technology, consulting, retail, and the public sector. Barcelona is Spain's tech and startup capital, with a thriving ecosystem in mobile technology, e-commerce, and digital media — and a large concentration of international companies that operate in English. Valencia is an emerging hub for logistics, tech, and design. Bilbao leads the Basque Country's industrial and manufacturing economy. Seville and Málaga are growing technology and digital nomad destinations.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Working in Spain as an International Professional</h3>
      <p className="text-gray-600 mb-4">EU and EEA nationals have full freedom of movement to work in Spain. Non-EU professionals require a work visa, and Spain introduced the <strong>Digital Nomad Visa</strong> in 2023, allowing remote workers and freelancers earning primarily from outside Spain to live and work legally in the country. The <strong>Highly Qualified Professional Visa</strong> provides an accelerated route for skilled workers with a job offer from a Spanish employer. Many Barcelona-based tech companies actively hire English-speaking professionals, particularly in software development, product management, and growth marketing.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Salary Expectations for Jobs in Spain</h3>
      <p className="text-gray-600 mb-4">Spain's minimum wage (SMI) is €1,134 per month. Professional salaries are generally lower than Northern European equivalents but offset by a lower cost of living and exceptional quality of life. <strong>Software engineers in Barcelona</strong> typically earn €40,000–€70,000. Finance professionals in Madrid earn €45,000–€90,000 depending on seniority. Renewable energy engineers earn €40,000–€75,000. Marketing managers at international companies earn €40,000–€65,000. Salaries at multinational companies and startups funded by international capital tend to be significantly higher than the national average.</p>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">Popular Job Searches in Spain</h3>
      <p className="text-gray-600 mb-4">Top searches on JobMeter for Spain include: <strong>software developer jobs in Barcelona</strong>, <strong>finance jobs in Madrid</strong>, <strong>renewable energy jobs in Spain</strong>, <strong>jobs in Spain for English speakers</strong>, <strong>digital nomad visa eligible jobs in Spain</strong>, <strong>hospitality jobs in Barcelona</strong>, <strong>data analyst jobs in Madrid</strong>, and <strong>remote jobs in Spain</strong>. All listings are verified and updated daily.</p>

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