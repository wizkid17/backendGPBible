import { IsString, IsUUID, IsOptional, IsBoolean, IsNumber, IsDateString, IsArray } from 'class-validator';

export class WeeklyObjectiveDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  text: string;

  @IsDateString()
  weekStartDate: string;

  @IsDateString()
  weekEndDate: string;

  @IsUUID()
  userId: string;
}

export class UpdateWeeklyObjectiveDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsOptional()
  text?: string;
}

export class WeeklyOpportunityDto {
  @IsUUID()
  id: string;

  @IsString()
  text: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  isCompleted: boolean;

  @IsUUID()
  objectiveId: string;

  @IsNumber()
  order: number;
}

export class UpdateWeeklyOpportunityDto {
  @IsUUID()
  id: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class WeeklyPathDto {
  @IsUUID()
  objectiveId: string;

  @IsString()
  objectiveText: string;

  @IsDateString()
  weekStartDate: string;

  @IsDateString()
  weekEndDate: string;

  @IsArray()
  opportunities: WeeklyOpportunityDto[];

  @IsNumber()
  completionPercentage: number;
}

export class WeeklyPathHistoryItemDto extends WeeklyPathDto {
  @IsString()
  formattedDateRange: string;
}

export class WeekRequestDto {
  @IsDateString()
  @IsOptional()
  date?: string;
} 