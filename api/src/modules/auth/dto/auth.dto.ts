import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn, IsOptional, ValidateIf } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
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
