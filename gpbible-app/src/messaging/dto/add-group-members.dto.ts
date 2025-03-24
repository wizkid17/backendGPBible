import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class AddGroupMembersDto {
  @IsNotEmpty()
  @IsUUID()
  groupId: string;

  @IsArray()
  @IsUUID('all', { each: true })
  memberIds: string[];
} 