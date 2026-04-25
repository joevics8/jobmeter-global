"use client";

import React, { useState, useRef } from 'react';
import { FileCheck, CheckCircle, XCircle, Sparkles, Loader2, Upload, ArrowRight, ArrowLeft } from 'lucide-react';
import { theme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import AdUnit from '@/components/ads/AdUnit';

interface KeywordResult {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendedKeywords: string[];
  hardSkills: string[];
  softSkills: string[];
  bulletImprovements: string[];
  summary: string;
}

export default function KeywordCheckerClient() {
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<KeywordResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('paste');

  const cvInputRef = useRef<HTMLTextAreaElement>(null);
  const jobInputRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const analyzeKeywords = async () => {
    if (!cvText.trim() || !jobDescription.trim()) {
      setError('Please provide both your CV and the job description');
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const { data, error: apiError } = await supabase.functions.invoke('keyword-checker', {
        body: { cvText: cvText.trim(), jobDescription: jobDescription.trim() }
      });
      if (apiError) throw apiError;
      if (!data.success) throw new Error(data.error || 'Failed to analyze');
      setResult(data.data);
      setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-100', text: 'text-green-700', label: 'Excellent Match' };
    if (score >= 60) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Good Match' };
    if (score >= 40) return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Needs Work' };
    return { bg: 'bg-red-100', text: 'text-red-700', label: 'Poor Match' };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Input Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileCheck size={20} className="text-green-600" />
          Analyze Your CV
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Your CV <span className="text-red-500">*</span></label>
          <div className="flex gap-2 mb-2">
            <button onClick={() => setActiveTab('paste')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'paste' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>Paste CV</button>
            <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>Upload CV</button>
          </div>
          {activeTab === 'paste' ? (
            <textarea ref={cvInputRef} value={cvText} onChange={(e) => setCvText(e.target.value)} rows={8} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Paste your CV content here... Include your skills, work experience, education, and any other relevant information." />
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600 mb-2">Upload your CV (PDF, DOCX)</p>
              <input type="file" accept=".pdf,.docx,.doc" className="hidden" id="cv-upload" />
              <label htmlFor="cv-upload" className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 inline-block">Choose File</label>
              <p className="text-xs text-gray-500 mt-2">Coming soon - paste your CV for now</p>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Description <span className="text-red-500">*</span></label>
          <textarea ref={jobInputRef} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={8} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Paste the job description here... Include the required skills, qualifications, and responsibilities." />
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
        <button onClick={analyzeKeywords} disabled={isAnalyzing || !cvText.trim() || !jobDescription.trim()} className="w-full py-3 px-6 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
          {isAnalyzing ? <><Loader2 className="animate-spin" size={20} /> Analyzing...</> : <><Sparkles size={20} /> Analyze CV</>}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div ref={resultsRef} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Analysis Results</h2>
              <div className={`px-4 py-2 rounded-xl ${getScoreColor(result.matchScore).bg}`}>
                <span className={`text-2xl font-bold ${getScoreColor(result.matchScore).text}`}>{result.matchScore}%</span>
              </div>
            </div>
            <p className="text-gray-600">{result.summary}</p>
          </div>

          {/* ── [AD: between score and keyword grids] ────────────────── */}
          <AdUnit slot="4690286797" format="fluid" layout="in-article" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> Matched Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.matchedKeywords.map((keyword, index) => (<span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{keyword}</span>))}
                {result.matchedKeywords.length === 0 && <p className="text-gray-500 text-sm">No keywords matched</p>}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><XCircle size={18} className="text-red-500" /> Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((keyword, index) => (<span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">{keyword}</span>))}
                {result.missingKeywords.length === 0 && <p className="text-gray-500 text-sm">No missing keywords</p>}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Sparkles size={18} className="text-purple-500" /> Recommended Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.recommendedKeywords.map((keyword, index) => (<span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{keyword}</span>))}
                {result.recommendedKeywords.length === 0 && <p className="text-gray-500 text-sm">No recommendations</p>}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FileCheck size={18} className="text-blue-500" /> Hard Skills Found</h3>
              <div className="flex flex-wrap gap-2">
                {result.hardSkills.map((skill, index) => (<span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{skill}</span>))}
                {result.hardSkills.length === 0 && <p className="text-gray-500 text-sm">No hard skills detected</p>}
              </div>
            </div>
          </div>
          {result.bulletImprovements.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><ArrowRight size={18} className="text-orange-500" /> Recommended Improvements</h3>
              <ul className="space-y-2">
                {result.bulletImprovements.map((improvement, index) => (<li key={index} className="flex items-start gap-2 text-gray-700"><span className="text-orange-500 mt-1">•</span>{improvement}</li>))}
              </ul>
            </div>
          )}
          {result.softSkills.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
              <h3 className="font-bold text-gray-900 mb-3">Soft Skills Found</h3>
              <div className="flex flex-wrap gap-2">
                {result.softSkills.map((skill, index) => (<span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{skill}</span>))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}