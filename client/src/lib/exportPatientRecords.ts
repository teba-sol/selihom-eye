import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { formatEthiopianDate } from './formatters';

type ExportPatient = {
  mrn: string; firstName: string; lastName: string; grandfatherName?: string | null;
  dob?: string | null; gender?: string | null; phone?: string | null; encounters: any[];
};

const navy: [number, number, number] = [15, 48, 89];
const blue: [number, number, number] = [37, 99, 235];
const slate: [number, number, number] = [51, 65, 85];
const clean = (value: string) => value.replace(/[\\:*?"<>|]/g, '_').trim() || 'Patient';

const NON_CLINICAL_KEYS = new Set([
  'id', 'showInDischarge', 'createdAt', 'updatedAt', 'confirmedAt', 'billing', 'billingItems',
  'price', 'total', 'discount', 'amount', 'advancePaid', 'paidAt', 'status', 'tab', 'unit',
  'activeTab', 'activeSubTab', 'sameForOS', 'sameForOs', 'diagram', 'odCanvasVectors', 'osCanvasVectors',
  'uuid', 'key',
]);

// Sections that have bespoke readable rendering (mirrors DischargeSummaryView).
const HISTORY_SECTIONS = new Set([
  'reason-for-visit', 'symptomatic-history', 'ocular-history', 'systemic-history', 'medication',
  'family-ocular-history', 'family-systemic-history', 'spectacles', 'contact-lens', 'lifestyle',
]);

function humanizeKey(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Reads an ISO/date string and returns the Ethiopian calendar date, with an
// optional 12-hour time appended for timestamps.
function ethiopianStamp(value: unknown, withTime = false): string {
  if (!value) return '—';
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return String(value);
  const date = formatEthiopianDate(d);
  if (!withTime) return date;
  return `${date} · ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
}

// Flattens a nested clinical object into readable label/value rows.
function flattenRows(value: any, prefix = '', out: { label: string; value: string }[] = []): { label: string; value: string }[] {
  if (value === null || value === undefined || value === '') return out;

  const push = (label: string, raw: unknown) => {
    if (raw === null || raw === undefined) return;
    const text = printable(raw);
    if (text === '' || text === '—' || text === 'No') return;
    out.push({ label, value: text });
  };

  if (Array.isArray(value)) {
    if (value.length === 0) return out;
    if (typeof value[0] === 'object' && value[0] !== null) {
      value.forEach((item, i) => flattenRows(item, prefix ? `${prefix} ${i + 1}` : `${i + 1}`, out));
      return out;
    }
    push(prefix || 'Items', value);
    return out;
  }

  if (typeof value === 'boolean') {
    push(prefix, value ? 'Yes' : 'No');
    return out;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value).filter(([k]) => !NON_CLINICAL_KEYS.has(k));
    // OD/OS pairs read best side by side.
    const od = entries.find(([k]) => /^od$/i.test(k))?.[1];
    const os = entries.find(([k]) => /^os$/i.test(k))?.[1];
    if (od !== undefined && os !== undefined) {
      push(prefix || 'OD / OS', `OD ${printable(od)} · OS ${printable(os)}`);
      entries.filter(([k]) => !/^(od|os)$/i.test(k)).forEach(([k, v]) => {
        if (typeof v === 'object' && v !== null) flattenRows(v, prefix ? `${prefix} · ${humanizeKey(k)}` : humanizeKey(k), out);
        else push(prefix ? `${prefix} · ${humanizeKey(k)}` : humanizeKey(k), v);
      });
      return out;
    }
    entries.forEach(([k, v]) => {
      const label = prefix ? `${prefix} · ${humanizeKey(k)}` : humanizeKey(k);
      if (typeof v === 'object' && v !== null) flattenRows(v, label, out);
      else push(label, v);
    });
    return out;
  }

  push(prefix, value);
  return out;
}

function printable(value: any): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    return value.map(printable).filter((v) => v !== '—' && v !== 'No').join(', ') || '—';
  }
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([k, v]) => !NON_CLINICAL_KEYS.has(k) && v !== null && v !== undefined && String(v).trim() !== '')
      .map(([k, v]) => `${humanizeKey(k)}: ${printable(v)}`)
      .join(' · ') || '—';
  }
  return String(value);
}

function ethiopianAddenda(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw.replace(
    /^(\[Addendum recorded(?: by .+?)? on )([^\]]+)(\])/gm,
    (_, before, ts, after) => {
      const d = new Date(String(ts).trim());
      if (isNaN(d.getTime())) return before + ts + after;
      const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return `${before}${formatEthiopianDate(d)} at ${time}${after}`;
    },
  );
}

function addPageHeader(pdf: jsPDF, patient: ExportPatient, page: number) {
  pdf.setFillColor(...navy); pdf.rect(0, 0, 210, 33, 'F');
  pdf.setFillColor(...blue); pdf.rect(0, 31, 210, 2, 'F');
  pdf.setTextColor(255, 255, 255); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(18);
  pdf.text('SELIHOME', 15, 15);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.text('OPHTHALMIC DISCHARGE SUMMARY', 15, 22);
  pdf.setFontSize(8); pdf.text(`MRN  ${patient.mrn}`, 195, 15, { align: 'right' });
  pdf.text(`Page ${page}`, 195, 22, { align: 'right' });
  pdf.setTextColor(...slate);
}

function addPatientCard(pdf: jsPDF, patient: ExportPatient, y: number) {
  pdf.setFillColor(239, 246, 255); pdf.roundedRect(15, y, 180, 25, 3, 3, 'F');
  pdf.setDrawColor(191, 219, 254); pdf.roundedRect(15, y, 180, 25, 3, 3, 'S');
  pdf.setTextColor(...navy); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(13);
  pdf.text(`${patient.firstName} ${patient.lastName} ${patient.grandfatherName ?? ''}`.trim(), 21, y + 9);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.setTextColor(...slate);
  pdf.text(`MRN: ${patient.mrn}`, 21, y + 17);
  pdf.text(`Gender: ${patient.gender || '—'}`, 73, y + 17);
  pdf.text(`DOB: ${patient.dob || '—'}`, 121, y + 17);
  pdf.text(`Phone: ${patient.phone || '—'}`, 21, y + 22);
  return y + 33;
}

export async function exportPatientRecordsZip(records: ExportPatient[]) {
  const zip = new JSZip();
  for (const patient of records) {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    let page = 1;
    addPageHeader(pdf, patient, page);
    let y = addPatientCard(pdf, patient, 41);
    const nextPage = () => { pdf.addPage(); page += 1; addPageHeader(pdf, patient, page); y = 43; };
    const write = (text: string, size = 9, indent = 21, color: [number, number, number] = slate, bold = false) => {
      if (!text) return;
      pdf.setFont('helvetica', bold ? 'bold' : 'normal'); pdf.setFontSize(size); pdf.setTextColor(...color);
      const lines = pdf.splitTextToSize(text, 190 - indent);
      if (y + lines.length * 4.6 > 280) nextPage();
      pdf.text(lines, indent, y); y += lines.length * 4.6 + 2;
    };
    const section = (title: string) => {
      if (y > 264) nextPage();
      pdf.setFillColor(...blue); pdf.roundedRect(15, y, 180, 8, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9.5); pdf.text(title.toUpperCase(), 20, y + 5.3); y += 12;
    };
    const field = (name: string, value: any) => {
      const text = value === null || value === undefined || value === '' ? '' : printable(value);
      if (!text || text === '—') return;
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5); pdf.setTextColor(...navy); pdf.text(`${name}:`, 21, y);
      const labelWidth = pdf.getTextWidth(`${name}:`) + 3;
      pdf.setFont('helvetica', 'normal'); pdf.setTextColor(...slate);
      const lines = pdf.splitTextToSize(text, 170 - labelWidth);
      if (y + lines.length * 4.6 > 280) nextPage();
      pdf.text(lines, 21 + labelWidth, y); y += Math.max(lines.length * 4.6, 4.6) + 1.5;
    };

    section(`Discharge summaries · ${patient.encounters.length} finalized examination(s)`);
    if (!patient.encounters.length) write('No finalized examinations are available for this patient.');

    patient.encounters.forEach((encounter, index) => {
      if (y > 242) nextPage();
      // Encounter header
      pdf.setFillColor(241, 245, 249); pdf.roundedRect(15, y, 180, 10, 2, 2, 'F');
      pdf.setTextColor(...navy); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10);
      pdf.text(`Examination ${index + 1} — Discharge Summary`, 20, y + 6.3);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(...slate);
      const date = ethiopianStamp(encounter.createdAt);
      pdf.text(`${date}  •  Dr. ${encounter.doctorFirstName || ''} ${encounter.doctorLastName || ''}`.trim(), 190, y + 6.3, { align: 'right' });
      y += 14;

      const sd = encounter.sectionData ?? {};
      const die = (d: any, fallback = '—') => (d === undefined || d === null || String(d).trim() === '' ? fallback : String(d));
      const activeConds = (history: any): [string, any][] => {
        const conds: Record<string, any> = history?.conditions ?? {};
        return Object.entries(conds || {}).filter(([, c]) => c && (c as any).active);
      };

      // ── History & symptoms (toggled sections) ────────────────────────
      if (sd['reason-for-visit']?.showInDischarge === true) {
        field('Reason for visit', encounter.reasonForVisit?.selectedReason ?? sd['reason-for-visit']?.remarks);
      }
      if (sd['symptomatic-history']?.showInDischarge === true) {
        const syms = encounter.symptomaticHistory?.symptoms ?? [];
        if (Array.isArray(syms) && syms.length) {
          field('Symptoms', syms.map((sym: any, i: number) =>
            `${i + 1}. ${sym.name || '—'}${sym.eye ? ` (${sym.eye})` : ''}${sym.since ? ` since ${sym.since}` : ''}${sym.frequency ? ` · ${sym.frequency}` : ''}${sym.severity ? ` · ${sym.severity}` : ''}`,
          ).join('  '));
        }
      }
      if (sd['ocular-history']?.showInDischarge === true) {
        if (encounter.ocularHistory?.noHistoryReported) {
          field('Ocular history', 'No ocular history reported');
        } else {
          const conds = activeConds(encounter.ocularHistory)
            .map(([k, c]) => `${c.type || humanizeKey(k)} (${c.eye || '—'})${c.date ? ` — ${c.date}` : ''}${c.remarks ? ` [${c.remarks}]` : ''}`);
          if (conds.length) field('Ocular history', conds.join('  '));
        }
      }
      if (sd['systemic-history']?.showInDischarge === true) {
        if (encounter.systemicHistory?.noHistoryReported) {
          field('Systemic history', 'No systemic history reported');
        } else {
          const conds = activeConds(encounter.systemicHistory)
            .map(([k, c]) => {
              const parts = [c.type || humanizeKey(k)];
              if (c.durationValue) parts.push(`${c.durationValue} ${c.durationUnit ?? 'years'}`);
              if (c.controlStatus) parts.push(c.controlStatus);
              if (c.dateOfDiagnosis) parts.push(`dx ${c.dateOfDiagnosis}`);
              if (c.remarks) parts.push(`[${c.remarks}]`);
              return parts.join(', ');
            });
          if (conds.length) field('Systemic history', conds.join('  '));
        }
      }
      if (sd['medication']?.showInDischarge === true) {
        const meds = (encounter.medicationHistory ?? []).filter((m: any) => m?.showInDischarge !== false);
        if (meds.length) field('Medication', meds.map((m: any) => `${m.drugName} ${m.dosage ?? ''}${m.frequency ? ` (${m.frequency})` : ''}`.trim()).join(', '));
      }
      if (sd['family-ocular-history']?.showInDischarge === true) {
        if (sd['family-ocular-history']?.noHistory) {
          field('Family ocular history', 'No family ocular history reported');
        } else {
          const items = (encounter.familyOcularHistory ?? []).filter((f: any) => f?.showInDischarge !== false);
          if (items.length) field('Family ocular history', items.map((f: any) => `${f.condition} (${f.relation})${f.notes ? ` — ${f.notes}` : ''}`).join('  '));
        }
      }
      if (sd['family-systemic-history']?.showInDischarge === true) {
        if (sd['family-systemic-history']?.noHistory) {
          field('Family systemic history', 'No family systemic history reported');
        } else {
          const items = (encounter.familySystemicHistory ?? []).filter((f: any) => f?.showInDischarge !== false);
          if (items.length) field('Family systemic history', items.map((f: any) => `${f.condition} (${f.relation})${f.notes ? ` — ${f.notes}` : ''}`).join('  '));
        }
      }
      if (sd['spectacles']?.showInDischarge === true) {
        if (sd['spectacles']?.none) {
          field('Spectacles', 'No spectacles worn');
        } else if (encounter.spectaclesHistory?.currentlyWears) {
          field('Spectacles', `${encounter.spectaclesHistory.type} — ${encounter.spectaclesHistory.material}${encounter.spectaclesHistory.coating?.length ? ', ' + encounter.spectaclesHistory.coating.join(', ') : ''}`);
        }
      }
      if (sd['contact-lens']?.showInDischarge === true) {
        if (sd['contact-lens']?.none) {
          field('Contact lenses', 'No contact lenses worn');
        } else if (encounter.contactLensHistory?.currentWearer) {
          field('Contact lenses', `${encounter.contactLensHistory.modality}${encounter.contactLensHistory.solutionUsed ? ` — ${encounter.contactLensHistory.solutionUsed}` : ''}`);
        }
      }
      if (sd['lifestyle']?.showInDischarge === true && encounter.lifestyleDemands?.occupation) {
        field('Lifestyle', `Occupation: ${encounter.lifestyleDemands.occupation}${encounter.lifestyleDemands.hobbies ? `; Hobbies: ${encounter.lifestyleDemands.hobbies}` : ''}`);
      }

      // ── All other marked sections, rendered as readable label/value rows ──
      const marked = Object.entries(sd).filter(([k, v]: any) => v?.showInDischarge === true && !HISTORY_SECTIONS.has(k));
      for (const [key, value] of marked) {
        if (y > 258) nextPage();
        const rows = flattenRows(value);
        if (!rows.length) continue;
        write(humanizeKey(key).toUpperCase(), 8, 21, blue, true);
        for (const row of rows) {
          field(row.label, row.value);
        }
      }

      // ── Diagnosis / plan / advice ──────────────────────────────────────
      const p = sd['assessment-plan'] ?? {};
      const dxSection = sd['diagnosis'] ?? sd['diagnoses'] ?? {};
      const diagnoses = (encounter.diagnoses?.length ? encounter.diagnoses : (dxSection.items ?? []));
      const showDx = p.showInDischarge === true || dxSection.showInDischarge === true;
      if (showDx && Array.isArray(diagnoses) && diagnoses.length) {
        field('Diagnosis', diagnoses.map((d: any) => `${d.title || d.name || d}${d.eye ? ` (${d.eye})` : ''}${d.notes ? ` — ${d.notes}` : ''}`).join('  '));
      }
      if (encounter.treatmentPlanPathway) field('Treatment plan', encounter.treatmentPlanPathway);
      if (encounter.counselingAdviceGiven) field('Advice and counselling', encounter.counselingAdviceGiven);

      const addenda = ethiopianAddenda(encounter.addendumNotes);
      if (addenda && addenda.trim()) {
        if (y > 258) nextPage();
        write('CLINICAL ADDENDA', 8, 21, blue, true);
        for (const line of addenda.split('\n')) {
          if (line.trim()) write(die(line, ''), 8.5);
        }
      }
      y += 5;
    });
    pdf.setDrawColor(203, 213, 225); pdf.line(15, 287, 195, 287);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(100, 116, 139);
    pdf.text('Confidential clinical record • Generated by SELIHOME', 15, 292);
    zip.file(`${clean(patient.firstName)}_${clean(patient.lastName)}-${clean(patient.mrn)}.pdf`, pdf.output('arraybuffer'));
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob); link.download = 'SELIHOME_Patient_Discharge_Summaries.zip'; link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1_000);
}