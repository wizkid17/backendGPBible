import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FAQsController } from './faqs.controller';
import { FAQsService } from './faqs.service';
import { FAQ } from './entities/faq.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FAQ])],
  controllers: [FAQsController],
  providers: [FAQsService],
  exports: [FAQsService]
})
export class FAQsModule {} 