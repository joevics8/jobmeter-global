"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Bookmark, CheckCircle2, MapPin, Calendar, RefreshCw } from 'lucide-react';
import { theme } from '@/lib/theme';
import Link from 'next/link';
import { scoreJob, JobRow, UserOnboardingData } from '@/lib/matching/matchEngine';
import { matchCacheService } from '@/lib/matching/matchCache';

const STORAGE_KEYS = {
  SAVED_JOBS: 'saved_jobs',
  APPLIED_JOBS: 'applied_jobs',
};

interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  match?: number;
  calculatedTotal?: number;
  savedDate?: string;
  appliedDate?: string;
  breakdown?: any;
}

// ─── Ad Components ────────────────────────────────────────────────────────────

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdTopDisplay = () => {
  useEffect(() => {
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }, []);
  return (
    <div className="mb-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1119289641389825"
        data-ad-slot="4198231153"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

const AdInFeed = ({ index }: { index: number }) => {
  useEffect(() => {
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }, []);
  return (
    <div className="my-2">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format="fluid"
        data-ad-layout-key="-fb+5w+4e-db+86"
        data-ad-client="ca-pub-1119289641389825"
        data-ad-slot="9025117620"
      />
    </div>
  );
};

// Alternates between two in-article slots
const AdInArticle = ({ nth }: { nth: number }) => {
  useEffect(() => {
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }, []);
  const slot = nth % 2 === 0 ? '4690286797' : '8181708196';
  return (
    <div className="my-2">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-1119289641389825"
        data-ad-slot={slot}
      />
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SavedPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'saved' | 'applied'>('saved');
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userOnboardingData, setUserOnboardingData] = useState<UserOnboardingData | null>(null);

  useEffect(() => {
    checkAuth();
    loadJobIds();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserOnboardingData();
    } else {
      setUserOnboardingData(null);
    }
  }, [user]);

  useEffect(() => {
    if (savedJobIds.length > 0 || appliedJobIds.length > 0) {
      if (user && userOnboardingData === undefined) {
        return;
      }
      fetchJobDetails();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedJobIds, appliedJobIds, user, userOnboardingData]);

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

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching onboarding data:', error);
        return;
      }

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
      } else {
        setUserOnboardingData({});
      }
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
      setUserOnboardingData({});
    }
  };

  const loadJobIds = () => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_JOBS);
      const applied = localStorage.getItem(STORAGE_KEYS.APPLIED_JOBS);

      const savedIds = saved ? JSON.parse(saved) : [];
      const appliedIds = applied ? JSON.parse(applied) : [];

      setSavedJobIds(savedIds);
      setAppliedJobIds(appliedIds);
    } catch (e) {
      console.error('Error loading job IDs:', e);
    }
  };

  const processJobsWithMatching = useCallback(async (jobRows: any[]): Promise<SavedJob[]> => {
    if (!user || !userOnboardingData) {
      return jobRows.map((job: any) => transformJobToSavedJob(job, 0, null));
    }

    const matchCache = matchCacheService.loadMatchCache(user.id);
    let cacheNeedsUpdate = false;
    const updatedCache = { ...matchCache };
    const processedJobs: SavedJob[] = [];

    for (const job of jobRows) {
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

        processedJobs.push(transformJobToSavedJob(job, calculatedTotal, matchResult.breakdown));
      } catch (error) {
        console.error(`Error processing match for job ${job.id}:`, error);
        processedJobs.push(transformJobToSavedJob(job, 0, null));
      }
    }

    if (cacheNeedsUpdate) {
      matchCacheService.saveMatchCache(user.id, updatedCache);
    }

    return processedJobs;
  }, [user, userOnboardingData]);

  const transformJobToSavedJob = (job: any, matchScore: number, breakdown: any): SavedJob => {
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

    return {
      id: job.id,
      title: job.title || 'Untitled Job',
      company: companyStr,
      location: locationStr,
      match: matchScore,
      calculatedTotal: matchScore,
      breakdown: breakdown,
    };
  };

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const allJobIds = [...new Set([...savedJobIds, ...appliedJobIds])];

      if (allJobIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .in('id', allJobIds);

      if (error) throw error;

      const processedJobs = await processJobsWithMatching(data || []);
      const saved = processedJobs.filter(job => savedJobIds.includes(job.id));
      const applied = processedJobs.filter(job => appliedJobIds.includes(job.id));

      setSavedJobs(saved);
      setAppliedJobs(applied);
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = (jobId: string) => {
    if (typeof window === 'undefined') return;
    const updated = savedJobIds.filter(id => id !== jobId);
    setSavedJobIds(updated);
    setSavedJobs(savedJobs.filter(j => j.id !== jobId));
    localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(updated));
  };

  const handleUnapply = (jobId: string) => {
    if (typeof window === 'undefined') return;
    const updated = appliedJobIds.filter(id => id !== jobId);
    setAppliedJobIds(updated);
    setAppliedJobs(appliedJobs.filter(j => j.id !== jobId));
    localStorage.setItem(STORAGE_KEYS.APPLIED_JOBS, JSON.stringify(updated));
  };

  const handleRefresh = async () => {
    if (!user || typeof window === 'undefined') return;

    matchCacheService.clearMatchCache(user.id);
    let currentSavedIds: string[] = [];
    let currentAppliedIds: string[] = [];

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_JOBS);
      const applied = localStorage.getItem(STORAGE_KEYS.APPLIED_JOBS);
      if (saved) currentSavedIds = JSON.parse(saved);
      if (applied) currentAppliedIds = JSON.parse(applied);
      setSavedJobIds(currentSavedIds);
      setAppliedJobIds(currentAppliedIds);
    } catch (e) {
      console.error('Error loading job IDs:', e);
      return;
    }

    const allJobIds = [...new Set([...currentSavedIds, ...currentAppliedIds])];

    if (allJobIds.length === 0) {
      setSavedJobs([]);
      setAppliedJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .in('id', allJobIds);

      if (error) throw error;

      const processedJobs = await processJobsWithMatching(data || []);
      const saved = processedJobs.filter(job => currentSavedIds.includes(job.id));
      const applied = processedJobs.filter(job => currentAppliedIds.includes(job.id));

      setSavedJobs(saved);
      setAppliedJobs(applied);
    } catch (error) {
      console.error('Error refreshing job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (match: number) => {
    if (match >= 50) return theme.colors.match.good;
    if (match >= 31) return theme.colors.match.average;
    return theme.colors.match.bad;
  };

  const filteredJobs = activeTab === 'saved'
    ? savedJobs.filter(j => !appliedJobIds.includes(j.id))
    : appliedJobs;

  // Build list items with in-feed ads injected every 7 cards
  const renderJobList = () => {
    const items: React.ReactNode[] = [];
    let adBreakCount = 0;

    filteredJobs.forEach((job, index) => {
      // Insert in-feed ad before every 7th card (positions 6, 13, 20...)
      if (index > 0 && index % 7 === 0) {
        items.push(
          <AdInFeed key={`ad-feed-${index}`} index={adBreakCount} />
        );
        adBreakCount++;
      }

      items.push(
        <Link key={job.id} href={`/jobs/${job.id}`}>
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold mb-1 text-gray-900 truncate">
                  {job.title}
                </h3>
                <p className="text-sm font-medium mb-3 text-gray-600">
                  {job.company}
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-500" />
                    <span className="text-xs text-gray-600">{job.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center"
                  style={{
                    borderColor: getMatchColor(job.calculatedTotal || job.match || 0),
                    backgroundColor: theme.colors.background.muted,
                  }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: getMatchColor(job.calculatedTotal || job.match || 0) }}
                  >
                    {job.calculatedTotal || job.match || 0}%
                  </span>
                  <span className="text-[10px] font-medium text-gray-500">Match</span>
                </div>
                {activeTab === 'saved' && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUnsave(job.id);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    Unsave
                  </button>
                )}
                {activeTab === 'applied' && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUnapply(job.id);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </Link>
      );
    });

    return items;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
      {/* Header */}
      <div
        className="pt-12 pb-8 px-6"
        style={{ backgroundColor: theme.colors.primary.DEFAULT }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">Saved Jobs</h1>
            <p className="text-white/80">Keep track of jobs you&apos;re interested in</p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <RefreshCw size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-6">
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'saved'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600'
            }`}
          >
            <Bookmark size={16} style={{ color: activeTab === 'saved' ? theme.colors.primary.DEFAULT : theme.colors.text.secondary }} />
            <span>Saved ({savedJobs.filter(j => !appliedJobIds.includes(j.id)).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('applied')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'applied'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600'
            }`}
          >
            <CheckCircle2 size={16} style={{ color: activeTab === 'applied' ? theme.colors.primary.DEFAULT : theme.colors.text.secondary }} />
            <span>Applied ({appliedJobs.length})</span>
          </button>
        </div>

        {/* Top display ad — below tabs, above job list */}
        <AdTopDisplay />
      </div>

      {/* Jobs List */}
      <div className="px-6 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 p-4 rounded-full bg-gray-100">
              {activeTab === 'saved' ? (
                <Bookmark size={40} className="text-gray-400" />
              ) : (
                <CheckCircle2 size={40} className="text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              No {activeTab} jobs yet
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-xs">
              {activeTab === 'saved'
                ? "Save jobs you're interested in to view them here"
                : "Jobs you've applied to will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {renderJobList()}
          </div>
        )}
      </div>
    </div>
  );
}