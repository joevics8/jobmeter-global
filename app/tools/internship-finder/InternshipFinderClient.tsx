"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';
import JobCard from '@/components/jobs/JobCard';
import { JobUI } from '@/components/jobs/JobCard';
import MatchBreakdownModal from '@/components/jobs/MatchBreakdownModal';
import { MatchBreakdownModalData } from '@/components/jobs/MatchBreakdownModal';
import { Search, Filter, X, Briefcase } from 'lucide-react';
import { scoreJob, JobRow, UserOnboardingData } from '@/lib/matching/matchEngine';
import { matchCacheService } from '@/lib/matching/matchCache';
import AdUnit from '@/components/ads/AdUnit';

const STORAGE_KEYS = {
  SAVED_JOBS: 'saved_jobs',
  APPLIED_JOBS: 'applied_jobs',
};

const JOBS_PER_PAGE = 20;

export default function InternshipFinderClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<JobUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [matchModalData, setMatchModalData] = useState<MatchBreakdownModalData | null>(null);
  const [sortBy, setSortBy] = useState<'match' | 'date'>('date');
  const [userOnboardingData, setUserOnboardingData] = useState<UserOnboardingData | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    sector: [] as string[],
    location: [] as string[],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [rolesExpanded, setRolesExpanded] = useState(false);

  const categories = [
    { id: 'remote', label: 'Remote', icon: 'Laptop', url: '/tools/remote-jobs-finder' },
    { id: 'nysc', label: 'NYSC', icon: 'Award', url: '/tools/nysc-finder' },
    { id: 'accommodation', label: 'Accommodation', icon: 'Home', url: '/tools/accommodation-finder' },
    { id: 'visa', label: 'Visa', icon: 'Globe', url: '/tools/visa-finder' },
    { id: 'trainee', label: 'Graduate/Trainee', icon: 'GraduationCap', url: '/tools/graduate-trainee-finder' },
    { id: 'entry', label: 'Entry Level', icon: 'Rocket', url: '/tools/entry-level-finder' },
    { id: 'internship', label: 'Internship', icon: 'Briefcase', url: '/tools/internship-finder' },
  ];

  const popularRoles = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Mobile App Developer', 'Data Analyst', 'Data Scientist', 'DevOps Engineer',
    'Cybersecurity Analyst', 'IT Support Specialist', 'Product Manager', 'Project Manager',
    'Business Analyst', 'UI/UX Designer', 'Graphic Designer', 'Digital Marketer',
    'Social Media Manager', 'Content Writer', 'SEO Specialist', 'Sales Executive',
    'Marketing Executive', 'Customer Service Representative', 'Administrative Officer',
    'Human Resources Officer', 'Recruiter', 'Accountant', 'Financial Analyst',
    'Auditor', 'Operations Manager', 'Supply Chain Officer', 'Procurement Officer',
    'Logistics Coordinator', 'Store Manager', 'Retail Sales Associate', 'Banking Officer',
    'Credit Analyst', 'Risk Analyst', 'Healthcare Assistant', 'Registered Nurse',
    'Pharmacist', 'Medical Laboratory Scientist', 'Civil Engineer', 'Mechanical Engineer',
    'Electrical Engineer', 'Architect', 'Quality Assurance Officer', 'Teacher',
    'Lecturer', 'Research Assistant', 'Graduate Trainee', 'Intern'
  ];

  const visibleRoles = rolesExpanded ? popularRoles : popularRoles.slice(0, 14);

  const sectors = [
    'Technology', 'Marketing', 'Sales', 'Design', 'Finance',
    'Healthcare', 'Education', 'Engineering', 'Admin', 'Customer Service',
    'Legal', 'HR', 'Manufacturing', 'Retail', 'Media'
  ];

  const locations = [
    'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano',
    'Benin City', 'Abuja', 'Remote'
  ];

  useEffect(() => {
    checkAuth();
    loadSavedJobs();
    loadAppliedJobs();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
        setUserOnboardingData(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserOnboardingData();
    }
  }, [user]);

  useEffect(() => {
    const searchParam = searchParams.get('search');
    const sectorParam = searchParams.get('sector');
    const locationParam = searchParams.get('location');
    const pageParam = searchParams.get('page');

    if (searchParam) setSearchQuery(searchParam);
    if (sectorParam) setFilters(prev => ({ ...prev, sector: sectorParam.split(',') }));
    if (locationParam) setFilters(prev => ({ ...prev, location: locationParam.split(',') }));
    if (pageParam) setCurrentPage(parseInt(pageParam));
  }, [searchParams]);

  useEffect(() => {
    fetchInternshipJobs();
  }, [currentPage, filters, user, userOnboardingData, searchQuery]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
    }
  };

  const fetchUserOnboardingData = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') return;

      if (data) {
        setUserOnboardingData({
          target_roles: data.target_roles || [],
          cv_skills: data.cv_skills || [],
          preferred_locations: data.preferred_locations || [],
          experience_level: data.experience_level || null,
          salary_min: data.salary_min || null,
          salary_max: data.salary_max || null,
          job_type: data.job_type || null,
          sector: data.sector || null,
        });
      }
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
    }
  };

  const fetchInternshipJobs = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error(`Jobs API error: ${res.status}`);
      const { jobs: allJobs } = await res.json();

      let filtered = (allJobs || []).filter((job: any) =>
        job.role_category === 'intern'
      );

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter((job: any) => {
          const title = (job.title || '').toLowerCase();
          const company = typeof job.company === 'string'
            ? job.company.toLowerCase()
            : (job.company?.name || '').toLowerCase();
          return title.includes(q) || company.includes(q);
        });
      }

      if (filters.sector.length > 0) {
        filtered = filtered.filter((job: any) => filters.sector.includes(job.sector));
      }
      if (filters.location.length > 0) {
        filtered = filtered.filter((job: any) =>
          filters.location.some(f => {
            if (f === 'Remote') return job.location?.remote === true;
            const city = (job.location?.city || '').toLowerCase();
            const country = (job.location?.country || '').toLowerCase();
            const state = (job.location?.state || '').toLowerCase();
            const fLower = f.toLowerCase();
            return city.includes(fLower) || country.includes(fLower) || state.includes(fLower);
          })
        );
      }

      filtered.sort((a: any, b: any) =>
        new Date(b.posted_date || b.created_at || 0).getTime() -
        new Date(a.posted_date || a.created_at || 0).getTime()
      );

      const total = filtered.length;
      setTotalJobs(total);
      setTotalPages(total > 0 ? Math.ceil(total / JOBS_PER_PAGE) : 1);

      const paginated = filtered.slice(
        (currentPage - 1) * JOBS_PER_PAGE,
        currentPage * JOBS_PER_PAGE
      );

      let processedJobs;
      if (!user || !userOnboardingData) {
        processedJobs = paginated.map((job: any) => transformJobToUI(job, 0, null));
      } else {
        processedJobs = await processJobsWithMatching(paginated);
      }

      setJobs(processedJobs);
    } catch (error) {
      console.error('Error fetching internship jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const processJobsWithMatching = useCallback(async (jobRows: any[]): Promise<JobUI[]> => {
    if (!userOnboardingData || !user) {
      return jobRows.map((job: any) => transformJobToUI(job, 0, null));
    }

    const matchCache = matchCacheService.loadMatchCache(user.id);
    let cacheNeedsUpdate = false;
    const updatedCache = { ...matchCache };

    const processedJobs = await Promise.all(
      jobRows.map(async (job: any) => {
        try {
          let matchResult;
          const cachedMatch = updatedCache[job.id];

          if (cachedMatch) {
            matchResult = {
              score: cachedMatch.score,
              breakdown: cachedMatch.breakdown,
              computedAt: cachedMatch.cachedAt,
            };
          } else {
            const jobRow: JobRow = {
              role: job.role || job.title,
              related_roles: job.related_roles,
              ai_enhanced_roles: job.ai_enhanced_roles,
              skills_required: job.skills_required,
              ai_enhanced_skills: job.ai_enhanced_skills,
              location: job.location,
              experience_level: job.experience_level,
              salary_range: job.salary_range,
              employment_type: job.employment_type,
              sector: job.sector,
            };

            matchResult = scoreJob(jobRow, userOnboardingData);

            updatedCache[job.id] = {
              score: matchResult.score,
              breakdown: matchResult.breakdown,
              cachedAt: matchResult.computedAt,
            };
            cacheNeedsUpdate = true;
          }

          const rsCapped = Math.min(
            80,
            matchResult.breakdown.rolesScore +
            matchResult.breakdown.skillsScore +
            matchResult.breakdown.sectorScore
          );
          const calculatedTotal = Math.round(
            rsCapped +
            matchResult.breakdown.locationScore +
            matchResult.breakdown.experienceScore +
            matchResult.breakdown.salaryScore +
            matchResult.breakdown.typeScore
          );

          return transformJobToUI(job, calculatedTotal, matchResult.breakdown);
        } catch (error) {
          return transformJobToUI(job, 0, null);
        }
      })
    );

    if (cacheNeedsUpdate) {
      matchCacheService.saveMatchCache(user.id, updatedCache);
    }

    return processedJobs;
  }, [user, userOnboardingData]);

  const transformJobToUI = (job: any, matchScore: number, breakdown: any): JobUI => {
    const finalMatchScore = user ? matchScore : 0;
    const finalBreakdown = user ? breakdown : null;

    let locationStr = 'Location not specified';
    if (typeof job.location === 'string') {
      locationStr = job.location;
    } else if (job.location && typeof job.location === 'object') {
      if (job.location.remote) {
        locationStr = 'Remote';
      } else {
        const parts = [job.location.city, job.location.state, job.location.country].filter(Boolean);
        locationStr = parts.length > 0 ? parts.join(', ') : 'Location not specified';
      }
    }

    let companyStr = 'Unknown Company';
    if (typeof job.company === 'string') {
      companyStr = job.company;
    } else if (job.company && typeof job.company === 'object') {
      companyStr = job.company.name || 'Unknown Company';
    }

    let salaryStr = '';
    if (typeof job.salary === 'string') {
      salaryStr = job.salary;
    } else if (job.salary_range && typeof job.salary_range === 'object') {
      const sal = job.salary_range;
      if (sal.min !== null && sal.currency) {
        salaryStr = `${sal.currency} ${sal.min.toLocaleString()} ${sal.period || ''}`.trim();
      }
    }

    return {
      id: job.id,
      slug: job.slug || job.id,
      title: job.title || 'Untitled Job',
      company: companyStr,
      location: locationStr,
      salary: salaryStr,
      match: finalMatchScore,
      calculatedTotal: finalMatchScore,
      type: job.type || job.employment_type || '',
      breakdown: finalBreakdown,
      postedDate: job.posted_date || job.created_at || null,
    };
  };

  const loadSavedJobs = () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_JOBS);
    if (saved) {
      try {
        setSavedJobs(JSON.parse(saved));
      } catch (e) {}
    }
  };

  const loadAppliedJobs = () => {
    if (typeof window === 'undefined') return;
    const applied = localStorage.getItem(STORAGE_KEYS.APPLIED_JOBS);
    if (applied) {
      try {
        setAppliedJobs(JSON.parse(applied));
      } catch (e) {}
    }
  };

  const handleSave = (jobId: string) => {
    const newSaved = savedJobs.includes(jobId)
      ? savedJobs.filter(id => id !== jobId)
      : [...savedJobs, jobId];
    setSavedJobs(newSaved);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(newSaved));
    }
  };

  const handleApply = (jobId: string) => {
    const newApplied = appliedJobs.includes(jobId)
      ? appliedJobs.filter(id => id !== jobId)
      : [...appliedJobs, jobId];
    setAppliedJobs(newApplied);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.APPLIED_JOBS, JSON.stringify(newApplied));
    }
  };

  const handleShowBreakdown = (job: JobUI) => {
    const breakdown = job.breakdown || {
      rolesScore: 0, skillsScore: 0, sectorScore: 0,
      locationScore: 0, experienceScore: 0, salaryScore: 0, typeScore: 0,
    };
    setMatchModalData({
      breakdown,
      totalScore: job.calculatedTotal || job.match || 0,
      jobTitle: job.title,
      companyName: job.company,
    });
    setMatchModalOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateURL();
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (filters.sector.length > 0) params.set('sector', filters.sector.join(','));
    if (filters.location.length > 0) params.set('location', filters.location.join(','));
    if (currentPage > 1) params.set('page', currentPage.toString());
    router.push(`/tools/internship-finder?${params.toString()}`);
  };

  const handleFilterChange = (filterType: 'sector' | 'location', value: string) => {
    setFilters(prev => {
      const current = prev[filterType];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [filterType]: updated };
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ sector: [], location: [] });
    setSearchQuery('');
    setCurrentPage(1);
    router.push('/tools/internship-finder');
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === 'match') {
      return (b.calculatedTotal || b.match || 0) - (a.calculatedTotal || a.match || 0);
    }
    const dateA = new Date(a.postedDate || 0).getTime();
    const dateB = new Date(b.postedDate || 0).getTime();
    return dateB - dateA;
  });

  const hasFilters = searchQuery || filters.sector.length > 0 || filters.location.length > 0;

  return (
    <>
      <div className="bg-white rounded-2xl p-4 mb-6" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
        <form onSubmit={handleSearch}>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search internship jobs..."
              className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map(cat => (
            <a
              key={cat.id}
              href={cat.url}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              {cat.label}
            </a>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {visibleRoles.map(role => (
            <button
              key={role}
              onClick={() => { setSearchQuery(role); setCurrentPage(1); updateURL(); }}
              className="px-2.5 py-1 rounded-full text-xs bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-200 transition-colors"
            >
              {role}
            </button>
          ))}
          {!rolesExpanded && (
            <button
              onClick={() => setRolesExpanded(true)}
              className="px-2.5 py-1 rounded-full text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              +{popularRoles.length - 14} more
            </button>
          )}
          {rolesExpanded && (
            <button
              onClick={() => setRolesExpanded(false)}
              className="px-2.5 py-1 rounded-full text-xs text-gray-500 hover:text-gray-700"
            >
              Show less
            </button>
          )}
        </div>

        {filtersOpen && (
          <div className="pt-4 border-t space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
              <div className="flex flex-wrap gap-2">
                {sectors.map(sector => (
                  <button
                    key={sector}
                    onClick={() => handleFilterChange('sector', sector)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      filters.sector.includes(sector)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="flex flex-wrap gap-2">
                {locations.map(location => (
                  <button
                    key={location}
                    onClick={() => handleFilterChange('location', location)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      filters.location.includes(location)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          {loading ? 'Loading...' : `${totalJobs.toLocaleString()} internship jobs found`}
          {hasFilters && ` (filtered)`}
        </p>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'match' | 'date')}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 outline-none cursor-pointer"
          >
            <option value="date">Newest First</option>
            {user && <option value="match">Best Match</option>}
          </select>
        </div>
        </div>

        <div className="mb-4">
          <AdUnit slot="4198231153" format="auto" />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="divide-y" style={{ borderColor: theme.colors.border.DEFAULT }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p style={{ color: theme.colors.text.secondary }}>Loading internship opportunities...</p>
            </div>
          ) : sortedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <Briefcase size={48} className="text-gray-400 mb-4" />
              <p className="text-base font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                No internship jobs found
              </p>
              <p className="text-sm text-center" style={{ color: theme.colors.text.secondary }}>
                {hasFilters ? 'Try adjusting your filters' : 'Check back later for new internship opportunities'}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            sortedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                savedJobs={savedJobs}
                appliedJobs={appliedJobs}
                onSave={handleSave}
                onApply={handleApply}
                onShowBreakdown={handleShowBreakdown}
                showMatch={false}
              />
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="my-6">
          <AdUnit slot="9010641928" format="auto" />
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => { setCurrentPage(Math.max(1, currentPage - 1)); updateURL(); }}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => { setCurrentPage(pageNum); updateURL(); }}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <span className="px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => { setCurrentPage(Math.min(totalPages, currentPage + 1)); updateURL(); }}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      <MatchBreakdownModal
        open={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        data={matchModalData}
      />
    </>
  );
}
