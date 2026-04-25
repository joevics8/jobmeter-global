"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, XCircle, Flag, Loader2, Info, ExternalLink, Phone, Mail, Globe, FileText, Briefcase, Star } from 'lucide-react';
import { theme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import AdUnit from '@/components/ads/AdUnit';

interface Entity {
  id: string; entity_type: string; company_name: string; aliases: string[];
  address: string | null; phone_numbers: string[]; emails: string[];
  website: string | null; report_count: number; verification_status: string;
  is_published: boolean; created_at: string;
}

interface Report {
  id: string; report_type: string; description: string;
  evidence_url: string | null; user_email: string | null; status: string; created_at: string;
}

const REPORT_TYPES = [
  { value: 'interview_scam', label: 'Interview Scam', description: 'Fake interview process, impersonation' },
  { value: 'upfront_payment', label: 'Upfront Payment', description: 'Requested money for equipment, training, visa' },
  { value: 'fake_offer', label: 'Fake Job Offer', description: 'Non-existent job, cloned company website' },
  { value: 'phishing', label: 'Phishing', description: 'Stealing personal information, credentials' },
  { value: 'misleading', label: 'Misleading Information', description: 'False salary, unrealistic promises' },
  { value: 'other', label: 'Other', description: 'Other suspicious activity' }
];

export default function ScamCheckerClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Entity[]>([]);
  const [allEntities, setAllEntities] = useState<Entity[]>([]);
  const [tableSearch, setTableSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const TABLE_PAGE_SIZE = 100;
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [entityReports, setEntityReports] = useState<Report[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company_name: '', entity_type: 'company', website: '', emails: '', phone_numbers: '',
    report_type: '', description: '', evidence_url: '', user_email: ''
  });
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchAllEntities = async () => {
      const pageSize = 1000; let allData: Entity[] = []; let from = 0;
      while (true) {
        const { data, error } = await supabase.from('reported_entities').select('*').eq('is_published', true).order('report_count', { ascending: false }).range(from, from + pageSize - 1);
        if (error || !data || data.length === 0) break;
        allData = [...allData, ...data];
        if (data.length < pageSize) break;
        from += pageSize;
      }
      setAllEntities(allData);
    };
    fetchAllEntities();
  }, []);

  const handleSearch = async (query: string) => {
    if (query.length < 2) { setSearchResults([]); return; }
    setIsSearching(true); setError(null);
    try {
      const { data, error } = await supabase.from('reported_entities').select('*').ilike('company_name', `%${query}%`).order('report_count', { ascending: false }).limit(20);
      if (error) throw error;
      const results = data?.filter(entity => entity.is_published || ['confirmed', 'under_review'].includes(entity.verification_status)) || [];
      setSearchResults(results);
    } catch (err: any) { setError(err.message || 'Failed to search. Please try again.'); }
    finally { setIsSearching(false); }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => handleSearch(value), 500);
  };

  const selectEntity = async (entity: Entity) => {
    setSelectedEntity(entity); setSearchQuery(entity.company_name); setSearchResults([]);
    try {
      const { data, error } = await supabase.from('scam_reports').select('*').eq('entity_id', entity.id).eq('status', 'approved').order('created_at', { ascending: false }).limit(10);
      if (!error && data) setEntityReports(data);
    } catch (err) { console.error('Error fetching reports:', err); }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setError(null);
    try {
      const emailsArray = formData.emails.split(',').map(e => e.trim()).filter(Boolean);
      const phonesArray = formData.phone_numbers.split(',').map(p => p.trim()).filter(Boolean);
      const { data: existingEntity } = await supabase.from('reported_entities').select('id, report_count').ilike('company_name', formData.company_name).single();
      let entityId: string;
      if (existingEntity) {
        const { data: updatedEntity, error: updateError } = await supabase.from('reported_entities').update({ report_count: existingEntity.report_count + 1, verification_status: 'under_review' }).eq('id', existingEntity.id).select('id').single();
        if (updateError) throw updateError; entityId = updatedEntity.id;
      } else {
        const { data: newEntity, error: insertError } = await supabase.from('reported_entities').insert({ entity_type: formData.entity_type, company_name: formData.company_name, aliases: [], website: formData.website || null, emails: emailsArray, phone_numbers: phonesArray, address: null, report_count: 1, verification_status: 'under_review', is_published: false }).select('id').single();
        if (insertError) throw insertError; entityId = newEntity.id;
      }
      const { error: reportError } = await supabase.from('scam_reports').insert({ entity_id: entityId, report_type: formData.report_type, description: formData.description, evidence_url: formData.evidence_url || null, user_email: formData.user_email || null, status: 'pending' });
      if (reportError) throw reportError;
      setSubmitSuccess(true);
      setFormData({ company_name: '', entity_type: 'company', website: '', emails: '', phone_numbers: '', report_type: '', description: '', evidence_url: '', user_email: '' });
      if (searchQuery) handleSearch(searchQuery);
    } catch (err: any) { setError(err.message || 'Failed to submit report. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Confirmed Scam' };
      case 'under_review': return { color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle, label: 'Under Review' };
      case 'cleared': return { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Cleared' };
      default: return { color: 'bg-gray-100 text-gray-700', icon: Info, label: 'Reported' };
    }
  };

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-red-800">
          <p className="font-medium mb-1">Protect Yourself from Job Scams</p>
          <p className="text-red-700">Never pay money for job opportunities. Legitimate employers never ask for payment for interviews, training, or equipment. Research companies before applying.</p>
        </div>
      </div>

      {/* ── [AD: below warning banner] ─────────────────────────────── */}
      <div className="mb-6">
        <AdUnit slot="4690286797" format="fluid" layout="in-article" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Search size={20} className="text-blue-600" />Check a Company or Recruiter</h2>
        <div className="relative">
          <input type="text" value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Enter company name, recruiter name, or website..." className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg" />
          {isSearching && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="animate-spin text-gray-400" size={20} /></div>}
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 border rounded-xl overflow-hidden">
            {searchResults.map((result) => {
              const status = getStatusBadge(result.verification_status);
              const StatusIcon = status.icon;
              return (
                <button key={result.id} onClick={() => selectEntity(result)} className="w-full p-4 text-left hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between">
                  <div><p className="font-medium text-gray-900">{result.company_name}</p><p className="text-sm text-gray-500 capitalize">{result.entity_type} • {result.report_count} report{result.report_count > 1 ? 's' : ''}</p></div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}><StatusIcon size={12} />{status.label}</span>
                </button>
              );
            })}
          </div>
        )}
        {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && <p className="mt-2 text-sm text-gray-500">No results found. Be the first to report this company!</p>}
      </div>

      {allEntities.length > 0 && (() => {
        const q = tableSearch.trim().toLowerCase();
        const filtered = q ? allEntities.filter(e => [(e.company_name || '').toLowerCase(), (e.address || '').toLowerCase(), (e.entity_type || '').toLowerCase(), (e.website || '').toLowerCase(), ...(Array.isArray(e.emails) ? e.emails : []).map(em => em.toLowerCase()), ...(Array.isArray(e.phone_numbers) ? e.phone_numbers : []).map(p => p.toLowerCase())].some(s => s.includes(q))) : allEntities;
        const totalPages = Math.max(1, Math.ceil(filtered.length / TABLE_PAGE_SIZE));
        const safePage = Math.min(tablePage, totalPages);
        const pageEntities = filtered.slice((safePage - 1) * TABLE_PAGE_SIZE, safePage * TABLE_PAGE_SIZE);
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Shield size={20} className="text-red-600" />Job Scammer List ({filtered.length}{q ? ` of ${allEntities.length}` : ''} reported)</h2>
              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={tableSearch} onChange={e => { setTableSearch(e.target.value); setTablePage(1); }} placeholder="Filter list..." className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50">{['Company / Recruiter', 'Type', 'Address', 'Phone(s)', 'Email(s)', 'Website', 'Reports', 'Status'].map(h => (<th key={h} className="text-left py-3 px-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>))}</tr></thead>
                <tbody>
                  {pageEntities.length === 0 ? (<tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">No results match your filter.</td></tr>) : pageEntities.map((entity) => {
                    const status = getStatusBadge(entity.verification_status);
                    const StatusIcon = status.icon;
                    const phones = Array.isArray(entity.phone_numbers) ? entity.phone_numbers : [];
                    const emails = Array.isArray(entity.emails) ? entity.emails : [];
                    return (
                      <tr key={entity.id} className="border-b hover:bg-gray-50 cursor-pointer align-top" onClick={() => setSelectedEntity(entity)}>
                        <td className="py-3 px-3 font-medium text-gray-900 whitespace-nowrap">{entity.company_name || '—'}</td>
                        <td className="py-3 px-3 text-gray-600 capitalize whitespace-nowrap">{entity.entity_type}</td>
                        <td className="py-3 px-3 text-gray-600 max-w-[200px]">{entity.address ? <span className="text-xs leading-snug">{entity.address}</span> : <span className="text-gray-300">—</span>}</td>
                        <td className="py-3 px-3 text-gray-600">{phones.length > 0 ? phones.map((p, i) => (<a key={i} href={`tel:${p}`} onClick={e => e.stopPropagation()} className="text-xs text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap"><Phone size={10} />{p}</a>)) : <span className="text-gray-300">—</span>}</td>
                        <td className="py-3 px-3 text-gray-600">{emails.length > 0 ? emails.map((em, i) => (<a key={i} href={`mailto:${em}`} onClick={e => e.stopPropagation()} className="text-xs text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap"><Mail size={10} />{em}</a>)) : <span className="text-gray-300">—</span>}</td>
                        <td className="py-3 px-3 text-gray-600">{entity.website ? (<a href={entity.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap"><Globe size={10} />{entity.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>) : <span className="text-gray-300">—</span>}</td>
                        <td className="py-3 px-3 text-gray-700 font-medium text-center whitespace-nowrap">{entity.report_count}</td>
                        <td className="py-3 px-3 whitespace-nowrap"><span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${status.color}`}><StatusIcon size={11} />{status.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">Showing {(safePage - 1) * TABLE_PAGE_SIZE + 1}–{Math.min(safePage * TABLE_PAGE_SIZE, filtered.length)} of {filtered.length}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setTablePage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">← Prev</button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => { let page: number; if (totalPages <= 7) page = i + 1; else if (safePage <= 4) page = i + 1; else if (safePage >= totalPages - 3) page = totalPages - 6 + i; else page = safePage - 3 + i; return (<button key={page} onClick={() => setTablePage(page)} className={`w-9 h-9 text-sm rounded-lg border transition-colors ${safePage === page ? 'bg-red-600 text-white border-red-600' : 'hover:bg-gray-50'}`}>{page}</button>); })}
                  <button onClick={() => setTablePage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">Next →</button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {selectedEntity && (
        <>
          {/* ── [AD: before entity detail] ───────────────────────────── */}
          <div className="mb-6">
            <AdUnit slot="8181708196" format="fluid" layout="in-article" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
          <div className="flex items-start justify-between mb-4">
            <div><h2 className="text-xl font-bold text-gray-900">{selectedEntity.company_name}</h2><p className="text-sm text-gray-500 capitalize">{selectedEntity.entity_type}</p></div>
            {(() => { const status = getStatusBadge(selectedEntity.verification_status); const StatusIcon = status.icon; return (<span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${status.color}`}><StatusIcon size={16} />{status.label}</span>); })()}
          </div>
          {selectedEntity.website && (<div className="flex items-center gap-2 text-sm text-gray-600 mb-3"><Globe size={16} /><a href={selectedEntity.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedEntity.website}</a></div>)}
          <div className="bg-red-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-red-700 font-medium mb-1"><AlertTriangle size={18} />{selectedEntity.report_count} Report{selectedEntity.report_count > 1 ? 's' : ''}</div>
            <p className="text-sm text-red-600">This entity has been reported by job seekers. Proceed with caution.</p>
          </div>
          {entityReports.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Reported Issues</h3>
              <div className="space-y-3">
                {entityReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2"><Flag size={14} className="text-red-500" /><span className="text-sm font-medium text-gray-700">{REPORT_TYPES.find(t => t.value === report.report_type)?.label || report.report_type}</span></div>
                    <p className="text-sm text-gray-600">{report.description}</p>
                    {report.evidence_url && (<a href={report.evidence_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2">View Evidence <ExternalLink size={12} /></a>)}
                  </div>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => { setFormData({ ...formData, company_name: selectedEntity.company_name, website: selectedEntity.website || '' }); setShowReportForm(true); }} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"><Flag size={16} />Report Additional Issue</button>
        </div>
        </>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Flag size={20} className="text-red-600" />Report a Job Scam</h2>
          {!showReportForm && <button onClick={() => setShowReportForm(true)} className="text-sm text-blue-600 hover:underline">Report now</button>}
        </div>
        {submitSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle className="mx-auto text-green-600 mb-3" size={40} /><h3 className="text-lg font-medium text-green-800 mb-2">Report Submitted!</h3>
            <p className="text-sm text-green-700 mb-4">Thank you for helping protect job seekers. Our team will review your report.</p>
            <button onClick={() => { setSubmitSuccess(false); setShowReportForm(false); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Submit Another Report</button>
          </div>
        ) : showReportForm && (
          <form onSubmit={handleSubmitReport} className="space-y-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Company/Recruiter Name <span className="text-red-500">*</span></label><input type="text" required value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Name as it appears" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label><select value={formData.entity_type} onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="company">Company</option><option value="recruiter">Recruiter</option><option value="agency">Agency</option><option value="individual">Individual</option></select></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Website</label><input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email(s)</label><input type="text" value={formData.emails} onChange={(e) => setFormData({ ...formData, emails: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="email1@example.com, email2@example.com" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number(s)</label><input type="text" value={formData.phone_numbers} onChange={(e) => setFormData({ ...formData, phone_numbers: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+2348012345678" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Type of Scam <span className="text-red-500">*</span></label><select required value={formData.report_type} onChange={(e) => setFormData({ ...formData, report_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">Select type of scam</option>{REPORT_TYPES.map(type => (<option key={type.value} value={type.value}>{type.label} - {type.description}</option>))}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label><textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe what happened in detail..." /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Evidence URL</label><input type="url" value={formData.evidence_url} onChange={(e) => setFormData({ ...formData, evidence_url: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Link to screenshot, email, or any evidence" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Your Email (optional)</label><input type="email" value={formData.user_email} onChange={(e) => setFormData({ ...formData, user_email: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="For follow-up on your report" /></div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800"><strong>Note:</strong> User-reported. Not independently verified. This database contains reports from job seekers and has not been verified by our team.</div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 px-6 bg-red-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50">{isSubmitting ? (<><Loader2 className="animate-spin" size={20} />Submitting Report...</>) : (<><Flag size={20} />Submit Report</>)}</button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: FileText, title: 'CV / Resume Checker', description: 'Scan your CV for issues and ATS compatibility', href: '/tools/cv-checker', color: 'blue' },
            { icon: Briefcase, title: 'Salary Checker', description: 'Find out what your role should pay in Nigeria', href: '/tools/salary-checker', color: 'green' },
            { icon: Star, title: 'Company Reviews', description: 'Read real employee reviews before you apply', href: '/tools/company-reviews', color: 'yellow' },
          ].map((tool) => {
            const Icon = tool.icon;
            const colorMap: Record<string, string> = { blue: 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100', green: 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100', yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100' };
            const iconBg: Record<string, string> = { blue: 'bg-blue-100 text-blue-600', green: 'bg-green-100 text-green-600', yellow: 'bg-yellow-100 text-yellow-600' };
            return (<a key={tool.href} href={tool.href} className={`flex flex-col gap-3 p-4 rounded-xl border transition-colors ${colorMap[tool.color]}`}><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg[tool.color]}`}><Icon size={20} /></div><div><p className="font-semibold text-gray-900 text-sm">{tool.title}</p><p className="text-xs text-gray-600 mt-0.5">{tool.description}</p></div></a>);
          })}
        </div>
      </div>
    </div>
  );
}