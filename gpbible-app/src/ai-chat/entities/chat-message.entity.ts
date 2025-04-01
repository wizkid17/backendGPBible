import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChatConversation } from './chat-conversation.entity';

export enum ChatMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

@Entity('ai_chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id' })
  conversationId: string;

  @ManyToOne(() => ChatConversation, conversation => conversation.messages)
  @JoinColumn({ name: 'conversation_id' })
  conversation: ChatConversation;

  @Column({
    type: 'enum',
    enum: ChatMessageRole,
    default: ChatMessageRole.USER
  })
  role: ChatMessageRole;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 