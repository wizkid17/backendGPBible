import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SpiritualAssessment } from './spiritual-assessment.entity';
import { SpiritualAssessmentResponse } from './spiritual-assessment-response.entity';
import { AssessmentSectionType } from '../enums/assessment-section-type.enum';

@Entity('spiritual_assessment_questions')
export class SpiritualAssessmentQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SpiritualAssessment, assessment => assessment.questions, { onDelete: 'CASCADE' })
  @JoinColumn()
  assessment: SpiritualAssessment;

  @Column()
  questionNumber: number;

  @Column()
  text: string;

  @Column({
    type: 'enum',
    enum: AssessmentSectionType,
    default: AssessmentSectionType.CONNECTION
  })
  section: AssessmentSectionType;

  @Column({ type: 'int', default: 5 })
  maxScore: number;

  @Column({ type: 'int', default: 1 })
  minScore: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => SpiritualAssessmentResponse, response => response.question)
  responses: SpiritualAssessmentResponse[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
} 