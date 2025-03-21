import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AiChatService, ChatMessage } from './ai-chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../subscriptions/guards/premium.guard';

@Controller('ai-chat')
@UseGuards(JwtAuthGuard, PremiumGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  // Endpoint para enviar un mensaje y obtener una respuesta
  @Post('message')
  async sendMessage(
    @Request() req,
    @Body() data: { message: string; conversationId?: string }
  ) {
    return this.aiChatService.generateResponse(
      req.user.id,
      data.message,
      data.conversationId
    );
  }

  // Endpoint para guardar una conversación
  @Post('conversations/:conversationId/save')
  async saveConversation(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Body() data: { messages: ChatMessage[] }
  ) {
    await this.aiChatService.saveConversation(
      req.user.id,
      data.messages,
      conversationId
    );
    return { success: true };
  }

  // Endpoint para obtener una conversación específica
  @Get('conversations/:conversationId')
  async getConversation(
    @Request() req,
    @Param('conversationId') conversationId: string
  ) {
    return this.aiChatService.getConversation(req.user.id, conversationId);
  }

  // Endpoint para obtener las conversaciones recientes del usuario
  @Get('conversations')
  async getRecentConversations(@Request() req) {
    return this.aiChatService.getRecentConversations(req.user.id);
  }
} 