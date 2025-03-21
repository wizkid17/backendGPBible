import { IsEnum, IsBoolean, IsOptional, IsDate, IsString } from 'class-validator';
import { SubscriptionType } from '../entities/subscription.entity';

export class UpdateSubscriptionDto {
  @IsEnum(SubscriptionType)
  @IsOptional()
  type?: SubscriptionType;

  @IsString()
  @IsOptional()
  paymentId?: string;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @IsBoolean()
  @IsOptional()
  isCancelled?: boolean;
} 