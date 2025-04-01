import { IsEnum, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { SubscriptionType } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsUUID()
  userId: string;

  @IsEnum(SubscriptionType)
  type: SubscriptionType;

  @IsOptional()
  paymentId?: string;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;
} 