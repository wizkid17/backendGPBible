import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export enum SharePlatform {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
  COPY_LINK = 'copy_link',
}

export class ShareGroupDto {
  @IsNotEmpty()
  @IsUUID()
  groupId: string;
  
  @IsNotEmpty()
  @IsEnum(SharePlatform)
  platform: SharePlatform;
  
  @IsOptional()
  @IsString()
  message?: string;
} 