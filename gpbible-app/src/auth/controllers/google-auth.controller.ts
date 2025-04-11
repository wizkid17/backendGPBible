import { Controller, Get, Req, Res, UseGuards, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { AuthService } from '../auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('Google Authentication')
@Controller('auth/google')
export class GoogleAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to Google login' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated with Google' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      if (!req.user) {
        throw new UnauthorizedException('No user data from Google');
      }

      const { accessToken, user } = await this.authService.googleLogin(req.user);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');

      // Redirect to frontend with token and user data
      const userDataParam = encodeURIComponent(JSON.stringify({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture
      }));

      res.redirect(
        `${frontendUrl}/auth/callback?` +
        `token=${accessToken}&` +
        `userData=${userDataParam}`
      );
    } catch (error) {
      console.error('Google authentication error:', error);
      
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const errorMessage = encodeURIComponent(
        error instanceof UnauthorizedException 
          ? 'Authentication failed' 
          : 'An unexpected error occurred'
      );
      
      res.redirect(`${frontendUrl}/auth/error?message=${errorMessage}`);
    }
  }

  @Get('validate')
  @UseGuards(GoogleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate Google session' })
  @ApiResponse({ status: 200, description: 'Session is valid' })
  @ApiResponse({ status: 401, description: 'Session is invalid' })
  async validateGoogleSession(@Req() req) {
    return { isValid: true, user: req.user };
  }
} 