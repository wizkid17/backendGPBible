import { IsEnum, IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ProgressPeriodType {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export class ProgressComparisonRequestDto {
  @ApiProperty({
    enum: ProgressPeriodType,
    default: ProgressPeriodType.WEEKLY,
    description: 'Type of progress period to compare'
  })
  @IsEnum(ProgressPeriodType)
  periodType: ProgressPeriodType = ProgressPeriodType.WEEKLY;

  @ApiProperty({
    description: 'First period ID to compare',
    required: false
  })
  @IsString()
  @IsOptional()
  firstPeriodId?: string;

  @ApiProperty({
    description: 'Second period ID to compare',
    required: false
  })
  @IsString()
  @IsOptional()
  secondPeriodId?: string;

  @ApiProperty({
    description: 'Whether to include current period in comparison',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  includeCurrentPeriod: boolean = true;
}

export class PeriodDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  startDate?: Date;

  @ApiProperty()
  endDate?: Date;

  @ApiProperty()
  month?: number;

  @ApiProperty()
  year?: number;

  @ApiProperty()
  completedOpportunities: number;

  @ApiProperty()
  assignedOpportunities: number;

  @ApiProperty()
  completionPercentage: number;

  @ApiProperty()
  isCurrentPeriod: boolean;
}

export class ProgressComparisonResponseDto {
  @ApiProperty({
    enum: ProgressPeriodType
  })
  periodType: ProgressPeriodType;

  @ApiProperty({
    type: [PeriodDetailDto],
    description: 'Available periods to select for comparison'
  })
  availablePeriods: PeriodDetailDto[];

  @ApiProperty({
    type: PeriodDetailDto,
    description: 'Details of the first selected period',
    required: false
  })
  firstPeriod?: PeriodDetailDto;

  @ApiProperty({
    type: PeriodDetailDto,
    description: 'Details of the second selected period',
    required: false
  })
  secondPeriod?: PeriodDetailDto;

  @ApiProperty({
    description: 'Progress comparison insights between periods',
    required: false
  })
  comparisonInsights?: {
    percentageChange: number;
    weeklyAverageChange?: number;
    activeDaysChange?: number;
    overallProgressChange?: number;
  };
} 