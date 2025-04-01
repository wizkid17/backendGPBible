import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpiritualGrowthService } from './spiritual-growth.service';
import { SpiritualGrowthController } from './spiritual-growth.controller';
import { SpiritualGrowthTrack } from './entities/spiritual-growth-track.entity';
import { SpiritualCheckIn } from './entities/spiritual-check-in.entity';
import { SpiritualPathQuestion, SpiritualPathSuggestion, UserSpiritualPath, UserSpiritualQuestion } from './entities/spiritual-path.entity';
import { SpiritualPathTempSelection } from './entities/spiritual-path-selection.entity';
import { WeeklySpiritualObjective, WeeklySpiritualOpportunity } from './entities/weekly-path.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpiritualGrowthTrack, 
      SpiritualCheckIn,
      SpiritualPathQuestion,
      SpiritualPathSuggestion,
      UserSpiritualPath,
      UserSpiritualQuestion,
      SpiritualPathTempSelection,
      WeeklySpiritualObjective,
      WeeklySpiritualOpportunity
    ]),
    SubscriptionsModule
  ],
  providers: [SpiritualGrowthService],
  controllers: [SpiritualGrowthController],
  exports: [SpiritualGrowthService]
})
export class SpiritualGrowthModule {} 