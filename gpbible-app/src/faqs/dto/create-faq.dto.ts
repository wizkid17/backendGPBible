import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiProperty({ description: 'The question text' })
  @IsString()
  question: string;

  @ApiProperty({ description: 'The answer text' })
  @IsString()
  answer: string;

  @ApiProperty({ description: 'The order in which the FAQ should appear' })
  @IsInt()
  order: number;

  @ApiProperty({ description: 'Whether the FAQ is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'The category of the FAQ', required: false })
  @IsString()
  @IsOptional()
  category?: string;
} 