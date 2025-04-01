import { IsString, IsUUID, IsDateString, IsOptional, IsArray } from 'class-validator';

export class GroupInvitationInfoDto {
  @IsUUID()
  groupId: string;

  @IsString()
  groupName: string;

  @IsDateString()
  createdAt: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsArray()
  memberPreview: MemberPreviewDto[];

  @IsUUID()
  createdById: string;

  @IsString()
  creatorName: string;
}

export class MemberPreviewDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  picture?: string;
}

export class JoinGroupViaInviteDto {
  @IsString()
  inviteCode: string;
} 