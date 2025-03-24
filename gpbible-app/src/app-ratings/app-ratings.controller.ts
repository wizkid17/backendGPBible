import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AppRatingsService } from './app-ratings.service';
import { CreateAppRatingDto } from './dto/create-app-rating.dto';
import { AppRating } from './entities/app-rating.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('app-ratings')
export class AppRatingsController {
  constructor(private readonly appRatingsService: AppRatingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createAppRatingDto: CreateAppRatingDto,
    @CurrentUser() user: User,
  ): Promise<AppRating> {
    // Attach the user's ID to the rating
    createAppRatingDto.userId = user.id;
    return this.appRatingsService.create(createAppRatingDto);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@CurrentUser() user: User) {
    const hasRated = await this.appRatingsService.getUserHasRated(user.id);
    const dontShowAgain = await this.appRatingsService.getUserDontShowAgain(user.id);
    
    return {
      hasRated,
      dontShowAgain,
    };
  }

  @Post('anonymous')
  async createAnonymous(
    @Body() createAppRatingDto: CreateAppRatingDto,
  ): Promise<AppRating> {
    return this.appRatingsService.create(createAppRatingDto);
  }
} 