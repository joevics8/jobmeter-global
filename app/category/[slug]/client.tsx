'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin, Briefcase, ChevronRight, Search, Loader2,
  Building2, Clock, TrendingUp, DollarSign, Shield,
  Globe, Users, GraduationCap, Home, Train, Heart,
  BookOpen, Star, ArrowRight, ExternalLink, CheckCircle,
  ChevronDown // Added for accordion
} from 'lucide-react';
import { CategoryJobPage, SalaryRow, SkillRow, AgencyRow, LinkRow, FAQRow } from './page';

// ... (Constants, Job types, and Helpers remain the same)
const WORKER_URL = 'https://jobs-api.joevicspro.workers.dev/jobs-gulf';
const JOBS_PER_PAGE = 20;

type RawJob = {
  id: string;
  slug: string;
  title: string;
  company: { name: string; website?: string | null } | string;
  location: { city?: string; country?: string; state?: string; remote?: boolean } | string;
  salary_range: { min: number | null; max: number | null; currency?: string; period?: string } | null;
  employment_type: string;
  job_type: string;
  posted_date: string;
  created_at: string;
  sector: string;
  role_category: string;
};

type JobUI = {
  id: string; slug: string; title: string;
  company: string; location: string; salary: string;
  type: string; sector: string; role_category: string; postedDate: string;
};

function formatRelativeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
    const diffHours = Math.floor((Date.now() - d.getTime()) / 3600000);
    if (diffHours < 24) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) { const w = Math.floor(diffDays / 7); return w === 1 ? '1 week ago' : `${w} weeks ago`; }
    const m = Math.floor(diffDays / 30); return m === 1 ? '1 month ago' : `${m} months ago`;
  } catch { return ''; }
}

function transformJob(j: RawJob): JobUI {
  const company = typeof j.company === 'string' ? j.company : j.company?.name ?? 'Unknown';
  let location = 'Location not specified';
  if (typeof j.location === 'string') { location = j.location; }
  else if (j.location) {
    const loc = j.location;
    location = loc.remote ? 'Remote' : [loc.city, loc.state, loc.country].filter(Boolean).join(', ');
  }
  let salary = '';
  if (j.salary_range?.min && j.salary_range?.currency) {
    salary = `${j.salary_range.currency} ${j.salary_range.min.toLocaleString()}${j.salary_range.period ? '/' + j.salary_range.period : ''}`;
  }
  return {
    id: j.id, slug: j.slug, title: j.title, company, location, salary,
    type: j.employment_type || j.job_type || '',
    sector: j.sector || '', role_category: j.role_category || '',
    postedDate: formatRelativeDate(j.posted_date || j.created_at),
  };
}

function matchesPage(job: RawJob, page: CategoryJobPage): boolean {
  const cityMatch = !page.filter_city ||
    (typeof job.location === 'object' &&
      job.location?.city?.toLowerCase().includes(page.filter_city.toLowerCase()));

  const roleMatch = !page.filter_role ||
    job.role_category?.toLowerCase().includes(page.filter_role.toLowerCase()) ||
    job.title?.toLowerCase().includes(page.filter_role.toLowerCase());

  return !!cityMatch && !!roleMatch;
}

