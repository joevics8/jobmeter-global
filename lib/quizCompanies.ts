// 📁 lib/quizCompanies.ts
// No "use client" — importable by both server components and client components.
// To add a new company: add to COMPANIES, add questions to Supabase, redeploy.

export const COMPANIES = [
  'Access Bank Graduate Trainee Assessment Test',
  'Access Bank Recruitment Assessment Test',
  'British American Tobacco (BAT) Practice Test',
  'CAT Practice Test',
  'Deloitte Recruitment Assessment Practice Test',
  'Dragnet Assessment Practice Test',
  'Ernst & Young (EY) Assessment Practice Test',
  'ExxonMobil Recruitment Assessment Practice Test',
  'First Bank Recruitment Assessment Practice Test',
  'General Aptitude Practice Test',
  'GMAT Practice Test',
  'GT Bank Recruitment Assessment Practice Test',
  'HCP Aptitude Practice Test',
  'KPMG Assessment Practice Test',
  'NNPC Recruitment Assessment Practice Test',
  'PwC Recruitment Assessment Practice Test',
  'UBA Recruitment Assessment Practice Test',
  'Workforce Ability Aptitude Practice Test',
  'Zenith Bank Recruitment Aptitude Practice Test',
].sort() as string[];

export function companyToSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function slugToCompany(slug: string): string | null {
  return COMPANIES.find((c) => companyToSlug(c) === slug) ?? null;
}