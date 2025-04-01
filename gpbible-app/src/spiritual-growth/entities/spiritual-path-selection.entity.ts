import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SpiritualPathSuggestion } from './spiritual-path.entity';

@Entity('spiritual_path_temp_selections')
export class SpiritualPathTempSelection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'suggestion_id' })
  suggestionId: string;

  @ManyToOne(() => SpiritualPathSuggestion)
  @JoinColumn({ name: 'suggestion_id' })
  suggestion: SpiritualPathSuggestion;

  @Column({ type: 'boolean', default: true })
  isSelected: boolean;

  @Column({ name: 'session_id' })
  sessionId: string; // Para agrupar selecciones en una sesión

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 