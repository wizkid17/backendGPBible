import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DonationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  user: User;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({
    type: 'enum',
    enum: DonationStatus,
    default: DonationStatus.PENDING
  })
  status: DonationStatus;

  @Column({ nullable: true })
  anonymousDonor: boolean;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
} 