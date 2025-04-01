import { Controller, Get, Post, Param, UseGuards, Request, Body } from '@nestjs/common';
import { AiAvatarsService } from './ai-avatars.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../subscriptions/guards/premium.guard';

@Controller('ai-avatars')
export class AiAvatarsController {
  constructor(private readonly aiAvatarsService: AiAvatarsService) {
    // Inicializar avatares por defecto al iniciar la aplicación
    this.aiAvatarsService.initializeDefaultAvatars();
  }

  // Obtener todos los avatares disponibles
  @Get()
  async findAll(@Request() req) {
    // Determinar si el usuario es premium para mostrar avatares premium
    const isPremium = req.user ? await this.aiAvatarsService.getUserIsPremium(req.user.id) : false;
    return this.aiAvatarsService.findAll(isPremium);
  }

  // Obtener un avatar específico por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aiAvatarsService.findOne(id);
  }

  // Obtener el avatar seleccionado del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('user/selected')
  getUserAvatar(@Request() req) {
    return this.aiAvatarsService.getUserAvatar(req.user.id);
  }

  // Establecer el avatar seleccionado para el usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Post('select/:id')
  setUserAvatar(@Request() req, @Param('id') avatarId: string) {
    return this.aiAvatarsService.setUserAvatar(req.user.id, avatarId);
  }

  // Obtener todos los avatares premium (protegido con PremiumGuard)
  @UseGuards(JwtAuthGuard, PremiumGuard)
  @Get('premium')
  getPremiumAvatars() {
    return this.aiAvatarsService.findAll(true);
  }
} 