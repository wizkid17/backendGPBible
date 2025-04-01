import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

// Enum para representar los diferentes proveedores de correo
export enum EmailProvider {
  GMAIL = 'gmail',
  OUTLOOK = 'outlook',
  YAHOO = 'yahoo',
  DEFAULT = 'default'
}

@Injectable()
export class EmailService implements OnModuleInit {
  private transporters: Map<EmailProvider, nodemailer.Transporter> = new Map();
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Inicializar los transporters para cada proveedor configurado
    this.initializeTransporters();
  }

  private initializeTransporters() {
    // Configurar transporter para Gmail si hay credenciales
    if (this.configService.get('GMAIL_USER') && this.configService.get('GMAIL_APP_PASSWORD')) {
      this.transporters.set(EmailProvider.GMAIL, nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: this.configService.get('GMAIL_USER'),
          pass: this.configService.get('GMAIL_APP_PASSWORD'),
        },
      }));
      this.logger.log('Gmail transporter initialized');
    }

    // Configurar transporter para Outlook si hay credenciales
    if (this.configService.get('OUTLOOK_USER') && this.configService.get('OUTLOOK_APP_PASSWORD')) {
      this.transporters.set(EmailProvider.OUTLOOK, nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: this.configService.get('OUTLOOK_USER'),
          pass: this.configService.get('OUTLOOK_APP_PASSWORD'),
        },
      }));
      this.logger.log('Outlook transporter initialized');
    }

    // Configurar transporter para Yahoo si hay credenciales
    if (this.configService.get('YAHOO_USER') && this.configService.get('YAHOO_APP_PASSWORD')) {
      this.transporters.set(EmailProvider.YAHOO, nodemailer.createTransport({
        host: 'smtp.mail.yahoo.com',
        port: 587,
        secure: false,
        auth: {
          user: this.configService.get('YAHOO_USER'),
          pass: this.configService.get('YAHOO_APP_PASSWORD'),
        },
      }));
      this.logger.log('Yahoo transporter initialized');
    }

    // Configurar transporter por defecto según las variables de entorno
    if (this.configService.get('EMAIL_USER') && this.configService.get('EMAIL_APP_PASSWORD')) {
      this.transporters.set(EmailProvider.DEFAULT, nodemailer.createTransport({
        host: this.configService.get('EMAIL_HOST') || 'smtp.gmail.com',
        port: parseInt(this.configService.get('EMAIL_PORT') || '587', 10),
        secure: this.configService.get('EMAIL_SECURE') === 'true',
        auth: {
          user: this.configService.get('EMAIL_USER'),
          pass: this.configService.get('EMAIL_APP_PASSWORD'),
        },
      }));
      this.logger.log('Default transporter initialized');
    }

    // Verificar que al menos un transporter está configurado
    if (this.transporters.size === 0) {
      this.logger.warn('No email transporters configured! Email functionality will not work.');
    } else {
      this.logger.log(`Initialized ${this.transporters.size} email transporters`);
    }
  }

  // Método para obtener un transporter específico o hacer rotación entre ellos
  private getTransporter(provider?: EmailProvider): nodemailer.Transporter {
    // Si se especifica un proveedor y existe, usarlo
    if (provider && this.transporters.has(provider)) {
      return this.transporters.get(provider);
    }

    // Si no se especifica o no existe, hacer rotación o usar el predeterminado
    if (this.transporters.has(EmailProvider.DEFAULT)) {
      return this.transporters.get(EmailProvider.DEFAULT);
    }

    // Si no hay transporter predeterminado, usar el primero disponible
    const availableProviders = Array.from(this.transporters.keys());
    if (availableProviders.length > 0) {
      // Implementación simple de rotación: elegir uno aleatorio
      const randomIndex = Math.floor(Math.random() * availableProviders.length);
      return this.transporters.get(availableProviders[randomIndex]);
    }

    throw new Error('No email transporters configured');
  }

  // Método para determinar el nombre y dirección del remitente según el proveedor
  private getSenderInfo(provider?: EmailProvider): string {
    const fromName = this.configService.get('EMAIL_FROM_NAME') || 'GPBible App';
    
    let fromEmail = '';
    switch (provider) {
      case EmailProvider.GMAIL:
        fromEmail = this.configService.get('GMAIL_USER');
        break;
      case EmailProvider.OUTLOOK:
        fromEmail = this.configService.get('OUTLOOK_USER');
        break;
      case EmailProvider.YAHOO:
        fromEmail = this.configService.get('YAHOO_USER');
        break;
      default:
        fromEmail = this.configService.get('EMAIL_USER');
        break;
    }

    return `"${fromName}" <${fromEmail}>`;
  }

  // Métodos para enviar emails con diferentes propósitos
  async sendVerificationCode(email: string, code: string, provider?: EmailProvider): Promise<void> {
    const transporter = this.getTransporter(provider);
    
    await transporter.sendMail({
      from: this.getSenderInfo(provider),
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h1>Verification Code</h1>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 30 minutes.</p>
      `,
    });
    
    this.logger.debug(`Verification email sent to ${email} using ${provider || 'default/random'} provider`);
  }

  async sendPasswordResetLink(email: string, token: string, provider?: EmailProvider): Promise<void> {
    const transporter = this.getTransporter(provider);
    const frontendUrl = this.configService.get('FRONTEND_URL');
    
    await transporter.sendMail({
      from: this.getSenderInfo(provider),
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
        <a href="${frontendUrl}/reset-password?token=${token}">Reset Password</a>
      `,
    });
    
    this.logger.debug(`Password reset email sent to ${email} using ${provider || 'default/random'} provider`);
  }

  async sendWelcomeEmail(email: string, firstName: string, provider?: EmailProvider): Promise<void> {
    const transporter = this.getTransporter(provider);
    
    await transporter.sendMail({
      from: this.getSenderInfo(provider),
      to: email,
      subject: 'Welcome to GPBible App!',
      html: `
        <h1>Welcome to GPBible App, ${firstName}!</h1>
        <p>Thank you for joining our community. We're excited to have you with us on this spiritual journey.</p>
        <p>Feel free to explore the app and discover all the features we have prepared for you.</p>
      `,
    });
    
    this.logger.debug(`Welcome email sent to ${email} using ${provider || 'default/random'} provider`);
  }

  async sendCustomEmail(to: string, subject: string, htmlContent: string, provider?: EmailProvider): Promise<void> {
    const transporter = this.getTransporter(provider);
    
    await transporter.sendMail({
      from: this.getSenderInfo(provider),
      to,
      subject,
      html: htmlContent,
    });
    
    this.logger.debug(`Custom email sent to ${to} using ${provider || 'default/random'} provider`);
  }

  // Método para obtener información sobre los proveedores configurados
  getConfiguredProviders(): { id: EmailProvider; name: string; isConfigured: boolean; isActive: boolean }[] {
    const providers = [
      {
        id: EmailProvider.GMAIL,
        name: 'Gmail',
        isConfigured: Boolean(this.configService.get('GMAIL_USER') && this.configService.get('GMAIL_APP_PASSWORD')),
        isActive: this.transporters.has(EmailProvider.GMAIL)
      },
      {
        id: EmailProvider.OUTLOOK,
        name: 'Outlook',
        isConfigured: Boolean(this.configService.get('OUTLOOK_USER') && this.configService.get('OUTLOOK_APP_PASSWORD')),
        isActive: this.transporters.has(EmailProvider.OUTLOOK)
      },
      {
        id: EmailProvider.YAHOO,
        name: 'Yahoo',
        isConfigured: Boolean(this.configService.get('YAHOO_USER') && this.configService.get('YAHOO_APP_PASSWORD')),
        isActive: this.transporters.has(EmailProvider.YAHOO)
      },
      {
        id: EmailProvider.DEFAULT,
        name: 'Default',
        isConfigured: Boolean(this.configService.get('EMAIL_USER') && this.configService.get('EMAIL_APP_PASSWORD')),
        isActive: this.transporters.has(EmailProvider.DEFAULT)
      }
    ];

    return providers;
  }

  // Test the connection to a specific provider
  async testProviderConnection(provider: EmailProvider): Promise<boolean> {
    try {
      if (!this.transporters.has(provider)) {
        return false;
      }
      
      // Test the SMTP connection
      await this.transporters.get(provider).verify();
      return true;
    } catch (error) {
      this.logger.error(`Failed to verify connection to ${provider}: ${error.message}`);
      return false;
    }
  }
} 