import { pgTable, uuid, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { userRoleEnum, appointmentStatusEnum } from './enums';
import { clinicalEncounters } from './clinical';

// 1. Staff Accounts (Receptionist and Doctor)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: userRoleEnum('role').notNull(), // RECEPTIONIST or DOCTOR
  licenseNumber: varchar('license_number', { length: 100 }),
  refreshToken: text('refresh_token'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Patient Master Record
export const patients = pgTable('patients', {
  id: uuid('id').defaultRandom().primaryKey(),
  mrn: varchar('mrn', { length: 50 }).notNull().unique(), // e.g. SEL-2026-0001
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  grandfatherName: varchar('grandfather_name', { length: 100 }),
  dob: varchar('dob', { length: 50 }),
  gender: varchar('gender', { length: 20 }),
  phone: varchar('phone', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }),
  address: text('address'),
  occupation: varchar('occupation', { length: 100 }),
  hobbies: text('hobbies'),

  // Specific Ocular & Systemic Risk Flags
  isDiabetic: boolean('is_diabetic').default(false).notNull(),
  hasGlaucomaFamilyHistory: boolean('has_glaucoma_family_history').default(false).notNull(),
  priorEyeSurgery: text('prior_eye_surgery'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Appointments
export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  doctorUserId: uuid('doctor_user_id').references(() => users.id),
  scheduledDate: timestamp('scheduled_date', { withTimezone: true }).notNull(),
  startTime: varchar('start_time', { length: 10 }),
  endTime: varchar('end_time', { length: 10 }),
  reason: varchar('reason', { length: 255 }),
  status: appointmentStatusEnum('status').default('SCHEDULED').notNull(),

  // Cancellation audit trail
  cancelledBy: uuid('cancelled_by').references(() => users.id),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancellationReason: text('cancellation_reason'),

  // Optional metadata
  notes: text('notes'),
  estimatedDuration: integer('estimated_duration').default(30),
  sourceEncounterId: uuid('source_encounter_id').references(() => clinicalEncounters.id),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
