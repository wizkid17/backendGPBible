import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeditationService } from './meditation.service';
import { MeditationController } from './meditation.controller';
import { Meditation } from './entities/meditation.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meditation]),
    SubscriptionsModule
  ],
  providers: [MeditationService],
  controllers: [MeditationController],
  exports: [MeditationService]
})
export class MeditationModule {} 