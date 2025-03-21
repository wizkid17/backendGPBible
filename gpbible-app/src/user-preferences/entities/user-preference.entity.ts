import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Denomination } from '../../denominations/entities/denomination.entity';
import { BibleVersion } from '../../bible-versions/entities/bible-version.entity';

@Entity('user_preferences')
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.preferences)
  user: User;

  @ManyToOne(() => Denomination, denomination => denomination.userPreferences)
  denomination: Denomination;

  @ManyToOne(() => BibleVersion, bibleVersion => bibleVersion.userPreferences)
  bibleVersion: BibleVersion;

  @Column({ nullable: true })
  selectedAvatarId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 