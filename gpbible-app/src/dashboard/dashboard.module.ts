import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { AiAvatarsModule } from '../ai-avatars/ai-avatars.module';
import { OnboardingModule } from '../onboarding/onboarding.module';

@Module({
  imports: [
    SubscriptionsModule,
    AiAvatarsModule,
    OnboardingModule
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {} 