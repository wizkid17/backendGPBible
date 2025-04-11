import { IsEnum, IsBoolean, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TextSize } from '../enums/text-size.enum';
import { Language } from '../enums/language.enum';

export class UpdateSettingsDto {
  @ApiProperty({ enum: Language, required: false })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  @ApiProperty({ enum: TextSize, required: false })
  @IsEnum(TextSize)
  @IsOptional()
  textSize?: TextSize;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  notifications?: boolean;

  @ApiProperty({ type: 'object', required: false })
  @IsObject()
  @IsOptional()
  additionalPreferences?: Record<string, any>;
} 