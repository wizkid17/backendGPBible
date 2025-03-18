import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BibleVersionsService } from './bible-versions.service';
import { BibleVersionsController } from './bible-versions.controller';
import { BibleVersion } from './entities/bible-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BibleVersion])],
  providers: [BibleVersionsService],
  controllers: [BibleVersionsController],
  exports: [BibleVersionsService]
})
export class BibleVersionsModule {} 