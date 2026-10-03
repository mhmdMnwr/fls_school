import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Enrollment, EnrollmentSchema } from './enrollment.schema.js';
import { Student, StudentSchema } from '../students/student.schema.js';
import { StudyGroup, StudyGroupSchema } from '../groups/study-group.schema.js';
import { Subject, SubjectSchema } from '../subjects/subject.schema.js';
import { EnrollmentsController } from './enrollments.controller.js';
import { EnrollmentsService } from './enrollments.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Student.name, schema: StudentSchema },
      { name: StudyGroup.name, schema: StudyGroupSchema },
      { name: Subject.name, schema: SubjectSchema },
    ]),
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [MongooseModule, EnrollmentsService],
})
export class EnrollmentsModule {}
