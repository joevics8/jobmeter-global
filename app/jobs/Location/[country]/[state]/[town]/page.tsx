// app/jobs/Location/[country]/[state]/[town]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';
import { MapPin, Briefcase, Building2, TrendingUp, DollarSign, ChevronRight } from 'lucide-react';
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
  town: string;
}

async function getTownPage(countrySlug: string, stateSlug: string, townSlug: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('location_town_pages')           // <-- Change if your table name is different
    .select('*')
    .eq('country_slug', countrySlug)
    .eq('state_slug', stateSlug)
    .eq('slug', townSlug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateStaticParams() {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('location_town_pages')
    .select('country_slug, state_slug, slug')
    .eq('is_active', true);

  return (data || []).map((row) => ({
    country: row.country_slug,
    state: row.state_slug,
    town: row.slug,
  }));
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const page = await getTownPage(params.country, params.state, params.town);
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

export default async function TownJobsPage({ params }: { params: PageParams }) {
  const page = await getTownPage(params.country, params.state, params.town);
  if (!page) notFound();

  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Jobs', url: `${siteUrl}/jobs` },
    { name: page.country, url: `${siteUrl}/jobs/Location/${page.country_slug}` },
    { name: page.state, url: `${siteUrl}/jobs/Location/${page.country_slug}/${page.state_slug}` },
    { name: page.town, url: `${siteUrl}/jobs/Location/${page.full_path}` },
  ];

  const towns: Array<{ name: string; slug: string; is_active: boolean }> = page.towns || [];
  const relatedStates: Array<{ name: string; slug: string; country_slug: string }> = page.related_states || [];
  const topRoles: Array<{ role: string; avg_salary: string; demand: string }> = page.top_roles || [];
  const majorEmployers: Array<{ name: string; sector: string; area?: string }> = page.major_employers || [];
  const salaryRanges = page.salary_ranges || {};
  const costOfLiving = page.cost_of_living || {};

  return (
    <>
      <BreadcrumbListSchema items={breadcrumbItems} />

      {/* Job list — first thing users see */}
      <JobList initialCountry={page.country} initialState={page.state} initialTown={page.town} />

      {/* ── TOWN CONTENT ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Intro card */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{page.h1_title || `Jobs in ${page.town}, ${page.state}`}</h1>
          {page.capital_city && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <MapPin size={14} />
              <span>Capital: {page.capital_city}</span>
            </div>
          )}
          <p className="text-gray-600 leading-relaxed">{page.intro}</p>
        </div>

        {/* Towns / Areas - if needed */}
        {towns.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              Areas & Towns in {page.state}
            </h2>
            <p className="text-sm text-gray-500 mb-5">Browse jobs by specific area within {page.state}.</p>
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
          {page.job_market_summary && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-600" />
                Job Market Overview
              </h2>
              <p className="text-gray-600 leading-relaxed">{page.job_market_summary}</p>
            </div>
          )}

          {Object.keys(salaryRanges).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-yellow-600" />
                Salary Ranges in {page.town}
              </h2>
              <div className="space-y-3">
                {Object.entries(salaryRanges).filter(([k]) => k !== 'note').map(([level, data]: [string, any]) => (
                  <div key={level} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {level === 'entry' ? 'Entry Level' : level === 'mid' ? 'Mid Level' : level === 'senior' ? 'Senior' : 'Executive'}
                    </span>
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
              Top Roles in {page.town}
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
              Major Employers in {page.town}
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
            <h2 className="text-xl font-bold text-gray-900 mb-5">Cost of Living in {page.town}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(costOfLiving).filter(([k]) => k !== 'note' && k !== 'overall').map(([key, value]) => (
                <div key={key} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-xs text-gray-500 capitalize mb-1">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-semibold text-gray-900">{value as string}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Mobile Bottom Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100" style={{ height: '50px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50px', overflow: 'hidden' }}>
          <AdUnit slot="3349195672" format="auto" style={{ display: 'block', width: '100%', height: '50px', maxHeight: '50px', overflow: 'hidden' }} />
        </div>
      </div>
    </>
  );
}