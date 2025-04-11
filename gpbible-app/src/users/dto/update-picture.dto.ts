import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class UpdatePictureDto {
  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'The URL of the profile picture',
  })
  @IsString()
  @IsUrl()
  pictureUrl: string;
} 