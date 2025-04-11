import { Controller, Get, Put, UseGuards, Request, Body, Param } from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { TextSize } from './enums/text-size.enum';
import { Language } from './enums/language.enum';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('user-preferences')
@Controller('user-preferences')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserPreferencesController {
  constructor(private readonly userPreferencesService: UserPreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get user settings' })
  async getSettings(@Request() req) {
    return this.userPreferencesService.getSettings(req.user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update user settings' })
  async updateSettings(@Request() req, @Body() updateDto: UpdateUserSettingsDto) {
    return this.userPreferencesService.updateSettings(req.user.id, updateDto);
  }

  @Put('text-size/:size')
  @ApiOperation({ summary: 'Update text size' })
  async updateTextSize(@Request() req, @Param('size') textSize: TextSize) {
    return this.userPreferencesService.updateTextSize(req.user.id, textSize);
  }

  @Put('language/:lang')
  @ApiOperation({ summary: 'Update language' })
  async updateLanguage(@Request() req, @Param('lang') language: Language) {
    return this.userPreferencesService.updateLanguage(req.user.id, language);
  }

  @Put('notifications')
  @ApiOperation({ summary: 'Update notifications settings' })
  async updateNotifications(@Request() req, @Body('enabled') enabled: boolean) {
    return this.userPreferencesService.updateNotifications(req.user.id, enabled);
  }

  @Put('reset')
  @ApiOperation({ summary: 'Reset user settings to default' })
  async resetSettings(@Request() req) {
    return this.userPreferencesService.resetSettings(req.user.id);
  }
} 