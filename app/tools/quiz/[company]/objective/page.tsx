import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ObjectiveQuizClient from './ObjectiveQuizClient';
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
    title: `${company} Objective Questions Quiz | Practice Online`,
    description: `Free ${company} objective aptitude test questions. Multiple choice quiz with ${firstName} recruitment test practice.`,
    keywords: [`${firstName} objective questions`, `${firstName} aptitude test`, 'multiple choice quiz'],
  };
}

export default async function ObjectiveQuizPage({ params }: Props) {
  const { company: companySlug } = await params;
  const company = slugToCompany(companySlug);

  if (!company) notFound();

  return <ObjectiveQuizClient company={company} />;
}