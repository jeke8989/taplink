import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum BlockType {
  TEXT = 'text',
  LINK = 'link',
  AVATAR = 'avatar',
  DIVIDER = 'divider',
  QA = 'qa',
  ICON_TEXT = 'icon_text',
  MESSENGERS = 'messengers',
  SOCIAL_NETWORKS = 'social_networks',
  MAP = 'map',
  CUSTOM = 'custom',
}

@Entity('blocks')
export class Block {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: BlockType,
  })
  type: BlockType;

  @Column({ type: 'jsonb' })
  content: Record<string, any>;

  @Column({ type: 'integer' })
  order: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

