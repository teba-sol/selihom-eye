import { pgTable, uuid, varchar, text, timestamp, date } from 'drizzle-orm/pg-core';
import { patients } from './core';
import { users } from './core';
import { clinicalEncounters } from './clinical';

// Paper Records Registry (metadata only — no file storage).
// Tracks physical/external documents such as previous exam reports,
// referral letters, old prescriptions, or other paper records brought
// by the patient. Optional link to the clinical encounter that prompted
// the record.
export const patientDocuments = pgTable('patient_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  encounterId: uuid('encounter_id').references(() => clinicalEncounters.id, { onDelete: 'set null' }),
  documentType: varchar('document_type', { length: 100 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  documentDate: date('document_date'),
  notes: text('notes'),
  recordedBy: uuid('recorded_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});