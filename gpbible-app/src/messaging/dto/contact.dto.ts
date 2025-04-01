import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsPhoneNumber, IsString, IsUUID } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  secondName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  suffix?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, string>;
}

export class UpdateContactDto {
  @IsUUID()
  contactId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  secondName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  suffix?: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsOptional()
  customFields?: Record<string, string>;
}

export class AddExistingContactDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}

export class GetContactDetailDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}

export class CustomFieldDefinitionDto {
  @IsNotEmpty()
  @IsString()
  name: string;
} 