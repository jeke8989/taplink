import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pages')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  async findAll(@Request() req) {
    return this.pagesService.findAllByUserId(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.pagesService.findOne(id, req.user.userId);
  }

  @Get(':id/stats')
  async getStats(@Request() req, @Param('id') id: string) {
    return this.pagesService.getStats(id, req.user.userId);
  }

  @Post()
  async create(@Request() req, @Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(req.user.userId, createPageDto);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    return this.pagesService.update(id, req.user.userId, updatePageDto);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    await this.pagesService.delete(id, req.user.userId);
    return { message: 'Page deleted successfully' };
  }
}

