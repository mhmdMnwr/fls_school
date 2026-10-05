import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator.js';
import { PublicService } from './public.service.js';
import { CreatePublicRegistrationDto } from './dto/create-public-registration.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@ApiTags('Public')
@Public()
@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('site-info')
  getSiteInfo() {
    return this.publicService.getSiteInfo();
  }

  @Get('levels')
  getLevels() {
    return this.publicService.getLevels();
  }

  @Get('teachers')
  getTeachers() {
    return this.publicService.getTeachers();
  }

  @Get('site-settings')
  getSiteSettings() {
    return this.publicService.getSiteSettings();
  }

  @Get('testimonials')
  getTestimonials(@Query() query: PaginationQueryDto) {
    return this.publicService.getTestimonials(query.page, query.limit);
  }

  @Get('testimonials/summary')
  getTestimonialsSummary() {
    return this.publicService.getTestimonialsSummary();
  }

  @Throttle({ default: { limit: 5, ttl: 3600_000 } })
  @Post('registrations')
  register(@Body() dto: CreatePublicRegistrationDto) {
    return this.publicService.register(dto);
  }
}
