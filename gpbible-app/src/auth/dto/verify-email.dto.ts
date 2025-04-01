import { IsEmail, IsString, Length } from 'class-validator';

export class InitiateEmailVerificationDto {
  @IsEmail()
  email: string;
}

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(5, 5)
  code: string;
} 