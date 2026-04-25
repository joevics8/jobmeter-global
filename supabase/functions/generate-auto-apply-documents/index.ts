// Supabase Edge Function: Generate Auto-Apply Documents
// Generates CV (as PDF) and Cover Letter (as HTML email body) for auto-apply feature
// Phase 4: Document Generation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  userId: string;
  jobId: string;
  templateId?: string; // CV template ID (default: 'template-1')
}

// Helper to escape HTML
function htmlEscape(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Render CV to HTML (simplified template for auto-apply)
function renderCVHTML(cvData: any): string {
  const personalDetails = cvData.personalDetails || {};
  const name = htmlEscape(personalDetails.name || '');
  const title = htmlEscape(personalDetails.title || '');
  const email = htmlEscape(personalDetails.email || '');
  const phone = htmlEscape(personalDetails.phone || '');
  const location = htmlEscape(personalDetails.location || '');
  const linkedin = personalDetails.linkedin ? htmlEscape(personalDetails.linkedin) : '';
  const github = personalDetails.github ? htmlEscape(personalDetails.github) : '';
  const portfolio = personalDetails.portfolio ? htmlEscape(personalDetails.portfolio) : '';

  const css = `
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { 
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
    }
    .page { 
      width: 210mm;
      min-height: 297mm;
      max-height: 297mm;
      margin: 0 auto;
      background: #ffffff;
      padding: 10mm 8mm;
      overflow: hidden;
    }
    .header { text-align: center; margin-bottom: 8mm; padding-bottom: 4mm; border-bottom: 2px solid #333; }
    .name { font-size: 24pt; font-weight: bold; color: #1a1a1a; margin-bottom: 2mm; }
    .title { font-size: 12pt; color: #666; margin-bottom: 3mm; }
    .contact { font-size: 10pt; color: #444; }
    .contact span { margin: 0 4mm; }
    .section { margin-bottom: 6mm; page-break-inside: avoid; }
    .section-title { font-size: 14pt; font-weight: bold; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 2mm; margin-bottom: 3mm; text-transform: uppercase; }
    .summary { font-size: 10pt; line-height: 1.5; text-align: justify; }
    .experience-item, .education-item { margin-bottom: 4mm; }
    .item-header { font-weight: bold; font-size: 11pt; color: #333; margin-bottom: 1mm; }
    .item-subheader { font-size: 10pt; color: #666; margin-bottom: 2mm; font-style: italic; }
    ul { margin-left: 5mm; margin-top: 2mm; }
    li { font-size: 10pt; line-height: 1.4; margin-bottom: 1mm; }
    .skills { display: flex; flex-wrap: wrap; gap: 2mm; }
    .skill { background: #f5f5f5; padding: 1mm 3mm; border-radius: 2mm; font-size: 9pt; }
  `;

  const contactInfo = [email, phone, location, linkedin, github, portfolio].filter(Boolean).map(htmlEscape);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>${css}</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="name">${name}</div>
      ${title ? `<div class="title">${title}</div>` : ''}
      <div class="contact">${contactInfo.join(' <span>•</span> ')}</div>
    </div>
    
    ${cvData.summary ? `
    <div class="section">
      <div class="section-title">Professional Summary</div>
      <div class="summary">${htmlEscape(cvData.summary)}</div>
    </div>
    ` : ''}
    
    ${cvData.roles && cvData.roles.length > 0 ? `
    <div class="section">
      <div class="section-title">Professional Roles</div>
      <div style="font-size: 10pt; line-height: 1.6;">
        ${cvData.roles.map((role: string) => `<div style="margin-bottom: 2mm;">• ${htmlEscape(role)}</div>`).join('')}
      </div>
    </div>
    ` : ''}
    
    ${cvData.experience && cvData.experience.length > 0 ? `
    <div class="section">
      <div class="section-title">Work Experience</div>
      ${cvData.experience.map((exp: any) => `
        <div class="experience-item">
          <div class="item-header">${htmlEscape(exp.role || '')}</div>
          <div class="item-subheader">${htmlEscape(exp.company || '')} | ${htmlEscape(exp.years || '')}</div>
          ${exp.bullets && exp.bullets.length > 0 ? `
            <ul>
              ${exp.bullets.map((bullet: string) => `<li>${htmlEscape(bullet)}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${cvData.education && cvData.education.length > 0 ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${cvData.education.map((edu: any) => `
        <div class="education-item">
          <div class="item-header">${htmlEscape(edu.degree || '')}</div>
          <div class="item-subheader">${htmlEscape(edu.institution || '')} | ${htmlEscape(edu.years || '')}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${cvData.skills && cvData.skills.length > 0 ? `
    <div class="section">
      <div class="section-title">Skills</div>
      <div class="skills">
        ${cvData.skills.map((skill: string) => `<span class="skill">${htmlEscape(skill)}</span>`).join('')}
      </div>
    </div>
    ` : ''}
    
    ${cvData.projects && cvData.projects.length > 0 ? `
    <div class="section">
      <div class="section-title">Projects</div>
      ${cvData.projects.map((proj: any) => `
        <div class="experience-item">
          <div class="item-header">${htmlEscape(proj.title || '')}</div>
          <div style="font-size: 10pt; line-height: 1.4;">${htmlEscape(proj.description || '')}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${cvData.certifications && cvData.certifications.length > 0 ? `
    <div class="section">
      <div class="section-title">Certifications</div>
      <div style="font-size: 10pt; line-height: 1.6;">
        ${cvData.certifications.map((cert: string) => `<div style="margin-bottom: 1mm;">• ${htmlEscape(cert)}</div>`).join('')}
      </div>
    </div>
    ` : ''}
    
    ${cvData.languages && cvData.languages.length > 0 ? `
    <div class="section">
      <div class="section-title">Languages</div>
      <div style="font-size: 10pt;">${cvData.languages.map((lang: string) => htmlEscape(lang)).join(', ')}</div>
    </div>
    ` : ''}
  </div>
</body>
</html>`;
}

// Render Cover Letter as HTML Email Body
function renderCoverLetterEmailHTML(coverLetterData: any): string {
  const personalInfo = coverLetterData.personalInfo || {};
  const recipientInfo = coverLetterData.recipientInfo || {};
  const name = htmlEscape(personalInfo.name || '');
  const email = htmlEscape(personalInfo.email || '');
  const phone = htmlEscape(personalInfo.phone || '');
  const company = htmlEscape(recipientInfo.company || '');
  const recipientName = htmlEscape(recipientInfo.name || 'Hiring Manager');
  const subject = htmlEscape(coverLetterData.subject || 'Application for Position');
  const greeting = coverLetterData.subject ? 'Hi' : 'Dear';
  const signoff = htmlEscape(coverLetterData.signoff || 'Best regards');

  const css = `
    body { 
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }
    .header { margin-bottom: 20px; }
    .name { font-size: 18px; font-weight: bold; color: #1a1a1a; margin-bottom: 5px; }
    .contact { font-size: 12px; color: #666; }
    .subject { font-size: 16px; font-weight: bold; margin: 20px 0; color: #1a1a1a; }
    .greeting { margin-bottom: 15px; }
    .paragraph { margin-bottom: 15px; text-align: justify; }
    .highlights { margin: 15px 0; padding-left: 20px; }
    .highlights li { margin-bottom: 8px; }
    .closing { margin-top: 20px; }
    .signature { margin-top: 10px; font-weight: bold; }
  `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>${css}</style>
</head>
<body>
  <div class="header">
    <div class="name">${name}</div>
    <div class="contact">${[email, phone].filter(Boolean).map(htmlEscape).join(' • ')}</div>
  </div>
  
  ${subject ? `<div class="subject">Subject: ${subject}</div>` : ''}
  
  <div class="greeting">${greeting} ${recipientName},</div>
  
  ${coverLetterData.opening ? `<div class="paragraph">${htmlEscape(coverLetterData.opening)}</div>` : ''}
  ${coverLetterData.body1 ? `<div class="paragraph">${htmlEscape(coverLetterData.body1)}</div>` : ''}
  ${coverLetterData.body2 ? `<div class="paragraph">${htmlEscape(coverLetterData.body2)}</div>` : ''}
  ${coverLetterData.body3 ? `<div class="paragraph">${htmlEscape(coverLetterData.body3)}</div>` : ''}
  
  ${coverLetterData.highlights && coverLetterData.highlights.length > 0 ? `
    <ul class="highlights">
      ${coverLetterData.highlights.map((h: string) => `<li>${htmlEscape(h)}</li>`).join('')}
    </ul>
  ` : ''}
  
  ${coverLetterData.closing ? `<div class="paragraph">${htmlEscape(coverLetterData.closing)}</div>` : ''}
  
  <div class="closing">
    ${signoff},<br/>
    <div class="signature">${name}</div>
  </div>
</body>
</html>`;
}

// Convert HTML to PDF using external service
// Supports multiple PDF generation services:
// 1. PDFShift (https://pdfshift.io) - Recommended: Simple, reliable, free tier available
// 2. HTML2PDF API (https://html2pdf.app) - Alternative
// 3. Custom service via PDF_SERVICE_URL env var
async function convertHTMLToPDF(html: string): Promise<Uint8Array> {
  // Try PDFShift first (if configured) - Recommended
  const pdfshiftApiKey = Deno.env.get('PDFSHIFT_API_KEY');
  if (pdfshiftApiKey) {
    try {
      const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`api:${pdfshiftApiKey}`)}`,
        },
        body: JSON.stringify({
          source: html,
          format: 'A4',
          margin: '0mm',
          print_background: true,
          wait_for: 'networkidle0',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PDFShift error: ${response.status} - ${errorText}`);
      }

      const pdfBuffer = await response.arrayBuffer();
      return new Uint8Array(pdfBuffer);
    } catch (error) {
      console.error('PDFShift error:', error);
      // Fall through to next option
    }
  }

  // Try HTML2PDF API (if configured)
  const html2pdfApiKey = Deno.env.get('HTML2PDF_API_KEY');
  if (html2pdfApiKey) {
    try {
      const response = await fetch('https://api.html2pdf.app/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${html2pdfApiKey}`,
        },
        body: JSON.stringify({
          html: html,
          format: 'A4',
          margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
          printBackground: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTML2PDF error: ${response.status}`);
      }

      const pdfBuffer = await response.arrayBuffer();
      return new Uint8Array(pdfBuffer);
    } catch (error) {
      console.error('HTML2PDF error:', error);
      // Fall through to error
    }
  }

  // Try custom service (if configured)
  const pdfServiceUrl = Deno.env.get('PDF_SERVICE_URL');
  const pdfServiceKey = Deno.env.get('PDF_SERVICE_API_KEY');
  if (pdfServiceUrl) {
    try {
      const response = await fetch(pdfServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(pdfServiceKey ? { 'Authorization': `Bearer ${pdfServiceKey}` } : {}),
        },
        body: JSON.stringify({
          html: html,
          format: 'A4',
          margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
          printBackground: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Custom PDF service error: ${response.status}`);
      }

      const pdfBuffer = await response.arrayBuffer();
      return new Uint8Array(pdfBuffer);
    } catch (error) {
      console.error('Custom PDF service error:', error);
      // Fall through to error
    }
  }

  // If no service is configured, throw error with instructions
  throw new Error(
    'PDF generation service not configured. Please set one of:\n' +
    '- PDFSHIFT_API_KEY (recommended: https://pdfshift.io - free tier available)\n' +
    '- HTML2PDF_API_KEY (alternative: https://html2pdf.app)\n' +
    '- PDF_SERVICE_URL + PDF_SERVICE_API_KEY (custom service)\n' +
    'Or implement a custom PDF generation service.'
  );
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate request body
    let requestBody: RequestBody;
    try {
      requestBody = await req.json();
    } catch (error: any) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, jobId, templateId = 'template-1' } = requestBody;

    // Validate required fields
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!jobId || typeof jobId !== 'string' || jobId.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid jobId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📄 Generating documents for user ${userId}, job ${jobId}`);

    // Step 1: Generate CV structured data
    console.log('📝 Step 1: Generating CV structured data...');
    const { data: cvResult, error: cvError } = await supabase.functions.invoke('generate-document', {
      body: {
        type: 'cv',
        userId,
        jobId,
        templateId,
      },
    });

    if (cvError || !cvResult?.success || !cvResult?.data) {
      console.error('Error generating CV:', cvError || cvResult?.error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate CV', details: cvError || cvResult?.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cvData = cvResult.data;
    console.log('✅ CV structured data generated');

    // Step 2: Generate Cover Letter structured data (email format)
    console.log('📝 Step 2: Generating Cover Letter structured data...');
    const { data: clResult, error: clError } = await supabase.functions.invoke('generate-document', {
      body: {
        type: 'cover-letter',
        userId,
        jobId,
        cvPastedText: JSON.stringify(cvData), // Pass CV data for reference
        coverLetterFormat: 'email',
      },
    });

    if (clError || !clResult?.success || !clResult?.data) {
      console.error('Error generating cover letter:', clError || clResult?.error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate cover letter', details: clError || clResult?.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const coverLetterData = clResult.data;
    console.log('✅ Cover Letter structured data generated');

    // Step 3: Render CV to HTML
    console.log('🎨 Step 3: Rendering CV to HTML...');
    const cvHTML = renderCVHTML(cvData);
    console.log('✅ CV HTML rendered');

    // Step 4: Convert CV HTML to PDF
    console.log('📄 Step 4: Converting CV HTML to PDF...');
    const cvPDF = await convertHTMLToPDF(cvHTML);
    const cvPDFBase64 = btoa(String.fromCharCode(...cvPDF));
    console.log('✅ CV PDF generated');

    // Step 5: Render Cover Letter as HTML email body
    console.log('📧 Step 5: Rendering Cover Letter as HTML email body...');
    const coverLetterHTML = renderCoverLetterEmailHTML(coverLetterData);
    console.log('✅ Cover Letter HTML email body rendered');

    // Step 6: Return results
    return new Response(
      JSON.stringify({
        success: true,
        cv: {
          pdfBase64: cvPDFBase64,
          pdfSize: cvPDF.length,
        },
        coverLetter: {
          html: coverLetterHTML,
          subject: coverLetterData.subject || 'Application for Position',
        },
        generatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-auto-apply-documents:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.stack,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

