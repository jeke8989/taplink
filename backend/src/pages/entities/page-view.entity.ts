import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Page } from './page.entity';

@Entity('page_views')
@Index(['page', 'viewedAt'])
export class PageView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Page, { onDelete: 'CASCADE' })
  @JoinColumn()
  page: Page;

  @CreateDateColumn()
  viewedAt: Date;

  @Column({ nullable: true })
  ipAddress: string | null;
}

