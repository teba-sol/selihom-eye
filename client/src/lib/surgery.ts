import type { UnifiedSurgeryDetails } from '../features/UnifiedSurgeryForm';
import { DEFAULT_UNIFIED_SURGERY_DETAILS } from '../features/UnifiedSurgeryForm';

export type SurgeryStatus = 'PLANNED' | 'COMPLETED' | 'CANCELLED';

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
  unifiedDetails?: UnifiedSurgeryDetails;
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
];

export const SURGERY_STATUS_LABELS: Record<SurgeryStatus, string> = {
  PLANNED: 'Planned',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function freshUnifiedDetails(): UnifiedSurgeryDetails {
  return structuredClone(DEFAULT_UNIFIED_SURGERY_DETAILS);
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
    unifiedDetails: freshUnifiedDetails(),
  };
}

/** Display name for a surgery entry */
export function surgeryTypeLabel(s: SurgeryEntry): string {
  if (s.type === 'Other (Enter Manually)') {
    return s.otherName?.trim() || 'Other';
  }
  return s.type || '—';
}