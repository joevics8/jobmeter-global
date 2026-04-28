import { createClient } from '@supabase/supabase-js';
import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.remote.jobmeter.app';

/**
 * Content sitemap - published companies only
 * Place at: app/sitemap-content/route.ts
 */
export async function GET() {
  const routes: MetadataRoute.Sitemap = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials not found');
      return new Response('Missing Supabase credentials', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // ✅ Only fetch published companies
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('slug, updated_at')
      .eq('is_published', true);

    // ✅ FIX: Check error before using data
    if (companyError) {
      console.error('Error fetching companies:', companyError);
      return new Response('Error fetching companies', { status: 500 });
    }

    if (companies && companies.length > 0) {
      companies.forEach((company) => {
        // ✅ FIX: Skip companies with missing slugs to avoid malformed URLs
        if (!company.slug) return;

        routes.push({
          url: `${siteUrl}/company/${company.slug}`,
          lastModified: company.updated_at ? new Date(company.updated_at) : new Date(),
          changeFrequency: 'daily',
          priority: 0.6,
        });
      });
    }

    console.log(`📄 Content sitemap: ${routes.length} companies`);
  } catch (error) {
    console.error('Error generating content sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${route.url}</loc>
    <lastmod>${new Date(route.lastModified || new Date()).toISOString()}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority}</priority>
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
}

export const revalidate = 3600;