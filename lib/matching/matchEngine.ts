import { normalizeString, normalizeArrayStrings, toNumeric } from './normalize';

// Sector relationships for partial matching (20 points)
const SECTOR_RELATIONSHIPS: Record<string, string[]> = {
  'Information Technology & Software': ['Data & Analytics', 'Product Management & Operations', 'Telecommunications'],
  'Engineering & Manufacturing': ['Construction & Real Estate', 'Energy & Utilities (Oil, Gas, Renewable Energy)', 'Telecommunications'],
  'Finance & Banking': ['Sales & Marketing', 'Retail & E-commerce', 'Legal & Compliance'],
  'Healthcare & Medical': ['Science & Research', 'Education & Training'],
  'Education & Training': ['Healthcare & Medical', 'Science & Research', 'Nonprofit & NGO'],
  'Sales & Marketing': ['Finance & Banking', 'Media, Advertising & Communications', 'Retail & E-commerce', 'Product Management & Operations'],
  'Human Resources & Recruitment': ['Customer Service & Support', 'Sales & Marketing'],
  'Customer Service & Support': ['Retail & E-commerce', 'Hospitality & Tourism', 'Human Resources & Recruitment'],
  'Media, Advertising & Communications': ['Design, Arts & Creative', 'Sales & Marketing'],
  'Design, Arts & Creative': ['Media, Advertising & Communications', 'Information Technology & Software'],
  'Construction & Real Estate': ['Engineering & Manufacturing', 'Logistics, Transport & Supply Chain'],
  'Logistics, Transport & Supply Chain': ['Retail & E-commerce', 'Construction & Real Estate', 'Agriculture & Agribusiness'],
  'Agriculture & Agribusiness': ['Logistics, Transport & Supply Chain', 'Environment & Sustainability', 'Science & Research'],
  'Energy & Utilities (Oil, Gas, Renewable Energy)': ['Engineering & Manufacturing', 'Environment & Sustainability', 'Science & Research'],
  'Legal & Compliance': ['Government & Public Administration', 'Finance & Banking', 'Security & Defense'],
  'Government & Public Administration': ['Legal & Compliance', 'Security & Defense', 'Nonprofit & NGO'],
  'Retail & E-commerce': ['Finance & Banking', 'Sales & Marketing', 'Logistics, Transport & Supply Chain', 'Customer Service & Support'],
  'Hospitality & Tourism': ['Customer Service & Support', 'Retail & E-commerce'],
  'Science & Research': ['Healthcare & Medical', 'Education & Training', 'Energy & Utilities (Oil, Gas, Renewable Energy)', 'Environment & Sustainability', 'Data & Analytics'],
  'Security & Defense': ['Government & Public Administration', 'Legal & Compliance', 'Information Technology & Software'],
  'Telecommunications': ['Information Technology & Software', 'Engineering & Manufacturing'],
  'Nonprofit & NGO': ['Government & Public Administration', 'Education & Training', 'Environment & Sustainability'],
  'Environment & Sustainability': ['Agriculture & Agribusiness', 'Energy & Utilities (Oil, Gas, Renewable Energy)', 'Science & Research', 'Nonprofit & NGO'],
  'Product Management & Operations': ['Information Technology & Software', 'Data & Analytics', 'Sales & Marketing'],
  'Data & Analytics': ['Information Technology & Software', 'Product Management & Operations', 'Science & Research'],
};

// Check if two sectors are related (for partial matching)
function areSectorsRelated(sector1: string, sector2: string): boolean {
  if (!sector1 || !sector2) return false;
  
  // Check if sector1's related sectors include sector2 (using original names)
  const relatedSectors = SECTOR_RELATIONSHIPS[sector1] || [];
  if (relatedSectors.includes(sector2)) return true;
  
  // Check reverse direction (sector2's related sectors include sector1)
  const relatedSectors2 = SECTOR_RELATIONSHIPS[sector2] || [];
  return relatedSectors2.includes(sector1);
}

