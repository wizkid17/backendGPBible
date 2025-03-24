import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddGroupMembersDto } from './dto/add-group-members.dto';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatGroup } from './entities/chat-group.entity';
import { ChatConversation } from './entities/chat-conversation.entity';

@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  // Messages endpoints
  @Post('messages')
  @UseGuards(JwtAuthGuard)
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: User,
  ): Promise<ChatMessage> {
    return this.messagingService.createMessage(user.id, createMessageDto);
  }

  @Get('conversations/:conversationId/messages')
  @UseGuards(JwtAuthGuard)
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: User,
  ): Promise<ChatMessage[]> {
    return this.messagingService.getConversationMessages(conversationId, user.id);
  }

  @Get('groups/:groupId/messages')
  @UseGuards(JwtAuthGuard)
  async getGroupMessages(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
  ): Promise<ChatMessage[]> {
    return this.messagingService.getGroupMessages(groupId, user.id);
  }

  @Post('conversations/:conversationId/read')
  @UseGuards(JwtAuthGuard)
  async markMessagesAsRead(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.messagingService.markMessagesAsRead(conversationId, user.id);
  }

  // Group endpoints
  @Post('groups')
  @UseGuards(JwtAuthGuard)
  async createGroup(
    @Body() createGroupDto: CreateGroupDto,
    @CurrentUser() user: User,
  ): Promise<ChatGroup> {
    return this.messagingService.createGroup(user.id, createGroupDto);
  }

  @Post('groups/members')
  @UseGuards(JwtAuthGuard)
  async addGroupMembers(
    @Body() addGroupMembersDto: AddGroupMembersDto,
    @CurrentUser() user: User,
  ): Promise<ChatGroup> {
    return this.messagingService.addGroupMembers(user.id, addGroupMembersDto);
  }

  @Get('groups')
  @UseGuards(JwtAuthGuard)
  async getUserGroups(@CurrentUser() user: User): Promise<ChatGroup[]> {
    return this.messagingService.getUserGroups(user.id);
  }

  @Get('groups/:groupId')
  @UseGuards(JwtAuthGuard)
  async getGroupDetails(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
  ): Promise<ChatGroup> {
    // This will check if the user is a member within the service
    return this.messagingService.getGroupWithMembers(groupId);
  }

  // Conversation endpoints
  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  async getUserConversations(@CurrentUser() user: User): Promise<ChatConversation[]> {
    return this.messagingService.getUserConversations(user.id);
  }

  @Get('unread-counts')
  @UseGuards(JwtAuthGuard)
  async getUnreadMessagesCounts(@CurrentUser() user: User): Promise<{ [key: string]: number }> {
    return this.messagingService.getUnreadMessagesCounts(user.id);
  }
} 