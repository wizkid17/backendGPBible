import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SpiritualAssessmentQuestion } from './spiritual-assessment-question.entity';
import { SpiritualAssessment } from './spiritual-assessment.entity';

export enum FrequencyResponse {
  EVERY_DAY = 'Every day',
  MOST_DAYS = 'Most days',
  EVERY_NOW_AND_THEN = 'Every now & then',
  RARELY = 'Rarely',
  NEVER = 'Never'
}

@Entity('spiritual_assessment_responses')
export class SpiritualAssessmentResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => SpiritualAssessment, { onDelete: 'CASCADE' })
  @JoinColumn()
  assessment: SpiritualAssessment;

  @ManyToOne(() => SpiritualAssessmentQuestion, question => question.responses, { onDelete: 'CASCADE' })
  @JoinColumn()
  question: SpiritualAssessmentQuestion;

  @Column({ type: 'int' })
  score: number;

  @Column({ 
    type: 'enum',
    enum: FrequencyResponse,
    nullable: true
  })
  frequencyResponse: FrequencyResponse;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'date' })
  assessmentDate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
} 