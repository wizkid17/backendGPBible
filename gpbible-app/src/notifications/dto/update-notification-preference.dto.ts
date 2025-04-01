import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  dailyVersesEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  prayerRemindersEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  studyRemindersEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  eventNotificationsEnabled?: boolean;
} 