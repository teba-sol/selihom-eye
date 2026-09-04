import type { CataractDetails } from '../features/CataractSurgeryForm';
import type { GenericSurgeryDetails } from '../features/GenericSurgeryForm';
import { DEFAULT_CATARACT_DETAILS } from '../features/CataractSurgeryForm';
import { DEFAULT_GENERIC_SURGERY_DETAILS } from '../features/GenericSurgeryForm';

export type SurgeryStatus = 'PLANNED' | 'COMPLETED' | 'CANCELLED' | 'RE-SCHEDULED';

export interface SurgeryEntry {
  id: string;
  type: string;
  otherName: string;
  remarks: string;
  status?: SurgeryStatus;
  plannedOn?: string;
  completedOn?: string;
  outcome?: string;
  cancelledReason?: string;
  cataractDetails?: CataractDetails;
  genericDetails?: GenericSurgeryDetails;
}

export const SURGERY_OPTIONS = [
  'None',
  'Cataract Surgery',
  'LASIK / PRK',
  'Trabeculectomy',
  'Vitrectomy',
  'Corneal Graft / PKP',
  'Pterygium Excision',
  'Strabismus Surgery',
  'Oculoplastic Surgery',
  'Other (Enter Manually)',
];

export const SURGERY_STATUSES: SurgeryStatus[] = [
  'PLANNED',
  'COMPLETED',
  'CANCELLED',
  'RE-SCHEDULED',
];

export const SURGERY_STATUS_LABELS: Record<SurgeryStatus, string> = {
  PLANNED: 'Planned',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  'RE-SCHEDULED': 'Re-scheduled',
};

/** Fresh deep copy of the cataract details so entries never share object references. */
export function freshCataractDetails(): CataractDetails {
  return structuredClone(DEFAULT_CATARACT_DETAILS);
}

/** Fresh deep copy of the generic surgery details so entries never share object references. */
export function freshGenericDetails(): GenericSurgeryDetails {
  return structuredClone(DEFAULT_GENERIC_SURGERY_DETAILS);
}

export function newSurgeryEntry(): SurgeryEntry {
  return {
    id: crypto.randomUUID(),
    type: '',
    otherName: '',
    remarks: '',
    status: 'PLANNED',
    plannedOn: '',
    completedOn: '',
    outcome: '',
    cancelledReason: '',
    cataractDetails: freshCataractDetails(),
    genericDetails: freshGenericDetails(),
  };
}

/** Human-readable eye resolved from the surgery's embedded details. */
export function surgeryEye(s: SurgeryEntry | { cataractDetails?: unknown; genericDetails?: unknown }): string {
  const c = s.cataractDetails as { eyeToBeOperated?: string } | undefined;
  const g = s.genericDetails as { eyeToBeOperated?: string } | undefined;
  return c?.eyeToBeOperated ?? g?.eyeToBeOperated ?? '';
}

/** True if the surgery has any non-empty clinical detail data entered. */
export function hasSurgeryDetails(s: SurgeryEntry): boolean {
  const c = s.cataractDetails;
  const g = s.genericDetails;
  if (c) {
    const { coMorbidities, intraOpComplications, postOpDay1Complications, ...scalar } = c as Record<string, unknown>;
    if (Object.values(scalar).some((v) => typeof v === 'string' && String(v).trim())) return true;
    if (Object.values(coMorbidities ?? {}).length || Object.values(intraOpComplications ?? {}).length || Object.values(postOpDay1Complications ?? {}).length) return true;
  }
  if (g) {
    const { preOpFindings, intraOpComplications, postOpFindings, ...scalar } = g as Record<string, unknown>;
    if (Object.values(scalar).some((v) => typeof v === 'string' && String(v).trim())) return true;
    if (Object.values(preOpFindings ?? {}).length || Object.values(intraOpComplications ?? {}).length || Object.values(postOpFindings ?? {}).length) return true;
  }
  return false;
}

