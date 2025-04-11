import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from './entities/user-settings.entity';
import { CreateUserSettingsDto } from './dto/create-user-settings.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { TextSize } from './enums/text-size.enum';
import { Language } from './enums/language.enum';

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly userSettingsRepository: Repository<UserSettings>,
  ) {}

  async getSettings(userId: string): Promise<UserSettings> {
    const settings = await this.userSettingsRepository.findOne({
      where: { userId }
    });

    if (!settings) {
      // Si no existen configuraciones, crear unas por defecto
      return this.createDefaultSettings(userId);
    }

    // Asegurarse de que additionalPreferences sea un objeto
    if (!settings.additionalPreferences) {
      settings.additionalPreferences = {};
      await this.userSettingsRepository.save(settings);
    }

    return settings;
  }

  async updateSettings(userId: string, updateDto: UpdateUserSettingsDto): Promise<UserSettings> {
    let settings = await this.getSettings(userId);

    // Actualizar solo los campos proporcionados
    Object.assign(settings, updateDto);

    return this.userSettingsRepository.save(settings);
  }

  async updateTextSize(userId: string, textSize: TextSize): Promise<UserSettings> {
    const settings = await this.getSettings(userId);
    settings.textSize = textSize;
    return this.userSettingsRepository.save(settings);
  }

  async updateLanguage(userId: string, language: Language): Promise<UserSettings> {
    const settings = await this.getSettings(userId);
    settings.language = language;
    return this.userSettingsRepository.save(settings);
  }

  async updateNotifications(userId: string, notifications: boolean): Promise<UserSettings> {
    const settings = await this.getSettings(userId);
    settings.notifications = notifications;
    return this.userSettingsRepository.save(settings);
  }

  async resetSettings(userId: string): Promise<UserSettings> {
    await this.userSettingsRepository.delete({ userId });
    return this.createDefaultSettings(userId);
  }

  private async createDefaultSettings(userId: string): Promise<UserSettings> {
    const defaultSettings = this.userSettingsRepository.create({
      userId,
      language: Language.ENGLISH,
      textSize: TextSize.MEDIUM,
      notifications: true,
      additionalPreferences: {}
    });

    return this.userSettingsRepository.save(defaultSettings);
  }
} 