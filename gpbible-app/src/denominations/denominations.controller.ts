import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DenominationsService } from './denominations.service';
import { Denomination } from './entities/denomination.entity';

@Controller('denominations')
export class DenominationsController {
  constructor(private readonly denominationsService: DenominationsService) {}

  @Post()
  create(@Body() denomination: Partial<Denomination>) {
    return this.denominationsService.create(denomination);
  }

  @Get()
  findAll() {
    return this.denominationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.denominationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() denomination: Partial<Denomination>) {
    return this.denominationsService.update(id, denomination);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.denominationsService.remove(id);
  }
} 