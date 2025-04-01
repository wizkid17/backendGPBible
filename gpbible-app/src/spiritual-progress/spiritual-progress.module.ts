import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpiritualProgressController } from './spiritual-progress.controller';
import { SpiritualProgressService } from './spiritual-progress.service';
import { UserProgress } from './entities/user-progress.entity';
import { WeeklyProgress } from './entities/weekly-progress.entity';
import { MonthlyProgress } from './entities/monthly-progress.entity';
import { OpportunityCompletion } from './entities/opportunity-completion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProgress,
      WeeklyProgress,
      MonthlyProgress,
      OpportunityCompletion
    ]),
  ],
  controllers: [SpiritualProgressController],
  providers: [SpiritualProgressService],
  exports: [SpiritualProgressService],
})
export class SpiritualProgressModule {} 