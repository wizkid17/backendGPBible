import { IsArray, IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum DailyDevotionTime {
  LESS_15_MIN = 'Menos de 15 minutos',
  BETWEEN_15_30_MIN = 'Entre 15-30 minutos',
  BETWEEN_30_60_MIN = 'Entre 30-60 minutos',
  MORE_60_MIN = 'Más de 60 minutos'
}

export enum PrayerFrequency {
  MULTIPLE_TIMES_DAY = 'Varias veces al día',
  ONCE_DAY = 'Una vez al día',
  FEW_TIMES_WEEK = 'Algunas veces por semana',
  ONCE_WEEK = 'Una vez por semana',
  OCCASIONALLY = 'Ocasionalmente'
}

export class CreateOnboardingResponseDto {
  @IsArray()
  @IsNotEmpty()
  appMotivations: string[];

  @IsString()
  @IsNotEmpty()
  spiritualJourney: string;

  @IsArray()
  @IsNotEmpty()
  focusAreas: string[];

  @IsArray()
  @IsNotEmpty()
  spiritualPractices: string[];

  @IsEnum(DailyDevotionTime)
  dailyDevotionTime: DailyDevotionTime;

  @IsEnum(PrayerFrequency)
  prayerFrequency: PrayerFrequency;
} 