import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ParentPortalService } from './parent-portal.service.js';
import { ParentLoginDto } from './dto/parent-login.dto.js';
import { Public } from '../common/decorators/public.decorator.js';
import { ParentRoute } from '../common/decorators/parent-route.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@ApiTags('Parent Portal')
@Controller('parent')
export class ParentPortalController {
  constructor(private parentPortalService: ParentPortalService) {}

  @Public()
  @Post('login')
  login(@Body() dto: ParentLoginDto) {
    return this.parentPortalService.login(dto.username, dto.password);
  }

  @ApiBearerAuth()
  @ParentRoute()
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.parentPortalService.getProfile(req.user.studentId);
  }

  @ApiBearerAuth()
  @ParentRoute()
  @Get('timetable')
  getTimetable(@Request() req: any) {
    return this.parentPortalService.getTimetable(req.user.studentId);
  }

  @ApiBearerAuth()
  @ParentRoute()
  @Get('attendance')
  getAttendance(@Request() req: any, @Query() query: PaginationQueryDto) {
    return this.parentPortalService.getAttendance(
      req.user.studentId,
      query.page,
      query.limit,
    );
  }

  @ApiBearerAuth()
  @ParentRoute()
  @Get('payments')
  getPayments(@Request() req: any) {
    return this.parentPortalService.getPayments(req.user.studentId);
  }
}
