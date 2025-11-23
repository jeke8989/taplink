import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('events')
@Index(['user', 'slug'], { unique: true })
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  slug: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  registrationForm: unknown | null;

  @Column({ type: 'jsonb', nullable: true })
  tickets: unknown | null;

  @Column({ type: 'jsonb', nullable: true })
  discounts: unknown | null;

  @Column({ type: 'jsonb', nullable: true })
  publicationSettings: unknown | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

