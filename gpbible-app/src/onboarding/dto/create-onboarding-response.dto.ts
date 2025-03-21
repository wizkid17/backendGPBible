import { IsArray, IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional } from 'class-validator';

export enum DailyDevotionTime {
  LESS_15_MIN = 'Menos de 15 minutos',
  BETWEEN_15_30_MIN = 'Entre 15-30 minutos',
  BETWEEN_30_60_MIN = 'Entre 30-60 minutos',
  MORE_60_MIN = 'Más de 60 minutos'
}

export enum PrayerFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  OCCASIONALLY = 'occasionally',
  RARELY = 'rarely'
}

export enum DedicationTime {
  FIVE_MIN = '5min',
  FIFTEEN_MIN = '15min',
  THIRTY_MIN = '30min',
  HOUR_PLUS = '60min+'
}

export enum StudyMethod {
  DAILY_VERSES = 'Versículos diarios',
  BIBLE_STUDIES = 'Estudios bíblicos',
  GUIDED_PLANS = 'Planes de lectura guiados',
  TOPICAL_STUDIES = 'Estudios temáticos'
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
  
  @IsEnum(DedicationTime)
  dedicationTime: DedicationTime;
  
  @IsArray()
  preferredStudyMethods: StudyMethod[];
  
  @IsBoolean()
  @IsOptional()
  wantsProgressTracking: boolean = false;
  
  @IsBoolean()
  @IsOptional()
  wantsPersonalizedRecommendations: boolean = false;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  selectedAvatarId?: string;

  @IsBoolean()
  @IsOptional()
  onboardingCompleted: boolean = false;

  @IsBoolean()
  @IsOptional()
  wantsTour: boolean = true;
} 