// Professional PDF generation library for SELIHOME Clinic
// Each function generates a specific report type with proper medical document formatting
import type { useEncounterStore } from '../store/useEncounterStore';

type EncounterState = ReturnType<typeof useEncounterStore.getState>;

// Common PDF styles for all reports
const getCommonStyles = () => `
  * { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
  }
  
  @page {
    size: A4;
    margin: 15mm 15mm 20mm 15mm;
  }
  
  body { 
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    color: #1e293b;
    background: #ffffff;
    font-size: 10pt;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    overflow-x: hidden;
  }
  
  /* Prevent content overflow */
  * {
    max-width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  }
  
  /* Professional Header */
  .pdf-header {
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
    color: white;
    padding: 18px 20px;
    margin: -15mm -15mm 18px -15mm;
    border-bottom: 4px solid #1e40af;
  }
  
  .clinic-name {
    font-size: 20pt;
    font-weight: 800;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  
  .clinic-subtitle {
    font-size: 9pt;
    opacity: 0.95;
    font-weight: 500;
  }
  
  .document-title {
    background: #f1f5f9;
    border-left: 4px solid #2563eb;
    padding: 10px 14px;
    margin: 16px 0;
    font-size: 14pt;
    font-weight: 700;
    color: #1e3a8a;
  }
  
  /* Responsive Tables */
  table { 
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    page-break-inside: avoid;
    table-layout: fixed;
  }
  
  th {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    padding: 8px 6px;
    text-align: left;
    font-weight: 600;
    font-size: 8.5pt;
    color: #475569;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  td {
    border: 1px solid #e2e8f0;
    padding: 8px 6px;
    font-size: 9pt;
    color: #334155;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* Prevent long words from breaking layout */
  td, th {
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }
  
  h1, h2, h3 {
    color: #1e3a8a;
    margin-top: 14px;
    margin-bottom: 7px;
    page-break-after: avoid;
    overflow-wrap: break-word;
  }
  
  h1 { font-size: 14pt; font-weight: 700; }
  h2 { font-size: 12pt; font-weight: 600; }
  h3 { font-size: 10.5pt; font-weight: 600; }
  
  .section-title {
    background: #dbeafe;
    border-left: 4px solid #2563eb;
    padding: 9px 12px;
    margin: 18px 0 10px 0;
    font-size: 11.5pt;
    font-weight: 700;
    color: #1e3a8a;
    page-break-after: avoid;
    overflow-wrap: break-word;
  }
  
  .subsection-title {
    background: #f1f5f9;
    padding: 7px 10px;
    margin: 12px 0 7px 0;
    font-size: 10pt;
    font-weight: 600;
    color: #334155;
    border-left: 3px solid #64748b;
    overflow-wrap: break-word;
  }
  
  /* Section Content Wrapper - Prevent Overflow */
  .section-content {
    max-width: 100%;
    overflow: hidden;
  }
  
  .section-content > * {
    max-width: 100%;
  }
  
  /* Footer */
  .pdf-footer {
    margin-top: 24px;
    padding-top: 12px;
    border-top: 2px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 7.5pt;
    color: #64748b;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .footer-left {
    font-weight: 600;
    flex: 1 1 auto;
  }
  
  .footer-right {
    text-align: right;
    flex: 0 1 auto;
  }
  
  .confidential-badge {
    display: inline-block;
    background: #fee2e2;
    color: #991b1b;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: 600;
    font-size: 7pt;
    margin-left: 6px;
    white-space: nowrap;
  }
  
  .patient-header {
    background: #1e3a8a;
    color: white;
    padding: 14px 16px;
    margin: 16px 0;
    border-radius: 6px;
    overflow: hidden;
  }
  
  .patient-name {
    font-size: 14pt;
    font-weight: 700;
    margin-bottom: 8px;
    overflow-wrap: break-word;
  }
  
  .patient-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 10px;
    font-size: 8.5pt;
  }
  
  .patient-info-label {
    color: #bfdbfe;
    text-transform: uppercase;
    font-size: 7.5pt;
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .patient-info-value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Responsive Images */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  
  /* Lists */
  ul, ol {
    margin-left: 16px;
    padding-left: 0;
  }
  
  li {
    margin-bottom: 4px;
    overflow-wrap: break-word;
  }
  
  /* Paragraphs */
  p {
    margin-bottom: 8px;
    overflow-wrap: break-word;
  }
  
  /* Divs and containers */
  div {
    max-width: 100%;
    overflow-wrap: break-word;
  }
  
  /* Grid layouts - make responsive */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
  }
  
  /* Flex containers - prevent overflow */
  .flex {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  @media print { 
    body { 
      padding: 0;
      margin: 0;
    }
    
    button { 
      display: none !important; 
    }
    
    .no-print {
      display: none !important;
    }
    
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
    }
    
    table, img {
      page-break-inside: avoid;
    }
    
    .section-title {
      page-break-after: avoid;
    }
    
    /* Force content to fit */
    * {
      max-width: 100% !important;
    }
    
    table {
      width: 100% !important;
      table-layout: fixed !important;
    }
    
    /* Hide scrollbars */
    ::-webkit-scrollbar {
      display: none;
    }
    
    body {
      overflow-x: hidden !important;
    }
  }
  
  @media screen {
    body {
      background: #f1f5f9;
      padding: 20px;
    }
    
    .page-container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 15mm;
      overflow-x: hidden;
    }
  }
  
  /* Additional safeguards for specific elements that might overflow */
  pre, code {
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
  }
  
  /* Input fields and form elements (in case they're in PDF) */
  input, select, textarea {
    max-width: 100%;
  }
  
  /* Ensure all child elements respect width */
  #discharge-summary-report,
  #discharge-summary-report *,
  #spectacle-prescription-report,
  #spectacle-prescription-report *,
  #contact-lens-specification-report,
  #contact-lens-specification-report *,
  .section-content,
  .section-content * {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
`;

