import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BibleChapter } from './bible-chapter.entity';

@Entity('bible_verses')
export class BibleVerse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  chapterId: string;

  @Column({ type: 'int' })
  verseNumber: number;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference: string;

  @ManyToOne(() => BibleChapter, chapter => chapter.verses)
  @JoinColumn({ name: 'chapterId' })
  chapter: BibleChapter;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 