import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'The feedback content' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'The feedback category', required: false })
  @IsString()
  @IsOptional()
  category?: string;
} 