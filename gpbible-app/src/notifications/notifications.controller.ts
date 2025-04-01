import { Controller, Get, Post, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getUserNotifications(@Request() req) {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  @Get('preferences')
  getNotificationPreferences(@Request() req) {
    return this.notificationsService.getNotificationPreferences(req.user.id);
  }

  @Patch('preferences')
  updateNotificationPreferences(
    @Request() req,
    @Body() updateDto: UpdateNotificationPreferenceDto,
  ) {
    return this.notificationsService.updateNotificationPreferences(req.user.id, updateDto);
  }

  @Post('enable')
  enableNotifications(@Request() req) {
    return this.notificationsService.enableNotifications(req.user.id);
  }

  @Post('disable')
  disableNotifications(@Request() req) {
    return this.notificationsService.disableNotifications(req.user.id);
  }
} 