import React from 'react';
import Link from 'next/link';
import { FileText, FileCheck, Search, Shield, Calculator, MessageCircle, GraduationCap, ArrowRight, Briefcase, Brain } from 'lucide-react';
import { theme } from '@/lib/theme';
import { Metadata } from 'next';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://global.jobmeter.app';

export const metadata: Metadata = {
  title: 'Career Tools — Free AI-Powered Job Search Tools | JobMeter',
  description: 'Free AI-powered career tools: CV checker, keyword analyzer, ATS review, interview practice, career coach, salary calculator, scam detector and more.',
  keywords: ['career tools', 'job tools', 'CV checker', 'ATS review', 'interview practice', 'salary calculator', 'scam detector', 'career coach'],
  openGraph: {
    title: 'Career Tools — Free AI-Powered Job Search Tools | JobMeter',
    description: 'Free AI-powered career tools: CV checker, keyword analyzer, ATS review, interview practice, career coach, salary calculator, scam detector and more.',
    type: 'website',
    url: `${siteUrl}/tools`,
    siteName: 'JobMeter',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Career Tools — Free AI-Powered Job Search Tools | JobMeter',
    description: 'Free AI-powered career tools: CV checker, keyword analyzer, ATS review, interview practice, career coach, salary calculator, scam detector and more.',
  },
  alternates: {
    canonical: `${siteUrl}/tools`,
  },
};

interface Tool {
  id: string; title: string; description: string; icon: React.ComponentType<any>; color: string; route?: string;
}

interface ToolCategory {
  id: string; title: string; description: string; icon: React.ComponentType<any>; color: string; tools: Tool[];
}

export default function ToolsPage() {
  const categories: ToolCategory[] = [
    {
      id: 'cv-tools', title: 'CV Tools', description: 'Build and optimize your CV', icon: FileText, color: '#2563EB',
      tools: [
//        { id: 'cv-create', title: 'Create CV/Cover Letter', description: 'Build professional CVs and cover letters in minutes', icon: FileText, color: '#2563EB', route: '/cv' },
//        { id: 'keyword-checker', title: 'CV Keyword Checker', description: 'Check keyword match between your CV and job descriptions', icon: Search, color: '#10B981', route: '/tools/keyword-checker' },
        { id: 'ats-review', title: 'ATS CV Review', description: 'Optimize your CV for ATS systems and job matching', icon: FileCheck, color: '#8B5CF6', route: '/tools/ats-review' },
      ],
    },
    {
      id: 'career-tools', title: 'Career Tools', description: 'Tools to help advance your career', icon: Briefcase, color: '#F59E0B',
      tools: [
        { id: 'interview', title: 'Interview Practice', description: 'Practice with personalized questions based on job descriptions', icon: MessageCircle, color: '#8B5CF6', route: '/tools/interview' },
        { id: 'career', title: 'Career Coach', description: 'Get personalized career guidance and advice', icon: GraduationCap, color: '#F59E0B', route: '/tools/career' },
        { id: 'role-finder', title: 'Role Finder', description: 'Discover new career paths based on your skills', icon: Search, color: '#06B6D4', route: '/tools/role-finder' },
        { id: 'quiz', title: 'Recruitment Assessment Practice Tests', description: 'Practice aptitude tests from top companies', icon: Brain, color: '#EC4899', route: '/tools/quiz' },
      ],
    },
    {
      id: 'safety-tools', title: 'Safety Tools', description: 'Stay safe from job scams', icon: Shield, color: '#EF4444',
      tools: [
//        { id: 'scam-detector', title: 'Job Description Analyzer', description: 'AI-powered analysis to detect job scams in any text', icon: Shield, color: '#EF4444', route: '/tools/scam-detector' },
        { id: 'scam-checker', title: 'Job Scam Checker', description: 'Search and report fraudulent companies and recruiters', icon: Shield, color: '#DC2626', route: '/tools/scam-checker' },
      ],
    },
    {
      id: 'salary-tools', title: 'Salary Tools', description: 'Calculate and compare salaries', icon: Calculator, color: '#3B82F6',
      tools: [
        { id: 'paye-calculator', title: 'PAYE Calculator', description: 'Calculate net salary with 2026 Nigeria tax rates', icon: Calculator, color: '#3B82F6', route: '/tools/paye-calculator' },
      ],
    },
  ];

  // Calculate total number of tools/cards
  const totalTools = categories.reduce((sum, category) => sum + category.tools.length, 0);

  // Show middle ad only if there are at least 14 tools
  const showMiddleAd = totalTools >= 14;

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
      {/* Header */}
      <div className="pt-12 pb-10 px-6" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: theme.colors.text.light }}>Career Tools</h1>
        </div>
      </div>

      {/* ── AD 1: Top banner ── */}
      <div className="px-4 md:px-6 pt-6 max-w-6xl mx-auto">
        <AdUnit slot="4198231153" format="auto" />
      </div>

      <div className="px-4 md:px-6 py-8 max-w-6xl mx-auto">
        <div className="space-y-12">
          {categories.map((category, index) => {
            const CategoryIcon = category.icon;
            return (
              <React.Fragment key={category.id}>
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${category.color}15` }}>
                      <CategoryIcon size={24} style={{ color: category.color }} />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">{category.title}</h2>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.tools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Link
                          key={tool.id}
                          href={tool.route || '#'}
                          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 flex items-start gap-4 group"
                          style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}
                        >
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tool.color}15` }}>
                            <Icon size={22} style={{ color: tool.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{tool.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{tool.description}</p>
                          </div>
                          <ArrowRight size={18} className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                        </Link>
                      );
                    })}
                  </div>
                </section>

                {/* ── Conditional Middle AD ── */}
                {showMiddleAd && index === 1 && (
                  <div className="py-2">
                    <AdUnit slot="8181708196" format="fluid" layout="in-article" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── AD 3: Bottom banner ── */}
        <div className="mt-12">
          <AdUnit slot="9751041788" format="auto" />
        </div>
      </div>
    </div>
  );
}