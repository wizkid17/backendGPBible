import { Controller, Get, Param, UseGuards, Request, Query } from '@nestjs/common';
import { MeditationService } from './meditation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../subscriptions/guards/premium.guard';

@Controller('meditation')
export class MeditationController {
  constructor(private readonly meditationService: MeditationService) {}

  // Endpoint para obtener todas las meditaciones disponibles
  @Get()
  async getAllMeditations(@Request() req) {
    // Obtenemos el userId si el usuario está autenticado
    const userId = req.user?.id;
    return this.meditationService.findAll(userId);
  }

  // Endpoint para obtener una meditación específica por su ID
  @Get(':id')
  async getMeditationById(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.meditationService.findOne(id, userId);
  }

  // Endpoint para obtener meditaciones por etiqueta
  @Get('tag/:tag')
  async getMeditationsByTag(@Param('tag') tag: string, @Request() req) {
    const userId = req.user?.id;
    return this.meditationService.findByTag(tag, userId);
  }

  // Endpoint para obtener todas las meditaciones premium (requiere autenticación y suscripción premium)
  @UseGuards(JwtAuthGuard, PremiumGuard)
  @Get('premium')
  async getPremiumMeditations() {
    // Como este endpoint está protegido por PremiumGuard, sabemos que el usuario tiene acceso
    const meditations = await this.meditationService.findAll();
    return meditations.filter(meditation => meditation.isPremium);
  }

  // Endpoint para obtener una meditación rápida (5 minutos o menos)
  @Get('quick')
  async getQuickMeditation(@Request() req) {
    const userId = req.user?.id;
    const allMeditations = await this.meditationService.findAll(userId);
    const quickMeditations = allMeditations.filter(m => m.durationMinutes <= 5);
    
    // Si hay meditaciones rápidas, devolver una aleatoria
    if (quickMeditations.length > 0) {
      const randomIndex = Math.floor(Math.random() * quickMeditations.length);
      return quickMeditations[randomIndex];
    }
    
    // Si no hay meditaciones rápidas, devolver cualquiera
    if (allMeditations.length > 0) {
      const randomIndex = Math.floor(Math.random() * allMeditations.length);
      return allMeditations[randomIndex];
    }
    
    return null;
  }
} 