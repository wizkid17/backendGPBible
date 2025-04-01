import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ChatGroupMember } from './chat-group-member.entity';
import { ChatMessage } from './chat-message.entity';

@Entity('chat_groups')
export class ChatGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ name: 'created_by', nullable: false })
  createdById: string;

  @OneToMany(() => ChatGroupMember, member => member.group)
  members: ChatGroupMember[];

  @OneToMany(() => ChatMessage, message => message.group)
  messages: ChatMessage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 