import { useEffect, useRef } from 'react';
import { useEncounterStore } from '../store/useEncounterStore';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutosave(
  delayMs = 2000,
  onStatus?: (status: AutosaveStatus) => void,
) {
  const appointmentId = useEncounterStore((s) => s.appointmentId);
  const patientId = useEncounterStore((s) => s.patient.id);
  const isLocked = useEncounterStore((s) => s.isLocked);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!appointmentId || !patientId || isLocked) return;

    const unsub = useEncounterStore.subscribe(() => {
      if (useEncounterStore.getState().isLocked) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const store = useEncounterStore.getState();
        if (store.isLocked || !store.appointmentId || !store.patient.id) return;
        onStatus?.('saving');
        store
          .saveEncounter()
          .then(() => onStatus?.('saved'))
          .catch(() => onStatus?.('error'));
      }, delayMs);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      unsub();
    };
  }, [appointmentId, patientId, isLocked, delayMs]);

  // Flush pending save on unmount.
  useEffect(() => () => {
    const store = useEncounterStore.getState();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      if (store.appointmentId && store.patient.id && !store.isLocked) {
        store.saveEncounter().catch(() => {});
      }
    }
  }, []);
}