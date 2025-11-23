import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { Page } from './entities/page.entity';
import { PageView } from './entities/page-view.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Page, PageView])],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}

