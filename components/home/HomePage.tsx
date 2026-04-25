"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { theme } from '@/lib/theme';

import { 
  Briefcase, 
  MapPin, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Shield,
  PlusCircle,
  Globe,
  Building2,
  Laptop
} from 'lucide-react';

import Link from 'next/link';
import AdUnit from '@/components/ads/AdUnit';

const AuthModal = dynamic(() => import('@/components/AuthModal'), { ssr: false });
const RecruiterAuthModal = dynamic(() => import('@/components/RecruiterAuthModal'), { ssr: false });

const TIER_1_COUNTRIES = [
  { name: 'United States', slug: 'usa', info: 'New York, San Francisco, Austin, Remote' },
  { name: 'United Kingdom', slug: 'uk', info: 'London, Manchester, Birmingham, Remote' },
  { name: 'Canada', slug: 'canada', info: 'Toronto, Vancouver, Montreal, Remote' },
  { name: 'Australia', slug: 'australia', info: 'Sydney, Melbourne, Brisbane, Remote' },
  { name: 'Germany', slug: 'germany', info: 'Berlin, Munich, Hamburg, Remote' },
  { name: 'Ireland', slug: 'ireland', info: 'Dublin, Cork, Limerick, Remote' },
];

const GLOBAL_INDUSTRIES = [
  { title: 'Software Engineering', slug: 'software-engineering' },
  { title: 'Artificial Intelligence', slug: 'ai' },
  { title: 'Data Science', slug: 'data-science' },
  { title: 'Cybersecurity', slug: 'cybersecurity' },
  { title: 'Digital Marketing', slug: 'marketing' },
  { title: 'Product Management', slug: 'product' },
  { title: 'Cloud Computing', slug: 'cloud' },
  { title: 'Healthcare & Biotech', slug: 'healthcare' },
  { title: 'Finance & Fintech', slug: 'finance' },
  { title: 'Renewable Energy', slug: 'energy' },
  { title: 'E-commerce', slug: 'ecommerce' },
  { title: 'Logistics', slug: 'logistics' },
  { title: 'Education Technology', slug: 'edtech' },
  { title: 'Business Development', slug: 'sales' },
  { title: 'UX/UI Design', slug: 'design' },
  { title: 'Human Resources', slug: 'hr' },
];

const GLOBAL_FAQS = [
  {
    question: "Does JobMeter list remote-only positions?",
    answer: "Yes! A significant portion of our global listings are 100% remote or hybrid-friendly, allowing you to work for Tier 1 companies from anywhere in the world."
  },
  {
    question: "Do companies on JobMeter provide visa sponsorship?",
    answer: "Many international employers in the US, UK, and Canada offer H1-B, Skilled Worker, or Global Talent visa sponsorships for high-demand roles."
  },
  {
    question: "How do I find high-paying international roles?",
    answer: "Use our search filters to sort by Tier 1 countries or specific sectors like AI, Fintech, and Engineering where global compensation is highest."
  }
];

export default function GlobalHomePage({ jobs = [] }: { jobs: any[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [recruiterModalOpen, setRecruiterModalOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO SECTION: Slate Gradient ── */}
      <section className="relative px-6 py-16 md:py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-8 text-sm">
            <Globe size={14} /> Global Talent Marketplace & Career Platform
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Build Your Career <br />
            <span style={{ color: theme.colors.primary.DEFAULT }}>On a Global Scale</span>
          </h1>
          
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            Find remote-first roles and international opportunities in the US, UK, Canada, and Europe. Work with world-class companies.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
            <div className="flex flex-col md:flex-row gap-2 p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <div className="flex-1 relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Accountant..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                Find Jobs
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm">
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Fortune 500 Companies</div>
            <div className="flex items-center gap-2"><Laptop size={16} className="text-indigo-500" /> Remote-First Options</div>
          </div>
        </div>
      </section>

      {/* ── AD 1 ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <AdUnit slot="GLOBAL_TOP_BANNER" format="auto" />
      </div>

      {/* ── FEATURED GLOBAL JOBS ── */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Global Roles</h2>
            <Link href="/jobs" className="text-blue-600 font-semibold flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 6).map((job: any) => (
              <Link key={job.id} href={`/jobs/${job.slug}`} className="p-6 rounded-2xl border border-gray-200 hover:border-blue-500 transition-all shadow-sm">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{job.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{job.company?.name || 'Global Enterprise'}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase">
                    {job.location?.name || 'International'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">Just posted</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW LINE: JOBS BY TIER 1 COUNTRY ── */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center md:text-left">Jobs by Tier 1 Country</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIER_1_COUNTRIES.map((country) => (
              <Link 
                key={country.slug}
                href={`/jobs?search=${country.name}`}
                className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Globe size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900">{country.name}</h3>
                </div>
                <p className="text-xs text-gray-500 ml-11">{country.info}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── AD 2 ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <AdUnit slot="GLOBAL_MID_BANNER" format="fluid" layout="in-article" />
      </div>

      {/* ── NEW LINE: TOP GLOBAL INDUSTRIES ── */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center md:text-left">Top Global Industries</h2>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {GLOBAL_INDUSTRIES.map((ind) => (
              <Link 
                key={ind.slug}
                href={`/jobs?search=${ind.title}`}
                className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
              >
                {ind.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── GLOBAL FAQ ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Global Search FAQ</h2>
          <div className="space-y-4">
            {GLOBAL_FAQS.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-gray-200">
                <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-gray-900 list-none">
                  {faq.question}
                  <PlusCircle size={20} className="text-indigo-600 group-open:rotate-45 transition-all" />
                </summary>
                <div className="px-6 pb-6 text-sm text-gray-600 border-t border-gray-50 pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm mb-4">© 2026 JobMeter Global. Your gateway to international careers.</p>
          <div className="flex justify-center gap-6 text-xs font-medium">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/about" className="hover:text-white">About</Link>
          </div>
        </div>
      </footer>

      {authModalOpen && <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />}
      {recruiterModalOpen && <RecruiterAuthModal open={recruiterModalOpen} onOpenChange={setRecruiterModalOpen} />}
    </div>
  );
}