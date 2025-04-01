import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BibleVersion } from './entities/bible-version.entity';

@Injectable()
export class BibleVersionsService {
  constructor(
    @InjectRepository(BibleVersion)
    private bibleVersionsRepository: Repository<BibleVersion>,
  ) {}

  async findAll(): Promise<BibleVersion[]> {
    return this.bibleVersionsRepository.find();
  }

  async findOne(id: string): Promise<BibleVersion> {
    return this.bibleVersionsRepository.findOne({ where: { id } });
  }

  async create(bibleVersion: Partial<BibleVersion>): Promise<BibleVersion> {
    const newBibleVersion = this.bibleVersionsRepository.create(bibleVersion);
    return this.bibleVersionsRepository.save(newBibleVersion);
  }

  async update(id: string, bibleVersion: Partial<BibleVersion>): Promise<BibleVersion> {
    await this.bibleVersionsRepository.update(id, bibleVersion);
    return this.bibleVersionsRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.bibleVersionsRepository.delete(id);
  }
} 