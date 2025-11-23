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
import { Page } from '../../pages/entities/page.entity';

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
  IMAGE_CAROUSEL = 'image_carousel',
  DATE_TIME = 'date_time',
  EVENT_DATE_TIME = 'event_date_time',
  EVENT_LOCATION = 'event_location',
  EVENT_REGISTRATION = 'event_registration',
  EVENT_SCHEDULE = 'event_schedule',
  EVENT_SPEAKERS = 'event_speakers',
  EVENT_PRICE = 'event_price',
  EVENT_GALLERY = 'event_gallery',
  EVENT_TICKET_SALE = 'event_ticket_sale',
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

  @ManyToOne(() => Page, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn()
  page: Page;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

