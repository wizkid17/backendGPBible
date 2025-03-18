import { IsEmail, IsString, MinLength, IsOptional, Matches, IsDateString, IsBoolean } from 'class-validator';

export class CreateAccountDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password: string;

  @IsString()
  @MinLength(8)
  confirmPassword: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  birthDate: string;

  @IsBoolean()
  acceptTerms: boolean;

  @IsString()
  @IsOptional()
  picture?: string;

  @IsString()
  verificationCode: string;
} 