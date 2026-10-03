import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudyGroup, StudyGroupSchema } from './study-group.schema.js';
import { Subject, SubjectSchema } from '../subjects/subject.schema.js';
import { Teacher, TeacherSchema } from '../teachers/teacher.schema.js';
import {
  Enrollment,
  EnrollmentSchema,
} from '../enrollments/enrollment.schema.js';
import { Session, SessionSchema } from '../sessions/session.schema.js';
import {
  AbsenceRecord,
  AbsenceRecordSchema,
} from '../absences/absence-record.schema.js';
import { GroupsController } from './groups.controller.js';
import { GroupsService } from './groups.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudyGroup.name, schema: StudyGroupSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Teacher.name, schema: TeacherSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Session.name, schema: SessionSchema },
      { name: AbsenceRecord.name, schema: AbsenceRecordSchema },
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [MongooseModule],
})
export class GroupsModule {}
