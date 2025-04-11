import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { CreateAccountDto } from './dto/create-account.dto';
import { InitiateEmailVerificationDto, VerifyEmailDto } from './dto/verify-email.dto';
import { User } from '../users/entities/user.entity';
import { VerificationCode } from './entities/verification-code.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { SubscriptionType } from '../subscriptions/entities/subscription.entity';
import { EmailService, EmailProvider } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { SignUpDto } from './dto/sign-up.dto';
import { AgeConfirmationDto } from './dto/age-confirmation.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private subscriptionsService: SubscriptionsService,
    private emailService: EmailService,
    @InjectRepository(VerificationCode)
    private verificationCodesRepository: Repository<VerificationCode>,
    private configService: ConfigService,
  ) {}

  private generateVerificationCode(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  async initiateEmailVerification(dto: InitiateEmailVerificationDto): Promise<void> {
    // Verificar si el email ya existe
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Generar código de verificación
    const code = this.generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Expira en 30 minutos

    // Guardar el código en la base de datos
    await this.verificationCodesRepository.save({
      email: dto.email,
      code,
      expiresAt,
    });

    // Enviar el código usando el proveedor más adecuado según el dominio de correo
    const provider = this.getProviderByEmailDomain(dto.email);
    await this.emailService.sendVerificationCode(dto.email, code, provider);
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<boolean> {
    const verificationCode = await this.verificationCodesRepository.findOne({
      where: {
        email: dto.email,
        code: dto.code,
        used: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!verificationCode) {
      throw new BadRequestException('Código inválido');
    }

    if (verificationCode.expiresAt < new Date()) {
      throw new BadRequestException('Código expirado');
    }

    // Marcar el código como usado
    verificationCode.used = true;
    await this.verificationCodesRepository.save(verificationCode);

    return true;
  }

  async createAccount(createAccountDto: CreateAccountDto): Promise<{ user: User; access_token: string }> {
    // Verificar si las contraseñas coinciden
    if (createAccountDto.password !== createAccountDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Verificar el código de verificación
    const verificationCode = await this.verificationCodesRepository.findOne({
      where: {
        email: createAccountDto.email,
        code: createAccountDto.verificationCode,
        used: true,
      },
      order: { createdAt: 'DESC' },
    });

    if (!verificationCode) {
      throw new BadRequestException('Código de verificación inválido');
    }

    // Verificar si el email ya existe
    const existingUser = await this.usersService.findByEmail(createAccountDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createAccountDto.password, 10);

    // Crear el usuario
    const user = await this.usersService.create({
      email: createAccountDto.email,
      password: hashedPassword,
      firstName: createAccountDto.firstName,
      lastName: createAccountDto.lastName,
      picture: createAccountDto.picture,
      birthDate: createAccountDto.birthDate,
      isEmailVerified: true, // El email ya fue verificado en el proceso
    });

    // Enviar correo de bienvenida
    try {
      const provider = this.getProviderByEmailDomain(user.email);
      await this.emailService.sendWelcomeEmail(
        user.email, 
        user.firstName, 
        provider
      );
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // No fallaremos la creación de cuenta si el correo de bienvenida falla
    }

    // Generar token JWT
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      user,
      access_token,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async resetPassword(email: string): Promise<void> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        // No revelamos si el email existe o no por seguridad
        return;
      }

      const token = await this.usersService.setResetPasswordToken(email);
      
      // Usar el proveedor más adecuado según el dominio de correo
      const provider = this.getProviderByEmailDomain(email);
      await this.emailService.sendPasswordResetLink(email, token, provider);
    } catch (error) {
      console.error('Password reset error:', error);
      // No revelamos detalles específicos del error por seguridad
      throw new BadRequestException('Unable to process password reset request');
    }
  }

  async confirmResetPassword(token: string, newPassword: string): Promise<void> {
    if (!token || !newPassword) {
      throw new BadRequestException('Token and new password are required');
    }

    try {
      await this.usersService.resetPassword(token, newPassword);
    } catch (error) {
      console.error('Confirm reset password error:', error);
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  async handleGoogleAuth(profile: any) {
    if (!profile) {
      throw new BadRequestException('No Google profile data provided');
    }

    try {
      const user = await this.usersService.findOrCreateGoogleUser(profile);
      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }

  async getAccessibleFeatures(userId: string) {
    // Si no hay userId, asumimos que es un usuario no autenticado
    if (!userId) {
      return {
        bible: true,
        dailyBibleVerse: true,
        todaysReflection: true,
        menu: true,
        premium: false,
      };
    }

    try {
      // Obtener la suscripción del usuario desde el servicio de suscripciones
      const isPremium = await this.subscriptionsService.isUserPremium(userId);
      
      return {
        bible: true,
        dailyBibleVerse: true,
        todaysReflection: true,
        menu: true,
        premium: isPremium,
        // Características premium adicionales
        premiumStudyPlans: isPremium,
        advancedSearch: isPremium,
        highlights: isPremium,
        notes: isPremium,
        devotionals: isPremium,
        commentaries: isPremium,
      };
    } catch (error) {
      console.error('Error fetching user features:', error);
      // En caso de error, retornamos las características básicas
      return {
        bible: true,
        dailyBibleVerse: true,
        todaysReflection: true,
        menu: true,
        premium: false,
      };
    }
  }

  // Método auxiliar para determinar el proveedor más adecuado para un correo
  private getProviderByEmailDomain(email: string): EmailProvider | undefined {
    if (!email) {
      return undefined;
    }

    const domain = email.split('@')[1]?.toLowerCase();
    
    if (!domain) {
      return undefined;
    }
    
    if (domain === 'gmail.com' || domain.endsWith('.gmail.com')) {
      return EmailProvider.GMAIL;
    }
    
    if (domain === 'outlook.com' || domain === 'hotmail.com' || domain.endsWith('.outlook.com')) {
      return EmailProvider.OUTLOOK;
    }
    
    if (domain === 'yahoo.com' || domain.endsWith('.yahoo.com')) {
      return EmailProvider.YAHOO;
    }
    
    return undefined;
  }

  async googleLogin(googleUser: any) {
    if (!googleUser) {
      throw new UnauthorizedException('No Google user data provided');
    }

    try {
      const user = await this.usersService.findOrCreateGoogleUser(googleUser);
      const payload = { 
        sub: user.id, 
        email: user.email 
      };

      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          picture: user.picture
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }

  async signUp(signUpDto: SignUpDto) {
    // Verificar si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(signUpDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);

    // Crear el usuario
    const user = await this.usersService.create({
      ...signUpDto,
      password: hashedPassword,
    });

    // Generar token JWT
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async confirmAge(ageConfirmationDto: AgeConfirmationDto) {
    if (!ageConfirmationDto.isOver16) {
      throw new BadRequestException('User must be over 16 years old');
    }
    return { confirmed: true };
  }

  async resendVerificationCode(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Aquí deberías generar y enviar un nuevo código
    // Por ahora, simulamos que se envió
    const newCode = Math.random().toString(36).slice(-6);

    // Implementar el envío real del código por email
    console.log(`New verification code for ${email}: ${newCode}`);

    return { sent: true };
  }

  async validateResetToken(token: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    try {
      const user = await this.usersService.findByResetToken(token);
      if (!user) {
        return false;
      }

      // Verificar si el token ha expirado
      if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating reset token:', error);
      return false;
    }
  }
} 