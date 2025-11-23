import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { randomUUID } from 'crypto';
import { Page } from './entities/page.entity';
import { PageView } from './entities/page-view.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { User } from '../users/entities/user.entity';

export interface PageStats {
  today: number;
  last7Days: number;
  last30Days: number;
}

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
    @InjectRepository(PageView)
    private pageViewRepository: Repository<PageView>,
  ) {}

  async findAllByUserId(userId: string): Promise<Page[]> {
    return this.pageRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Page> {
    const page = await this.pageRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  async findBySlug(slug: string | null, userId: string): Promise<Page | null> {
    return this.pageRepository.findOne({
      where: { slug, user: { id: userId } },
    });
  }

  async findByUsernameAndSlug(username: string, slug: string | null): Promise<Page | null> {
    return this.pageRepository.findOne({
      where: { slug, user: { username } },
      relations: ['user'],
    });
  }

  async findBySlugOnly(slug: string): Promise<Page | null> {
    return this.pageRepository.findOne({
      where: { slug },
      relations: ['user'],
    });
  }

  async create(userId: string, createPageDto: CreatePageDto): Promise<Page> {
    // Если slug не указан, генерируем UUID автоматически
    let slug = createPageDto.slug && createPageDto.slug.trim() !== '' 
      ? createPageDto.slug.trim() 
      : randomUUID();

    // Проверяем уникальность slug (глобально, так как slug используется в URL без username)
    const existingPage = await this.findBySlugOnly(slug);
    if (existingPage) {
      // Если slug уже существует, генерируем новый UUID
      slug = randomUUID();
      // Проверяем еще раз (на случай коллизии UUID, хотя это крайне маловероятно)
      const checkAgain = await this.findBySlugOnly(slug);
      if (checkAgain) {
        slug = randomUUID(); // Генерируем еще раз
      }
    }

    const page = this.pageRepository.create({
      ...createPageDto,
      slug: slug,
      user: { id: userId } as User,
    });

    return this.pageRepository.save(page);
  }

  async update(
    id: string,
    userId: string,
    updatePageDto: UpdatePageDto,
  ): Promise<Page> {
    const page = await this.findOne(id, userId);

    // Нормализуем slug: пустая строка становится null
    const newSlug = updatePageDto.slug !== undefined 
      ? (updatePageDto.slug && updatePageDto.slug.trim() !== '' ? updatePageDto.slug.trim() : null)
      : page.slug;

    // Если slug изменился, проверяем уникальность
    if (newSlug !== page.slug) {
      // Если новый slug не null, проверяем уникальность глобально
      if (newSlug) {
        const existingPage = await this.findBySlugOnly(newSlug);
        if (existingPage && existingPage.id !== id) {
          throw new ConflictException('Страница с таким slug уже существует');
        }
      }
      // Если slug был изменен на null, дополнительных проверок не требуется
    }

    Object.assign(page, {
      ...updatePageDto,
      slug: newSlug,
    });
    return this.pageRepository.save(page);
  }

  async delete(id: string, userId: string): Promise<void> {
    const page = await this.findOne(id, userId);
    await this.pageRepository.remove(page);
  }

  async registerView(pageId: string, ipAddress?: string): Promise<void> {
    // Защита от двойного подсчета: проверяем, не было ли просмотра с этого IP за последние 5 секунд
    const fiveSecondsAgo = new Date(Date.now() - 5 * 1000);
    
    if (ipAddress) {
      const recentView = await this.pageViewRepository.findOne({
        where: {
          page: { id: pageId },
          ipAddress: ipAddress,
          viewedAt: MoreThanOrEqual(fiveSecondsAgo),
        },
        order: { viewedAt: 'DESC' },
      });

      if (recentView) {
        // Просмотр уже был зарегистрирован недавно, пропускаем
        return;
      }
    }

    const pageView = this.pageViewRepository.create({
      page: { id: pageId } as Page,
      ipAddress: ipAddress || null,
    });
    await this.pageViewRepository.save(pageView);
  }

  async getStats(pageId: string, userId: string): Promise<PageStats> {
    // Проверяем, что страница принадлежит пользователю
    await this.findOne(pageId, userId);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [todayCount, last7DaysCount, last30DaysCount] = await Promise.all([
      this.pageViewRepository.count({
        where: {
          page: { id: pageId },
          viewedAt: MoreThanOrEqual(today),
        },
      }),
      this.pageViewRepository.count({
        where: {
          page: { id: pageId },
          viewedAt: MoreThanOrEqual(last7Days),
        },
      }),
      this.pageViewRepository.count({
        where: {
          page: { id: pageId },
          viewedAt: MoreThanOrEqual(last30Days),
        },
      }),
    ]);

    return {
      today: todayCount,
      last7Days: last7DaysCount,
      last30Days: last30DaysCount,
    };
  }
}

