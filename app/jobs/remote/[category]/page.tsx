// ─── File: page.tsx ───────────────────────────────────────────────────────────
// Path: app/jobs/remote/[category]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Globe, DollarSign, MapPin, Wrench, ChevronRight, Laptop } from 'lucide-react';
import CategoryJobList, { RawJobRow } from '@/components/category/CategoryJobList';
import RemoteCategoryContent from '@/components/category/RemoteCategoryContent';
import AdUnit from '@/components/ads/AdUnit';

// Cache forever — clears on deploy or on-demand revalidation
export const revalidate = false;
export const dynamicParams = true;

interface RemoteCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  job_count: number;
  is_active: boolean;
  display_order: number;
  meta_title: string | null;
  meta_description: string | null;
  seo_keywords: string[] | null;
  h1_title: string | null;
  about_role: string | null;
  who_should_apply: string | null;
  how_to_stand_out: string | null;
  key_responsibilities: string[] | null;
  faqs: any;
  related_categories: string[] | null;
  typical_salary_range: {
    min: number;
    max: number;
    currency: string;
    period: string;
    note?: string;
  } | null;
  top_tools: string[] | null;
  top_hiring_countries: string[] | null;
  experience_levels: string[] | null;
  view_count: number;
  last_job_added_at: string | null;
}

interface RelatedCategory {
  slug: string;
  name: string;
  h1_title: string | null;
  job_count: number;
}

async function getRemoteCategory(slug: string): Promise<RemoteCategory | null> {
  try {
    const { data, error } = await supabase
      .from('remote_categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    if (error || !data) return null;
    return data;
  } catch (error) {
    console.error('Error fetching remote category:', error);
    return null;
  }
}

async function incrementViewCount(slug: string) {
  try {
    await supabase.rpc('increment_remote_category_views', { category_slug: slug });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

// Fetch initial jobs server-side so Googlebot sees real job listings in HTML
async function getInitialJobs(page: RemoteCategory): Promise<RawJobRow[]> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, slug, title, company, location, salary_range, employment_type, posted_date, created_at')
      .in('status', ['active', 'expired', 'expired_indexed'])
      .eq('job_type', 'Remote')
      .eq('role_category', page.name)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching initial remote jobs:', error);
      return [];
    }
    return (data as RawJobRow[]) || [];
  } catch (error) {
    console.error('Error fetching initial remote jobs:', error);
    return [];
  }
}

