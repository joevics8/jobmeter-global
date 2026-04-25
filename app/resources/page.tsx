import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import ResourcesPageClient from '@/components/resources/ResourcesPageClient';

export const metadata: Metadata = {
  title: 'Browse Jobs by Category | JobMeter',
  description: 'Explore job opportunities across different categories and locations in Nigeria. Find accountant jobs, tech jobs, healthcare jobs, and more.',
  keywords: ['job categories', 'job search', 'careers', 'employment', 'Nigeria jobs'],
  openGraph: {
    title: 'Browse Jobs by Category | JobMeter',
    description: 'Explore job opportunities across different categories and locations in Nigeria.',
    type: 'website',
  },
};

// Fetch categories once at build/revalidation — not on every request
async function getCategoryPages() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('category_pages')
      .select('id, category, location, slug, h1_title, meta_description, job_count, view_count')
      .eq('is_published', true)
      .order('job_count', { ascending: false });

    if (error) {
      console.error('[resources] Error fetching category pages:', error.message);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error('[resources] Unexpected error:', e);
    return [];
  }
}

export default async function ResourcesPage() {
  const pages = await getCategoryPages();
  return <ResourcesPageClient pages={pages} />;
}