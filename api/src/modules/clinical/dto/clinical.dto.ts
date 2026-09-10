import {
  IsUUID, IsNotEmpty, IsOptional, IsString, IsBoolean,
  IsArray, IsObject, IsNumber, MaxLength, IsIn, IsEnum,
} from 'class-validator';
import type {
  ReasonForVisitData, SymptomaticHistoryData, OcularHistoryData,
  SystemicHistoryData, MedicationHistoryData, FamilyHistoryData,
  SpectaclesHistoryData, ContactLensHistoryData, LifestyleDemandsData,
  VisualAcuityData, BinocularVisionData,
  SlitLampPayload, PosteriorSegmentPayload, BiometryCalculationPayload,
} from '../../../database/schema';

// ── Surgery DTOs ──────────────────────────────────────────────────────

export class UnifiedSurgeryDetailsDto {
  // Patient Info
  @IsString() @IsOptional() patientType?: 'inpatient' | 'outpatient';
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() addressZone?: string;
  @IsString() @IsOptional() addressDistrict?: string;
  @IsString() @IsOptional() addressKebele?: string;
  @IsString() @IsOptional() addressVillage?: string;
  
  // Diagnosis
  @IsString() @IsOptional() diagnosis?: string;
  @IsString() @IsOptional() diagnosisOther?: string;
  
  // Pre-Operative
  @IsString() @IsOptional() preOpVaOd?: string;
  @IsString() @IsOptional() preOpVaOs?: string;
  @IsString() @IsOptional() preOpIopOd?: string;
  @IsString() @IsOptional() preOpIopOs?: string;
  @IsString() @IsOptional() eyeToBeOperated?: string;
  @IsObject() @IsOptional() preOpFindings?: Record<string, { od: string; os: string }>;
  @IsString() @IsOptional() preOpFindingsOther?: string;
  @IsString() @IsOptional() preOpNotes?: string;
  
  // Biometry
  @IsObject() @IsOptional() biometryOd?: { k1: string; k2: string; axl: string; iol: string };
  @IsObject() @IsOptional() biometryOs?: { k1: string; k2: string; axl: string; iol: string };
  
  // BP
  @IsArray() @IsOptional() bp?: string[];
  
  // Surgical Information
  @IsString() @IsOptional() dateOfSurgery?: string;
  @IsString() @IsOptional() surgeon?: string;
  @IsObject() @IsOptional() surgicalFields?: Record<string, string>;
  
  // IOL
  @IsString() @IsOptional() iolPcOd?: string;
  @IsString() @IsOptional() iolPcOs?: string;
  @IsString() @IsOptional() iolAcOd?: string;
  @IsString() @IsOptional() iolAcOs?: string;
  @IsString() @IsOptional() iolNoOd?: string;
  @IsString() @IsOptional() iolNoOs?: string;
  
  // Intra-Op
  @IsObject() @IsOptional() intraOpComplications?: Record<string, { od: string; os: string }>;
  @IsString() @IsOptional() intraOpAction?: string;
  @IsString() @IsOptional() documentedBy?: string;
  
  // Post-Op
  @IsString() @IsOptional() postOpDay1VaOd?: string;
  @IsString() @IsOptional() postOpDay1VaOs?: string;
  @IsString() @IsOptional() postOpDay1IopOd?: string;
  @IsString() @IsOptional() postOpDay1IopOs?: string;
  @IsObject() @IsOptional() postOpFindings?: Record<string, { od: string; os: string }>;
  @IsString() @IsOptional() postOpNotes?: string;
  @IsString() @IsOptional() assessment?: string;
  @IsString() @IsOptional() plan?: string;
  
  // Custom fields
  @IsArray() @IsOptional() customPreOpLabels?: string[];
  @IsArray() @IsOptional() customPostOpLabels?: string[];
  @IsArray() @IsOptional() customIntraOpLabels?: string[];
  @IsArray() @IsOptional() customSurgicalFieldLabels?: string[];
  @IsArray() @IsOptional() customBiometryLabels?: string[];
}

export class SurgeryDto {
  @IsString() @IsNotEmpty() type!: string;
  @IsString() @IsOptional() otherName?: string;
  @IsString() @IsOptional() remarks?: string;
  @IsString() @IsOptional() @IsIn(['PLANNED', 'COMPLETED', 'CANCELLED', 'RE-SCHEDULED']) 
  status?: 'PLANNED' | 'COMPLETED' | 'CANCELLED' | 'RE-SCHEDULED';
  @IsString() @IsOptional() plannedOn?: string;
  @IsString() @IsOptional() completedOn?: string;
  @IsString() @IsOptional() outcome?: string;
  @IsString() @IsOptional() cancelledReason?: string;
  @IsBoolean() @IsOptional() showInDischarge?: boolean;
  @IsObject() @IsOptional() unifiedDetails?: UnifiedSurgeryDetailsDto;
}

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
  @IsOptional() @IsUUID() appointmentId?: string;
  @IsOptional() @IsUUID() encounterId?: string;
  @IsUUID() @IsNotEmpty() patientId!: string;

  // ── History & Symptoms ──────────────────────────────────────────────

  @IsObject() @IsOptional() reasonForVisit?: ReasonForVisitData;
  @IsArray() @IsOptional() chiefComplaints?: any[];
  @IsObject() @IsOptional() symptomaticHistory?: SymptomaticHistoryData;
  @IsObject() @IsOptional() ocularHistory?: OcularHistoryData;
  @IsObject() @IsOptional() systemicHistory?: SystemicHistoryData;
  @IsArray() @IsOptional() medicationHistory?: MedicationHistoryData;
  @IsString() @IsOptional() medicationsAndCompliance?: string;
  @IsArray() @IsOptional() familyOcularHistory?: FamilyHistoryData;
  @IsArray() @IsOptional() familySystemicHistory?: FamilyHistoryData;
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

  // ── Section data (keyed by ASIRA exam section id) ──────────────────
  // Contains surgery data under 'action-and-advice.surgeries'

  @IsObject() @IsOptional() sectionData?: Record<string, any>;
}

export class LockEncounterDto {
  @IsBoolean() lock!: boolean;
}

export class AddendumDto {
  @IsString() @IsNotEmpty() @MaxLength(10000) addendumNotes!: string;
  @IsString() @IsOptional() author?: string;
}