import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MessageType } from '../enums/message-type.enum';

export enum ChatMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

@Entity('ai_chat_messages')
export class AiChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, user => user.chatMessages)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT
  })
  type: MessageType;

  @Column({
    type: 'enum',
    enum: ChatMessageRole,
    default: ChatMessageRole.USER
  })
  role: ChatMessageRole;

  @Column({ nullable: true })
  verseReference?: string;

  @CreateDateColumn()
  createdAt: Date;
} 