// Stub types for compatibility
export interface Patient {
  id: string;
  firstName: string;
  fatherName: string;
  [key: string]: any;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  status: string;
  queueNo?: number;
  type: string;
  reason?: string;
  appointmentDate: string;
  appointmentTime?: string;
  [key: string]: any;
}

export interface PatientListResponse {
  items: Patient[];
  total: number;
}

export type Role = 'doctor' | 'nurse' | 'receptionist' | 'admin';
