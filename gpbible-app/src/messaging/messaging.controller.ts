import { Controller, Get, Post, Body, Param, UseGuards, Delete, Put, HttpStatus, HttpCode, Query, Patch, BadRequestException } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddGroupMembersDto } from './dto/add-group-members.dto';
import { ChatGroup } from './entities/chat-group.entity';
import { ChatConversation } from './entities/chat-conversation.entity';
import { ShareGroupDto } from './dto/share-group.dto';
import { CreateContactDto, AddExistingContactDto, CustomFieldDefinitionDto } from './dto/contact.dto';
import { GroupMemberDetailDto, RemoveGroupMemberDto, UpdateGroupMemberStatusDto } from './dto/group-member.dto';
import { AddCustomFieldDto } from './dto/member-details.dto';
import { ContactAccessPermissionDto } from './dto/contact-access.dto';
import { SearchResponseDto } from './dto/search.dto';
import { ChatActionDto, ChatDeleteConfirmationDto, ChatDeletePermissionResponse, ChatType, LeaveGroupDto, ReportGroupDto } from './dto/chat-actions.dto';
import { GroupInvitationInfoDto, JoinGroupViaInviteDto } from './dto/group-invitation.dto';
import { MemberInfoDto } from './dto/member-info.dto';
import { EditContactDto } from './dto/edit-contact.dto';

