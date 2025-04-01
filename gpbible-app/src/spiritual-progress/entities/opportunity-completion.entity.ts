import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('opportunity_completions')
export class OpportunityCompletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'opportunity_id', nullable: true })   
  opportunityId: string;

  @Column({ type: 'date' })
  completionDate: Date;

  @Column({ nullable: true })
  weekId: string;

  @Column({ nullable: true })
  monthId: string;

  @Column({ type: 'simple-json', nullable: true })
  opportunityDetails: {
    title: string;
    type: string;
    description?: string;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 