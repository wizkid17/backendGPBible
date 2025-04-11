import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In, Not, Like, ILike } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateProfileDto);
    return await this.userRepository.save(user);
  }

  async updatePicture(id: string, pictureUrl: string): Promise<User> {
    const user = await this.findById(id);
    user.picture = pictureUrl;
    return await this.userRepository.save(user);
  }

  async markEmailAsVerified(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isEmailVerified = true;
    return await this.userRepository.save(user);
  }

  async setResetPasswordToken(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const token = await bcrypt.hash(Math.random().toString(), 10);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // Token expira en 1 hora
    await this.userRepository.save(user);
    return token;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
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
    await this.userRepository.save(user);
  }

  async findOrCreateGoogleUser(googleProfile: any): Promise<User> {
    let user = await this.findByEmail(googleProfile.email);

    if (!user) {
      // Crear nuevo usuario
      user = await this.create({
        email: googleProfile.email,
        firstName: googleProfile.firstName,
        lastName: googleProfile.lastName,
        picture: googleProfile.picture,
        googleId: googleProfile.id,
        isEmailVerified: true, // Los usuarios de Google ya tienen email verificado
        password: Math.random().toString(36), // Contraseña aleatoria ya que usará Google
      });
    } else if (!user.googleId) {
      // Actualizar usuario existente con datos de Google
      user.googleId = googleProfile.id;
      user.picture = googleProfile.picture || user.picture;
      await this.userRepository.save(user);
    }

    return user;
  }

  async findByIds(ids: string[]): Promise<User[]> {
    if (!ids.length) return [];
    return this.userRepository.find({
      where: { id: In(ids) }
    });
  }

  async findAll(options?: { limit?: number; offset?: number; excludeIds?: string[] }): Promise<User[]> {
    const { limit = 50, offset = 0, excludeIds = [] } = options || {};
    
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    
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
    const users = await this.userRepository.find({
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
    
    return this.userRepository.save(user);
  }

  async findByResetToken(token: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
      },
    });
  }
} 