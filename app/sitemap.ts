import { createClient } from '@supabase/supabase-js';
import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.remote.jobmeter.app';
const JOBS_TABLE = 'jobs_gulf';
const JOBS_PER_SITEMAP = 1000;

/**
 * Main sitemap index
 * Place at: app/sitemap.ts
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseSitemaps: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/sitemap-static.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/sitemap-content.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/sitemap-blogs.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/sitemap-tools.xml`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials not found');
      return baseSitemaps;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { count, error } = await supabase
      .from(JOBS_TABLE)
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'expired_indexed']);

    if (error) {
      console.error('Error counting jobs:', JSON.stringify(error));
      return baseSitemaps;
    }

    if (!count || count === 0) {
      console.warn('No jobs found — skipping job sitemaps');
      return baseSitemaps;
    }

    const numberOfSitemaps = Math.ceil(count / JOBS_PER_SITEMAP);
    console.log(`📊 Total jobs: ${count}, Creating ${numberOfSitemaps} job sitemaps`);

    const jobSitemaps: MetadataRoute.Sitemap = Array.from(
      { length: numberOfSitemaps },
      (_, i) => ({
        url: `${siteUrl}/sitemap-jobs/${i + 1}.xml`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 1,
      })
    );

    return [...baseSitemaps, ...jobSitemaps];
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    return baseSitemaps;
  }
}

export const revalidate = 3600;