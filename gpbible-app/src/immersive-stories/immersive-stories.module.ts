import { Module } from '@nestjs/common';
import { ImmersiveStoriesService } from './immersive-stories.service';
import { ImmersiveStoriesController } from './immersive-stories.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule],
  providers: [ImmersiveStoriesService],
  controllers: [ImmersiveStoriesController],
})
export class ImmersiveStoriesModule {} 