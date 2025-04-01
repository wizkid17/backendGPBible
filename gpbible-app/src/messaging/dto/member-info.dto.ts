import { IsUUID, IsString, IsOptional, IsUrl, IsBoolean, IsArray, IsDate } from 'class-validator';

export class MemberInfoDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  secondName?: string;

  @IsOptional()
  @IsUrl()
  picture?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  suffix?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsBoolean()
  isGroupAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  isFaithful?: boolean;

  @IsOptional()
  @IsArray()
  customFields?: {
    key: string;
    label: string;
    value: string;
  }[];

  @IsOptional()
  @IsDate()
  joinedAt?: Date;
} 