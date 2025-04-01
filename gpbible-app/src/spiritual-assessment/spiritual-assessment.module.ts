import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpiritualAssessmentService } from './spiritual-assessment.service';
import { SpiritualAssessmentController } from './spiritual-assessment.controller';
import { SpiritualAssessment } from './entities/spiritual-assessment.entity';
import { SpiritualAssessmentQuestion } from './entities/spiritual-assessment-question.entity';
import { SpiritualAssessmentResponse } from './entities/spiritual-assessment-response.entity';
import { SpiritualAssessmentSeedService } from './spiritual-assessment-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpiritualAssessment,
      SpiritualAssessmentQuestion,
      SpiritualAssessmentResponse
    ])
  ],
  providers: [
    SpiritualAssessmentService,
    SpiritualAssessmentSeedService
  ],
  controllers: [SpiritualAssessmentController],
  exports: [SpiritualAssessmentService, SpiritualAssessmentSeedService]
})
export class SpiritualAssessmentModule {} 