import { IsString, IsUUID, IsEnum, IsBoolean, IsOptional } from 'class-validator';

export enum ChatType {
  CONVERSATION = 'conversation',
  GROUP = 'group'
}

export enum ReportReason {
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  FALSE_INFORMATION = 'false_information',
  OTHER = 'other'
}

export class ChatActionDto {
  @IsUUID()
  chatId: string;

  @IsEnum(ChatType)
  chatType: ChatType;
}

export class ChatDeleteConfirmationDto extends ChatActionDto {
  @IsBoolean()
  confirmed: boolean;
}

export class LeaveGroupDto {
  @IsUUID()
  groupId: string;

  @IsBoolean()
  confirmed: boolean;
}

export class ReportGroupDto {
  @IsUUID()
  groupId: string;

  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsString()
  @IsOptional()
  details?: string;
}

export class ChatDeletePermissionResponse {
  canDelete: boolean;
  isAdmin?: boolean;
  message?: string;
} 