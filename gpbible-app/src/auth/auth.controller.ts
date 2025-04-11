import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateAccountDto } from './dto/create-account.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { InitiateEmailVerificationDto, VerifyEmailDto } from './dto/verify-email.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request as ExpressRequest, Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify-email/initiate')
  @HttpCode(HttpStatus.OK)
  async initiateEmailVerification(@Body() dto: InitiateEmailVerificationDto) {
    await this.authService.initiateEmailVerification(dto);
    return { message: 'Código de verificación enviado' };
  }

  @Post('verify-email/confirm')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto);
    return { message: 'Email verificado exitosamente' };
  }

  @Post('register')
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.authService.createAccount(createAccountDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('features')
  async getAccessibleFeatures(@Request() req) {
    // Si hay un token JWT válido, req.user estará definido
    const userId = req.user?.id || null;
    return this.authService.getAccessibleFeatures(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('premium-features')
  async getPremiumFeatures(@Request() req) {
    return this.authService.getAccessibleFeatures(req.user.id);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetDto: { email: string }) {
    await this.authService.resetPassword(resetDto.email);
    return { message: 'Si el correo existe, se ha enviado un enlace de restablecimiento.' };
  }

  @Post('confirm-reset-password')
  @HttpCode(HttpStatus.OK)
  async confirmResetPassword(
    @Body() resetDto: { token: string; newPassword: string },
  ) {
    await this.authService.confirmResetPassword(resetDto.token, resetDto.newPassword);
    return { message: 'Contraseña actualizada exitosamente' };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  async googleAuthRedirect(@Req() req: ExpressRequest, @Res() res: Response) {
    const { accessToken, user } = await this.authService.googleLogin(req.user);
    
    // You can customize this to redirect to your frontend with the token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
  }
} 