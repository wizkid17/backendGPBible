import { Controller, Post, Body, UseGuards, Get, Request, Param, Query, BadRequestException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { SignUpDto } from '../dto/sign-up.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { AgeConfirmationDto } from '../dto/age-confirmation.dto';
import { ResetPasswordDto, ConfirmResetPasswordDto } from '../dto/reset-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    type: SignUpDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('age-confirmation')
  @ApiOperation({ summary: 'Confirm user age' })
  @ApiResponse({ 
    status: 200, 
    description: 'Age confirmed successfully',
    type: AgeConfirmationDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  confirmAge(@Body() ageConfirmationDto: AgeConfirmationDto) {
    return this.authService.confirmAge(ageConfirmationDto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify user email address' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verified successfully',
    type: VerifyEmailDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid verification code' })
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification code' })
  @ApiResponse({ status: 200, description: 'Verification code sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  resendVerificationCode(@Body('email') email: string) {
    return this.authService.resendVerificationCode(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset password email sent' })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  async requestPasswordReset(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto.email);
    return { message: 'If the email exists, a password reset link has been sent' };
  }

  @Get('reset-password')
  @ApiOperation({ summary: 'Show password reset page' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async showResetPasswordPage(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    // Verificar si el token es válido
    const isValid = await this.authService.validateResetToken(token);
    return { isValid };
  }

  @Post('reset-password/confirm')
  @ApiOperation({ summary: 'Confirm password reset' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid token or password' })
  async confirmResetPassword(@Body() confirmResetPasswordDto: ConfirmResetPasswordDto) {
    await this.authService.confirmResetPassword(
      confirmResetPasswordDto.token,
      confirmResetPasswordDto.newPassword
    );
    return { message: 'Password has been reset successfully' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    return req.user;
  }
} 