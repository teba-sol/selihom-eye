import { create } from 'zustand';
import { api } from '../lib/api';

// ── Backend data shapes ────────────────────────────────────────────────

interface ApiPatient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  grandfatherName: string | null;
  dob: string | null;
  gender: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  occupation: string | null;
  hobbies: string | null;
  isDiabetic: boolean;
  hasGlaucomaFamilyHistory: boolean;
  priorEyeSurgery: string | null;
  createdAt: string;
}

interface ApiAppointment {
  id: string;
  patientId: string;
  doctorUserId: string | null;
  scheduledDate: string;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  status: string;
  consentObtained: boolean;
  patient?: {
    id: string;
    mrn: string;
    firstName: string;
    lastName: string;
    dob: string | null;
    gender: string | null;
    phone: string;
  };
}

// ── Frontend data shapes (kept for backward compat) ────────────────────

export interface Patient {
  id: string;
  mrn?: string;
  firstName: string;
  lastName: string;
  grandfatherName?: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  phone: string;
  email: string;
  address?: string;
  isNew?: boolean;
  lastVisit?: string;
  createdAt?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  startTime: string;
  endTime?: string;
  reason: string;
  status: 'scheduled' | 'confirmed' | 'in_exam' | 'completed' | 'cancelled';
  consentObtained: boolean;
}

// ── Mappers ────────────────────────────────────────────────────────────

function mapPatient(api: ApiPatient): Patient {
  return {
    id: api.id,
    mrn: api.mrn,
    firstName: api.firstName,
    lastName: api.lastName,
    grandfatherName: api.grandfatherName || undefined,
    gender: (api.gender as Patient['gender']) || 'Other',
    dateOfBirth: api.dob || '',
    phone: api.phone,
    email: api.email || '',
    address: api.address || undefined,
    isNew: true,
    createdAt: api.createdAt,
  };
}

function mapAppointment(api: ApiAppointment): Appointment {
  const date = api.scheduledDate ? new Date(api.scheduledDate).toISOString().split('T')[0] : '';
  return {
    id: api.id,
    patientId: api.patientId,
    date,
    startTime: api.startTime || '10:00',
    endTime: api.endTime || undefined,
    reason: api.reason || 'Routine Eye Examination',
    status: mapStatus(api.status),
    consentObtained: api.consentObtained,
  };
}

function mapStatus(backend: string): Appointment['status'] {
  switch (backend) {
    case 'SCHEDULED': return 'scheduled';
    case 'CHECKED_IN': return 'confirmed';
    case 'IN_EXAM': return 'in_exam';
    case 'COMPLETED': return 'completed';
    case 'CANCELLED': return 'cancelled';
    default: return 'scheduled';
  }
}

function mapStatusToFrontend(frontend: string): string {
  switch (frontend) {
    case 'scheduled': return 'SCHEDULED';
    case 'confirmed': return 'CHECKED_IN';
    case 'in_exam': return 'IN_EXAM';
    case 'completed': return 'COMPLETED';
    case 'cancelled': return 'CANCELLED';
    default: return 'SCHEDULED';
  }
}

// ── Store ──────────────────────────────────────────────────────────────

interface AppState {
  patients: Patient[];
  appointments: Appointment[];
  loading: boolean;

  fetchPatients: (query?: string) => Promise<void>;
  fetchAppointments: (from?: string, to?: string) => Promise<void>;

  addPatient: (patient: Omit<Patient, 'id'>) => Promise<void>;
  searchPatients: (query: string) => Patient[];
  addAppointment: (apt: Omit<Appointment, 'id' | 'status'>) => Promise<string>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  getPatientById: (id: string) => Patient | undefined;
  getAppointmentsForPatient: (patientId: string) => Appointment[];
  getAppointmentsForRange: (from: Date, to: Date) => Appointment[];
}

export const useAppStore = create<AppState>((set, get) => ({
  patients: [],
  appointments: [],
  loading: false,

  fetchPatients: async (query?: string) => {
    set({ loading: true });
    try {
      const url = query ? `/patients?q=${encodeURIComponent(query)}` : '/patients';
      const data = await api.get<ApiPatient[]>(url);
      const patients = data.map(mapPatient);

      // Determine isNew: patient has no completed appointments
      const appointments = get().appointments;
      const enriched = patients.map((p) => {
        const hasCompleted = appointments.some(
          (a) => a.patientId === p.id && a.status === 'completed',
        );
        return { ...p, isNew: !hasCompleted };
      });

      set({ patients: enriched, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchAppointments: async (from?: string, to?: string) => {
    try {
      let url = '/appointments?';
      if (from) url += `from=${from}&`;
      if (to) url += `to=${to}`;
      const data = await api.get<ApiAppointment[]>(url);
      set({ appointments: data.map(mapAppointment) });
    } catch {
      // silent
    }
  },

  addPatient: async (patient) => {
    try {
      const created = await api.post<ApiPatient>('/patients', {
        mrn: patient.mrn || undefined,
        firstName: patient.firstName,
        lastName: patient.lastName,
        grandfatherName: patient.grandfatherName || undefined,
        dob: patient.dateOfBirth || null,
        gender: patient.gender || null,
        phone: patient.phone,
        email: patient.email || null,
        address: patient.address || null,
      });
      const mapped = mapPatient(created);
      mapped.isNew = true;
      set((s) => ({ patients: [mapped, ...s.patients] }));
    } catch (err) {
      console.error('Failed to create patient:', err);
      throw err;
    }
  },

  searchPatients: (query) => {
    const q = query.toLowerCase().trim();
    const all = get().patients;
    if (!q) return all;
    return all.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.mrn && p.mrn.toLowerCase().includes(q)) ||
        p.id.includes(q),
    );
  },

  addAppointment: async (apt) => {
    try {
      const created = await api.post<ApiAppointment>('/appointments', {
        patientId: apt.patientId,
        scheduledDate: apt.date,
        startTime: apt.startTime,
        reason: apt.reason,
        consentObtained: apt.consentObtained,
      });
      const mapped = mapAppointment(created);
      set((s) => ({ appointments: [...s.appointments, mapped] }));
      return mapped.id;
    } catch (err) {
      console.error('Failed to create appointment:', err);
      throw err;
    }
  },

  updateAppointment: async (id, data) => {
    if (data.status) {
      try {
        await api.patch(`/appointments/${id}/status`, {
          status: mapStatusToFrontend(data.status),
        });
      } catch (err) {
        console.error('Failed to update appointment:', err);
      }
    }
    if (data.consentObtained !== undefined) {
      try {
        await api.patch(`/appointments/${id}/consent`, {
          consentObtained: data.consentObtained,
        });
      } catch (err) {
        console.error('Failed to update consent:', err);
      }
    }
    set((s) => ({
      appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }));
  },

  cancelAppointment: async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
    }
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === id ? { ...a, status: 'cancelled' as const } : a,
      ),
    }));
  },

  getPatientById: (id) => get().patients.find((p) => p.id === id),

  getAppointmentsForPatient: (patientId) =>
    get()
      .appointments.filter((a) => a.patientId === patientId && a.status !== 'cancelled')
      .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`)),

  getAppointmentsForRange: (from, to) => {
    const fromStr = from.toISOString().split('T')[0];
    const toStr = to.toISOString().split('T')[0];
    return get().appointments.filter((a) => {
      if (a.status === 'cancelled') return false;
      return a.date >= fromStr && a.date <= toStr;
    });
  },
}));
