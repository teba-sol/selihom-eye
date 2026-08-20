import { pgTable, uuid, varchar, text, timestamp, boolean, decimal, date, integer } from 'drizzle-orm/pg-core';
import { clinicalEncounters } from './clinical';
import { patients, users } from './core';
import { eyeLateralityEnum, surgicalStatusEnum, referralUrgencyEnum } from './enums';

// 1. Dedicated Optical Prescription (Strictly Separate Template)
export const opticalPrescriptions = pgTable('optical_prescriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  encounterId: uuid('encounter_id').references(() => clinicalEncounters.id, { onDelete: 'cascade' }).notNull(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  prescribedByDoctorId: uuid('prescribed_by_doctor_id').references(() => users.id).notNull(),

  odSph: decimal('od_sph', { precision: 4, scale: 2 }),
  odCyl: decimal('od_cyl', { precision: 4, scale: 2 }),
  odAxis: integer('od_axis'),
  odAdd: decimal('od_add', { precision: 4, scale: 2 }),

  osSph: decimal('os_sph', { precision: 4, scale: 2 }),
  osCyl: decimal('os_cyl', { precision: 4, scale: 2 }),
  osAxis: integer('os_axis'),
  osAdd: decimal('os_add', { precision: 4, scale: 2 }),

  lensRecommendation: varchar('lens_recommendation', { length: 100 }), // Single Vision, Bifocal, Progressive, Anti-glare
  pdMm: decimal('pd_mm', { precision: 4, scale: 1 }),
  notes: text('notes'),
  pdfUrl: text('pdf_url'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Dedicated Medication Prescription (Strictly Separate Template)
export const medicationPrescriptions = pgTable('medication_prescriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  encounterId: uuid('encounter_id').references(() => clinicalEncounters.id, { onDelete: 'cascade' }).notNull(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  prescribedByDoctorId: uuid('prescribed_by_doctor_id').references(() => users.id).notNull(),

  medicationItems: text('medication_items').notNull(), // JSON string: [{drugName, dosage, frequency, route, duration, eye}]
  specialInstructions: text('special_instructions'),
  pdfUrl: text('pdf_url'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Specialist Referrals & Co-Management
export const referrals = pgTable('referrals', {
  id: uuid('id').defaultRandom().primaryKey(),
  encounterId: uuid('encounter_id').references(() => clinicalEncounters.id, { onDelete: 'cascade' }).notNull(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  referringDoctorId: uuid('referring_doctor_id').references(() => users.id).notNull(),
  targetSpecialistName: varchar('target_specialist_name', { length: 255 }).notNull(),
  targetSpecialty: varchar('target_specialty', { length: 100 }),
  urgency: referralUrgencyEnum('urgency').default('ROUTINE').notNull(),
  clinicalNotes: text('clinical_notes').notNull(),
  pdfSummaryUrl: text('pdf_summary_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
