import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BibleVersionsService } from './bible-versions.service';
import { BibleVersion } from './entities/bible-version.entity';

@Controller('bible-versions')
export class BibleVersionsController {
  constructor(private readonly bibleVersionsService: BibleVersionsService) {}

  @Post()
  create(@Body() bibleVersion: Partial<BibleVersion>) {
    return this.bibleVersionsService.create(bibleVersion);
  }

  @Get()
  findAll() {
    return this.bibleVersionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bibleVersionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() bibleVersion: Partial<BibleVersion>) {
    return this.bibleVersionsService.update(id, bibleVersion);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bibleVersionsService.remove(id);
  }
} 