import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourStep, TourSectionType } from './entities/tour-step.entity';
import { OnboardingService } from '../onboarding/onboarding.service';

@Injectable()
export class TourService {
  constructor(
    private readonly onboardingService: OnboardingService
  ) {}

  // Método para obtener todos los pasos del tour
  async getAllTourSteps(): Promise<TourStep[]> {
    // Como no estamos persistiendo en base de datos, devolvemos los pasos predefinidos
    return this.getDefaultTourSteps();
  }

  // Método para obtener un paso específico del tour
  async getTourStep(stepNumber: number): Promise<TourStep> {
    const steps = this.getDefaultTourSteps();
    const step = steps.find(s => s.stepNumber === stepNumber);
    
    if (!step) {
      throw new Error(`Paso ${stepNumber} no encontrado`);
    }
    
    return step;
  }

  // Método para marcar el tour como completado para un usuario
  async completeTour(userId: string): Promise<void> {
    await this.onboardingService.update(userId, { wantsTour: false });
  }

  // Método para omitir el tour
  async skipTour(userId: string): Promise<void> {
    await this.onboardingService.update(userId, { wantsTour: false });
  }

  // Método para verificar si un usuario necesita ver el tour
  async shouldShowTour(userId: string): Promise<boolean> {
    try {
      const onboarding = await this.onboardingService.findByUserId(userId);
      return onboarding.wantsTour;
    } catch (error) {
      // Si hay error (por ejemplo, el usuario no tiene onboarding), mostramos el tour
      return true;
    }
  }

  // Método para obtener el progreso del tour de un usuario
  async getUserTourProgress(userId: string): Promise<{ currentStep: number, totalSteps: number, completed: boolean }> {
    const shouldShowTour = await this.shouldShowTour(userId);
    
    return {
      currentStep: shouldShowTour ? 1 : 8, // Si no debe mostrar el tour, asumimos que está en el último paso
      totalSteps: 8,
      completed: !shouldShowTour
    };
  }

  // Método para obtener los pasos predefinidos del tour (como se ve en la imagen)
  private getDefaultTourSteps(): TourStep[] {
    const steps: Partial<TourStep>[] = [
      {
        stepNumber: 1,
        title: 'Stay aware of updates and news alerts',
        description: 'Recibe notificaciones de actualizaciones y novedades en la aplicación',
        sectionType: TourSectionType.NOTIFICATIONS,
        screenTarget: 'notifications_screen',
        totalSteps: 8
      },
      {
        stepNumber: 2,
        title: 'Access your profile and settings here',
        description: 'Configura tu perfil y preferencias de la aplicación',
        sectionType: TourSectionType.PROFILE,
        screenTarget: 'profile_screen',
        totalSteps: 8
      },
      {
        stepNumber: 3,
        title: 'Use our guidance feature for guided prayers, journaling prompts, or silent meditation to deepen your connection with God',
        description: 'Accede a características guiadas para enriquecer tu vida espiritual',
        sectionType: TourSectionType.MEDITATION,
        screenTarget: 'guidance_screen',
        totalSteps: 8
      },
      {
        stepNumber: 4,
        title: 'Track your spiritual growth with personalized practices and check-ins',
        description: 'Monitorea tu crecimiento espiritual con prácticas personalizadas',
        sectionType: TourSectionType.SPIRITUAL_GROWTH,
        screenTarget: 'tracking_screen',
        totalSteps: 8
      },
      {
        stepNumber: 5,
        title: 'Easily find the book, chapter and verse. And also some interesting bible stories',
        description: 'Encuentra fácilmente cualquier parte de la Biblia e historias bíblicas interesantes',
        sectionType: TourSectionType.BIBLE_EXPLORATION,
        screenTarget: 'bible_screen',
        totalSteps: 8
      },
      {
        stepNumber: 6,
        title: 'Find guidance and encouragement with this Biblically-informed AI that offers spiritual truth to inform your thoughts and actions',
        description: 'Recibe guía y aliento a través de una IA con base bíblica',
        sectionType: TourSectionType.AI_GUIDANCE,
        screenTarget: 'ai_guidance_screen',
        totalSteps: 8
      },
      {
        stepNumber: 7,
        title: 'Each day, you\'ll receive an uplifting verse or devotional to begin your day',
        description: 'Recibe diariamente un versículo o devocional para comenzar tu día',
        sectionType: TourSectionType.WELCOME,
        screenTarget: 'daily_verse_screen',
        totalSteps: 8
      },
      {
        stepNumber: 8,
        title: 'That\'s it! You\'re all set to begin your journey',
        description: 'Todo listo para comenzar tu viaje espiritual',
        sectionType: TourSectionType.WELCOME,
        screenTarget: 'home_screen',
        totalSteps: 8
      }
    ];

    // Convertimos a TourStep (simulando que vienen de la base de datos)
    return steps.map(step => {
      const tourStep = new TourStep();
      Object.assign(tourStep, step);
      return tourStep;
    });
  }
} 