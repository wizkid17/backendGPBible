import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserPreference } from '../../user-preferences/entities/user-preference.entity';
import { UserSettings } from '../../user-preferences/entities/user-settings.entity';
import { AiChatMessage } from '../../ai-chat/entities/ai-chat-message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  picture?: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ nullable: true })
  resetPasswordExpires?: Date;

  @Column({ type: 'boolean', nullable: true, default: false })
  contactPermissionRequested: boolean;

  @Column({ type: 'boolean', nullable: true, default: false })
  contactPermissionGranted: boolean;

  @OneToMany(() => UserPreference, preference => preference.user)
  preferences: UserPreference[];

  @OneToMany(() => UserSettings, settings => settings.user)
  settings: UserSettings[];

  @OneToMany(() => AiChatMessage, message => message.user)
  chatMessages: AiChatMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 