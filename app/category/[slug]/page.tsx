// app/category/[slug]/page.tsx
// Server component — metadata, structured data, ISR

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CategoryPageClient from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SalaryRow = {
  role: string;
  min: number;
  max: number;
  currency: string;
  period: string;
};

export type SkillRow = {
  skill: string;
  type: 'technical' | 'soft';
};

export type AgencyRow = {
  name: string;
  url: string;
  note: string;
};

export type LinkRow = {
  label: string;
  slug: string;
};

export type FAQRow = {
  q: string;
  a: string;
};

export type CategoryJobPage = {
  id: string;
  slug: string;
  page_type: 'jobs_in_location' | 'role_in_location';

  // Worker filters
  filter_city: string | null;
  filter_country: string | null;
  filter_role: string | null;

  // Core SEO
  h1: string;
  meta_title: string;
  meta_description: string;
  updated_at: string;

  // Content sections (all nullable — only write what you have)
  intro_html: string;
  hiring_trends_html: string | null;
  top_industries_html: string | null;
  salary_table_json: SalaryRow[] | null;
  salary_notes_html: string | null;
  cost_of_living_html: string | null;
  skills_json: SkillRow[] | null;
  qualifications_html: string | null;
  visa_html: string | null;
  employment_law_html: string | null;
  tax_html: string | null;
  work_environment_html: string | null;
  career_growth_html: string | null;
  job_types_html: string | null;
  graduates_html: string | null;
  how_to_apply_html: string | null;
  agencies_json: AgencyRow[] | null;
  cv_tips_html: string | null;
  interview_tips_html: string | null;
  housing_html: string | null;
  transport_html: string | null;
  healthcare_html: string | null;
  education_html: string | null;
  lifestyle_html: string | null;
  stats_html: string | null;
  role_comparison_html: string | null;
  faq_json: FAQRow[];
  conclusion_html: string | null;
  related_locations_json: LinkRow[];
  related_roles_json: LinkRow[];
};

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getPage(slug: string): Promise<CategoryJobPage | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('category_job_pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) return null;
  return data as CategoryJobPage;
}

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase
    .from('category_job_pages')
    .select('slug')
    .eq('is_published', true);

  return (data ?? []).map((row) => ({ slug: row.slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const page = await getPage(params.slug);
  if (!page) return { title: 'Not Found' };

  return {
    title: page.meta_title,
    description: page.meta_description,
    alternates: {
      canonical: `https://gulf.jobmeter.app/category/${page.slug}`,
    },
    openGraph: {
      title: page.meta_title,
      description: page.meta_description,
      url: `https://gulf.jobmeter.app/category/${page.slug}`,
      siteName: 'Gulf JobMeter',
      type: 'article',
      modifiedTime: page.updated_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.meta_title,
      description: page.meta_description,
    },
  };
}

// ─── Structured data ──────────────────────────────────────────────────────────

function buildFAQSchema(faqs: FAQRow[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

function buildBreadcrumbSchema(page: CategoryJobPage) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://gulf.jobmeter.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Categories',
        item: 'https://gulf.jobmeter.app/category',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: page.h1,
        item: `https://gulf.jobmeter.app/category/${page.slug}`,
      },
    ],
  };
}

function buildJobPostingSchema(page: CategoryJobPage) {
  // Only emit for role_in_location — gives Google a JobPosting signal
  if (page.page_type !== 'role_in_location') return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: page.filter_role
      ? page.filter_role.charAt(0).toUpperCase() + page.filter_role.slice(1)
      : page.h1,
    description: page.meta_description,
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: page.filter_city ?? '',
        addressCountry: page.filter_country ?? 'AE',
      },
    },
    datePosted: page.updated_at.split('T')[0],
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Gulf JobMeter',
      sameAs: 'https://gulf.jobmeter.app',
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CategoryPage(
  { params }: { params: { slug: string } }
) {
  const page = await getPage(params.slug);
  if (!page) notFound();

  const jobPostingSchema = buildJobPostingSchema(page);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbSchema(page)),
        }}
      />
      {page.faq_json?.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildFAQSchema(page.faq_json)),
          }}
        />
      )}
      {jobPostingSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jobPostingSchema),
          }}
        />
      )}

      <CategoryPageClient page={page} />
    </>
  );
}

// ISR — revalidate every 6 hours
export const revalidate = 21600;
