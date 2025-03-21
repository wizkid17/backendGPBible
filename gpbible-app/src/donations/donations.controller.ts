import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  // Endpoint para crear donaciones (puede ser usado por usuarios autenticados y anónimos)
  @Post()
  create(@Request() req, @Body() createDonationDto: CreateDonationDto) {
    // Si el usuario está autenticado, asociamos la donación con su cuenta
    const userId = req.user?.id;
    return this.donationsService.create(createDonationDto, userId);
  }

  // Endpoint para procesar el pago de la donación
  @Post(':id/process')
  processDonation(@Param('id') id: string) {
    return this.donationsService.processDonation(id);
  }

  // Endpoint para obtener el total de donaciones (información pública)
  @Get('total')
  getTotalDonations() {
    return this.donationsService.getTotalDonations();
  }

  // Endpoint para obtener el conteo de donaciones (información pública)
  @Get('count')
  getDonationsCount() {
    return this.donationsService.getDonationsCount();
  }

  // Endpoint para obtener todas las donaciones de un usuario (solo accesible para el usuario autenticado)
  @UseGuards(JwtAuthGuard)
  @Get('my-donations')
  getMyDonations(@Request() req) {
    return this.donationsService.findByUserId(req.user.id);
  }

  // Endpoint para obtener una donación específica por su ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.donationsService.findOne(id);
  }

  // Posible endpoint adicional para mostrar las donaciones más recientes o destacadas
  @Get('recent')
  getRecentDonations() {
    // Aquí podríamos filtrar para mostrar solo donaciones no anónimas
    return this.donationsService.findAll();
  }
} 