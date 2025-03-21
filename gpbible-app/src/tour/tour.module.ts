import { Module } from '@nestjs/common';
import { TourService } from './tour.service';
import { TourController } from './tour.controller';
import { OnboardingModule } from '../onboarding/onboarding.module';

@Module({
  imports: [OnboardingModule],
  controllers: [TourController],
  providers: [TourService],
  exports: [TourService]
})
export class TourModule {} 