import { Controller, Post, Get, Body, Param, Request, UseGuards, Delete, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiChatService, ChatMessageDto, ChatResponse } from './ai-chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

class SendMessageDto {
  message: string;
  conversationId?: string;
}

class SaveConversationDto {
  messages: ChatMessageDto[];
}

class UpdateTitleDto {
  title: string;
}

@ApiTags('ai-chat')
@Controller('ai-chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('send-message')
  @ApiOperation({ summary: 'Send a message to the AI assistant' })
  @ApiResponse({ status: 200, description: 'Returns the AI response' })
  async sendMessage(@Request() req, @Body() body: SendMessageDto): Promise<ChatResponse> {
    return this.aiChatService.generateResponse(
      req.user.userId,
      body.message,
      body.conversationId
    );
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get recent conversations' })
  @ApiResponse({ status: 200, description: 'Returns list of recent conversations' })
  async getConversations(@Request() req): Promise<{ id: string; title: string; createdAt: Date }[]> {
    return this.aiChatService.getRecentConversations(req.user.userId);
  }

  @Get('conversation/:conversationId')
  @ApiOperation({ summary: 'Get a specific conversation' })
  @ApiResponse({ status: 200, description: 'Returns conversation messages' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(
    @Request() req,
    @Param('conversationId') conversationId: string
  ): Promise<ChatMessageDto[]> {
    return this.aiChatService.getConversation(req.user.userId, conversationId);
  }

  @Post('conversation/:conversationId')
  @ApiOperation({ summary: 'Save messages to a conversation' })
  @ApiResponse({ status: 200, description: 'Messages saved successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async saveConversation(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Body() body: SaveConversationDto
  ): Promise<{ success: boolean }> {
    await this.aiChatService.saveConversation(
      req.user.userId,
      body.messages,
      conversationId
    );
    return { success: true };
  }

  @Delete('conversation/:conversationId')
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiResponse({ status: 200, description: 'Conversation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async deleteConversation(
    @Request() req,
    @Param('conversationId') conversationId: string
  ): Promise<{ success: boolean }> {
    await this.aiChatService.deleteConversation(
      req.user.userId,
      conversationId
    );
    return { success: true };
  }

  @Put('conversation/:conversationId/title')
  @ApiOperation({ summary: 'Update conversation title' })
  @ApiResponse({ status: 200, description: 'Title updated successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async updateTitle(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Body() body: UpdateTitleDto
  ): Promise<{ success: boolean }> {
    await this.aiChatService.updateConversationTitle(
      req.user.userId,
      conversationId,
      body.title
    );
    return { success: true };
  }

  @Post('message')
  @ApiOperation({ summary: 'Create a new chat message' })
  async createMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    return this.aiChatService.createMessage(req.user.id, createMessageDto.content);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user chat history' })
  async getUserChatHistory(
    @Request() req,
    @Query('limit') limit: number = 50
  ) {
    return this.aiChatService.getUserChatHistory(req.user.id, limit);
  }

  @Post('verse/:reference')
  @ApiOperation({ summary: 'Share a Bible verse' })
  async shareVerse(@Request() req, @Param('reference') verseReference: string) {
    return this.aiChatService.shareVerse(req.user.id, verseReference);
  }

  @Post('prayer')
  @ApiOperation({ summary: 'Create a prayer message' })
  async writePrayer(@Request() req, @Body('prayer') prayer: string) {
    return this.aiChatService.writePrayer(req.user.id, prayer);
  }
} 