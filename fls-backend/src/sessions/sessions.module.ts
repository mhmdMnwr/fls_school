import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './session.schema.js';
import { StudyGroup, StudyGroupSchema } from '../groups/study-group.schema.js';
import {
  Enrollment,
  EnrollmentSchema,
} from '../enrollments/enrollment.schema.js';
import {
  AbsenceRecord,
  AbsenceRecordSchema,
} from '../absences/absence-record.schema.js';
import { SessionsController } from './sessions.controller.js';
import { SessionsService } from './sessions.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: StudyGroup.name, schema: StudyGroupSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: AbsenceRecord.name, schema: AbsenceRecordSchema },
    ]),
  ],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [MongooseModule],
})
export class SessionsModule {}
