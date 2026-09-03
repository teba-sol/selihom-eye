import type { EncounterSnapshot } from '../store/useEncounterStore';
import type { ExamHistoryEntry } from '../hooks/usePatientRecordData';
import { vaVal, vaHasData } from '../components/ExamDetails';

export interface SurgeryEntryRecord {
  id?: string;
  type: string;
  otherName: string;
  remarks: string;
  cataractDetails?: any;
  genericDetails?: any;
  eye?: string;
}

/** Best recorded distance VA for an eye (aided preferred, then unaided). */
export function bestDistVa(snap: EncounterSnapshot | null | undefined, eye: 'od' | 'os' | 'ou'): string {
  const va = snap?.visualAcuity;
  return vaVal(va, eye, 'dist', 'aided') || vaVal(va, eye, 'dist', 'unaided') || '';
}

/** Snapshot-only check for "did anything meaningful happen at this visit". */
export function snapshotHasData(snap: EncounterSnapshot | null | undefined): boolean {
  if (!snap) return false;
  if (snap.diagnoses?.length > 0) return true;
  if (vaHasData(snap.visualAcuity)) return true;
  if (snap.tonometry && (snap.tonometry.odIop || snap.tonometry.osIop)) return true;
  const ref = snap.refraction;
  if (ref && (ref.odSph || ref.osSph || ref.odVa || ref.osVa || ref.pdBinocular)) return true;
  if (snap.patientMedications?.length > 0) return true;
  if (snap.addendumNotes) return true;
  if (snap.counselingAdvice) return true;
  if (snap.treatmentPathway) return true;
  if (snap.ocularHistory?.conditions && Object.entries(snap.ocularHistory.conditions).some(([, v]: any) => v?.active)) return true;

  const sd = snap.sectionData ?? {};
  if (Object.keys(sd).length === 0) return false;
  const aaa: any = sd['action-and-advice'];
  if (aaa?.medicationName) return true;
  if (Array.isArray(aaa?.surgeries) && aaa.surgeries.length > 0) return true;
  if (aaa?.surgeryType) return true;
  if (Object.values(sd['final-spectacle-prescription']?.rx ?? {}).some((r: any) => r?.sph)) return true;
  if (sd['final-contact-lens-specification']?.clType) return true;
  if (sd['spectacle-dispensing']?.orderRef) return true;
  const refr: any = sd['referral'];
  if (refr?.referral || refr?.specialistName || refr?.urgency) return true;
  return false;
}

/**
 * A visit is meaningful for the Patient Record if it carries a completed/locked
 * status or any clinical content (either in the history row or in its snapshot).
 */
export function visitHasData(entry: ExamHistoryEntry, snap: EncounterSnapshot | null | undefined): boolean {
  if (entry.isLocked || entry.appointmentStatus === 'COMPLETED') return true;
  if (snap && snapshotHasData(snap)) return true;
  if ((entry.diagnoses ?? [])?.length > 0) return true;
  if (vaHasData(entry.visualAcuity)) return true;
  if (entry.tonometry && (entry.tonometry.odIop || entry.tonometry.osIop)) return true;
  if (entry.treatmentPlanPathway) return true;
  if (entry.addendumNotes) return true;
  return false;
}

/** Normalize a visit's surgery list from the new `surgeries` array or legacy flat fields. */
export function resolveSurgeries(snap: EncounterSnapshot | null | undefined): SurgeryEntryRecord[] {
  const a: any = snap?.sectionData?.['action-and-advice'] ?? {};
  if (Array.isArray(a?.surgeries) && a.surgeries.length > 0) {
    return a.surgeries.map((s: any) => ({
      id: s.id,
      type: s.type ?? '',
      otherName: s.otherName ?? '',
      remarks: s.remarks ?? '',
      cataractDetails: s.cataractDetails,
      genericDetails: s.genericDetails,
      eye: s.cataractDetails?.eyeToBeOperated ?? s.genericDetails?.eyeToBeOperated ?? '',
    }));
  }
  const type = a?.surgeryType ?? '';
  if (!type) return [];
  return [
    {
      type,
      otherName: a?.surgeryOther ?? '',
      remarks: a?.surgeryRemarks ?? '',
      cataractDetails: a?.cataractDetails,
      genericDetails: type === 'Other (Enter Manually)' ? a?.genericSurgeryDetails?.['Other (Enter Manually)'] : a?.genericSurgeryDetails?.[type],
      eye: a?.cataractDetails?.eyeToBeOperated ?? '',
    },
  ];
}

/** Medications recorded at a visit, including the Action & Advice prescription. */
export function getMedications(snap: EncounterSnapshot | null | undefined): Array<{
  drugName: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  targetEye?: string;
}> {
  const meds = (snap?.patientMedications ?? []).map((m: any) => ({
    drugName: m.drugName,
    dosage: m.dosage ?? '',
    frequency: m.frequency ?? '',
    route: m.route ?? '',
    targetEye: m.targetEye ?? '',
  }));
  const a: any = snap?.sectionData?.['action-and-advice'] ?? {};
  if (a?.medicationName) {
    meds.push({
      drugName: a.medicationName,
      dosage: '',
      frequency: a.medicationFreq && a.medicationFreq !== 'None' ? a.medicationFreq : '',
      route: '',
      targetEye: '',
    });
  }
  return meds;
}

/** Active allergies from any visit's systemic history (Penicillin key etc.). */
export function getActiveAllergies(snap: EncounterSnapshot | null | undefined): string[] {
  const conds: any = snap?.systemicHistory?.conditions ?? {};
  return Object.entries(conds)
    .filter(([, v]: any) => v?.active)
    .map(([k, v]: any) => (v.type ? `${v.type}${v.remarks ? ` — ${v.remarks}` : ''}` : k));
}

/** Compact label for a visit's final optical prescription, if any. */
export function opticalSummary(snap: EncounterSnapshot | null | undefined): string | null {
  if (!snap) return null;
  const fsp: any = snap.sectionData?.['final-spectacle-prescription'] ?? {};
  const rx = fsp?.rx ?? {};
  const od = rx.odDist ?? {};
  const os = rx.osDist ?? {};
  if (od.sph || os.sph) {
    const parts: string[] = [];
    const fmt = (r: any) => {
      if (!r.sph) return null;
      return `Sph ${r.sph}${r.cyl ? `, Cyl ${r.cyl}` : ''}${r.axis ? ` @ ${r.axis}` : ''}`;
    };
    if (fmt(od)) parts.push(`OD: ${fmt(od)}`);
    if (fmt(os)) parts.push(`OS: ${fmt(os)}`);
    if (fsp.ipd) parts.push(`IPD ${fsp.ipd} mm`);
    return parts.join(' · ');
  }
  const fcl: any = snap.sectionData?.['final-contact-lens-specification'] ?? {};
  if (fcl?.clType || fcl?.brand) {
    return `CL: ${[fcl.brand, fcl.clType, fcl.modality].filter(Boolean).join(' · ')}`;
  }
  const ref = snap.refraction;
  if (ref && (ref.odSph || ref.osSph)) {
    return `${ref.odSph ? `OD: ${ref.odSph}` : ''}${ref.odSph && ref.osSph ? '  ' : ''}${ref.osSph ? `OS: ${ref.osSph}` : ''}`;
  }
  return null;
}