import { createClient } from '@supabase/supabase-js';
import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.remote.jobmeter.app';

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

    // ✅ Remote category pages — dynamic from remote_categories table
    const { data: remoteCategories, error: remoteError } = await supabase
      .from('remote_categories')
      .select('slug, updated_at')
      .eq('is_active', true)
      .eq('website_country', 'remote')
      .order('display_order', { ascending: true });

    if (!remoteError && remoteCategories) {
      remoteCategories.forEach((cat) => {
        routes.push({
          url: `${siteUrl}/jobs/remote/${cat.slug}`,
          lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        });
      });
    }

    // Existing Nigerian category pages from DB
    const { data: categoryPages, error } = await supabase
      .from('category_pages')
      .select('slug, updated_at, location, job_count')
      .eq('is_published', true)
      .eq('website_country', 'remote')
      .order('job_count', { ascending: false });

    if (error) {
      console.error('Error fetching category pages:', error);
      return new Response('Error fetching category pages', { status: 500 });
    }

    if (categoryPages && categoryPages.length > 0) {
      categoryPages.forEach((page) => {
        routes.push({
          url: `${siteUrl}/resources/${page.slug}`,
          lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
          changeFrequency: 'daily',
          priority: page.job_count > 20 ? 0.9 : 0.7,
        });
      });
      console.log(`📄 Category sitemap: ${routes.length} pages total (${categoryPages.length} Remote category pages)`);
    }
  } catch (error) {
    console.error('Error generating category sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${route.url.replace(/&/g, '&amp;')}</loc>
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