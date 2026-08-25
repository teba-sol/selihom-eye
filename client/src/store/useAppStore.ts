import { create } from 'zustand';
import type { Patient, Appointment } from '../data/mockData';
import {
  MOCK_PATIENTS,
  buildMockAppointments,
  getDefaultWeekStart,
} from '../data/mockData';

interface AppState {
  patients: Patient[];
  appointments: Appointment[];
  selectedDoctorId: string | null;
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  searchPatients: (query: string) => Patient[];
  addAppointment: (apt: Omit<Appointment, 'id' | 'status'>) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;
  getPatientById: (id: string) => Patient | undefined;
  getAppointmentById: (id: string) => Appointment | undefined;
  getAppointmentsForPatient: (patientId: string) => Appointment[];
  createWalkInAppointment: (patientId: string) => Appointment;
  getAppointmentsForRange: (from: Date, to: Date, doctorId?: string | null) => Appointment[];
  setSelectedDoctor: (id: string | null) => void;
  refreshAppointmentsForWeek: (weekStart: Date) => void;
}

let nextPatientId = 4281;
let nextAptId = 100;

export const useAppStore = create<AppState>((set, get) => ({
  patients: [...MOCK_PATIENTS],
  appointments: buildMockAppointments(getDefaultWeekStart()),
  selectedDoctorId: 'doc-1',

  addPatient: (patient) => {
    const id = String(nextPatientId++);
    set((s) => ({
      patients: [{ ...patient, id, isNew: true }, ...s.patients],
    }));
  },

  searchPatients: (query) => {
    const q = query.toLowerCase().trim();
    const all = get().patients;
    if (!q) return all;
    return all.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        (p.email ?? '').toLowerCase().includes(q) ||
        (p.phone ?? '').includes(q) ||
        p.id.includes(q) ||
        (p.mrn ?? '').toLowerCase().includes(q) ||
        (p.address ?? '').toLowerCase().includes(q),
    );
  },

  addAppointment: (apt) => {
    const id = `apt-${nextAptId++}`;
    set((s) => ({
      appointments: [
        ...s.appointments,
        { ...apt, id, status: 'scheduled' as const },
      ],
    }));
  },

  updateAppointment: (id, data) =>
    set((s) => ({
      appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...data } : a)),
    })),

  cancelAppointment: (id) =>
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === id ? { ...a, status: 'cancelled' as const } : a,
      ),
    })),

  getPatientById: (id) => get().patients.find((p) => p.id === id),

  getAppointmentById: (id) => get().appointments.find((a) => a.id === id),

  getAppointmentsForPatient: (patientId) =>
    get()
      .appointments.filter((a) => a.patientId === patientId && a.status !== 'cancelled')
      .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`)),

  createWalkInAppointment: (patientId) => {
    const id = `apt-${nextAptId++}`;
    const today = new Date().toISOString().split('T')[0];
    const apt: Appointment = {
      id,
      patientId,
      date: today,
      startTime: '10:00',
      endTime: '10:30',
      reason: 'Routine Eye Examination',
      status: 'in_exam',
      consentObtained: true,
      doctorId: 'doc-1',
    };
    set((s) => ({ appointments: [...s.appointments, apt] }));
    return apt;
  },

  getAppointmentsForRange: (from, to, doctorId) => {
    const fromStr = from.toISOString().split('T')[0];
    const toStr = to.toISOString().split('T')[0];
    return get().appointments.filter((a) => {
      if (a.status === 'cancelled') return false;
      if (doctorId && a.doctorId !== doctorId) return false;
      return a.date >= fromStr && a.date <= toStr;
    });
  },

  setSelectedDoctor: (id) => set({ selectedDoctorId: id }),

  refreshAppointmentsForWeek: (_weekStart) => {
    /* appointments persist across week navigation */
  },
}));
