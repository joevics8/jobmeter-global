"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';
import JobFeedHeader from '@/components/jobs/JobFeedHeader';
import JobCard from '@/components/jobs/JobCard';
import { JobUI } from '@/components/jobs/JobCard';
import JobFilters from '@/components/jobs/JobFilters';
import { ChevronDown, Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';

import { OrganizationSchema, WebSiteSchema } from '@/components/seo/StructuredData';

const STORAGE_KEYS = {
  SAVED_JOBS: 'saved_jobs',
  APPLIED_JOBS: 'applied_jobs',
};

const JOBS_PER_PAGE = 100;
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours

export default function LatestJobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [latestJobs, setLatestJobs] = useState<JobUI[]>([]);
  const [latestJobsLoading, setLatestJobsLoading] = useState(true);
  const [latestJobsPage, setLatestJobsPage] = useState(1);
  const [latestJobsHasMore, setLatestJobsHasMore] = useState(true);
  
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    location: [] as string[],
    sector: [] as string[],
    employmentType: [] as string[],
    salaryRange: undefined as { min: number; max: number } | undefined,
    remote: false,
  });

  useEffect(() => {
    checkAuth();
    loadSavedJobs();
    loadAppliedJobs();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
        setUserName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initialize search query and filters from URL parameters
  useEffect(() => {
    const searchParam = searchParams.get('search');
    const locationParam = searchParams.get('location');
    const sectorParam = searchParams.get('sector');
    const employmentTypeParam = searchParams.get('employmentType');
    const salaryMinParam = searchParams.get('salaryMin');
    const salaryMaxParam = searchParams.get('salaryMax');
    const remoteParam = searchParams.get('remote');

    if (searchParam) {
      setSearchQuery(searchParam);
      setFilters(prev => ({ ...prev, search: searchParam }));
    }

    if (locationParam) {
      setFilters(prev => ({ ...prev, location: locationParam.split(',') }));
    }

    if (sectorParam) {
      setFilters(prev => ({ ...prev, sector: sectorParam.split(',') }));
    }

    if (employmentTypeParam) {
      setFilters(prev => ({ ...prev, employmentType: employmentTypeParam.split(',') }));
    }

    if (salaryMinParam || salaryMaxParam) {
      setFilters(prev => ({
        ...prev,
        salaryRange: {
          min: salaryMinParam ? parseInt(salaryMinParam) : 0,
          max: salaryMaxParam ? parseInt(salaryMaxParam) : 0,
        }
      }));
    }

    if (remoteParam === 'true') {
      setFilters(prev => ({ ...prev, remote: true }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Fetch latest jobs on mount
  useEffect(() => {
    if (!authChecked) return;
    
    if (latestJobs.length === 0) {
      fetchLatestJobs(1);
    }
  }, [authChecked]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
    } else {
      setUser(null);
    }
    setAuthChecked(true);
  };

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setUserName(data.full_name || null);
    }
  };

  const transformJobToUI = (job: any, matchScore: number = 0): JobUI => {
    let locationStr = 'Location not specified';
    if (typeof job.location === 'string') {
      locationStr = job.location;
    } else if (job.location && typeof job.location === 'object') {
      const loc = job.location;
      if (loc.remote) {
        locationStr = 'Remote';
      } else {
        const parts = [loc.city, loc.state, loc.country].filter(Boolean);
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

    const getRelativeTime = (dateString: string | null): string | undefined => {
      if (!dateString) return undefined;
      
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return '1 day ago';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) {
          const weeks = Math.floor(diffInDays / 7);
          return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
        }
        if (diffInDays < 365) {
          const months = Math.floor(diffInDays / 30);
          return months === 1 ? '1 month ago' : `${months} months ago`;
        }
        const years = Math.floor(diffInDays / 365);
        return years === 1 ? '1 year ago' : `${years} years ago`;
      } catch {
        return undefined;
      }
    };

    return {
      id: job.id,
      slug: job.slug || job.id,
      title: job.title || 'Untitled Job',
      company: companyStr,
      location: locationStr,
      salary: salaryStr,
      match: matchScore,
      calculatedTotal: matchScore,
      type: job.type || job.employment_type || '',
      breakdown: null,
      postedDate: getRelativeTime(job.posted_date || job.created_at),
      description: job.description || job.job_description || '',
    };
  };

  const fetchLatestJobs = async (page: number = 1) => {
    try {
      setLatestJobsLoading(true);

      const CACHE_KEY = 'latest_jobs_all';
      const CACHE_TIMESTAMP_KEY = 'latest_jobs_all_ts';

      // Check sessionStorage cache first
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      const cacheTimestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);

      let allJobs: any[] = [];

      if (cachedData && cacheTimestamp) {
        const isCacheValid = Date.now() - parseInt(cacheTimestamp, 10) < CACHE_DURATION;
        if (isCacheValid) {
          allJobs = JSON.parse(cachedData);
        }
      }

      if (allJobs.length === 0) {
        // Fetch from Redis-cached API instead of Supabase directly
        const res = await fetch('/api/jobs');
        if (!res.ok) throw new Error(`Jobs API error: ${res.status}`);
        const { jobs } = await res.json();
        allJobs = jobs || [];

        // Cache all jobs in sessionStorage
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(allJobs));
          sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        } catch (e) {
          console.warn('sessionStorage write failed:', e);
        }
      }

      // Paginate client-side
      const start = (page - 1) * JOBS_PER_PAGE;
      const pageJobs = allJobs.slice(start, start + JOBS_PER_PAGE);
      const uiJobs = pageJobs.map((job: any) => transformJobToUI(job, 0));

      if (page === 1) {
        setLatestJobs(uiJobs);
      } else {
        setLatestJobs(prev => [...prev, ...uiJobs]);
      }

      setLatestJobsHasMore(start + JOBS_PER_PAGE < allJobs.length);
    } catch (error) {
      console.error('Error fetching latest jobs:', error);
    } finally {
      setLatestJobsLoading(false);
    }
  };

  const loadSavedJobs = () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_JOBS);
    if (saved) {
      try {
        setSavedJobs(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved jobs:', e);
      }
    }
  };

  const loadAppliedJobs = () => {
    if (typeof window === 'undefined') return;
    const applied = localStorage.getItem(STORAGE_KEYS.APPLIED_JOBS);
    if (applied) {
      try {
        setAppliedJobs(JSON.parse(applied));
      } catch (e) {
        console.error('Error loading applied jobs:', e);
      }
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

      if (!appliedJobs.includes(jobId)) {
        const saved = localStorage.getItem(STORAGE_KEYS.SAVED_JOBS);
        if (saved) {
          try {
            const savedArray: string[] = JSON.parse(saved);
            if (savedArray.includes(jobId)) {
              const updatedSaved = savedArray.filter(id => id !== jobId);
              localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(updatedSaved));
              setSavedJobs(updatedSaved);
            }
          } catch (e) {
            console.error('Error updating saved jobs:', e);
          }
        }
      }
    }
  };

  // Filter jobs
  const filteredJobs = useMemo(() => {
    if (latestJobsLoading && latestJobs.length === 0) return [];
    
    return latestJobs.filter(job => {
      // Skip applied jobs
      if (appliedJobs.includes(job.id)) return false;
      
      const jobLocationLower = job.location.toLowerCase();
      const jobTypeLower = job.type?.toLowerCase() || '';
      
      // Search filter
      const query = filters.search.toLowerCase();
      if (query) {
        const titleMatch = job.title.toLowerCase().includes(query);
        const companyMatch = job.company.toLowerCase().includes(query);
        const descriptionMatch = job.description?.toLowerCase().includes(query) || false;
        if (!titleMatch && !companyMatch && !descriptionMatch) return false;
      }
      
      // Location filter
      if (filters.location && filters.location.length > 0) {
        const locationMatch = filters.location.some(loc => 
          jobLocationLower.includes(loc.toLowerCase())
        );
        if (!locationMatch) return false;
      }
      
      // Remote filter
      if (filters.remote && !jobLocationLower.includes('remote')) {
        return false;
      }
      
      // Employment type filter
      if (filters.employmentType && filters.employmentType.length > 0) {
        const typeMatch = filters.employmentType.some(type => {
          if (type.toLowerCase() === 'remote') {
            return jobLocationLower.includes('remote');
          }
          return jobTypeLower.includes(type.toLowerCase()) || type.toLowerCase().includes(jobTypeLower);
        });
        if (!typeMatch) return false;
      }
      
      // Salary filter
      if (filters.salaryRange) {
        const getSalaryNumber = (salary: string) => {
          if (!salary) return 0;
          const match = salary.match(/[\d,]+/);
          return match ? parseInt(match[0].replace(/,/g, '')) : 0;
        };
        const jobSalary = getSalaryNumber(job.salary || '');
        
        if (filters.salaryRange.min > 0 && jobSalary < filters.salaryRange.min) {
          return false;
        }
        if (filters.salaryRange.max > 0 && jobSalary > filters.salaryRange.max) {
          return false;
        }
      }
      
      return true;
    });
  }, [latestJobs, filters, appliedJobs, latestJobsLoading]);

  // Handle infinite scroll
  useEffect(() => {
    if (!latestJobsHasMore || latestJobsLoading) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      // Load more when user is 200px from bottom
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        setLatestJobsPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [latestJobsHasMore, latestJobsLoading]);

  // Fetch next page when page number changes
  useEffect(() => {
    if (latestJobsPage > 1) {
      fetchLatestJobs(latestJobsPage);
    }
  }, [latestJobsPage]);

  return (
    <>
      <OrganizationSchema />
      <WebSiteSchema 
        searchAction={{
          target: 'https://remote.jobmeter.app/latest-jobs?q={search_term_string}',
          queryInput: 'required name=search_term_string',
        }}
      />
      
      <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
        <JobFeedHeader
          userName={userName}
          refreshingMatches={false}
          onRefreshMatches={() => {}}
          onCreateCV={() => {
            router.push('/cv?tab=cv');
          }}
          onSubmitJob={() => router.push('/submit')}
        />



        {/* Page Title */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text.primary }}>
            Latest Jobs
          </h1>
          <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
            Browse the newest job opportunities posted recently
          </p>
        </div>

        {/* Search Bar and Filters */}
        <div className="px-6 py-4 space-y-4">
          <div className="relative">
            <Search 
              size={20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: theme.colors.text.secondary }}
            />
            <input
              type="text"
              placeholder="Search jobs by title, company, or description..."
              value={filters.search}
              onChange={(e) => {
                const newSearch = e.target.value;
                setFilters(prev => ({ ...prev, search: newSearch }));
                setSearchQuery(newSearch);
                
                const params = new URLSearchParams(searchParams.toString());
                if (newSearch) {
                  params.set('search', newSearch);
                } else {
                  params.delete('search');
                }
                const queryString = params.toString();
                const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
                router.replace(newUrl);
              }}
              className="w-full pl-10 pr-10 py-3 rounded-lg border outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: theme.colors.background.DEFAULT,
                borderColor: theme.colors.border.DEFAULT,
                color: theme.colors.text.primary,
              }}
            />
            {filters.search && (
              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, search: '' }));
                  setSearchQuery('');
                  
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('search');
                  const queryString = params.toString();
                  const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
                  router.replace(newUrl);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={16} style={{ color: theme.colors.text.secondary }} />
              </button>
            )}
          </div>
          
          {/* Filter Button */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={18} />
              <span className="font-medium">Filters</span>
              {(
                (filters.location && filters.location.length > 0) ||
                (filters.sector && filters.sector.length > 0) ||
                (filters.employmentType && filters.employmentType.length > 0) ||
                filters.salaryRange ||
                filters.remote
              ) && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>
          
          {!latestJobsLoading && (filters.search || 
            (filters.location && filters.location.length > 0) ||
            (filters.sector && filters.sector.length > 0) ||
            (filters.employmentType && filters.employmentType.length > 0) ||
            filters.salaryRange ||
            filters.remote) && (
            <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
              Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Filters Modal */}
        <JobFilters
          filters={filters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
            
            const params = new URLSearchParams();
            
            if (newFilters.search) {
              params.set('search', newFilters.search);
            }
            
            if (newFilters.location && newFilters.location.length > 0) {
              params.set('location', newFilters.location.join(','));
            }
            
            if (newFilters.sector && newFilters.sector.length > 0) {
              params.set('sector', newFilters.sector.join(','));
            }
            
            if (newFilters.employmentType && newFilters.employmentType.length > 0) {
              params.set('employmentType', newFilters.employmentType.join(','));
            }
            
            if (newFilters.salaryRange) {
              if (newFilters.salaryRange.min > 0) {
                params.set('salaryMin', newFilters.salaryRange.min.toString());
              }
              if (newFilters.salaryRange.max > 0) {
                params.set('salaryMax', newFilters.salaryRange.max.toString());
              }
            }
            
            if (newFilters.remote) {
              params.set('remote', 'true');
            }
            
            const queryString = params.toString();
            const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
            router.replace(newUrl);
          }}
          isOpen={filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
        />

        {/* Job List */}
        <div className="px-6 py-4">
          {latestJobsLoading && latestJobs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p style={{ color: theme.colors.text.secondary }}>Loading latest jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p
                className="text-base font-medium mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                {filters.search ? 'No jobs found matching your search' : 'No jobs found'}
              </p>
              <p
                className="text-sm text-center"
                style={{ color: theme.colors.text.secondary }}
              >
                {filters.search ? 'Try adjusting your search terms' : 'Check back later for new opportunities'}
              </p>
            </div>
          ) : (
            <>
              {filteredJobs.map((job) => (
                <React.Fragment key={job.id}>
                  <JobCard
                    job={job}
                    savedJobs={savedJobs}
                    appliedJobs={appliedJobs}
                    onSave={handleSave}
                    onApply={handleApply}
                    onShowBreakdown={() => {}} // No breakdown for latest jobs
                    showMatch={false} // Hide match circle
                  />
                </React.Fragment>
              ))}
              {latestJobsLoading && (
                <div className="flex items-center justify-center py-6">
                  <p style={{ color: theme.colors.text.secondary }}>Loading more jobs...</p>
                </div>
              )}
              {!latestJobsHasMore && latestJobs.length > 0 && (
                <div className="flex items-center justify-center py-6">
                  <p style={{ color: theme.colors.text.secondary }}>No more jobs to load</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
      />
    </>
  );
}