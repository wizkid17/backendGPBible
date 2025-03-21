import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('meditations')
export class Meditation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  audioUrl: string;

  @Column('int')
  durationMinutes: number;

  @Column('text')
  content: string;

  @Column('simple-array')
  tags: string[];

  @Column({ nullable: true })
  scriptureReference: string;

  @Column({ default: false })
  isPremium: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 