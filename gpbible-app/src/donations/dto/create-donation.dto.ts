import { IsNumber, IsString, IsOptional, IsBoolean, IsEmail, Min, IsEnum, Length } from 'class-validator';
import { DonationStatus } from '../entities/donation.entity';

export class CreateDonationDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @Length(3, 3)
  currency: string = 'USD';

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsEnum(DonationStatus)
  @IsOptional()
  status?: DonationStatus = DonationStatus.PENDING;

  @IsBoolean()
  @IsOptional()
  anonymousDonor?: boolean = false;

  @IsString()
  @IsOptional()
  message?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;
} 