import {
  IsUUID, IsNotEmpty, IsOptional, IsString, IsBoolean,
  IsArray, IsObject, IsNumber, IsIn,
} from 'class-validator';
import type {
  SymptomItem, BinocularVisionPayload, SlitLampPayload,
  PosteriorSegmentPayload, BiometryCalculationPayload,
} from '../../../database/schema';

export class RefractionEyeInputDto {
  @IsNumber()
  @IsOptional()
  sph?: number;

  @IsNumber()
  @IsOptional()
  cyl?: number;

  @IsNumber()
  @IsOptional()
  axis?: number;

  @IsString()
  @IsOptional()
  va?: string;

  @IsNumber()
  @IsOptional()
  add?: number;
}

export class RefractionInputDto {
  @IsString()
  @IsNotEmpty()
  type!: string; // 'SUBJECTIVE', 'OBJECTIVE_RETINOSCOPY', 'PREVIOUS_RX'

  @IsObject()
  od!: RefractionEyeInputDto;

  @IsObject()
  os!: RefractionEyeInputDto;

  @IsNumber()
  @IsOptional()
  pdBinocular?: number;

  @IsNumber()
  @IsOptional()
  pdOd?: number;

  @IsNumber()
  @IsOptional()
  pdOs?: number;

  @IsNumber()
  @IsOptional()
  bvdMm?: number;

  @IsString()
  @IsOptional()
  pinholeVaOd?: string;

  @IsString()
  @IsOptional()
  pinholeVaOs?: string;
}

export class OcularCanvasInputDto {
  @IsString()
  @IsOptional()
  segmentType?: string; // 'CORNEA_ANTERIOR', 'FUNDUS_POSTERIOR'

  @IsObject()
  @IsOptional()
  odVectorData?: any;

  @IsObject()
  @IsOptional()
  osVectorData?: any;

  @IsString()
  @IsOptional()
  odImageSnapshotUrl?: string;

  @IsString()
  @IsOptional()
  osImageSnapshotUrl?: string;
}

export class UpsertClinicalEncounterDto {
  @IsUUID()
  @IsNotEmpty()
  appointmentId!: string;

  @IsUUID()
  @IsNotEmpty()
  patientId!: string;

  // Step 2 & 3: Subjective (S)
  @IsArray()
  @IsOptional()
  chiefComplaints?: SymptomItem[];

  @IsArray()
  @IsOptional()
  ocularHistory?: Array<{ condition: string; eye: string; notes?: string }>;

  @IsArray()
  @IsOptional()
  systemicHistory?: Array<{ condition: string; duration?: string; control?: string }>;

  @IsString()
  @IsOptional()
  medicationsAndCompliance?: string;

  // Step 4: Habits & Demographics
  @IsString()
  @IsOptional()
  lifestyleAndDemands?: string;

  // Step 5: Visual Acuity
  @IsObject()
  @IsOptional()
  visualAcuity?: {
    unaidedOd?: string;
    unaidedOs?: string;
    aidedOd?: string;
    aidedOs?: string;
    pinholeOd?: string;
    pinholeOs?: string;
    nearOd?: string;
    nearOs?: string;
  };

  // Step 6: Refraction Records
  @IsArray()
  @IsOptional()
  refractions?: RefractionInputDto[];

  // Step 7: Binocular Vision & Pupils
  @IsObject()
  @IsOptional()
  binocularVision?: BinocularVisionPayload;

  @IsObject()
  @IsOptional()
  pupilReflexes?: { odPerrl: boolean; osPerrl: boolean; rapd: boolean };

  // Step 8 & 9: Anterior / Posterior Segment & Canvas
  @IsObject()
  @IsOptional()
  slitLampFindings?: SlitLampPayload;

  @IsObject()
  @IsOptional()
  posteriorSegment?: PosteriorSegmentPayload;

  @IsObject()
  @IsOptional()
  canvas?: OcularCanvasInputDto;

  // Step 10: Specialized Diagnostics & Biometry
  @IsObject()
  @IsOptional()
  tonometry?: {
    odIop?: number;
    osIop?: number;
    method: 'NCT' | 'GAT' | 'ICARE';
  };

  @IsObject()
  @IsOptional()
  tearFilmWorkup?: { tbutOd?: number; tbutOs?: number; schirmerOd?: number; schirmerOs?: number };

  @IsObject()
  @IsOptional()
  biometry?: BiometryCalculationPayload;

  // Step 11: Assessment, Plan & Advice (P & E)
  @IsArray()
  @IsOptional()
  diagnoses?: Array<{ icd10Code?: string; title: string; eye: 'OD' | 'OS' | 'OU'; notes?: string }>;

  @IsString()
  @IsOptional()
  treatmentPlanPathway?: string;

  @IsString()
  @IsOptional()
  counselingAdviceGiven?: string;
}

export class LockEncounterDto {
  @IsBoolean()
  lock!: boolean;
}

export class AddendumDto {
  @IsString()
  @IsNotEmpty()
  addendumNotes!: string;
}
