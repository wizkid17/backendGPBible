import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAvatar } from './entities/ai-avatar.entity';
import { AiAvatarsService } from './ai-avatars.service';
import { AiAvatarsController } from './ai-avatars.controller';
import { UserPreferencesModule } from '../user-preferences/user-preferences.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiAvatar]),
    UserPreferencesModule,
    SubscriptionsModule
  ],
  providers: [AiAvatarsService],
  controllers: [AiAvatarsController],
  exports: [AiAvatarsService]
})
export class AiAvatarsModule {} 