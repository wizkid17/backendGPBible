import { Controller, Get, Param, Post, UseGuards, Request, Query, ParseBoolPipe } from '@nestjs/common';
import { AiAvatarsService } from './ai-avatars.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('ai-avatars')
@Controller('ai-avatars')
export class AiAvatarsController {
  constructor(private readonly aiAvatarsService: AiAvatarsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available avatars' })
  async findAll(@Query('includePremium', ParseBoolPipe) includePremium: boolean = false) {
    return this.aiAvatarsService.findAll(includePremium);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get avatar by ID' })
  findOne(@Param('id') id: string) {
    return this.aiAvatarsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/select')
  @ApiOperation({ summary: 'Select an avatar for the current user' })
  async selectAvatar(@Request() req, @Param('id') avatarId: string) {
    return this.aiAvatarsService.selectAvatar(req.user.id, avatarId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('user/selected')
  @ApiOperation({ summary: 'Get the currently selected avatar for the user' })
  async getSelectedAvatar(@Request() req) {
    return this.aiAvatarsService.getSelectedAvatar(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('user/current')
  @ApiOperation({ summary: 'Get the current avatar for the user' })
  async getUserAvatar(@Request() req) {
    return this.aiAvatarsService.getUserAvatar(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('user/premium-status')
  @ApiOperation({ summary: 'Check if the user has premium access' })
  async getUserIsPremium(@Request() req) {
    return this.aiAvatarsService.getUserIsPremium(req.user.id);
  }
} 