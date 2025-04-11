import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiateEmailVerificationDto {
  @IsEmail()
  email: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    example: '123456',
    description: 'The 6-digit verification code sent to email',
  })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address to verify',
  })
  @IsEmail()
  email: string;
} 