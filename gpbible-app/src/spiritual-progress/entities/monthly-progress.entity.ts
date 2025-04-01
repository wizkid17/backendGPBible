import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserProgress } from './user-progress.entity';

@Entity('monthly_progress')
export class MonthlyProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_progress_id' })
  userProgressId: string;

  @ManyToOne(() => UserProgress, (userProgress) => userProgress.monthlyProgress)
  @JoinColumn({ name: 'user_progress_id' })
  userProgress: UserProgress;

  @Column()
  year: number;
  
  @Column()
  month: number;

  @Column()
  monthLabel: string;

  @Column({ default: 0 })
  completedOpportunities: number;

  @Column({ default: 0 })
  assignedOpportunities: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage: number;

  @Column({ type: 'int', default: 0 })
  activeDaysInMonth: number;

  @Column({ default: false })
  isCurrentMonth: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 