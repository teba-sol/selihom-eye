import type { EncounterSnapshot } from '../store/useEncounterStore';

export const DRAFT_PREFIX = 'encounter-draft-';
export const DRAFT_VERSION = 1;

export interface EncounterDraft {
  version: number;
  savedAt: number;
  data: EncounterSnapshot;
}

export function draftKey(encounterId: string): string {
  return `${DRAFT_PREFIX}${encounterId}`;
}

export function readDraft(encounterId: string | null | undefined): EncounterDraft | null {
  if (!encounterId) return null;
  try {
    const raw = localStorage.getItem(draftKey(encounterId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EncounterDraft;
    if (
      !parsed ||
      typeof parsed.savedAt !== 'number' ||
      typeof parsed.data !== 'object' ||
      parsed.data === null
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeDraft(encounterId: string, data: EncounterSnapshot): void {
  try {
    localStorage.setItem(
      draftKey(encounterId),
      JSON.stringify({ version: DRAFT_VERSION, savedAt: Date.now(), data }),
    );
  } catch {
    // Storage full or unavailable (private mode): the exam stays usable in memory.
  }
}

export function clearDraft(encounterId: string | null | undefined): void {
  if (!encounterId) return;
  try {
    localStorage.removeItem(draftKey(encounterId));
  } catch {
    /* noop */
  }
}

// Every persisted clinical field, in the same shape as EncounterSnapshot.
// Only these are written to / restored from the local draft — action methods
// and transient meta state are excluded.
export const SNAPSHOT_FIELDS: (keyof EncounterSnapshot)[] = [
  'appointmentId', 'encounterId', 'isLocked', 'lockedAt', 'addendumNotes',
  'patient', 'consentObtained', 'activeTab', 'dataLoaded',
  'ocularHistory', 'symptoms', 'visualAcuity', 'refraction', 'slitLamp',
  'odCanvasVectors', 'osCanvasVectors', 'systemicHistory', 'patientMedications',
  'familyOcularHistory', 'familySystemicHistory', 'spectaclesHistory',
  'contactLensHistory', 'lifestyleDemands', 'tonometry', 'diagnoses',
  'counselingAdvice', 'treatmentPathway', 'sectionData',
];

export function snapshotExamData(state: EncounterSnapshot): EncounterSnapshot {
  const snap = {} as EncounterSnapshot;
  const src = state as unknown as Record<string, unknown>;
  const dst = snap as unknown as Record<string, unknown>;
  for (const k of SNAPSHOT_FIELDS) dst[k] = src[k];
  return snap;
}