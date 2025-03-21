import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpiritualGrowthService } from './spiritual-growth.service';
import { SpiritualGrowthController } from './spiritual-growth.controller';
import { SpiritualGrowthTrack } from './entities/spiritual-growth-track.entity';
import { SpiritualCheckIn } from './entities/spiritual-check-in.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpiritualGrowthTrack, SpiritualCheckIn]),
    SubscriptionsModule
  ],
  providers: [SpiritualGrowthService],
  controllers: [SpiritualGrowthController],
  exports: [SpiritualGrowthService]
})
export class SpiritualGrowthModule {} 