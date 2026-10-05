import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from '../students/student.schema.js';
import { Level, LevelSchema } from '../levels/level.schema.js';
import { Subject, SubjectSchema } from '../subjects/subject.schema.js';
import { Teacher, TeacherSchema } from '../teachers/teacher.schema.js';
import { Session, SessionSchema } from '../sessions/session.schema.js';
import { StudyGroup, StudyGroupSchema } from '../groups/study-group.schema.js';
import {
  SchoolClass,
  SchoolClassSchema,
} from '../classes/school-class.schema.js';
import {
  Enrollment,
  EnrollmentSchema,
} from '../enrollments/enrollment.schema.js';
import {
  ActivityLog,
  ActivityLogSchema,
} from '../activity/activity-log.schema.js';
import { TestimonialsModule } from '../testimonials/testimonials.module.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Level.name, schema: LevelSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Teacher.name, schema: TeacherSchema },
      { name: Session.name, schema: SessionSchema },
      { name: StudyGroup.name, schema: StudyGroupSchema },
      { name: SchoolClass.name, schema: SchoolClassSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: ActivityLog.name, schema: ActivityLogSchema },
    ]),
    TestimonialsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
