import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TextSize } from '../enums/text-size.enum';
import { Language } from '../enums/language.enum';

export class CreateUserSettingsDto {
  @ApiProperty({ enum: Language, default: Language.ENGLISH })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  @ApiProperty({ enum: TextSize, default: TextSize.MEDIUM })
  @IsEnum(TextSize)
  @IsOptional()
  textSize?: TextSize;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  notifications?: boolean;

  @ApiProperty({ type: 'object', default: {} })
  @IsOptional()
  additionalPreferences?: Record<string, any>;
} 