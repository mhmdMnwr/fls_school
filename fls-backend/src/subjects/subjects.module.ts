import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Subject, SubjectSchema } from './subject.schema.js';
import {
  SchoolClass,
  SchoolClassSchema,
} from '../classes/school-class.schema.js';
import { SubjectsController } from './subjects.controller.js';
import { SubjectsService } from './subjects.service.js';
import { ActivityModule } from '../activity/activity.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subject.name, schema: SubjectSchema },
      { name: SchoolClass.name, schema: SchoolClassSchema },
    ]),
    ActivityModule,
  ],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [MongooseModule],
})
export class SubjectsModule {}
