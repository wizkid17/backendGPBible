import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  memberIds?: string[];
} 