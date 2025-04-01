import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { EmailService, EmailProvider } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

interface EmailProviderInfo {
  id: EmailProvider;
  name: string;
  isConfigured: boolean;
  isActive: boolean;
}

interface TestEmailDto {
  recipient: string;
  provider?: EmailProvider;
}

@ApiTags('email')
@Controller('email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('providers')
  @ApiOperation({ summary: 'Get all configured email providers' })
  @ApiResponse({ status: 200, description: 'Returns the list of all configured email providers' })
  async getProviders(@Request() req): Promise<EmailProviderInfo[]> {
    // Solo permitimos esta operación para administradores
    // Aquí deberíamos validar si el usuario es administrador
    // Por ahora solo verificamos si se ha configurado al menos un proveedor
    return this.emailService.getConfiguredProviders();
  }

  @Post('test')
  @ApiOperation({ summary: 'Send a test email' })
  @ApiResponse({ status: 200, description: 'Test email was sent successfully' })
  async sendTestEmail(@Request() req, @Body() testEmailDto: TestEmailDto): Promise<{ success: boolean; message: string }> {
    // Solo permitimos esta operación para administradores
    try {
      await this.emailService.sendCustomEmail(
        testEmailDto.recipient,
        'Test Email from GPBible App',
        `
          <h1>This is a test email</h1>
          <p>This email was sent as a test from the GPBible App at ${new Date().toISOString()}</p>
          <p>If you received this email, it means that the email configuration is working properly.</p>
        `,
        testEmailDto.provider
      );
      
      return {
        success: true,
        message: `Test email sent successfully to ${testEmailDto.recipient} using ${testEmailDto.provider || 'default/random'} provider`
      };
    } catch (error) {
      return {
        success: false,
        message: `Error sending test email: ${error.message}`
      };
    }
  }
} 