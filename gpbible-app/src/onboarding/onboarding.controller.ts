import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CreateOnboardingResponseDto } from './dto/create-onboarding-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createOnboardingDto: CreateOnboardingResponseDto) {
    return this.onboardingService.create(req.user.id, createOnboardingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findByUser(@Request() req) {
    return this.onboardingService.findByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  update(@Request() req, @Body() updateOnboardingDto: Partial<CreateOnboardingResponseDto>) {
    return this.onboardingService.update(req.user.id, updateOnboardingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async hasCompletedOnboarding(@Request() req) {
    const completed = await this.onboardingService.hasCompletedOnboarding(req.user.id);
    return { completed };
  }

  @UseGuards(JwtAuthGuard)
  @Post('complete')
  async completeOnboarding(@Request() req) {
    await this.onboardingService.update(req.user.id, { onboardingCompleted: true });
    return { message: 'Onboarding completado con éxito' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('tour/skip')
  async skipTour(@Request() req) {
    await this.onboardingService.update(req.user.id, { wantsTour: false });
    return { message: 'Tour omitido con éxito' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('tour/complete')
  async completeTour(@Request() req) {
    await this.onboardingService.update(req.user.id, { wantsTour: false });
    return { message: 'Tour completado con éxito' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('tour/status')
  async getTourStatus(@Request() req) {
    const response = await this.onboardingService.findByUserId(req.user.id);
    return { wantsTour: response.wantsTour };
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar/:id')
  async selectAvatar(@Request() req, @Param('id') avatarId: string) {
    await this.onboardingService.update(req.user.id, { selectedAvatarId: avatarId });
    return { message: 'Avatar seleccionado con éxito' };
  }
} 