// Generates a print-friendly HTML page for the current encounter and triggers browser print/save-as-PDF
import type { useEncounterStore } from '../store/useEncounterStore';

type EncounterState = ReturnType<typeof useEncounterStore.getState>;

export function downloadEncounterPdf(state: EncounterState) {
  const { patient, consentObtained } = state;

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    timeZone: 'Africa/Addis_Ababa',
  });

  // Build refraction summary
  const obj = state.objectiveRefraction;
  const subj = state.subjectiveRefraction;
  const va = state.visualAcuity;

  const row = (label: string, val: string) =>
    val ? `<tr><td style="padding:4px 8px;color:#64748b;font-size:12px">${label}</td><td style="padding:4px 8px;font-size:12px;font-weight:600">${val}</td></tr>` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Encounter Report – ${patient.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; color: #1e293b; background: #fff; padding: 32px; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f766e; padding-bottom: 14px; margin-bottom: 20px; }
    .clinic-name { font-size: 20px; font-weight: 900; color: #0f766e; letter-spacing: -0.5px; }
    .clinic-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
    .report-title { font-size: 14px; font-weight: 700; color: #334155; text-align: right; }
    .report-date { font-size: 11px; color: #94a3b8; text-align: right; margin-top: 2px; }
    .section { margin-bottom: 18px; }
    .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #0f766e; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px; }
    .patient-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .field label { display: block; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
    .field span { font-weight: 600; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f1f5f9; font-size: 11px; padding: 6px 8px; text-align: left; color: #475569; }
    td { padding: 5px 8px; border-bottom: 1px solid #f1f5f9; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-amber { background: #fef9c3; color: #854d0e; }
    .footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="clinic-name">SELIHOME</div>
      <div class="clinic-sub">Ophthalmic Medium Clinic – EMR Engine</div>
    </div>
    <div>
      <div class="report-title">Clinical Encounter Report</div>
      <div class="report-date">${today}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Patient Information</div>
    <div class="patient-grid">
      <div class="field"><label>Full Name</label><span>${patient.name}</span></div>
      <div class="field"><label>MRN</label><span>${patient.mrn}</span></div>
      <div class="field"><label>Age / Gender</label><span>${patient.age} yrs · ${patient.gender}</span></div>
      <div class="field"><label>Appointment</label><span>${patient.appointmentTime}</span></div>
      <div class="field"><label>Reason for Visit</label><span>${patient.reasonForVisit}</span></div>
      <div class="field"><label>Consent</label><span class="badge ${consentObtained ? 'badge-green' : 'badge-amber'}">${consentObtained ? '✓ Verified' : 'Pending'}</span></div>
    </div>
  </div>

  ${va ? `
  <div class="section">
    <div class="section-title">Visual Acuity</div>
    <table>
      <thead><tr><th>Eye</th><th>Unaided</th><th>Pinhole</th><th>Best Corrected</th></tr></thead>
      <tbody>
        <tr><td>Right Eye (OD)</td><td>${va.unaidedVaOD || '—'}</td><td>${va.pinholeVaOD || '—'}</td><td>${va.bestCorrectedVaOD || '—'}</td></tr>
        <tr><td>Left Eye (OS)</td><td>${va.unaidedVaOS || '—'}</td><td>${va.pinholeVaOS || '—'}</td><td>${va.bestCorrectedVaOS || '—'}</td></tr>
      </tbody>
    </table>
  </div>` : ''}

  ${obj ? `
  <div class="section">
    <div class="section-title">Objective Refraction</div>
    <table>
      <thead><tr><th>Eye</th><th>Sphere</th><th>Cylinder</th><th>Axis</th><th>VA</th><th>Add</th></tr></thead>
      <tbody>
        <tr><td>OD</td><td>${obj.odSph||'—'}</td><td>${obj.odCyl||'—'}</td><td>${obj.odAxis||'—'}</td><td>${obj.odVa||'—'}</td><td>${obj.odAdd||'—'}</td></tr>
        <tr><td>OS</td><td>${obj.osSph||'—'}</td><td>${obj.osCyl||'—'}</td><td>${obj.osAxis||'—'}</td><td>${obj.osVa||'—'}</td><td>${obj.osAdd||'—'}</td></tr>
      </tbody>
    </table>
  </div>` : ''}

  ${subj ? `
  <div class="section">
    <div class="section-title">Subjective Refraction</div>
    <table>
      <thead><tr><th>Eye</th><th>Sphere</th><th>Cylinder</th><th>Axis</th><th>VA</th><th>Add</th></tr></thead>
      <tbody>
        <tr><td>OD</td><td>${subj.odSph||'—'}</td><td>${subj.odCyl||'—'}</td><td>${subj.odAxis||'—'}</td><td>${subj.odVa||'—'}</td><td>${subj.odAdd||'—'}</td></tr>
        <tr><td>OS</td><td>${subj.osSph||'—'}</td><td>${subj.osCyl||'—'}</td><td>${subj.osAxis||'—'}</td><td>${subj.osVa||'—'}</td><td>${subj.osAdd||'—'}</td></tr>
      </tbody>
    </table>
  </div>` : ''}

  ${state.symptoms?.length ? `
  <div class="section">
    <div class="section-title">Presenting Symptoms</div>
    <table>
      <thead><tr><th>Symptom</th><th>Eye</th><th>Duration</th><th>Severity</th></tr></thead>
      <tbody>
        ${state.symptoms.map(s => `<tr><td>${s.name}</td><td>${s.eye}</td><td>${s.durationValue} ${s.durationUnit}</td><td>${s.severity}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}

  ${state.assessmentPlan?.assessment ? `
  <div class="section">
    <div class="section-title">Assessment & Plan</div>
    <p style="font-size:12px;line-height:1.6">${state.assessmentPlan.assessment}</p>
    ${state.assessmentPlan.plan ? `<p style="font-size:12px;line-height:1.6;margin-top:6px"><strong>Plan:</strong> ${state.assessmentPlan.plan}</p>` : ''}
  </div>` : ''}

  <div class="footer">
    <span>SELIHOME Ophthalmic Medium Clinic · Confidential Medical Record</span>
    <span>Printed: ${today}</span>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.addEventListener('load', () => {
      win.print();
    });
  }
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
