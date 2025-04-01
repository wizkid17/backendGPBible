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

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private subscriptionsService: SubscriptionsService,
    private emailService: EmailService,
    @InjectRepository(VerificationCode)
    private verificationCodesRepository: Repository<VerificationCode>,
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
      birthDate: new Date(createAccountDto.birthDate),
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

    // Eliminar la contraseña del objeto de respuesta
    delete user.password;

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
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const token = await this.usersService.setResetPasswordToken(email);
      
      // Usar el proveedor más adecuado según el dominio de correo
      const provider = this.getProviderByEmailDomain(email);
      await this.emailService.sendPasswordResetLink(email, token, provider);
    } catch (error) {
      // We don't want to reveal if the email exists or not for security reasons
      console.error('Password reset error:', error);
    }
  }

  async confirmResetPassword(token: string, newPassword: string): Promise<void> {
    await this.usersService.resetPassword(token, newPassword);
  }

  async googleLogin(req: any) {
    if (!req.user) {
      throw new UnauthorizedException('No user from google');
    }

    const user = await this.usersService.findOrCreateGoogleUser(req.user);
    return this.login(user);
  }

  async validateGoogleUser(profile: any) {
    const { email, given_name, family_name, picture } = profile;
    
    let user = await this.usersService.findByEmail(email);
    
    if (!user) {
      const randomPassword = await bcrypt.hash(Math.random().toString(), 10);
      user = await this.usersService.create({
        email,
        password: randomPassword,
        firstName: given_name,
        lastName: family_name,
        picture,
        googleId: profile.id,
      });
    }

    return user;
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
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (!domain) {
      return undefined; // Usar rotación o proveedor por defecto
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
    
    // Otros dominios usarán rotación o proveedor por defecto
    return undefined;
  }
} 