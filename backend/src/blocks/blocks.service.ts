import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './entities/block.entity';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
  ) {}

  async findAllByUserId(userId: string): Promise<Block[]> {
    return this.blockRepository.find({
      where: { user: { id: userId } },
      order: { order: 'ASC' },
    });
  }

  async create(userId: string, createBlockDto: CreateBlockDto): Promise<Block> {
    // Получаем максимальный order для пользователя
    const maxOrderBlock = await this.blockRepository.findOne({
      where: { user: { id: userId } },
      order: { order: 'DESC' },
    });

    const newOrder = maxOrderBlock ? maxOrderBlock.order + 1 : 0;

    const block = this.blockRepository.create({
      ...createBlockDto,
      order: newOrder,
      user: { id: userId } as User,
    });

    return this.blockRepository.save(block);
  }

  async update(
    id: string,
    userId: string,
    updateBlockDto: UpdateBlockDto,
  ): Promise<Block> {
    const block = await this.blockRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    Object.assign(block, updateBlockDto);
    return this.blockRepository.save(block);
  }

  async delete(id: string, userId: string): Promise<void> {
    const block = await this.blockRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    await this.blockRepository.remove(block);
  }

  async reorder(userId: string, blockIds: string[]): Promise<Block[]> {
    const blocks = await this.findAllByUserId(userId);
    
    // Создаем map для быстрого поиска
    const blockMap = new Map(blocks.map(b => [b.id, b]));

    // Обновляем order для каждого блока
    const updates = blockIds.map((id, index) => {
      const block = blockMap.get(id);
      if (block) {
        block.order = index;
        return this.blockRepository.save(block);
      }
      return null;
    }).filter(Boolean);

    await Promise.all(updates);

    return this.findAllByUserId(userId);
  }
}