const getTimestamp = () => {
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    timeZone: 'Africa/Addis_Ababa',
  });
  
  const time = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Africa/Addis_Ababa',
  });
  
  return { today, time };
};

const openPrintWindow = (html: string) => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.addEventListener('load', () => {
      win.print();
    });
  }
  setTimeout(() => URL.revokeObjectURL(url), 30000);
};

// Helper to safely get element content
const getElementContent = (id: string): string => {
  const node = document.getElementById(id);
  if (!node) return '';
  const clone = node.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('button').forEach(b => b.remove());
  clone.querySelectorAll('.no-print').forEach(el => el.remove());
  clone.querySelectorAll('.bg-blue-50.border-blue-200').forEach(el => el.remove());
  return clone.outerHTML;
};

// COMPREHENSIVE PDF: Everything about the patient - all tests and reports
export function downloadEncounterPdf(state: EncounterState) {
  const { today, time } = getTimestamp();
  const patient = state.patient;
  
  // Collect all available sections
  const sections: { title: string; content: string }[] = [];
  
  // Try to get Discharge Summary (if on that tab)
  const dischargeContent = getElementContent('discharge-summary-report');
  if (dischargeContent) {
    sections.push({ title: 'DISCHARGE SUMMARY', content: dischargeContent });
  }
  
  // Try to get Spectacle Prescription
  const spectacleContent = getElementContent('spectacle-prescription-report');
  if (spectacleContent) {
    sections.push({ title: 'FINAL SPECTACLE PRESCRIPTION', content: spectacleContent });
  }
  
  // Try to get Contact Lens Specification
  const clContent = getElementContent('contact-lens-specification-report');
  if (clContent) {
    sections.push({ title: 'FINAL CONTACT LENS SPECIFICATION', content: clContent });
  }
  
  // If no sections found, show helpful message
  if (sections.length === 0) {
    alert('Please navigate to the REPORTS tab to generate the comprehensive patient report. At least one report section must be visible.');
    return;
  }
  
  // Build comprehensive report with all sections
  const sectionsHTML = sections.map(section => `
    <div class="section-title">${section.title}</div>
    <div class="section-content">
      ${section.content}
    </div>
  `).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Comprehensive Patient Report - SELIHOME</title>
  <style>${getCommonStyles()}</style>
</head>
<body>
  <div class="page-container">
    <div class="pdf-header">
      <div class="clinic-name">SELIHOME</div>
      <div class="clinic-subtitle">Ophthalmic Medium Clinic · Comprehensive Eye Care Center</div>
    </div>
    
    <div class="document-title">
      COMPREHENSIVE PATIENT MEDICAL REPORT
    </div>
    
    <div class="patient-header">
      <div class="patient-name">${patient.name}</div>
      <div class="patient-info">
        <div>
          <div class="patient-info-label">Gender</div>
          <div>${patient.gender}</div>
        </div>
        <div>
          <div class="patient-info-label">Age</div>
          <div>${typeof patient.age === 'number' ? `${patient.age} years` : patient.age}</div>
        </div>
        <div>
          <div class="patient-info-label">MRN</div>
          <div>${patient.mrn}</div>
        </div>
        <div>
          <div class="patient-info-label">Visit Date</div>
          <div>${today}</div>
        </div>
      </div>
    </div>
    
    ${sectionsHTML}
    
    <div class="pdf-footer">
      <div class="footer-left">
        <strong>SELIHOME Ophthalmic Medium Clinic</strong>
        <span class="confidential-badge">CONFIDENTIAL</span>
      </div>
      <div class="footer-right">
        <div>Generated: ${today} at ${time}</div>
        <div style="font-size: 7.5pt; margin-top: 2px;">This document contains protected health information</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  openPrintWindow(html);
}

