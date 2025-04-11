import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsBoolean, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password for the account (minimum 6 characters)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
    required: false,
  })
  @IsString()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
    required: false,
  })
  @IsString()
  lastName?: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if user has accepted the terms and conditions',
  })
  @IsBoolean()
  termsAccepted: boolean;

  @ApiProperty({
    example: true,
    description: 'Indicates if user has accepted the privacy policy',
  })
  @IsBoolean()
  privacyAccepted: boolean;
} 