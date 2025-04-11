import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BibleBook } from './bible-book.entity';
import { BibleVerse } from './bible-verse.entity';

@Entity('bible_chapters')
export class BibleChapter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bookId: string;

  @Column({ type: 'int' })
  chapterNumber: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  audioUrl: string;

  @ManyToOne(() => BibleBook, book => book.chapters)
  @JoinColumn({ name: 'bookId' })
  book: BibleBook;

  @OneToMany(() => BibleVerse, verse => verse.chapter)
  verses: BibleVerse[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 