@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  // Messages endpoints
  @Post('messages')
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: User,
  ) {
    return this.messagingService.createMessage(user.id, createMessageDto);
  }

  @Get('conversations/:conversationId/messages')
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: User,
  ) {
    return this.messagingService.getConversationMessages(conversationId, user.id);
  }

  @Get('groups/:groupId/messages')
  async getGroupMessages(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
  ) {
    return this.messagingService.getGroupMessages(groupId, user.id);
  }

  @Post('conversations/:conversationId/read')
  async markMessagesAsRead(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: User,
  ) {
    return this.messagingService.markMessagesAsRead(conversationId, user.id);
  }

  // Group endpoints
  @Post('groups')
  async createGroup(
    @Body() createGroupDto: CreateGroupDto,
    @CurrentUser() user: User,
  ) {
    return this.messagingService.createGroup(user.id, createGroupDto);
  }

  @Post('groups/members')
  async addGroupMembers(
    @Body() addGroupMembersDto: AddGroupMembersDto,
    @CurrentUser() user: User,
  ) {
    return this.messagingService.addGroupMembers(user.id, addGroupMembersDto);
  }

  @Get('groups')
  async getUserGroups(@CurrentUser() user: User): Promise<ChatGroup[]> {
    return this.messagingService.getUserGroups(user.id);
  }

  @Get('groups/:groupId')
  async getGroupDetails(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
  ) {
    return this.messagingService.getGroupWithMembers(groupId);
  }

  // Conversation endpoints
  @Get('conversations')
  async getUserConversations(@CurrentUser() user: User): Promise<ChatConversation[]> {
    return this.messagingService.getUserConversations(user.id);
  }

  @Get('unread-counts')
  async getUnreadMessagesCounts(@CurrentUser() user: User): Promise<{ [key: string]: number }> {
    return this.messagingService.getUnreadMessagesCounts(user.id);
  }

  // Nuevos endpoints para la creación de grupos según la interfaz de usuario
  @Get('contacts')
  async getAvailableContacts(@CurrentUser() user: User) {
    return this.messagingService.getAvailableContacts(user.id);
  }

  @Post('groups/share')
  async shareGroup(
    @Body() shareGroupDto: ShareGroupDto,
    @CurrentUser() user: User,
  ) {
    return this.messagingService.shareGroup(user.id, shareGroupDto);
  }

  @Get('groups/:groupId/invite-link')
  async getGroupInviteLink(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
  ) {
    return this.messagingService.generateGroupInviteLink(groupId, user.id);
  }

  @Post('groups/invite/:inviteCode')
  async joinGroupViaInvite(
    @Param('inviteCode') inviteCode: string,
    @CurrentUser() user: User,
  ) {
    return this.messagingService.joinGroupViaInvite(inviteCode, user.id);
  }

  // Endpoint para obtener información de una invitación
  @Get('groups/invite/:inviteCode/info')
  async getGroupInvitationInfo(
    @Param('inviteCode') inviteCode: string
  ): Promise<GroupInvitationInfoDto> {
    return this.messagingService.getGroupInvitationInfo(inviteCode);
  }

  // Endpoint para unirse a un grupo mediante invitación (con cuerpo de solicitud)
  @Post('groups/join-via-invite')
  async joinGroupViaInviteWithBody(
    @Body() joinDto: JoinGroupViaInviteDto,
    @CurrentUser() user: User
  ) {
    return this.messagingService.joinGroupViaInvite(joinDto.inviteCode, user.id);
  }

  // Endpoints para gestión de contactos
  @Post('contacts/create')
  async createContact(
    @Body() createContactDto: CreateContactDto,
    @CurrentUser() user: User
  ) {
    return this.messagingService.createContact(user.id, createContactDto);
  }

  @Post('contacts/existing')
  async addExistingContact(
    @Body() dto: AddExistingContactDto,
    @CurrentUser() user: User
  ) {
    return this.messagingService.addExistingContact(user.id, dto);
  }

  @Get('contacts/list')
  async getUserContacts(@CurrentUser() user: User) {
    return this.messagingService.getUserContacts(user.id);
  }

  @Get('contacts/:contactId')
  async getContactDetail(
    @Param('contactId') contactId: string,
    @CurrentUser() user: User
  ) {
    return this.messagingService.getContactDetail(user.id, contactId);
  }

  @Put('contacts/:contactId')
  async updateContact(
    @Param('contactId') contactId: string, 
    @Body() updateData: Partial<CreateContactDto>,
    @CurrentUser() user: User
  ) {
    return this.messagingService.updateContact(user.id, contactId, updateData);
  }

  @Delete('contacts/:contactId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteContact(
    @Param('contactId') contactId: string,
    @CurrentUser() user: User
  ) {
    return this.messagingService.deleteContact(user.id, contactId);
  }

  // Endpoints para campos personalizados
  @Post('custom-fields')
  async createCustomField(
    @Body() dto: CustomFieldDefinitionDto,
    @CurrentUser() user: User
  ) {
    return this.messagingService.createCustomFieldDefinition(user.id, dto);
  }

  @Get('custom-fields')
  async getCustomFields(@CurrentUser() user: User) {
    return this.messagingService.getUserCustomFieldDefinitions(user.id);
  }

  @Delete('custom-fields/:fieldId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCustomField(
    @Param('fieldId') fieldId: string,
    @CurrentUser() user: User
  ) {
    return this.messagingService.deleteCustomFieldDefinition(user.id, fieldId);
  }

  // Endpoints para miembros de grupo
  @Post('groups/member-details')
  async setGroupMemberDetails(
    @Body() dto: GroupMemberDetailDto,
    @CurrentUser() user: User
  ) {
    // Verificar que el usuario es admin o miembro del grupo
    return { success: true, message: 'Member details updated' };
  }

  @Put('groups/member-status')
  async updateMemberStatus(
    @Body() dto: UpdateGroupMemberStatusDto,
    @CurrentUser() user: User
  ) {
    // Verificar que el usuario es admin del grupo
    return { success: true, message: 'Member status updated' };
  }

  @Delete('groups/member')
  async removeMember(
    @Body() dto: RemoveGroupMemberDto,
    @CurrentUser() user: User
  ) {
    // Verificar que el usuario es admin del grupo o el mismo usuario a eliminar
    return { success: true, message: 'Member removed' };
  }

  // Endpoints para información de miembros de grupo
  @Get('groups/:groupId/members/:memberId')
  async getGroupMemberDetails(
    @Param('groupId') groupId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User
  ) {
    return this.messagingService.getGroupMemberDetails(groupId, memberId, user.id);
  }
  
  @Post('groups/:groupId/members/:memberId/add-as-contact')
  async addMemberAsContact(
    @Param('groupId') groupId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User
  ) {
    return this.messagingService.addMemberAsContact(groupId, memberId, user.id);
  }
  
  // Endpoint para agregar campo personalizado a un contacto
  @Post('contacts/:contactId/custom-field')
  async addCustomFieldToContact(
    @Param('contactId') contactId: string,
    @Body() data: AddCustomFieldDto,
    @CurrentUser() user: User
  ) {
    return this.messagingService.addCustomFieldToContact(
      user.id,
      contactId,
      data.name,
      data.value
    );
  }

  // Nuevos endpoints para las funcionalidades de la imagen
  @Get('conversations/status')
  async checkConversationsStatus(@CurrentUser() user: User) {
    const hasConversations = await this.messagingService.hasConversations(user.id);
    return { hasConversations };
  }
  
  @Get('contacts/access-status')
  async getContactAccessStatus(@CurrentUser() user: User) {
    return this.messagingService.getContactAccessStatus(user.id);
  }
  
  @Post('contacts/permission')
  async setContactPermission(
    @CurrentUser() user: User,
    @Body() permissionDto: ContactAccessPermissionDto
  ) {
    await this.messagingService.setContactAccessPermission(user.id, permissionDto.allow);
    return { success: true };
  }
  
  @Get('contacts/suggestions')
  async getContactSuggestions(@CurrentUser() user: User) {
    return this.messagingService.getContactsForNewGroup(user.id);
  }

  @Get('chats/empty-state')
  async getEmptyChatsState(@CurrentUser() user: User) {
    return this.messagingService.getEmptyChatsState(user.id);
  }
  
  @Post('groups/empty')
  async createEmptyGroup(
    @CurrentUser() user: User,
    @Body() data: { name?: string }
  ) {
    return this.messagingService.createEmptyGroup(user.id, data.name);
  }

  // Endpoint para búsqueda global de contactos y chats
  @Get('search')
  async search(
    @Query('query') query: string,
    @CurrentUser() user: User,
    @Query('activeTab') activeTab?: 'chats' | 'people'
  ): Promise<SearchResponseDto> {
    const results = await this.messagingService.search(user.id, query);
    if (activeTab) {
      results.activeTab = activeTab;
    }
    return results;
  }

  // Endpoint para eliminar una conversación
  @Delete('conversations/:conversationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConversation(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: User
  ): Promise<void> {
    return this.messagingService.deleteConversation(user.id, conversationId);
  }

  // Endpoint para eliminar un grupo de chat
  @Delete('groups/:groupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGroup(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User
  ): Promise<void> {
    return this.messagingService.deleteGroup(user.id, groupId);
  }

  // Endpoint para verificar si un usuario puede eliminar un chat
  @Post('chat-permissions/can-delete')
  async canDeleteChat(
    @Body() chatActionDto: ChatActionDto,
    @CurrentUser() user: User
  ): Promise<ChatDeletePermissionResponse> {
    return this.messagingService.checkDeletePermission(user.id, chatActionDto);
  }

  // Endpoint para confirmar la eliminación de un chat
  @Post('chat/delete-confirmation')
  async confirmDeleteChat(
    @Body() confirmationDto: ChatDeleteConfirmationDto,
    @CurrentUser() user: User
  ): Promise<{ success: boolean; message: string }> {
    if (!confirmationDto.confirmed) {
      return { success: false, message: 'Operation cancelled by user' };
    }
    
    if (confirmationDto.chatType === ChatType.CONVERSATION) {
      await this.messagingService.deleteConversation(user.id, confirmationDto.chatId);
      return { success: true, message: 'Conversation deleted successfully' };
    } else if (confirmationDto.chatType === ChatType.GROUP) {
      await this.messagingService.deleteGroup(user.id, confirmationDto.chatId);
      return { success: true, message: 'Group deleted successfully' };
    }
    
    return { success: false, message: 'Invalid chat type' };
  }

  // Endpoint para obtener conversaciones eliminadas
  @Get('conversations/deleted')
  async getDeletedConversations(@CurrentUser() user: User): Promise<ChatConversation[]> {
    return this.messagingService.getDeletedConversations(user.id);
  }
  
  // Endpoint para restaurar una conversación eliminada
  @Post('conversations/:conversationId/restore')
  async restoreConversation(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: User
  ): Promise<ChatConversation> {
    return this.messagingService.restoreConversation(user.id, conversationId);
  }

  // Endpoint para salir de un grupo
  @Post('groups/:groupId/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveGroup(
    @Param('groupId') groupId: string,
    @Body() leaveGroupDto: LeaveGroupDto,
    @CurrentUser() user: User
  ): Promise<void> {
    // Verificar que el ID del grupo en el DTO coincide con el de la URL
    if (leaveGroupDto.groupId !== groupId) {
      throw new BadRequestException('Group ID mismatch');
    }

    // Verificar confirmación
    if (!leaveGroupDto.confirmed) {
      return;
    }

    return this.messagingService.leaveGroup(user.id, groupId);
  }

  // Endpoint para reportar un grupo
  @Post('groups/:groupId/report')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reportGroup(
    @Param('groupId') groupId: string,
    @Body() reportGroupDto: ReportGroupDto,
    @CurrentUser() user: User
  ): Promise<void> {
    // Verificar que el ID del grupo en el DTO coincide con el de la URL
    if (reportGroupDto.groupId !== groupId) {
      throw new BadRequestException('Group ID mismatch');
    }
    
    return this.messagingService.reportGroup(user.id, reportGroupDto);
  }

  // Endpoint para reportar y salir de un grupo
  @Post('groups/:groupId/report-and-leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reportAndLeaveGroup(
    @Param('groupId') groupId: string,
    @Body() reportGroupDto: ReportGroupDto,
    @CurrentUser() user: User
  ): Promise<void> {
    // Verificar que el ID del grupo en el DTO coincide con el de la URL
    if (reportGroupDto.groupId !== groupId) {
      throw new BadRequestException('Group ID mismatch');
    }
    
    return this.messagingService.reportAndLeaveGroup(user.id, reportGroupDto);
  }

  // Endpoint para obtener información detallada de un miembro de grupo
  @Get('groups/:groupId/members/:memberId/info')
  async getMemberInfo(
    @Param('groupId') groupId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User
  ): Promise<MemberInfoDto> {
    return this.messagingService.getMemberInfo(groupId, memberId, user.id);
  }

  // Endpoint para editar un contacto existente
  @Put('contacts')
  async editContact(
    @Body() editContactDto: EditContactDto,
    @CurrentUser() user: User
  ) {
    return this.messagingService.editContact(user.id, editContactDto);
  }
} 