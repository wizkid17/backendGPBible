import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SpiritualAssessmentQuestion } from './spiritual-assessment-question.entity';
import { AssessmentSectionType } from '../enums/assessment-section-type.enum';

@Entity('spiritual_assessments')
export class SpiritualAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  version: number;

  @Column()
  sectionCount: number;

  @Column()
  questionCount: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => SpiritualAssessmentQuestion, question => question.assessment)
  questions: SpiritualAssessmentQuestion[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 