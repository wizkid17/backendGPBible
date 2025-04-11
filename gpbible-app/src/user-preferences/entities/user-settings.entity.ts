import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TextSize } from '../enums/text-size.enum';
import { Language } from '../enums/language.enum';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, user => user.settings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.ENGLISH
  })
  language: Language;

  @Column({
    type: 'enum',
    enum: TextSize,
    default: TextSize.MEDIUM
  })
  textSize: TextSize;

  @Column({ default: true })
  notifications: boolean;

  @Column({ type: 'json', nullable: true })
  additionalPreferences: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
} 