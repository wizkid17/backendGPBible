import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, ILike } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatGroup } from './entities/chat-group.entity';
import { ChatGroupMember } from './entities/chat-group-member.entity';
import { ChatConversation } from './entities/chat-conversation.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddGroupMembersDto } from './dto/add-group-members.dto';
import { ShareGroupDto, SharePlatform } from './dto/share-group.dto';
import { User } from '../users/entities/user.entity';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { GroupInvite } from './entities/group-invite.entity';
import { Contact, CustomFieldDefinition } from './entities/contact.entity';
import { FaithfulPerson } from './entities/faithful-person.entity';
import { GroupReport } from './entities/group-report.entity';
import { CreateContactDto, AddExistingContactDto, CustomFieldDefinitionDto } from './dto/contact.dto';
import { v4 as uuidv4 } from 'uuid';
import { ChatSearchResult, PersonSearchResult, SearchResponseDto } from './dto/search.dto';
import { ChatActionDto, ChatType, ChatDeletePermissionResponse, ReportReason, ReportGroupDto } from './dto/chat-actions.dto';
import { GroupInvitationInfoDto, MemberPreviewDto } from './dto/group-invitation.dto';
import { MemberInfoDto } from './dto/member-info.dto';
import { EditContactDto } from './dto/edit-contact.dto';

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
    @InjectRepository(GroupInvite)
    private groupInviteRepository: Repository<GroupInvite>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(CustomFieldDefinition)
    private customFieldDefRepository: Repository<CustomFieldDefinition>,
    @InjectRepository(FaithfulPerson)
    private faithfulPersonRepository: Repository<FaithfulPerson>,
    @InjectRepository(GroupReport)
    private groupReportRepository: Repository<GroupReport>,
    private usersService: UsersService,
    private configService: ConfigService,
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

  // Métodos nuevos para la interfaz de grupos

  async getAvailableContacts(userId: string): Promise<User[]> {
    // Obtener todos los usuarios con los que se ha tenido conversación o que están en grupos comunes
    const conversations = await this.chatConversationRepository.find({
      where: [
        { user1Id: userId },
        { user2Id: userId }
      ],
      relations: ['user1', 'user2']
    });

    const memberships = await this.chatGroupMemberRepository.find({
      where: { userId },
      relations: ['group', 'group.members', 'group.members.user']
    });

    // Extrae los usuarios de las conversaciones
    const conversationUsers = conversations.flatMap(conv => {
      if (conv.user1Id === userId) return [conv.user2];
      return [conv.user1];
    });

    // Extrae usuarios de los grupos comunes
    const groupUsers = memberships.flatMap(membership => 
      membership.group.members
        .filter(member => member.userId !== userId)
        .map(member => member.user)
    );

    // Combina y elimina duplicados
    const allContactIds = new Set([
      ...conversationUsers.map(user => user.id),
      ...groupUsers.map(user => user.id)
    ]);

    // Si no hay contactos, obtener algunos usuarios del sistema
    if (allContactIds.size === 0) {
      return this.usersService.findAll({ limit: 10, excludeIds: [userId] });
    }

    return this.usersService.findByIds([...allContactIds]);
  }

  async shareGroup(userId: string, shareGroupDto: ShareGroupDto): Promise<{ success: boolean; shareUrl?: string }> {
    const { groupId, platform, message } = shareGroupDto;
    
    // Verificar que el usuario es miembro del grupo
    const membership = await this.chatGroupMemberRepository.findOne({
      where: { groupId, userId }
    });
    
    if (!membership) {
      throw new BadRequestException('You are not a member of this group');
    }
    
    // Generar enlace de invitación
    const inviteLink = await this.generateGroupInviteLink(groupId, userId);
    
    // En una implementación real, aquí enviarías el enlace según la plataforma
    switch (platform) {
      case SharePlatform.EMAIL:
        // Enviar por email usando un servicio de email
        console.log(`Sharing group ${groupId} via email with link ${inviteLink.inviteLink}`);
        break;
      case SharePlatform.WHATSAPP:
        // Preparar enlace para WhatsApp
        console.log(`Sharing group ${groupId} via WhatsApp with link ${inviteLink.inviteLink}`);
        break;
      case SharePlatform.SMS:
        // Enviar por SMS
        console.log(`Sharing group ${groupId} via SMS with link ${inviteLink.inviteLink}`);
        break;
      case SharePlatform.COPY_LINK:
        // Solo devolver el enlace para copiar
        break;
    }
    
    return { 
      success: true,
      shareUrl: inviteLink.inviteLink
    };
  }

  async generateGroupInviteLink(groupId: string, userId: string): Promise<{ inviteLink: string; expiresAt: Date }> {
    // Verificar que el usuario es miembro del grupo
    const membership = await this.chatGroupMemberRepository.findOne({
      where: { groupId, userId }
    });
    
    if (!membership) {
      throw new BadRequestException('You are not a member of this group');
    }
    
    // Generar un código único para la invitación
    const inviteCode = randomBytes(16).toString('hex');
    
    // Configurar una expiración de 7 días
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Guardar la invitación en la base de datos
    await this.groupInviteRepository.save({
      code: inviteCode,
      groupId,
      createdById: userId,
      expiresAt
    });
    
    // Generar el enlace de invitación
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const inviteLink = `${frontendUrl}/join-group/${inviteCode}`;
    
    return {
      inviteLink,
      expiresAt
    };
  }

  async joinGroupViaInvite(inviteCode: string, userId: string): Promise<{ 
    group: ChatGroup; 
    isNewMember: boolean;
    memberCount: number;
  }> {
    // Buscar la invitación en la base de datos
    const invite = await this.groupInviteRepository.findOne({
      where: { code: inviteCode },
      relations: ['group']
    });
    
    if (!invite) {
      throw new NotFoundException('Invitation not found or already expired');
    }
    
    // Verificar si no ha expirado
    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }
    
    const groupId = invite.groupId;
    
    // Verificar si el usuario ya es miembro
    const existingMembership = await this.chatGroupMemberRepository.findOne({
      where: { groupId, userId }
    });
    
    if (existingMembership) {
      // Si ya es miembro, simplemente devolver el grupo
      const group = await this.getGroupWithMembers(groupId);
      const memberCount = await this.chatGroupMemberRepository.count({ where: { groupId } });
      
      return {
        group,
        isNewMember: false,
        memberCount
      };
    }
    
    // Añadir el usuario como miembro
    await this.chatGroupMemberRepository.save({
      groupId,
      userId,
      isAdmin: false
    });
    
    const group = await this.getGroupWithMembers(groupId);
    const memberCount = await this.chatGroupMemberRepository.count({ where: { groupId } });
    
    return {
      group,
      isNewMember: true,
      memberCount
    };
  }

  // Métodos de gestión de contactos
  async createContact(userId: string, createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create({
      id: uuidv4(),
      ownerId: userId,
      ...createContactDto,
    });

    return this.contactRepository.save(contact);
  }

  async addExistingContact(userId: string, dto: AddExistingContactDto): Promise<Contact> {
    // Verificar que el usuario a agregar existe
    const contactUser = await this.usersService.findById(dto.userId);
    if (!contactUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Verificar si ya existe este contacto
    const existingContact = await this.contactRepository.findOne({
      where: {
        ownerId: userId,
        contactUserId: dto.userId
      }
    });

    if (existingContact) {
      throw new HttpException('Contact already exists', HttpStatus.CONFLICT);
    }

    // Crear nuevo contacto con la información del usuario existente
    const contact = this.contactRepository.create({
      id: uuidv4(),
      ownerId: userId,
      contactUserId: dto.userId,
      name: contactUser.firstName || '',
      secondName: contactUser.lastName || '',
      email: contactUser.email,
    });

    return this.contactRepository.save(contact);
  }

  async getUserContacts(userId: string): Promise<Contact[]> {
    return this.contactRepository.find({
      where: { ownerId: userId },
      order: { name: 'ASC' }
    });
  }

  async getContactDetail(userId: string, contactId: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId, ownerId: userId }
    });

    if (!contact) {
      throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
    }

    return contact;
  }

  async updateContact(userId: string, contactId: string, updateData: Partial<CreateContactDto>): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId, ownerId: userId }
    });

    if (!contact) {
      throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
    }

    Object.assign(contact, updateData);
    return this.contactRepository.save(contact);
  }

  async deleteContact(userId: string, contactId: string): Promise<void> {
    const result = await this.contactRepository.delete({
      id: contactId,
      ownerId: userId
    });

    if (result.affected === 0) {
      throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
    }
  }

  // Métodos para campos personalizados
  async createCustomFieldDefinition(userId: string, dto: CustomFieldDefinitionDto): Promise<CustomFieldDefinition> {
    // Verificar si ya existe un campo con el mismo nombre
    const existing = await this.customFieldDefRepository.findOne({
      where: { userId, name: dto.name }
    });

    if (existing) {
      throw new HttpException('Custom field with this name already exists', HttpStatus.CONFLICT);
    }

    const customField = this.customFieldDefRepository.create({
      id: uuidv4(),
      userId,
      name: dto.name
    });

    return this.customFieldDefRepository.save(customField);
  }

  async getUserCustomFieldDefinitions(userId: string): Promise<CustomFieldDefinition[]> {
    return this.customFieldDefRepository.find({
      where: { userId },
      order: { name: 'ASC' }
    });
  }

  async deleteCustomFieldDefinition(userId: string, fieldId: string): Promise<void> {
    const result = await this.customFieldDefRepository.delete({
      id: fieldId,
      userId
    });

    if (result.affected === 0) {
      throw new HttpException('Custom field not found', HttpStatus.NOT_FOUND);
    }
  }

  // Métodos para miembros de grupo
  async getGroupMemberDetails(groupId: string, memberId: string, currentUserId: string): Promise<any> {
    // Verificar que el usuario actual es miembro del grupo
    const currentUserMembership = await this.chatGroupMemberRepository.findOne({
      where: { groupId, userId: currentUserId }
    });
    
    if (!currentUserMembership) {
      throw new BadRequestException('You are not a member of this group');
    }
    
    // Obtener datos del miembro
    const memberUser = await this.usersService.findById(memberId);
    if (!memberUser) {
      throw new NotFoundException('Member not found');
    }
    
    // Verificar si el miembro pertenece al grupo
    const isMember = await this.chatGroupMemberRepository.findOne({
      where: { groupId, userId: memberId }
    });
    
    if (!isMember) {
      throw new NotFoundException('User is not a member of this group');
    }
    
    // Verificar si hay un contacto existente para este usuario
    const existingContact = await this.contactRepository.findOne({
      where: {
        ownerId: currentUserId,
        contactUserId: memberId
      }
    });
    
    // Obtener otros grupos comunes
    const currentUserGroups = await this.chatGroupMemberRepository.find({
      where: { userId: currentUserId },
      select: ['groupId']
    });
    
    const memberGroups = await this.chatGroupMemberRepository.find({
      where: { userId: memberId },
      select: ['groupId']
    });
    
    const currentUserGroupIds = currentUserGroups.map(g => g.groupId);
    const memberGroupIds = memberGroups.map(g => g.groupId);
    
    // Encontrar grupos comunes (intersección)
    const commonGroupIds = currentUserGroupIds.filter(id => memberGroupIds.includes(id) && id !== groupId);
    
    let commonGroups = [];
    if (commonGroupIds.length > 0) {
      commonGroups = await this.chatGroupRepository.find({
        where: { id: In(commonGroupIds) },
        select: ['id', 'name']
      });
    }
    
    return {
      user: {
        id: memberUser.id,
        name: memberUser.firstName,
        lastName: memberUser.lastName,
        email: memberUser.email,
        profilePicture: memberUser.picture,
        phoneNumber: existingContact?.phoneNumber || null,
        isContact: !!existingContact
      },
      membership: {
        isAdmin: isMember.isAdmin,
        joinedAt: isMember.joinedAt
      },
      commonGroups
    };
  }
  
  async addCustomFieldToContact(userId: string, contactId: string, fieldName: string, fieldValue: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId, ownerId: userId }
    });
    
    if (!contact) {
      throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
    }
    
    // Inicializar customFields si no existe
    if (!contact.customFields) {
      contact.customFields = {};
    }
    
    // Agregar o actualizar el campo personalizado
    contact.customFields[fieldName] = fieldValue;
    
    return this.contactRepository.save(contact);
  }
  
  async addMemberAsContact(groupId: string, memberId: string, currentUserId: string): Promise<Contact> {
    // Verificar que el usuario actual es miembro del grupo
    const currentUserMembership = await this.chatGroupMemberRepository.findOne({
      where: { groupId, userId: currentUserId }
    });
    
    if (!currentUserMembership) {
      throw new BadRequestException('You are not a member of this group');
    }
    
    // Verificar si el miembro pertenece al grupo
    const isMember = await this.chatGroupMemberRepository.findOne({
      where: { groupId, userId: memberId }
    });
    
    if (!isMember) {
      throw new NotFoundException('User is not a member of this group');
    }
    
    // Verificar si ya existe como contacto
    const existingContact = await this.contactRepository.findOne({
      where: {
        ownerId: currentUserId,
        contactUserId: memberId
      }
    });
    
    if (existingContact) {
      throw new HttpException('User is already a contact', HttpStatus.CONFLICT);
    }
    
    // Agregar como contacto
    return this.addExistingContact(currentUserId, { userId: memberId });
  }

  // Métodos para manejo de contactos del sistema
  async getContactAccessStatus(userId: string): Promise<{ hasRequestedAccess: boolean; hasPermission: boolean; contactCount: number }> {
    // Verificar si el usuario ha solicitado acceso a los contactos
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // En una implementación real, esto se guardaría en la base de datos
    // Aquí simulamos que el usuario ya solicitó acceso pero no lo tiene concedido
    const hasRequestedAccess = user.contactPermissionRequested || false;
    const hasPermission = user.contactPermissionGranted || false;
    
    // Obtener el conteo de contactos (simulado)
    const contactCount = hasPermission ? 350 : 0;
    
    return {
      hasRequestedAccess,
      hasPermission,
      contactCount
    };
  }
  
  async setContactAccessPermission(userId: string, allow: boolean): Promise<void> {
    // En una implementación real, esto actualizaría el estado de permisos en la base de datos
    await this.usersService.updateContactPermission(userId, allow);
  }
  
  async hasConversations(userId: string): Promise<boolean> {
    // Contar conversaciones directas
    const conversationsCount = await this.chatConversationRepository.count({
      where: [
        { user1Id: userId, isActive: true },
        { user2Id: userId, isActive: true }
      ]
    });
    
    // Contar grupos
    const groupsCount = await this.chatGroupMemberRepository.count({
      where: { userId }
    });
    
    return conversationsCount > 0 || groupsCount > 0;
  }
  
  async getContactsForNewGroup(userId: string): Promise<{ friends: User[]; systemContacts: User[] }> {
    // Contactos del sistema (usuarios con los que ya ha interactuado)
    const conversations = await this.chatConversationRepository.find({
      where: [
        { user1Id: userId },
        { user2Id: userId }
      ],
      relations: ['user1', 'user2']
    });
    
    // Extraer usuarios de las conversaciones
    const conversationUsers = conversations.flatMap(conv => {
      if (conv.user1Id === userId) return [conv.user2];
      return [conv.user1];
    });
    
    // Obtener una lista de amigos frecuentes (simulación)
    const friends = await this.usersService.findByIds([...new Set(conversationUsers.map(u => u.id))].slice(0, 5));
    
    // Obtener otros usuarios del sistema como sugerencias
    const systemContacts = await this.usersService.findAll({ 
      limit: 15, 
      excludeIds: [userId, ...friends.map(f => f.id)]
    });
    
    return {
      friends,
      systemContacts
    };
  }

  // Métodos para manejar casos secundarios (pantallas de la imagen)
  async getEmptyChatsState(userId: string): Promise<{
    hasContacts: boolean;
    canCreateGroup: boolean;
    needsContactPermission: boolean;
  }> {
    // Verificar si tiene contactos
    const contactCount = await this.contactRepository.count({
      where: { ownerId: userId }
    });
    
    // Verificar permisos de contactos
    const contactPermissionStatus = await this.getContactAccessStatus(userId);
    
    return {
      hasContacts: contactCount > 0,
      canCreateGroup: contactCount > 0 || contactPermissionStatus.hasPermission,
      needsContactPermission: !contactPermissionStatus.hasPermission && contactCount === 0
    };
  }
  
  async createEmptyGroup(userId: string, name: string): Promise<ChatGroup> {
    // Crear un grupo vacío que luego se puede completar con miembros
    const group = this.chatGroupRepository.create({
      name: name || 'New Group',
      description: '',
      createdById: userId
    });
    
    const savedGroup = await this.chatGroupRepository.save(group);
    
    // Agregar al creador como administrador
    await this.chatGroupMemberRepository.save({
      groupId: savedGroup.id,
      userId,
      isAdmin: true
    });
    
    return this.getGroupWithMembers(savedGroup.id);
  }

  // Método para búsqueda global
  async search(userId: string, query: string): Promise<SearchResponseDto> {
    if (!query || query.trim().length < 2) {
      return { people: [], chats: [] };
    }
    
    // Búsqueda de personas (usuarios)
    const people = await this.searchPeople(userId, query);
    
    // Búsqueda de chats (grupos y conversaciones)
    const chats = await this.searchChats(userId, query);
    
    return {
      people,
      chats
    };
  }
  
  private async searchPeople(userId: string, query: string): Promise<PersonSearchResult[]> {
    const result: PersonSearchResult[] = [];
    
    // Primero buscar personas influyentes (Powerful faithful people)
    const faithfulPersons = await this.faithfulPersonRepository.find({
      where: { isActive: true },
      relations: ['user']
    });
    
    // Filtrar por nombre
    const matchingFaithfulPersons = faithfulPersons.filter(person => 
      person.user &&
      (person.user.firstName?.toLowerCase().includes(query.toLowerCase()) ||
      person.user.lastName?.toLowerCase().includes(query.toLowerCase()) ||
      person.title.toLowerCase().includes(query.toLowerCase()))
    );
    
    // Agregar personas influyentes a los resultados
    for (const person of matchingFaithfulPersons) {
      if (person.user.id === userId) continue; // Skip current user
      
      result.push({
        id: person.user.id,
        name: person.title,
        picture: person.user.picture,
        lastMessage: person.defaultMessage,
        timestamp: new Date(),
        isFaithful: true
      });
    }
    
    // Luego buscar usuarios regulares
    const users = await this.usersService.searchUsers(query, userId);
    
    // Filtrar usuarios que ya están en los resultados como personas influyentes
    const filteredUsers = users.filter(user => 
      !matchingFaithfulPersons.some(person => person.user.id === user.id)
    );
    
    // Obtener mensajes más recientes para cada usuario
    for (const user of filteredUsers) {
      // Buscar la conversación entre el usuario actual y el usuario encontrado
      const conversation = await this.chatConversationRepository.findOne({
        where: [
          { user1Id: userId, user2Id: user.id, isActive: true },
          { user1Id: user.id, user2Id: userId, isActive: true }
        ]
      });
      
      let lastMessage = null;
      let timestamp = null;
      
      if (conversation) {
        // Buscar el último mensaje
        const message = await this.chatMessageRepository.findOne({
          where: { conversationId: conversation.id },
          order: { createdAt: 'DESC' }
        });
        
        if (message) {
          lastMessage = message.content.length > 30 
            ? `${message.content.substring(0, 30)}...` 
            : message.content;
          timestamp = message.createdAt;
        }
      }
      
      result.push({
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        picture: user.picture,
        lastMessage: lastMessage,
        timestamp: timestamp,
        isFaithful: false
      });
    }
    
    // Ordenar para que las personas influyentes aparezcan primero
    result.sort((a, b) => {
      // Primero personas influyentes
      if (a.isFaithful && !b.isFaithful) return -1;
      if (!a.isFaithful && b.isFaithful) return 1;
      
      // Luego por timestamp
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
    
    return result;
  }
  
  private async searchChats(userId: string, query: string): Promise<ChatSearchResult[]> {
    const result: ChatSearchResult[] = [];
    
    // Buscar grupos que coincidan con la consulta
    const groupMemberships = await this.chatGroupMemberRepository.find({
      where: { userId },
      relations: ['group']
    });
    
    const userGroups = groupMemberships.map(membership => membership.group);
    
    // Filtrar grupos por nombre
    const matchingGroups = userGroups.filter(group => 
      group.name.toLowerCase().includes(query.toLowerCase())
    );
    
    // Obtener mensajes más recientes para cada grupo
    for (const group of matchingGroups) {
      // Buscar el último mensaje
      const message = await this.chatMessageRepository.findOne({
        where: { groupId: group.id },
        order: { createdAt: 'DESC' },
        relations: ['sender']
      });
      
      let lastMessage = null;
      let timestamp = null;
      
      if (message) {
        const senderName = message.sender 
          ? `${message.sender.firstName || ''}: ` 
          : '';
        
        lastMessage = `${senderName}${message.content.length > 25 
          ? `${message.content.substring(0, 25)}...` 
          : message.content}`;
        timestamp = message.createdAt;
      }
      
      result.push({
        id: group.id,
        type: 'group',
        name: group.name,
        picture: group.avatarUrl,
        lastMessage: lastMessage,
        timestamp: timestamp
      });
    }
    
    // Buscar conversaciones que coincidan con la consulta
    const conversations = await this.chatConversationRepository.find({
      where: [
        { user1Id: userId, isActive: true },
        { user2Id: userId, isActive: true }
      ],
      relations: ['user1', 'user2']
    });
    
    // Para cada conversación, verificar si el nombre del otro usuario coincide con la consulta
    for (const conversation of conversations) {
      const otherUser = conversation.user1Id === userId 
        ? conversation.user2 
        : conversation.user1;
      
      const otherUserName = `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim();
      
      if (otherUserName.toLowerCase().includes(query.toLowerCase())) {
        // Buscar el último mensaje
        const message = await this.chatMessageRepository.findOne({
          where: { conversationId: conversation.id },
          order: { createdAt: 'DESC' }
        });
        
        let lastMessage = null;
        let timestamp = null;
        
        if (message) {
          lastMessage = message.content.length > 30 
            ? `${message.content.substring(0, 30)}...` 
            : message.content;
          timestamp = message.createdAt;
        }
        
        result.push({
          id: conversation.id,
          type: 'conversation',
          name: otherUserName,
          picture: otherUser.picture,
          lastMessage: lastMessage,
          timestamp: timestamp
        });
      }
    }
    
    // Ordenar por timestamp (más reciente primero)
    result.sort((a, b) => {
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
    
    return result;
  }

  // Método para eliminar una conversación
  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    // Verificar que el usuario es parte de la conversación
    const conversation = await this.chatConversationRepository.findOne({
      where: { 
        id: conversationId,
        isActive: true 
      }
    });
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verificar que el usuario es parte de la conversación
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new BadRequestException('You are not part of this conversation');
    }

    // Marcar la conversación como inactiva en lugar de eliminarla físicamente
    // Esto permitirá mantener el historial si se necesita recuperar más tarde
    conversation.isActive = false;
    await this.chatConversationRepository.save(conversation);
  }

  // Método para eliminar un grupo de chat
  async deleteGroup(userId: string, groupId: string): Promise<void> {
    // Verificar que el grupo existe
    const group = await this.chatGroupRepository.findOne({
      where: { id: groupId }
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Verificar que el usuario es un administrador del grupo
    const userMembership = await this.chatGroupMemberRepository.findOne({
      where: { 
        groupId, 
        userId,
        isAdmin: true 
      }
    });

    if (!userMembership) {
      throw new BadRequestException('Only group administrators can delete a group');
    }

    // Eliminar todos los miembros del grupo
    await this.chatGroupMemberRepository.delete({ groupId });

    // Eliminar el grupo
    await this.chatGroupRepository.delete(groupId);
  }

  // Método para verificar si un usuario puede eliminar un chat
  async checkDeletePermission(
    userId: string, 
    chatActionDto: ChatActionDto
  ): Promise<ChatDeletePermissionResponse> {
    const { chatId, chatType } = chatActionDto;
    
    if (chatType === ChatType.CONVERSATION) {
      // Verificar permisos para conversación
      const conversation = await this.chatConversationRepository.findOne({
        where: { 
          id: chatId,
          isActive: true 
        }
      });
      
      if (!conversation) {
        return {
          canDelete: false,
          message: 'Conversation not found'
        };
      }
      
      // Un usuario siempre puede eliminar sus propias conversaciones
      if (conversation.user1Id === userId || conversation.user2Id === userId) {
        return {
          canDelete: true
        };
      }
      
      return {
        canDelete: false,
        message: 'You are not part of this conversation'
      };
    } 
    else if (chatType === ChatType.GROUP) {
      // Verificar permisos para grupo
      const group = await this.chatGroupRepository.findOne({
        where: { id: chatId }
      });
      
      if (!group) {
        return {
          canDelete: false,
          message: 'Group not found'
        };
      }
      
      // Verificar si el usuario es miembro del grupo
      const membership = await this.chatGroupMemberRepository.findOne({
        where: { 
          groupId: chatId, 
          userId
        }
      });
      
      if (!membership) {
        return {
          canDelete: false,
          message: 'You are not a member of this group'
        };
      }
      
      // Solo administradores pueden eliminar grupos
      if (membership.isAdmin) {
        return {
          canDelete: true,
          isAdmin: true
        };
      }
      
      return {
        canDelete: false,
        isAdmin: false,
        message: 'Only group administrators can delete a group'
      };
    }
    
    return {
      canDelete: false,
      message: 'Invalid chat type'
    };
  }

  // Método para obtener el historial de conversaciones eliminadas
  async getDeletedConversations(userId: string): Promise<ChatConversation[]> {
    // Obtener todas las conversaciones inactivas del usuario
    return this.chatConversationRepository.find({
      where: [
        { user1Id: userId, isActive: false },
        { user2Id: userId, isActive: false }
      ],
      relations: ['user1', 'user2'],
      order: { lastMessageAt: 'DESC' }
    });
  }
  
  // Método para restaurar una conversación
  async restoreConversation(userId: string, conversationId: string): Promise<ChatConversation> {
    // Verificar que la conversación existe y pertenece al usuario
    const conversation = await this.chatConversationRepository.findOne({
      where: [
        { id: conversationId, user1Id: userId, isActive: false },
        { id: conversationId, user2Id: userId, isActive: false }
      ]
    });
    
    if (!conversation) {
      throw new NotFoundException('Deleted conversation not found or you do not have access to it');
    }
    
    // Restaurar la conversación
    conversation.isActive = true;
    return this.chatConversationRepository.save(conversation);
  }

  // Método para que un usuario abandone un grupo
  async leaveGroup(userId: string, groupId: string): Promise<void> {
    // Verificar que el grupo existe
    const group = await this.chatGroupRepository.findOne({
      where: { id: groupId }
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Verificar que el usuario es miembro del grupo
    const membership = await this.chatGroupMemberRepository.findOne({
      where: { 
        groupId, 
        userId 
      }
    });

    if (!membership) {
      throw new BadRequestException('You are not a member of this group');
    }

    // Si es el único administrador, verificar si hay otros miembros
    if (membership.isAdmin) {
      const adminCount = await this.chatGroupMemberRepository.count({
        where: {
          groupId,
          isAdmin: true
        }
      });

      const memberCount = await this.chatGroupMemberRepository.count({
        where: { groupId }
      });

      if (adminCount === 1 && memberCount > 1) {
        // Si es el único administrador y hay más miembros,
        // asignar otro miembro como administrador
        const otherMember = await this.chatGroupMemberRepository.findOne({
          where: {
            groupId,
            userId: Not(userId)
          }
        });

        if (otherMember) {
          otherMember.isAdmin = true;
          await this.chatGroupMemberRepository.save(otherMember);
        }
      } else if (memberCount === 1) {
        // Si es el único miembro, eliminar el grupo
        await this.chatGroupRepository.delete(groupId);
        return;
      }
    }

    // Eliminar al miembro del grupo
    await this.chatGroupMemberRepository.delete({
      groupId,
      userId
    });
  }

  // Método para reportar un grupo
  async reportGroup(userId: string, reportDto: ReportGroupDto): Promise<void> {
    const { groupId, reason, details } = reportDto;

    // Verificar que el grupo existe
    const group = await this.chatGroupRepository.findOne({
      where: { id: groupId }
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Verificar que el usuario es miembro del grupo
    const membership = await this.chatGroupMemberRepository.findOne({
      where: { 
        groupId, 
        userId 
      }
    });

    if (!membership) {
      throw new BadRequestException('You can only report groups you are a member of');
    }

    // Crear y guardar el reporte
    const report = this.groupReportRepository.create({
      id: uuidv4(),
      groupId,
      reportedById: userId,
      reason,
      details,
      reviewed: false,
      createdAt: new Date()
    });
    
    await this.groupReportRepository.save(report);
  }
  
  // Método para combinar salir y reportar un grupo
  async reportAndLeaveGroup(userId: string, reportDto: ReportGroupDto): Promise<void> {
    // Primero reportamos el grupo
    await this.reportGroup(userId, reportDto);
    
    // Luego salimos del grupo
    await this.leaveGroup(userId, reportDto.groupId);
  }

  // Método para obtener información de una invitación sin unirse al grupo
  async getGroupInvitationInfo(inviteCode: string): Promise<GroupInvitationInfoDto> {
    // Buscar la invitación en la base de datos
    const invite = await this.groupInviteRepository.findOne({
      where: { code: inviteCode },
      relations: ['group', 'createdBy']
    });
    
    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }
    
    // Verificar si la invitación ha expirado
    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }
    
    const { group, createdBy } = invite;
    
    // Obtener miembros del grupo para la vista previa (limitado a 5)
    const members = await this.chatGroupMemberRepository.find({
      where: { groupId: group.id },
      relations: ['user'],
      take: 5
    });
    
    // Transformar miembros a formato de vista previa
    const memberPreview: MemberPreviewDto[] = members.map(member => ({
      id: member.user.id,
      name: `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim(),
      picture: member.user.picture
    }));
    
    // Construir respuesta
    return {
      groupId: group.id,
      groupName: group.name,
      createdAt: invite.createdAt.toISOString(),
      avatarUrl: group.avatarUrl,
      memberPreview,
      createdById: createdBy.id,
      creatorName: `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim()
    };
  }

  async getMemberInfo(groupId: string, memberId: string, requesterId: string): Promise<MemberInfoDto> {
    // Verificar que el solicitante sea miembro del grupo
    const requesterMember = await this.chatGroupMemberRepository.findOne({
      where: { groupId, userId: requesterId }
    });
    
    if (!requesterMember) {
      throw new BadRequestException('You are not a member of this group');
    }
    
    // Verificar que el miembro solicitado pertenezca al grupo
    const member = await this.chatGroupMemberRepository.findOne({
      where: { groupId, userId: memberId },
      relations: ['user']
    });
    
    if (!member) {
      throw new NotFoundException('Member not found in this group');
    }
    
    // Verificar si el usuario es una persona "faithful"
    const faithfulPerson = await this.faithfulPersonRepository.findOne({
      where: { userId: memberId, isActive: true }
    });
    
    // Buscar información de contacto si existe
    const contact = await this.contactRepository.findOne({
      where: { ownerId: requesterId, contactUserId: memberId }
    });
    
    // Construir la respuesta
    const memberInfo: MemberInfoDto = {
      id: memberId,
      name: `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim(),
      picture: member.user.picture,
      isGroupAdmin: member.isAdmin,
      isFaithful: !!faithfulPerson,
      joinedAt: member.joinedAt
    };
    
    // Agregar información de contacto si existe
    if (contact) {
      memberInfo.email = contact.email || member.user.email;
      memberInfo.phoneNumber = contact.phoneNumber;
      memberInfo.secondName = contact.secondName;
      memberInfo.suffix = contact.suffix;
      memberInfo.nickname = contact.nickname;
      memberInfo.jobTitle = contact.jobTitle;
      memberInfo.department = contact.department;
      
      // Agregar campos personalizados si existen
      if (contact.customFields) {
        const customFieldsEntries = Object.entries(contact.customFields);
        if (customFieldsEntries.length > 0) {
          memberInfo.customFields = customFieldsEntries.map(([key, value]) => ({
            key,
            label: key, // Podríamos tener una traducción más amigable del campo si es necesario
            value: value || ''
          }));
        }
      }
    }
    
    return memberInfo;
  }

  async editContact(userId: string, editContactDto: EditContactDto): Promise<Contact> {
    // Buscar el contacto
    const contact = await this.contactRepository.findOne({
      where: { id: editContactDto.id, ownerId: userId }
    });
    
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    
    // Actualizar los campos proporcionados
    if (editContactDto.name !== undefined) {
      contact.name = editContactDto.name;
    }
    
    if (editContactDto.secondName !== undefined) {
      contact.secondName = editContactDto.secondName;
    }
    
    if (editContactDto.email !== undefined) {
      contact.email = editContactDto.email;
    }
    
    if (editContactDto.phoneNumber !== undefined) {
      contact.phoneNumber = editContactDto.phoneNumber;
    }
    
    if (editContactDto.suffix !== undefined) {
      contact.suffix = editContactDto.suffix;
    }
    
    if (editContactDto.nickname !== undefined) {
      contact.nickname = editContactDto.nickname;
    }
    
    if (editContactDto.jobTitle !== undefined) {
      contact.jobTitle = editContactDto.jobTitle;
    }
    
    if (editContactDto.department !== undefined) {
      contact.department = editContactDto.department;
    }
    
    // Actualizar campos personalizados si se proporcionaron
    if (editContactDto.customFields) {
      // Si no hay campos personalizados previos, inicializar
      if (!contact.customFields) {
        contact.customFields = {};
      }
      
      // Actualizar campos existentes y agregar nuevos
      Object.assign(contact.customFields, editContactDto.customFields);
    }
    
    // Guardar los cambios
    return this.contactRepository.save(contact);
  }
} 