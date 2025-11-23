import { Controller, Get, Param, Req, NotFoundException } from '@nestjs/common';
import { PageService } from './page.service';
import { Request } from 'express';

@Controller('page')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get(':identifier')
  async getPageOrPublicPage(
    @Param('identifier') identifier: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || undefined;
    
    // Сначала пытаемся найти страницу по slug
    try {
      const pageBySlug = await this.pageService.getPageBySlug(identifier, ipAddress);
      return pageBySlug;
    } catch (error) {
      // Если страница не найдена по slug (NotFoundException), пробуем найти по username
      if (error instanceof NotFoundException) {
        try {
          return await this.pageService.getPublicPage(identifier, ipAddress);
        } catch (usernameError) {
          // Если и по username не найдено, выбрасываем ошибку
          throw new NotFoundException('Page not found');
        }
      }
      // Если другая ошибка, пробрасываем её дальше
      throw error;
    }
  }
}

