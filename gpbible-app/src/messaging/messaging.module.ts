import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatGroup } from './entities/chat-group.entity';
import { ChatGroupMember } from './entities/chat-group-member.entity';
import { ChatConversation } from './entities/chat-conversation.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatMessage,
      ChatGroup,
      ChatGroupMember,
      ChatConversation
    ]),
    UsersModule
  ],
  controllers: [MessagingController],
  providers: [MessagingService],
  exports: [MessagingService]
})
export class MessagingModule {} 