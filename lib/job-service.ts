import { supabaseAdmin } from './supabase';
import { geminiService, GroundingResult } from './gemini';
import type { Job, JobSource, GroundingSearch } from './supabase';

// Job expiration and cleanup utilities
export class JobExpirationService {
  // Expire jobs older than 30 days
  async expireOldJobs(): Promise<number> {
    try {
      const { data, error } = await supabaseAdmin.rpc('expire_old_jobs');
      
      if (error) {
        throw error;
      }

      // Get count of expired jobs
      const { count } = await supabaseAdmin
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'expired')
        .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      return count || 0;
    } catch (error) {
      console.error('Error expiring old jobs:', error);
      throw error;
    }
  }

  // Check and expire jobs based on expires_date
  async checkJobExpiration(): Promise<void> {
    try {
      await supabaseAdmin.rpc('check_job_expiration');
    } catch (error) {
      console.error('Error checking job expiration:', error);
      throw error;
    }
  }

  // Get job statistics
  async getJobStatistics(): Promise<any> {
    try {
      const { data, error } = await supabaseAdmin
        .from('job_statistics')
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching job statistics:', error);
      throw error;
    }
  }

  // Refresh source statistics
  async refreshSourceStatistics(): Promise<void> {
    try {
      await supabaseAdmin.rpc('refresh_source_statistics');
    } catch (error) {
      console.error('Error refreshing source statistics:', error);
      throw error;
    }
  }
}

export class JobService {
  private expirationService = new JobExpirationService();

  // Generate duplicate hash for job deduplication
  private generateDuplicateHash(title: string, company: string, sourceUrl?: string): string {
    const hashInput = `${title.toLowerCase().trim()}|${company.toLowerCase().trim()}|${sourceUrl?.toLowerCase().trim() || ''}`;
    return Buffer.from(hashInput).toString('base64');
  }

  // Check if job already exists
  async checkDuplicate(title: string, company: string, sourceUrl?: string): Promise<boolean> {
    const duplicateHash = this.generateDuplicateHash(title, company, sourceUrl);
    
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('id')
      .eq('duplicate_hash', duplicateHash)
      .limit(1);

    if (error) {
      console.error('Error checking duplicate:', error);
      return false;
    }

    return data && data.length > 0;
  }

