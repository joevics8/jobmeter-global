// lib/mapJobToSchema.ts
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.remote.jobmeter.app";

export function mapJobToSchema(job: any) {
  const getCleanDescription = () => {
    let desc =
      job.description_html ||
      job.description ||
      job.about_role ||
      "Job description not available";
    if (typeof desc !== "string") desc = String(desc);
    desc = desc.replace(/<a[^>]*>.*?<\/a>/gi, "");
    desc = desc.replace(/https?:\/\/\S+/gi, "");
    desc = desc.replace(/To apply[^<]*/gi, "");
    desc = desc.replace(/<\/a>/gi, "");
    return desc;
  };

  const getCompanyName = () => {
    if (!job.company) return "Confidential Employer";
    if (typeof job.company === "string") return job.company;
    if (job.company.name) return job.company.name;
    return "Confidential Employer";
  };

  const getLocationString = () => {
    if (!job.location) return null;
    if (job.location.state) return job.location.state;
    if (job.location.city) return job.location.city;
    if (job.location.country && job.location.country !== "NG") return job.location.country;
    if (job.location.remote) return "Remote";
    return null;
  };

  const getJobTitle = () => {
    const baseTitle = job.title || job.role || "Untitled Job";
    const companyName = getCompanyName();
    if (companyName === "Confidential Employer") {
      const location = getLocationString();
      if (location) return `${baseTitle} in ${location}`;
    }
    return baseTitle;
  };

  const getEmploymentType = () => {
    const t = (job.employment_type || job.job_type || "").toLowerCase();
    const map: Record<string, string> = {
      "full-time": "FULL_TIME",
      "full time": "FULL_TIME",
      fulltime: "FULL_TIME",
      "part-time": "PART_TIME",
      "part time": "PART_TIME",
      parttime: "PART_TIME",
      contract: "CONTRACTOR",
      freelance: "CONTRACTOR",
      temporary: "TEMPORARY",
      internship: "INTERN",
      intern: "INTERN",
      volunteer: "VOLUNTEER",
    };
    return [map[t] || "FULL_TIME"];
  };

  const getExperienceMonths = (level = "") => {
    const l = (level || "").toLowerCase();
    const map: Record<string, number> = {
      "entry-level": 0, "entry level": 0, entry: 0,
      junior: 12,
      "mid-level": 36, "mid level": 36, mid: 36,
      senior: 60, lead: 84, executive: 120, manager: 72,
    };
    return map[l] || 36;
  };

  // ─── FIXED: Always return a jobLocation for non-remote jobs ────────────
  const getJobLocation = () => {
    // Remote-only jobs: no jobLocation at all
    if (job.location?.remote) return undefined;

    // No location data — default to Nigeria so Google never flags missing jobLocation
    if (!job.location) {
      return {
        "@type": "Place",
        address: { "@type": "PostalAddress", addressCountry: "NG", addressLocality: "Nigeria" },
      };
    }

    const city = job.location.city;
    const state = job.location.state;
    const country = job.location.country || "NG";

    // Map country codes to full names for addressLocality fallback
    const countryNames: Record<string, string> = { NG: "Nigeria" };
    const countryFullName = countryNames[country] || country;

    const address: Record<string, string> = {
      "@type": "PostalAddress",
      addressCountry: country,
      // addressLocality is required by Google — fall back to state, then country name
      addressLocality: city || state || countryFullName,
    };

    if (state) address.addressRegion = state;

    // Only include streetAddress / postalCode if they're non-empty strings
    const street = job.location.streetAddress || job.location.street_address;
    if (street && street.trim()) address.streetAddress = street.trim();

    const postal = job.location.postalCode || job.location.postal_code;
    if (postal && String(postal).trim()) address.postalCode = String(postal).trim();

    return { "@type": "Place", address };
  };

  // ─── FIXED: Robust fallback that can't produce null ────────────────────
  const getValidThrough = () => {
    if (job.deadline) return job.deadline;
    const raw = job.posted_date || job.created_at;
    const base = raw ? new Date(raw) : new Date();
    if (isNaN(base.getTime())) {
      // Unparseable date — default to 30 days from now
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 30);
      return fallback.toISOString().split("T")[0];
    }
    base.setDate(base.getDate() + 30);
    return base.toISOString().split("T")[0];
  };

  // ─── FIXED: Omit baseSalary entirely when no real salary data ──────────
  const getBaseSalary = () => {
    if (!job.salary_range) return undefined;

    const { min, max, currency, period } = job.salary_range;

    // If neither min nor max exists, skip — value: 0 is rejected by Google
    if (!min && !max) return undefined;

    const resolvedCurrency = currency || "NGN";
    const unitText = period ? period.toUpperCase() : "MONTH";

    const quantValue: Record<string, any> = {
      "@type": "QuantitativeValue",
      unitText,
    };

    if (min) quantValue.minValue = min;
    if (max) quantValue.maxValue = max;
    // Google prefers minValue/maxValue over value; only set value as fallback
    if (!min || !max) quantValue.value = min || max;

    return {
      "@type": "MonetaryAmount",
      currency: resolvedCurrency,
      value: quantValue,
    };
  };

  const getSkills = () => {
    const skills = job.skills_required || job.ai_enhanced_skills || [];
    if (!Array.isArray(skills) || skills.length === 0) return undefined;
    const valid = skills.filter(Boolean);
    return valid.length > 0 ? valid.join(", ") : undefined;
  };

  const getResponsibilities = () => {
    const r = job.responsibilities || [];
    if (!Array.isArray(r) || r.length === 0) return undefined;
    const valid = r.filter(Boolean);
    return valid.length > 0 ? valid.join("; ") : undefined;
  };

  const getQualifications = () => {
    const q = job.qualifications || [];
    if (!Array.isArray(q) || q.length === 0) return undefined;
    const valid = q.filter(Boolean);
    return valid.length > 0 ? valid.join("; ") : undefined;
  };

  const getBenefits = () => {
    const b = job.benefits || [];
    if (!Array.isArray(b) || b.length === 0) return undefined;
    const valid = b.filter(Boolean);
    return valid.length > 0 ? valid.join(", ") : undefined;
  };

  const getApplicationUrl = () => {
    if (job.application?.url) return job.application.url;
    if (job.application_url) return job.application_url;
    return undefined;
  };

  const getWorkHours = () => {
    const t = (job.employment_type || "").toLowerCase();
    if (["full-time", "full time", "fulltime"].includes(t)) return "40 hours per week";
    return undefined;
  };

  const getIndustry = () =>
    job.company?.industry || job.sector || job.category || undefined;

  const isRemote = Boolean(job.location?.remote);
  const jobLocation = getJobLocation();

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: getJobTitle(),
    description: getCleanDescription(),
    datePosted:
      job.created_at || job.posted_date || new Date().toISOString().split("T")[0],
    validThrough: getValidThrough(),
    employmentType: getEmploymentType(),
    hiringOrganization: {
      "@type": "Organization",
      name: getCompanyName(),
      ...(getIndustry() && { industry: getIndustry() }),
    },
    identifier: {
      "@type": "PropertyValue",
      name: getCompanyName(),
      value: job.id || "unknown",
    },
    url: `${siteUrl}/jobs/${job.slug || job.id}`,
    directApply: true,
  };

  // ─── FIXED: jobLocation + jobLocationType are mutually exclusive ────────
  if (isRemote) {
    // Remote jobs: jobLocationType required, jobLocation must be absent
    schema.jobLocationType = "TELECOMMUTE";
    schema.applicantLocationRequirements = {
      "@type": "Country",
      name: job.location?.country || "Nigeria",
    };
  } else if (jobLocation) {
    // On-site jobs: jobLocation present, no jobLocationType
    schema.jobLocation = jobLocation;
    schema.applicantLocationRequirements = {
      "@type": "Country",
      name: job.location?.country || "NG",
    };
  }
  // If neither: no location fields at all — Google will warn but not error

  // Optional fields — only add when they have real data
  const baseSalary = getBaseSalary();
  if (baseSalary) schema.baseSalary = baseSalary;

  if (job.experience_level) {
    schema.experienceRequirements = {
      "@type": "OccupationalExperienceRequirements",
      monthsOfExperience: getExperienceMonths(job.experience_level),
    };
  }

  const responsibilities = getResponsibilities();
  if (responsibilities) schema.responsibilities = responsibilities;

  const qualifications = getQualifications();
  if (qualifications) schema.qualifications = qualifications;

  const skills = getSkills();
  if (skills) schema.skills = skills;

  const benefits = getBenefits();
  if (benefits) schema.jobBenefits = benefits;

  const workHours = getWorkHours();
  if (workHours) schema.workHours = workHours;

  const appUrl = getApplicationUrl();
  if (appUrl) {
    schema.applicationContact = { "@type": "ContactPoint", url: appUrl };
  }

  return schema;
}