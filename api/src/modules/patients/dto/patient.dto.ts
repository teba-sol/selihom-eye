import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  mrn!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsOptional()
  grandfatherName?: string;

  @IsString()
  @IsOptional()
  dob?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsOptional()
  address?: string;
}
