import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, decimal, integer } from 'drizzle-orm/pg-core';
import { appointments, patients, users } from './core';
import { eyeLateralityEnum, referralUrgencyEnum } from './enums';

// Strongly typed interfaces for JSONB clinical data
export interface SymptomItem {
  id: string;
  name: string;
  eye: 'OD' | 'OS' | 'OU';
  durationValue: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  frequency: 'constant' | 'intermittent' | 'morning' | 'evening' | 'near_work';
  severity: 'mild' | 'moderate' | 'severe';
  remarks?: string;
}

export interface BinocularVisionPayload {
  suppression: 'none' | 'od' | 'os' | 'alternating';
  phoriaDistance?: string;
  phoriaNear?: string;
  npcCm?: number;
  motility: 'full_smooth' | 'restricted';
}

export interface SlitLampPayload {
  lidsLashes: 'normal' | 'blepharitis' | 'mgd' | 'trichiasis';
  conjunctiva: 'normal' | 'hyperemia' | 'follicles' | 'papillae';
  cornea: 'clear' | 'scar' | 'epithelial_defect' | 'edema' | 'pterygium';
  anteriorChamber: 'quiet_deep' | 'shallow' | 'cells_flare';
  irisLens: 'normal' | 'coloboma' | 'cataract';
  notes?: string;
}

export interface PosteriorSegmentPayload {
  dilation: 'undilated' | 'dilated';
  cdrOd?: number;
  cdrOs?: number;
  macula: 'normal' | 'drusen' | 'edema' | 'hole';
  diabeticRetinopathy: 'no_dr' | 'mild_npdr' | 'mod_npdr' | 'severe_npdr' | 'pdr';
  notes?: string;
}

export interface BiometryCalculationPayload {
  axialLengthOdMm?: number;
  axialLengthOsMm?: number;
  k1Od?: number;
  k2Od?: number;
  k1Os?: number;
  k2Os?: number;
  recommendedIolPowerOd?: number;
  recommendedIolPowerOs?: number;
  formulaUsed?: string; // SRK/T, Hoffer Q, Barrett Universal II
}

export const clinicalEncounters = pgTable('clinical_encounters', {
  id: uuid('id').defaultRandom().primaryKey(),
  appointmentId: uuid('appointment_id').references(() => appointments.id, { onDelete: 'cascade' }).notNull().unique(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  doctorUserId: uuid('doctor_user_id').references(() => users.id).notNull(),

  // Step 2 & 3: Subjective History (S)
  chiefComplaints: jsonb('chief_complaints').$type<SymptomItem[]>(),
  ocularHistory: jsonb('ocular_history').$type<Array<{ condition: string; eye: string; notes?: string }>>(),
  systemicHistory: jsonb('systemic_history').$type<Array<{ condition: string; duration?: string; control?: string }>>(),
  medicationsAndCompliance: text('medications_and_compliance'),

  // Step 4: Habits & Demographics
  lifestyleAndDemands: text('lifestyle_and_demands'),

  // Step 5: Visual Acuity (OD / OS strictly independent)
  visualAcuity: jsonb('visual_acuity').$type<{
    unaidedOd?: string;
    unaidedOs?: string;
    aidedOd?: string;
    aidedOs?: string;
    pinholeOd?: string;
    pinholeOs?: string;
    nearOd?: string;
    nearOs?: string;
  }>(),

  // Step 7: Binocular Vision & Motility
  binocularVision: jsonb('binocular_vision').$type<BinocularVisionPayload>(),
  pupilReflexes: jsonb('pupil_reflexes').$type<{ odPerrl: boolean; osPerrl: boolean; rapd: boolean }>(),

  // Step 8 & 9: Anterior & Posterior Segment
  slitLampFindings: jsonb('slit_lamp_findings').$type<SlitLampPayload>(),
  posteriorSegment: jsonb('posterior_segment').$type<PosteriorSegmentPayload>(),

  // Step 10: Specialized Tests & Cataract Biometry
  tonometry: jsonb('tonometry').$type<{
    odIop?: number;
    osIop?: number;
    method: 'NCT' | 'GAT' | 'ICARE';
    isHighIopOd: boolean; // Flag if > 21 mmHg
    isHighIopOs: boolean;
  }>(),
  tearFilmWorkup: jsonb('tear_film_workup').$type<{ tbutOd?: number; tbutOs?: number; schirmerOd?: number; schirmerOs?: number }>(),
  biometry: jsonb('biometry').$type<BiometryCalculationPayload>(),

  // Step 11: Assessment, Plan & Advice (P & E)
  diagnoses: jsonb('diagnoses').$type<Array<{ icd10Code?: string; title: string; eye: 'OD' | 'OS' | 'OU'; notes?: string }>>(),
  treatmentPlanPathway: varchar('treatment_plan_pathway', { length: 100 }), // 'MEDICATION', 'OPTICAL', 'SURGERY', 'COMBINED'
  counselingAdviceGiven: text('counseling_advice_given'), // Medicolegal verbal advice record

  // Medicolegal Immutability & Addendums
  isLocked: boolean('is_locked').default(false).notNull(),
  lockedAt: timestamp('locked_at', { withTimezone: true }),
  addendumNotes: text('addendum_notes'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Step 6: Refraction Records Grid
export const refractionRecords = pgTable('refraction_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  encounterId: uuid('encounter_id').references(() => clinicalEncounters.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'SUBJECTIVE', 'OBJECTIVE_RETINOSCOPY', 'PREVIOUS_RX'

  // OD (Right)
  odSph: decimal('od_sph', { precision: 4, scale: 2 }),
  odCyl: decimal('od_cyl', { precision: 4, scale: 2 }),
  odAxis: integer('od_axis'),
  odVa: varchar('od_va', { length: 20 }),
  odAdd: decimal('od_add', { precision: 4, scale: 2 }),

  // OS (Left)
  osSph: decimal('os_sph', { precision: 4, scale: 2 }),
  osCyl: decimal('os_cyl', { precision: 4, scale: 2 }),
  osAxis: integer('os_axis'),
  osVa: varchar('os_va', { length: 20 }),
  osAdd: decimal('os_add', { precision: 4, scale: 2 }),

  // Constants
  pdBinocular: decimal('pd_binocular', { precision: 4, scale: 1 }),
  pdOd: decimal('pd_od', { precision: 4, scale: 1 }),
  pdOs: decimal('pd_os', { precision: 4, scale: 1 }),
  bvdMm: decimal('bvd_mm', { precision: 3, scale: 1 }),
  pinholeVaOd: varchar('pinhole_va_od', { length: 20 }),
  pinholeVaOs: varchar('pinhole_va_os', { length: 20 }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Step 8 Canvas: Interactive Ocular Drawings
export const ocularCanvases = pgTable('ocular_canvases', {
  id: uuid('id').defaultRandom().primaryKey(),
  encounterId: uuid('encounter_id').references(() => clinicalEncounters.id, { onDelete: 'cascade' }).notNull(),
  segmentType: varchar('segment_type', { length: 50 }).default('CORNEA_ANTERIOR').notNull(),
  odVectorData: jsonb('od_vector_data'), // Fabric.js path JSON
  osVectorData: jsonb('os_vector_data'),
  odImageSnapshotUrl: text('od_image_snapshot_url'),
  osImageSnapshotUrl: text('os_image_snapshot_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
