import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionType } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { user: { id: createSubscriptionDto.userId } },
    });

    if (existingSubscription) {
      throw new ConflictException('User already has a subscription');
    }

    const subscription = this.subscriptionRepository.create({
      user: { id: createSubscriptionDto.userId },
      type: createSubscriptionDto.type,
      paymentId: createSubscriptionDto.paymentId,
      startDate: createSubscriptionDto.startDate || new Date(),
      endDate: createSubscriptionDto.endDate,
      autoRenew: createSubscriptionDto.autoRenew || false,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find({ relations: ['user'] });
  }

  async findByUserId(userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!subscription) {
      // Si no existe, creamos una suscripción gratuita por defecto
      return this.createFreeSubscription(userId);
    }

    return subscription;
  }

  private async createFreeSubscription(userId: string): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create({
      user: { id: userId },
      type: SubscriptionType.FREE,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async update(userId: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
    
    const updatedSubscription = {
      ...subscription,
      ...updateSubscriptionDto,
    };

    return this.subscriptionRepository.save(updatedSubscription);
  }

  async upgradeToPremium(userId: string, paymentId: string, endDate?: Date): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
    
    subscription.type = SubscriptionType.PREMIUM;
    subscription.paymentId = paymentId;
    subscription.startDate = new Date();
    subscription.endDate = endDate;
    subscription.autoRenew = true;
    subscription.isCancelled = false;

    return this.subscriptionRepository.save(subscription);
  }

  async cancelSubscription(userId: string): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
    
    subscription.autoRenew = false;
    subscription.isCancelled = true;

    return this.subscriptionRepository.save(subscription);
  }

  async remove(userId: string): Promise<void> {
    const subscription = await this.findByUserId(userId);
    await this.subscriptionRepository.remove(subscription);
  }

  async isUserPremium(userId: string): Promise<boolean> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!subscription) {
      return false;
    }

    // Verificar si es premium y no ha expirado
    if (subscription.type === SubscriptionType.PREMIUM) {
      if (!subscription.endDate) {
        return true; // Sin fecha de fin, es premium indefinido
      }
      
      const now = new Date();
      return now <= subscription.endDate;
    }

    return false;
  }

  // Nuevo método para verificar si un usuario tiene acceso al chat de IA
  async hasAiChatAccess(userId: string): Promise<boolean> {
    return this.isUserPremium(userId);
  }

  // Nuevo método para verificar si un usuario tiene acceso a las historias bíblicas inmersivas
  async hasImmersiveStoriesAccess(userId: string): Promise<boolean> {
    return this.isUserPremium(userId);
  }

  // Método para obtener las características premium disponibles para un usuario
  async getPremiumFeatures(userId: string): Promise<{ 
    aiChat: boolean;
    immersiveStories: boolean;
    advancedSearch: boolean;
    personalizedContent: boolean;
    noAds: boolean;
  }> {
    const isPremium = await this.isUserPremium(userId);
    
    return {
      aiChat: isPremium,
      immersiveStories: isPremium,
      advancedSearch: isPremium,
      personalizedContent: isPremium,
      noAds: isPremium,
    };
  }

  // Método para obtener información sobre el plan premium
  async getPremiumPlanInfo(): Promise<{
    name: string;
    price: number;
    currency: string;
    billingCycle: string;
    features: string[];
  }> {
    return {
      name: 'GPBible Premium',
      price: 9.99,
      currency: 'USD',
      billingCycle: 'monthly',
      features: [
        'Acceso al chatbot de IA para profundizar tus estudios bíblicos',
        'Historias bíblicas inmersivas con ilustraciones y audio',
        'Búsqueda avanzada en la Biblia',
        'Contenido personalizado según tus intereses',
        'Experiencia sin anuncios',
        'Acceso prioritario a nuevas características'
      ]
    };
  }
} 