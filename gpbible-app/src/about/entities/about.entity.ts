import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('about')
export class About {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  description: string;

  @Column('json')
  coreValues: Record<string, string>;

  @Column('json')
  timeline: Array<{
    year: number;
    description: string;
  }>;

  @Column('json')
  team: Array<{
    name: string;
    role: string;
    imageUrl: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 