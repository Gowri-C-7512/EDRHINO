import { Gender } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class RegisterRequestDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class LoginRequestDTO {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class ForgotRequestDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetRequestDTO {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  newPassword!: string;
}

export class GoogleSignInDTO {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class LogoutRequestDTO {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class RefreshRequestDTO {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class ProfileRequestDTO {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  name?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  board?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  subject?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  standard?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  language?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  profile?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'gender must be male, female, or other' })
  @Transform(({ value }) => (value === '' ? undefined : value))
  gender?: Gender;
}
