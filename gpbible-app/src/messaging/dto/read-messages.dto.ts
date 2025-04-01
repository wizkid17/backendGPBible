import { IsArray, IsUUID } from 'class-validator';

export class ReadMessagesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  messageIds: string[];
} 