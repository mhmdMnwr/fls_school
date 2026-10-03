import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LevelsService } from './levels.service.js';
import { CreateLevelDto } from './dto/create-level.dto.js';
import { UpdateLevelDto } from './dto/update-level.dto.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';

@ApiTags('Levels')
@ApiBearerAuth()
@Controller('levels')
export class LevelsController {
  constructor(private levelsService: LevelsService) {}

  @Get()
  findAll() {
    return this.levelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.levelsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateLevelDto) {
    return this.levelsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateLevelDto,
  ) {
    return this.levelsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.levelsService.remove(id);
  }
}
