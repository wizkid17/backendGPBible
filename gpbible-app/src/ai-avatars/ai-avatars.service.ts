import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAvatar } from './entities/ai-avatar.entity';
import { UserPreferencesService } from '../user-preferences/user-preferences.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class AiAvatarsService {
  constructor(
    @InjectRepository(AiAvatar)
    private readonly aiAvatarRepository: Repository<AiAvatar>,
    private readonly userPreferencesService: UserPreferencesService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async findAll(includePremium: boolean = false): Promise<AiAvatar[]> {
    const query = this.aiAvatarRepository.createQueryBuilder('avatar')
      .where('avatar.isActive = :isActive', { isActive: true });
    
    if (!includePremium) {
      query.andWhere('avatar.isPremium = :isPremium', { isPremium: false });
    }
    
    return query.orderBy('avatar.name', 'ASC').getMany();
  }

  async findOne(id: string): Promise<AiAvatar> {
    const avatar = await this.aiAvatarRepository.findOne({ where: { id } });
    if (!avatar) {
      throw new NotFoundException(`Avatar with ID ${id} not found`);
    }
    return avatar;
  }

  async selectAvatar(userId: string, avatarId: string): Promise<void> {
    const avatar = await this.findOne(avatarId);
    if (!avatar) {
      throw new NotFoundException(`Avatar with ID ${avatarId} not found`);
    }

    // Actualizar las preferencias del usuario con el avatar seleccionado
    await this.userPreferencesService.updateSettings(userId, {
      additionalPreferences: { selectedAvatarId: avatarId }
    });
  }

  async getSelectedAvatar(userId: string): Promise<AiAvatar | null> {
    const settings = await this.userPreferencesService.getSettings(userId);
    const selectedAvatarId = settings?.additionalPreferences?.selectedAvatarId;

    if (selectedAvatarId) {
      return this.findOne(selectedAvatarId);
    }

    return null;
  }

  async getUserAvatar(userId: string): Promise<AiAvatar> {
    // Obtener las preferencias del usuario para ver qué avatar ha seleccionado
    const settings = await this.userPreferencesService.getSettings(userId);
    const selectedAvatarId = settings?.additionalPreferences?.selectedAvatarId;
    
    if (selectedAvatarId) {
      return this.findOne(selectedAvatarId);
    }
    
    // Si el usuario no ha seleccionado un avatar, devolver el predeterminado
    const defaultAvatars = await this.aiAvatarRepository.find({
      where: { isActive: true, isPremium: false },
      take: 1
    });
    
    if (!defaultAvatars.length) {
      throw new NotFoundException('No default avatar found');
    }
    
    return defaultAvatars[0];
  }

  async getUserIsPremium(userId: string): Promise<boolean> {
    return this.subscriptionsService.isUserPremium(userId);
  }

  // Método para inicializar avatares por defecto si no existen
  async initializeDefaultAvatars(): Promise<void> {
    const count = await this.aiAvatarRepository.count();
    
    if (count === 0) {
      const defaultAvatars = [
        {
          name: 'grace',
          displayName: 'GRACE',
          description: 'Un avatar compasivo y paciente que se especializa en temas de fe y esperanza.',
          imageUrl: '/assets/avatars/grace.png',
          personalityTrait: 'Compasiva',
          specialization: 'Fe y esperanza',
          isActive: true,
          isPremium: false
        },
        {
          name: 'caleb',
          displayName: 'CALEB',
          description: 'Sabio y experimentado en estudios bíblicos profundos con énfasis en el contexto histórico.',
          imageUrl: '/assets/avatars/caleb.png',
          personalityTrait: 'Sabio',
          specialization: 'Estudios bíblicos históricos',
          isActive: true,
          isPremium: false
        },
        {
          name: 'ethan',
          displayName: 'ETHAN',
          description: 'Analítico y reflexivo, especializado en teología y doctrina bíblica.',
          imageUrl: '/assets/avatars/ethan.png',
          personalityTrait: 'Analítico',
          specialization: 'Teología',
          isActive: true,
          isPremium: false
        },
        {
          name: 'alina',
          displayName: 'ALINA',
          description: 'Entusiasta y motivadora, centrada en la aplicación práctica de enseñanzas bíblicas.',
          imageUrl: '/assets/avatars/alina.png',
          personalityTrait: 'Entusiasta',
          specialization: 'Aplicación práctica',
          isActive: true,
          isPremium: false
        }
      ];
      
      for (const avatarData of defaultAvatars) {
        const avatar = this.aiAvatarRepository.create(avatarData);
        await this.aiAvatarRepository.save(avatar);
      }
    }
  }
} 