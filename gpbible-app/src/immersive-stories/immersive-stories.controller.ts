import { Controller, Get, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ImmersiveStoriesService } from './immersive-stories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../subscriptions/guards/premium.guard';

@Controller('immersive-stories')
export class ImmersiveStoriesController {
  constructor(private readonly immersiveStoriesService: ImmersiveStoriesService) {}

  // Endpoint para obtener todas las historias (accesible para todos, pero filtra contenido premium)
  @Get()
  async getAllStories(@Request() req) {
    // Obtenemos el userId si el usuario está autenticado
    const userId = req.user?.id;
    return this.immersiveStoriesService.getAllStories(userId);
  }

  // Endpoint para obtener una historia específica por su ID
  @Get(':id')
  async getStoryById(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.immersiveStoriesService.getStoryById(id, userId);
  }

  // Endpoint para obtener historias por categoría
  @Get('category/:category')
  async getStoriesByCategory(@Param('category') category: string, @Request() req) {
    const userId = req.user?.id;
    return this.immersiveStoriesService.getStoriesByCategory(category, userId);
  }

  // Endpoint para obtener las historias favoritas del usuario (requiere autenticación)
  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  async getFavoriteStories(@Request() req) {
    return this.immersiveStoriesService.getFavoriteStories(req.user.id);
  }

  // Endpoint para obtener solo las historias premium (requiere suscripción premium)
  @UseGuards(JwtAuthGuard, PremiumGuard)
  @Get('premium')
  async getPremiumStories() {
    // Como este endpoint está protegido por PremiumGuard, sabemos que el usuario es premium
    const stories = await this.immersiveStoriesService.getAllStories();
    return stories.filter(story => story.isPremium);
  }
} 