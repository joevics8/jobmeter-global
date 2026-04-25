// 📁 app/tools/quiz/[company]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CompanyQuizClient from './CompanyQuizClient';
import { COMPANIES, companyToSlug, slugToCompany } from '@/lib/quizCompanies';
import { quizSupabase } from '@/lib/quizSupabase';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

interface Props {
  params: Promise<{ company: string }>;
}

interface CompanyData {
  id?: string;
  name?: string;
  description?: string;
}

async function getCompanyData(companyName: string): Promise<CompanyData | null> {
  try {
    const { data } = await quizSupabase
      .from('quiz_companies')
      .select('*')
      .ilike('name', companyName)
      .single();
    return data;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  return COMPANIES.map((company) => ({
    company: companyToSlug(company),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { company: slug } = await params;
  const company = slugToCompany(slug);
  if (!company) return {};

  const companyData = await getCompanyData(company);
  const firstName = company.split(' ')[0];

  const description = companyData?.description
    ? companyData.description.replace(/<[^>]+>/g, '').slice(0, 160)
    : `Practice ${company} aptitude test questions online. Free objective questions with instant results. Premium: 50 questions + AI-graded theory. Prepare for ${firstName} recruitment.`;

  return {
    title: `${company} | Practice Questions & Answers`,
    description,
    keywords: [
      `${firstName} aptitude test`,
      `${firstName} recruitment test`,
      `${company} practice questions`,
      `${firstName} past questions`,
      'aptitude test Nigeria',
      'recruitment assessment practice',
    ],
  };
}

export default async function CompanyQuizPage({ params }: Props) {
  const { company: slug } = await params;
  const company = slugToCompany(slug);

  if (!company) notFound();

  const companyData = await getCompanyData(company!);

  return (
    <>
      {/* ── Main content + Desktop sidebar layout ──────────────────────── */}
      <div className="flex gap-6 items-start max-w-screen-xl mx-auto">

        {/* ── Left / main content ────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <CompanyQuizClient company={company!} companyData={companyData} />
        </div>

        {/* ── Right: Desktop sidebar ads ──────────────────────────────── */}
        <aside className="hidden lg:flex flex-col gap-6 w-[300px] shrink-0 sticky top-20 pt-6">
          <AdUnit
            slot="4198231153"
            format="auto"
            style={{ display: 'block', width: '300px', minHeight: '250px' }}
          />
          <AdUnit
            slot="9751041788"
            format="auto"
            style={{ display: 'block', width: '300px', minHeight: '250px' }}
          />
        </aside>
      </div>

      {/* ── Mobile anchor ad (50px - consistent with other pages) ─────────── */}
      {/* Spacer to prevent content from being blocked by the fixed anchor */}
      <div className="h-14 lg:hidden" aria-hidden="true" />
      
      <div
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100"
        style={{ height: '50px', overflow: 'hidden' }}
      >
        <AdUnit
          slot="3349195672"
          format="auto"
          style={{ 
            display: 'block', 
            width: '100%', 
            height: '50px', 
            maxHeight: '50px', 
            overflow: 'hidden' 
          }}
        />
      </div>
    </>
  );
}