import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../profile/entities/user-profile.entity';
import { User } from '../users/entities/user.entity';
import { Block } from '../blocks/entities/block.entity';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
  ) {}

  async getPublicPage(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.profileRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Получаем блоки пользователя
    const blocks = await this.blockRepository.find({
      where: { user: { id: user.id } },
      order: { order: 'ASC' },
    });

    // Возвращаем только публичные данные
    return {
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      backgroundColor: profile.backgroundColor,
      fontColor: profile.fontColor,
      fontFamily: profile.fontFamily,
      links: profile.links,
      blocks: blocks,
    };
  }
}

