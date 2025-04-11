import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user requesting password reset',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ConfirmResetPasswordDto {
  @ApiProperty({
    example: 'newPassword123',
    description: 'The new password',
  })
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({
    example: 'token123',
    description: 'The reset password token received via email',
  })
  @IsNotEmpty()
  token: string;
} 