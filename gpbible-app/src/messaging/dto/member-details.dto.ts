import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class MemberDetailsResponseDto {
  user: {
    id: string;
    name: string;
    lastName: string;
    email: string;
    profilePicture: string;
    phoneNumber: string;
    isContact: boolean;
  };
  
  membership: {
    isAdmin: boolean;
    joinedAt: Date;
  };
  
  commonGroups: Array<{
    id: string;
    name: string;
  }>;
}

export class AddCustomFieldDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @IsNotEmpty()
  @IsString()
  value: string;
} 