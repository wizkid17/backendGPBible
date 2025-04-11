import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class AgeConfirmationDto {
  @ApiProperty({
    example: true,
    description: 'Indicates if the user is over 16 years old',
  })
  @IsBoolean()
  isOver16: boolean;
} 