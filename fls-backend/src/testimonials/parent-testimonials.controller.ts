import {
  Controller,
  Get,
  Post,
  Body,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service.js';
import { CreateParentTestimonialDto } from './dto/create-parent-testimonial.dto.js';
import { ParentRoute } from '../common/decorators/parent-route.decorator.js';

@ApiTags('Parent Testimonials')
@ApiBearerAuth()
@ParentRoute()
@Controller('parent/testimonials')
export class ParentTestimonialsController {
  constructor(private testimonialsService: TestimonialsService) {}

  @Post()
  submit(@Request() req: any, @Body() dto: CreateParentTestimonialDto) {
    return this.testimonialsService.submitParentTestimonial(
      req.user.studentId,
      dto,
    );
  }

  @Get()
  findMine(@Request() req: any) {
    return this.testimonialsService.findByStudent(req.user.studentId);
  }
}
