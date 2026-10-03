import { Controller, Get, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AbsencesService } from './absences.service.js';
import { UpdateAbsencesDto } from './dto/update-absences.dto.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@ApiTags('Absences')
@ApiBearerAuth()
@Controller('absences')
export class AbsencesController {
  constructor(private absencesService: AbsencesService) {}

  @Put('sessions/:sessionId')
  updateSessionAbsences(
    @Param('sessionId', ParseObjectIdPipe) sessionId: string,
    @Body() dto: UpdateAbsencesDto,
  ) {
    return this.absencesService.updateSessionAbsences(sessionId, dto);
  }

  @Get('students/:studentId')
  getStudentHistory(
    @Param('studentId', ParseObjectIdPipe) studentId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.absencesService.getStudentHistory(
      studentId,
      query.page,
      query.limit,
    );
  }

  @Get('students/:studentId/summary')
  getStudentSummary(@Param('studentId', ParseObjectIdPipe) studentId: string) {
    return this.absencesService.getStudentSummary(studentId);
  }
}
