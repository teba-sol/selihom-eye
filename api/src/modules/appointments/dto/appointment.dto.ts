import { IsUUID, IsNotEmpty, IsDateString, IsIn, IsBoolean, IsOptional, IsString } from 'class-validator';

export class BookAppointmentDto {
  @IsUUID()
  @IsNotEmpty()
  patientId!: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledDate!: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsBoolean()
  @IsOptional()
  consentObtained?: boolean;
}

export class UpdateAppointmentStatusDto {
  @IsIn(['SCHEDULED', 'CHECKED_IN', 'IN_EXAM', 'COMPLETED', 'CANCELLED'])
  status!: 'SCHEDULED' | 'CHECKED_IN' | 'IN_EXAM' | 'COMPLETED' | 'CANCELLED';
}

export class UpdateConsentDto {
  @IsBoolean()
  consentObtained!: boolean;
}
