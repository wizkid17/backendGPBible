import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

// Interfaz para una historia bíblica inmersiva
export interface ImmersiveStory {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  audioUrl?: string;
  videoUrl?: string;
  content: string;
  duration: number; // en minutos
  category: string;
  tags: string[];
  scriptureReferences: string[];
  isPremium: boolean;
}

@Injectable()
export class ImmersiveStoriesService {
  constructor(private subscriptionsService: SubscriptionsService) {}

  // Método para verificar si un usuario tiene acceso a las historias premium
  private async verifyPremiumAccess(userId: string): Promise<void> {
    const hasAccess = await this.subscriptionsService.hasImmersiveStoriesAccess(userId);
    if (!hasAccess) {
      throw new UnauthorizedException('Esta funcionalidad requiere una suscripción premium');
    }
  }

  // Obtener todas las historias disponibles para el usuario
  async getAllStories(userId?: string): Promise<ImmersiveStory[]> {
    const isPremium = userId ? await this.subscriptionsService.isUserPremium(userId) : false;
    
    // Simulación de base de datos
    const allStories = this.getMockStories();
    
    // Si el usuario es premium, retornamos todas las historias
    if (isPremium) {
      return allStories;
    }
    
    // Si no es premium, solo retornamos las historias gratuitas
    return allStories.filter(story => !story.isPremium);
  }

  // Obtener una historia específica por su ID
  async getStoryById(storyId: string, userId?: string): Promise<ImmersiveStory> {
    const isPremium = userId ? await this.subscriptionsService.isUserPremium(userId) : false;
    
    const story = this.getMockStories().find(s => s.id === storyId);
    
    if (!story) {
      throw new Error('Historia no encontrada');
    }
    
    // Si la historia es premium y el usuario no es premium, lanzamos error
    if (story.isPremium && !isPremium) {
      throw new UnauthorizedException('Esta historia requiere una suscripción premium');
    }
    
    return story;
  }

  // Obtener historias por categoría
  async getStoriesByCategory(category: string, userId?: string): Promise<ImmersiveStory[]> {
    const allStories = await this.getAllStories(userId);
    return allStories.filter(story => story.category === category);
  }

  // Obtener historias favoritas del usuario
  async getFavoriteStories(userId: string): Promise<ImmersiveStory[]> {
    // En una implementación real, esto se obtendría de la base de datos
    // Aquí simplemente retornamos un subconjunto de las historias simuladas
    const mockFavoriteIds = ['story1', 'story3'];
    const allStories = await this.getAllStories(userId);
    
    return allStories.filter(story => mockFavoriteIds.includes(story.id));
  }

  // Simulación de base de datos con historias de ejemplo
  private getMockStories(): ImmersiveStory[] {
    return [
      {
        id: 'story1',
        title: 'El Arca de Noé',
        description: 'La historia de fe y obediencia de Noé ante el diluvio',
        thumbnailUrl: '/assets/images/stories/noah-ark.jpg',
        audioUrl: '/assets/audio/noah-ark.mp3',
        content: `<p>Dios vio que la maldad de los hombres era mucha en la tierra, y que todo designio de los pensamientos del corazón de ellos era de continuo solamente el mal.</p>
                  <p>Pero Noé halló gracia ante los ojos de Dios. Dios le ordenó construir un arca para salvar a su familia y a los animales del gran diluvio que vendría.</p>
                  <p>Noé, con fe y obediencia, construyó el arca según las instrucciones divinas...</p>`,
        duration: 15,
        category: 'Antiguo Testamento',
        tags: ['Noé', 'Diluvio', 'Obediencia', 'Fe'],
        scriptureReferences: ['Génesis 6-9'],
        isPremium: false
      },
      {
        id: 'story2',
        title: 'La Última Cena',
        description: 'Jesús comparte su última comida con los discípulos',
        thumbnailUrl: '/assets/images/stories/last-supper.jpg',
        audioUrl: '/assets/audio/last-supper.mp3',
        videoUrl: '/assets/video/last-supper.mp4',
        content: `<p>Llegó el día de los panes sin levadura, en el que se debía sacrificar el cordero de la Pascua. Jesús envió a Pedro y a Juan, diciendo: "Id y preparadnos la Pascua para que la comamos".</p>
                  <p>Cuando llegó la hora, se sentó a la mesa con los apóstoles y les dijo: "¡Cuánto he deseado comer esta Pascua con vosotros antes de padecer!"</p>
                  <p>Y tomando el pan, dio gracias, lo partió y les dio, diciendo: "Esto es mi cuerpo, que por vosotros es dado; haced esto en memoria de mí".</p>
                  <p>De igual manera, después de haber cenado, tomó la copa, diciendo: "Esta copa es el nuevo pacto en mi sangre, que por vosotros se derrama".</p>`,
        duration: 20,
        category: 'Nuevo Testamento',
        tags: ['Jesús', 'Discípulos', 'Eucaristía', 'Sacrificio'],
        scriptureReferences: ['Lucas 22:7-23', 'Mateo 26:17-30', 'Marcos 14:12-26'],
        isPremium: true
      },
      {
        id: 'story3',
        title: 'David y Goliat',
        description: 'La historia del joven David derrotando al gigante Goliat',
        thumbnailUrl: '/assets/images/stories/david-goliath.jpg',
        audioUrl: '/assets/audio/david-goliath.mp3',
        content: `<p>El joven pastor David se ofreció para enfrentar al gigante filisteo Goliat, quien había desafiado a los ejércitos de Israel.</p>
                  <p>Rechazando la armadura del rey Saúl, David se enfrentó a Goliat con su honda y cinco piedras lisas.</p>
                  <p>Con fe en Dios, David proclamó: "Tú vienes a mí con espada, lanza y jabalina, pero yo vengo a ti en el nombre del Señor Todopoderoso".</p>
                  <p>Con precisión, David lanzó una piedra que golpeó la frente de Goliat, derribándolo...</p>`,
        duration: 12,
        category: 'Antiguo Testamento',
        tags: ['David', 'Goliat', 'Fe', 'Valentía'],
        scriptureReferences: ['1 Samuel 17'],
        isPremium: false
      },
      {
        id: 'story4',
        title: 'La Crucifixión y Resurrección',
        description: 'El sacrificio de Jesús en la cruz y su victoria sobre la muerte',
        thumbnailUrl: '/assets/images/stories/resurrection.jpg',
        audioUrl: '/assets/audio/resurrection.mp3',
        videoUrl: '/assets/video/resurrection.mp4',
        content: `<p>Jesús fue llevado al lugar llamado Gólgota, donde lo crucificaron junto con dos malhechores.</p>
                  <p>Desde la cruz, Jesús dijo: "Padre, perdónalos, porque no saben lo que hacen". Y a la hora novena, exclamó: "Padre, en tus manos encomiendo mi espíritu" y expiró.</p>
                  <p>Al tercer día, muy de mañana, María Magdalena y otras mujeres fueron al sepulcro y lo encontraron vacío. Un ángel les dijo: "No está aquí, ha resucitado".</p>
                  <p>Más tarde, Jesús se apareció a sus discípulos, mostrándoles que verdaderamente había vencido a la muerte...</p>`,
        duration: 30,
        category: 'Nuevo Testamento',
        tags: ['Jesús', 'Cruz', 'Resurrección', 'Salvación'],
        scriptureReferences: ['Mateo 27-28', 'Marcos 15-16', 'Lucas 23-24', 'Juan 19-20'],
        isPremium: true
      }
    ];
  }
} 