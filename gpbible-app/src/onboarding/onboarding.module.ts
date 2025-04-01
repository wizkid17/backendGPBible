import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingResponse } from './entities/onboarding-response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OnboardingResponse])],
  providers: [OnboardingService],
  controllers: [OnboardingController],
  exports: [OnboardingService]
})
export class OnboardingModule {} 