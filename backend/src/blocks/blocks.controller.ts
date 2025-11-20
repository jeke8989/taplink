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
import { BlocksService } from './blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { ReorderBlocksDto } from './dto/reorder-blocks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('blocks')
@UseGuards(JwtAuthGuard)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  async findAll(@Request() req) {
    return this.blocksService.findAllByUserId(req.user.userId);
  }

  @Post()
  async create(@Request() req, @Body() createBlockDto: CreateBlockDto) {
    return this.blocksService.create(req.user.userId, createBlockDto);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBlockDto: UpdateBlockDto,
  ) {
    return this.blocksService.update(id, req.user.userId, updateBlockDto);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    await this.blocksService.delete(id, req.user.userId);
    return { message: 'Block deleted successfully' };
  }

  @Put('reorder/bulk')
  async reorder(@Request() req, @Body() reorderDto: ReorderBlocksDto) {
    return this.blocksService.reorder(req.user.userId, reorderDto.blockIds);
  }
}

