import { IsUUID, IsNotEmpty, IsDateString, IsIn, IsOptional, IsString, IsInt, Min } from 'class-validator';

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
  endTime?: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsInt()
  @Min(5)
  @IsOptional()
  estimatedDuration?: number;
}

export class CancelAppointmentDto {
  @IsString()
  @IsNotEmpty()
  cancellationReason!: string;
}

export class UpdateAppointmentStatusDto {
  @IsIn(['SCHEDULED', 'IN_EXAM', 'COMPLETED', 'CANCELLED'])
  status!: 'SCHEDULED' | 'IN_EXAM' | 'COMPLETED' | 'CANCELLED';
}
