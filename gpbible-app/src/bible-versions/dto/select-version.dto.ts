import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectVersionDto {
  @ApiProperty({ description: 'The ID of the Bible version to select' })
  @IsString()
  @IsNotEmpty()
  versionId: string;
} 