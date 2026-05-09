// app/category/page.tsx
// Lists all published global category pages, grouped by country then type

import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import CategoryIndexClient from './index-client';

export const metadata: Metadata = {
  title: 'Browse Jobs by Location & Role | Global JobMeter',
  description:
    'Browse global job guides by country and role. Find jobs across the US, UK, Europe, Asia, and more — or search by profession worldwide.',
  alternates: {
    canonical: 'https://www.global.jobmeter.app/category',
  },
};

export type CategoryPageMeta = {
  slug: string;
  page_type: 'jobs_in_location' | 'role_in_location';
  filter_city: string | null;
  filter_country: string | null;
  filter_role: string | null;
  h1: string;
  meta_description: string;
  updated_at: string;
};

// Global Country display order
const COUNTRY_ORDER = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'New Zealand',
  'Ireland',
  'Germany',
  'Singapore',
];

const COUNTRY_FLAGS: Record<string, string> = {
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺',
  'New Zealand': '🇳🇿',
  'Ireland': '🇮🇪',
  'Germany': '🇩🇪',
  'Singapore': '🇸🇬',
};

export type GroupedCategories = {
  country: string;
  flag: string;
  locationPages: CategoryPageMeta[];
  rolePages: CategoryPageMeta[];
};

async function getCategories(): Promise<GroupedCategories[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase
    .from('category_job_pages')
    .select(
      'slug, page_type, filter_city, filter_country, filter_role, h1, meta_description, updated_at'
    )
    .eq('is_published', true)
    .eq('website_country', 'global') // Filter for Global website
    .order('filter_country', { ascending: true })
    .order('page_type', { ascending: true })
    .order('h1', { ascending: true });

  if (error || !data) return [];

  // Group by country
  const byCountry = new Map<string, CategoryPageMeta[]>();

  for (const page of data as CategoryPageMeta[]) {
    const country = page.filter_country ?? 'International';
    if (!byCountry.has(country)) byCountry.set(country, []);
    byCountry.get(country)!.push(page);
  }

  // Sort countries based on global priority list
  const sortedCountries = Array.from(byCountry.keys()).sort((a, b) => {
    const ai = COUNTRY_ORDER.indexOf(a);
    const bi = COUNTRY_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return sortedCountries.map((country) => {
    const pages = byCountry.get(country)!;
    return {
      country,
      flag: COUNTRY_FLAGS[country] ?? '🌍',
      locationPages: pages.filter((p) => p.page_type === 'jobs_in_location'),
      rolePages: pages.filter((p) => p.page_type === 'role_in_location'),
    };
  });
}

export default async function CategoryIndexPage() {
  const groups = await getCategories();
  return <CategoryIndexClient groups={groups} />;
}

export const revalidate = 3600;