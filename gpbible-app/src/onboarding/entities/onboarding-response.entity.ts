import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('onboarding_responses')
export class OnboardingResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column('simple-array')
  appMotivations: string[];

  @Column('text')
  spiritualJourney: string;

  @Column('simple-array')
  focusAreas: string[];

  @Column('simple-array')
  spiritualPractices: string[];

  @Column('varchar', { length: 50 })
  dailyDevotionTime: string;

  @Column('varchar', { length: 50 })
  prayerFrequency: string;

  @Column('boolean', { default: false })
  onboardingCompleted: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 