import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatGroup } from './entities/chat-group.entity';
import { ChatGroupMember } from './entities/chat-group-member.entity';
import { ChatConversation } from './entities/chat-conversation.entity';
import { GroupInvite } from './entities/group-invite.entity';
import { Contact, CustomFieldDefinition } from './entities/contact.entity';
import { FaithfulPerson } from './entities/faithful-person.entity';
import { GroupReport } from './entities/group-report.entity';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatMessage,
      ChatGroup,
      ChatGroupMember,
      ChatConversation,
      GroupInvite,
      Contact,
      CustomFieldDefinition,
      FaithfulPerson,
      GroupReport
    ]),
    UsersModule,
    ConfigModule
  ],
  controllers: [MessagingController],
  providers: [MessagingService],
  exports: [MessagingService]
})
export class MessagingModule {} 