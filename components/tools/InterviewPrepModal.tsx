'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Loader2, Search, FileText, Briefcase, Check, ArrowRight } from 'lucide-react';
import { InterviewPrepService } from '@/lib/services/interviewPrepService';
import { theme } from '@/lib/theme';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCredits } from '@/context/CreditContext';
import { ApplyPaymentModal } from '@/components/payment/ApplyPaymentModal';
import AuthModal from '@/components/AuthModal';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description?: string;
}

interface CVDocument {
  id: string;
  name: string;
  structuredData?: any;
  structured_data?: any;
  content?: string;
  html_content?: string;
  pasted_text?: string;
}

type Step = 'job-selection' | 'cv-selection' | 'generating';

interface InterviewPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InterviewPrepModal({ isOpen, onClose }: InterviewPrepModalProps) {
  const router = useRouter();
  const { deductCredit } = useCredits();

  const [step, setStep] = useState<Step>('job-selection');
  const [loading, setLoading] = useState(false);

  // Job selection state
  const [jobSelectionMethod, setJobSelectionMethod] = useState<'select' | 'paste' | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [pastedJobDescription, setPastedJobDescription] = useState('');

  // CV selection state (optional)
  const [cvSelectionMethod, setCvSelectionMethod] = useState<'select' | 'paste' | 'skip' | null>(null);
  const [cvDocuments, setCvDocuments] = useState<CVDocument[]>([]);
  const [filteredCVDocuments, setFilteredCVDocuments] = useState<CVDocument[]>([]);
  const [cvSearchQuery, setCvSearchQuery] = useState('');
  const [selectedCV, setSelectedCV] = useState<CVDocument | null>(null);
  const [pastedCVContent, setPastedCVContent] = useState('');

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      resetModal();
    }
  }, [isOpen]);

  const resetModal = () => {
    setStep('job-selection');
    setSelectedJob(null);
    setSelectedCV(null);
    setJobSelectionMethod(null);
    setCvSelectionMethod(null);
    setPastedJobDescription('');
    setPastedCVContent('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Load CV documents from localStorage (only CVs, not cover letters)
  const loadCVDocuments = () => {
    try {
      const cvDocs = localStorage.getItem('cv_documents');
      if (cvDocs) {
        const docs = JSON.parse(cvDocs);
        // Filter to only show CVs, not cover letters
        const cvsOnly = docs.filter((doc: any) => doc.type === 'cv' || !doc.type);
        setCvDocuments(cvsOnly);
        setFilteredCVDocuments(cvsOnly);
      }
    } catch (error) {
      console.error('Error loading CV documents:', error);
    }
  };

  // Load jobs from Supabase
  const loadJobs = async () => {
    try {
      setLoading(true);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company, location, description')
        .eq('status', 'active')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const formattedJobs: Job[] = (data || []).map((job: any) => ({
        id: job.id,
        title: job.title || 'Untitled Job',
        company: typeof job.company === 'string' ? job.company : job.company?.name || 'Company',
        location: typeof job.location === 'string' ? job.location :
          (job.location?.remote ? 'Remote' :
          [job.location?.city, job.location?.state, job.location?.country].filter(Boolean).join(', ') || 'Not specified'),
        description: job.description || '',
      }));
      
      setJobs(formattedJobs);
      setFilteredJobs(formattedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch full job details from Supabase if needed
  const fetchFullJobDetails = async (jobId: string): Promise<Job | null> => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) {
        console.error('Error fetching job details:', error);
        return null;
      }

      if (data) {
        return {
          id: data.id,
          title: data.title || 'Untitled Job',
          company: typeof data.company === 'string' ? data.company : data.company?.name || 'Company',
          location: typeof data.location === 'string' ? data.location :
            (data.location?.remote ? 'Remote' :
            [data.location?.city, data.location?.state, data.location?.country].filter(Boolean).join(', ') || 'Not specified'),
          description: data.description || data.job_description || '',
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching full job details:', error);
      return null;
    }
  };

  // Filter jobs
  useEffect(() => {
    if (!jobSearchQuery.trim()) {
      setFilteredJobs(jobs);
      return;
    }
    const query = jobSearchQuery.toLowerCase();
    const filtered = jobs.filter(job =>
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    );
    setFilteredJobs(filtered);
  }, [jobSearchQuery, jobs]);

  // Filter CV documents
  useEffect(() => {
    if (!cvSearchQuery.trim()) {
      setFilteredCVDocuments(cvDocuments);
      return;
    }
    const query = cvSearchQuery.toLowerCase();
    const filtered = cvDocuments.filter(doc =>
      doc.name.toLowerCase().includes(query)
    );
    setFilteredCVDocuments(filtered);
  }, [cvSearchQuery, cvDocuments]);

  // Load CVs when "Select" is clicked
  useEffect(() => {
    if (cvSelectionMethod === 'select') {
      loadCVDocuments();
    }
  }, [cvSelectionMethod]);

  // Load jobs when "Select" is clicked for job selection
  useEffect(() => {
    if (jobSelectionMethod === 'select') {
      loadJobs();
    }
  }, [jobSelectionMethod]);

  const handleCVSelect = (cv: CVDocument) => {
    setSelectedCV(cv);
    setCvSelectionMethod(null);
    setStep('job-selection');
  };

  const handlePasteCV = () => {
    if (!pastedCVContent.trim()) {
      alert('Please paste your CV content');
      return;
    }
    setSelectedCV({
      id: 'pasted',
      name: 'Pasted CV',
      pasted_text: pastedCVContent,
    });
    setCvSelectionMethod(null);
    setStep('job-selection');
  };

  const handleJobSelect = async (job: Job) => {
    // If the job doesn't have a description, fetch full details from Supabase
    if (!job.description || !job.description.trim()) {
      const fullJobDetails = await fetchFullJobDetails(job.id);
      if (fullJobDetails && fullJobDetails.description) {
        setSelectedJob(fullJobDetails);
      } else {
        // If we still can't get the description, show an error
        alert('Unable to load job description. Please try selecting a different job or paste the job description manually.');
        return;
      }
    } else {
      setSelectedJob(job);
    }
    setJobSelectionMethod(null);
    setStep('cv-selection');
  };

  const handlePasteJob = () => {
    if (!pastedJobDescription.trim()) {
      alert('Please paste job details');
      return;
    }
    setSelectedJob({
      id: 'pasted',
      title: 'Pasted Job',
      company: 'Unknown',
      location: '',
      description: pastedJobDescription,
    });
    setJobSelectionMethod(null);
    setStep('cv-selection');
  };

  const handleSkipCV = () => {
    setSelectedCV(null);
    setCvSelectionMethod(null);
    handleGenerateQuestions();
  };

  const handleGenerateQuestions = async () => {
    if (!selectedJob) return;

    // 1. Check Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    // 2. Check/Deduct Credit
    const result = await deductCredit(1);
    if (!result.success) {
      setShowPaymentModal(true);
      return;
    }

    setLoading(true);
    setStep('generating');

    try {
      // Get CV content if selected
      let cvContent = '';
      if (selectedCV) {
        if (selectedCV.html_content) {
          cvContent = selectedCV.html_content;
        } else if (selectedCV.structured_data) {
          const data = selectedCV.structured_data;
          cvContent = JSON.stringify(data);
        }
      }

      if (!selectedJob.description || !selectedJob.description.trim()) {
        alert('Job description is required. Please provide a job description.');
        setStep('job-selection');
        setLoading(false);
        return;
      }

      const newSession = InterviewPrepService.createSession(
        selectedJob.description || '',
        selectedJob.title,
        selectedJob.company,
        !!selectedCV
      );

      InterviewPrepService.saveSession(newSession);

      // FIXED REDIRECT - Push first, then close modal
      router.push(`/tools/interview/${newSession.id}`);
      
      // Close modal after navigation starts (prevents race condition)
      setTimeout(() => {
        onClose();
      }, 150);

    } catch (error: any) {
      console.error('Error generating questions:', error);
      alert(error.message || 'Failed to generate questions. Please try again.');
      setStep('job-selection');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogTitle className="sr-only">Interview Preparation</DialogTitle>
          <DialogDescription className="sr-only">Prepare for job interviews by selecting a job and optionally providing your CV</DialogDescription>

          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Interview Preparation</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${step === 'job-selection' ? 'bg-blue-500' : step === 'cv-selection' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-gray-600">
                  {step === 'job-selection' ? 'Select Job' : step === 'cv-selection' ? 'Optional CV' : 'Generating Questions'}
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'job-selection' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose a Job to Prepare For</h3>
                  <p className="text-gray-600 mb-4">Select a job from your saved jobs or paste a job description.</p>

                  {!jobSelectionMethod && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setJobSelectionMethod('select')}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <Briefcase className="mx-auto mb-2 text-gray-400" size={24} />
                        <div className="font-medium text-gray-900">Select from Saved Jobs</div>
                        <div className="text-sm text-gray-500">Choose from your previously saved jobs</div>
                      </button>
                      <button
                        onClick={() => setJobSelectionMethod('paste')}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <FileText className="mx-auto mb-2 text-gray-400" size={24} />
                        <div className="font-medium text-gray-900">Paste Job Description</div>
                        <div className="text-sm text-gray-500">Copy and paste a job posting</div>
                      </button>
                    </div>
                  )}

                  {jobSelectionMethod === 'select' && (
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          placeholder="Search jobs..."
                          value={jobSearchQuery}
                          onChange={(e) => setJobSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredJobs.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            {jobs.length === 0 ? 'No saved jobs found. Try pasting a job description instead.' : 'No jobs match your search.'}
                          </div>
                        ) : (
                          filteredJobs.map((job) => (
                            <button
                              key={job.id}
                              onClick={() => handleJobSelect(job)}
                              className="w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{job.title}</div>
                              <div className="text-sm text-gray-600">{job.company} • {job.location}</div>
                            </button>
                          ))
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setJobSelectionMethod(null)}>Back</Button>
                      </div>
                    </div>
                  )}

                  {jobSelectionMethod === 'paste' && (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Paste the job description here..."
                        value={pastedJobDescription}
                        onChange={(e) => setPastedJobDescription(e.target.value)}
                        className="min-h-[200px]"
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setJobSelectionMethod(null)}>Back</Button>
                        <Button onClick={handlePasteJob} disabled={!pastedJobDescription.trim()}>
                          Continue
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 'cv-selection' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Optional: Add Your CV</h3>
                  <p className="text-gray-600 mb-4">Including your CV helps generate more personalized questions.</p>

                  {!cvSelectionMethod && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => setCvSelectionMethod('select')}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <FileText className="mx-auto mb-2 text-gray-400" size={24} />
                        <div className="font-medium text-gray-900">Select CV</div>
                        <div className="text-sm text-gray-500">Choose from saved CVs</div>
                      </button>
                      <button
                        onClick={() => setCvSelectionMethod('paste')}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <FileText className="mx-auto mb-2 text-gray-400" size={24} />
                        <div className="font-medium text-gray-900">Paste CV</div>
                        <div className="text-sm text-gray-500">Copy and paste CV content</div>
                      </button>
                      <button
                        onClick={handleSkipCV}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                      >
                        <Check className="mx-auto mb-2 text-gray-400" size={24} />
                        <div className="font-medium text-gray-900">Skip</div>
                        <div className="text-sm text-gray-500">Continue without CV</div>
                      </button>
                    </div>
                  )}

                  {cvSelectionMethod === 'select' && (
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          placeholder="Search CVs..."
                          value={cvSearchQuery}
                          onChange={(e) => setCvSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredCVDocuments.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            {cvDocuments.length === 0 ? 'No saved CVs found. Try pasting CV content instead.' : 'No CVs match your search.'}
                          </div>
                        ) : (
                          filteredCVDocuments.map((cv) => (
                            <button
                              key={cv.id}
                              onClick={() => {
                                setSelectedCV(cv);
                                setCvSelectionMethod(null);
                                handleGenerateQuestions();
                              }}
                              className="w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{cv.name}</div>
                            </button>
                          ))
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setCvSelectionMethod(null)}>Back</Button>
                      </div>
                    </div>
                  )}

                  {cvSelectionMethod === 'paste' && (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Paste your CV content here..."
                        value={pastedCVContent}
                        onChange={(e) => setPastedCVContent(e.target.value)}
                        className="min-h-[200px]"
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setCvSelectionMethod(null)}>Back</Button>
                        <Button onClick={() => {
                          if (!pastedCVContent.trim()) {
                            alert('Please paste your CV content');
                            return;
                          }
                          setSelectedCV({
                            id: 'pasted',
                            name: 'Pasted CV',
                            pasted_text: pastedCVContent,
                          });
                          setCvSelectionMethod(null);
                          handleGenerateQuestions();
                        }} disabled={!pastedCVContent.trim()}>
                          Continue
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 'generating' && (
              <div className="text-center py-12">
                <Loader2 className="mx-auto mb-4 animate-spin text-blue-500" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Interview Questions</h3>
                <p className="text-gray-600">Please wait while we create personalized questions for your interview preparation...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth & Payment Modals */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      <ApplyPaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onAuthRequired={() => setShowAuthModal(true)}
      />
    </>
  );
}