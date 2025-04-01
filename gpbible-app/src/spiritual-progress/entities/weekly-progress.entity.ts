import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserProgress } from './user-progress.entity';

@Entity('weekly_progress')
export class WeeklyProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_progress_id' })
  userProgressId: string;

  @ManyToOne(() => UserProgress, (userProgress) => userProgress.weeklyProgress)
  @JoinColumn({ name: 'user_progress_id' })
  userProgress: UserProgress;

  @Column({ type: 'date' })
  startDate: Date;
  
  @Column({ type: 'date' })
  endDate: Date;

  @Column()
  weekLabel: string;

  @Column({ default: 0 })
  completedOpportunities: number;

  @Column({ default: 0 })
  assignedOpportunities: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage: number;

  @Column({ type: 'int', default: 0 })
  activeDaysInWeek: number;

  @Column({ default: false })
  isCurrentWeek: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 