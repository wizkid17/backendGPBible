import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { DailyDevotionTime, PrayerFrequency, DedicationTime, StudyMethod } from '../dto/create-onboarding-response.dto';

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
  
  @Column('varchar', { length: 50 })
  dedicationTime: string;
  
  @Column('simple-array')
  preferredStudyMethods: string[];
  
  @Column('boolean', { default: false })
  wantsProgressTracking: boolean;
  
  @Column('boolean', { default: false })
  wantsPersonalizedRecommendations: boolean;

  @Column('boolean', { default: false })
  onboardingCompleted: boolean;

  @Column({ nullable: true })
  selectedAvatarId: string;

  @Column('boolean', { default: true })
  wantsTour: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 