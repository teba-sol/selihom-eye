import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, decimal, integer } from 'drizzle-orm/pg-core';
import { appointments, patients, users } from './core';

// ── Interfaces for JSONB clinical data ──────────────────────────────────

export interface ReasonForVisitData {
  selectedReason: string;
  remarks: string;
  showInDischarge: boolean;
}

export interface SymptomState {
  active: boolean;
  eye: string;
  since: string;
  frequency: string;
  severity: string;
}

export interface SymptomaticHistoryData {
  symptoms: Record<string, SymptomState>;
  remarks: string;
  showInDischarge: boolean;
}

export interface OcularConditionDetail {
  active: boolean;
  eye: string;
  date: string;
  type?: string;
  remarks: string;
  showInDischarge: boolean;
}

export interface OcularHistoryData {
  noHistoryReported: boolean;
  generalRemarks: string;
  conditions: Record<string, OcularConditionDetail>;
}

export interface SystemicConditionDetail {
  active: boolean;
  dateOfDiagnosis: string;
}

export interface SystemicHistoryData {
  noHistory: boolean;
  conditions: Record<string, SystemicConditionDetail>;
  remarks: string;
  showInDischarge: boolean;
}

export interface MedicationHistoryData {
  none: boolean;
  eyeDrops: boolean;
  tablets: boolean;
  injection: boolean;
  remarks: string;
  showInDischarge: boolean;
}

export interface FamilyHistoryData {
  noHistory: boolean;
  parent: boolean;
  sibling: boolean;
  grandparent: boolean;
  remarks: string;
  showInDischarge: boolean;
}

export interface SpectaclesHistoryData {
  none: boolean;
  singleDistance: boolean;
  singleIntermediate: boolean;
  singleNear: boolean;
  pal: boolean;
  bifocal: boolean;
  unit: string;
  odDist: { sph: string; cyl: string; axis: string; va: string };
  odNear: { add: string; va: string };
  osDist: { sph: string; cyl: string; axis: string; va: string };
  osNear: { add: string; va: string };
  remarks: string;
  showInDischarge: boolean;
}

export interface ContactLensHistoryData {
  none: boolean;
  softDaily: boolean;
  softMonthly: boolean;
  extendedWear: boolean;
  rgpHard: boolean;
  scleral: boolean;
  remarks: string;
  showInDischarge: boolean;
}

export interface LifestyleDemandsData {
  occupation: string;
  hobbies: string;
  remarks: string;
  showInDischarge: boolean;
}

export interface EyeData {
  unaided: string;
  aided: string;
  pinhole: string;
}

export interface VisionEyeData {
  dist: EyeData;
  near: EyeData;
}

export interface VisualAcuityData {
  unit: string;
  od: VisionEyeData;
  os: VisionEyeData;
  ou: VisionEyeData;
  remarks: string;
}

export interface Worth4DotData {
  distResult: string;
  nearResult: string;
  remarks: string;
  showInDischarge: boolean;
}

export interface OcularMotorBalanceDistanceData {
  testType: string;
  deviation: string;
  eye: string;
  prismDiopter: string;
  baseDirection: string;
  recovery: string;
}

export interface OcularMotorBalanceData {
  activeTab: string;
  data: Record<string, OcularMotorBalanceDistanceData>;
  remarks: string;
  showInDischarge: boolean;
}

export interface NpcData {
  breakCm: string;
  recoveryCm: string;
  remarks: string;
  showInDischarge: boolean;
}

export interface AmplitudeOfAccommodationData {
  method: string;
  aoaOd: string;
  aoaOs: string;
  aoaOu: string;
  remarks: string;
  showInDischarge: boolean;
}

export interface OcularMotilityData {
  fullAndSmooth: boolean;
  underaction: boolean;
  overaction: boolean;
  pain: boolean;
  diplopia: boolean;
  remarks: string;
  showInDischarge: boolean;
}

export interface PupilEvaluationData {
  perrl: boolean;
  sluggishDirect: boolean;
  rapd: boolean;
  remarks: string;
  showInDischarge: boolean;
}

export interface StereopsisData {
  testType: string;
  stereoArcSec: string;
  remarks: string;
  showInDischarge: boolean;
}

export interface AccommodativeLagData {
  method: string;
  lagOd: string;
  lagOs: string;
  unit: string;
  remarks: string;
  showInDischarge: boolean;
}

export interface AccommodativeFacilityData {
  method: string;
  cycPerMinOd: string;
  cycPerMinOs: string;
  cycPerMinOu: string;
  remarks: string;
  showInDischarge: boolean;
}

export interface RelativeAccommodationData {
  nraOd: string;
  nraOs: string;
  nraOu: string;
  praOd: string;
  praOs: string;
  praOu: string;
  remarks: string;
  showInDischarge: boolean;
}

export interface BinocularVisionData {
  worth4Dot: Worth4DotData;
  ocularMotorBalance: OcularMotorBalanceData;
  npc: NpcData;
  amplitudeOfAccommodation: AmplitudeOfAccommodationData;
  ocularMotility: OcularMotilityData;
  pupilEvaluation: PupilEvaluationData;
  stereopsis: StereopsisData;
  accommodativeLag: AccommodativeLagData;
  accommodativeFacility: AccommodativeFacilityData;
  relativeAccommodation: RelativeAccommodationData;
}

// ── Legacy interfaces (kept for backward compat) ────────────────────────

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

export interface SlitLampPayload {
  lidsLashes: string;
  conjunctiva: string;
  cornea: string;
  anteriorChamber: string;
  irisLens: string;
  notes?: string;
}