// Final Spectacle Prescription PDF (standalone)
export function downloadSpectaclePrescriptionPdf(_state: EncounterState) {
  const node = document.getElementById('spectacle-prescription-report');
  
  if (!node) {
    alert('Unable to generate PDF. Please ensure you are on the Final Spectacle Prescription page.');
    return;
  }

  const { today, time } = getTimestamp();
  const content = node.cloneNode(true) as HTMLElement;
  content.querySelectorAll('button').forEach((b) => b.remove());

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Spectacle Prescription - SELIHOME</title>
  <style>${getCommonStyles()}</style>
</head>
<body>
  <div class="page-container">
    <div class="pdf-header">
      <div class="clinic-name">SELIHOME</div>
      <div class="clinic-subtitle">Ophthalmic Medium Clinic · Professional Optical Services</div>
    </div>
    
    <div class="document-title">
      FINAL SPECTACLE PRESCRIPTION
    </div>
    
    ${content.outerHTML}
    
    <div class="pdf-footer">
      <div class="footer-left">
        <strong>SELIHOME Ophthalmic Medium Clinic</strong>
        <span class="confidential-badge">CONFIDENTIAL</span>
      </div>
      <div class="footer-right">
        <div>Generated: ${today} at ${time}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  openPrintWindow(html);
}

// Final Contact Lens Specification PDF (standalone)
export function downloadContactLensSpecificationPdf(_state: EncounterState) {
  const node = document.getElementById('contact-lens-specification-report');
  
  if (!node) {
    alert('Unable to generate PDF. Please ensure you are on the Final Contact Lens Specification page.');
    return;
  }

  const { today, time } = getTimestamp();
  const content = node.cloneNode(true) as HTMLElement;
  content.querySelectorAll('button').forEach((b) => b.remove());

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Contact Lens Specification - SELIHOME</title>
  <style>${getCommonStyles()}</style>
</head>
<body>
  <div class="page-container">
    <div class="pdf-header">
      <div class="clinic-name">SELIHOME</div>
      <div class="clinic-subtitle">Ophthalmic Medium Clinic · Contact Lens Services</div>
    </div>
    
    <div class="document-title">
      FINAL CONTACT LENS SPECIFICATION
    </div>
    
    ${content.outerHTML}
    
    <div class="pdf-footer">
      <div class="footer-left">
        <strong>SELIHOME Ophthalmic Medium Clinic</strong>
        <span class="confidential-badge">CONFIDENTIAL</span>
      </div>
      <div class="footer-right">
        <div>Generated: ${today} at ${time}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  openPrintWindow(html);
}
