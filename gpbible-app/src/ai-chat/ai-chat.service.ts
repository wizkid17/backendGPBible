import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { OpenAiService } from './services/openai.service';
import { ChatConversation } from './entities/chat-conversation.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatMessageRole } from './entities/chat-message.entity';

// Interface for the message in the API
export interface ChatMessageDto {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Interface for the chat response
export interface ChatResponse {
  message: ChatMessageDto;
  conversationId: string;
}

@Injectable()
export class AiChatService {
  constructor(
    private subscriptionsService: SubscriptionsService,
    private openAiService: OpenAiService,
    @InjectRepository(ChatConversation)
    private chatConversationRepository: Repository<ChatConversation>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>
  ) {}

  // Method to verify if a user has access to the AI chat
  private async verifyAccess(userId: string): Promise<void> {
    const hasAccess = await this.subscriptionsService.hasAiChatAccess(userId);
    if (!hasAccess) {
      throw new UnauthorizedException('Esta funcionalidad requiere una suscripción premium');
    }
  }

  // Method to generate a response to the user's message
  async generateResponse(userId: string, message: string, conversationId?: string): Promise<ChatResponse> {
    // Verify if the user has access to this functionality
    await this.verifyAccess(userId);
    
    // Get or create the conversation
    let conversation: ChatConversation;
    let existingMessages: ChatMessage[] = [];
    
    if (conversationId) {
      // Find existing conversation
      conversation = await this.chatConversationRepository.findOne({ 
        where: { id: conversationId, userId },
        relations: ['messages']
      });
      
      if (!conversation) {
        throw new NotFoundException(`Conversación con ID ${conversationId} no encontrada`);
      }
      
      // Get messages in the correct order
      existingMessages = await this.chatMessageRepository.find({
        where: { conversationId },
        order: { createdAt: 'ASC' }
      });
    } else {
      // Create a new conversation with a default title based on the first message
      const title = this.generateTitleFromMessage(message);
      conversation = this.chatConversationRepository.create({
        userId,
        title
      });
      
      await this.chatConversationRepository.save(conversation);
      
      // Add a system message to give context to the AI
      const systemMessage = this.chatMessageRepository.create({
        conversationId: conversation.id,
        role: ChatMessageRole.SYSTEM,
        content: 'Eres un asistente bíblico experto diseñado para ayudar a usuarios a comprender la Biblia, la fe cristiana y temas espirituales. Proporciona respuestas precisas, respetuosas y basadas en la enseñanza bíblica. Evita expresar opiniones políticas o controversias denominacionales. Tu objetivo es educar, inspirar y guiar a los usuarios en su viaje espiritual.'
      });
      
      await this.chatMessageRepository.save(systemMessage);
      existingMessages.push(systemMessage);
    }
    
    // Create and save the user's message
    const userMessage = this.chatMessageRepository.create({
      conversationId: conversation.id,
      role: ChatMessageRole.USER,
      content: message
    });
    
    await this.chatMessageRepository.save(userMessage);
    existingMessages.push(userMessage);
    
    // Update conversation last message timestamp
    conversation.lastMessageAt = new Date();
    await this.chatConversationRepository.save(conversation);
    
    // Generate AI response using the OpenAI service
    const responseContent = await this.openAiService.generateChatCompletion(existingMessages);
    
    // Save the assistant's response
    const assistantMessage = this.chatMessageRepository.create({
      conversationId: conversation.id,
      role: ChatMessageRole.ASSISTANT,
      content: responseContent
    });
    
    await this.chatMessageRepository.save(assistantMessage);
    
    // Return the response in the expected format
    return {
      message: {
        role: 'assistant',
        content: responseContent
      },
      conversationId: conversation.id
    };
  }

  // Generate a title from the first message
  private generateTitleFromMessage(message: string): string {
    // Create a title with max 40 characters
    const maxLength = 40;
    let title = message.substring(0, maxLength);
    
    // If the message is longer than maxLength, add ellipsis
    if (message.length > maxLength) {
      title += '...';
    }
    
    return title;
  }

  // Method to save a conversation
  async saveConversation(userId: string, messages: ChatMessageDto[], conversationId: string): Promise<void> {
    // Verify if the user has access to this feature
    await this.verifyAccess(userId);
    
    // Find the conversation
    const conversation = await this.chatConversationRepository.findOne({
      where: { id: conversationId, userId }
    });
    
    if (!conversation) {
      throw new NotFoundException(`Conversación con ID ${conversationId} no encontrada`);
    }
    
    // Convert message DTOs to entity objects
    const messageEntities = messages.map(msg => this.chatMessageRepository.create({
      conversationId,
      role: msg.role === 'user' ? ChatMessageRole.USER : 
            msg.role === 'assistant' ? ChatMessageRole.ASSISTANT : ChatMessageRole.SYSTEM,
      content: msg.content
    }));
    
    // Save all messages
    await this.chatMessageRepository.save(messageEntities);
    
    // Update conversation last message timestamp
    conversation.lastMessageAt = new Date();
    await this.chatConversationRepository.save(conversation);
  }

  // Method to get an existing conversation
  async getConversation(userId: string, conversationId: string): Promise<ChatMessageDto[]> {
    // Verify if the user has access to this functionality
    await this.verifyAccess(userId);
    
    // Find the conversation
    const conversation = await this.chatConversationRepository.findOne({
      where: { id: conversationId, userId }
    });
    
    if (!conversation) {
      throw new NotFoundException(`Conversación con ID ${conversationId} no encontrada`);
    }
    
    // Get all messages in the conversation
    const messages = await this.chatMessageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' }
    });
    
    // Convert entities to DTOs
    return messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    }));
  }

  // Method to get a user's recent conversations
  async getRecentConversations(userId: string): Promise<{ id: string; title: string; createdAt: Date }[]> {
    // Verify if the user has access to this functionality
    await this.verifyAccess(userId);
    
    // Find all conversations for this user, ordered by last message date
    const conversations = await this.chatConversationRepository.find({
      where: { userId },
      order: { lastMessageAt: 'DESC' },
      take: 10 // Limit to the 10 most recent conversations
    });
    
    // Convert to the expected format
    return conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt
    }));
  }
  
  // Method to delete a conversation
  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    // Verify access
    await this.verifyAccess(userId);
    
    // Find the conversation
    const conversation = await this.chatConversationRepository.findOne({
      where: { id: conversationId, userId }
    });
    
    if (!conversation) {
      throw new NotFoundException(`Conversación con ID ${conversationId} no encontrada`);
    }
    
    // Delete the conversation (cascade will delete messages)
    await this.chatConversationRepository.remove(conversation);
  }
  
  // Method to update a conversation title
  async updateConversationTitle(userId: string, conversationId: string, title: string): Promise<void> {
    // Verify access
    await this.verifyAccess(userId);
    
    // Find the conversation
    const conversation = await this.chatConversationRepository.findOne({
      where: { id: conversationId, userId }
    });
    
    if (!conversation) {
      throw new NotFoundException(`Conversación con ID ${conversationId} no encontrada`);
    }
    
    // Update title
    conversation.title = title;
    await this.chatConversationRepository.save(conversation);
  }
} 