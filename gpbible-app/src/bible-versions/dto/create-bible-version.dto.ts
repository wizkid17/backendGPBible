import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBibleVersionDto {
  @ApiProperty({ description: 'The name of the Bible version' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The abbreviation of the Bible version' })
  @IsString()
  @IsNotEmpty()
  abbreviation: string;

  @ApiProperty({ description: 'The language of the Bible version' })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({ description: 'The description of the Bible version', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Whether the Bible version is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 