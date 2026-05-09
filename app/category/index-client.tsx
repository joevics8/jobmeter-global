'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, ArrowRight, Filter } from 'lucide-react';
import { GroupedCategories, CategoryPageMeta } from './page';

// ─── Simplified & Cleaner Category Card ──────────────────────────────────────
function CategoryCard({ page }: { page: CategoryPageMeta }) {
  return (
    <Link
      href={`/category/${page.slug}`}
      className="group flex flex-col h-full min-h-[160px] rounded-2xl border-2 border-gray-300 bg-white p-6 hover:border-blue-600 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex-1 flex items-center">
        {/* Title: Forced to 3 lines height for alignment */}
        <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-3 min-h-[3.3em]">
          {page.h1}
        </h3>
      </div>

      {/* Minimal Footer */}
      <div className="mt-4 flex justify-end">
        <div className="rounded-full bg-gray-50 p-2 text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
          <ChevronRight size={20} />
        </div>
      </div>
    </Link>
  );
}

// ─── Country Section ──────────────────────────────────────────────────────────
function CountrySection({ group, searchQuery }: { group: GroupedCategories; searchQuery: string }) {
  const q = searchQuery.toLowerCase();
  const filteredPages = [...group.locationPages, ...group.rolePages].filter(
    (p) => !q || p.h1.toLowerCase().includes(q)
  );

  if (filteredPages.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="flex items-center gap-3 text-xl font-black text-gray-900 mb-6 px-1">
        <span className="text-3xl">{group.flag}</span> 
        <span className="uppercase tracking-tight">{group.country}</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPages.map((p) => (
          <CategoryCard key={p.slug} page={p} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function CategoryIndexClient({ groups }: { groups: GroupedCategories[] }) {
  const [search, setSearch] = useState('');
  const [activeCountry, setActiveCountry] = useState<string>('All');

  const countries = useMemo(() => ['All', ...groups.map((g) => g.country)], [groups]);

  const visibleGroups = useMemo(() => {
    return groups.filter((g) => {
      const countryMatch = activeCountry === 'All' || g.country === activeCountry;
      if (!countryMatch) return false;
      
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        g.country.toLowerCase().includes(q) ||
        g.locationPages.some((p) => p.h1.toLowerCase().includes(q)) ||
        g.rolePages.some((p) => p.h1.toLowerCase().includes(q))
      );
    });
  }, [groups, search, activeCountry]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <nav className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900">Guides</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tighter">
            Career & Location Guides
          </h1>
          <p className="text-gray-500 max-w-2xl mb-10 text-lg leading-relaxed">
            Expert advice and live market data for working in the Gulf.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search (e.g. Dubai, Nurse, Engineering)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-base rounded-2xl border-2 border-gray-200 bg-white focus:outline-none focus:border-blue-600 transition-all shadow-sm"
              />
            </div>
            <div className="relative w-full sm:w-64">
              <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={activeCountry}
                onChange={(e) => setActiveCountry(e.target.value)}
                className="w-full pl-12 pr-10 py-4 text-base font-bold rounded-2xl border-2 border-gray-200 bg-white focus:outline-none focus:border-blue-600 shadow-sm appearance-none cursor-pointer transition-all"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronRight size={18} className="rotate-90" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {visibleGroups.length === 0 ? (
          <div className="text-center py-24">
            <h3 className="text-xl font-bold text-gray-900">No results found</h3>
            <button onClick={() => { setSearch(''); setActiveCountry('All'); }} className="mt-4 text-blue-600 underline">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {visibleGroups.map((group) => (
              <CountrySection key={group.country} group={group} searchQuery={search} />
            ))}
          </div>
        )}

        {/* Updated Footer CTA */}
        <div className="mt-24 rounded-[2rem] bg-slate-900 p-10 md:p-16 text-white text-center">
          <h2 className="text-2xl md:text-4xl font-black mb-4 tracking-tight">Browse live jobs</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Ready to take the next step? Our job board is updated daily with premium vacancies across the Gulf.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 text-white font-black text-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-xl shadow-blue-600/20"
          >
            Go to Job Board <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}