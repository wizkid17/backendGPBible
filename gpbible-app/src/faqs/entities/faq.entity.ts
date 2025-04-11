import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('faqs')
export class FAQ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  question: string;

  @Column('text')
  answer: string;

  @Column('int')
  order: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('varchar', { length: 50, nullable: true })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 