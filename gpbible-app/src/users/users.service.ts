import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In, Not, Like, ILike } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
    googleId?: string;
    birthDate?: Date;
  }): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async setResetPasswordToken(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const token = await bcrypt.hash(Math.random().toString(), 10);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // Token expira en 1 hora
    await this.usersRepository.save(user);
    return token;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new NotFoundException('Token inválido o expirado');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.usersRepository.save(user);
  }

  async findOrCreateGoogleUser(googleProfile: any): Promise<User> {
    let user = await this.usersRepository.findOne({
      where: [
        { googleId: googleProfile.id },
        { email: googleProfile.email }
      ]
    });

    if (!user) {
      const randomPassword = await bcrypt.hash(Math.random().toString(), 10);
      user = await this.create({
        email: googleProfile.email,
        password: randomPassword,
        googleId: googleProfile.id,
        firstName: googleProfile.firstName,
        lastName: googleProfile.lastName,
        picture: googleProfile.picture
      });
    }

    return user;
  }

  async findByIds(ids: string[]): Promise<User[]> {
    if (!ids.length) return [];
    return this.usersRepository.find({
      where: { id: In(ids) }
    });
  }

  async findAll(options?: { limit?: number; offset?: number; excludeIds?: string[] }): Promise<User[]> {
    const { limit = 50, offset = 0, excludeIds = [] } = options || {};
    
    const queryBuilder = this.usersRepository.createQueryBuilder('user');
    
    if (excludeIds.length) {
      queryBuilder.where('user.id NOT IN (:...excludeIds)', { excludeIds });
    }
    
    queryBuilder.limit(limit).offset(offset);
    
    return queryBuilder.getMany();
  }

  async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    // Buscar usuarios que coincidan con el email o nombre
    const users = await this.usersRepository.find({
      where: [
        { email: ILike(`%${query}%`), id: Not(currentUserId) },
        { firstName: ILike(`%${query}%`), id: Not(currentUserId) },
        { lastName: ILike(`%${query}%`), id: Not(currentUserId) },
      ],
      select: ['id', 'email', 'firstName', 'lastName'],
      take: 20,
    });

    return users;
  }

  async updateContactPermission(userId: string, granted: boolean): Promise<User> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Actualizar permisos
    user.contactPermissionRequested = true;
    user.contactPermissionGranted = granted;
    
    return this.usersRepository.save(user);
  }
} 