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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(@Request() req) {
    return this.eventsService.findAllByUserId(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.eventsService.findOne(id, req.user.userId);
  }

  @Post()
  async create(@Request() req, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(req.user.userId, createEventDto);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, req.user.userId, updateEventDto);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    await this.eventsService.delete(id, req.user.userId);
    return { message: 'Event deleted successfully' };
  }
}