  // Parse salary string to min/max values
  private parseSalary(salaryString?: string): { min?: number; max?: number; currency: string } {
    if (!salaryString) return { currency: 'USD' };

    const cleanSalary = salaryString.replace(/[,$]/g, '');
    const currency = salaryString.includes('€') ? 'EUR' : 
                    salaryString.includes('£') ? 'GBP' : 'USD';

    // Look for ranges like "80000-120000" or "80k-120k"
    const rangeMatch = cleanSalary.match(/(\d+)k?\s*[-–]\s*(\d+)k?/i);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1]) * (rangeMatch[1].includes('k') ? 1000 : 1);
      const max = parseInt(rangeMatch[2]) * (rangeMatch[2].includes('k') ? 1000 : 1);
      return { min, max, currency };
    }

    // Look for single values like "100000" or "100k"
    const singleMatch = cleanSalary.match(/(\d+)k?/i);
    if (singleMatch) {
      const value = parseInt(singleMatch[1]) * (singleMatch[1].includes('k') ? 1000 : 1);
      return { min: value, max: value, currency };
    }

    return { currency };
  }

  // Add job to database
  async addJob(jobData: GroundingResult, source: string): Promise<string | null> {
    try {
      // Check for duplicates
      const isDuplicate = await this.checkDuplicate(
        jobData.title,
        jobData.company,
        jobData.url
      );

      if (isDuplicate) {
        console.log(`Duplicate job found: ${jobData.title} at ${jobData.company}`);
        return null;
      }

      // Parse salary
      const salaryInfo = this.parseSalary(jobData.salary);

      // Prepare job data
      const job: Partial<Job> = {
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        salary_min: salaryInfo.min,
        salary_max: salaryInfo.max,
        salary_currency: salaryInfo.currency,
        job_type: jobData.job_type || 'Full-time',
        remote: jobData.remote || false,
        description: jobData.description,
        requirements: jobData.requirements || [],
        skills: jobData.skills || [],
        experience_level: jobData.experience_level,
        source,
        source_url: jobData.url,
        posted_date: jobData.posted_date ? new Date(jobData.posted_date).toISOString() : new Date().toISOString(),
        expires_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        status: 'active',
        duplicate_hash: this.generateDuplicateHash(jobData.title, jobData.company, jobData.url)
      };

const { data, error } = await supabaseAdmin
        .from('jobs')
        .insert(job)
        .select('id, slug')
        .single();

      if (error) {
        console.error('Error adding job:', error);
        throw error;
      }

      // Submit to IndexNow if job has slug
      if (data.slug) {
        import('@/lib/services/indexnowService').then(({ submitToIndexNow }) => {
          submitToIndexNow(data.slug).catch(error => {
            console.error('IndexNow submission failed:', error);
          });
        });
      }

      return data.id;
    } catch (error) {
      console.error('Error in addJob:', error);
      throw error;
    }
  }

  // Perform grounding search and add jobs
  async performGroundingSearch(
    query: string,
    roleCategory?: string,
    location?: string,
    maxResults: number = 10
  ): Promise<{ searchId: string; jobsAdded: number }> {
    // Create grounding search record
    const { data: searchData, error: searchError } = await supabaseAdmin
      .from('grounding_searches')
      .insert({
        query,
        role_category: roleCategory,
        location,
        status: 'pending'
      })
      .select('id')
      .single();

    if (searchError) {
      throw new Error(`Failed to create search record: ${searchError.message}`);
    }

    const searchId = searchData.id;

    try {
      // Perform the actual search
      const results = await geminiService.performGroundingSearch(query, location, maxResults);
      
      let jobsAdded = 0;
      const errors: string[] = [];

      // Add each job to the database
      for (const jobResult of results) {
        try {
          const jobId = await this.addJob(jobResult, 'grounding');
          if (jobId) {
            jobsAdded++;
          }
        } catch (error) {
          errors.push(`Failed to add job "${jobResult.title}": ${error}`);
        }
      }

      // Update search record
      await supabaseAdmin
        .from('grounding_searches')
        .update({
          status: 'completed',
          jobs_found: jobsAdded,
          completed_at: new Date().toISOString(),
          error_message: errors.length > 0 ? errors.join('; ') : null
        })
        .eq('id', searchId);

      return { searchId, jobsAdded };
    } catch (error) {
      // Update search record with error
      await supabaseAdmin
        .from('grounding_searches')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString()
        })
        .eq('id', searchId);

      throw error;
    }
  }

  // Parse and add jobs from text
  async parseAndAddJobs(jobText: string, source: string = 'manual'): Promise<number> {
    try {
      const results = await geminiService.parseJobText(jobText);
      let jobsAdded = 0;

      for (const jobResult of results) {
        try {
          const jobId = await this.addJob(jobResult, source);
          if (jobId) {
            jobsAdded++;
          }
        } catch (error) {
          console.error(`Failed to add job "${jobResult.title}":`, error);
        }
      }

      return jobsAdded;
    } catch (error) {
      console.error('Error parsing jobs:', error);
      throw error;
    }
  }

  // Fetch and parse RSS feed
  async fetchRSSFeed(url: string): Promise<number> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
      }

      const rssContent = await response.text();
      const results = await geminiService.parseRSSFeed(rssContent);
      
      let jobsAdded = 0;
      for (const jobResult of results) {
        try {
          const jobId = await this.addJob(jobResult, 'rss');
          if (jobId) {
            jobsAdded++;
          }
        } catch (error) {
          console.error(`Failed to add RSS job "${jobResult.title}":`, error);
        }
      }

      // Update job source last_fetched timestamp
      await supabaseAdmin
        .from('job_sources')
        .update({ last_fetched: new Date().toISOString() })
        .eq('url', url);

      return jobsAdded;
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      throw error;
    }
  }

  // Get jobs with pagination and filtering
  async getJobs(
    page: number = 1,
    limit: number = 20,
    filters?: {
      search?: string;
      location?: string;
      remote?: boolean;
      source?: string;
    }
  ): Promise<{ jobs: Job[]; total: number }> {
    let query = supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,company.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters?.remote !== undefined) {
      query = query.eq('remote', filters.remote);
    }

    if (filters?.source) {
      query = query.eq('source', filters.source);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    return {
      jobs: data || [],
      total: count || 0
    };
  }

  // Get job sources
  async getJobSources(): Promise<JobSource[]> {
    const { data, error } = await supabaseAdmin
      .from('job_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch job sources: ${error.message}`);
    }

    return data || [];
  }

  // Add job source
  async addJobSource(source: Omit<JobSource, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabaseAdmin
      .from('job_sources')
      .insert(source)
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to add job source: ${error.message}`);
    }

    return data.id;
  }

  // Get grounding searches
  async getGroundingSearches(limit: number = 50): Promise<GroundingSearch[]> {
    const { data, error } = await supabaseAdmin
      .from('grounding_searches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch grounding searches: ${error.message}`);
    }

    return data || [];
  }

  // Get job statistics for admin dashboard
  async getJobStatistics(): Promise<any> {
    return this.expirationService.getJobStatistics();
  }

  // Expire old jobs (can be called manually or via cron)
  async expireOldJobs(): Promise<number> {
    return this.expirationService.expireOldJobs();
  }

  // Check job expiration
  async checkJobExpiration(): Promise<void> {
    return this.expirationService.checkJobExpiration();
  }

  // Get source performance data
  async getSourcePerformance(): Promise<any[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('source_performance')
        .select('*')
        .order('total_jobs', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching source performance:', error);
      throw error;
    }
  }

  // Update job source statistics
  async updateSourceStatistics(): Promise<void> {
    try {
      await supabaseAdmin.rpc('refresh_source_statistics');
    } catch (error) {
      console.error('Error updating source statistics:', error);
      throw error;
    }
  }
}

export const jobService = new JobService();