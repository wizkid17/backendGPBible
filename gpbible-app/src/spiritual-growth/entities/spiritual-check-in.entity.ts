import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SpiritualGrowthTrack } from './spiritual-growth-track.entity';

export enum MoodType {
  JOYFUL = 'joyful',
  PEACEFUL = 'peaceful',
  CONTENT = 'content',
  NEUTRAL = 'neutral',
  ANXIOUS = 'anxious',
  DISCOURAGED = 'discouraged',
  STRUGGLING = 'struggling'
}

@Entity('spiritual_check_ins')
export class SpiritualCheckIn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => SpiritualGrowthTrack, { nullable: true })
  @JoinColumn()
  growthTrack: SpiritualGrowthTrack;

  @Column({ type: 'date' })
  checkInDate: Date;

  @Column({
    type: 'enum',
    enum: MoodType,
    default: MoodType.NEUTRAL
  })
  mood: MoodType;

  @Column({ type: 'int', default: 0 })
  spiritualScore: number;

  @Column({ type: 'int', default: 0 })
  prayerMinutes: number;

  @Column({ type: 'int', default: 0 })
  bibleReadingMinutes: number;

  @Column({ type: 'int', default: 0 })
  meditationMinutes: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column('simple-array', { nullable: true })
  gratitudeItems: string[];

  @Column('simple-array', { nullable: true })
  prayerRequests: string[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
} 