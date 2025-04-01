import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DenominationsService } from './denominations.service';
import { DenominationsController } from './denominations.controller';
import { Denomination } from './entities/denomination.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Denomination])],
  providers: [DenominationsService],
  controllers: [DenominationsController],
  exports: [DenominationsService]
})
export class DenominationsModule {} 