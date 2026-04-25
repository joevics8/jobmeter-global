export function generateJobSlug(job: {
    id: string;
    title?: string;
    company?: string | { name: string };
  }): string {
    const title = job.title || 'Untitled Job';
    const company = typeof job.company === 'string' ? job.company : job.company?.name || 'Unknown Company';
    
    // Clean and format the strings
    const cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
      
    const cleanCompany = company
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
      
    // Create slug: company-job-title-id
    return `${cleanCompany}-${cleanTitle}-${job.id}`;
  }
  
  export function parseJobSlug(slug: string): { id: string } | null {
    // Extract ID from the end of the slug (after the last hyphen)
    const parts = slug.split('-');
    const id = parts[parts.length - 1];
    
    // Basic validation - check if it's a UUID or numeric ID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || /^\d+$/.test(id)) {
      return { id };
    }
    
    return null;
  }