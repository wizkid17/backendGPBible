import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('weekly_spiritual_objectives')
export class WeeklySpiritualObjective {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  text: string;

  @Column({ name: 'week_start_date', type: 'date' })
  weekStartDate: Date;

  @Column({ name: 'week_end_date', type: 'date' })
  weekEndDate: Date;

  @Column({ name: 'theme', nullable: true })
  theme: string;

  @OneToMany(() => WeeklySpiritualOpportunity, opportunity => opportunity.objective, { cascade: true })
  opportunities: WeeklySpiritualOpportunity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('weekly_spiritual_opportunities')
export class WeeklySpiritualOpportunity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'objective_id' })
  objectiveId: string;

  @ManyToOne(() => WeeklySpiritualObjective, objective => objective.opportunities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'objective_id' })
  objective: WeeklySpiritualObjective;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 