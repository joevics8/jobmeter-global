"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Briefcase, MapPin, TrendingUp, Search, Bookmark, BookmarkCheck } from 'lucide-react';
import { theme } from '@/lib/theme';

interface CategoryPage {
  id: string;
  category: string;
  location: string | null;
  slug: string;
  h1_title: string;
  meta_description: string;
  job_count: number;
  view_count: number;
}

function groupCategories(pages: CategoryPage[]) {
  const national = pages.filter(p => !p.location);
  const byLocation = pages.filter(p => p.location);
  return { national, byLocation };
}

// Pages are now passed as props from the server component — no fetch needed
export default function ResourcesPageClient({ pages }: { pages: CategoryPage[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<'all' | 'national' | 'location'>('all');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  // Load saved categories from localStorage on mount
  useState(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('saved_categories');
      if (saved) setSavedJobs(JSON.parse(saved));
    } catch (e) {}
  });

  const handleSaveJob = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedJobs(prev => {
      const next = prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId];
      localStorage.setItem('saved_categories', JSON.stringify(next));
      return next;
    });
  };

  const filteredPages = useMemo(() => {
    let filtered = pages;
    if (locationFilter === 'national') filtered = filtered.filter(p => !p.location);
    else if (locationFilter === 'location') filtered = filtered.filter(p => p.location);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(page =>
        page.h1_title.toLowerCase().includes(term) ||
        page.meta_description.toLowerCase().includes(term) ||
        page.category.toLowerCase().includes(term) ||
        (page.location && page.location.toLowerCase().includes(term))
      );
    }
    return filtered;
  }, [pages, searchTerm, locationFilter]);

  const { national, byLocation } = groupCategories(filteredPages);

  const JobCard = ({ page }: { page: CategoryPage }) => {
    const isSaved = savedJobs.includes(page.id);
    return (
      <Link href={`/resources/${page.slug}`} className="block">
        <div
          className="bg-white rounded-2xl p-5 mb-5 shadow-sm hover:shadow-lg transition-all duration-300 border relative overflow-hidden group cursor-pointer"
          style={{ borderColor: theme.colors.border.DEFAULT, backgroundColor: theme.colors.card.DEFAULT }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                  {page.h1_title}
                </h3>
                {page.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={13} />
                    <span>{page.location}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-blue-600 flex-shrink-0">
                <Briefcase size={14} />
                <span>{page.job_count}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{page.meta_description}</p>
            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: theme.colors.border.light }}>
              <div className="flex-1" />
              <button
                  onClick={(e) => handleSaveJob(e, page.id)}
                  className="p-2 rounded-lg border transition-all hover:scale-105"
                  style={{
                    borderColor: isSaved ? theme.colors.primary.DEFAULT : theme.colors.border.DEFAULT,
                    backgroundColor: isSaved ? theme.colors.primary.DEFAULT + '10' : 'transparent',
                  }}
                  title={isSaved ? "Remove from saved" : "Save category"}
                >
                  {isSaved
                    ? <BookmarkCheck size={18} style={{ color: theme.colors.primary.DEFAULT }} />
                    : <Bookmark size={18} style={{ color: theme.colors.text.secondary }} />}
                </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white" style={{ backgroundColor: '#2563EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase size={24} />
            <h1 className="text-2xl font-bold">Job Categories</h1>
          </div>
          <p className="text-sm text-white max-w-2xl">Browse job opportunities by category and location.</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search categories by title, state, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'national', 'location'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setLocationFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    locationFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'All Categories' : f === 'national' ? 'National Only' : 'By Location'}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredPages.length} of {pages.length} categories
            {searchTerm && ` for "${searchTerm}"`}
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredPages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No categories found</h2>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            <button
              onClick={() => { setSearchTerm(''); setLocationFilter('all'); }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {national.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp size={24} className="text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Popular Job Categories</h2>
                  <span className="text-sm text-gray-500">({national.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {national.map(page => <JobCard key={page.id} page={page} />)}
                </div>
              </section>
            )}
            {byLocation.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <MapPin size={24} className="text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Jobs by Location</h2>
                  <span className="text-sm text-gray-500">({byLocation.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {byLocation.map(page => <JobCard key={page.id} page={page} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}