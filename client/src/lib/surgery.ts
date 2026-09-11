import type { UnifiedSurgeryDetails } from '../features/UnifiedSurgeryForm';
import { DEFAULT_UNIFIED_SURGERY_DETAILS } from '../features/UnifiedSurgeryForm';
import { todayEthiopian } from './formatters';
import { generateId } from '../utils/uuid';

export type SurgeryStatus = 'PLANNED' | 'COMPLETED' | 'CANCELLED';

export interface SurgeryListItem {
  id: string;
  encounterId: string;
  patientId: string;
  index: number;
  type: string;
  otherName: string;
  eye: string;
  dateOfSurgery: string;
  surgeon: string;
  status: SurgeryStatus;
  remarks: string | null;
  showInDischarge: boolean;
  details: {
    type?: string;
    otherName?: string;
    status?: string;
    plannedOn?: string;
    completedOn?: string;
    outcome?: string;
    cancelledReason?: string;
    unifiedDetails?: Record<string, unknown> | null;
  } | null;
  createdAt: string;
  encounterDate: string;
  patientName: string;
  mrn: string;
  doctorName: string;
}

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
  const d = structuredClone(DEFAULT_UNIFIED_SURGERY_DETAILS);
  d.dateOfSurgery = todayEthiopian();
  return d;
}

export function newSurgeryEntry(): SurgeryEntry {
  return {
    id: generateId(),
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