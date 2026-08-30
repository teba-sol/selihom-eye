import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useEncounterStore } from '../store/useEncounterStore';
import { calcAge } from '../lib/formatters';
import { buildAppointmentTime } from '../lib/encounterDefaults';

export function useExamLoader() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const appointments = useAppStore((s) => s.appointments);
  const getPatientById = useAppStore((s) => s.getPatientById);
  const loadFromAppointment = useEncounterStore((s) => s.loadFromAppointment);
  const loadEncounterFromDb = useEncounterStore((s) => s.loadEncounterFromDb);
  const storeAppointmentId = useEncounterStore((s) => s.appointmentId);
  const patientName = useEncounterStore((s) => s.patient.name);

  useEffect(() => {
    if (!appointmentId) {
      navigate('/appointments', { replace: true });
      return;
    }

    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt || apt.status === 'cancelled') {
      navigate('/appointments', { replace: true });
      return;
    }

    const patient = getPatientById(apt.patientId);
    if (!patient) {
      navigate('/appointments', { replace: true });
      return;
    }

    if (storeAppointmentId === appointmentId && patientName) return;

    loadFromAppointment({
      appointmentId,
      consentObtained: apt.consentObtained,
      reasonForVisit: apt.reason,
      patient: {
        id: patient.id,
        mrn: patient.mrn || patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        age: calcAge(patient.dateOfBirth),
        gender: patient.gender,
        appointmentTime: buildAppointmentTime(apt.date, apt.startTime),
        reasonForVisit: apt.reason,
      },
    });
  }, [
    appointmentId,
    appointments,
    getPatientById,
    loadFromAppointment,
    navigate,
    storeAppointmentId,
    patientName,
  ]);

  useEffect(() => {
    if (!appointmentId || storeAppointmentId !== appointmentId) return;

    const loadSaved = async () => {
      try {
        const { api } = await import('../lib/api');
        const data = await api.get<any>(`/clinical/appointment/${appointmentId}`);
        if (data) {
          loadEncounterFromDb(data);
        }
        // Completed appointments are always read-only, even if the lock
        // flag wasn't written (legacy records). Mirror that in the store.
        const apt = useAppStore.getState().appointments.find((a) => a.id === appointmentId);
        if (apt?.status === 'completed') {
          const st = useEncounterStore.getState();
          const eid = st.encounterId ?? data?.id ?? null;
          if (eid && !st.isLocked) useEncounterStore.getState().markExamFinalized(eid);
        }
      } catch {
        // No saved encounter — that's fine
      }
    };
    loadSaved();
  }, [appointmentId, storeAppointmentId]);
}
