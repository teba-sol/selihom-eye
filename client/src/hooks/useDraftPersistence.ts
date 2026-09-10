import { useEffect } from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import { writeDraft, snapshotExamData } from '../lib/draft';

// Writes the full click-state snapshot to localStorage on every store change
// (synchronous, no debounce) so a browser reload can never lose work. Nothing
// is uploaded to the backend — persistence to the server is explicit "Save &
// Exit" only.
export function useDraftPersistence() {
  useEffect(() => {
    const unsub = useEncounterStore.subscribe((state) => {
      if (!state.encounterId || !state.dataLoaded || state.isLocked) return;
      writeDraft(state.encounterId, snapshotExamData(state));
    });
    return unsub;
  }, []);
}