// ... (Section and Prose remain the same)
function Section({ id, icon: Icon, title, children }: {
  id?: string; icon?: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-10 scroll-mt-20">
      <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
        {Icon && <Icon size={20} className="text-blue-500 shrink-0" />}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Prose({ html }: { html: string }) {
  return (
    <div
      className="prose prose-gray prose-sm md:prose-base max-w-none
        prose-headings:font-bold prose-headings:text-gray-900
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-li:marker:text-blue-500"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ... (SalaryTable, SkillsGrid, AgenciesList, FAQAccordion, RelatedLinks, and JobCard remain the same)
function SalaryTable({ rows }: { rows: SalaryRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead className="bg-blue-50 text-left">
          <tr>
            <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Min / Month</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Max / Month</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((row, i) => (
            <tr key={i} className="bg-white hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800">{row.role}</td>
              <td className="px-4 py-3 text-gray-600">
                {row.currency} {row.min?.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-green-600 font-medium">
                {row.currency} {row.max?.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 px-4 py-2 bg-gray-50 border-t border-gray-100">
        All figures are tax-free monthly salaries in the Gulf region. Actual offers vary by employer and experience.
      </p>
    </div>
  );
}

function SkillsGrid({ skills }: { skills: SkillRow[] }) {
  const technical = skills.filter((s) => s.type === 'technical');
  const soft = skills.filter((s) => s.type === 'soft');

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {technical.length > 0 && (
        <div className="rounded-xl bg-blue-50 p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Technical Skills</p>
          <ul className="space-y-2">
            {technical.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={14} className="text-blue-500 shrink-0" /> {s.skill}
              </li>
            ))}
          </ul>
        </div>
      )}
      {soft.length > 0 && (
        <div className="rounded-xl bg-green-50 p-4">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-3">Soft Skills</p>
          <ul className="space-y-2">
            {soft.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={14} className="text-green-500 shrink-0" /> {s.skill}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AgenciesList({ agencies }: { agencies: AgencyRow[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {agencies.map((a, i) => (
        <a
          key={i}
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 hover:border-blue-200 hover:shadow-sm transition-all group"
        >
          <div>
            <p className="font-medium text-gray-900 group-hover:text-blue-600 text-sm">{a.name}</p>
            {a.note && <p className="text-xs text-gray-500 mt-1">{a.note}</p>}
          </div>
          <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-400 shrink-0 mt-0.5" />
        </a>
      ))}
    </div>
  );
}

function FAQAccordion({ faqs }: { faqs: FAQRow[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 font-medium text-gray-900 hover:bg-gray-50 transition-colors text-sm"
          >
            {faq.q}
            <ChevronRight
              size={16}
              className={`shrink-0 text-gray-400 transition-transform duration-200 ${open === i ? 'rotate-90' : ''}`}
            />
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RelatedLinks({ title, links }: { title: string; links: LinkRow[] }) {
  if (!links.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</p>
      <div className="flex flex-wrap gap-2">
        {links.map((link, i) => (
          <Link
            key={i}
            href={`/category/${link.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            {link.label} <ArrowRight size={12} />
          </Link>
        ))}
      </div>
    </div>
  );
}

function JobCard({ job }: { job: JobUI }) {
  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group block rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
            {job.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 flex items-center gap-1.5 truncate">
            <Building2 size={12} className="shrink-0" /> {job.company}
          </p>
        </div>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 shrink-0 mt-1 transition-colors" />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
        {job.location && <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>}
        {job.type && <span className="flex items-center gap-1"><Briefcase size={11} />{job.type}</span>}
        {job.salary && <span className="flex items-center gap-1"><DollarSign size={11} />{job.salary}</span>}
        {job.postedDate && <span className="flex items-center gap-1 ml-auto text-gray-400"><Clock size={11} />{job.postedDate}</span>}
      </div>
    </Link>
  );
}

// ─── Jobs Widget (Updated Link to /jobs) ───────────────────────────────────

function JobsWidget({ page }: { page: CategoryJobPage }) {
  const [allJobs, setAllJobs] = useState<JobUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch(WORKER_URL)
      .then((r) => r.json())
      .then((data) => {
        const raw: RawJob[] = data.jobs ?? [];
        setAllJobs(raw.filter((j) => matchesPage(j, page)).map(transformJob));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allJobs;
    const q = search.toLowerCase();
    return allJobs.filter(
      (j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)
    );
  }, [allJobs, search]);

  const totalPages = Math.ceil(filtered.length / JOBS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE);

  return (
    <section id="jobs" className="mt-10 scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Briefcase size={20} className="text-blue-500" />
          {loading ? 'Loading jobs…' : `${filtered.length} Live Jobs`}
        </h2>
        <span className="text-xs text-gray-400 bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium">
          Updated daily
        </span>
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={`Search within ${page.h1}…`}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-14 text-gray-400">
          <Loader2 size={28} className="animate-spin mb-3" />
          <p className="text-sm">Fetching latest jobs…</p>
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center py-14 text-center">
          <Search size={28} className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium text-sm">No jobs match your search</p>
          <button onClick={() => setSearch('')} className="mt-3 text-xs text-blue-600 hover:underline">
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, currentPage - 2) + i;
            if (p > totalPages) return null;
            return (
              <button key={p} onClick={() => setCurrentPage(p)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${currentPage === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
            Next
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/jobs" // Changed from "/" to "/jobs"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
          Browse All Gulf Jobs <ChevronRight size={16} />
        </Link>
      </div>
    </section>
  );
}

// ─── Table of Contents (Updated to Accordion, closed by default) ────────────

function TableOfContents({ page }: { page: CategoryJobPage }) {
  const [isOpen, setIsOpen] = useState(false); // Closed by default

  const items = [
    { id: 'jobs', label: 'Live Job Listings', show: true },
    { id: 'trends', label: 'Hiring Trends', show: !!page.hiring_trends_html },
    { id: 'industries', label: page.page_type === 'role_in_location' ? 'Top Employers' : 'Top Industries', show: !!page.top_industries_html },
    { id: 'salaries', label: 'Salaries', show: !!page.salary_table_json },
    { id: 'skills', label: 'In-Demand Skills', show: !!page.skills_json },
    { id: 'qualifications', label: 'Qualifications', show: !!page.qualifications_html },
    { id: 'visa', label: 'Visa & Sponsorship', show: !!page.visa_html },
    { id: 'how-to-apply', label: 'How to Apply', show: !!page.how_to_apply_html },
    { id: 'cost-of-living', label: 'Cost of Living', show: !!page.cost_of_living_html },
    { id: 'housing', label: 'Housing', show: !!page.housing_html },
    { id: 'faq', label: 'FAQ', show: page.faq_json?.length > 0 },
  ].filter((i) => i.show);

  return (
    <nav className="rounded-xl border border-gray-100 bg-white overflow-hidden mb-8 transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left group"
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide group-hover:text-blue-600">In This Guide</p>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4">
          <ol className="space-y-1.5">
            {items.map((item, i) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => setIsOpen(false)} // Close on selection
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}.</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </nav>
  );
}

// ─── Main Client Component (Removed "Last updated") ─────────────────────────

export default function CategoryPageClient({ page }: { page: CategoryJobPage }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/category" className="hover:text-blue-600 transition-colors">Categories</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600 truncate">{page.h1}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header (Last updated removed) */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-3">
            <MapPin size={14} />
            {page.filter_city ?? page.filter_country ?? 'Gulf Region'}
            {page.filter_role && (
              <>
                <span className="text-gray-300">·</span>
                <Briefcase size={14} /> {page.filter_role}
              </>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
            {page.h1}
          </h1>
        </header>

        {/* Table of Contents */}
        <TableOfContents page={page} />

        {/* Intro */}
        <Prose html={page.intro_html} />

        {/* Live Jobs Widget */}
        <JobsWidget page={page} />

        {/* Hiring Trends */}
        {page.hiring_trends_html && (
          <Section id="trends" icon={TrendingUp} title={page.page_type === 'role_in_location' ? 'Demand & Hiring Trends' : 'Current Hiring Trends'}>
            <Prose html={page.hiring_trends_html} />
          </Section>
        )}

        {/* Top Industries / Top Employers */}
        {page.top_industries_html && (
          <Section id="industries" icon={Building2} title={page.page_type === 'role_in_location' ? 'Top Employers Hiring' : 'Top Industries Hiring'}>
            <Prose html={page.top_industries_html} />
          </Section>
        )}

        {/* Salary Table */}
        {page.salary_table_json && page.salary_table_json.length > 0 && (
          <Section id="salaries" icon={DollarSign} title="Salaries">
            <SalaryTable rows={page.salary_table_json} />
            {page.salary_notes_html && (
              <div className="mt-4">
                <Prose html={page.salary_notes_html} />
              </div>
            )}
          </Section>
        )}

        {/* Cost of Living (jobs_in_location only) */}
        {page.cost_of_living_html && (
          <Section id="cost-of-living" icon={Home} title="Cost of Living vs Salary">
            <Prose html={page.cost_of_living_html} />
          </Section>
        )}

        {/* In-Demand Skills */}
        {page.skills_json && page.skills_json.length > 0 && (
          <Section id="skills" icon={Star} title="In-Demand Skills">
            <SkillsGrid skills={page.skills_json} />
          </Section>
        )}

        {/* Qualifications */}
        {page.qualifications_html && (
          <Section id="qualifications" icon={GraduationCap} title="Qualifications & Licensing">
            <Prose html={page.qualifications_html} />
          </Section>
        )}

        {/* Visa */}
        {page.visa_html && (
          <Section id="visa" icon={Globe} title="Visa & Sponsorship">
            <Prose html={page.visa_html} />
          </Section>
        )}

        {/* Employment Law */}
        {page.employment_law_html && (
          <Section id="employment-law" icon={Shield} title="Employment Law & Worker Rights">
            <Prose html={page.employment_law_html} />
          </Section>
        )}

        {/* Tax */}
        {page.tax_html && (
          <Section id="tax" icon={DollarSign} title="Tax Information">
            <Prose html={page.tax_html} />
          </Section>
        )}

        {/* Work Environment (role_in_location) */}
        {page.work_environment_html && (
          <Section id="work-environment" icon={Briefcase} title="Work Environment & Schedules">
            <Prose html={page.work_environment_html} />
          </Section>
        )}

        {/* Career Growth */}
        {page.career_growth_html && (
          <Section id="career-growth" icon={TrendingUp} title="Career Growth & Progression">
            <Prose html={page.career_growth_html} />
          </Section>
        )}

        {/* Job Types */}
        {page.job_types_html && (
          <Section id="job-types" icon={Briefcase} title="Contract, Remote & Part-Time Options">
            <Prose html={page.job_types_html} />
          </Section>
        )}

        {/* Fresh Graduates */}
        {page.graduates_html && (
          <Section id="graduates" icon={GraduationCap} title="Fresh Graduate Opportunities">
            <Prose html={page.graduates_html} />
          </Section>
        )}

        {/* How to Apply */}
        {page.how_to_apply_html && (
          <Section id="how-to-apply" icon={CheckCircle} title="Step-by-Step: How to Apply">
            <Prose html={page.how_to_apply_html} />
          </Section>
        )}

        {/* Recruitment Agencies */}
        {page.agencies_json && page.agencies_json.length > 0 && (
          <Section id="agencies" icon={Users} title="Recruitment Agencies">
            <AgenciesList agencies={page.agencies_json} />
          </Section>
        )}

        {/* CV Tips */}
        {page.cv_tips_html && (
          <Section id="cv-tips" icon={BookOpen} title="CV / Resume Tips for This Market">
            <Prose html={page.cv_tips_html} />
          </Section>
        )}

        {/* Interview Tips */}
        {page.interview_tips_html && (
          <Section id="interview-tips" icon={Star} title="Interview Tips">
            <Prose html={page.interview_tips_html} />
          </Section>
        )}

        {/* Housing */}
        {page.housing_html && (
          <Section id="housing" icon={Home} title="Housing & Best Areas to Live">
            <Prose html={page.housing_html} />
          </Section>
        )}

        {/* Transport */}
        {page.transport_html && (
          <Section id="transport" icon={Train} title="Commuting & Public Transport">
            <Prose html={page.transport_html} />
          </Section>
        )}

        {/* Healthcare */}
        {page.healthcare_html && (
          <Section id="healthcare" icon={Heart} title="Healthcare & Insurance">
            <Prose html={page.healthcare_html} />
          </Section>
        )}

        {/* Education & Family */}
        {page.education_html && (
          <Section id="education" icon={BookOpen} title="Education & Family Considerations">
            <Prose html={page.education_html} />
          </Section>
        )}

        {/* Lifestyle */}
        {page.lifestyle_html && (
          <Section id="lifestyle" icon={Star} title="Safety & Lifestyle">
            <Prose html={page.lifestyle_html} />
          </Section>
        )}

        {/* Stats */}
        {page.stats_html && (
          <Section id="stats" icon={TrendingUp} title="Job Statistics & Labor Data">
            <Prose html={page.stats_html} />
          </Section>
        )}

        {/* Role comparison (role_in_location) */}
        {page.role_comparison_html && (
          <Section id="comparison" icon={Globe} title="How This Compares to Other Locations">
            <Prose html={page.role_comparison_html} />
          </Section>
        )}

        {/* FAQ */}
        {page.faq_json?.length > 0 && (
          <Section id="faq" icon={BookOpen} title="Frequently Asked Questions">
            <FAQAccordion faqs={page.faq_json} />
          </Section>
        )}

        {/* Conclusion (Updated Link to /jobs) */}
        {page.conclusion_html && (
          <section className="mt-10">
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-6">
              <Prose html={page.conclusion_html} />
              <Link
                href="/jobs" // Changed from "/" to "/jobs"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Browse All Gulf Jobs <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        )}

        {/* Related links */}
        {(page.related_locations_json?.length > 0 || page.related_roles_json?.length > 0) && (
          <section className="mt-10 pt-8 border-t border-gray-100 space-y-5">
            <RelatedLinks title="Related Locations" links={page.related_locations_json ?? []} />
            <RelatedLinks title="Related Roles" links={page.related_roles_json ?? []} />
          </section>
        )}
      </div>
    </div>
  );
}