import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @IsOptional()
  mrn?: string;

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
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsString()
  @IsOptional()
  hobbies?: string;

  @IsBoolean()
  @IsOptional()
  isDiabetic?: boolean;

  @IsBoolean()
  @IsOptional()
  hasGlaucomaFamilyHistory?: boolean;

  @IsString()
  @IsOptional()
  priorEyeSurgery?: string;
}

export class UpdatePatientDto {
  @IsString() @IsOptional() firstName?: string;
  @IsString() @IsOptional() lastName?: string;
  @IsString() @IsOptional() grandfatherName?: string;
  @IsString() @IsOptional() dob?: string;
  @IsString() @IsOptional() gender?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() occupation?: string;
  @IsString() @IsOptional() hobbies?: string;
  @IsBoolean() @IsOptional() isDiabetic?: boolean;
  @IsBoolean() @IsOptional() hasGlaucomaFamilyHistory?: boolean;
  @IsString() @IsOptional() priorEyeSurgery?: string;
}
