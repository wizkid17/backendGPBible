import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChatMessage } from './chat-message.entity';

@Entity('chat_conversations')
export class ChatConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user1_id', nullable: false })
  user1Id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user1_id' })
  user1: User;

  @Column({ name: 'user2_id', nullable: false })
  user2Id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user2_id' })
  user2: User;

  @OneToMany(() => ChatMessage, message => message.conversation)
  messages: ChatMessage[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'last_message_at', nullable: true })
  lastMessageAt: Date;
} 