import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SpiritualGrowthService } from './spiritual-growth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SpiritualGrowthTrack } from './entities/spiritual-growth-track.entity';
import { SpiritualCheckIn } from './entities/spiritual-check-in.entity';

@Controller('spiritual-growth')
@UseGuards(JwtAuthGuard)
export class SpiritualGrowthController {
  constructor(private readonly spiritualGrowthService: SpiritualGrowthService) {}

  @Get('tracks')
  async findAllTracks(@Request() req) {
    return this.spiritualGrowthService.findAllTracks(req.user.id);
  }

  @Get('tracks/:id')
  async findTrackById(@Request() req, @Param('id') id: string) {
    return this.spiritualGrowthService.findTrackById(id, req.user.id);
  }

  @Post('tracks')
  async createTrack(@Request() req, @Body() trackData: Partial<SpiritualGrowthTrack>) {
    return this.spiritualGrowthService.createTrack(req.user.id, trackData);
  }

  @Post('tracks/:id')
  async updateTrack(
    @Request() req,
    @Param('id') id: string,
    @Body() trackData: Partial<SpiritualGrowthTrack>
  ) {
    return this.spiritualGrowthService.updateTrack(id, req.user.id, trackData);
  }

  @Post('check-in')
  async createCheckIn(@Request() req, @Body() checkInData: Partial<SpiritualCheckIn>) {
    return this.spiritualGrowthService.createCheckIn(req.user.id, checkInData);
  }

  @Get('check-ins')
  async getCheckIns(@Request() req) {
    return this.spiritualGrowthService.getCheckInsForUser(req.user.id);
  }

  @Get('check-ins/track/:trackId')
  async getCheckInsForTrack(@Request() req, @Param('trackId') trackId: string) {
    return this.spiritualGrowthService.getCheckInsForTrack(trackId, req.user.id);
  }

  @Get('recent-check-ins')
  async getRecentCheckIns(@Request() req) {
    return this.spiritualGrowthService.getRecentCheckIns(req.user.id);
  }

  @Get('summary')
  async getSpiritualGrowthSummary(@Request() req) {
    return this.spiritualGrowthService.getSpiritualGrowthSummary(req.user.id);
  }
} 