/** Human-readable surgery date resolved from the embedded details. */
export function surgeryDate(s: SurgeryEntry | { cataractDetails?: unknown; genericDetails?: unknown }): string {
  const c = s.cataractDetails as { dateOfSurgery?: string } | undefined;
  const g = s.genericDetails as { dateOfSurgery?: string } | undefined;
  return c?.dateOfSurgery ?? g?.dateOfSurgery ?? '';
}

/** Display name for a surgery entry (Other -> typed name). */
export function surgeryTypeLabel(s: SurgeryEntry): string {
  if (s.type === 'Other (Enter Manually)') {
    return s.otherName?.trim() || 'Other';
  }
  return s.type || '—';
}

/** True if any surgery in the list is still in progress (not COMPLETED/CANCELLED). */
export function hasInProgressSurgery(list: SurgeryEntry[]): boolean {
  return list.some((s) => s.status !== 'COMPLETED' && s.status !== 'CANCELLED');
}

/**
 * Validate that a surgery has all the core basics filled before it may be
 * marked COMPLETED. Returns a list of human-readable missing-field labels
 * (empty array = valid). Resolves required fields from either the cataract or
 * generic details depending on the entry's type.
 */
export function validateSurgeryCompletion(s: SurgeryEntry): string[] {
  const missing: string[] = [];
  const cat = s.cataractDetails;
  const gen = s.genericDetails;

  const diagnosis = cat?.diagnosis ?? gen?.diagnosis ?? '';
  const eye = (cat?.eyeToBeOperated ?? gen?.eyeToBeOperated ?? '').trim();

  const preOpVaOd = cat?.preOpVaOd ?? gen?.preOpVaOd ?? '';
  const preOpVaOs = cat?.preOpVaOs ?? gen?.preOpVaOs ?? '';
  const preOpIopOd = cat?.preOpIopOd ?? gen?.preOpIopOd ?? '';
  const preOpIopOs = cat?.preOpIopOs ?? gen?.preOpIopOs ?? '';
  const preOpFindings = gen?.preOpFindings ?? {};
  const hasPreOpFinding = Object.values(preOpFindings).some(
    (r) => (r?.od ?? '').trim() || (r?.os ?? '').trim(),
  );

  const postOpVaOd = cat?.postOpDay1VaOd ?? gen?.postOpDay1VaOd ?? '';
  const postOpVaOs = cat?.postOpDay1VaOs ?? gen?.postOpDay1VaOs ?? '';
  const postOpIopOd = gen?.postOpDay1IopOd ?? '';
  const postOpIopOs = gen?.postOpDay1IopOs ?? '';
  const postOpFindings = gen?.postOpFindings ?? {};
  const hasPostOpFinding = Object.values(postOpFindings).some(
    (r) => (r?.od ?? '').trim() || (r?.os ?? '').trim(),
  );
  const postOpComplications = cat?.postOpDay1Complications ?? {};
  const hasPostOpComplication = Object.values(postOpComplications).some(
    (r) => (r?.od ?? '').trim() || (r?.os ?? '').trim(),
  );

  const dateOfSurgery = (cat?.dateOfSurgery ?? gen?.dateOfSurgery ?? '').trim();
  const surgeon = (cat?.surgeon ?? gen?.surgeon ?? '').trim();

  if (!diagnosis.trim()) missing.push('Diagnosis');
  if (!eye) missing.push('Eye to be operated');
  const hasPreOp = [preOpVaOd, preOpVaOs, preOpIopOd, preOpIopOs].some((v) => v.trim()) || hasPreOpFinding;
  if (!hasPreOp) missing.push('Pre-operative finding');
  if (!dateOfSurgery) missing.push('Date of surgery');
  if (!surgeon) missing.push('Surgeon');
  const hasPostOp = [postOpVaOd, postOpVaOs, postOpIopOd, postOpIopOs].some((v) => v.trim()) || hasPostOpFinding || hasPostOpComplication;
  if (!hasPostOp) missing.push('Post-operative finding');

  return missing;
}
