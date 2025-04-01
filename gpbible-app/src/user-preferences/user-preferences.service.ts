import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreference } from './entities/user-preference.entity';

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectRepository(UserPreference)
    private userPreferencesRepository: Repository<UserPreference>,
  ) {}

  async findAll(): Promise<UserPreference[]> {
    return this.userPreferencesRepository.find({
      relations: ['user', 'denomination', 'bibleVersion']
    });
  }

  async findOne(id: string): Promise<UserPreference> {
    return this.userPreferencesRepository.findOne({
      where: { id },
      relations: ['user', 'denomination', 'bibleVersion']
    });
  }

  async findByUserId(userId: string): Promise<UserPreference> {
    return this.userPreferencesRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'denomination', 'bibleVersion']
    });
  }

  async create(userPreference: Partial<UserPreference>): Promise<UserPreference> {
    const newUserPreference = this.userPreferencesRepository.create(userPreference);
    return this.userPreferencesRepository.save(newUserPreference);
  }

  async update(id: string, userPreference: Partial<UserPreference>): Promise<UserPreference> {
    await this.userPreferencesRepository.update(id, userPreference);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.userPreferencesRepository.delete(id);
  }
} 