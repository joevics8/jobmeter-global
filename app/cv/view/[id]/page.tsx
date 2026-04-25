"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Edit, FileText, Check, X, Save, Trash2 } from 'lucide-react';
import { theme } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { renderCVTemplate } from '@/lib/services/cvTemplateRenderer';
import { renderCoverLetterTemplate } from '@/lib/services/coverLetterTemplateRenderer';
import { CV_TEMPLATES } from '@/lib/types/cv';
import { COVER_LETTER_TEMPLATES } from '@/lib/types/coverLetter';
import { CVData } from '@/lib/types/cv';
import { StructuredCoverLetter } from '@/lib/types/coverLetter';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface CVDocument {
  id: string;
  name: string;
  type: 'cv' | 'cover-letter';
  templateId: string;
  structuredData: any;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function CVViewPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  
  const [document, setDocument] = useState<CVDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>('template-1');
  const [renderedHTML, setRenderedHTML] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<CVData | StructuredCoverLetter | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  useEffect(() => {
    if (document && currentTemplateId) {
      renderDocument(document, currentTemplateId);
    }
  }, [document, currentTemplateId]);

  useEffect(() => {
    if (isEditMode && document) {
      setEditedData(document.structuredData);
    }
  }, [isEditMode, document]);

  const loadDocument = () => {
    try {
      setLoading(true);
      const existingDocs = localStorage.getItem('cv_documents');
      if (existingDocs) {
        const docs = JSON.parse(existingDocs);
        const found = docs.find((doc: any) => doc.id === documentId);
        if (found) {
          setDocument(found);
          setCurrentTemplateId(found.templateId || 'template-1');
        }
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDocument = (doc: CVDocument, templateId: string) => {
    try {
      let html = '';
      if (doc.type === 'cv') {
        // Use 'view' mode for responsive templates in viewer
        html = renderCVTemplate(templateId, doc.structuredData as CVData, 'view');
      } else if (doc.type === 'cover-letter') {
        // Use 'view' mode for responsive templates in viewer
        html = renderCoverLetterTemplate(templateId, doc.structuredData as StructuredCoverLetter, 'view');
      }
      setRenderedHTML(html);
    } catch (error) {
      console.error('Error rendering document:', error);
    }
  };

  const handleTemplateSwitch = (newTemplateId: string) => {
    setCurrentTemplateId(newTemplateId);
    // The useEffect will re-render with the new template
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSave = () => {
    if (!document || !editedData) return;

    try {
      const existingDocs = localStorage.getItem('cv_documents');
      if (existingDocs) {
        const docs = JSON.parse(existingDocs);
        const docIndex = docs.findIndex((doc: any) => doc.id === documentId);
        if (docIndex !== -1) {
          // Update structured data and re-render with current template
          docs[docIndex].structuredData = editedData;
          docs[docIndex].templateId = currentTemplateId;
          docs[docIndex].updatedAt = new Date().toISOString();
          
          // Re-render content with current template
          let html = '';
          if (document.type === 'cv') {
            html = renderCVTemplate(currentTemplateId, editedData as CVData, 'view');
          } else {
            html = renderCoverLetterTemplate(currentTemplateId, editedData as StructuredCoverLetter, 'view');
          }
          docs[docIndex].content = html;
          
          localStorage.setItem('cv_documents', JSON.stringify(docs));
          setDocument(docs[docIndex]);
          setIsEditMode(false);
        }
      }
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save changes');
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedData(null);
  };
// Replace the handleDownload function in your page.tsx with this updated version
// Fixed to capture full content height properly

const handleDownload = async () => {
  if (!document) {
    alert('Document content is not available. Please try again.');
    return;
  }
  
  // Guard: Ensure we're in a browser environment
  if (typeof window === 'undefined' || !window.document?.body) {
    console.error('Browser environment is not available');
    return;
  }

  const doc = window.document;
  const docBody = doc.body;

  setIsGeneratingPDF(true);
  try {
    // Render PDF-optimized template (mode = 'pdf')
    let pdfHTML = '';
    if (document.type === 'cv') {
      pdfHTML = renderCVTemplate(currentTemplateId, document.structuredData as CVData, 'pdf');
    } else {
      pdfHTML = renderCoverLetterTemplate(currentTemplateId, document.structuredData as StructuredCoverLetter, 'pdf');
    }

    // Create a temporary container for PDF generation
    const printableContent = doc.createElement('div');
    printableContent.id = 'printable-content';
    printableContent.style.position = 'absolute';
    printableContent.style.left = '0';
    printableContent.style.top = '0';
    printableContent.style.zIndex = '-9999'; // Hide behind everything
    printableContent.style.width = '210mm'; // A4 width
    printableContent.style.minHeight = '297mm'; // A4 height minimum
    printableContent.style.backgroundColor = 'white';
    printableContent.style.overflow = 'visible'; // Don't clip content
    
    // Set the PDF-optimized HTML
    printableContent.innerHTML = pdfHTML;
    docBody.appendChild(printableContent);

    // Wait for content to fully render and fonts to load
    await new Promise(resolve => setTimeout(resolve, 800));

    // Get the actual rendered height
    const actualHeight = printableContent.scrollHeight;
    const actualWidth = printableContent.scrollWidth;

    console.log('Capturing content with dimensions:', { 
      width: actualWidth, 
      height: actualHeight,
      widthMM: '210mm'
    });

    // Capture the canvas with high quality - use actual dimensions
    const canvas = await html2canvas(printableContent, {
      scale: 3, // High resolution for crisp text
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: actualWidth,
      height: actualHeight,
      windowWidth: actualWidth,
      windowHeight: actualHeight,
      backgroundColor: '#ffffff',
      scrollY: -window.scrollY,
      scrollX: -window.scrollX,
    });

    console.log('Canvas captured:', {
      width: canvas.width,
      height: canvas.height
    });

    // A4 dimensions in mm
    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;

    // Calculate canvas dimensions in mm (maintaining aspect ratio)
    const canvasWidthMM = A4_WIDTH_MM;
    const canvasHeightMM = (canvas.height * A4_WIDTH_MM) / canvas.width;

    console.log('Calculated dimensions in mm:', {
      canvasWidthMM,
      canvasHeightMM,
      needsScaling: canvasHeightMM > A4_HEIGHT_MM
    });

    // Initialize PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    // Determine if we need to scale down to fit 1 page
    if (canvasHeightMM > A4_HEIGHT_MM) {
      // Content is too tall - scale everything proportionally to fit A4 height
      const scaleFactor = A4_HEIGHT_MM / canvasHeightMM;
      const finalHeight = A4_HEIGHT_MM;
      const finalWidth = A4_WIDTH_MM * scaleFactor;
      
      // Center horizontally if width was reduced
      const xOffset = (A4_WIDTH_MM - finalWidth) / 2;
      
      console.log('Scaling down to fit:', {
        scaleFactor,
        finalWidth,
        finalHeight,
        xOffset
      });
      
      pdf.addImage(imgData, 'JPEG', xOffset, 0, finalWidth, finalHeight);
    } else {
      // Content fits within 1 page - center it vertically
      const yOffset = (A4_HEIGHT_MM - canvasHeightMM) / 2;
      
      console.log('Centering content:', {
        canvasHeightMM,
        yOffset
      });
      
      pdf.addImage(imgData, 'JPEG', 0, yOffset, A4_WIDTH_MM, canvasHeightMM);
    }

    // Save the PDF (guaranteed 1 page)
    pdf.save(`${document.name || 'document'}.pdf`);

    // Clean up temporary element
    if (docBody.contains(printableContent)) {
      docBody.removeChild(printableContent);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  } finally {
    setIsGeneratingPDF(false);
  }
};

  const handleFieldChange = (path: string[], value: any) => {
    if (!editedData) return;
    
    const newData = { ...editedData };
    let current: any = newData;
    
    // Navigate to the parent object
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    
    // Set the value
    current[path[path.length - 1]] = value;
    setEditedData(newData);
  };

  const handleArrayItemChange = (path: string[], index: number, field: string, value: any) => {
    if (!editedData) return;
    
    const newData = { ...editedData };
    let current: any = newData;
    
    // Navigate to the parent array
    for (let i = 0; i < path.length; i++) {
      current = current[path[i]];
    }
    
    // Update the item
    if (current && Array.isArray(current) && current[index]) {
      current[index] = { ...current[index], [field]: value };
      setEditedData(newData);
    }
  };

  const handleArrayItemRemove = (path: string[], index: number) => {
    if (!editedData) return;
    
    const newData = { ...editedData };
    let current: any = newData;
    
    // Navigate to the parent array
    for (let i = 0; i < path.length; i++) {
      current = current[path[i]];
    }
    
    // Remove the item
    if (current && Array.isArray(current)) {
      current.splice(index, 1);
      setEditedData(newData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background.muted }}>
        <p className="text-gray-600">Loading document...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: theme.colors.background.muted }}>
        <p className="text-lg font-semibold mb-2 text-gray-900">Document not found</p>
        <Button
          onClick={() => router.push('/cv')}
          style={{ backgroundColor: theme.colors.primary.DEFAULT }}
        >
          Back to CVs
        </Button>
      </div>
    );
  }

  const templates = document.type === 'cv' ? CV_TEMPLATES : COVER_LETTER_TEMPLATES;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.colors.background.muted }}>
      {/* Header */}
      <div
        className="flex-shrink-0 pt-6 pb-4 px-6 bg-white border-b shadow-sm"
        style={{ borderBottomColor: theme.colors.border.DEFAULT }}
      >
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex-1">{document.name}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isEditMode && (
            <div className="block md:hidden">
              <Select value={currentTemplateId} onValueChange={handleTemplateSwitch}>
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  <X size={16} className="mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
                  <Save size={16} className="mr-1" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleDownload} disabled={isGeneratingPDF}>
                  <Download size={16} className="mr-1" />
                  {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit size={16} className="mr-1" />
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Template Switcher */}
        {!isEditMode && (
          <div className="mt-4 hidden md:block">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Switch Template</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSwitch(template.id)}
                  className={`flex-shrink-0 p-3 border-2 rounded-lg transition-all ${
                    currentTemplateId === template.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText size={24} className="mx-auto mb-1 text-gray-600" />
                  <p className="text-xs font-medium text-center text-gray-700">{template.name}</p>
                  {currentTemplateId === template.id && (
                    <Check size={14} className="mx-auto mt-1 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 bg-gray-50">
        {isEditMode && editedData ? (
          <div className="w-full max-w-4xl mx-auto">
            <EditForm
              data={editedData}
              type={document.type}
              onFieldChange={handleFieldChange}
              onArrayItemChange={handleArrayItemChange}
              onArrayItemRemove={handleArrayItemRemove}
            />
          </div>
        ) : renderedHTML ? (
          <div className="w-full max-w-4xl mx-auto">
            <div
              ref={contentContainerRef}
              className="bg-white rounded-xl shadow-2xl overflow-hidden"
              dangerouslySetInnerHTML={{ __html: renderedHTML }}
            />
          </div>
        ) : (
          <div className="text-center">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Document is being rendered</h3>
            <p className="text-gray-600">Please wait while your {document.type === 'cv' ? 'CV' : 'cover letter'} is being displayed...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Comprehensive edit form component
function EditForm({ 
  data, 
  type, 
  onFieldChange, 
  onArrayItemChange, 
  onArrayItemRemove 
}: { 
  data: any; 
  type: 'cv' | 'cover-letter';
  onFieldChange: (path: string[], value: any) => void;
  onArrayItemChange: (path: string[], index: number, field: string, value: any) => void;
  onArrayItemRemove: (path: string[], index: number) => void;
}) {
  if (type === 'cv') {
    return <CVEditForm data={data as CVData} onFieldChange={onFieldChange} onArrayItemChange={onArrayItemChange} onArrayItemRemove={onArrayItemRemove} />;
  } else {
    return <CoverLetterEditForm data={data as StructuredCoverLetter} onFieldChange={onFieldChange} onArrayItemChange={onArrayItemChange} onArrayItemRemove={onArrayItemRemove} />;
  }
}

// Helper function to check if a value has content
function hasContent(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0 && value.some(item => hasContent(item));
  if (typeof value === 'object') {
    return Object.values(value).some(val => hasContent(val));
  }
  return true;
}

// Helper function to check if personal details section has any content
function hasPersonalDetailsContent(personalDetails: any): boolean {
  if (!personalDetails) return false;
  return hasContent(personalDetails.name) || 
         hasContent(personalDetails.title) || 
         hasContent(personalDetails.email) || 
         hasContent(personalDetails.phone) || 
         hasContent(personalDetails.location) || 
         hasContent(personalDetails.linkedin) || 
         hasContent(personalDetails.github) || 
         hasContent(personalDetails.portfolio);
}

// CV Edit Form - shows only fields that have content
function CVEditForm({ 
  data, 
  onFieldChange, 
  onArrayItemChange, 
  onArrayItemRemove 
}: { 
  data: CVData;
  onFieldChange: (path: string[], value: any) => void;
  onArrayItemChange: (path: string[], index: number, field: string, value: any) => void;
  onArrayItemRemove: (path: string[], index: number) => void;
}) {
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Edit CV</h2>
      
      {/* Personal Details */}
      {hasPersonalDetailsContent(data.personalDetails) && (
        <div className="border-b pb-6 space-y-4">
          <h3 className="text-base font-semibold">Personal Details</h3>
          {hasContent(data.personalDetails?.name) && (
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={data.personalDetails?.name ?? ''}
                onChange={(e) => onFieldChange(['personalDetails', 'name'], e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          )}
          {hasContent(data.personalDetails?.title) && (
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={data.personalDetails?.title ?? ''}
                onChange={(e) => onFieldChange(['personalDetails', 'title'], e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          )}
          {hasContent(data.personalDetails?.email) && (
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={data.personalDetails?.email ?? ''}
                onChange={(e) => onFieldChange(['personalDetails', 'email'], e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          )}
          {hasContent(data.personalDetails?.phone) && (
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={data.personalDetails?.phone ?? ''}
                onChange={(e) => onFieldChange(['personalDetails', 'phone'], e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          )}
          {hasContent(data.personalDetails?.location) && (
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={data.personalDetails?.location ?? ''}
                onChange={(e) => onFieldChange(['personalDetails', 'location'], e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          )}
          {hasContent(data.personalDetails?.linkedin) && (
            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn</label>
              <input
                type="url"
                value={data.personalDetails?.linkedin ?? ''}
                onChange={(e) => onFieldChange(['personalDetails', 'linkedin'], e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          )}
          {hasContent(data.personalDetails?.github) && (
            <div>
              <label className="block text-sm font-medium mb-1">GitHub</label>
              <input
                type="url"
                value={data.personalDetails?.github ?? ''}
                onChange={(e) => onFieldChange(['personalDetails', 'github'], e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          )}
          {hasContent(data.personalDetails?.portfolio) && (
            <div>
              <label className="block text-sm font-medium mb-1">Portfolio</label>
              <input
                type="url"
                value={data.personalDetails?.portfolio ?? ''}
                onChange={(e) => onFieldChange(['personalDetails', 'portfolio'], e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          )}
        </div>
      )}
      
      {/* Summary */}
      {hasContent(data.summary) && (
        <div className="border-b pb-6">
          <h3 className="text-base font-semibold mb-3">Professional Summary</h3>
          <textarea
            value={data.summary}
            onChange={(e) => onFieldChange(['summary'], e.target.value)}
            className="w-full p-2 border rounded"
            rows={5}
          />
        </div>
      )}
      
      {/* Roles */}
      {hasContent(data.roles) && (
        <div className="border-b pb-6">
          <h3 className="text-base font-semibold mb-3">Professional Roles</h3>
          {(data.roles ?? []).map((role, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={role}
                onChange={(e) => {
                  const newRoles = [...(data.roles || [])];
                  newRoles[index] = e.target.value;
                  onFieldChange(['roles'], newRoles);
                }}
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={() => {
                  const newRoles = [...(data.roles || [])];
                  newRoles.splice(index, 1);
                  onFieldChange(['roles'], newRoles);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Skills */}
      {hasContent(data.skills) && (
        <div className="border-b pb-6">
          <h3 className="text-base font-semibold mb-3">Skills</h3>
          <div className="space-y-2">
            {(data.skills ?? []).map((skill, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => {
                    const newSkills = [...(data.skills || [])];
                    newSkills[index] = e.target.value;
                    onFieldChange(['skills'], newSkills);
                  }}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  onClick={() => {
                    const newSkills = [...(data.skills || [])];
                    newSkills.splice(index, 1);
                    onFieldChange(['skills'], newSkills);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Experience */}
      {hasContent(data.experience) && (
        <div className="border-b pb-6">
          <h3 className="text-base font-semibold mb-3">Work Experience</h3>
          <div className="space-y-4">
            {(data.experience ?? []).map((exp, index) => (
              <div key={index} className="border rounded p-4 space-y-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Experience #{index + 1}</h4>
                  <button
                    onClick={() => onArrayItemRemove(['experience'], index)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => onArrayItemChange(['experience'], index, 'role', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => onArrayItemChange(['experience'], index, 'company', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Years</label>
                  <input
                    type="text"
                    value={exp.years}
                    onChange={(e) => onArrayItemChange(['experience'], index, 'years', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bullets</label>
                  {exp.bullets.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className="flex gap-2 mb-2">
                      <textarea
                        value={bullet}
                        onChange={(e) => {
                          const newBullets = [...exp.bullets];
                          newBullets[bulletIndex] = e.target.value;
                          onArrayItemChange(['experience'], index, 'bullets', newBullets);
                        }}
                        className="flex-1 p-2 border rounded"
                        rows={2}
                      />
                      <button
                        onClick={() => {
                          const newBullets = [...exp.bullets];
                          newBullets.splice(bulletIndex, 1);
                          onArrayItemChange(['experience'], index, 'bullets', newBullets);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Education */}
      {hasContent(data.education) && (
        <div className="border-b pb-6">
          <h3 className="text-base font-semibold mb-3">Education</h3>
          <div className="space-y-4">
            {(data.education ?? []).map((edu, index) => (
              <div key={index} className="border rounded p-4 space-y-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Education #{index + 1}</h4>
                  <button onClick={() => onArrayItemRemove(['education'], index)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                </div>
                <div><label className="block text-sm font-medium mb-1">Degree</label><input type="text" value={edu.degree} onChange={(e) => onArrayItemChange(['education'], index, 'degree', e.target.value)} className="w-full p-2 border rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">Institution</label><input type="text" value={edu.institution} onChange={(e) => onArrayItemChange(['education'], index, 'institution', e.target.value)} className="w-full p-2 border rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">Years</label><input type="text" value={edu.years} onChange={(e) => onArrayItemChange(['education'], index, 'years', e.target.value)} className="w-full p-2 border rounded" /></div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Projects */}
      {hasContent(data.projects) && (
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-3">Projects</h3>
          <div className="space-y-4">
            {(data.projects ?? []).map((proj, index) => (
              <div key={index} className="border rounded p-4 space-y-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Project #{index + 1}</h4>
                  <button onClick={() => onArrayItemRemove(['projects'], index)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                </div>
                <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={proj.title} onChange={(e) => onArrayItemChange(['projects'], index, 'title', e.target.value)} className="w-full p-2 border rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={proj.description} onChange={(e) => onArrayItemChange(['projects'], index, 'description', e.target.value)} className="w-full p-2 border rounded" rows={3} /></div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Accomplishments */}
      {hasContent(data.accomplishments) && (
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-3">Key Accomplishments</h3>
          {(data.accomplishments ?? []).map((acc, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input type="text" value={acc} onChange={(e) => { const newAccs = [...(data.accomplishments || [])]; newAccs[index] = e.target.value; onFieldChange(['accomplishments'], newAccs); }} className="flex-1 p-2 border rounded" />
              <button onClick={() => { const newAccs = [...(data.accomplishments || [])]; newAccs.splice(index, 1); onFieldChange(['accomplishments'], newAccs); }} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
      
      {/* Awards */}
      {hasContent(data.awards) && (
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-3">Awards</h3>
          <div className="space-y-4">
            {(data.awards ?? []).map((award, index) => (
              <div key={index} className="border rounded p-4 space-y-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Award #{index + 1}</h4>
                  <button onClick={() => onArrayItemRemove(['awards'], index)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                </div>
                <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={award.title} onChange={(e) => onArrayItemChange(['awards'], index, 'title', e.target.value)} className="w-full p-2 border rounded" /></div>
                {hasContent(award.issuer) && <div><label className="block text-sm font-medium mb-1">Issuer</label><input type="text" value={award.issuer} onChange={(e) => onArrayItemChange(['awards'], index, 'issuer', e.target.value)} className="w-full p-2 border rounded" /></div>}
                {hasContent(award.year) && <div><label className="block text-sm font-medium mb-1">Year</label><input type="text" value={award.year} onChange={(e) => onArrayItemChange(['awards'], index, 'year', e.target.value)} className="w-full p-2 border rounded" /></div>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Certifications */}
      {hasContent(data.certifications) && (
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-3">Certifications</h3>
          <div className="space-y-4">
            {(data.certifications ?? []).map((cert, index) => (
              <div key={index} className="border rounded p-4 space-y-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Certification #{index + 1}</h4>
                  <button onClick={() => onArrayItemRemove(['certifications'], index)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                </div>
                <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" value={cert.name} onChange={(e) => onArrayItemChange(['certifications'], index, 'name', e.target.value)} className="w-full p-2 border rounded" /></div>
                {hasContent(cert.issuer) && <div><label className="block text-sm font-medium mb-1">Issuer</label><input type="text" value={cert.issuer} onChange={(e) => onArrayItemChange(['certifications'], index, 'issuer', e.target.value)} className="w-full p-2 border rounded" /></div>}
                {hasContent(cert.year) && <div><label className="block text-sm font-medium mb-1">Year</label><input type="text" value={cert.year} onChange={(e) => onArrayItemChange(['certifications'], index, 'year', e.target.value)} className="w-full p-2 border rounded" /></div>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Languages */}
      {hasContent(data.languages) && (
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-3">Languages</h3>
          <div className="space-y-2">
            {(data.languages ?? []).map((lang, index) => (
              <div key={index} className="flex gap-2">
                <input type="text" value={lang} onChange={(e) => { const newLangs = [...(data.languages || [])]; newLangs[index] = e.target.value; onFieldChange(['languages'], newLangs); }} className="flex-1 p-2 border rounded" />
                <button onClick={() => { const newLangs = [...(data.languages || [])]; newLangs.splice(index, 1); onFieldChange(['languages'], newLangs); }} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Interests */}
      {hasContent(data.interests) && (
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-3">Interests</h3>
          <div className="space-y-2">
            {(data.interests ?? []).map((interest, index) => (
              <div key={index} className="flex gap-2">
                <input type="text" value={interest} onChange={(e) => { const newInterests = [...(data.interests || [])]; newInterests[index] = e.target.value; onFieldChange(['interests'], newInterests); }} className="flex-1 p-2 border rounded" />
                <button onClick={() => { const newInterests = [...(data.interests || [])]; newInterests.splice(index, 1); onFieldChange(['interests'], newInterests); }} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Publications */}
      {hasContent(data.publications) && (
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-3">Publications</h3>
          <div className="space-y-4">
            {(data.publications ?? []).map((pub, index) => (
              <div key={index} className="border rounded p-4 space-y-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Publication #{index + 1}</h4>
                  <button onClick={() => onArrayItemRemove(['publications'], index)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                </div>
                <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={pub.title} onChange={(e) => onArrayItemChange(['publications'], index, 'title', e.target.value)} className="w-full p-2 border rounded" /></div>
                {hasContent(pub.journal) && <div><label className="block text-sm font-medium mb-1">Journal</label><input type="text" value={pub.journal} onChange={(e) => onArrayItemChange(['publications'], index, 'journal', e.target.value)} className="w-full p-2 border rounded" /></div>}
                {hasContent(pub.year) && <div><label className="block text-sm font-medium mb-1">Year</label><input type="text" value={pub.year} onChange={(e) => onArrayItemChange(['publications'], index, 'year', e.target.value)} className="w-full p-2 border rounded" /></div>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Volunteer Work */}
      {hasContent(data.volunteerWork) && (
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-3">Volunteer Work</h3>
          <div className="space-y-4">
            {(data.volunteerWork ?? []).map((vol, index) => (
              <div key={index} className="border rounded p-4 space-y-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Volunteer Work #{index + 1}</h4>
                  <button onClick={() => onArrayItemRemove(['volunteerWork'], index)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                </div>
                {hasContent(vol.organization) && <div><label className="block text-sm font-medium mb-1">Organization</label><input type="text" value={vol.organization} onChange={(e) => onArrayItemChange(['volunteerWork'], index, 'organization', e.target.value)} className="w-full p-2 border rounded" /></div>}
                {hasContent(vol.role) && <div><label className="block text-sm font-medium mb-1">Role</label><input type="text" value={vol.role} onChange={(e) => onArrayItemChange(['volunteerWork'], index, 'role', e.target.value)} className="w-full p-2 border rounded" /></div>}
                {hasContent(vol.duration) && <div><label className="block text-sm font-medium mb-1">Duration</label><input type="text" value={vol.duration} onChange={(e) => onArrayItemChange(['volunteerWork'], index, 'duration', e.target.value)} className="w-full p-2 border rounded" /></div>}
                {hasContent(vol.description) && <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={vol.description} onChange={(e) => onArrayItemChange(['volunteerWork'], index, 'description', e.target.value)} className="w-full p-2 border rounded" rows={3} /></div>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Additional Sections */}
      {hasContent(data.additionalSections) && (
        <div className="pb-6">
          <h3 className="text-lg font-semibold mb-3">Additional Sections</h3>
          <div className="space-y-4">
            {(data.additionalSections ?? []).map((section, index) => (
              <div key={index} className="border rounded p-4 space-y-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Section #{index + 1}</h4>
                  <button onClick={() => onArrayItemRemove(['additionalSections'], index)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                </div>
                <div><label className="block text-sm font-medium mb-1">Section Name</label><input type="text" value={section.sectionName} onChange={(e) => onArrayItemChange(['additionalSections'], index, 'sectionName', e.target.value)} className="w-full p-2 border rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">Content</label><textarea value={section.content} onChange={(e) => onArrayItemChange(['additionalSections'], index, 'content', e.target.value)} className="w-full p-2 border rounded" rows={4} /></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to check if personal info section has content
function hasPersonalInfoContent(personalInfo: any): boolean {
  if (!personalInfo) return false;
  return hasContent(personalInfo.name) || 
         hasContent(personalInfo.email) || 
         hasContent(personalInfo.phone) || 
         hasContent(personalInfo.address) || 
         hasContent(personalInfo.location);
}

// Helper function to check if recipient info section has content
function hasRecipientInfoContent(recipientInfo: any): boolean {
  if (!recipientInfo) return false;
  return hasContent(recipientInfo.name) || 
         hasContent(recipientInfo.title) || 
         hasContent(recipientInfo.company) || 
         hasContent(recipientInfo.address);
}

// Helper function to check if meta section has content
function hasMetaContent(meta: any): boolean {
  if (!meta) return false;
  return hasContent(meta.jobTitle) || hasContent(meta.company) || hasContent(meta.date);
}

// Cover Letter Edit Form - shows only fields that have content
function CoverLetterEditForm({ 
  data, 
  onFieldChange, 
  onArrayItemChange, 
  onArrayItemRemove 
}: { 
  data: StructuredCoverLetter;
  onFieldChange: (path: string[], value: any) => void;
  onArrayItemChange: (path: string[], index: number, field: string, value: any) => void;
  onArrayItemRemove: (path: string[], index: number) => void;
}) {
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Edit Cover Letter</h2>
      
      {/* Personal Info */}
      {hasPersonalInfoContent(data.personalInfo) && (
        <div className="border-b pb-6 space-y-4">
          <h3 className="text-base font-semibold">Personal Information</h3>
          {hasContent(data.personalInfo?.name) && (
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" value={data.personalInfo?.name ?? ''} onChange={(e) => onFieldChange(['personalInfo', 'name'], e.target.value)} className="w-full p-2 border rounded" />
            </div>
          )}
          {hasContent(data.personalInfo?.email) && (
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={data.personalInfo?.email ?? ''} onChange={(e) => onFieldChange(['personalInfo', 'email'], e.target.value)} className="w-full p-2 border rounded" />
            </div>
          )}
          {hasContent(data.personalInfo?.phone) && (
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="tel" value={data.personalInfo?.phone ?? ''} onChange={(e) => onFieldChange(['personalInfo', 'phone'], e.target.value)} className="w-full p-2 border rounded" />
            </div>
          )}
          {hasContent(data.personalInfo?.address) && (
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input type="text" value={data.personalInfo?.address ?? ''} onChange={(e) => onFieldChange(['personalInfo', 'address'], e.target.value)} className="w-full p-2 border rounded" />
            </div>
          )}
          {hasContent(data.personalInfo?.location) && (
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input type="text" value={data.personalInfo?.location ?? ''} onChange={(e) => onFieldChange(['personalInfo', 'location'], e.target.value)} className="w-full p-2 border rounded" />
            </div>
          )}
        </div>
      )}
      
      {/* Recipient Info */}
      {hasRecipientInfoContent(data.recipientInfo) && (
        <div className="border-b pb-6 space-y-4">
          <h3 className="text-base font-semibold">Recipient Information</h3>
          {hasContent(data.recipientInfo?.name) && (
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" value={data.recipientInfo?.name ?? ''} onChange={(e) => onFieldChange(['recipientInfo', 'name'], e.target.value)} className="w-full p-2 border rounded" />
            </div>
          )}
          {hasContent(data.recipientInfo?.title) && (
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" value={data.recipientInfo?.title ?? ''} onChange={(e) => onFieldChange(['recipientInfo', 'title'], e.target.value)} className="w-full p-2 border rounded" />
            </div>
          )}
          {hasContent(data.recipientInfo?.company) && (
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <input type="text" value={data.recipientInfo?.company ?? ''} onChange={(e) => onFieldChange(['recipientInfo', 'company'], e.target.value)} className="w-full p-2 border rounded" />
            </div>
          )}
          {hasContent(data.recipientInfo?.address) && (
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input type="text" value={data.recipientInfo?.address ?? ''} onChange={(e) => onFieldChange(['recipientInfo', 'address'], e.target.value)} className="w-full p-2 border rounded" />
            </div>
          )}
        </div>
      )}
      
      {/* Subject */}
      {hasContent(data.subject) && (
        <div className="border-b pb-6">
          <h3 className="text-base font-semibold mb-3">Subject</h3>
          <input type="text" value={data.subject} onChange={(e) => onFieldChange(['subject'], e.target.value)} className="w-full p-2 border rounded" />
        </div>
      )}
      
      {/* Opening */}
      {hasContent(data.opening) && (
        <div className="border-b pb-6">
          <h3 className="text-base font-semibold mb-3">Opening</h3>
          <textarea value={data.opening} onChange={(e) => onFieldChange(['opening'], e.target.value)} className="w-full p-2 border rounded" rows={4} />
        </div>
      )}
      
      {/* Body 1 */}
      {hasContent(data.body1) && (
        <div className="border-b pb-6">
          <h3 className="text-base font-semibold mb-3">Body Paragraph 1</h3>
          <textarea value={data.body1} onChange={(e) => onFieldChange(['body1'], e.target.value)} className="w-full p-2 border rounded" rows={6} />
        </div>
      )}
      
      {/* Body 2 */}
      {hasContent(data.body2) && (
        <div className="border-b pb-6">
          <h3 className="text-base font-semibold mb-3">Body Paragraph 2</h3>
          <textarea value={data.body2} onChange={(e) => onFieldChange(['body2'], e.target.value)} className="w-full p-2 border rounded" rows={6} />
        </div>
      )}
      
      {/* Body 3 */}
      {hasContent(data.body3) && (
        <div className="border-b pb-6">
          <h3 className="text-base font-semibold mb-3">Body Paragraph 3</h3>
          <textarea value={data.body3} onChange={(e) => onFieldChange(['body3'], e.target.value)} className="w-full p-2 border rounded" rows={6} />
        </div>
      )}
      
      {/* Highlights */}
      {hasContent(data.highlights) && (
        <div className="border-b pb-6">
          <h3 className="text-base font-semibold mb-3">Highlights</h3>
          <div className="space-y-2">
            {(data.highlights ?? []).map((highlight, index) => (
              <div key={index} className="flex gap-2">
                <input type="text" value={highlight} onChange={(e) => { const newHighlights = [...(data.highlights || [])]; newHighlights[index] = e.target.value; onFieldChange(['highlights'], newHighlights); }} className="flex-1 p-2 border rounded" />
                <button onClick={() => { const newHighlights = [...(data.highlights || [])]; newHighlights.splice(index, 1); onFieldChange(['highlights'], newHighlights); }} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Closing */}
      {hasContent(data.closing) && (
        <div className="border-b pb-6">
          <h3 className="text-base font-semibold mb-3">Closing</h3>
          <textarea value={data.closing} onChange={(e) => onFieldChange(['closing'], e.target.value)} className="w-full p-2 border rounded" rows={4} />
        </div>
      )}
      
      {/* Signoff */}
      {hasContent(data.signoff) && (
        <div className="border-b pb-6">
          <h3 className="text-base font-semibold mb-3">Signoff</h3>
          <input type="text" value={data.signoff} onChange={(e) => onFieldChange(['signoff'], e.target.value)} className="w-full p-2 border rounded" />
        </div>
      )}
      
      {/* Meta */}
      {hasMetaContent(data.meta) && (
        <div className="pb-6">
          <h3 className="text-base font-semibold mb-3">Metadata</h3>
          {hasContent(data.meta?.jobTitle) && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Job Title</label>
              <input type="text" value={data.meta?.jobTitle ?? ''} onChange={(e) => onFieldChange(['meta', 'jobTitle'], e.target.value)} className="w-full p-2 border rounded" />
            </div>
          )}
          {hasContent(data.meta?.company) && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Company</label>
              <input type="text" value={data.meta?.company ?? ''} onChange={(e) => onFieldChange(['meta', 'company'], e.target.value)} className="w-full p-2 border rounded" />
            </div>
          )}
          {hasContent(data.meta?.date) && (
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="text" value={data.meta?.date ?? ''} onChange={(e) => onFieldChange(['meta', 'date'], e.target.value)} className="w-full p-2 border rounded" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
