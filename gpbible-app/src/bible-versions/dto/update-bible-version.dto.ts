import { PartialType } from '@nestjs/swagger';
import { CreateBibleVersionDto } from './create-bible-version.dto';

export class UpdateBibleVersionDto extends PartialType(CreateBibleVersionDto) {} 