import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BibleVersionsService } from './bible-versions.service';
import { BibleVersionsController } from './bible-versions.controller';
import { BibleVersion } from './entities/bible-version.entity';
import { BibleBook } from './entities/bible-book.entity';
import { BibleChapter } from './entities/bible-chapter.entity';
import { BibleVerse } from './entities/bible-verse.entity';
import { UserPreferencesModule } from '../user-preferences/user-preferences.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BibleVersion,
      BibleBook,
      BibleChapter,
      BibleVerse
    ]),
    UserPreferencesModule
  ],
  controllers: [BibleVersionsController],
  providers: [BibleVersionsService],
  exports: [BibleVersionsService]
})
export class BibleVersionsModule {} 