import { useEffect, useRef } from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import { onSessionExpired, onSessionRestored, isSessionExpired } from '../lib/authExpired';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutosave(
  delayMs = 2000,
  onStatus?: (status: AutosaveStatus) => void,
) {
  const encounterId = useEncounterStore((s) => s.encounterId);
  const patientId = useEncounterStore((s) => s.patient.id);
  const isLocked = useEncounterStore((s) => s.isLocked);
  const dataLoaded = useEncounterStore((s) => s.dataLoaded);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(isSessionExpired());

  useEffect(() => {
    if (!encounterId || !patientId || isLocked) return;
    // Never autosave until persisted data has been reconciled into the store,
    // otherwise a freshly-started empty exam could overwrite existing data.
    if (!dataLoaded) return;

    const unsub = useEncounterStore.subscribe(() => {
      if (useEncounterStore.getState().isLocked) return;
      if (!useEncounterStore.getState().dataLoaded) return;
      if (pausedRef.current) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const store = useEncounterStore.getState();
        if (pausedRef.current) return;
        if (store.isLocked || !store.encounterId || !store.patient.id) return;
        if (!store.dataLoaded) return;
        onStatus?.('saving');
        store
          .saveEncounter({ toast: false })
          .then(() => onStatus?.('saved'))
          .catch(() => onStatus?.('error'));
      }, delayMs);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      unsub();
    };
  }, [encounterId, patientId, isLocked, dataLoaded, delayMs]);

  // Pause autosave while the session-expiry modal is open so we stop spamming
  // requests with a stale token. When the session is restored, flush the
  // current exam to the database and resume autosaving.
  useEffect(() => {
    const offExpired = onSessionExpired(() => {
      pausedRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    });

    const offRestored = onSessionRestored(() => {
      pausedRef.current = false;
      const store = useEncounterStore.getState();
      if (store.encounterId && store.patient.id && !store.isLocked && store.dataLoaded) {
        onStatus?.('saving');
        store.saveEncounter({ toast: false }).then(() => onStatus?.('saved')).catch(() => {});
      }
    });

    return () => {
      offExpired();
      offRestored();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoaded]);

  // Flush pending save on unmount.
  useEffect(() => () => {
    const store = useEncounterStore.getState();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      if (store.encounterId && store.patient.id && !store.isLocked && store.dataLoaded) {
        store.saveEncounter({ toast: false }).catch(() => {});
      }
    }
  }, [dataLoaded]);
}
