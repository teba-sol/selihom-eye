import {
  IsUUID, IsNotEmpty, IsOptional, IsString, IsBoolean,
  IsArray, IsObject, IsNumber,
} from 'class-validator';
import type {
  ReasonForVisitData, SymptomaticHistoryData, OcularHistoryData,
  SystemicHistoryData, MedicationHistoryData, FamilyHistoryData,
  SpectaclesHistoryData, ContactLensHistoryData, LifestyleDemandsData,
  VisualAcuityData, BinocularVisionData,
  SlitLampPayload, PosteriorSegmentPayload, BiometryCalculationPayload,
} from '../../../database/schema';

// ── Refraction sub-DTOs ─────────────────────────────────────────────────

export class RefractionEyeInputDto {
  @IsNumber() @IsOptional() sph?: number;
  @IsNumber() @IsOptional() cyl?: number;
  @IsNumber() @IsOptional() axis?: number;
  @IsString() @IsOptional() va?: string;
  @IsNumber() @IsOptional() add?: number;
}

export class RefractionInputDto {
  @IsString() @IsNotEmpty() type!: string;
  @IsObject() od!: RefractionEyeInputDto;
  @IsObject() os!: RefractionEyeInputDto;
  @IsNumber() @IsOptional() pdBinocular?: number;
  @IsNumber() @IsOptional() pdOd?: number;
  @IsNumber() @IsOptional() pdOs?: number;
  @IsNumber() @IsOptional() bvdMm?: number;
  @IsString() @IsOptional() pinholeVaOd?: string;
  @IsString() @IsOptional() pinholeVaOs?: string;
}

export class OcularCanvasInputDto {
  @IsString() @IsOptional() segmentType?: string;
  @IsObject() @IsOptional() odVectorData?: any;
  @IsObject() @IsOptional() osVectorData?: any;
  @IsString() @IsOptional() odImageSnapshotUrl?: string;
  @IsString() @IsOptional() osImageSnapshotUrl?: string;
}

// ── Main Encounter DTO ──────────────────────────────────────────────────

export class UpsertClinicalEncounterDto {
  @IsUUID() @IsNotEmpty() appointmentId!: string;
  @IsUUID() @IsNotEmpty() patientId!: string;

  // ── History & Symptoms ──────────────────────────────────────────────

  @IsObject() @IsOptional() reasonForVisit?: ReasonForVisitData;
  @IsArray() @IsOptional() chiefComplaints?: any[];
  @IsObject() @IsOptional() symptomaticHistory?: SymptomaticHistoryData;
  @IsObject() @IsOptional() ocularHistory?: OcularHistoryData;
  @IsObject() @IsOptional() systemicHistory?: SystemicHistoryData;
  @IsObject() @IsOptional() medicationHistory?: MedicationHistoryData;
  @IsString() @IsOptional() medicationsAndCompliance?: string;
  @IsObject() @IsOptional() familyOcularHistory?: FamilyHistoryData;
  @IsObject() @IsOptional() familySystemicHistory?: FamilyHistoryData;
  @IsObject() @IsOptional() spectaclesHistory?: SpectaclesHistoryData;
  @IsObject() @IsOptional() contactLensHistory?: ContactLensHistoryData;
  @IsObject() @IsOptional() lifestyleDemands?: LifestyleDemandsData;
  @IsString() @IsOptional() lifestyleAndDemands?: string;

  // ── Vision & Visual Acuity ─────────────────────────────────────────

  @IsObject() @IsOptional() visualAcuity?: VisualAcuityData;

  // ── Refraction ─────────────────────────────────────────────────────

  @IsArray() @IsOptional() refractions?: RefractionInputDto[];

  // ── Binocular Vision ───────────────────────────────────────────────

  @IsObject() @IsOptional() binocularVision?: BinocularVisionData;
  @IsObject() @IsOptional() pupilReflexes?: { odPerrl: boolean; osPerrl: boolean; rapd: boolean };

  // ── Anterior & Posterior Segment ───────────────────────────────────

  @IsObject() @IsOptional() slitLampFindings?: SlitLampPayload;
  @IsObject() @IsOptional() posteriorSegment?: PosteriorSegmentPayload;
  @IsObject() @IsOptional() canvas?: OcularCanvasInputDto;

  // ── Specialized Tests ──────────────────────────────────────────────

  @IsObject() @IsOptional() tonometry?: {
    odIop?: number;
    osIop?: number;
    method: string;
  };

  @IsObject() @IsOptional() tearFilmWorkup?: { tbutOd?: number; tbutOs?: number; schirmerOd?: number; schirmerOs?: number };
  @IsObject() @IsOptional() biometry?: BiometryCalculationPayload;

  // ── Assessment, Plan & Advice ──────────────────────────────────────

  @IsArray() @IsOptional() diagnoses?: Array<{ icd10Code?: string; title: string; eye: string; notes?: string }>;
  @IsString() @IsOptional() treatmentPlanPathway?: string;
  @IsString() @IsOptional() counselingAdviceGiven?: string;
}

export class LockEncounterDto {
  @IsBoolean() lock!: boolean;
}

export class AddendumDto {
  @IsString() @IsNotEmpty() addendumNotes!: string;
}
