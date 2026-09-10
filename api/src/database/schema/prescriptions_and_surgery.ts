import { pgTable, uuid, varchar, text, timestamp, decimal, integer, jsonb, boolean } from 'drizzle-orm/pg-core';
import { clinicalEncounters } from './clinical';
import { appointments, patients, users } from './core';
import { surgeryStatusEnum } from './enums';

// 1. Dedicated Optical Prescription (Strictly Separate Template)
export const opticalPrescriptions = pgTable('optical_prescriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  encounterId: uuid('encounter_id').references(() => clinicalEncounters.id, { onDelete: 'cascade' }).notNull(),
  appointmentId: uuid('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
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
  lensType: varchar('lens_type', { length: 100 }),
  lensMaterial: varchar('lens_material', { length: 100 }),
  coatings: text('coatings').array(),
  frameType: varchar('frame_type', { length: 100 }),
  frameRef: varchar('frame_ref', { length: 100 }),
  collectionMethod: varchar('collection_method', { length: 100 }),
  orderRef: varchar('order_ref', { length: 100 }),
  status: varchar('status', { length: 32 }).notNull().default('READY_TO_DELIVER'),
  pdMm: decimal('pd_mm', { precision: 4, scale: 1 }),
  notes: text('notes'),
  pdfUrl: text('pdf_url'),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  deliveredByUserId: uuid('delivered_by_user_id').references(() => users.id, { onDelete: 'set null' }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
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

// 3. Surgical Procedures (projection of the encounter's action-and-advice surgery list)
export const surgicalProcedures = pgTable('surgical_procedures', {
  id: uuid('id').defaultRandom().primaryKey(),
  encounterId: uuid('encounter_id').references(() => clinicalEncounters.id, { onDelete: 'cascade' }).notNull(),
  appointmentId: uuid('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  doctorUserId: uuid('doctor_user_id').references(() => users.id).notNull(),

  index: integer('index').notNull().default(0),
  type: varchar('type', { length: 100 }).notNull().default(''),
  otherName: varchar('other_name', { length: 255 }).default(''),
  eye: varchar('eye', { length: 32 }).default(''),
  dateOfSurgery: varchar('date_of_surgery', { length: 50 }).default(''),
  surgeon: varchar('surgeon', { length: 255 }).default(''),
  status: surgeryStatusEnum('status').notNull().default('PLANNED'),
  details: jsonb('details').$type<Record<string, unknown> | null>(),
  remarks: text('remarks'),
  showInDischarge: boolean('show_in_discharge').notNull().default(false),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SurgicalProcedure = typeof surgicalProcedures.$inferSelect;
