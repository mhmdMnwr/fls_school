import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service.js';
import { TestimonialsService } from '../testimonials/testimonials.service.js';
import {
  EnrollmentEvolutionQueryDto,
  LimitQueryDto,
} from './dto/dashboard-query.dto.js';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(
    private dashboardService: DashboardService,
    private testimonialsService: TestimonialsService,
  ) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('enrollment-evolution')
  getEnrollmentEvolution(@Query() query: EnrollmentEvolutionQueryDto) {
    return this.dashboardService.getEnrollmentEvolution(query.year);
  }

  @Get('students-by-level')
  getStudentsByLevel() {
    return this.dashboardService.getStudentsByLevel();
  }

  @Get('recent-students')
  getRecentStudents(@Query() query: LimitQueryDto) {
    return this.dashboardService.getRecentStudents(query.limit ?? 5);
  }

  @Get('upcoming-sessions')
  getUpcomingSessions(@Query() query: LimitQueryDto) {
    return this.dashboardService.getUpcomingSessions(query.limit ?? 4);
  }

  @Get('recent-activities')
  getRecentActivities(@Query() query: LimitQueryDto) {
    return this.dashboardService.getRecentActivities(query.limit ?? 5);
  }

  @Get('testimonials')
  getTestimonials(@Query() query: LimitQueryDto) {
    return this.testimonialsService.getDashboardTestimonials(query.limit ?? 3);
  }
}
