import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum GrowthTrackType {
  PRAYER = 'prayer',
  BIBLE_READING = 'bible_reading',
  MEDITATION = 'meditation',
  DEVOTIONAL = 'devotional',
  WORSHIP = 'worship',
  FASTING = 'fasting',
  COMMUNITY = 'community',
  SERVICE = 'service'
}

@Entity('spiritual_growth_tracks')
export class SpiritualGrowthTrack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({
    type: 'enum',
    enum: GrowthTrackType,
    default: GrowthTrackType.PRAYER
  })
  type: GrowthTrackType;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'int', default: 0 })
  targetDailyMinutes: number;

  @Column({ type: 'int', default: 0 })
  currentStreak: number;

  @Column({ type: 'int', default: 0 })
  bestStreak: number;

  @Column({ type: 'int', default: 0 })
  totalCompletions: number;

  @Column({ type: 'date', nullable: true })
  lastCompletionDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 