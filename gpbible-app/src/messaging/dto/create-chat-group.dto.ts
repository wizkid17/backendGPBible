import { IsArray, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatGroupDto {
  @ApiProperty({ description: 'Group name', example: 'Bible Study Group' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: 'Group description', example: 'A group for studying the Bible together', required: false })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ description: 'Array of user IDs to add as members', example: ['user-id-1', 'user-id-2'], type: [String] })
  @IsArray()
  @IsOptional()
  memberIds?: string[];
} 