import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Level, LevelSchema } from '../levels/level.schema.js';
import {
  SchoolClass,
  SchoolClassSchema,
} from '../classes/school-class.schema.js';
import { Subject, SubjectSchema } from '../subjects/subject.schema.js';
import { Teacher, TeacherSchema } from '../teachers/teacher.schema.js';
import {
  StudyGroup,
  StudyGroupSchema,
} from '../groups/study-group.schema.js';
import { Student, StudentSchema } from '../students/student.schema.js';
import { SiteSettingsModule } from '../site-settings/site-settings.module.js';
import { TestimonialsModule } from '../testimonials/testimonials.module.js';
import { ActivityModule } from '../activity/activity.module.js';
import { PublicController } from './public.controller.js';
import { PublicService } from './public.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Level.name, schema: LevelSchema },
      { name: SchoolClass.name, schema: SchoolClassSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Teacher.name, schema: TeacherSchema },
      { name: StudyGroup.name, schema: StudyGroupSchema },
      { name: Student.name, schema: StudentSchema },
    ]),
    SiteSettingsModule,
    TestimonialsModule,
    ActivityModule,
  ],
  controllers: [PublicController],
  providers: [PublicService],
  exports: [PublicService],
})
export class PublicModule {}
