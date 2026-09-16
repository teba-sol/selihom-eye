import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

type ExportPatient = {
  mrn: string; firstName: string; lastName: string; grandfatherName?: string | null;
  dob?: string | null; gender?: string | null; phone?: string | null; encounters: any[];
};

const navy: [number, number, number] = [15, 48, 89];
const blue: [number, number, number] = [37, 99, 235];
const slate: [number, number, number] = [51, 65, 85];
const clean = (value: string) => value.replace(/[\\:*?"<>|]/g, '_').trim() || 'Patient';
const label = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' ').replace(/^./, (c) => c.toUpperCase());
const present = (value: unknown) => value !== null && value !== undefined && String(value).trim() !== '';
const OMITTED_FIELDS = new Set([
  'id', 'showInDischarge', 'createdAt', 'updatedAt', 'confirmedAt', 'billing', 'billingItems',
  'price', 'total', 'discount', 'amount', 'advancePaid', 'paidAt', 'status', 'tab', 'unit',
]);

function printable(value: any): string {
  if (!present(value)) return '—';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.map(printable).filter((v) => v !== '—').join(' · ') || '—';
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([key, v]) => !OMITTED_FIELDS.has(key) && present(v) && (typeof v !== 'object' || printable(v) !== '—'))
      .map(([k, v]) => `${label(k)}: ${printable(v)}`)
      .join(' | ') || '—';
  }
  return String(value);
}

function markedDischargeData(sectionData: Record<string, any> | null | undefined) {
  return Object.fromEntries(
    Object.entries(sectionData ?? {}).filter(([, value]) => value?.showInDischarge === true),
  );
}

function addPageHeader(pdf: jsPDF, patient: ExportPatient, page: number) {
  pdf.setFillColor(...navy); pdf.rect(0, 0, 210, 33, 'F');
  pdf.setFillColor(...blue); pdf.rect(0, 31, 210, 2, 'F');
  pdf.setTextColor(255, 255, 255); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(18);
  pdf.text('SELIHOME', 15, 15);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.text('OPHTHALMIC MEDICAL RECORD', 15, 22);
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
    const write = (text: string, size = 9, indent = 21) => {
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(size); pdf.setTextColor(...slate);
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
      const text = printable(value); if (text === '—') return;
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5); pdf.setTextColor(...navy); pdf.text(`${name}:`, 21, y);
      const labelWidth = pdf.getTextWidth(`${name}:`) + 3;
      pdf.setFont('helvetica', 'normal'); pdf.setTextColor(...slate);
      const lines = pdf.splitTextToSize(text, 170 - labelWidth);
      if (y + lines.length * 4.6 > 280) nextPage();
      pdf.text(lines, 21 + labelWidth, y); y += Math.max(lines.length * 4.6, 4.6) + 1.5;
    };

    section('Finalized examination history');
    if (!patient.encounters.length) write('No finalized examinations are available for this patient.');
    patient.encounters.forEach((encounter, index) => {
      if (y > 248) nextPage();
      pdf.setFillColor(248, 250, 252); pdf.roundedRect(15, y, 180, 10, 2, 2, 'F');
      pdf.setTextColor(...navy); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10);
      pdf.text(`Examination ${index + 1}`, 20, y + 6.3);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(...slate);
      const date = encounter.createdAt ? new Date(encounter.createdAt).toLocaleDateString() : 'Date unavailable';
      pdf.text(`${date}  •  Dr. ${encounter.doctorFirstName || ''} ${encounter.doctorLastName || ''}`.trim(), 190, y + 6.3, { align: 'right' });
      y += 14;
      field('Reason for visit', encounter.reasonForVisit);
      field('Diagnosis', (encounter.diagnoses || []).map((d: any) => `${d.title || d}${d.eye ? ` (${d.eye})` : ''}${d.notes ? ` — ${d.notes}` : ''}`));
      field('Visual acuity', encounter.visualAcuity);
      field('Tonometry', encounter.tonometry);
      field('Ocular history', encounter.ocularHistory);
      field('Systemic history', encounter.systemicHistory);
      field('Medication history', encounter.medicationHistory);
      field('Family ocular history', encounter.familyOcularHistory);
      field('Family systemic history', encounter.familySystemicHistory);
      field('Spectacles history', encounter.spectaclesHistory);
      field('Contact lens history', encounter.contactLensHistory);
      field('Lifestyle and visual demands', encounter.lifestyleDemands);
      field('Slit lamp findings', encounter.slitLampFindings);
      field('Posterior segment', encounter.posteriorSegment);
      field('Binocular vision', encounter.binocularVision);
      field('Marked discharge findings', markedDischargeData(encounter.sectionData));
      field('Treatment plan', encounter.treatmentPlanPathway);
      field('Advice and counselling', encounter.counselingAdviceGiven);
      field('Clinical addenda', encounter.addendumNotes);
      y += 3;
    });
    pdf.setDrawColor(203, 213, 225); pdf.line(15, 287, 195, 287);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(100, 116, 139);
    pdf.text('Confidential clinical record • Generated by SELIHOME', 15, 292);
    zip.file(`${clean(patient.firstName)}_${clean(patient.lastName)}-${clean(patient.mrn)}.pdf`, pdf.output('arraybuffer'));
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob); link.download = 'SELIHOME_Patient_Records.zip'; link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1_000);
}
