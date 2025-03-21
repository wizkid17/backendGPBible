import { Module } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';
import { AiChatController } from './ai-chat.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule],
  providers: [AiChatService],
  controllers: [AiChatController],
})
export class AiChatModule {} 