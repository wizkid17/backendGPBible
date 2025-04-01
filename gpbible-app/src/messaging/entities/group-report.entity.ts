import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChatGroup } from './chat-group.entity';
import { ReportReason } from '../dto/chat-actions.dto';

@Entity('group_reports')
export class GroupReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_id' })
  groupId: string;

  @ManyToOne(() => ChatGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: ChatGroup;

  @Column({ name: 'reported_by' })
  reportedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by' })
  reportedBy: User;

  @Column({
    type: 'enum',
    enum: ReportReason,
    default: ReportReason.OTHER
  })
  reason: ReportReason;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ default: false })
  reviewed: boolean;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;
} 