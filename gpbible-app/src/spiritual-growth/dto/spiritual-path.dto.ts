import { IsString, IsUUID, IsOptional, IsBoolean, IsNumber, IsDateString, IsArray } from 'class-validator';

export class AskSpiritualQuestionDto {
  @IsString()
  question: string;
}

export class SpiritualQuestionResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  question: string;

  @IsString()
  response: string;

  @IsDateString()
  createdAt: string;
}

export class SpiritualSuggestionDto {
  @IsUUID()
  id: string;

  @IsString()
  text: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  category: number;

  @IsBoolean()
  isSelected?: boolean;
}

export class SpiritualPathSelectionDto {
  @IsUUID()
  suggestionId: string;

  @IsBoolean()
  isSelected: boolean;
}

export class MultipleSpiritualPathSelectionsDto {
  @IsArray()
  selections: SpiritualPathSelectionDto[];
  
  @IsBoolean()
  @IsOptional()
  isFinal?: boolean;  // Indica si es la selección final o sólo temporal
}

export class SpiritualPathSuggestionRequestDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsNumber()
  @IsOptional()
  category?: number;
}

export class SpiritualPathSuggestionResponseDto {
  @IsArray()
  suggestions: SpiritualSuggestionDto[];

  @IsString()
  @IsOptional()
  activeTab?: string;
}

export class UserSpiritualPathDto {
  @IsUUID()
  id: string;

  @IsUUID()
  suggestionId: string;

  @IsString()
  suggestionText: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  isCompleted: boolean;

  @IsBoolean()
  isFavorite: boolean;

  @IsDateString()
  @IsOptional()
  completedAt?: string;

  @IsDateString()
  @IsOptional()
  reminderTime?: string;

  @IsDateString()
  createdAt: string;
}

export class UpdateUserSpiritualPathDto {
  @IsUUID()
  id: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @IsDateString()
  @IsOptional()
  reminderTime?: string;
}

export class CancelSelectionsResponseDto {
  @IsBoolean()
  confirmed: boolean;
  
  @IsString()
  message: string;
}

export class SpiritualPathCategoryDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}

export class SpiritualPathCategorizedSuggestionsDto {
  @IsNumber()
  categoryId: number;

  @IsString()
  categoryName: string;

  @IsString()
  @IsOptional()
  categoryDescription?: string;

  @IsString()
  @IsOptional()
  categoryIcon?: string;

  @IsArray()
  suggestions: SpiritualSuggestionDto[];
}

export class SpiritualPathCategoriesResponseDto {
  @IsArray()
  categories: SpiritualPathCategoryDto[];
}

export class SpiritualPathCategorizedResponseDto {
  @IsArray()
  categorizedSuggestions: SpiritualPathCategorizedSuggestionsDto[];

  @IsString()
  @IsOptional()
  activeTab?: string;

  @IsBoolean()
  @IsOptional()
  hasSelections?: boolean;
}

export class CancelConfirmationRequestDto {
  @IsBoolean()
  confirmed: boolean;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class CancelConfirmationResponseDto {
  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;

  @IsNumber()
  @IsOptional()
  selectionCount?: number;

  @IsNumber()
  @IsOptional()
  changedSelectionCount?: number;
} 