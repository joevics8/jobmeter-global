"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { quizSupabase } from '@/lib/quizSupabase';
import { supabase } from '@/lib/supabase';
import { getCached, setCached, CACHE_KEYS } from '@/lib/quizCache';
import { theme } from '@/lib/theme';
import { useCredits } from '@/context/CreditContext';
import { ApplyPaymentModal } from '@/components/payment/ApplyPaymentModal';
import AuthModal from '@/components/AuthModal';
import AdUnit from '@/components/ads/AdUnit';
import {
  ClipboardList,
  FileText,
  ArrowLeft,
  Loader2,
  Crown,
  Zap,
  Target,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface CompanyData {
  id?: string;
  name?: string;
  description?: string;
}

export default function CompanyQuizClient({
  company,
  companyData,
}: {
  company: string;
  companyData?: CompanyData | null;
}) {
  const router = useRouter();
  const { credits, isPro, loading: creditsLoading, deductCredit } = useCredits();
  
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'objective' | 'theory' | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [useTimer, setUseTimer] = useState(false);
  const [questionCount, setQuestionCount] = useState<10 | 20>(10);
  const [showAllSections, setShowAllSections] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchSections();
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [company]);

  const fetchSections = async () => {
    const cached = getCached<string[]>(CACHE_KEYS.sections(company));
    if (cached) { setSections(cached); return; }
    try {
      const { data } = await quizSupabase
        .from('objective_questions')
        .select('section')
        .ilike('company', company);

      if (data) {
        const uniqueSections = [...new Set(data.map((q) => q.section).filter(Boolean))];
        setSections(uniqueSections);
        setCached(CACHE_KEYS.sections(company), uniqueSections);
      }
    } catch (err) {
      console.error('Error fetching sections:', err);
    }
  };

  /**
   * Main Handler: Auth -> Credits -> Navigate
   */
  const handleQuizSelection = async (type: 'objective' | 'theory', count: number) => {
    setIsProcessing(true);
    
    // 1. Check Auth first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setShowAuthModal(true);
      setIsProcessing(false);
      return;
    }

    // 2. Check/Deduct Credit
    const result = await deductCredit(1);
    if (!result.success) {
      setShowPaymentModal(true);
      setIsProcessing(false);
      return;
    }

    // 3. Proceed to Selection or Quiz
    const slug = company.toLowerCase().replace(/\s+/g, '-');
    if (type === 'objective') {
      setQuestionCount(count as 10 | 20);
      if (sections.length > 0) {
        setSelectedType('objective');
      } else {
        router.push(`/tools/quiz/${slug}/objective?timer=${useTimer ? '1' : '0'}&section=general&count=${count}`);
      }
    } else {
      router.push(`/tools/quiz/${slug}/theory${useTimer ? '?timer=1' : ''}`);
    }
    setIsProcessing(false);
  };

  const handleSectionSelect = (section: string) => {
    const slug = company.toLowerCase().replace(/\s+/g, '-');
    router.push(`/tools/quiz/${slug}/objective?timer=${useTimer ? '1' : '0'}&section=${encodeURIComponent(section)}&count=${questionCount}`);
  };

  if (loading || creditsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background.muted }}>
        <Loader2 className="animate-spin text-primary" size={32} style={{ color: theme.colors.primary.DEFAULT }} />
      </div>
    );
  }

  // --- View: Section selection (Restored) ---
  if (selectedType === 'objective' && sections.length > 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
        <div className="px-4 py-3" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button onClick={() => setSelectedType(null)} className="flex items-center gap-2 text-white/80 hover:text-white text-sm">
              <ArrowLeft size={18} /> Back
            </button>
            <span className="text-white font-medium text-sm">{company}</span>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Choose a Section</h2>
          <button onClick={() => handleSectionSelect('general')} className="w-full mb-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-between" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
            <span>⚡ General (Mixed)</span>
            <span className="text-white/70 text-xs">Tap to start →</span>
          </button>
          <div className="flex flex-wrap gap-2">
            {(showAllSections ? sections : sections.slice(0, 5)).map((section) => (
              <button key={section} onClick={() => handleSectionSelect(section)} className="px-4 py-2.5 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50">
                {section}
              </button>
            ))}
          </div>
          {sections.length > 5 && (
            <button onClick={() => setShowAllSections(prev => !prev)} className="mt-3 text-xs font-medium underline" style={{ color: theme.colors.primary.DEFAULT }}>
              {showAllSections ? `▴ Show less` : `▾ See all ${sections.length} sections`}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
      {/* Header */}
      <div className="px-4 py-3" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/tools/quiz" className="flex items-center gap-2 text-white/80 hover:text-white text-sm">
            <ArrowLeft size={18} /> All Companies
          </Link>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
            {isPro ? <Crown size={14} className="text-amber-300" /> : <Zap size={14} className="text-blue-200" />}
            <span className="text-white text-xs font-bold tracking-tight">
              {isPro ? 'PRO PLAN' : `${credits ?? 0} CREDITS`}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="lg:hidden mb-6"><AdUnit slot="4198231153" format="auto" /></div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm" style={{ backgroundColor: `${theme.colors.primary.DEFAULT}15` }}>
            <span className="text-3xl font-bold" style={{ color: theme.colors.primary.DEFAULT }}>{company.charAt(0)}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">{company}</h1>
          <p className="text-sm text-gray-500">Professional Aptitude Assessment</p>
        </div>

        <div className="flex items-center gap-3 mb-8 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
          <input type="checkbox" id="useTimer" checked={useTimer} onChange={(e) => setUseTimer(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: theme.colors.primary.DEFAULT }} />
          <label htmlFor="useTimer" className="text-sm font-semibold text-gray-700 cursor-pointer">Enable Countdown Timer</label>
        </div>

        {/* Assessment Modes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <ModeCard 
            title="Quick Sprint" 
            desc="10 Multiple Choice" 
            icon={<Target size={22} className="text-emerald-600" />} 
            cost={isPro ? "Unlimited" : "1 Credit"}
            onClick={() => handleQuizSelection('objective', 10)}
            disabled={isProcessing}
          />
          <ModeCard 
            title="Standard" 
            desc="20 Multiple Choice" 
            icon={<ClipboardList size={22} className="text-blue-600" />} 
            cost={isPro ? "Unlimited" : "1 Credit"}
            onClick={() => handleQuizSelection('objective', 20)}
            disabled={isProcessing}
          />
          <ModeCard 
            title="Theory AI" 
            desc="Written Questions" 
            icon={<FileText size={22} className="text-purple-600" />} 
            cost={isPro ? "Unlimited" : "1 Credit"}
            onClick={() => handleQuizSelection('theory', 5)}
            disabled={isProcessing}
          />
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl p-4 bg-blue-50/50 border border-blue-100 mb-8">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900/80 leading-relaxed">
              <strong>About these questions:</strong> Carefully crafted to reflect <strong>{company}</strong>'s test style. JobMeter is independent and not affiliated with the company.
            </p>
          </div>
        </div>

        {/* SEO Description (Restored) */}
        {companyData?.description && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Info size={18} className="text-gray-400" />
                About {company}
              </h2>
              <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: companyData.description }} />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      <ApplyPaymentModal 
        open={showPaymentModal} 
        onOpenChange={setShowPaymentModal} 
        onAuthRequired={() => setShowAuthModal(true)} 
      />
    </div>
  );
}

function ModeCard({ title, desc, icon, cost, onClick, disabled }: any) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className="bg-white border border-gray-100 p-6 rounded-2xl text-left hover:border-blue-300 hover:shadow-md transition-all group active:scale-[0.98] disabled:opacity-70 flex flex-col"
    >
      <div className="mb-5 bg-gray-50 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors shadow-inner">
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-6 flex-grow">{desc}</p>
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{cost}</span>
        <span className="text-blue-600 font-bold text-xs group-hover:translate-x-1 transition-transform">Start →</span>
      </div>
    </button>
  );
}