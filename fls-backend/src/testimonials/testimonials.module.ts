import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Testimonial,
  TestimonialSchema,
} from './testimonial.schema.js';
import { Student, StudentSchema } from '../students/student.schema.js';
import { TestimonialsService } from './testimonials.service.js';
import { TestimonialsController } from './testimonials.controller.js';
import { ParentTestimonialsController } from './parent-testimonials.controller.js';
import { ActivityModule } from '../activity/activity.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Testimonial.name, schema: TestimonialSchema },
      { name: Student.name, schema: StudentSchema },
    ]),
    ActivityModule,
  ],
  controllers: [TestimonialsController, ParentTestimonialsController],
  providers: [TestimonialsService],
  exports: [MongooseModule, TestimonialsService],
})
export class TestimonialsModule {}
