import { NextRequest, NextResponse } from 'next/server';

// Format date for RSS (RFC 822)
const formatRSSDate = (dateString?: string) => {
  if (!dateString) return new Date().toUTCString();
  return new Date(dateString).toUTCString();
};

// Escape XML special characters
const escapeXML = (text?: any) => {
  if (text === null || text === undefined) return '';
  const str = String(text); // Convert to string
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Helper function to extract text from objects
const extractText = (obj: any): string => {
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'object' && obj !== null) {
    if (obj.name) return obj.name;
    if (obj.city || obj.state) {
      const parts = [obj.city, obj.state, obj.country].filter(Boolean);
      return parts.join(', ');
    }
  }
  return String(obj || '');
};

// Helper function to format salary
const formatSalary = (salaryRange: any): string => {
  if (!salaryRange || typeof salaryRange !== 'object') return '';
  
  const { min, max, currency, period } = salaryRange;
  if (!min && !max) return '';
  
  const currencySymbol = currency || 'NGN';
  const periodText = period ? `/${period}` : '';
  
  if (min && max) {
    return `${currencySymbol} ${min?.toLocaleString()} - ${max?.toLocaleString()}${periodText}`;
  } else if (min) {
    return `${currencySymbol} ${min?.toLocaleString()}+${periodText}`;
  } else if (max) {
    return `${currencySymbol} up to ${max?.toLocaleString()}${periodText}`;
  }
  
  return '';
};

export async function GET(request: NextRequest) {
  try {
    console.log('RSS Feed API called');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100);
    
    // Get supabase admin client
    const { supabaseAdmin } = await import('@/lib/supabase');
    
    // Fetch jobs directly with all needed fields
    const { data: jobs, error, count } = await supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Jobs fetched:', jobs?.length || 0);
    
    const baseUrl = 'https://www.jobmeter.app';

    // Generate RSS XML
    const rssItems = jobs?.map(job => {
      const title = escapeXML(job.title || 'Untitled Job');
      const slug = job.slug || job.id;
      const link = escapeXML(`${baseUrl}/jobs/${slug}`);
      const company = extractText(job.company);
      const location = extractText(job.location);
      const category = job.category || 'jobs';
      
      // Build comprehensive description with CDATA
      let description = '<![CDATA[';
      description += `<p><strong>${escapeXML(job.title || '')}</strong></p>`;
      description += `<p><strong>Company:</strong> ${escapeXML(company)}</p>`;
      
      if (location) {
        description += `<p><strong>Location:</strong> ${escapeXML(location)}</p>`;
      }
      
      if (job.employment_type) {
        description += `<p><strong>Type:</strong> ${escapeXML(job.employment_type)}</p>`;
      }
      
      if (job.experience_level) {
        description += `<p><strong>Experience Level:</strong> ${escapeXML(job.experience_level)}</p>`;
      }
      
      if (job.sector) {
        description += `<p><strong>Sector:</strong> ${escapeXML(String(job.sector))}</p>`;
      }
      
      const salary = formatSalary(job.salary_range);
      if (salary) {
        description += `<p><strong>Salary:</strong> ${escapeXML(salary)}</p>`;
      }
      
      if (job.skills_required && Array.isArray(job.skills_required) && job.skills_required.length > 0) {
        description += `<p><strong>Skills Required:</strong> ${escapeXML(job.skills_required.join(', '))}</p>`;
      }
      
      if (job.responsibilities && Array.isArray(job.responsibilities) && job.responsibilities.length > 0) {
        description += `<p><strong>Responsibilities:</strong></p><ul>`;
        job.responsibilities.forEach((resp: any) => {
          description += `<li>${escapeXML(String(resp))}</li>`;
        });
        description += '</ul>';
      }
      
      if (job.qualifications && Array.isArray(job.qualifications) && job.qualifications.length > 0) {
        description += `<p><strong>Qualifications:</strong></p><ul>`;
        job.qualifications.forEach((qual: any) => {
          description += `<li>${escapeXML(String(qual))}</li>`;
        });
        description += '</ul>';
      }
      
      if (job.description) {
        const cleanDescription = String(job.description).replace(/<[^>]*>/g, '');
        description += `<p><strong>Description:</strong></p><div>${escapeXML(cleanDescription)}</div>`;
      }
      
      if (job.benefits && Array.isArray(job.benefits) && job.benefits.length > 0) {
        description += `<p><strong>Benefits:</strong> ${escapeXML(job.benefits.join(', '))}</p>`;
      }
      
      if (job.deadline) {
        description += `<p><strong>Application Deadline:</strong> ${escapeXML(job.deadline)}</p>`;
      }
      
      description += ']]>';

      return `
  <item>
    <title>${title}</title>
    <link>${link}</link>
    <description>${description}</description>
    <pubDate>${formatRSSDate(job.created_at)}</pubDate>
    <guid>${escapeXML(slug)}</guid>
    <author>JobMeter Team</author>
    <category>${escapeXML(category)}</category>
    ${job.employment_type ? `<category>${escapeXML(job.employment_type)}</category>` : ''}
    ${location ? `<category>${escapeXML(location)}</category>` : ''}
    ${job.experience_level ? `<category>${escapeXML(job.experience_level)}</category>` : ''}
    ${job.sector ? `<category>${escapeXML(String(job.sector))}</category>` : ''}
    ${job.skills_required ? job.skills_required.map((skill: any) => `<category>${escapeXML(String(skill))}</category>`).join('') : ''}
  </item>`;
    }).join('\n') || '';

    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>JobMeter Jobs Feed</title>
    <link>https://www.jobmeter.app</link>
    <description>Latest job listings from JobMeter - Find your dream job in Nigeria and beyond</description>
    <language>en-us</language>
    <atom:link href="https://www.jobmeter.app/api/jobs/feed" rel="self" type="application/rss+xml" />
    <lastBuildDate>${formatRSSDate()}</lastBuildDate>
    <generator>JobMeter RSS Feed Generator</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <ttl>60</ttl>
    ${rssItems}
  </channel>
</rss>`;

    const response = new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'Last-Modified': new Date().toUTCString(),
      },
    });
    
    return response;
  } catch (error) {
    console.error('RSS Feed API error:', error);
    console.error('Error type:', typeof error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = JSON.stringify(error);
    }
    
    // Return XML error response
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Error</title>
    <description>Failed to generate JobMeter RSS feed</description>
    <item>
      <title>Feed Generation Error</title>
      <description>Error: ${escapeXML(errorMessage)}</description>
      <pubDate>${formatRSSDate()}</pubDate>
    </item>
  </channel>
</rss>`;

    return new NextResponse(errorXml, {
      status: 500,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
      },
    });
  }
}