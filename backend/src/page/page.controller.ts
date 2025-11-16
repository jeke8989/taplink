import { Controller, Get, Param } from '@nestjs/common';
import { PageService } from './page.service';

@Controller('page')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get(':username')
  async getPublicPage(@Param('username') username: string) {
    return this.pageService.getPublicPage(username);
  }
}

