import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SessionsService } from './sessions.service.js';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { UpdateSessionDto } from './dto/update-session.dto.js';
import {
  QuerySessionDto,
  QueryUpcomingSessionDto,
} from './dto/query-session.dto.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Get()
  findAll(@Query() query: QuerySessionDto) {
    return this.sessionsService.findAll({
      groupId: query.groupId,
      from: query.from,
      to: query.to,
      isFreeTrial: query.isFreeTrial,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('upcoming')
  upcoming(@Query() query: QueryUpcomingSessionDto) {
    return this.sessionsService.upcoming(query.limit ?? 5);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.sessionsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessionsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.sessionsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.sessionsService.remove(id);
  }
}
