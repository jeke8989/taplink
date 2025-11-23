import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async findAllByUserId(userId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async findBySlug(slug: string, userId: string): Promise<Event | null> {
    return this.eventRepository.findOne({
      where: { slug, user: { id: userId } },
    });
  }

  async create(userId: string, createEventDto: CreateEventDto): Promise<Event> {
    // Проверяем уникальность slug для пользователя
    const existingEvent = await this.findBySlug(createEventDto.slug, userId);
    if (existingEvent) {
      throw new ConflictException('Event with this slug already exists');
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      user: { id: userId } as User,
    });

    return this.eventRepository.save(event);
  }

  async update(
    id: string,
    userId: string,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    const event = await this.findOne(id, userId);

    // Если обновляется slug, проверяем уникальность
    if (updateEventDto.slug && updateEventDto.slug !== event.slug) {
      const existingEvent = await this.findBySlug(updateEventDto.slug, userId);
      if (existingEvent && existingEvent.id !== id) {
        throw new ConflictException('Event with this slug already exists');
      }
    }

    Object.assign(event, updateEventDto);
    return this.eventRepository.save(event);
  }

  async delete(id: string, userId: string): Promise<void> {
    const event = await this.findOne(id, userId);
    await this.eventRepository.remove(event);
  }
}

