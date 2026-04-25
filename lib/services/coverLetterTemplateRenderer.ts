// Cover Letter Template Renderer - Renders structured CoverLetterData to HTML
// All templates enforce strict 1-page A4 format

import { StructuredCoverLetter } from '@/lib/types/coverLetter';

// Base CSS for A4 page (strict 1 page) - optimized for PDF conversion
const baseCss = `
  @page { 
    size: A4;
    margin: 0;
  }
  @media print {
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body {
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    body { margin: 0; padding: 0; }
    .page { 
      width: 210mm;
      min-height: 297mm;
      max-height: 297mm;
      page-break-after: avoid;
      page-break-inside: avoid;
    }
  }
  html, body {
    width: 100%;
    margin: 0;
    padding: 0;
    background: #ffffff;
  }
  .page { 
    width: 100%;
    max-width: 210mm;
    margin: 0 auto;
    background: #ffffff;
    position: relative;
  }
`;

function htmlEscape(text?: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Template 1: Classic (centered header)
function renderTemplate1(data: StructuredCoverLetter): string {
  const name = data.personalInfo?.name || '';
  const email = data.personalInfo?.email || '';
  const phone = data.personalInfo?.phone || '';
  const location = data.personalInfo?.location || data.personalInfo?.address || '';
  const date = data.meta?.date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const recipientLines = [
    [data.recipientInfo?.name, data.recipientInfo?.title].filter(Boolean).join(', '),
    data.recipientInfo?.company || '',
    data.recipientInfo?.address || ''
  ].filter(Boolean).join('<br>');

  const css = `
    ${baseCss}
    .body { font-family: Georgia, 'Times New Roman', serif; width: 210mm; height: 297mm; margin: 0 auto; padding: 50px; color: #333; }
    .header { text-align: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #ccc; }
    .name { font-size: 26px; font-weight: 600; color: #5a7a8c; letter-spacing: 1px; margin-bottom: 6px; }
    .contact-line { font-size: 12px; }
    .contact-line span { margin: 0 8px; }
    .date { font-size: 12px; margin-top: 25px; margin-bottom: 20px; }
    .recipient { font-size: 12px; line-height: 1.6; margin-bottom: 20px; }
    .paragraph { font-size: 12px; line-height: 1.8; text-align: justify; margin-bottom: 15px; }
    .closing { margin-top: 25px; font-size: 12px; }
    .signature { margin-top: 8px; font-weight: 600; font-size: 15px; }
  `;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${css}</style></head><body>
  <div class="body">
    <div class="header">
      <div class="name">${htmlEscape(name)}</div>
      <div class="contact-line">${[phone, location, email].filter(Boolean).map(htmlEscape).join(' <span>•</span> ')}</div>
    </div>
    <div class="date">${htmlEscape(date)}</div>
    ${recipientLines ? `<div class="recipient">${recipientLines}</div>` : ''}
    ${data.opening ? `<div class="paragraph">${htmlEscape(data.opening)}</div>` : ''}
    ${data.body1 ? `<div class="paragraph">${htmlEscape(data.body1)}</div>` : ''}
    ${data.body2 ? `<div class="paragraph">${htmlEscape(data.body2)}</div>` : ''}
    ${data.body3 ? `<div class="paragraph">${htmlEscape(data.body3)}</div>` : ''}
    ${data.highlights && data.highlights.length > 0 ? `<div style="margin: 15px 0; padding-left: 20px;"><ul style="margin: 0; padding-left: 20px;">${data.highlights.map(h => `<li style="margin-bottom: 8px; line-height: 1.6; font-size: 12px;">${htmlEscape(h)}</li>`).join('')}</ul></div>` : ''}
    ${data.closing ? `<div class="paragraph">${htmlEscape(data.closing)}</div>` : ''}
    <div class="closing">${htmlEscape(data.signoff || 'Sincerely,')}<div class="signature">${htmlEscape(name)}</div></div>
  </div>
  </body></html>`;
}

// Template 2: Teal Accent
function renderTemplate2(data: StructuredCoverLetter): string {
  const name = data.personalInfo?.name || '';
  const email = data.personalInfo?.email || '';
  const phone = data.personalInfo?.phone || '';
  const location = data.personalInfo?.location || data.personalInfo?.address || '';
  const date = data.meta?.date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const recipientLines = [
    [data.recipientInfo?.name, data.recipientInfo?.title].filter(Boolean).join(', '),
    data.recipientInfo?.company || '',
    data.recipientInfo?.address || ''
  ].filter(Boolean).join('<br>');

  const css = `
    ${baseCss}
    .content { height: 207mm; max-height: 207mm; overflow: hidden; padding: 50px; font-family: Arial, Helvetica, sans-serif; color: #333; }
    .header { display:flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .name { font-size: 30px; font-weight: 700; letter-spacing: 1.5px; color: #1a1a1a; }
    .contact-info { text-align: right; font-size: 12px; line-height: 1.8; color: #333; max-width: 220px; }
    .teal-line { width: 100%; height: 6px; background: #2a9d8f; margin-bottom: 30px; }
    .date, .recipient, .greeting, .paragraph { font-size: 12px; }
    .recipient { line-height: 1.6; margin-bottom: 20px; }
    .paragraph { line-height: 1.8; text-align: justify; margin-bottom: 15px; }
    .closing { margin-top: 25px; font-size: 12px; }
    .signature { margin-top: 8px; font-weight: 700; font-size: 14px; }
  `;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${css}</style></head><body>
  <div class="page"><div class="content">
    <div class="header">
      <div class="name">${htmlEscape(name)}</div>
      <div class="contact-info">${[phone, email, location].filter(Boolean).map(htmlEscape).join('<br>')}</div>
    </div>
    <div class="teal-line"></div>
    <div class="date">${htmlEscape(date)}</div>
    ${recipientLines ? `<div class="recipient">${recipientLines}</div>` : ''}
    <div class="greeting">${htmlEscape('Dear ' + (data.recipientInfo?.name || 'Hiring Manager') + ',')}</div>
    ${data.opening ? `<div class="paragraph">${htmlEscape(data.opening)}</div>` : ''}
    ${data.body1 ? `<div class="paragraph">${htmlEscape(data.body1)}</div>` : ''}
    ${data.body2 ? `<div class="paragraph">${htmlEscape(data.body2)}</div>` : ''}
    ${data.body3 ? `<div class="paragraph">${htmlEscape(data.body3)}</div>` : ''}
    ${data.highlights && data.highlights.length > 0 ? `<div style="margin: 15px 0; padding-left: 20px;"><ul style="margin: 0; padding-left: 20px;">${data.highlights.map(h => `<li style="margin-bottom: 8px; line-height: 1.6; font-size: 12px;">${htmlEscape(h)}</li>`).join('')}</ul></div>` : ''}
    ${data.closing ? `<div class="paragraph">${htmlEscape(data.closing)}</div>` : ''}
    <div class="closing">${htmlEscape(data.signoff || 'Sincerely,')}<div class="signature">${htmlEscape(name)}</div></div>
  </div></div></body></html>`;
}

// Template 3: Blue Header
function renderTemplate3(data: StructuredCoverLetter): string {
  const name = data.personalInfo?.name || '';
  const email = data.personalInfo?.email || '';
  const phone = data.personalInfo?.phone || '';
  const location = data.personalInfo?.location || data.personalInfo?.address || '';
  const date = data.meta?.date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const recipientLines = [
    [data.recipientInfo?.name, data.recipientInfo?.title].filter(Boolean).join(', '),
    data.recipientInfo?.company || '',
    data.recipientInfo?.address || ''
  ].filter(Boolean).join('<br>');

  const css = `
    ${baseCss}
    .content { height: 207mm; max-height: 207mm; overflow: hidden; padding: 50px; font-family: 'Segoe UI', Calibri, Arial, sans-serif; color: #333; }
    .blue-header { background: #1e5ba8; color: #fff; padding: 15px 20px; text-align: center; border-radius: 4px; }
    .name { font-size: 28px; font-weight: 600; letter-spacing: 2px; margin-bottom: 6px; }
    .date { font-size: 12px; margin: 20px 0; color: #666; }
    .recipient { font-size: 12px; line-height: 1.7; margin-bottom: 20px; }
    .paragraph { font-size: 12px; line-height: 1.8; text-align: justify; margin-bottom: 15px; }
    .closing { margin-top: 25px; font-size: 12px; }
    .signature { margin-top: 8px; font-weight: 600; font-size: 14px; }
    .contact { font-size: 12px; margin-top: 6px; opacity: 0.9; }
  `;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${css}</style></head><body>
  <div class="page"><div class="content">
    <div class="blue-header">
      <div class="name">${htmlEscape(name)}</div>
      <div class="contact">${[phone, email, location].filter(Boolean).map(htmlEscape).join(' • ')}</div>
    </div>
    <div class="date">${htmlEscape(date)}</div>
    ${recipientLines ? `<div class="recipient">${recipientLines}</div>` : ''}
    <div class="paragraph"><strong>${htmlEscape('Dear ' + (data.recipientInfo?.name || 'Hiring Manager') + ',')}</strong></div>
    ${data.opening ? `<div class="paragraph">${htmlEscape(data.opening)}</div>` : ''}
    ${data.body1 ? `<div class="paragraph">${htmlEscape(data.body1)}</div>` : ''}
    ${data.body2 ? `<div class="paragraph">${htmlEscape(data.body2)}</div>` : ''}
    ${data.body3 ? `<div class="paragraph">${htmlEscape(data.body3)}</div>` : ''}
    ${data.highlights && data.highlights.length > 0 ? `<div style="margin: 15px 0; padding-left: 20px;"><ul style="margin: 0; padding-left: 20px;">${data.highlights.map(h => `<li style="margin-bottom: 8px; line-height: 1.6; font-size: 12px;">${htmlEscape(h)}</li>`).join('')}</ul></div>` : ''}
    ${data.closing ? `<div class="paragraph">${htmlEscape(data.closing)}</div>` : ''}
    <div class="closing">${htmlEscape(data.signoff || 'Sincerely,')}<div class="signature">${htmlEscape(name)}</div></div>
  </div></div></body></html>`;
}

// Template 4: Blue Accent (left stripe)
function renderTemplate4(data: StructuredCoverLetter): string {
  const name = data.personalInfo?.name || '';
  const email = data.personalInfo?.email || '';
  const phone = data.personalInfo?.phone || '';
  const location = data.personalInfo?.location || data.personalInfo?.address || '';
  const date = data.meta?.date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const recipientLines = [
    [data.recipientInfo?.name, data.recipientInfo?.title].filter(Boolean).join(', '),
    data.recipientInfo?.company || '',
    data.recipientInfo?.address || ''
  ].filter(Boolean).join('<br>');

  const css = `
    ${baseCss}
    .wrap { display:flex; height: 297mm; }
    .blue-accent { width: 20mm; background: linear-gradient(to bottom, #2563eb 0%, #1e40af 100%); flex-shrink: 0; }
    .content-area { flex:1; padding: 30px; font-family: Calibri, 'Segoe UI', Arial, sans-serif; color: #333; }
    .header { margin-bottom: 25px; display:flex; justify-content: space-between; align-items: flex-start; }
    .name { font-size: 26px; font-weight: 700; color: #1e40af; line-height: 1.2; margin-bottom: 5px; }
    .contact { text-align:right; font-size:12px; color:#555; line-height:1.6; }
    .date { font-size: 12px; margin-bottom: 20px; }
    .recipient { font-size: 12px; line-height: 1.6; margin-bottom: 20px; }
    .greeting { margin-bottom: 15px; font-size: 12px; font-weight: 600; color: #1e40af; }
    .paragraph { font-size: 12px; line-height: 1.8; text-align: justify; margin-bottom: 15px; }
    .closing { margin-top: 25px; font-size: 12px; }
    .signature { margin-top: 8px; font-weight: 700; color: #1e40af; font-size: 16px; }
  `;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${css}</style></head><body>
  <div class="page">
    <div class="wrap">
      <div class="blue-accent"></div>
      <div class="content-area">
        <div class="header">
          <div class="name">${htmlEscape(name)}</div>
          <div class="contact">${[location, phone, email].filter(Boolean).map(htmlEscape).join('<br>')}</div>
        </div>
        <div class="date">${htmlEscape(date)}</div>
        ${recipientLines ? `<div class="recipient">${recipientLines}</div>` : ''}
        <div class="greeting">${htmlEscape('Dear ' + (data.recipientInfo?.name || 'Hiring Manager') + ',')}</div>
        ${data.opening ? `<div class="paragraph">${htmlEscape(data.opening)}</div>` : ''}
        ${data.body1 ? `<div class="paragraph">${htmlEscape(data.body1)}</div>` : ''}
        ${data.body2 ? `<div class="paragraph">${htmlEscape(data.body2)}</div>` : ''}
        ${data.closing ? `<div class="paragraph">${htmlEscape(data.closing)}</div>` : ''}
        <div class="closing">${htmlEscape(data.signoff || 'Sincerely,')}<div class="signature">${htmlEscape(name)}</div></div>
      </div>
    </div>
  </div>
  </body></html>`;
}

// Template 5: Minimal Modern
function renderTemplate5(data: StructuredCoverLetter): string {
  const name = data.personalInfo?.name || '';
  const email = data.personalInfo?.email || '';
  const phone = data.personalInfo?.phone || '';
  const location = data.personalInfo?.location || data.personalInfo?.address || '';
  const date = data.meta?.date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const recipientLines = [
    [data.recipientInfo?.name, data.recipientInfo?.title].filter(Boolean).join(', '),
    data.recipientInfo?.company || '',
    data.recipientInfo?.address || ''
  ].filter(Boolean).join('<br>');

  const css = `
    ${baseCss}
    .content { height: 207mm; max-height: 207mm; overflow: hidden; padding: 25mm; font-family: 'Segoe UI', Tahoma, Verdana, sans-serif; color: #333; line-height: 1.7; font-size: 12px; }
    .header { display:flex; justify-content: space-between; align-items: flex-start; padding-bottom:20px; border-bottom: 1px solid #ddd; margin-bottom: 30px; background: linear-gradient(to right, #f8f9fa 0%, #e9ecef 100%); padding: 25px; margin: -25mm -25mm 30px -25mm; }
    .name { font-size: 24px; font-weight: 500; color: #2c3e50; letter-spacing: 0.5px; }
    .contact { text-align:right; font-size:12px; color:#555; line-height:1.8; border-left:1px solid #ccc; padding-left:20px; margin-left:20px; }
    .date { margin-bottom: 25px; font-size: 12px; color: #555; }
    .recipient { margin-bottom: 25px; font-size: 12px; line-height: 1.6; }
    .greeting { margin-bottom: 20px; font-size: 13px; font-weight: 500; }
    .paragraph { font-size: 12px; text-align: justify; margin-bottom: 15px; }
    .closing { margin-top: 25px; font-size: 12px; }
    .signature { margin-top: 5px; font-weight: 600; font-size: 15px; }
  `;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${css}</style></head><body>
  <div class="page"><div class="content">
    <div class="header">
      <div class="name">${htmlEscape(name)}</div>
      <div class="contact">${[location, phone, email].filter(Boolean).map(htmlEscape).join('<br>')}</div>
    </div>
    <div class="date">${htmlEscape(date)}</div>
    ${recipientLines ? `<div class="recipient">${recipientLines}</div>` : ''}
    <div class="greeting">${htmlEscape('Dear ' + (data.recipientInfo?.name || 'Hiring Manager') + ',')}</div>
    ${data.opening ? `<div class="paragraph">${htmlEscape(data.opening)}</div>` : ''}
    ${data.body1 ? `<div class="paragraph">${htmlEscape(data.body1)}</div>` : ''}
    ${data.body2 ? `<div class="paragraph">${htmlEscape(data.body2)}</div>` : ''}
    ${data.body3 ? `<div class="paragraph">${htmlEscape(data.body3)}</div>` : ''}
    ${data.highlights && data.highlights.length > 0 ? `<div style="margin: 15px 0; padding-left: 20px;"><ul style="margin: 0; padding-left: 20px;">${data.highlights.map(h => `<li style="margin-bottom: 8px; line-height: 1.6; font-size: 12px;">${htmlEscape(h)}</li>`).join('')}</ul></div>` : ''}
    ${data.closing ? `<div class="paragraph">${htmlEscape(data.closing)}</div>` : ''}
    <div class="closing">${htmlEscape(data.signoff || 'Sincerely,')}<div class="signature">${htmlEscape(name)}</div></div>
  </div></div></body></html>`;
}

// Responsive templates for view mode - copied exactly from original, just CSS made responsive
function renderResponsiveTemplate1(data: StructuredCoverLetter): string {
  const name = data.personalInfo?.name || '';
  const email = data.personalInfo?.email || '';
  const phone = data.personalInfo?.phone || '';
  const location = data.personalInfo?.location || data.personalInfo?.address || '';
  const date = data.meta?.date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const recipientLines = [
    [data.recipientInfo?.name, data.recipientInfo?.title].filter(Boolean).join(', '),
    data.recipientInfo?.company || '',
    data.recipientInfo?.address || ''
  ].filter(Boolean).join('<br>');

  const css = `
    body { margin: 0; background: #ffffff; }
    .body { font-family: Georgia, 'Times New Roman', serif; width: 100%; max-width: 210mm; margin: 0 auto; padding: 20px; color: #333; box-sizing: border-box; }
    @media (min-width: 768px) { .body { padding: 50px; } }
    .header { text-align: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #ccc; }
    .name { font-size: 26px; font-weight: 600; color: #5a7a8c; letter-spacing: 1px; margin-bottom: 6px; }
    .contact-line { font-size: 12px; }
    .contact-line span { margin: 0 8px; }
    .date { font-size: 12px; margin-top: 25px; margin-bottom: 20px; }
    .recipient { font-size: 12px; line-height: 1.6; margin-bottom: 20px; }
    .paragraph { font-size: 12px; line-height: 1.8; text-align: justify; margin-bottom: 15px; }
    .closing { margin-top: 25px; font-size: 12px; }
    .signature { margin-top: 8px; font-weight: 600; font-size: 15px; }
  `;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${css}</style></head><body>
  <div class="body">
    <div class="header">
      <div class="name">${htmlEscape(name)}</div>
      <div class="contact-line">${[phone, location, email].filter(Boolean).map(htmlEscape).join(' <span>•</span> ')}</div>
    </div>
    <div class="date">${htmlEscape(date)}</div>
    ${recipientLines ? `<div class="recipient">${recipientLines}</div>` : ''}
    ${data.opening ? `<div class="paragraph">${htmlEscape(data.opening)}</div>` : ''}
    ${data.body1 ? `<div class="paragraph">${htmlEscape(data.body1)}</div>` : ''}
    ${data.body2 ? `<div class="paragraph">${htmlEscape(data.body2)}</div>` : ''}
    ${data.closing ? `<div class="paragraph">${htmlEscape(data.closing)}</div>` : ''}
    <div class="closing">${htmlEscape(data.signoff || 'Sincerely,')}<div class="signature">${htmlEscape(name)}</div></div>
  </div>
  </body></html>`;
}

function renderResponsiveTemplate2(data: StructuredCoverLetter): string {
  const name = data.personalInfo?.name || '';
  const email = data.personalInfo?.email || '';
  const phone = data.personalInfo?.phone || '';
  const location = data.personalInfo?.location || data.personalInfo?.address || '';
  const date = data.meta?.date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const recipientLines = [
    [data.recipientInfo?.name, data.recipientInfo?.title].filter(Boolean).join(', '),
    data.recipientInfo?.company || '',
    data.recipientInfo?.address || ''
  ].filter(Boolean).join('<br>');

  const css = `
    body { margin: 0; background: #ffffff; }
    .page { width: 100%; max-width: 210mm; margin: 0 auto; background: #ffffff; }
    .content { padding: 20px; font-family: Arial, Helvetica, sans-serif; color: #333; }
    @media (min-width: 768px) { .content { padding: 50px; } }
    .header { display:flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; flex-wrap: wrap; }
    .name { font-size: 30px; font-weight: 700; letter-spacing: 1.5px; color: #1a1a1a; }
    .contact-info { text-align: right; font-size: 12px; line-height: 1.8; color: #333; max-width: 220px; }
    .teal-line { width: 100%; height: 6px; background: #2a9d8f; margin-bottom: 30px; }
    .date, .recipient, .greeting, .paragraph { font-size: 12px; }
    .recipient { line-height: 1.6; margin-bottom: 20px; }
    .paragraph { line-height: 1.8; text-align: justify; margin-bottom: 15px; }
    .closing { margin-top: 25px; font-size: 12px; }
    .signature { margin-top: 8px; font-weight: 700; font-size: 14px; }
  `;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${css}</style></head><body>
  <div class="page"><div class="content">
    <div class="header">
      <div class="name">${htmlEscape(name)}</div>
      <div class="contact-info">${[phone, email, location].filter(Boolean).map(htmlEscape).join('<br>')}</div>
    </div>
    <div class="teal-line"></div>
    <div class="date">${htmlEscape(date)}</div>
    ${recipientLines ? `<div class="recipient">${recipientLines}</div>` : ''}
    <div class="greeting">${htmlEscape('Dear ' + (data.recipientInfo?.name || 'Hiring Manager') + ',')}</div>
    ${data.opening ? `<div class="paragraph">${htmlEscape(data.opening)}</div>` : ''}
    ${data.body1 ? `<div class="paragraph">${htmlEscape(data.body1)}</div>` : ''}
    ${data.body2 ? `<div class="paragraph">${htmlEscape(data.body2)}</div>` : ''}
    ${data.closing ? `<div class="paragraph">${htmlEscape(data.closing)}</div>` : ''}
    <div class="closing">${htmlEscape(data.signoff || 'Sincerely,')}<div class="signature">${htmlEscape(name)}</div></div>
  </div></div></body></html>`;
}

function renderResponsiveTemplate3(data: StructuredCoverLetter): string {
  const name = data.personalInfo?.name || '';
  const email = data.personalInfo?.email || '';
  const phone = data.personalInfo?.phone || '';
  const location = data.personalInfo?.location || data.personalInfo?.address || '';
  const date = data.meta?.date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const recipientLines = [
    [data.recipientInfo?.name, data.recipientInfo?.title].filter(Boolean).join(', '),
    data.recipientInfo?.company || '',
    data.recipientInfo?.address || ''
  ].filter(Boolean).join('<br>');

  const css = `
    body { margin: 0; background: #ffffff; }
    .page { width: 100%; max-width: 210mm; margin: 0 auto; background: #ffffff; }
    .content { padding: 20px; font-family: 'Segoe UI', Calibri, Arial, sans-serif; color: #333; }
    @media (min-width: 768px) { .content { padding: 50px; } }
    .blue-header { background: #1e5ba8; color: #fff; padding: 15px 20px; text-align: center; border-radius: 4px; }
    .name { font-size: 28px; font-weight: 600; letter-spacing: 2px; margin-bottom: 6px; }
    .date { font-size: 12px; margin: 20px 0; color: #666; }
    .recipient { font-size: 12px; line-height: 1.7; margin-bottom: 20px; }
    .paragraph { font-size: 12px; line-height: 1.8; text-align: justify; margin-bottom: 15px; }
    .closing { margin-top: 25px; font-size: 12px; }
    .signature { margin-top: 8px; font-weight: 600; font-size: 14px; }
    .contact { font-size: 12px; margin-top: 6px; opacity: 0.9; }
  `;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${css}</style></head><body>
  <div class="page"><div class="content">
    <div class="blue-header">
      <div class="name">${htmlEscape(name)}</div>
      <div class="contact">${[phone, email, location].filter(Boolean).map(htmlEscape).join(' • ')}</div>
    </div>
    <div class="date">${htmlEscape(date)}</div>
    ${recipientLines ? `<div class="recipient">${recipientLines}</div>` : ''}
    <div class="paragraph"><strong>${htmlEscape('Dear ' + (data.recipientInfo?.name || 'Hiring Manager') + ',')}</strong></div>
    ${data.opening ? `<div class="paragraph">${htmlEscape(data.opening)}</div>` : ''}
    ${data.body1 ? `<div class="paragraph">${htmlEscape(data.body1)}</div>` : ''}
    ${data.body2 ? `<div class="paragraph">${htmlEscape(data.body2)}</div>` : ''}
    ${data.closing ? `<div class="paragraph">${htmlEscape(data.closing)}</div>` : ''}
    <div class="closing">${htmlEscape(data.signoff || 'Sincerely,')}<div class="signature">${htmlEscape(name)}</div></div>
  </div></div></body></html>`;
}

function renderResponsiveTemplate4(data: StructuredCoverLetter): string {
  const name = data.personalInfo?.name || '';
  const email = data.personalInfo?.email || '';
  const phone = data.personalInfo?.phone || '';
  const location = data.personalInfo?.location || data.personalInfo?.address || '';
  const date = data.meta?.date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const recipientLines = [
    [data.recipientInfo?.name, data.recipientInfo?.title].filter(Boolean).join(', '),
    data.recipientInfo?.company || '',
    data.recipientInfo?.address || ''
  ].filter(Boolean).join('<br>');

  const css = `
    body { margin: 0; background: #ffffff; }
    .page { width: 100%; max-width: 210mm; margin: 0 auto; background: #ffffff; }
    .wrap { display:flex; min-height: auto; }
    @media (max-width: 767px) { .wrap { flex-direction: column; } }
    .blue-accent { width: 20mm; background: linear-gradient(to bottom, #2563eb 0%, #1e40af 100%); flex-shrink: 0; }
    @media (max-width: 767px) { .blue-accent { width: 100%; height: 4px; } }
    .content-area { flex:1; padding: 20px; font-family: Calibri, 'Segoe UI', Arial, sans-serif; color: #333; }
    @media (min-width: 768px) { .content-area { padding: 30px; } }
    .header { margin-bottom: 25px; display:flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; }
    .name { font-size: 26px; font-weight: 700; color: #1e40af; line-height: 1.2; margin-bottom: 5px; }
    .contact { text-align:right; font-size:12px; color:#555; line-height:1.6; }
    @media (max-width: 767px) { .contact { text-align: left; } }
    .date { font-size: 12px; margin-bottom: 20px; }
    .recipient { font-size: 12px; line-height: 1.6; margin-bottom: 20px; }
    .greeting { margin-bottom: 15px; font-size: 12px; font-weight: 600; color: #1e40af; }
    .paragraph { font-size: 12px; line-height: 1.8; text-align: justify; margin-bottom: 15px; }
    .closing { margin-top: 25px; font-size: 12px; }
    .signature { margin-top: 8px; font-weight: 700; color: #1e40af; font-size: 16px; }
  `;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${css}</style></head><body>
  <div class="page">
    <div class="wrap">
      <div class="blue-accent"></div>
      <div class="content-area">
        <div class="header">
          <div class="name">${htmlEscape(name)}</div>
          <div class="contact">${[location, phone, email].filter(Boolean).map(htmlEscape).join('<br>')}</div>
        </div>
        <div class="date">${htmlEscape(date)}</div>
        ${recipientLines ? `<div class="recipient">${recipientLines}</div>` : ''}
        <div class="greeting">${htmlEscape('Dear ' + (data.recipientInfo?.name || 'Hiring Manager') + ',')}</div>
        ${data.opening ? `<div class="paragraph">${htmlEscape(data.opening)}</div>` : ''}
        ${data.body1 ? `<div class="paragraph">${htmlEscape(data.body1)}</div>` : ''}
        ${data.body2 ? `<div class="paragraph">${htmlEscape(data.body2)}</div>` : ''}
        ${data.closing ? `<div class="paragraph">${htmlEscape(data.closing)}</div>` : ''}
        <div class="closing">${htmlEscape(data.signoff || 'Sincerely,')}<div class="signature">${htmlEscape(name)}</div></div>
      </div>
    </div>
  </div>
  </body></html>`;
}

function renderResponsiveTemplate5(data: StructuredCoverLetter): string {
  const name = data.personalInfo?.name || '';
  const email = data.personalInfo?.email || '';
  const phone = data.personalInfo?.phone || '';
  const location = data.personalInfo?.location || data.personalInfo?.address || '';
  const date = data.meta?.date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const recipientLines = [
    [data.recipientInfo?.name, data.recipientInfo?.title].filter(Boolean).join(', '),
    data.recipientInfo?.company || '',
    data.recipientInfo?.address || ''
  ].filter(Boolean).join('<br>');

  const css = `
    body { margin: 0; background: #ffffff; }
    .page { width: 100%; max-width: 210mm; margin: 0 auto; background: #ffffff; }
    .content { padding: 20px; font-family: 'Segoe UI', Tahoma, Verdana, sans-serif; color: #333; line-height: 1.7; font-size: 12px; }
    @media (min-width: 768px) { .content { padding: 25mm; } }
    .header { display:flex; justify-content: space-between; align-items: flex-start; padding-bottom:20px; border-bottom: 1px solid #ddd; margin-bottom: 30px; background: linear-gradient(to right, #f8f9fa 0%, #e9ecef 100%); padding: 20px; margin: -20px -20px 30px -20px; flex-wrap: wrap; }
    @media (min-width: 768px) { .header { padding: 25px; margin: -25mm -25mm 30px -25mm; } }
    .name { font-size: 24px; font-weight: 500; color: #2c3e50; letter-spacing: 0.5px; }
    .contact { text-align:right; font-size:12px; color:#555; line-height:1.8; border-left:1px solid #ccc; padding-left:20px; margin-left:20px; }
    @media (max-width: 767px) { .contact { border-left: none; padding-left: 0; margin-left: 0; text-align: left; border-top: 1px solid #ccc; padding-top: 20px; margin-top: 20px; } }
    .date { margin-bottom: 25px; font-size: 12px; color: #555; }
    .recipient { margin-bottom: 25px; font-size: 12px; line-height: 1.6; }
    .greeting { margin-bottom: 20px; font-size: 13px; font-weight: 500; }
    .paragraph { font-size: 12px; text-align: justify; margin-bottom: 15px; }
    .closing { margin-top: 25px; font-size: 12px; }
    .signature { margin-top: 5px; font-weight: 600; font-size: 15px; }
  `;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${css}</style></head><body>
  <div class="page"><div class="content">
    <div class="header">
      <div class="name">${htmlEscape(name)}</div>
      <div class="contact">${[location, phone, email].filter(Boolean).map(htmlEscape).join('<br>')}</div>
    </div>
    <div class="date">${htmlEscape(date)}</div>
    ${recipientLines ? `<div class="recipient">${recipientLines}</div>` : ''}
    <div class="greeting">${htmlEscape('Dear ' + (data.recipientInfo?.name || 'Hiring Manager') + ',')}</div>
    ${data.opening ? `<div class="paragraph">${htmlEscape(data.opening)}</div>` : ''}
    ${data.body1 ? `<div class="paragraph">${htmlEscape(data.body1)}</div>` : ''}
    ${data.body2 ? `<div class="paragraph">${htmlEscape(data.body2)}</div>` : ''}
    ${data.closing ? `<div class="paragraph">${htmlEscape(data.closing)}</div>` : ''}
    <div class="closing">${htmlEscape(data.signoff || 'Sincerely,')}<div class="signature">${htmlEscape(name)}</div></div>
  </div></div></body></html>`;
}

// Main renderer function - supports both PDF mode (default) and view mode
export function renderCoverLetterTemplate(templateId: string, data: StructuredCoverLetter, mode: 'view' | 'pdf' = 'pdf'): string {
  // Use responsive templates for view mode
  if (mode === 'view') {
    switch (templateId) {
      case 'template-1':
        return renderResponsiveTemplate1(data);
      case 'template-2':
        return renderResponsiveTemplate2(data);
      case 'template-3':
        return renderResponsiveTemplate3(data);
      case 'template-4':
        return renderResponsiveTemplate4(data);
      case 'template-5':
        return renderResponsiveTemplate5(data);
      default:
        return renderResponsiveTemplate1(data); // Default fallback
    }
  }
  
  // Use PDF-optimized templates for PDF mode (default)
  switch (templateId) {
    case 'template-1':
      return renderTemplate1(data);
    case 'template-2':
      return renderTemplate2(data);
    case 'template-3':
      return renderTemplate3(data);
    case 'template-4':
      return renderTemplate4(data);
    case 'template-5':
      return renderTemplate5(data);
    default:
      return renderTemplate1(data); // Default fallback
  }
}




