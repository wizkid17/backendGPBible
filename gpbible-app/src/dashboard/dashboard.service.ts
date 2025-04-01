import { Injectable } from '@nestjs/common';
import { AiAvatarsService } from '../ai-avatars/ai-avatars.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class DashboardService {
  private userReactions = new Map<string, Map<string, string[]>>();

  constructor(
    private readonly aiAvatarsService: AiAvatarsService,
    private readonly onboardingService: OnboardingService,
    private readonly subscriptionsService: SubscriptionsService
  ) {}

  async getDashboardData(userId: string) {
    const [avatar, onboardingStatus, premiumFeatures] = await Promise.all([
      this.aiAvatarsService.getUserAvatar(userId),
      this.onboardingService.hasCompletedOnboarding(userId),
      this.subscriptionsService.getPremiumFeatures(userId)
    ]);

    // Obtener un versículo sugerido diario
    const suggestedVerse = this.getSuggestedVerse();
    
    // Obtener actividades recientes o recomendadas
    const recentActivities = this.getRecentActivities();
    
    // Obtener una reflexión diaria
    const dailyReflection = this.getDailyReflection();

    // Esta función compila todos los datos relevantes para el dashboard
    return {
      avatar,
      onboardingCompleted: onboardingStatus,
      premiumFeatures,
      suggestedVerse,
      recentActivities,
      dailyReflection,
      recommendations: this.getPersonalizedRecommendations()
    };
  }

  async getHomeSections(userId: string) {
    // Esta función devuelve las secciones para la pantalla de inicio como se muestra en la imagen
    return {
      welcomeMessage: 'Welcome, Orlando',
      mainActions: [
        {
          id: 'seekGuidance',
          title: 'Seek Guidance',
          subtitle: 'Consider counsel based on Biblical truth.',
          iconUrl: '/assets/icons/guidance.png',
          actionType: 'link',
          url: '/guidance'
        },
        {
          id: 'newActivity',
          title: 'New activity',
          subtitle: 'Share your faith',
          iconUrl: '/assets/icons/activity.png',
          actionType: 'link',
          url: '/activities/new'
        },
        {
          id: 'continueReading',
          title: 'Continue reading',
          subtitle: 'Luke 4:25',
          iconUrl: '/assets/icons/reading.png',
          actionType: 'link',
          url: '/bible/luke/4/25'
        },
        {
          id: 'today',
          title: 'Today',
          subtitle: 'Daily plan',
          iconUrl: '/assets/icons/today.png',
          actionType: 'link',
          url: '/today'
        }
      ],
      dailyBibleVerse: {
        title: 'Daily Bible Verse',
        reference: 'According to Saint',
        text: 'A scribe heard them debating and asked what was the first of all the commandments.',
        actionType: 'link',
        url: '/daily-verse'
      },
      todaysReflection: {
        title: 'Today\'s reflection',
        content: 'If we could go through the Word of God. Throughout the Bible we see how our Lord is patient with us.',
        actionType: 'link',
        url: '/reflection/today'
      },
      spiritualAssessment: {
        title: 'View the results of your spiritual alignment assessment',
        description: 'See how you connected with the 5 pillars',
        url: '/spiritual-assessment/summary',
        actionType: 'link'
      }
    };
  }

  private getSuggestedVerse() {
    // En una implementación real, esto se obtendría de una API bíblica o una base de datos
    const verses = [
      { 
        reference: 'Juan 3:16', 
        text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
        version: 'RVR1960'
      },
      { 
        reference: 'Salmo 23:1', 
        text: 'El Señor es mi pastor, nada me faltará.',
        version: 'RVR1960'
      },
      { 
        reference: 'Filipenses 4:13', 
        text: 'Todo lo puedo en Cristo que me fortalece.',
        version: 'RVR1960'
      },
      {
        reference: 'According to Saint',
        text: 'A scribe heard them debating and asked what was the first of all the commandments.',
        version: 'RVR1960'
      },
      {
        reference: 'Mateo 5:6',
        text: 'Bienaventurados los que tienen hambre y sed de justicia, porque ellos serán saciados.',
        version: 'RVR1960'
      },
      {
        reference: 'Marcos 12:29-30',
        text: 'Jesús le respondió: El primer mandamiento de todos es: Oye, Israel; el Señor nuestro Dios, el Señor uno es. Y amarás al Señor tu Dios con todo tu corazón, y con toda tu alma, y con toda tu mente y con todas tus fuerzas. Este es el principal mandamiento.',
        version: 'RVR1960'
      }
    ];
    
    // Seleccionar un versículo basado en la fecha actual para que sea consistente durante el día
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return verses[dayOfYear % verses.length];
  }

  private getRecentActivities() {
    // Esto simula actividades recientes o recomendadas
    return [
      {
        id: 'activity1',
        title: 'Nueva actividad',
        description: 'Revisa tus lecturas',
        imageUrl: '/assets/activities/reading.png',
        type: 'bible_reading',
        isNew: true
      },
      {
        id: 'activity2',
        title: 'Seek Guidance',
        description: 'Consulta a Gracia sobre tus dudas',
        imageUrl: '/assets/activities/guidance.png',
        type: 'ai_guidance',
        isNew: false
      }
    ];
  }

  private getDailyReflection() {
    // Simular una reflexión diaria
    return {
      title: 'La reflexión de hoy',
      text: 'Si se pudiera ver a través del disfraz, o aun los ojos de Dios que todo lo ven, veríamos la raíz de muchas cosas que nos perturban. Si lo pudiéramos percibir...',
      reference: 'Basado en Proverbios 2:6'
    };
  }

  private getPersonalizedRecommendations() {
    // Simular recomendaciones personalizadas
    return [
      {
        id: 'rec1',
        title: 'Momento de meditación',
        description: 'Toma 5 minutos para reflexionar sobre el Salmo 23',
        type: 'meditation',
        imageUrl: '/assets/recommendations/meditation.jpg'
      }
    ];
  }

  // Método para agregar una reacción de un usuario a un contenido (verso o reflexión)
  addReaction(userId: string, contentId: string, reaction: string): boolean {
    if (!this.userReactions.has(userId)) {
      this.userReactions.set(userId, new Map<string, string[]>());
    }
    
    const userContentReactions = this.userReactions.get(userId);
    if (!userContentReactions.has(contentId)) {
      userContentReactions.set(contentId, []);
    }
    
    const reactions = userContentReactions.get(contentId);
    // Si la reacción ya existe, la eliminamos (toggle)
    if (reactions.includes(reaction)) {
      const index = reactions.indexOf(reaction);
      reactions.splice(index, 1);
      return false; // Indicando que la reacción fue removida
    } else {
      // Agregamos la nueva reacción
      reactions.push(reaction);
      return true; // Indicando que la reacción fue agregada
    }
  }

  // Método para obtener las reacciones de un usuario para un contenido específico
  getUserReactions(userId: string, contentId: string): string[] {
    if (!this.userReactions.has(userId)) {
      return [];
    }
    
    const userContentReactions = this.userReactions.get(userId);
    if (!userContentReactions.has(contentId)) {
      return [];
    }
    
    return userContentReactions.get(contentId);
  }

  // Método para obtener todos los tipos de reacciones disponibles con su estado para un usuario
  getAllReactionsWithStatus(userId: string, contentId: string): any[] {
    const userReactions = this.getUserReactions(userId, contentId);
    
    return [
      { emoji: '👏', name: 'clap', count: this.getRandomReactionCount(), selected: userReactions.includes('clap') },
      { emoji: '❤️', name: 'heart', count: this.getRandomReactionCount(), selected: userReactions.includes('heart') },
      { emoji: '🙏', name: 'pray', count: this.getRandomReactionCount(), selected: userReactions.includes('pray') },
      { emoji: '✝️', name: 'cross', count: this.getRandomReactionCount(), selected: userReactions.includes('cross') },
      { emoji: '🔥', name: 'fire', count: this.getRandomReactionCount(), selected: userReactions.includes('fire') }
    ];
  }

  // Método auxiliar para generar conteos aleatorios para las reacciones
  private getRandomReactionCount(): number {
    return Math.floor(Math.random() * 50) + 1;
  }

  shareContent(userId: string, contentId: string, platform?: string, message?: string) {
    // En una implementación real, aquí se registraría la acción de compartir
    // y se integraría con APIs de redes sociales
    return {
      success: true,
      userId,
      contentId,
      platform: platform || 'generic',
      message: message || '',
      timestamp: new Date().toISOString(),
      shareUrl: `https://gpbible.app/share/${contentId}?user=${userId}&platform=${platform || 'generic'}`
    };
  }
} 