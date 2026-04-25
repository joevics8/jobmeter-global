import { supabase } from '@/lib/supabase';

export async function generateUniqueSlug(title: string, companyName: string, jobId?: string): Promise<string> {
  // Clean the title and company
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
    
  const cleanCompany = companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
    
  // Base slug: company-job-title
  let baseSlug = `${cleanCompany}-${cleanTitle}`;
  let slug = baseSlug;
  let counter = 1;
  
  // Ensure uniqueness by checking database
  while (await slugExists(slug, jobId)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    
    // Prevent infinite loops (fallback to timestamp)
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  
  return slug;
}

async function slugExists(slug: string, excludeJobId?: string): Promise<boolean> {
  let query = supabase
    .from('jobs')
    .select('id')
    .eq('slug', slug)
    .limit(1);
    
  if (excludeJobId) {
    query = query.neq('id', excludeJobId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error checking slug uniqueness:', error);
    return false; // Assume it doesn't exist on error
  }
  
  return data && data.length > 0;
}