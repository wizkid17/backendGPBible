import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../enums/message-type.enum';

export class CreateMessageDto {
  @ApiProperty({ description: 'The content of the message' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ enum: MessageType, default: MessageType.TEXT })
  @IsString()
  @IsNotEmpty()
  type?: MessageType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  verseReference?: string;

  @ApiProperty({ type: 'object', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
} 