export interface PosteriorSegmentPayload {
  dilation: string;
  cdrOd?: number;
  cdrOs?: number;
  macula: string;
  diabeticRetinopathy: string;
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
  formulaUsed?: string;
}

// ── Table definitions ───────────────────────────────────────────────────

export const clinicalEncounters = pgTable('clinical_encounters', {
  id: uuid('id').defaultRandom().primaryKey(),
  appointmentId: uuid('appointment_id').references(() => appointments.id, { onDelete: 'cascade' }).notNull().unique(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  doctorUserId: uuid('doctor_user_id').references(() => users.id).notNull(),

  // History & Symptoms (Steps 1-4)
  reasonForVisit: jsonb('reason_for_visit').$type<ReasonForVisitData>(),
  chiefComplaints: jsonb('chief_complaints').$type<SymptomItem[]>(),
  symptomaticHistory: jsonb('symptomatic_history').$type<SymptomaticHistoryData>(),
  ocularHistory: jsonb('ocular_history').$type<OcularHistoryData>(),
  systemicHistory: jsonb('systemic_history').$type<SystemicHistoryData>(),
  medicationHistory: jsonb('medication_history').$type<MedicationHistoryData>(),
  medicationsAndCompliance: text('medications_and_compliance'),
  familyOcularHistory: jsonb('family_ocular_history').$type<FamilyHistoryData>(),
  familySystemicHistory: jsonb('family_systemic_history').$type<FamilyHistoryData>(),
  spectaclesHistory: jsonb('spectacles_history').$type<SpectaclesHistoryData>(),
  contactLensHistory: jsonb('contact_lens_history').$type<ContactLensHistoryData>(),
  lifestyleDemands: jsonb('lifestyle_demands').$type<LifestyleDemandsData>(),
  lifestyleAndDemands: text('lifestyle_and_demands'),

  // Visual Acuity (Step 5)
  visualAcuity: jsonb('visual_acuity').$type<VisualAcuityData>(),

  // Binocular Vision Assessment (Step 7)
  binocularVision: jsonb('binocular_vision').$type<BinocularVisionData>(),
  pupilReflexes: jsonb('pupil_reflexes').$type<{ odPerrl: boolean; osPerrl: boolean; rapd: boolean }>(),

  // Anterior & Posterior Segment (Steps 8-9)
  slitLampFindings: jsonb('slit_lamp_findings').$type<SlitLampPayload>(),
  posteriorSegment: jsonb('posterior_segment').$type<PosteriorSegmentPayload>(),

  // Specialized Tests (Step 10)
  tonometry: jsonb('tonometry').$type<{
    odIop?: number;
    osIop?: number;
    method: string;
    isHighIopOd: boolean;
    isHighIopOs: boolean;
  }>(),
  tearFilmWorkup: jsonb('tear_film_workup').$type<{ tbutOd?: number; tbutOs?: number; schirmerOd?: number; schirmerOs?: number }>(),
  biometry: jsonb('biometry').$type<BiometryCalculationPayload>(),

  // Assessment, Plan & Advice (Step 11)
  diagnoses: jsonb('diagnoses').$type<Array<{ icd10Code?: string; title: string; eye: string; notes?: string }>>(),
  treatmentPlanPathway: varchar('treatment_plan_pathway', { length: 100 }),
  counselingAdviceGiven: text('counseling_advice_given'),

  // Medicolegal
  isLocked: boolean('is_locked').default(false).notNull(),
  lockedAt: timestamp('locked_at', { withTimezone: true }),
  addendumNotes: text('addendum_notes'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Refraction Records Grid
export const refractionRecords = pgTable('refraction_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  encounterId: uuid('encounter_id').references(() => clinicalEncounters.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),

  odSph: decimal('od_sph', { precision: 4, scale: 2 }),
  odCyl: decimal('od_cyl', { precision: 4, scale: 2 }),
  odAxis: integer('od_axis'),
  odVa: varchar('od_va', { length: 20 }),
  odAdd: decimal('od_add', { precision: 4, scale: 2 }),

  osSph: decimal('os_sph', { precision: 4, scale: 2 }),
  osCyl: decimal('os_cyl', { precision: 4, scale: 2 }),
  osAxis: integer('os_axis'),
  osVa: varchar('os_va', { length: 20 }),
  osAdd: decimal('os_add', { precision: 4, scale: 2 }),

  pdBinocular: decimal('pd_binocular', { precision: 4, scale: 1 }),
  pdOd: decimal('pd_od', { precision: 4, scale: 1 }),
  pdOs: decimal('pd_os', { precision: 4, scale: 1 }),
  bvdMm: decimal('bvd_mm', { precision: 3, scale: 1 }),
  pinholeVaOd: varchar('pinhole_va_od', { length: 20 }),
  pinholeVaOs: varchar('pinhole_va_os', { length: 20 }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Canvas: Interactive Ocular Drawings
export const ocularCanvases = pgTable('ocular_canvases', {
  id: uuid('id').defaultRandom().primaryKey(),
  encounterId: uuid('encounter_id').references(() => clinicalEncounters.id, { onDelete: 'cascade' }).notNull(),
  segmentType: varchar('segment_type', { length: 50 }).default('CORNEA_ANTERIOR').notNull(),
  odVectorData: jsonb('od_vector_data'),
  osVectorData: jsonb('os_vector_data'),
  odImageSnapshotUrl: text('od_image_snapshot_url'),
  osImageSnapshotUrl: text('os_image_snapshot_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
