import {
  IsUUID, IsOptional, IsString, IsNumber, IsArray, Matches, ValidateNested, IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RxEntryDto {
  @IsOptional()
  @Matches(/^-?\d{0,3}(\.\d{1,2})?$/, {
    message: 'sph must be a valid numeric string (e.g. -1.50)',
  })
  sph?: string;

  @IsOptional()
  @Matches(/^-?\d{0,3}(\.\d{1,2})?$/, {
    message: 'cyl must be a valid numeric string',
  })
  cyl?: string;

  @IsOptional()
  axis?: string;

  @IsOptional()
  add?: string;
}

export class OpticalRxDto {
  @ValidateNested()
  @Type(() => RxEntryDto)
  od!: RxEntryDto;

  @ValidateNested()
  @Type(() => RxEntryDto)
  os!: RxEntryDto;
}

export class UpsertOpticalOrderDto {
  @IsUUID()
  @IsOptional()
  appointmentId?: string;

  @IsUUID()
  encounterId!: string;

  @IsUUID()
  patientId!: string;

  @ValidateNested()
  @Type(() => OpticalRxDto)
  rx!: OpticalRxDto;

  @IsOptional()
  @IsString()
  lensType?: string;

  @IsOptional()
  @IsString()
  lensMaterial?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coatings?: string[];

  @IsOptional()
  @IsString()
  frameType?: string;

  @IsOptional()
  @IsString()
  frameRef?: string;

  @IsOptional()
  @IsString()
  collectionMethod?: string;

  @IsOptional()
  @IsString()
  orderRef?: string;

  @IsOptional()
  pdMm?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
