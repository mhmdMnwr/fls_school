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
import { GroupsService } from './groups.service.js';
import { CreateGroupDto } from './dto/create-group.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';
import { QueryGroupDto } from './dto/query-group.dto.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';

@ApiTags('Groups')
@ApiBearerAuth()
@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Get()
  findAll(@Query() query: QueryGroupDto) {
    return this.groupsService.findAll({
      subjectId: query.subjectId,
      teacherId: query.teacherId,
      classId: query.classId,
      isActive: query.isActive,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.groupsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateGroupDto) {
    return this.groupsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.groupsService.remove(id);
  }

  @Get(':id/students')
  findStudents(@Param('id', ParseObjectIdPipe) id: string) {
    return this.groupsService.findStudents(id);
  }
}
