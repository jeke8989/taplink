import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Block } from './entities/block.entity';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { User } from '../users/entities/user.entity';
import { Page } from '../pages/entities/page.entity';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
  ) {}

  async findAllByUserId(userId: string, pageId?: string | null): Promise<Block[]> {
    const where: any = { user: { id: userId } };
    
    if (pageId === null || pageId === undefined) {
      // Для персональной страницы - блоки без pageId
      where.page = IsNull();
    } else {
      // Для страницы - блоки с конкретным pageId
      where.page = { id: pageId };
    }

    const blocks = await this.blockRepository.find({
      where,
      order: { order: 'ASC' },
    });
    console.log(`[BlocksService] Found ${blocks.length} blocks for user ${userId}, pageId: ${pageId || 'null'}`);
    return blocks;
  }

  async create(userId: string, createBlockDto: CreateBlockDto): Promise<Block> {
    // Определяем условие для поиска максимального order
    const where: any = { user: { id: userId } };
    if (createBlockDto.pageId === null || createBlockDto.pageId === undefined) {
      where.page = IsNull();
    } else {
      where.page = { id: createBlockDto.pageId };
    }

    // Получаем максимальный order для пользователя и страницы
    const maxOrderBlock = await this.blockRepository.findOne({
      where,
      order: { order: 'DESC' },
    });

    const newOrder = maxOrderBlock ? maxOrderBlock.order + 1 : 0;

    const blockData: any = {
      ...createBlockDto,
      order: newOrder,
      user: { id: userId } as User,
    };

    if (createBlockDto.pageId) {
      blockData.page = { id: createBlockDto.pageId } as Page;
    }

    const block = this.blockRepository.create(blockData);
    const savedBlock = await this.blockRepository.save(block);
    // save может вернуть Block или Block[], но мы передаем один объект
    return Array.isArray(savedBlock) ? savedBlock[0] : savedBlock;
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

  async reorder(userId: string, blockIds: string[], pageId?: string | null): Promise<Block[]> {
    const blocks = await this.findAllByUserId(userId, pageId);
    
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

    return this.findAllByUserId(userId, pageId);
  }
}

