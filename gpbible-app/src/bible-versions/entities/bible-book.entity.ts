import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BibleChapter } from './bible-chapter.entity';

@Entity('bible_books')
export class BibleBook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int' })
  orderNumber: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => BibleChapter, chapter => chapter.book)
  chapters: BibleChapter[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 