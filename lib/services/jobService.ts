import { supabase } from '@/lib/supabase';
import { generateUniqueSlug } from '@/lib/utils/slugGenerator';

export interface JobData {
  title: string;
  company: string | { name: string };
  location?: any;
  description?: string;
  skills_required?: string[];
  employment_type?: string;
  salary_range?: any;
  experience_level?: string;
  deadline?: string;
  application?: any;
  [key: string]: any;
}

export async function createJob(jobData: JobData) {
  try {
    // Generate slug for new jobs
    const companyName = typeof jobData.company === 'string' 
      ? jobData.company 
      : jobData.company?.name || 'company';
    
    const slug = await generateUniqueSlug(jobData.title, companyName);
    
    const jobWithSlug = {
      ...jobData,
      slug
    };
    
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobWithSlug)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating job:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in createJob:', error);
    return { data: null, error };
  }
}

export async function updateJob(jobId: string, jobData: Partial<JobData>) {
  try {
    // Regenerate slug if title or company changed
    let slugUpdate = {};
    
    if (jobData.title || jobData.company) {
      const existingJob = await getJobById(jobId);
      if (existingJob) {
        const newTitle = jobData.title || existingJob.title;
        const newCompany = typeof jobData.company === 'string'
          ? jobData.company
          : jobData.company?.name || existingJob.company?.name || existingJob.company || 'company';
          
        const currentCompany = typeof existingJob.company === 'string'
          ? existingJob.company
          : existingJob.company?.name || 'company';
        
        // Only regenerate if title or company actually changed
        if (newTitle !== existingJob.title || newCompany !== currentCompany) {
          const newSlug = await generateUniqueSlug(newTitle, newCompany, jobId);
          slugUpdate = { slug: newSlug };
        }
      }
    }
    
    const { data, error } = await supabase
      .from('jobs')
      .update({ ...jobData, ...slugUpdate })
      .eq('id', jobId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating job:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in updateJob:', error);
    return { data: null, error };
  }
}

export async function getJobById(jobId: string) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (error) {
      console.error('Error fetching job:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getJobById:', error);
    return null;
  }
}

export async function getJobBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('slug', slug)
      .single();
      
    if (error) {
      console.error('Error fetching job by slug:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getJobBySlug:', error);
    return null;
  }
}

export async function getJobBySlugOrId(identifier: string) {
  try {
    // First try to find by slug
    const jobBySlug = await getJobBySlug(identifier);
    if (jobBySlug) {
      return jobBySlug;
    }
    
    // If not found by slug, try by ID
    return await getJobById(identifier);
  } catch (error) {
    console.error('Error in getJobBySlugOrId:', error);
    return null;
  }
}

export async function getJobsForSitemap(limit: number = 1000) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, slug, title, company, updated_at')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching jobs for sitemap:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getJobsForSitemap:', error);
    return [];
  }
}