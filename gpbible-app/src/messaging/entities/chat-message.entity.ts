import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChatConversation } from './chat-conversation.entity';
import { ChatGroup } from './chat-group.entity';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ name: 'sender_id', nullable: false })
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'conversation_id', nullable: true })
  conversationId: string;

  @ManyToOne(() => ChatConversation, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: ChatConversation;

  @Column({ name: 'group_id', nullable: true })
  groupId: string;

  @ManyToOne(() => ChatGroup, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: ChatGroup;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 