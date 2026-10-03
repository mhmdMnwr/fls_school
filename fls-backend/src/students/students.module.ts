import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from './student.schema.js';
import {
  SchoolClass,
  SchoolClassSchema,
} from '../classes/school-class.schema.js';
import { Level, LevelSchema } from '../levels/level.schema.js';
import {
  Enrollment,
  EnrollmentSchema,
} from '../enrollments/enrollment.schema.js';
import {
  AbsenceRecord,
  AbsenceRecordSchema,
} from '../absences/absence-record.schema.js';
import { Payment, PaymentSchema } from '../payments/payment.schema.js';
import { StudentsController } from './students.controller.js';
import { StudentsService } from './students.service.js';
import { ActivityModule } from '../activity/activity.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: SchoolClass.name, schema: SchoolClassSchema },
      { name: Level.name, schema: LevelSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: AbsenceRecord.name, schema: AbsenceRecordSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    ActivityModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [MongooseModule],
})
export class StudentsModule {}
