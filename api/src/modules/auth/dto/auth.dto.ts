import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn, IsOptional, ValidateIf } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RegisterStaffDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsIn(['RECEPTIONIST', 'DOCTOR'])
  role!: 'RECEPTIONIST' | 'DOCTOR';

  @IsString()
  @IsOptional()
  licenseNumber?: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  currentPassword?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  newPassword?: string;
}
