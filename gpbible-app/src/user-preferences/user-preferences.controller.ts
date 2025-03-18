import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';
import { UserPreference } from './entities/user-preference.entity';

@Controller('user-preferences')
export class UserPreferencesController {
  constructor(private readonly userPreferencesService: UserPreferencesService) {}

  @Post()
  create(@Body() userPreference: Partial<UserPreference>) {
    return this.userPreferencesService.create(userPreference);
  }

  @Get()
  findAll() {
    return this.userPreferencesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userPreferencesService.findOne(id);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.userPreferencesService.findByUserId(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() userPreference: Partial<UserPreference>) {
    return this.userPreferencesService.update(id, userPreference);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userPreferencesService.remove(id);
  }
} 