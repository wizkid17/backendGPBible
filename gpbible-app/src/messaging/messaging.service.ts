import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatGroup } from './entities/chat-group.entity';
import { ChatGroupMember } from './entities/chat-group-member.entity';
import { ChatConversation } from './entities/chat-conversation.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddGroupMembersDto } from './dto/add-group-members.dto';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(ChatGroup)
    private chatGroupRepository: Repository<ChatGroup>,
    @InjectRepository(ChatGroupMember)
    private chatGroupMemberRepository: Repository<ChatGroupMember>,
    @InjectRepository(ChatConversation)
    private chatConversationRepository: Repository<ChatConversation>,
  ) {}

  // Message methods
  async createMessage(senderId: string, createMessageDto: CreateMessageDto): Promise<ChatMessage> {
    const { content, conversationId, groupId, recipientId } = createMessageDto;

    // Validate that exactly one target (conversation, group, or recipient) is provided
    const targetCount = [conversationId, groupId, recipientId].filter(Boolean).length;
    if (targetCount !== 1) {
      throw new BadRequestException('Exactly one of conversationId, groupId, or recipientId must be provided');
    }

    const message = this.chatMessageRepository.create({
      content,
      senderId,
    });

    // Handle direct message via existing conversation
    if (conversationId) {
      const conversation = await this.chatConversationRepository.findOne({
        where: { 
          id: conversationId,
          isActive: true
        }
      });
      
      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      // Verify sender is part of the conversation
      if (conversation.user1Id !== senderId && conversation.user2Id !== senderId) {
        throw new BadRequestException('You are not part of this conversation');
      }

      message.conversationId = conversationId;
      conversation.lastMessageAt = new Date();
      await this.chatConversationRepository.save(conversation);
    }

    // Handle message to a group
    else if (groupId) {
      const groupMember = await this.chatGroupMemberRepository.findOne({
        where: { 
          groupId, 
          userId: senderId 
        }
      });

      if (!groupMember) {
        throw new BadRequestException('You are not a member of this group');
      }

      message.groupId = groupId;
    }

    // Handle new direct message (create conversation)
    else if (recipientId) {
      // Don't allow sending messages to yourself
      if (recipientId === senderId) {
        throw new BadRequestException('Cannot send a message to yourself');
      }

      // Check if conversation already exists
      const existingConversation = await this.findOrCreateConversation(senderId, recipientId);
      message.conversationId = existingConversation.id;
      
      // Update lastMessageAt
      existingConversation.lastMessageAt = new Date();
      await this.chatConversationRepository.save(existingConversation);
    }

    return this.chatMessageRepository.save(message);
  }

  async getConversationMessages(conversationId: string, userId: string): Promise<ChatMessage[]> {
    const conversation = await this.chatConversationRepository.findOne({
      where: { 
        id: conversationId,
        isActive: true 
      }
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify user is part of the conversation
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new BadRequestException('You are not part of this conversation');
    }

    return this.chatMessageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      relations: ['sender']
    });
  }

  async getGroupMessages(groupId: string, userId: string): Promise<ChatMessage[]> {
    // Verify user is a member of the group
    const groupMember = await this.chatGroupMemberRepository.findOne({
      where: { 
        groupId, 
        userId 
      }
    });

    if (!groupMember) {
      throw new BadRequestException('You are not a member of this group');
    }

    return this.chatMessageRepository.find({
      where: { groupId },
      order: { createdAt: 'ASC' },
      relations: ['sender']
    });
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.chatConversationRepository.findOne({
      where: { 
        id: conversationId,
        isActive: true 
      }
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify user is part of the conversation
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new BadRequestException('You are not part of this conversation');
    }

    // Mark all messages from the other user as read
    await this.chatMessageRepository.update(
      {
        conversationId,
        senderId: conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id,
        isRead: false
      },
      { isRead: true }
    );
  }

  // Group methods
  async createGroup(userId: string, createGroupDto: CreateGroupDto): Promise<ChatGroup> {
    const { name, description, avatarUrl, memberIds } = createGroupDto;

    // Create the group
    const group = this.chatGroupRepository.create({
      name,
      description,
      avatarUrl,
      createdById: userId
    });

    const savedGroup = await this.chatGroupRepository.save(group);

    // Add creator as admin
    await this.chatGroupMemberRepository.save({
      groupId: savedGroup.id,
      userId,
      isAdmin: true
    });

    // Add other members
    if (memberIds && memberIds.length > 0) {
      // Filter out the creator if they're in the list
      const uniqueMemberIds = [...new Set(memberIds.filter(id => id !== userId))];

      if (uniqueMemberIds.length > 0) {
        const members = uniqueMemberIds.map(memberId => ({
          groupId: savedGroup.id,
          userId: memberId,
          isAdmin: false
        }));

        await this.chatGroupMemberRepository.save(members);
      }
    }

    return this.getGroupWithMembers(savedGroup.id);
  }

  async addGroupMembers(userId: string, addGroupMembersDto: AddGroupMembersDto): Promise<ChatGroup> {
    const { groupId, memberIds } = addGroupMembersDto;

    // Check if the group exists
    const group = await this.chatGroupRepository.findOne({ 
      where: { id: groupId } 
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if the user is an admin of the group
    const userMembership = await this.chatGroupMemberRepository.findOne({
      where: { 
        groupId, 
        userId,
        isAdmin: true 
      }
    });

    if (!userMembership) {
      throw new BadRequestException('Only group admins can add members');
    }

    // Get existing members to avoid duplicates
    const existingMembers = await this.chatGroupMemberRepository.find({
      where: { groupId }
    });
    const existingMemberIds = existingMembers.map(member => member.userId);

    // Filter out existing members
    const newMemberIds = memberIds.filter(id => !existingMemberIds.includes(id));

    if (newMemberIds.length > 0) {
      const members = newMemberIds.map(memberId => ({
        groupId,
        userId: memberId,
        isAdmin: false
      }));

      await this.chatGroupMemberRepository.save(members);
    }

    return this.getGroupWithMembers(groupId);
  }

  async getUserGroups(userId: string): Promise<ChatGroup[]> {
    const userMemberships = await this.chatGroupMemberRepository.find({
      where: { userId },
      relations: ['group']
    });

    const groupIds = userMemberships.map(membership => membership.groupId);

    if (groupIds.length === 0) {
      return [];
    }

    return this.chatGroupRepository.find({
      where: { id: In(groupIds) },
      relations: ['members', 'members.user']
    });
  }

  async getGroupWithMembers(groupId: string): Promise<ChatGroup> {
    const group = await this.chatGroupRepository.findOne({
      where: { id: groupId },
      relations: ['members', 'members.user']
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  // Conversation methods
  async getUserConversations(userId: string): Promise<ChatConversation[]> {
    return this.chatConversationRepository.find({
      where: [
        { user1Id: userId, isActive: true },
        { user2Id: userId, isActive: true }
      ],
      relations: ['user1', 'user2'],
      order: { lastMessageAt: 'DESC' }
    });
  }

  async findOrCreateConversation(user1Id: string, user2Id: string): Promise<ChatConversation> {
    // Try to find existing conversation
    const existingConversation = await this.chatConversationRepository.findOne({
      where: [
        { user1Id: user1Id, user2Id: user2Id, isActive: true },
        { user1Id: user2Id, user2Id: user1Id, isActive: true }
      ]
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const newConversation = this.chatConversationRepository.create({
      user1Id: user1Id,
      user2Id: user2Id,
      lastMessageAt: new Date()
    });

    return this.chatConversationRepository.save(newConversation);
  }

  async getUnreadMessagesCounts(userId: string): Promise<{ [key: string]: number }> {
    // Get all conversations for the user
    const conversations = await this.getUserConversations(userId);
    
    const result: { [key: string]: number } = {};
    
    // For each conversation, count unread messages
    for (const conversation of conversations) {
      const count = await this.chatMessageRepository.count({
        where: {
          conversationId: conversation.id,
          senderId: Not(userId),
          isRead: false
        }
      });
      
      if (count > 0) {
        result[conversation.id] = count;
      }
    }
    
    // Get all groups for the user
    const userMemberships = await this.chatGroupMemberRepository.find({
      where: { userId }
    });
    
    // For each group, count unread messages
    for (const membership of userMemberships) {
      const count = await this.chatMessageRepository.count({
        where: {
          groupId: membership.groupId,
          senderId: Not(userId),
          isRead: false
        }
      });
      
      if (count > 0) {
        result[`group_${membership.groupId}`] = count;
      }
    }
    
    return result;
  }
} 