import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ChatMessage } from '../entities/chat-message.entity';
import { ChatMessageRole } from '../entities/chat-message.entity';

// OpenAI interface types
interface OpenAIMessage {
  role: string;
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: OpenAIMessage;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string = 'https://api.openai.com/v1/chat/completions';
  private readonly model: string;
  private readonly temperature: number;
  private readonly maxTokens: number;
  private readonly isDummyMode: boolean;

  constructor(private configService: ConfigService) {
    // Get API key from environment variables
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || 'dummy-key';
    this.isDummyMode = this.apiKey === 'dummy-key';
    
    // Get other configuration from environment variables with defaults
    this.model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-3.5-turbo';
    this.temperature = parseFloat(this.configService.get<string>('OPENAI_TEMPERATURE') || '0.7');
    this.maxTokens = parseInt(this.configService.get<string>('OPENAI_MAX_TOKENS') || '500', 10);
    
    // Log mode and configuration
    if (this.isDummyMode) {
      this.logger.warn('OpenAI API key not set - using dummy mode');
    } else {
      this.logger.log(`OpenAI service initialized with model: ${this.model}`);
    }
  }

  /**
   * Converts our internal message format to OpenAI's format
   */
  private convertToOpenAIMessages(messages: ChatMessage[]): OpenAIMessage[] {
    return messages.map(message => ({
      role: message.role.toLowerCase(),
      content: message.content
    }));
  }

  /**
   * Sends a request to the OpenAI API
   */
  async generateChatCompletion(messages: ChatMessage[]): Promise<string> {
    try {
      // If no API key is set, use dummy mode
      if (this.isDummyMode) {
        this.logger.log('Using dummy mode for response generation');
        return this.generateDummyResponse(messages);
      }

      const openaiMessages = this.convertToOpenAIMessages(messages);
      
      this.logger.debug(`Sending request to OpenAI API with ${openaiMessages.length} messages`);
      
      const response = await axios.post<OpenAIResponse>(
        this.apiUrl,
        {
          model: this.model,
          messages: openaiMessages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      if (response.data.choices && response.data.choices.length > 0) {
        // Log token usage if available
        if (response.data.usage) {
          this.logger.debug(`OpenAI token usage: ${JSON.stringify(response.data.usage)}`);
        }
        
        return response.data.choices[0].message.content;
      } else {
        throw new Error('No completion choices returned from OpenAI');
      }
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        // OpenAI API error
        this.logger.error(
          `OpenAI API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
          error.stack
        );
        
        // Handle rate limiting
        if (error.response.status === 429) {
          this.logger.warn('OpenAI API rate limit exceeded - using fallback response');
          return this.generateDummyResponse(messages);
        }
      } else if (error.request) {
        // Network error
        this.logger.error(`Network error when calling OpenAI API: ${error.message}`, error.stack);
      } else {
        // Other errors
        this.logger.error(`Error calling OpenAI API: ${error.message}`, error.stack);
      }
      
      throw new InternalServerErrorException('Error generating AI response');
    }
  }

  /**
   * Generates a dummy response when the API key is not available or as a fallback
   */
  private generateDummyResponse(messages: ChatMessage[]): string {
    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === ChatMessageRole.USER);
    
    if (!lastUserMessage) {
      return 'Estoy aquí para ayudarte con tus preguntas sobre la Biblia y la fe.';
    }

    const message = lastUserMessage.content.toLowerCase();
    
    if (message.includes('biblia') || message.includes('versículo')) {
      return 'La Biblia contiene 66 libros y fue escrita por múltiples autores a lo largo de aproximadamente 1500 años. ¿Hay algún pasaje específico sobre el que te gustaría profundizar?';
    } else if (message.includes('jesús') || message.includes('dios')) {
      return 'Jesús es la figura central del cristianismo. Según el Nuevo Testamento, es el hijo de Dios y el Mesías prometido en el Antiguo Testamento.';
    } else if (message.includes('oración') || message.includes('rezar')) {
      return 'La oración es una forma de comunicación con Dios. El Padre Nuestro, enseñado por Jesús, es uno de los modelos más conocidos de oración.';
    } else if (message.includes('salmo')) {
      return 'Los Salmos son un libro de la Biblia que contiene poemas, canciones y oraciones. El Salmo 23 es uno de los más conocidos: "El Señor es mi pastor, nada me faltará..."';
    } else if (message.includes('apóstol') || message.includes('discípulo')) {
      return 'Los doce apóstoles fueron los principales discípulos de Jesús. Incluían a Pedro, Santiago, Juan, Andrés, Felipe, Bartolomé, Mateo, Tomás, Santiago hijo de Alfeo, Tadeo, Simón el Zelote y Judas Iscariote.';
    } else if (message.includes('evangelio')) {
      return 'Los cuatro Evangelios (Mateo, Marcos, Lucas y Juan) narran la vida, ministerio, muerte y resurrección de Jesús. Cada uno tiene un enfoque y audiencia distintos, pero juntos ofrecen un testimonio completo de la vida de Cristo.';
    } else if (message.includes('profeta') || message.includes('profecía')) {
      return 'Los profetas en la Biblia eran mensajeros de Dios que comunicaban sus palabras al pueblo. Algunos de los profetas más conocidos incluyen a Isaías, Jeremías, Ezequiel y Daniel en el Antiguo Testamento.';
    } else {
      return 'Estoy aquí para ayudarte a profundizar en tu estudio bíblico y responder tus preguntas sobre la fe. ¿En qué puedo ayudarte hoy?';
    }
  }
} 