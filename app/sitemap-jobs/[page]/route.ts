import { createClient } from '@supabase/supabase-js';
import { getCountrySlug } from '@/lib/countrySlugMap';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.global.jobmeter.app';
const JOBS_TABLE = 'jobs_global';
const JOBS_PER_SITEMAP = 1000;

/**
 * Paginated job sitemap
 * Place at: app/sitemap-jobs/[page]/route.ts
 */
export async function GET(
  _request: Request,
  { params }: { params: { page: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials not found');
      return new Response('Missing Supabase credentials', { status: 500 });
    }

    const page = parseInt(params.page, 10);

    if (isNaN(page) || page < 1) {
      return new Response('Invalid page number', { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const from = (page - 1) * JOBS_PER_SITEMAP;
    const to = from + JOBS_PER_SITEMAP - 1;

    // ✅ UPDATED: Include active + expired_indexed only.
    // expired_indexed = real company expired jobs (keep indexed, show similar jobs)
    // expired = Confidential Employer expired jobs (noindex, excluded from sitemap)
    const { data: jobs, error } = await supabase
      .from(JOBS_TABLE)
      .select('slug, updated_at, country, location')
      .in('status', ['active', 'expired_indexed'])
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching jobs for sitemap page ${page}:`, error);
      return new Response('Error fetching jobs', { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
      return new Response('Page not found', { status: 404 });
    }

    console.log(`📄 Job sitemap page ${page}: ${jobs.length} jobs (rows ${from}–${to})`);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${jobs
  .map(
    (job) => `  <url>
    <loc>${siteUrl}/jobs/${resolveCountrySlug(job)}/${job.slug}</loc>
    <lastmod>${job.updated_at ? new Date(job.updated_at).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating job sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}

function resolveCountrySlug(job: { country?: string[] | null; location?: any }): string {
  const countryArr: string[] = Array.isArray(job.country) ? job.country : [];
  const first = countryArr.find((c) => c.toLowerCase() !== 'global');
  if (first) return getCountrySlug(first);
  if (job.location && typeof job.location === 'object') {
    const c = job.location.country || job.location.countries?.[0];
    if (c && c.toLowerCase() !== 'global') return getCountrySlug(c);
  }
  return 'global';
}

export const revalidate = 3600;