async function fetchRelatedCategories(page: RemoteCategory): Promise<RelatedCategory[]> {
  try {
    if (!page.related_categories || page.related_categories.length === 0) {
      const { data } = await supabase
        .from('remote_categories')
        .select('slug, name, h1_title, job_count')
        .eq('is_active', true)
        .neq('slug', page.slug)
        .order('job_count', { ascending: false })
        .limit(6);
      return data || [];
    }

    const { data } = await supabase
      .from('remote_categories')
      .select('slug, name, h1_title, job_count')
      .in('slug', page.related_categories)
      .eq('is_active', true)
      .limit(6);

    return data || [];
  } catch (error) {
    console.error('Error fetching related remote categories:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const page = await getRemoteCategory(params.category);
  if (!page) return { title: 'Remote Category Not Found | JobMeter' };

  const title = page.meta_title || `Remote ${page.name} Jobs - Work From Home | JobMeter`;
  const description = page.meta_description || page.description || `Find remote ${page.name} jobs. Work from anywhere.`;
  const url = `https://www.global.jobmeter.app/jobs/remote/${page.slug}`;

  return {
    title,
    description,
    keywords: page.seo_keywords || [],
    authors: [{ name: 'JobMeter' }],
    openGraph: { title, description, url, siteName: 'JobMeter', locale: 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: url },
  };
}

export async function generateStaticParams() {
  try {
    const { data } = await supabase
      .from('remote_categories')
      .select('slug')
      .eq('is_active', true);
    if (!data) return [];
    return data.map((row) => ({ category: row.slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function RemoteCategoryPage({ params }: { params: { category: string } }) {
  const page = await getRemoteCategory(params.category);
  if (!page) notFound();

  // Run in parallel — saves ~2x latency vs sequential awaits
  const [initialJobs, relatedCategories] = await Promise.all([
    getInitialJobs(page),
    fetchRelatedCategories(page),
  ]);

  // Non-blocking — fire and forget
  incrementViewCount(params.category);

  const h1 = page.h1_title || `Remote ${page.name} Jobs`;
  const description = page.meta_description || page.description || '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: h1,
    description,
    url: `https://www.jobmeter.app/jobs/remote/${page.slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.global.jobmeter.app' },
        { '@type': 'ListItem', position: 2, name: 'Jobs', item: 'https://www.global.jobmeter.app/jobs' },
        { '@type': 'ListItem', position: 3, name: 'Remote Jobs', item: 'https://www.global.jobmeter.app/jobs/remote' },
        { '@type': 'ListItem', position: 4, name: h1, item: `https://www.global.jobmeter.app/jobs/remote/${page.slug}` },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="text-white" style={{ backgroundColor: '#2563EB' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-3 mb-4">
              <Laptop size={32} />
              <h1 className="text-4xl font-bold">{h1}</h1>
            </div>
            <p className="text-lg text-blue-100 max-w-3xl">{description}</p>

            <div className="flex flex-wrap items-center gap-6 mt-6 text-sm">
              <span className="flex items-center gap-2">
                <Briefcase size={16} />
                {page.job_count} active remote jobs
              </span>
              <span className="flex items-center gap-2">
                <Globe size={16} />
                Work from anywhere
              </span>
              {page.typical_salary_range && (
                <span className="flex items-center gap-2">
                  <DollarSign size={16} />
                  {page.typical_salary_range.currency}{page.typical_salary_range.min.toLocaleString()} – {page.typical_salary_range.currency}{page.typical_salary_range.max.toLocaleString()} / {page.typical_salary_range.period}
                </span>
              )}
            </div>

            {page.experience_levels && page.experience_levels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {page.experience_levels.map((level) => (
                  <span key={level} className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                    {level}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <Link href="/jobs" className="hover:text-blue-600">Jobs</Link>
              <span>/</span>
              <Link href="/jobs/remote" className="hover:text-blue-600">Remote</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{page.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/jobs/remote" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium">
            <ArrowLeft size={20} />
            Back to Remote Jobs
          </Link>

          {/* Tools & Countries quick-glance */}
          {(page.top_tools?.length || page.top_hiring_countries?.length) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {page.top_tools && page.top_tools.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold">
                    <Wrench size={16} />
                    Top Tools & Skills
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {page.top_tools.map((tool) => (
                      <span key={tool} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {page.top_hiring_countries && page.top_hiring_countries.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold">
                    <MapPin size={16} />
                    Top Hiring Countries
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {page.top_hiring_countries.map((country) => (
                      <span key={country} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Job listings — initialJobs pre-fetched server-side for Googlebot */}
            <div className="lg:col-span-2">
              <CategoryJobList
                category=""
                location={null}
                jobType="Remote"
                roleCategory={page.name}
                initialJobs={initialJobs}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <RemoteCategoryContent page={page} />
            </div>
          </div>

          {/* Related categories */}
          {relatedCategories.length > 0 && (
            <section className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Other Remote Job Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedCategories.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/jobs/remote/${related.slug}`}
                    className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {related.h1_title || `Remote ${related.name} Jobs`}
                      </h3>
                      <span className="text-sm text-gray-500">{related.job_count} jobs</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100" style={{ height: '50px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50px', overflow: 'hidden' }}>
          <AdUnit slot="3349195672" format="auto" style={{ display: 'block', width: '100%', height: '50px', maxHeight: '50px', overflow: 'hidden' }} />
        </div>
      </div>
    </>
  );
}