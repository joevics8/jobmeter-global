/**
 * Company matching utilities for job-company relationships
 */

export interface CompanyInfo {
  name: string;
  website?: string;
  industry?: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  logo_url?: string;
  industry?: string;
  website_url?: string;
}

/**
 * Extract company name from JSON string or return plain text
 */
export function getCompanyName(companyField: string | CompanyInfo): string {
  if (!companyField) return 'Confidential Employer';
  
  if (typeof companyField === 'string') {
    try {
      const parsed = JSON.parse(companyField);
      return parsed.name || 'Confidential Employer';
    } catch {
      return companyField;
    }
  }
  
  return companyField.name || 'Confidential Employer';
}

/**
 * Normalize company name for matching (case-insensitive, trim)
 */
export function normalizeCompanyName(name: string): string {
  return name.toLowerCase().trim();
}

/**
 * Find company by name from list of companies
 */
export function findCompanyByName(
  companyName: string, 
  companies: Company[]
): Company | null {
  const normalizedName = normalizeCompanyName(companyName);
  
  return companies.find(company => 
    normalizeCompanyName(company.name) === normalizedName
  ) || null;
}

/**
 * Generate company slug from name
 */
export function generateCompanySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}