export type JobRow = {
  role?: string; // jobs.role
  related_roles?: string[] | string | null; // jobs.related_roles
  ai_enhanced_roles?: string[] | string | null; // jobs.ai_enhanced_roles
  skills_required?: string[] | string | null; // jobs.skills_required
  ai_enhanced_skills?: string[] | string | null; // jobs.ai_enhanced_skills
  location?: { city?: string | null; state?: string | null; country?: string | null; remote?: boolean } | string | null; // jobs.location
  experience_level?: string | null; // jobs.experience_level
  salary_range?: { min?: number; max?: number; period?: string | null; currency?: string | null } | null; // jobs.salary_range
  employment_type?: string | null; // jobs.employment_type
  sector?: string | null; // jobs.sector
};

export type UserOnboardingData = {
  target_roles?: string[] | null; // from onboarding_data.target_roles
  cv_skills?: string[] | null; // from onboarding_data.cv_skills
  preferred_locations?: string[] | null; // from onboarding_data.preferred_locations
  experience_level?: string | null; // from onboarding_data.experience_level
  salary_min?: number | string | null; // from onboarding_data.salary_min
  salary_max?: number | string | null; // from onboarding_data.salary_max
  job_type?: string | null; // from onboarding_data.job_type
  sector?: string | null; // from onboarding_data.sector
};

export type MatchBreakdown = {
  rolesScore: number;
  rolesReason: string;
  skillsScore: number;
  skillsReason: string;
  sectorScore: number;
  sectorReason: string;
  locationScore: number;
  experienceScore: number;
  salaryScore: number;
  typeScore: number;
};

export type MatchResult = {
  score: number;
  breakdown: MatchBreakdown;
  computedAt: string;
};

