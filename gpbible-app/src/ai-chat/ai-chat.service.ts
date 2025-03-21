import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

// Interfaz para el mensaje del chat
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Interfaz para la respuesta del chat
export interface ChatResponse {
  message: ChatMessage;
  conversationId: string;
}

@Injectable()
export class AiChatService {
  constructor(private subscriptionsService: SubscriptionsService) {}

  // Método para verificar si un usuario tiene acceso al chat de IA
  private async verifyAccess(userId: string): Promise<void> {
    const hasAccess = await this.subscriptionsService.hasAiChatAccess(userId);
    if (!hasAccess) {
      throw new UnauthorizedException('Esta funcionalidad requiere una suscripción premium');
    }
  }

  // Método para generar una respuesta al mensaje del usuario
  // Nota: Esta es una implementación simulada. En la vida real,
  // integrarías un modelo de lenguaje como GPT-4 u otro servicio de IA.
  async generateResponse(userId: string, message: string, conversationId?: string): Promise<ChatResponse> {
    // Verificar si el usuario tiene acceso a esta funcionalidad
    await this.verifyAccess(userId);
    
    // Si no hay ID de conversación, creamos uno nuevo
    if (!conversationId) {
      conversationId = `conv_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }
    
    // Simulamos una respuesta simple
    // En una implementación real, se enviaría la consulta a una API de IA
    let responseContent = '';
    
    if (message.toLowerCase().includes('biblia') || message.toLowerCase().includes('versículo')) {
      responseContent = 'La Biblia contiene 66 libros y fue escrita por múltiples autores a lo largo de aproximadamente 1500 años. ¿Hay algún pasaje específico sobre el que te gustaría profundizar?';
    } else if (message.toLowerCase().includes('jesús') || message.toLowerCase().includes('dios')) {
      responseContent = 'Jesús es la figura central del cristianismo. Según el Nuevo Testamento, es el hijo de Dios y el Mesías prometido en el Antiguo Testamento.';
    } else if (message.toLowerCase().includes('oración') || message.toLowerCase().includes('rezar')) {
      responseContent = 'La oración es una forma de comunicación con Dios. El Padre Nuestro, enseñado por Jesús, es uno de los modelos más conocidos de oración.';
    } else {
      responseContent = 'Estoy aquí para ayudarte a profundizar en tu estudio bíblico y responder tus preguntas sobre la fe. ¿En qué puedo ayudarte hoy?';
    }
    
    return {
      message: {
        role: 'assistant',
        content: responseContent
      },
      conversationId
    };
  }

  // Método para guardar una conversación
  async saveConversation(userId: string, messages: ChatMessage[], conversationId: string): Promise<void> {
    // Implementación simulada
    console.log(`Guardando conversación ${conversationId} para el usuario ${userId}`);
    // En una implementación real, se guardaría en la base de datos
  }

  // Método para obtener una conversación existente
  async getConversation(userId: string, conversationId: string): Promise<ChatMessage[]> {
    // Verificar si el usuario tiene acceso a esta funcionalidad
    await this.verifyAccess(userId);
    
    // Implementación simulada
    // En una implementación real, se recuperaría de la base de datos
    return [
      { role: 'system', content: 'Soy un asistente bíblico diseñado para ayudarte en tu estudio de la Biblia.' },
      { role: 'user', content: '¿Puedes explicarme el significado del Salmo 23?' },
      { role: 'assistant', content: 'El Salmo 23 es uno de los pasajes más conocidos y amados de la Biblia. Comienza con "El Señor es mi pastor, nada me faltará" y es una hermosa expresión de confianza en Dios como nuestro protector y proveedor.' }
    ];
  }

  // Método para obtener las conversaciones recientes de un usuario
  async getRecentConversations(userId: string): Promise<{ id: string; title: string; createdAt: Date }[]> {
    // Verificar si el usuario tiene acceso a esta funcionalidad
    await this.verifyAccess(userId);
    
    // Implementación simulada
    // En una implementación real, se recuperaría de la base de datos
    return [
      { id: 'conv_1', title: 'Estudio sobre el Salmo 23', createdAt: new Date(Date.now() - 86400000) },
      { id: 'conv_2', title: 'Preguntas sobre el Nuevo Testamento', createdAt: new Date(Date.now() - 172800000) }
    ];
  }
} 