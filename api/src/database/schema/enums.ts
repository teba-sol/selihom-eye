import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'RECEPTIONIST',
  'DOCTOR',
]);

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'SCHEDULED',
  'CHECKED_IN',
  'IN_EXAM',
  'COMPLETED',
  'CANCELLED',
]);

export const surgeryStatusEnum = pgEnum('surgery_status', [
  'PLANNED',
  'COMPLETED',
  'CANCELLED',
  'RE-SCHEDULED',
]);
