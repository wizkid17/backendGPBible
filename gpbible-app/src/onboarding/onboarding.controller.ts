import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CreateOnboardingResponseDto } from './dto/create-onboarding-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  create(@Request() req, @Body() createOnboardingDto: CreateOnboardingResponseDto) {
    return this.onboardingService.create(req.user.id, createOnboardingDto);
  }

  @Get('status')
  checkOnboardingStatus(@Request() req) {
    return this.onboardingService.hasCompletedOnboarding(req.user.id);
  }

  @Get()
  findByUser(@Request() req) {
    return this.onboardingService.findByUserId(req.user.id);
  }

  @Patch()
  update(@Request() req, @Body() updateOnboardingDto: Partial<CreateOnboardingResponseDto>) {
    return this.onboardingService.update(req.user.id, updateOnboardingDto);
  }
} 