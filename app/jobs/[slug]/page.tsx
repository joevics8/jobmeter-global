import { notFound } from 'next/navigation';
import { mapJobToSchema } from '@/lib/mapJobToSchema';
import JobClient from './JobClient';
import { Metadata } from 'next';

export const dynamic = 'force-static'; // ensures build-time rendering only
export const revalidate = 31536000; // 1 year (acts as "practically infinite cache")

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const COMPANIES_URL =
  'https://jobs-api.joevicspro.workers.dev/companies';

/**
 * IMPORTANT:
 * No cache(), no runtime fetch behavior dependency.
 * This must execute ONLY at build time.
 */
async function getJob(slug: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/jobs?slug=eq.${slug}&select=*&limit=1`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      cache: 'force-cache',
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
}

async function getCompanies() {
  const res = await fetch(COMPANIES_URL, {
    cache: 'force-cache',
  });

  const data = await res.json();
  return data.companies || [];
}

async function getRelatedJobs(job: any) {
  const dateStr = new Date(Date.now() - 30 * 86400000).toISOString();

  const params = new URLSearchParams({
    select:
      'id,title,company,location,category,slug,status,created_at',
    category: `eq.${job.category}`,
    id: `neq.${job.id}`,
    created_at: `gte.${dateStr}`,
    order: 'created_at.desc',
    limit: '10',
  });

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/jobs?${params}`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      cache: 'force-cache',
    }
  );

  return res.ok ? res.json() : [];
}

export async function generateMetadata({
  params,
}: any): Promise<Metadata> {
  const job = await getJob(params.slug);
  if (!job) return { title: 'Job Not Found' };

  const company =
    typeof job.company === 'string'
      ? job.company
      : job.company?.name || 'Company';

  return {
    title: `${job.title} at ${company}`,
    description:
      job.description?.replace(/<[^>]*>/g, '').slice(0, 160) || '',
    alternates: {
      canonical: `https://www.jobmeter.app/jobs/${job.slug}`,
    },
  };
}

export default async function JobPage({ params }: any) {
  const job = await getJob(params.slug);
  if (!job) notFound();

  const [companies, relatedJobs] = await Promise.all([
    getCompanies(),
    getRelatedJobs(job),
  ]);

  const schema = mapJobToSchema(job);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />

      <JobClient
        job={job}
        relatedJobs={relatedJobs}
        companies={companies}
      />
    </>
  );
}