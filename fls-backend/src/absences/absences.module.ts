import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AbsenceRecord, AbsenceRecordSchema } from './absence-record.schema.js';
import { Session, SessionSchema } from '../sessions/session.schema.js';
import {
  Enrollment,
  EnrollmentSchema,
} from '../enrollments/enrollment.schema.js';
import { AbsencesController } from './absences.controller.js';
import { AbsencesService } from './absences.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AbsenceRecord.name, schema: AbsenceRecordSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
  ],
  controllers: [AbsencesController],
  providers: [AbsencesService],
  exports: [MongooseModule],
})
export class AbsencesModule {}
