import { pgTable, uuid, varchar, text, timestamp, boolean, date, integer } from 'drizzle-orm/pg-core';
import { userRoleEnum, appointmentStatusEnum } from './enums';

// 1. Staff Accounts (Receptionist and Doctor)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: userRoleEnum('role').notNull(), // RECEPTIONIST or DOCTOR
  licenseNumber: varchar('license_number', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Patient Master Record
export const patients = pgTable('patients', {
  id: uuid('id').defaultRandom().primaryKey(),
  mrn: varchar('mrn', { length: 50 }).notNull().unique(), // e.g. SEL-2026-0001
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dob: date('dob'),
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

// 3. Appointments & Queue Management
export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  scheduledDate: timestamp('scheduled_date', { withTimezone: true }).notNull(),
  queueNumber: integer('queue_number'),
  status: appointmentStatusEnum('status').default('CHECKED_IN').notNull(),

  // Informed Consent Verification
  consentObtained: boolean('consent_obtained').default(false).notNull(),
  consentTimestamp: timestamp('consent_timestamp', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
