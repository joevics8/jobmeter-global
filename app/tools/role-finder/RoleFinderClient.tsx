"use client";

import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown, Sparkles, Briefcase, Award, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { theme } from '@/lib/theme';
import { SKILLS_CATEGORIES, POPULAR_TOOLS } from '@/lib/constants/skills';
import { supabase } from '@/lib/supabase';
import AdUnit from '@/components/ads/AdUnit';

interface Role {
  role: string; seniority: string; description: string;
  requiredSkills: string[]; skillGaps: string[];
  certifications: string[]; salaryRange: string; matchScore: number;
}

interface RoleFinderResult {
  roles: Role[]; summary: string; totalSkillsMatched: number;
}

const EXPERIENCE_LEVELS = [
  { value: 0, label: 'Less than 1 year' },
  { value: 1, label: '1 year' }, { value: 2, label: '2 years' }, { value: 3, label: '3 years' },
  { value: 4, label: '4 years' }, { value: 5, label: '5 years' }, { value: 6, label: '6 years' },
  { value: 7, label: '7 years' }, { value: 8, label: '8 years' }, { value: 9, label: '9 years' },
  { value: 10, label: '10+ years' },
];

export default function RoleFinderClient() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [customTool, setCustomTool] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<RoleFinderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showToolDropdown, setShowToolDropdown] = useState(false);

  const displayedCategories = useMemo(() => {
    const categories = Object.entries(SKILLS_CATEGORIES);
    return showAllCategories ? categories : categories.slice(0, 6);
  }, [showAllCategories]);

  const filteredTools = useMemo(() => {
    if (!customTool) return POPULAR_TOOLS.filter(t => !selectedTools.includes(t));
    return POPULAR_TOOLS.filter(t => t.toLowerCase().includes(customTool.toLowerCase()) && !selectedTools.includes(t));
  }, [customTool, selectedTools]);

  const addSkill = (skill: string) => { if (!selectedSkills.includes(skill)) setSelectedSkills([...selectedSkills, skill]); };
  const removeSkill = (skill: string) => { setSelectedSkills(selectedSkills.filter(s => s !== skill)); };
  const addCustomSkill = () => {
    if (customSkill.trim()) { const skill = customSkill.trim(); if (!selectedSkills.includes(skill)) setSelectedSkills([...selectedSkills, skill]); setCustomSkill(''); }
  };
  const addTool = (tool: string) => { if (!selectedTools.includes(tool)) setSelectedTools([...selectedTools, tool]); setCustomTool(''); setShowToolDropdown(false); };
  const removeTool = (tool: string) => { setSelectedTools(selectedTools.filter(t => t !== tool)); };
  const addCustomTool = () => {
    if (customTool.trim()) { const tool = customTool.trim(); if (!selectedTools.includes(tool)) setSelectedTools([...selectedTools, tool]); setCustomTool(''); }
  };

  const findRoles = async () => {
    if (selectedSkills.length === 0) { setError('Please select at least one skill'); return; }
    setIsSearching(true); setError(null); setResult(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error: apiError } = await supabase.functions.invoke('role-finder', {
        body: { skills: selectedSkills, tools: selectedTools, yearsOfExperience, userId: user?.id || null }
      });
      if (apiError) throw new Error(apiError.message);
      if (!data.success) throw new Error(data.error || 'Failed to find roles');
      setResult(data.data);
    } catch (err: any) { console.error('Role finder error:', err); setError(err.message || 'Failed to find roles. Please try again.'); }
    finally { setIsSearching(false); }
  };

  const getMatchColor = (score: number) => { if (score >= 80) return 'text-green-600 bg-green-50'; if (score >= 60) return 'text-yellow-600 bg-yellow-50'; return 'text-red-600 bg-red-50'; };
  const getSeniorityColor = (seniority: string) => { const s = seniority.toLowerCase(); if (s.includes('senior') || s.includes('lead') || s.includes('principal')) return 'bg-purple-100 text-purple-700'; if (s.includes('mid') || s.includes('intermediate')) return 'bg-blue-100 text-blue-700'; return 'bg-gray-100 text-gray-700'; };

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select your skills <span className="text-red-500">*</span></label>
          <p className="text-xs text-gray-500 mb-3">Choose from popular skills or add your own</p>
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedSkills.map(skill => (<span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700">{skill}<button onClick={() => removeSkill(skill)} className="hover:text-blue-900"><X size={14} /></button></span>))}
            </div>
          )}
          <div className="flex gap-2 mb-4">
            <input type="text" value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()} placeholder="Type a skill and press Enter" className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={addCustomSkill} disabled={!customSkill.trim()} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50">Add</button>
          </div>
          <div className="space-y-4">
            {displayedCategories.map(([category, skills]) => (
              <div key={category}>
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (<button key={skill} onClick={() => addSkill(skill)} disabled={selectedSkills.includes(skill)} className={`px-3 py-1 text-sm rounded-full border transition-colors ${selectedSkills.includes(skill) ? 'bg-blue-100 border-blue-300 text-blue-800 cursor-default' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}>{skill}</button>))}
                </div>
              </div>
            ))}
          </div>
          {!showAllCategories && (<button onClick={() => setShowAllCategories(true)} className="mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">Show all skill categories <ChevronDown size={16} /></button>)}
        </div>

        <div className="mb-6 pt-6 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tools & Software you use</label>
          <p className="text-xs text-gray-500 mb-3">Optional - add tools like Excel, Figma, etc.</p>
          {selectedTools.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTools.map(tool => (<span key={tool} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-50 text-green-700">{tool}<button onClick={() => removeTool(tool)} className="hover:text-green-900"><X size={14} /></button></span>))}
            </div>
          )}
          <div className="relative">
            <input type="text" value={customTool} onChange={(e) => { setCustomTool(e.target.value); setShowToolDropdown(true); }} onFocus={() => setShowToolDropdown(true)} placeholder="Type a tool and press Enter" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            {showToolDropdown && filteredTools.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredTools.slice(0, 10).map(tool => (<button key={tool} onClick={() => addTool(tool)} className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm">{tool}</button>))}
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 pt-6 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
          <p className="text-xs text-gray-500 mb-3">Optional - helps refine role recommendations</p>
          <select value={yearsOfExperience ?? ''} onChange={(e) => setYearsOfExperience(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Select years of experience</option>
            {EXPERIENCE_LEVELS.map(level => (<option key={level.value} value={level.value}>{level.label}</option>))}
          </select>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <button onClick={findRoles} disabled={isSearching || selectedSkills.length === 0} className="w-full py-3 px-6 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
          {isSearching ? <><Loader2 className="animate-spin" size={20} />Finding your ideal roles...</> : <><Sparkles size={20} />Find Alternative Roles</>}
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
            <h2 className="text-lg font-bold mb-2">Career Summary</h2>
            <p className="text-white/90">{result.summary}</p>
            <div className="mt-4 flex items-center gap-2 text-sm"><TrendingUp size={16} /><span>{result.roles.length} roles matched based on your {selectedSkills.length} skills</span></div>
          </div>

          {/* ── [AD: between summary and role cards] ─────────────────── */}
          <AdUnit slot="4690286797" format="fluid" layout="in-article" />

          <div className="grid gap-4">
            {result.roles.map((role, index) => (
              <div key={index} className="bg-white rounded-xl p-5 shadow-sm" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{role.role}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getSeniorityColor(role.seniority)}`}>{role.seniority}</span>
                    </div>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getMatchColor(role.matchScore)}`}>{role.matchScore}% Match</div>
                </div>
                {role.salaryRange && (<div className="flex items-center gap-2 mb-3 text-sm text-gray-600"><TrendingUp size={14} className="text-green-600" /><span>{role.salaryRange}</span></div>)}
                {role.requiredSkills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Required Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {role.requiredSkills.map(skill => (<span key={skill} className={`px-2 py-0.5 text-xs rounded ${selectedSkills.some(s => skill.toLowerCase().includes(s.toLowerCase())) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{skill}</span>))}
                    </div>
                  </div>
                )}
                {role.skillGaps.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Skills to Develop</p>
                    <div className="flex flex-wrap gap-1">{role.skillGaps.map(skill => (<span key={skill} className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700">{skill}</span>))}</div>
                  </div>
                )}
                {role.certifications.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Recommended Certifications</p>
                    <div className="flex flex-wrap gap-1">{role.certifications.map(cert => (<span key={cert} className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700 flex items-center gap-1"><Award size={10} />{cert}</span>))}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-16 mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Related Career Tools</h2>
        <p className="text-sm text-gray-500 mb-5">More free AI tools to help you find the right career and land your next role</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'CV Keyword Checker', desc: 'Check keyword match between your CV and job descriptions', href: '/tools/keyword-checker', color: '#10B981', bg: 'bg-emerald-50', border: 'border-emerald-200', tag: 'CV Tools' },
            { title: 'ATS CV Review', desc: 'Optimize your CV for ATS systems to pass automated screening', href: '/tools/ats-review', color: '#8B5CF6', bg: 'bg-purple-50', border: 'border-purple-200', tag: 'CV Tools' },
            { title: 'Interview Practice', desc: 'Practice with AI-generated questions tailored to any job description', href: '/tools/interview', color: '#8B5CF6', bg: 'bg-purple-50', border: 'border-purple-200', tag: 'Career Tools' },
            { title: 'Career Coach', desc: 'Get personalized career guidance and step-by-step advice', href: '/tools/career', color: '#F59E0B', bg: 'bg-amber-50', border: 'border-amber-200', tag: 'Career Tools' },
            { title: 'Job Scam Checker', desc: 'Verify companies and flag fraudulent recruiters before you apply', href: '/tools/scam-checker', color: '#EF4444', bg: 'bg-red-50', border: 'border-red-200', tag: 'Safety Tools' },
            { title: 'Create CV / Cover Letter', desc: 'Build a professional, ATS-ready CV and cover letter in minutes', href: '/cv', color: '#2563EB', bg: 'bg-blue-50', border: 'border-blue-200', tag: 'CV Tools' },
          ].map(tool => (
            <a key={tool.href} href={tool.href} className={`flex flex-col gap-2 p-5 rounded-xl border ${tool.bg} ${tool.border} hover:shadow-md transition-shadow group`}>
              <div className="flex items-center justify-between"><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/70 text-gray-500">{tool.tag}</span><ArrowRight size={16} className="text-gray-400 group-hover:text-gray-700 transition-colors" /></div>
              <p className="font-semibold text-gray-900 text-sm">{tool.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{tool.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}