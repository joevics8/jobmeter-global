// app/jobs/Location/[country]/[state]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';
import { MapPin, Briefcase, Building2, TrendingUp, DollarSign, HelpCircle, ExternalLink, ChevronRight, BookOpen } from 'lucide-react';
import JobList from '@/components/jobs/JobList';
import { BreadcrumbListSchema } from '@/components/seo/StructuredData';
import AdUnit from '@/components/ads/AdUnit';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.global.jobmeter.app';
export const revalidate = false;
export const dynamicParams = true;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface PageParams {
  country: string;
  state: string;
}

async function getStatePage(countrySlug: string, stateSlug: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('location_state_pages')
    .select('*')
    .eq('country_slug', countrySlug)
    .eq('slug', stateSlug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateStaticParams() {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('location_state_pages')
    .select('country_slug, slug')
    .eq('is_active', true);

  return (data || []).map((row) => ({
    slug: row.country_slug,
    state: row.slug,
  }));
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const page = await getStatePage(params.country, params.state);
  if (!page) return { title: 'Jobs | JobMeter' };

  return {
    title: page.meta_title,
    description: page.meta_description,
    keywords: page.seo_keywords,
    alternates: {
      canonical: `${siteUrl}/jobs/Location/${page.full_path}`,
    },
    openGraph: {
      title: page.meta_title,
      description: page.meta_description,
      url: `${siteUrl}/jobs/Location/${page.full_path}`,
      type: 'website',
    },
  };
}

export default async function StateJobsPage({ params }: { params: PageParams }) {
  const page = await getStatePage(params.country, params.state);
  if (!page) notFound();

  // Fetch active state slugs so we only link to pages that actually exist — cached 1hr
  const getActiveStateSlugs = unstable_cache(async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('location_state_pages')
      .select('slug, country_slug')
      .eq('is_active', true);
    return (data || []).map(r => `${r.country_slug}/${r.slug}`);
  }, ['active-state-slugs'], { revalidate: false });
  const activeStateSlugs = new Set(await getActiveStateSlugs());

  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Jobs', url: `${siteUrl}/jobs` },
    { name: page.country, url: `${siteUrl}/jobs/Location/${page.country_slug}` },
    { name: page.state, url: `${siteUrl}/jobs/Location/${page.full_path}` },
  ];

  const towns: Array<{ name: string; slug: string; is_active: boolean }> = page.towns || [];
  const relatedStates: Array<{ name: string; slug: string; country_slug: string }> = page.related_states || [];
  const topRoles: Array<{ role: string; avg_salary: string; demand: string }> = page.top_roles || [];
  const majorEmployers: Array<{ name: string; sector: string; area?: string }> = page.major_employers || [];
  const faqs: Array<{ question: string; answer: string }> = page.faqs || [];
  const blogLinks: Array<{ title: string; slug: string; published_at?: string }> = page.blog_links || [];
  const salaryRanges = page.salary_ranges || {};
  const costOfLiving = page.cost_of_living || {};

  return (
    <>
      <BreadcrumbListSchema items={breadcrumbItems} />

      {/* Job list — first thing users see */}
      <JobList initialCountry={page.country} initialState={page.state} />

      {/* ── STATE CONTENT ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Intro card */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{page.h1_title || `Jobs in ${page.state}`}</h1>
          {page.capital_city && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <MapPin size={14} />
              <span>Capital: {page.capital_city}</span>
              {page.region && <><span>·</span><span>{page.region}</span></>}
            </div>
          )}
          <p className="text-gray-600 leading-relaxed">{page.intro}</p>
        </div>

        {/* Towns / Areas */}
        {towns.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              Areas & Towns in {page.state}
            </h2>
            <p className="text-sm text-gray-500 mb-5">Browse jobs by specific area within {page.state}. More town pages coming soon.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {towns.map((town) =>
                town.is_active ? (
                  <Link
                    key={town.slug}
                    href={`/jobs/Location/${page.full_path}/${town.slug}`}
                    className="flex items-center justify-between px-4 py-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors group"
                  >
                    <span className="text-sm font-medium text-blue-700 group-hover:text-blue-900">{town.name}</span>
                    <ChevronRight size={14} className="text-blue-400" />
                  </Link>
                ) : (
                  <div
                    key={town.slug}
                    className="flex items-center px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 cursor-default"
                  >
                    <span className="text-sm text-gray-400">{town.name}</span>
                    <span className="ml-auto text-xs text-gray-300">Soon</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Job Market + Salary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job market overview */}
          {page.job_market_summary && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-600" />
                Job Market Overview
              </h2>
              <p className="text-gray-600 leading-relaxed">{page.job_market_summary}</p>
              {page.top_sectors && page.top_sectors.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {page.top_sectors.map((s: string) => (
                    <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">{s}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Salary ranges */}
          {Object.keys(salaryRanges).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-yellow-600" />
                Salary Ranges in {page.state}
              </h2>
              <div className="space-y-3">
                {Object.entries(salaryRanges).filter(([k]) => k !== 'note').map(([level, data]: [string, any]) => (
                  <div key={level} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm font-medium text-gray-700 capitalize">{level === 'entry' ? 'Entry Level' : level === 'mid' ? 'Mid Level' : level === 'senior' ? 'Senior' : 'Executive'}</span>
                    <span className="text-sm font-semibold text-gray-900">{data.min} – {data.max}</span>
                  </div>
                ))}
                {salaryRanges.note && <p className="text-xs text-gray-400 mt-2">{salaryRanges.note}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Top Roles */}
        {topRoles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" />
              Top Roles in {page.state}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {topRoles.map((role, i) => (
                <div key={i} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <p className="font-semibold text-gray-900 mb-1">{role.role}</p>
                  {role.avg_salary && <p className="text-sm text-green-700 font-medium">{role.avg_salary}</p>}
                  {role.demand && (
                    <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${role.demand === 'High' ? 'bg-green-100 text-green-700' : role.demand === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                      {role.demand} demand
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Major Employers */}
        {majorEmployers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Building2 size={20} className="text-purple-600" />
              Major Employers in {page.state}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {majorEmployers.map((emp, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <Building2 size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.sector}{emp.area ? ` · ${emp.area}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost of Living */}
        {Object.keys(costOfLiving).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Cost of Living in {page.state}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(costOfLiving).filter(([k]) => k !== 'note' && k !== 'overall').map(([key, value]) => (
                <div key={key} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-xs text-gray-500 capitalize mb-1">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-semibold text-gray-900">{value as string}</p>
                </div>
              ))}
            </div>
            {costOfLiving.note && <p className="text-sm text-gray-500 mt-4 italic">{costOfLiving.note}</p>}
          </div>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <HelpCircle size={20} className="text-orange-500" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-5">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                  <p className="font-semibold text-gray-900 mb-2">{faq.question}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related States */}
        {relatedStates.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Related States</h2>
            <div className="flex flex-wrap gap-3">
              {relatedStates.map((s) => {
                const key = `${s.country_slug}/${s.slug}`;
                const isActive = activeStateSlugs.has(key);
                return isActive ? (
                  <Link
                    key={s.slug}
                    href={`/jobs/Location/${key}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700 hover:text-blue-700"
                  >
                    <MapPin size={14} />
                    {s.name}
                  </Link>
                ) : (
                  <span
                    key={s.slug}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-100 bg-gray-50 text-sm text-gray-400 cursor-default"
                  >
                    <MapPin size={14} />
                    {s.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Blog Links */}
        {blogLinks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" />
              Related Articles
            </h2>
            <div className="space-y-3">
              {blogLinks.map((post, i) => (
                <Link
                  key={i}
                  href={`/blog/${post.slug}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700">{post.title}</span>
                  <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 ml-3" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* SEO Content */}
        {page.seo_content && (
          <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: page.seo_content }}
          />
        )}
      </div>

      <AdUnit slot="9751041788" format="auto" />

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100" style={{ height: '50px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50px', overflow: 'hidden' }}>
          <AdUnit slot="3349195672" format="auto" style={{ display: 'block', width: '100%', height: '50px', maxHeight: '50px', overflow: 'hidden' }} />
        </div>
      </div>
    </>
  );
}