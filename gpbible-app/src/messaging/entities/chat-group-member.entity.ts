import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChatGroup } from './chat-group.entity';

@Entity('chat_group_members')
export class ChatGroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_id', nullable: false })
  groupId: string;

  @ManyToOne(() => ChatGroup, group => group.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: ChatGroup;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: false })
  isAdmin: boolean;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
} 