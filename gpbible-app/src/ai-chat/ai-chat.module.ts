import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiChatService } from './ai-chat.service';
import { AiChatController } from './ai-chat.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ChatConversation } from './entities/chat-conversation.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { AiChatMessage } from './entities/ai-chat-message.entity';
import { OpenAiService } from './services/openai.service';
import { BibleVersionsModule } from '../bible-versions/bible-versions.module';

@Module({
  imports: [
    ConfigModule,
    SubscriptionsModule,
    BibleVersionsModule,
    TypeOrmModule.forFeature([ChatConversation, ChatMessage, AiChatMessage])
  ],
  providers: [AiChatService, OpenAiService],
  controllers: [AiChatController],
  exports: [AiChatService]
})
export class AiChatModule {} 