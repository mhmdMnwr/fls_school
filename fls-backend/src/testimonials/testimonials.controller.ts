import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service.js';
import { QueryTestimonialDto } from './dto/query-testimonial.dto.js';
import { UpdateTestimonialStatusDto } from './dto/update-testimonial-status.dto.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';

@ApiTags('Testimonials')
@ApiBearerAuth()
@Controller('testimonials')
export class TestimonialsController {
  constructor(private testimonialsService: TestimonialsService) {}

  @Get()
  findAll(@Query() query: QueryTestimonialDto) {
    return this.testimonialsService.findAllAdmin(query);
  }

  @Get('counts')
  getCounts() {
    return this.testimonialsService.getCounts();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateTestimonialStatusDto,
  ) {
    return this.testimonialsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.testimonialsService.remove(id);
  }
}
