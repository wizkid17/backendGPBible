import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  findMySubscription(@Request() req) {
    return this.subscriptionsService.findByUserId(req.user.id);
  }

  @Get('status')
  isPremium(@Request() req) {
    return this.subscriptionsService.isUserPremium(req.user.id);
  }

  @Post('upgrade')
  upgradeToPremium(@Request() req, @Body() data: { paymentId: string, endDate?: Date }) {
    return this.subscriptionsService.upgradeToPremium(req.user.id, data.paymentId, data.endDate);
  }

  @Post('cancel')
  cancelSubscription(@Request() req) {
    return this.subscriptionsService.cancelSubscription(req.user.id);
  }

  @Patch()
  update(@Request() req, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(req.user.id, updateSubscriptionDto);
  }

  @Get('premium-features')
  getPremiumFeatures(@Request() req) {
    return this.subscriptionsService.getPremiumFeatures(req.user.id);
  }

  @Get('ai-chat-access')
  hasAiChatAccess(@Request() req) {
    return this.subscriptionsService.hasAiChatAccess(req.user.id);
  }

  @Get('immersive-stories-access')
  hasImmersiveStoriesAccess(@Request() req) {
    return this.subscriptionsService.hasImmersiveStoriesAccess(req.user.id);
  }

  @Get('premium-plan-info')
  getPremiumPlanInfo() {
    return this.subscriptionsService.getPremiumPlanInfo();
  }
} 