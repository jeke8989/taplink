import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UserProfile } from '../profile/entities/user-profile.entity';
import { User } from '../users/entities/user.entity';
import { Block } from '../blocks/entities/block.entity';
import { Page } from '../pages/entities/page.entity';
import { PagesService } from '../pages/pages.service';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
    private pagesService: PagesService,
  ) {}

  async getPublicPage(username: string, ipAddress?: string) {
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

    // Ищем главную страницу (slug = null)
    let page = await this.pageRepository.findOne({
      where: { 
        user: { id: user.id },
        slug: IsNull(),
      },
    });

    // Если главной страницы нет, создаем её автоматически
    if (!page) {
      page = await this.pageRepository.save({
        title: 'Главная страница',
        slug: null,
        description: null,
        user: { id: user.id } as User,
      });
    }

    // Регистрируем просмотр
    await this.pagesService.registerView(page.id, ipAddress);

    // Получаем блоки страницы
    const blocks = await this.blockRepository.find({
      where: { 
        user: { id: user.id },
        page: { id: page.id },
      },
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

  async getPageBySlug(pageSlug: string, ipAddress?: string) {
    const page = await this.pagesService.findBySlugOnly(pageSlug);

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    // Регистрируем просмотр
    await this.pagesService.registerView(page.id, ipAddress);

    // Получаем блоки страницы
    const blocks = await this.blockRepository.find({
      where: { 
        user: { id: page.user.id },
        page: { id: page.id },
      },
      order: { order: 'ASC' },
    });

    // Возвращаем данные страницы
    return {
      title: page.title,
      description: page.description,
      slug: page.slug,
      blocks: blocks,
    };
  }
}