export function scoreJob(job: JobRow, userData: UserOnboardingData): MatchResult {
  // Extract user preferences from onboarding_data table
  const targetRoles = normalizeArrayStrings(userData.target_roles || []);
  const cvSkills = normalizeArrayStrings(userData.cv_skills || []);
  const preferredLocations = normalizeArrayStrings(userData.preferred_locations || []);
  const expLevel = normalizeString(userData.experience_level || '');
  const jobType = normalizeString(userData.job_type || '');
  const salaryMin = toNumeric(userData.salary_min ?? undefined);
  const salaryMax = toNumeric(userData.salary_max ?? undefined);
  const userSectorOriginal = userData.sector || '';
  const userSector = normalizeString(userSectorOriginal);

  // Extract job data from jobs table
  const jobRole = normalizeString(job.role || '');
  // Split comma-separated job roles into array
  const jobRolesArray = jobRole ? jobRole.split(',').map(r => r.trim()).filter(r => r) : [];
  const relatedRoles = normalizeArrayStrings(job.related_roles as any);
  const aiRoles = normalizeArrayStrings(job.ai_enhanced_roles as any);
  const requiredSkills = normalizeArrayStrings(job.skills_required as any);
  const aiSkills = normalizeArrayStrings(job.ai_enhanced_skills as any);
  const jobCity = typeof job.location === 'string'
    ? normalizeString(job.location as string)
    : normalizeString(job.location?.city || '');

  // Extract all location fields for matching (handle object structure)
  const jobLocationFields: string[] = [];
  if (typeof job.location === 'object' && job.location) {
    // Handle job location object structure: { city, state, country, remote }
    if (job.location.city) {
      jobLocationFields.push(normalizeString(job.location.city));
    }
    if (job.location.state) {
      jobLocationFields.push(normalizeString(job.location.state));
    }
    if (job.location.country) {
      jobLocationFields.push(normalizeString(job.location.country));
    }
    if (job.location.remote) {
      jobLocationFields.push('remote');
    }
  } else if (typeof job.location === 'string') {
    // Fallback for string location data
    jobLocationFields.push(normalizeString(job.location));
  }
  const jobExp = normalizeString(job.experience_level || '');
  const jobTypeVal = normalizeString(job.employment_type || '');
  const sal = job.salary_range || undefined;
  const jobSalMin = toNumeric(sal?.min ?? undefined);
  const jobSalMax = toNumeric(sal?.max ?? undefined);
  const jobSalPeriod = normalizeString(sal?.period || '');
  const jobSalCurrency = normalizeString(sal?.currency || '');
  const jobSectorOriginal = job.sector || '';
  const jobSector = normalizeString(jobSectorOriginal);

  // Roles scoring - Updated: 70 (exact), 40 (related), 30 (AI-enhanced)
  let rolesScore = 0;
  let rolesReason = 'no role match';
  if (jobRolesArray.length && jobRolesArray.some(r => targetRoles.includes(r))) {
    rolesScore = 70;
    rolesReason = 'role exact';
  } else if (relatedRoles.length && relatedRoles.some(r => targetRoles.includes(r))) {
    rolesScore = 40;
    rolesReason = 'role related';
  } else if (aiRoles.length && aiRoles.some(r => targetRoles.includes(r))) {
    rolesScore = 30;
    rolesReason = 'role ai';
  }

  // Skills scoring - Updated: 10 points per required skill, 5 points per AI skill, capped at 30 total
  let skillsScore = 0;
  let skillsReason = 'no skills match';
  let requiredMatches = 0;
  let aiMatches = 0;

  // First, check required skills (10 points each)
  if (requiredSkills.length > 0) {
    requiredMatches = requiredSkills.filter(reqSkill =>
      cvSkills.some(cvSkill => cvSkill.toLowerCase() === reqSkill.toLowerCase())
    ).length;
    const requiredScore = requiredMatches * 10; // 10 points per required skill match
    skillsScore += requiredScore;
  }

  // If we haven't reached the cap, check AI skills (5 points each)
  if (skillsScore < 30 && aiSkills.length > 0) {
    aiMatches = aiSkills.filter(aiSkill =>
      cvSkills.some(cvSkill => cvSkill.toLowerCase() === aiSkill.toLowerCase())
    ).length;

    // Calculate how many AI skill points we can add without exceeding 30
    const remainingCapacity = 30 - skillsScore;
    const maxAiMatches = Math.floor(remainingCapacity / 5);
    const actualAiMatches = Math.min(aiMatches, maxAiMatches);
    const aiScore = actualAiMatches * 5; // 5 points per AI skill match

    skillsScore += aiScore;
  }

  // Cap at 30 total
  skillsScore = Math.min(30, skillsScore);

  // Build reason string
  if (requiredMatches > 0 || aiMatches > 0) {
    const parts: string[] = [];
    if (requiredMatches > 0) parts.push(`${requiredMatches} required`);
    if (aiMatches > 0) parts.push(`${aiMatches} ai`);
    skillsReason = `${parts.join(' + ')} skills matched`;
  }

  // Sector scoring - Updated: 40 points (exact match), 20 points (related/partial match)
  let sectorScore = 0;
  let sectorReason = 'no sector match';
  if (userSectorOriginal && jobSectorOriginal) {
    if (userSector === jobSector) {
      // Exact match (normalized comparison)
      sectorScore = 40;
      sectorReason = 'sector exact match';
    } else if (areSectorsRelated(userSectorOriginal, jobSectorOriginal)) {
      // Related/partial match (using original sector names)
      sectorScore = 20;
      sectorReason = 'sector related match';
    }
  }

  // Location scoring - check if any job location field matches any preferred location
  const locationScore = jobLocationFields.length > 0 && preferredLocations.length > 0 &&
    jobLocationFields.some(jobLoc => preferredLocations.some(prefLoc => prefLoc === jobLoc)) ? 10 : 0;

  // Experience scoring
  const experienceScore = jobExp && expLevel && jobExp === expLevel ? 5 : 0;

  // Salary scoring - check if job salary max >= user salary min
  let salaryScore = 0;
  if (jobSalMax !== undefined && salaryMin !== undefined) {
    // Job max salary should be >= user minimum salary expectation
    // User expects: salaryMin (e.g., 180,000)
    // Job offers: jobSalMax (e.g., 200,000)
    // Match if: jobSalMax >= salaryMin
    salaryScore = jobSalMax >= (salaryMin as number) ? 5 : 0;
  }

  // Employment type scoring
  const typeScore = (jobTypeVal === 'any' || (jobTypeVal && jobType && jobTypeVal === jobType)) ? 5 : 0;

  // Enforce Roles+Skills+Sector cap at 80
  const rsCapped = Math.min(80, rolesScore + skillsScore + sectorScore);
  const total = rsCapped + locationScore + experienceScore + salaryScore + typeScore;

  const breakdown: MatchBreakdown = {
    rolesScore,
    rolesReason,
    skillsScore,
    skillsReason,
    sectorScore,
    sectorReason,
    locationScore,
    experienceScore,
    salaryScore,
    typeScore,
  };

  return {
    score: Math.max(0, Math.min(100, total)),
    breakdown,
    computedAt: new Date().toISOString(),
  };
}
