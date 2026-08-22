export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  phone: string;
  email: string;
  isNew?: boolean;
  lastVisit?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: 'scheduled' | 'confirmed' | 'in_exam' | 'completed' | 'cancelled';
  consentObtained: boolean;
  doctorId: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
}

export const DOCTORS: Doctor[] = [
  { id: 'doc-1', name: 'Isha Dave', email: 'isha.dave@primaryeyecare.in' },
  { id: 'doc-2', name: 'Dr. Sharma', email: 'sharma@primaryeyecare.in' },
];

export const MOCK_PATIENTS: Patient[] = [
  { id: '4280', firstName: 'Michelle', lastName: 'Obama', gender: 'Female', dateOfBirth: '1970-01-02', phone: '9821012232', email: 'michelle@obama.com', isNew: true },
  { id: '4279', firstName: 'Barrack', lastName: 'Obama', gender: 'Male', dateOfBirth: '1970-01-01', phone: '9821012232', email: 'b@obama.com', lastVisit: '2023-07-02' },
  { id: '4278', firstName: 'Madhav', lastName: 'Krishna', gender: 'Male', dateOfBirth: '2000-01-01', phone: '9821012232', email: 'madhav@example.com', lastVisit: '2023-06-15' },
  { id: '4277', firstName: 'Rian', lastName: 'Kothari', gender: 'Male', dateOfBirth: '1995-03-12', phone: '9821012233', email: 'rian@example.com', lastVisit: '2023-06-20' },
  { id: '4276', firstName: 'Maithili', lastName: 'Kapoor', gender: 'Female', dateOfBirth: '1988-07-22', phone: '9821012234', email: 'maithili@example.com', lastVisit: '2023-06-18' },
  { id: '4275', firstName: 'Ved', lastName: 'Kapur', gender: 'Male', dateOfBirth: '1992-11-05', phone: '9821012235', email: 'ved@example.com', lastVisit: '2023-06-10' },
  { id: '4274', firstName: 'Ravat', lastName: 'Kapadia', gender: 'Male', dateOfBirth: '1985-04-18', phone: '9821012236', email: 'ravat@example.com', lastVisit: '2023-06-08' },
  { id: '4273', firstName: 'Ishaan', lastName: 'Shah', gender: 'Male', dateOfBirth: '2001-09-30', phone: '9821012237', email: 'ishaan@example.com', lastVisit: '2023-06-05' },
  { id: '4272', firstName: 'Priya', lastName: 'Mehta', gender: 'Female', dateOfBirth: '1990-12-14', phone: '9821012238', email: 'priya@example.com', lastVisit: '2023-05-28' },
  { id: '4271', firstName: 'Arjun', lastName: 'Desai', gender: 'Male', dateOfBirth: '1978-06-25', phone: '9821012239', email: 'arjun@example.com', lastVisit: '2023-05-20' },
  { id: '4270', firstName: 'Sneha', lastName: 'Patel', gender: 'Female', dateOfBirth: '1993-02-08', phone: '9821012240', email: 'sneha@example.com', lastVisit: '2023-05-15' },
  { id: '4269', firstName: 'Rahul', lastName: 'Verma', gender: 'Male', dateOfBirth: '1982-08-17', phone: '9821012241', email: 'rahul@example.com', lastVisit: '2023-05-10' },
  { id: '4268', firstName: 'Ananya', lastName: 'Singh', gender: 'Female', dateOfBirth: '1997-01-29', phone: '9821012242', email: 'ananya@example.com', lastVisit: '2023-05-05' },
  { id: '4267', firstName: 'Karan', lastName: 'Malhotra', gender: 'Male', dateOfBirth: '1987-10-03', phone: '9821012243', email: 'karan@example.com', lastVisit: '2023-04-28' },
  { id: '4266', firstName: 'Divya', lastName: 'Reddy', gender: 'Female', dateOfBirth: '1994-05-19', phone: '9821012244', email: 'divya@example.com', lastVisit: '2023-04-20' },
  { id: '4265', firstName: 'Nikhil', lastName: 'Joshi', gender: 'Male', dateOfBirth: '1980-11-11', phone: '9821012245', email: 'nikhil@example.com', lastVisit: '2023-04-15' },
  { id: '4264', firstName: 'Pooja', lastName: 'Gupta', gender: 'Female', dateOfBirth: '1991-07-07', phone: '9821012246', email: 'pooja@example.com', lastVisit: '2023-04-10' },
  { id: '4263', firstName: 'Amit', lastName: 'Chopra', gender: 'Male', dateOfBirth: '1975-03-23', phone: '9821012247', email: 'amit@example.com', lastVisit: '2023-04-05' },
  { id: '4262', firstName: 'Neha', lastName: 'Agarwal', gender: 'Female', dateOfBirth: '1996-09-16', phone: '9821012248', email: 'neha@example.com', lastVisit: '2023-03-28' },
  { id: '4261', firstName: 'Vikram', lastName: 'Rao', gender: 'Male', dateOfBirth: '1983-12-01', phone: '9821012249', email: 'vikram@example.com', lastVisit: '2023-03-20' },
];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getDefaultWeekStart(): Date {
  return getMonday(new Date());
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function buildMockAppointments(weekStart: Date): Appointment[] {
  const mon = formatDate(weekStart);
  const tue = formatDate(new Date(weekStart.getTime() + 86400000));
  const thu = formatDate(new Date(weekStart.getTime() + 3 * 86400000));
  const sat = formatDate(new Date(weekStart.getTime() + 5 * 86400000));
  const sun = formatDate(new Date(weekStart.getTime() + 6 * 86400000));

  return [
    { id: 'apt-1', patientId: '4279', date: mon, startTime: '10:00', endTime: '10:30', reason: 'Routine Eye Examination', status: 'confirmed', consentObtained: true, doctorId: 'doc-1' },
    { id: 'apt-2', patientId: '4279', date: mon, startTime: '11:30', endTime: '12:30', reason: 'Follow Up Appointment', status: 'confirmed', consentObtained: true, doctorId: 'doc-1' },
    { id: 'apt-3', patientId: '4274', date: mon, startTime: '14:30', endTime: '15:00', reason: 'Routine Eye Examination', status: 'confirmed', consentObtained: true, doctorId: 'doc-1' },
    { id: 'apt-4', patientId: '4274', date: mon, startTime: '16:30', endTime: '17:00', reason: 'Routine Eye Examination', status: 'confirmed', consentObtained: true, doctorId: 'doc-1' },
    { id: 'apt-5', patientId: '4275', date: thu, startTime: '14:30', endTime: '15:00', reason: 'Routine Eye Examination', status: 'confirmed', consentObtained: true, doctorId: 'doc-1' },
    { id: 'apt-6', patientId: '4276', date: thu, startTime: '15:00', endTime: '15:30', reason: 'Routine Eye Examination', status: 'confirmed', consentObtained: true, doctorId: 'doc-1' },
    { id: 'apt-7', patientId: '4273', date: thu, startTime: '16:00', endTime: '16:30', reason: 'Routine Eye Examination', status: 'confirmed', consentObtained: true, doctorId: 'doc-1' },
    { id: 'apt-8', patientId: '4277', date: thu, startTime: '16:30', endTime: '17:00', reason: 'Routine Eye Examination', status: 'confirmed', consentObtained: true, doctorId: 'doc-1' },
    { id: 'apt-9', patientId: '4276', date: sat, startTime: '11:30', endTime: '12:00', reason: 'Routine Eye Examination', status: 'confirmed', consentObtained: true, doctorId: 'doc-1' },
    { id: 'apt-10', patientId: '4275', date: sat, startTime: '12:00', endTime: '12:30', reason: 'Routine Eye Examination', status: 'confirmed', consentObtained: true, doctorId: 'doc-1' },
    { id: 'apt-11', patientId: '4273', date: sat, startTime: '13:00', endTime: '13:30', reason: 'Routine Eye Examination', status: 'confirmed', consentObtained: true, doctorId: 'doc-1' },
    { id: 'apt-12', patientId: '4276', date: sun, startTime: '11:30', endTime: '12:00', reason: 'Routine Eye Examination', status: 'confirmed', consentObtained: true, doctorId: 'doc-1' },
    { id: 'apt-13', patientId: '4275', date: sun, startTime: '12:00', endTime: '12:30', reason: 'Routine Eye Examination', status: 'confirmed', consentObtained: true, doctorId: 'doc-1' },
    { id: 'apt-14', patientId: '4273', date: sun, startTime: '13:00', endTime: '13:30', reason: 'Routine Eye Examination', status: 'confirmed', consentObtained: true, doctorId: 'doc-1' },
    { id: 'apt-15', patientId: '4277', date: tue, startTime: '15:00', endTime: '15:30', reason: 'Follow Up Appointment', status: 'scheduled', consentObtained: false, doctorId: 'doc-1' },
  ];
}

export function formatDob(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function calcAge(dob: string): number {
  const birth = new Date(dob + 'T00:00:00');
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function formatDisplayDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
