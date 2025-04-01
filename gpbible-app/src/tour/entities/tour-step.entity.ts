import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TourSectionType {
  NOTIFICATIONS = 'notifications',
  PROFILE = 'profile',
  MEDITATION = 'meditation',
  SPIRITUAL_GROWTH = 'spiritual_growth',
  BIBLE_EXPLORATION = 'bible_exploration',
  AI_GUIDANCE = 'ai_guidance',
  WELCOME = 'welcome'
}

@Entity('tour_steps')
export class TourStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  stepNumber: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TourSectionType,
    default: TourSectionType.WELCOME
  })
  sectionType: TourSectionType;

  @Column({ nullable: true })
  screenTarget: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 8 })
  totalSteps: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 