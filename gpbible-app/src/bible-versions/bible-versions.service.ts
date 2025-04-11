import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BibleVersion } from './entities/bible-version.entity';
import { BibleBook } from './entities/bible-book.entity';
import { BibleChapter } from './entities/bible-chapter.entity';
import { BibleVerse } from './entities/bible-verse.entity';
import { CreateBibleVersionDto } from './dto/create-bible-version.dto';
import { UpdateBibleVersionDto } from './dto/update-bible-version.dto';
import { SelectVersionDto } from './dto/select-version.dto';
import { UserPreferencesService } from '../user-preferences/user-preferences.service';

@Injectable()
export class BibleVersionsService {
  constructor(
    @InjectRepository(BibleVersion)
    private readonly bibleVersionRepository: Repository<BibleVersion>,
    @InjectRepository(BibleBook)
    private readonly bibleBookRepository: Repository<BibleBook>,
    @InjectRepository(BibleChapter)
    private readonly bibleChapterRepository: Repository<BibleChapter>,
    @InjectRepository(BibleVerse)
    private readonly bibleVerseRepository: Repository<BibleVerse>,
    private readonly userPreferencesService: UserPreferencesService,
  ) {}

  async create(createBibleVersionDto: CreateBibleVersionDto): Promise<BibleVersion> {
    const bibleVersion = this.bibleVersionRepository.create(createBibleVersionDto);
    return await this.bibleVersionRepository.save(bibleVersion);
  }

  async findAll(): Promise<BibleVersion[]> {
    return await this.bibleVersionRepository.find();
  }

  async findOne(id: string): Promise<BibleVersion> {
    const bibleVersion = await this.bibleVersionRepository.findOne({ where: { id } });
    if (!bibleVersion) {
      throw new NotFoundException(`Bible version with ID "${id}" not found`);
    }
    return bibleVersion;
  }

  async update(id: string, updateBibleVersionDto: UpdateBibleVersionDto): Promise<BibleVersion> {
    const bibleVersion = await this.findOne(id);
    Object.assign(bibleVersion, updateBibleVersionDto);
    return await this.bibleVersionRepository.save(bibleVersion);
  }

  async remove(id: string): Promise<void> {
    const result = await this.bibleVersionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Bible version with ID "${id}" not found`);
    }
  }

  async getAllBooks(): Promise<BibleBook[]> {
    return await this.bibleBookRepository.find({
      order: { orderNumber: 'ASC' }
    });
  }

  async getBookById(id: string): Promise<BibleBook> {
    const book = await this.bibleBookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Bible book with ID "${id}" not found`);
    }
    return book;
  }

  async getChapterById(id: string): Promise<BibleChapter> {
    const chapter = await this.bibleChapterRepository.findOne({ where: { id } });
    if (!chapter) {
      throw new NotFoundException(`Bible chapter with ID "${id}" not found`);
    }
    return chapter;
  }

  async getChaptersByBookId(bookId: string): Promise<BibleChapter[]> {
    return await this.bibleChapterRepository.find({
      where: { bookId },
      order: { chapterNumber: 'ASC' }
    });
  }

  async getVersesByChapterId(chapterId: string): Promise<BibleVerse[]> {
    return await this.bibleVerseRepository.find({
      where: { chapterId },
      order: { verseNumber: 'ASC' }
    });
  }

  async getAvailableVersions(): Promise<BibleVersion[]> {
    return await this.bibleVersionRepository.find({
      order: { name: 'ASC' }
    });
  }

  async setDefaultVersion(userId: string, versionDto: SelectVersionDto): Promise<BibleVersion> {
    const version = await this.findOne(versionDto.versionId);
    await this.userPreferencesService.updateSettings(userId, {
      additionalPreferences: {
        defaultBibleVersion: version.id
      }
    });
    return version;
  }

  async getVerse(verseReference: string): Promise<BibleVerse[]> {
    // Parse the verse reference (e.g., "Juan 3:16")
    const parts = verseReference.split(' ');
    if (parts.length < 2) {
      throw new NotFoundException(`Invalid verse reference: ${verseReference}`);
    }

    const bookName = parts[0];
    const chapterVerse = parts[1].split(':');
    if (chapterVerse.length !== 2) {
      throw new NotFoundException(`Invalid chapter:verse format: ${parts[1]}`);
    }

    const chapterNumber = parseInt(chapterVerse[0], 10);
    const verseNumber = parseInt(chapterVerse[1], 10);

    // Find the book
    const book = await this.bibleBookRepository.findOne({
      where: { name: bookName }
    });

    if (!book) {
      throw new NotFoundException(`Book not found: ${bookName}`);
    }

    // Find the chapter
    const chapter = await this.bibleChapterRepository.findOne({
      where: { 
        bookId: book.id,
        chapterNumber: chapterNumber
      }
    });

    if (!chapter) {
      throw new NotFoundException(`Chapter not found: ${bookName} ${chapterNumber}`);
    }

    // Find the verse
    const verse = await this.bibleVerseRepository.findOne({
      where: { 
        chapterId: chapter.id,
        verseNumber: verseNumber
      }
    });

    if (!verse) {
      throw new NotFoundException(`Verse not found: ${verseReference}`);
    }

    return [verse];
  }
} 