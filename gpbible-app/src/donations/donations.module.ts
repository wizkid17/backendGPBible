import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { Donation } from './entities/donation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Donation])],
  providers: [DonationsService],
  controllers: [DonationsController],
  exports: [DonationsService],
})
export class DonationsModule {} 