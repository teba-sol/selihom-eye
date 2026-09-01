import { useCallback, useEffect, useState } from 'react';
import type { EncounterSnapshot } from '../store/useEncounterStore';
import { useEncounterStore } from '../store/useEncounterStore';
import { apiEncounterToSnapshot, buildSnapshotBase } from '../lib/encounterMappers';

// Summary row returned by GET /clinical/patient/:patientId/history
export interface ExamHistoryEntry {
  id: string;
  appointmentId: string | null;
  createdAt: string;
  isLocked: boolean;
  diagnoses: any;
  treatmentPlanPathway: string | null;
  tonometry: any;
  visualAcuity: any;
  appointmentDate: string | null;
  appointmentReason: string | null;
  appointmentStatus: string | null;
  addendumNotes: string | null;
  doctor: { firstName: string; lastName: string } | null;
}

const EMPTY_PATIENT = {
  id: '',
  mrn: '',
  name: '',
  age: 0,
  gender: '',
  appointmentTime: '',
  reasonForVisit: '',
};

// DB-backed patient record data:
// - history: exam summaries for the patient (true patient.id relationship)
// - getEncounter: lazily fetches + caches the full encounter for a visit
//   (GET /clinical/encounter/:encounterId) mapped to an EncounterSnapshot
//   via the shared pure mapper, without touching the live exam store.
export function usePatientRecordData(patientId: string | null) {
  const [history, setHistory] = useState<ExamHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [encounters, setEncounters] = useState<Record<string, EncounterSnapshot>>({});
  const [encounterLoading, setEncounterLoading] = useState<Record<string, boolean>>({});

  const refresh = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const { api } = await import('../lib/api');
      const data = await api.get<any[]>(`/clinical/patient/${patientId}/history`);
      setHistory(data ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load exam history.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getEncounter = useCallback(
    async (encounterId: string): Promise<EncounterSnapshot | null> => {
      if (encounters[encounterId]) return encounters[encounterId];
      setEncounterLoading((prev) => ({ ...prev, [encounterId]: true }));
      try {
        const { api } = await import('../lib/api');
        const data = await api.get<any>(`/clinical/encounter/${encounterId}`);
        if (!data) return null;
        const base = buildSnapshotBase(EMPTY_PATIENT);
        const snapshot: EncounterSnapshot = { ...base, ...apiEncounterToSnapshot(data, base) };
        setEncounters((prev) => ({ ...prev, [encounterId]: snapshot }));
        return snapshot;
      } catch {
        return null;
      } finally {
        setEncounterLoading((prev) => ({ ...prev, [encounterId]: false }));
      }
    },
    [encounters],
  );

  // Prefers the live in-memory snapshot (current session, possibly unsaved
  // edits) and falls back to the DB-backed lazy fetch.
  const getSnapshot = useCallback(
    async (encounterId: string): Promise<EncounterSnapshot | null> => {
      const memSnap = useEncounterStore.getState().encounterSnapshots[encounterId];
      if (memSnap) return memSnap;
      return getEncounter(encounterId);
    },
    [getEncounter],
  );

  return {
    history,
    loading,
    error,
    refresh,
    getEncounter,
    getSnapshot,
    encounterLoading,
    encounters,
  };
}