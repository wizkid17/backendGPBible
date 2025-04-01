import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class GroupMemberDetailDto {
  @IsNotEmpty()
  @IsUUID()
  groupId: string;

  @IsNotEmpty()
  @IsUUID()
  userId: string;
}

export class UpdateGroupMemberStatusDto {
  @IsNotEmpty()
  @IsUUID()
  groupId: string;

  @IsNotEmpty()
  @IsUUID()
  userId: string;
  
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}

export class RemoveGroupMemberDto {
  @IsNotEmpty()
  @IsUUID()
  groupId: string;
  
  @IsNotEmpty()
  @IsUUID()
  userId: string;
} 