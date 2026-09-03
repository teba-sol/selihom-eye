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
