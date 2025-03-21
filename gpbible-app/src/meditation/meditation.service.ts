import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meditation } from './entities/meditation.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class MeditationService {
  constructor(
    @InjectRepository(Meditation)
    private meditationRepository: Repository<Meditation>,
    private subscriptionsService: SubscriptionsService
  ) {
    // Inicializar meditaciones por defecto al iniciar la aplicación
    this.initializeDefaultMeditations();
  }

  async findAll(userId?: string): Promise<Meditation[]> {
    const isPremium = userId ? await this.subscriptionsService.isUserPremium(userId) : false;
    
    // Si el usuario es premium, devolvemos todas las meditaciones
    if (isPremium) {
      return this.meditationRepository.find();
    }
    
    // Si no es premium, solo devolvemos las meditaciones gratuitas
    return this.meditationRepository.find({
      where: { isPremium: false }
    });
  }

  async findOne(id: string, userId?: string): Promise<Meditation> {
    const meditation = await this.meditationRepository.findOne({
      where: { id }
    });
    
    if (!meditation) {
      throw new Error('Meditación no encontrada');
    }
    
    // Si la meditación es premium, verificamos que el usuario tenga acceso
    if (meditation.isPremium && userId) {
      const isPremium = await this.subscriptionsService.isUserPremium(userId);
      if (!isPremium) {
        throw new UnauthorizedException('Esta meditación requiere una suscripción premium');
      }
    }
    
    return meditation;
  }

  async findByTag(tag: string, userId?: string): Promise<Meditation[]> {
    const allMeditations = await this.findAll(userId);
    return allMeditations.filter(meditation => meditation.tags.includes(tag));
  }

  // Método para inicializar meditaciones por defecto si no existen
  private async initializeDefaultMeditations(): Promise<void> {
    const count = await this.meditationRepository.count();
    
    if (count === 0) {
      const defaultMeditations = [
        {
          title: 'Paz en medio de la tormenta',
          description: 'Una meditación guiada basada en el Salmo 23 para encontrar paz en tiempos difíciles.',
          imageUrl: '/assets/meditations/peace.jpg',
          audioUrl: '/assets/meditations/peace.mp3',
          durationMinutes: 5,
          content: `
            <p>Cierra tus ojos y respira profundamente.</p>
            <p>Imagina un valle tranquilo con un arroyo de aguas mansas.</p>
            <p>Mientras respiras, recuerda las palabras del Salmo 23: "El Señor es mi pastor, nada me faltará. En lugares de delicados pastos me hará descansar; Junto a aguas de reposo me pastoreará."</p>
            <p>Con cada respiración, siente la paz de Dios fluyendo a través de ti.</p>
          `,
          tags: ['paz', 'descanso', 'salmos'],
          scriptureReference: 'Salmo 23',
          isPremium: false
        },
        {
          title: 'Gratitud diaria',
          description: 'Práctica de gratitud basada en Filipenses 4 para cultivar un corazón agradecido.',
          imageUrl: '/assets/meditations/gratitude.jpg',
          audioUrl: '/assets/meditations/gratitude.mp3',
          durationMinutes: 10,
          content: `
            <p>Encuentra un lugar tranquilo y siéntate cómodamente.</p>
            <p>Respira profundamente y centra tu mente en las bendiciones en tu vida.</p>
            <p>Recuerda las palabras de Filipenses 4:6-7: "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús."</p>
            <p>Tómate un momento para agradecer por 3 cosas específicas en tu vida.</p>
          `,
          tags: ['gratitud', 'paz', 'filipenses'],
          scriptureReference: 'Filipenses 4:6-7',
          isPremium: false
        },
        {
          title: 'Meditación en la Presencia',
          description: 'Una experiencia inmersiva para sentir la presencia de Dios basada en el Salmo 46.',
          imageUrl: '/assets/meditations/presence.jpg',
          audioUrl: '/assets/meditations/presence.mp3',
          durationMinutes: 15,
          content: `
            <p>Busca un lugar silencioso donde no serás interrumpido.</p>
            <p>Cierra tus ojos y respira lentamente, siendo consciente de cada inhalación y exhalación.</p>
            <p>Visualiza la presencia de Dios como una luz cálida que te rodea.</p>
            <p>Medita en las palabras del Salmo 46:10: "Estad quietos, y conoced que yo soy Dios".</p>
            <p>Con cada respiración, repite silenciosamente: "Aquiétate y conoce".</p>
            <p>Permanece en esta quietud, permitiendo que la presencia de Dios llene cada parte de tu ser.</p>
          `,
          tags: ['presencia', 'silencio', 'contemplación', 'salmos'],
          scriptureReference: 'Salmo 46:10',
          isPremium: true
        }
      ];
      
      for (const meditationData of defaultMeditations) {
        const meditation = this.meditationRepository.create(meditationData);
        await this.meditationRepository.save(meditation);
      }
    }
  }
} 