import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WeeklyProgress } from './weekly-progress.entity';
import { MonthlyProgress } from './monthly-progress.entity';

@Entity('user_progress')
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: 0 })
  totalCompletedOpportunities: number;

  @Column({ default: 0 })
  totalAssignedOpportunities: number;

  @Column({ type: 'int', default: 0 })
  consecutiveDaysActive: number;

  @Column({ type: 'date', nullable: true })
  lastActiveDate: Date;

  @Column({ type: 'int', default: 0 })
  bestConsecutiveDays: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overallCompletionPercentage: number;

  @OneToMany(() => WeeklyProgress, (weekly) => weekly.userProgress)
  weeklyProgress: WeeklyProgress[];

  @OneToMany(() => MonthlyProgress, (monthly) => monthly.userProgress)
  monthlyProgress: MonthlyProgress[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 