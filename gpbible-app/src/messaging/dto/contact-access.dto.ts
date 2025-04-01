import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ContactAccessPermissionDto {
  @IsNotEmpty()
  @IsBoolean()
  allow: boolean;
}

export class ContactAccessStatusDto {
  hasRequestedAccess: boolean;
  hasPermission: boolean;
  contactCount: number;
} 