import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

export interface PatientAppointment {
  id: string;
  patientId: string;
  scheduledDate: string;
  startTime: string | null;
  reason: string | null;
  status: string | null;
  consentObtained: boolean | null;
}

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
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);

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

  useEffect(() => {
    if (!patientId) return;
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import('../lib/api');
        const data = await api.get<PatientAppointment[]>(`/appointments/patient/${patientId}`);
        if (!cancelled) setAppointments(data ?? []);
      } catch {
        // ignore — appointments are optional context
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  // Keeps the latest cache available between renders without forcing the
  // getEncounter callback to be recreated (and thus re-triggering effects).
  const getEncounterRef = useRef<Record<string, EncounterSnapshot | null>>({});

  const getEncounter = useCallback(
    async (encounterId: string): Promise<EncounterSnapshot | null> => {
      const cached = getEncounterRef.current[encounterId];
      if (cached) return cached;
      setEncounterLoading((prev) => ({ ...prev, [encounterId]: true }));
      try {
        const { api } = await import('../lib/api');
        const data = await api.get<any>(`/clinical/encounter/${encounterId}`);
        if (!data) return null;
        const base = buildSnapshotBase(EMPTY_PATIENT);
        const snapshot: EncounterSnapshot = { ...base, ...apiEncounterToSnapshot(data, base) };
        getEncounterRef.current[encounterId] = snapshot;
        setEncounters((prev) => ({ ...prev, [encounterId]: snapshot }));
        return snapshot;
      } catch {
        return null;
      } finally {
        setEncounterLoading((prev) => ({ ...prev, [encounterId]: false }));
      }
    },
    [],
  );

  // Eagerly fetch full snapshots for every history entry so a Patient Record
  // view can render each visit's prescriptions/medications/surgeries without
  // per-row lazy expansion. Snapshots are cached in `encounters`.
  const preloadSnapshots = useCallback(async () => {
    await Promise.all(history.map((h) => getEncounter(h.id).catch(() => null)));
  }, [history, getEncounter]);

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

  return useMemo(
    () => ({
      history,
      loading,
      error,
      refresh,
      getEncounter,
      getSnapshot,
      preloadSnapshots,
      encounterLoading,
      encounters,
      appointments,
    }),
    [
      history,
      loading,
      error,
      refresh,
      getEncounter,
      getSnapshot,
      preloadSnapshots,
      encounterLoading,
      encounters,
      appointments,
    ],
  );
}