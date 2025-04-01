import { Controller, Get, Post, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { TourService } from './tour.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tour')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  // Obtener todos los pasos del tour
  @Get()
  getAllTourSteps() {
    return this.tourService.getAllTourSteps();
  }

  // Obtener un paso específico del tour
  @Get('step/:number')
  getTourStep(@Param('number', ParseIntPipe) stepNumber: number) {
    return this.tourService.getTourStep(stepNumber);
  }

  // Verificar si se debe mostrar el tour a un usuario
  @UseGuards(JwtAuthGuard)
  @Get('should-show')
  async shouldShowTour(@Request() req) {
    const shouldShow = await this.tourService.shouldShowTour(req.user.id);
    return { shouldShow };
  }

  // Obtener el progreso del tour para un usuario
  @UseGuards(JwtAuthGuard)
  @Get('progress')
  getUserTourProgress(@Request() req) {
    return this.tourService.getUserTourProgress(req.user.id);
  }

  // Marcar el tour como completado
  @UseGuards(JwtAuthGuard)
  @Post('complete')
  async completeTour(@Request() req) {
    await this.tourService.completeTour(req.user.id);
    return { message: 'Tour completado exitosamente' };
  }

  // Omitir el tour
  @UseGuards(JwtAuthGuard)
  @Post('skip')
  async skipTour(@Request() req) {
    await this.tourService.skipTour(req.user.id);
    return { message: 'Tour omitido exitosamente' };
  }
} 