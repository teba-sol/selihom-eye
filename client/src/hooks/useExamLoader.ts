import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEncounterStore } from '../store/useEncounterStore';
import { formatAge, patientFullName } from '../lib/formatters';

function makePatient(data: any): EncounterPatient {
  const d = data?.patient;
  const name = d ? patientFullName(d) : '';
  let reason = '';
  if (data?.reasonForVisit) {
    reason =
      typeof data.reasonForVisit === 'string'
        ? data.reasonForVisit
        : data.reasonForVisit.selectedReason ?? '';
  }
  return {
    id: d?.id ?? '',
    mrn: d?.mrn ?? d?.id ?? '',
    name,
    age: formatAge(d?.dob || ''),
    gender: d?.gender ?? '',
    appointmentTime: '',
    reasonForVisit: reason,
  };
}

type EncounterPatient = {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  appointmentTime: string;
  reasonForVisit: string;
};

export function useExamLoader() {
  const { encounterId } = useParams<{ encounterId: string }>();
  const navigate = useNavigate();
  const storeEncounterId = useEncounterStore((s) => s.encounterId);
  const dataLoaded = useEncounterStore((s) => s.dataLoaded);
  const startExam = useEncounterStore((s) => s.startExam);
  const loadEncounterFromDb = useEncounterStore((s) => s.loadEncounterFromDb);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!encounterId) {
      navigate('/patients', { replace: true });
      return;
    }

    // Already hydrated for THIS encounter — nothing to do.
    if (storeEncounterId === encounterId && dataLoaded) return;

    if (inFlight.current) return;
    inFlight.current = true;

    const load = async () => {
      try {
        const { api } = await import('../lib/api');
        const data = await api.get<any>(`/clinical/encounter/${encounterId}`);
        if (!data) {
          navigate('/patients', { replace: true });
          return;
        }
        const patient = makePatient(data);
        startExam({
          encounterId,
          appointmentId: data.appointmentId ?? null,
          consentObtained: false,
          reasonForVisit: patient.reasonForVisit,
          patient,
        });
        loadEncounterFromDb(data);
        if (data.isLocked) {
          useEncounterStore.getState().markExamFinalized(encounterId);
        }
      } catch {
        navigate('/patients', { replace: true });
      } finally {
        inFlight.current = false;
      }
    };
    load();
  }, [
    encounterId,
    storeEncounterId,
    dataLoaded,
    navigate,
    startExam,
    loadEncounterFromDb,
  ]);
}
