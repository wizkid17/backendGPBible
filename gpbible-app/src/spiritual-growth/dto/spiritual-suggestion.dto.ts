import { IsString, IsOptional, IsBoolean, IsUUID, IsNumber, IsEnum } from 'class-validator';

export enum SuggestionCategory {
  PRAYER = 'prayer',
  MEDITATION = 'meditation',
  BIBLE_STUDY = 'bible_study',
  SERVICE = 'service',
  COMMUNITY = 'community',
  WORSHIP = 'worship',
  OTHER = 'other'
}

export class AskForSuggestionDto {
  @IsString()
  question: string;

  @IsString()
  @IsOptional()
  category?: SuggestionCategory;

  @IsString()
  @IsOptional()
  spiritualTheme?: string;
}

export class SpiritualSuggestionResponseDto {
  id: string;
  question: string;
  suggestion: string;
  category?: string;
  spiritualTheme?: string;
  isSaved: boolean;
  isAddedToPath: boolean;
  userRating: number;
  createdAt: Date;
}

export class UpdateSuggestionDto {
  @IsUUID()
  id: string;

  @IsBoolean()
  @IsOptional()
  isSaved?: boolean;

  @IsBoolean()
  @IsOptional()
  isAddedToPath?: boolean;

  @IsNumber()
  @IsOptional()
  userRating?: number;
}

export class ConvertSuggestionToActionDto {
  @IsUUID()
  suggestionId: string;
  
  @IsUUID()
  @IsOptional()
  spiritualPathId?: string;
  
  @IsString()
  @IsOptional()
  title?: string;
  
  @IsNumber()
  @IsOptional()
  durationMinutes?: number;
}

export class SuggestionListResponseDto {
  items: SpiritualSuggestionResponseDto[];
  totalItems: number;
  page: number;
  totalPages: number;
} 