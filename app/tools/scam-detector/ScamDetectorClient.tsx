"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Sparkles, Info, AlertOctagon, FileText } from 'lucide-react';
import { theme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';

interface ScamAnalysis {
  trustScore: number; riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  redFlags: string[]; warnings: string[]; safeIndicators: string[]; analysis: string;
}

export default function ScamDetectorClient() {
  const [textToAnalyze, setTextToAnalyze] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScamAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && !isAnalyzing) { setShowModal(true); setTimeout(() => { resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100); }
  }, [result, isAnalyzing]);

  const performLocalAnalysis = async () => {
    const text = textToAnalyze.toLowerCase();
    let score = 100;
    const redFlags: string[] = []; const warnings: string[] = []; const safeIndicators: string[] = [];
    if (text.includes('pay') && (text.includes('fee') || text.includes('money') || text.includes('pay') && text.includes('first'))) { score -= 25; redFlags.push('Requests payment or money from applicants'); }
    if (text.includes('western union') || text.includes('wire transfer') || text.includes('moneygram')) { score -= 20; redFlags.push('Requests wire transfer or money transfer'); }
    if (text.includes('bank account') || text.includes('atm card') || text.includes('credit card') && (text.includes('job') || text.includes('interview'))) { score -= 20; redFlags.push('Requests banking/financial information'); }
    if (!text.includes('interview') && (text.includes('send your id') || text.includes('send your passport') || text.includes('send your nin'))) { score -= 15; redFlags.push('Requests personal documents before interview'); }
    if (text.includes('guarantee') && text.includes('job') && text.includes('100%')) { score -= 15; redFlags.push('Guarantees job placement - common scam tactic'); }
    if (!text.includes('remote') && !text.includes('work from home') && !text.includes('location') && !text.includes('address') && !text.includes('lagos') && !text.includes('abuja') && !text.includes('port harcourt')) { score -= 5; warnings.push('No specific location mentioned for on-site jobs'); }
    if (text.includes('salary') && (text.includes('unrealistic') || text.includes('million') || text.includes('₦500,000') && text.includes('month') && text.includes('entry level'))) { score -= 10; warnings.push('Salary appears unrealistic for position level'); }
    const hasGmail = /\b(gmail|yahoo|hotmail|outlook)\b/i.test(text);
    if (hasGmail) { score -= 3; warnings.push('Generic email domain used (common in Nigeria)'); }
    const hasWebsite = /\b(http|www\.|\.com|\.ng)\b/i.test(text);
    const hasLinkedIn = /linkedin/i.test(text);
    if (!hasWebsite && !hasLinkedIn) { score -= 5; warnings.push('No company website or LinkedIn found'); }
    if (text.includes('interview')) { score += 5; safeIndicators.push('Interview process mentioned'); }
    if (text.includes('company') || text.includes('about us')) { score += 5; safeIndicators.push('Company information provided'); }
    if (text.includes('requirements') || text.includes('qualifications') || text.includes('experience')) { score += 5; safeIndicators.push('Clear job requirements listed'); }
    if (text.includes('apply') && (text.includes('email') || text.includes('form') || text.includes('website'))) { score += 5; safeIndicators.push('Clear application process'); }
    if (text.includes('salary') || text.includes('pay') || text.includes('compensation')) { score += 5; safeIndicators.push('Salary information provided'); }
    score = Math.max(0, Math.min(100, score));
    if (score > 85) { score = 70 + Math.floor(Math.random() * 16); }
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (score >= 70) riskLevel = 'LOW';
    else if (score >= 55) riskLevel = 'MEDIUM';
    else if (score >= 40) riskLevel = 'HIGH';
    else riskLevel = 'CRITICAL';
    const analysisText = `Trust Score: ${score}/100. ${riskLevel === 'LOW' ? 'This job posting appears legitimate with minimal red flags.' : riskLevel === 'MEDIUM' ? 'Exercise caution - some concerns noted.' : riskLevel === 'HIGH' ? 'Multiple red flags detected - research thoroughly before proceeding.' : 'High risk detected - do not proceed without verification.'} ${companyName ? `Analyzed for: ${companyName}` : ''}`;
    setResult({ trustScore: score, riskLevel, redFlags, warnings, safeIndicators, analysis: analysisText });
  };

  const analyzeText = async () => {
    if (!textToAnalyze.trim() || textToAnalyze.length < 50) { setError('Please provide at least 50 characters of text to analyze'); return; }
    setIsAnalyzing(true); setError(null); setResult(null);
    try {
      const { data: submissionData, error: saveError } = await supabase.from('job_analysis_submissions').insert({ text_content: textToAnalyze.trim(), company_name: companyName.trim() || null, analysis_type: 'scam_detector' }).select().single();
      if (saveError) console.error('Save error:', saveError);
      if (submissionData?.id) {
        const { data: analysisData, error: fetchError } = await supabase.from('job_analysis_results').select('*').eq('submission_id', submissionData.id).single();
        if (analysisData) { setResult({ trustScore: analysisData.trust_score, riskLevel: analysisData.risk_level, redFlags: analysisData.red_flags || [], warnings: analysisData.warnings || [], safeIndicators: analysisData.safe_indicators || [], analysis: analysisData.analysis_text }); }
        else if (fetchError) { console.error('Fetch error:', fetchError); await performLocalAnalysis(); }
      } else { await performLocalAnalysis(); }
    } catch (err: any) { console.error('Analysis error:', err); setError(err.message || 'Failed to analyze. Please try again.'); }
    finally { setIsAnalyzing(false); }
  };

  const getRiskConfig = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle };
      case 'MEDIUM': return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: AlertTriangle };
      case 'HIGH': return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: AlertOctagon };
      case 'CRITICAL': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircle };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: Info };
    }
  };

  const getScoreColor = (score: number) => { if (score >= 70) return 'text-green-600'; if (score >= 55) return 'text-yellow-600'; if (score >= 40) return 'text-orange-600'; return 'text-red-600'; };
  const riskConfig = result ? getRiskConfig(result.riskLevel) : null;
  const RiskIcon = riskConfig?.icon || Info;

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-red-800">
          <p className="font-medium mb-1">Stay Safe from Job Scams</p>
          <p className="text-red-700">Scammers often target job seekers with fake job offers. Never pay money for job opportunities. Legitimate employers never ask for payment for interviews, training, or equipment.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Shield size={20} className="text-blue-600" />Analyze Job Posting</h2>
          <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name (optional)
          </label>
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter the company name if known" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Description, Email, or Message <span className="text-red-500">*</span></label>
          <p className="text-xs text-gray-500 mb-2">Paste the job description, email, or any suspicious message you received</p>
          <textarea value={textToAnalyze} onChange={(e) => setTextToAnalyze(e.target.value)} rows={10} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Paste the job posting text, email content, or message here..." />
          <p className="text-xs text-gray-500 mt-1">{textToAnalyze.length} / 50 characters minimum</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
        <button onClick={analyzeText} disabled={isAnalyzing || textToAnalyze.length < 50} className="w-full py-3 px-6 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
          {isAnalyzing ? (<><Loader2 className="animate-spin" size={20} />Analyzing...</>) : (<><Sparkles size={20} />Detect Scams</>)}
        </button>
      </div>

      <div ref={resultRef}>
        {result && showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"><Info size={24} className="text-gray-500" /></button>
              <div className="space-y-6">
                <div className={`rounded-2xl p-6 border-2 ${riskConfig?.border} ${riskConfig?.bg}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Scam Analysis Result</h2>
                    <div className="flex items-center gap-2"><RiskIcon size={24} className={riskConfig?.text} /><span className={`text-2xl font-bold ${riskConfig?.text}`}>{result.riskLevel} RISK</span></div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2"><span className="text-sm font-medium text-gray-700">Trust Score</span><span className={`text-3xl font-bold ${getScoreColor(result.trustScore)}`}>{result.trustScore} / 100</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-3"><div className={`h-3 rounded-full transition-all ${getScoreColor(result.trustScore).replace('text-', 'bg-')}`} style={{ width: `${result.trustScore}%` }} /></div>
                  </div>
                  <p className="text-gray-700">{result.analysis}</p>
                </div>
                {result.redFlags.length > 0 && (
                  <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><XCircle size={18} className="text-red-500" />Red Flags Detected ({result.redFlags.length})</h3>
                    <ul className="space-y-2">{result.redFlags.map((flag, index) => (<li key={index} className="flex items-start gap-2 text-red-700 bg-red-50 p-3 rounded-lg"><AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />{flag}</li>))}</ul>
                  </div>
                )}
                {result.warnings.length > 0 && (
                  <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><AlertTriangle size={18} className="text-yellow-500" />Warnings ({result.warnings.length})</h3>
                    <ul className="space-y-2">{result.warnings.map((warning, index) => (<li key={index} className="flex items-start gap-2 text-yellow-700 bg-yellow-50 p-3 rounded-lg"><Info size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />{warning}</li>))}</ul>
                  </div>
                )}
                {result.safeIndicators.length > 0 && (
                  <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><CheckCircle size={18} className="text-green-500" />Safe Indicators ({result.safeIndicators.length})</h3>
                    <ul className="space-y-2">{result.safeIndicators.map((indicator, index) => (<li key={index} className="flex items-start gap-2 text-green-700 bg-green-50 p-3 rounded-lg"><CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />{indicator}</li>))}</ul>
                  </div>
                )}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4"><p className="text-sm text-gray-600"><strong>Disclaimer:</strong> This tool uses AI to analyze text for common scam patterns. Results are not guaranteed to be 100% accurate. Always conduct your own research.</p></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Job Scam Checker', description: 'Search and report fraudulent companies and recruiters', icon: Shield, color: '#DC2626', route: '/tools/scam-checker' },
            { title: 'ATS CV Review', description: 'Optimize your CV for ATS systems and job matching', icon: FileText, color: '#8B5CF6', route: '/tools/ats-review' },
            { title: 'CV Keyword Checker', description: 'Check keyword match between your CV and job descriptions', icon: CheckCircle, color: '#10B981', route: '/tools/keyword-checker' },
            { title: 'Interview Practice', description: 'Practice with personalized questions based on job descriptions', icon: AlertTriangle, color: '#F59E0B', route: '/tools/interview' },
            { title: 'Career Coach', description: 'Get personalized career guidance and advice', icon: Sparkles, color: '#3B82F6', route: '/tools/career' },
          ].map(tool => {
            const Icon = tool.icon;
            return (<a key={tool.title} href={tool.route} className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tool.color + '1A' }}><Icon size={20} style={{ color: tool.color }} /></div>
              <div><p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{tool.title}</p><p className="text-xs text-gray-500 mt-0.5 leading-snug">{tool.description}</p></div>
            </a>);
          })}
        </div>
      </div>
    </div>
  );
}
