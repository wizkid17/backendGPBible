import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column('boolean', { default: false })
  enabled: boolean;

  @Column('boolean', { default: true })
  dailyVersesEnabled: boolean;

  @Column('boolean', { default: true })
  prayerRemindersEnabled: boolean;

  @Column('boolean', { default: true })
  studyRemindersEnabled: boolean;

  @Column('boolean', { default: true })
  eventNotificationsEnabled: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 