import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions.service';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private subscriptionsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const isPremium = await this.subscriptionsService.isUserPremium(userId);
    
    if (!isPremium) {
      throw new UnauthorizedException('This feature requires a premium subscription');
    }
    
    return true;
  }
} 