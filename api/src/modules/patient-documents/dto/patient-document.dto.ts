import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreatePatientDocumentDto {
  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  documentDate?: string | null;

  @IsString()
  @IsOptional()
  notes?: string | null;

  @IsUUID()
  @IsOptional()
  encounterId?: string | null;
}