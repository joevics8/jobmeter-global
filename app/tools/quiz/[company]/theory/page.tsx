import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TheoryQuizClient from './TheoryQuizClient';
import { COMPANIES, companyToSlug, slugToCompany } from '@/lib/quizCompanies';

export const revalidate = false;

export async function generateStaticParams() {
  return COMPANIES.map((company) => ({
    company: companyToSlug(company),
  }));
}

interface Props {
  params: Promise<{ company: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { company: companySlug } = await params;
  const company = slugToCompany(companySlug);
  if (!company) return {};
  const firstName = company.split(' ')[0];

  return {
    title: `${company} Theory Questions Quiz | AI Graded`,
    description: `Practice ${company} theory and essay questions. Get AI-graded answers with feedback. Prepare for ${firstName} recruitment.`,
    keywords: [`${firstName} theory questions`, `${firstName} essay`, `${firstName} interview questions`, 'AI graded quiz'],
  };
}

export default async function TheoryQuizPage({ params }: Props) {
  const { company: companySlug } = await params;
  const company = slugToCompany(companySlug);

  if (!company) notFound();

  return <TheoryQuizClient company={company} />;
}