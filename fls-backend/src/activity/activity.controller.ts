import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityService } from './activity.service.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@ApiTags('Activity')
@ApiBearerAuth()
@Controller('activity')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.activityService.findAll({
      page: query.page,
      limit: query.limit,
    });
  }
}
